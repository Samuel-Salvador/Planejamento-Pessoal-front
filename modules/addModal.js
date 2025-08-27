import {userClickEvents,formValidated,urlAPI} from "./global.js";
import {urlMonthInvoice,addTransaction,setTotal,transactionsArray} from "./finance.js";
import { loggedUserId,userUrl, fetchUser, userData, token} from "./login.js";
import {updateBalanceHeader } from "./header.js";
import { setUpChart } from "./categoryChart.js";
import { changePlaceholdersUserData } from "./settingsModal.js";

const addTransactionModal = document.querySelector(".add_transaction_modal_section");
const closeModalButton = document.querySelector(".x_add");
const modalConfirmButton = document.querySelector(".transaction_add_modal_button");

export const addModalTransactionGroupSelect = document.getElementById("transaction_group");

export function openAdditionModal(){
	addTransactionModal.classList.add("flex");
}

function closeAdditionModal(event){
	event.preventDefault();
	addTransactionModal.classList.remove("flex");
}

function clickOutsideModal(event){
	if(event.target==this){
		closeAdditionModal(event);
	}	
}

function resetFormValues(){
	document.forms.transaction_add_form.name.value = "";
	document.forms.transaction_add_form.date.value = "";
	document.forms.transaction_add_form.price.value = "";
	document.forms.transaction_add_form.installments.value = "";
	document.forms.transaction_add_form.category.value = "";
	document.forms.transaction_add_form.type.value = "";

}

async function postAndAddLastTransactionToArray(options){
	await fetch(urlAPI+"transactions",options);
	const monthTransactionResponse = await fetch(urlMonthInvoice);
	const monthTransactionJSON = await monthTransactionResponse.json();
	addTransaction(monthTransactionJSON[monthTransactionJSON.length-1]);
	setTotal(transactionsArray);
	await setUpChart();
}

async function httpPostTransaction(){
	const formValueName = document.forms.transaction_add_form.name.value.trimEnd();
	const formValueDate = document.forms.transaction_add_form.date.value;
	const formValuePrice = document.forms.transaction_add_form.price.value;
	const formValueInstallments = document.forms.transaction_add_form.installments.value;
	const formValueCategory = document.forms.transaction_add_form.category.value.trimEnd();
	const formValueType = document.forms.transaction_add_form.type.value;
	const formValueGroup = document.forms.transaction_add_form.group.value;

	if(	formValidated(formValueName) &&
		formValidated(formValueDate) &&
		formValidated(formValuePrice) &&
		formValidated(formValueInstallments) &&
		formValidated(formValueCategory) &&
		formValidated(formValueType)){
			if(formValueType == 'Pix' || formValueType == 'Débito'){
				const options={	method: "PUT",
									headers:{	
												"Content-Type": "application/json; charset=utf-8",
                                                'Authorization': `Bearer ${token}`
											},
									body: JSON.stringify({
															balance: userData.balance-formValuePrice,
															invoiceClosingDate: userData.invoiceClosingDate,
									}),
								};
				await fetch(userUrl,options);
				await updateBalanceHeader();
				await changePlaceholdersUserData();
			}

            await postAndAddLastTransactionToArray({
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({	name: formValueName,
                        date: formValueDate,
                        price: formValuePrice,
                        installments: formValueInstallments,
                        category: formValueCategory,
                        type: formValueType,
                        group: formValueGroup,
                        userId: loggedUserId}),
                });
				resetFormValues();
				closeAdditionModal(new Event("click"));
	}
}

export function createOptionSelectionGroup(i,element){
	
	const selectionGroupNewOption = document.createElement("option");
	
	selectionGroupNewOption.innerHTML = userData.transactionGroups[i];
	element.appendChild(selectionGroupNewOption);
	
}

export async function initModal() {

	userClickEvents.forEach((userEvent)=>{
		closeModalButton.addEventListener(userEvent, closeAdditionModal );
		addTransactionModal.addEventListener(userEvent, clickOutsideModal);
		modalConfirmButton.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			httpPostTransaction();
		});
	})
	
	addTransactionModal.addEventListener('keydown', (event) => {
		if(event.key === "Enter"){
			httpPostTransaction();
		}
	});
	
	
	
	await fetchUser();
	for(let i=0;i<userData.transactionGroups.length;i++){
		
		createOptionSelectionGroup(i,addModalTransactionGroupSelect);
	}

}