import {transactionsArray,setTotal} from "./finance.js";
import {formattedDate,formattedPrice,userClickEvents,url } from "./global.js";
import { userUrl } from "./login.js";
import { setUpChart } from "./categoryChart.js";
import { updateBalanceHeader,userData } from "./header.js";
import { changePlaceholdersUserData } from "./settingsModal.js";

const removalModal = document.querySelector(".remove_transaction_modal_section");
const closeModal = document.querySelector(".x_removal");

const containerRemovalData = document.querySelector(".container_removal_data");
const selectionForRemoval = document.getElementById("selection_transaction");

const removalButtonConfirm = document.querySelector(".removal_modal_button");

let removalIdDB=0;
let removalCorrectArrayIndex=0;

export function openRemovalModal(){
	removalModal.classList.add("flex");
}

function closeRemovalModal(event){
	event.preventDefault();
	removalModal.classList.remove("flex");
}

function clickOutsideModal(event){
	if(event.target==this){
		closeRemovalModal(event);
	}	
}

// sets the data in removal modal to default
export function resetRemovalModal(){
	containerRemovalData.innerHTML = `<div class="removal_data_msg">
									<h3> ← Selecione a transação a ser removida: </h3>
								</div>
								<div class="removal_data_msg_mobile">
									<h3>Selecione a transação a ser removida</h3>								
								</div>`;
										
	removalButtonConfirm.classList.remove("block");	
	
	selectionForRemoval.selectedIndex = 0;	
}

export function addOptionToSelectForRemovalElement(transaction){
	const option = document.createElement("option");
	option.setAttribute("date-data",
		`${formattedDate(transaction.date)}`);
	option.setAttribute("price-data",`${transaction.price}`)
	option.innerHTML = `${transaction.name}`;
	selectionForRemoval.appendChild(option);
}

export function clearSelectElement(){
	selectionForRemoval.innerHTML=	`<option value="" selected disabled hidden>
										Selecione</option>`;
}
	

async function removeFromDOMSelectedTransaction(){
	for(let i=0;i<6;i++){
		const transactionColumn = document.querySelectorAll(".container_transactions_column")[i];
		transactionColumn.removeChild(transactionColumn.children[removalCorrectArrayIndex+1]);
	}
	selectionForRemoval.removeChild(selectionForRemoval.options[selectionForRemoval.selectedIndex]);
	
	if(transactionsArray[removalCorrectArrayIndex].type == 'Pix' || transactionsArray[removalCorrectArrayIndex].type == 'Débito'){
			const options={	method: "PUT",
							headers:{	
								"Content-Type": "application/json; charset=utf-8",
							},
							body: JSON.stringify({	income: 0,
													balance: userData.balance+transactionsArray[removalCorrectArrayIndex].price,
													invoiceClosingDate: userData.invoiceClosingDate,
													transactionGroups: userData.transactionGroups
							}),
			};
		await fetch(userUrl,options);
		updateBalanceHeader();
		changePlaceholdersUserData();
	}
	
	transactionsArray.splice(removalCorrectArrayIndex,1);
	
	setTotal(transactionsArray);
	setUpChart();
	resetRemovalModal();
	
	
}


export function initRemovalModal(){
	
	userClickEvents.forEach((userEvent)=>{
			
		closeModal.addEventListener(userEvent,closeRemovalModal);
		removalModal.addEventListener(userEvent,clickOutsideModal);
		
		//http DELETE
		removalButtonConfirm.addEventListener(userEvent,(event)=>{
				
				fetch(url+`transactions/`+removalIdDB,{method: "DELETE"})
					.then(removeFromDOMSelectedTransaction());
				closeRemovalModal(event);
				
				
			});
	})

		
	//checks the <select> tab for the removal in the removal modal
	selectionForRemoval.addEventListener('change',()=>{
		
	const removalButton = document.querySelector(".removal_modal_button");
	removalButton.classList.add("block");
	
	for(let i=0;i<transactionsArray.length;i++){

		//Gets the correct id in DB and the array index for removal
		if(	selectionForRemoval.value == transactionsArray[i].name &&
			selectionForRemoval.options[selectionForRemoval.selectedIndex].getAttribute("date-data") == formattedDate(transactionsArray[i].date) &&
			selectionForRemoval.options[selectionForRemoval.selectedIndex].getAttribute("price-data") == transactionsArray[i].price){
					removalIdDB=transactionsArray[i].id;
					removalCorrectArrayIndex = i;	
			}
		}
		
		//adds the data from the selected transaction in the removal modal
		containerRemovalData.innerHTML=`<div class="removal_data_msg margin_bottom_20">
			<h3>Dados da transação a ser removida: </h3></div>
			<div>
			<p class="removal_transaction_data_title">Nome:</p> 
				<p class="removal_transaction_data_content">${transactionsArray[removalCorrectArrayIndex].name}</p><br>
			<p class="removal_transaction_data_title">Data:</p> 
				<p class="removal_transaction_data_content">${formattedDate(transactionsArray[removalCorrectArrayIndex].date)}</p><br>
			<p class="removal_transaction_data_title">Tipo:</p>  
				<p class="removal_transaction_data_content">${transactionsArray[removalCorrectArrayIndex].type}</p><br>
			<p class="removal_transaction_data_title">Categoria:</p> 
				<p class="removal_transaction_data_content">${transactionsArray[removalCorrectArrayIndex].category}</p><br>
			<p class="removal_transaction_data_title">Parcelas:</p> 
				<p class="removal_transaction_data_content">${transactionsArray[removalCorrectArrayIndex].currentInstallment+"/"
				+transactionsArray[removalCorrectArrayIndex].installments}</p><br>
			<p class="removal_transaction_data_title">Preço:</p>
				<p class="removal_transaction_data_content">${formattedPrice(transactionsArray[removalCorrectArrayIndex].price)}</p><br>
			</div>`;
		});


	
}	