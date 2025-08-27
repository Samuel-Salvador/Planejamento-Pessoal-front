import * as global from './global.js';
import { transactionUrl,fetchUser, userData, token  } from './login.js';
import * as removeTransaction from "./removeModal.js";
import { createOptionSelectionGroup, openAdditionModal} from "./addModal.js";
import {openRemovalModal} from "./removeModal.js";
import {removeChart, setUpChart} from './categoryChart.js'
import {urlFront} from "./global.js";

if(sessionStorage.userId==null){
	location.assign(global.urlFront);
}

await fetchUser();
let monthInvoice = 	new Date().getDate()>=userData.invoiceClosingDate ? new Date().getMonth()+1 : new Date().getMonth();
let yearInvoice = new Date().getFullYear();

export let urlMonthInvoice = transactionUrl.concat(`/${monthInvoice}/${yearInvoice}`);

const leftArrow = document.querySelector(".left_arrow");
const rightArrow = document.querySelector(".right_arrow");
let monthTitle = document.querySelector(".current_month");
let yearTitle = document.querySelector(".current_year");

export const invoiceTotal = document.querySelector(".right_side_panel .container_total .credit_card_total span");
export let invoiceNumber = global.getNumberOutOfCurrencyString(invoiceTotal.innerText);
const totalExpenses = document.querySelector(".right_side_panel .container_total .not_credit_card_total span");

const removeTransactionButton = document.querySelector(".container_remove");
const addTransactionButton = document.querySelector(".container_add");

export const financeTransactionGroupSelect = document.getElementById("transaction_group_main");
const containerCreditTotal = document.querySelector(".right_side_panel .container_total .credit_card_total");
const containerNonCreditTotal = document.querySelector(".right_side_panel .container_total .not_credit_card_total");

export let transactionsArray = [];

//sets the correct month and year title if not filtered
//if filtered, shows the filter title
function setCorrectTitle(){

	const title = document.querySelector(".container_text_nav_months h2");
	
	
	const dataString = "2025-0"+monthInvoice+"-29";
	const monthString = new Date(dataString)
						.toLocaleDateString("pt-BR",{"month":"long"});
						
	if(financeTransactionGroupSelect.value == "Dia a dia" || !financeTransactionGroupSelect.value){
		title.innerHTML = `Gastos <span class="current_month"></span>
							de
						<span class="current_year"></span>`;
						
		monthTitle = document.querySelector(".current_month");
		yearTitle = document.querySelector(".current_year");
		
		monthTitle.innerHTML = monthString.replace(monthString.charAt(0),
											monthString.charAt(0).toUpperCase());
		yearTitle.innerHTML = yearInvoice;
		
		rightArrow.removeAttribute("hidden");
		leftArrow.removeAttribute("hidden");
	}else{
		title.innerHTML = `Gastos <span class="current_group"></span>`;
		document.querySelector(".current_group").innerHTML = financeTransactionGroupSelect.value;
		leftArrow.setAttribute("hidden",true);
		rightArrow.setAttribute("hidden",true);
	}	
}

//sums the price of each transaction and  modifies the invoiceTotal dynamically
export function setTotal(monthTransactions){
	
	//verifies if there's at least one transaction 
	if(monthTransactions.length){
		
		const arrayNotCreditPrice = [];
		const arrayCreditPrice = [];
		monthTransactions.map((transaction)=>{
			if(transaction.type=="Crédito"){
				arrayCreditPrice.push(transaction.price);
			}else{
				arrayNotCreditPrice.push(transaction.price);
			}
		});
		
		let nextInvoiceTotal;
		let nextNonCreditTotal;
		
		if(!arrayCreditPrice.length){
			containerCreditTotal.classList.add("hidden");
		}else {
			containerCreditTotal.classList.remove("hidden");
			nextInvoiceTotal = arrayCreditPrice.reduce((accumulator,current)=>accumulator+current);
			invoiceNumber = nextInvoiceTotal;
			invoiceTotal.innerHTML = nextInvoiceTotal.toLocaleString("pt-BR",{style: 'currency', currency: 'BRL'});
		}
		
		
		if(!arrayNotCreditPrice.length){
			containerNonCreditTotal.classList.add("hidden");
		}else {
			containerNonCreditTotal.classList.remove("hidden");
			nextNonCreditTotal = arrayNotCreditPrice.reduce((accumulator,current)=>accumulator+current);
			totalExpenses.innerHTML = nextNonCreditTotal.toLocaleString("pt-BR",{style: 'currency', currency: 'BRL'});
		}
		
	}else{
		containerNonCreditTotal.classList.add("hidden");
		containerCreditTotal.classList.add("hidden");
	}
}

function resetTotal(){
	invoiceTotal.innerHTML = "";
}

function clearAllTransactions(){
	document.getElementById("transactions_column_name").innerHTML =
		`<p class="transactions_column_title">Nome</p>`;
		
	document.getElementById("transactions_column_date").innerHTML =	
		`<p class="transactions_column_title">Data</p>`;
		
	document.getElementById("transactions_column_type").innerHTML =	
		`<p class="transactions_column_title">Tipo</p>`;
		
	document.getElementById("transactions_column_category").innerHTML =	
		`<p class="transactions_column_title">Categoria</p>`;
		
	document.getElementById("transactions_column_installments").innerHTML =
		`<p class="transactions_column_title">Parcelas</p>`;
		
	document.getElementById("transactions_column_price").innerHTML =	
		`<p class="transactions_column_title">Preço</p>`;
	
	removeTransaction.clearSelectElement();
	transactionsArray = [];		
	removeChart();
}



export function addTransaction(transaction){
	document.getElementById("transactions_column_name")
		.innerHTML += `<div class="transaction">${transaction.name}</div>`;
								
	document.getElementById("transactions_column_date")
		.innerHTML += `<div class="transaction">
		${global.formattedDate(transaction.date)}</div>`;
								
	document.getElementById("transactions_column_type")
		.innerHTML += `<div class="transaction">
		${transaction.type}</div>`;
								
	document.getElementById("transactions_column_category")
		.innerHTML += `<div class="transaction">
		${transaction.category}</div>`;
								
	document.getElementById("transactions_column_installments")
		.innerHTML += `<div class="transaction">
		${transaction.currentInstallment+"/"
		+transaction.installments}</div>`;	
								
	document.getElementById("transactions_column_price")
		.innerHTML += `<div class="transaction">${(transaction.price)
		.toLocaleString("pt-BR",
		{style: 'currency', currency: 'BRL'})}</div>`;
								
	
	removeTransaction.addOptionToSelectForRemovalElement(transaction);
	
	transactionsArray.push(transaction);		
}

//adds the month transactions to the transactions tab and sets the total for that month
function addAllTransactions() {
	
	fetch(urlMonthInvoice,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
	    	.then((r) => r.json())
	    	.then((body) => {
				
	      		for (let i = 0; i < body.length; i++) {
					addTransaction(body[i]);
	     		}
				if(body.length){
					setUpChart(); 
				}
				setTotal(body);	
	   		});
}

async function addGroupTransactionsToFilter(){
	
	
	await fetchUser();
	for(let i=0;i<userData.transactionGroups.length;i++){
		
		createOptionSelectionGroup(i,financeTransactionGroupSelect);
	}
}

export default function initFinance() {
	
	setCorrectTitle();
	addAllTransactions();
	
	addGroupTransactionsToFilter();
	
	global.userClickEvents.forEach((userEvent)=>{
			
	
		//changes to the previous month
		leftArrow.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			
			if(monthInvoice>1){
				monthInvoice--;
			} else
			if(monthInvoice==1) {
				yearInvoice--;
				monthInvoice=12;
			}
		
			urlMonthInvoice = transactionUrl.concat(`/${monthInvoice}/${yearInvoice}`);
			clearAllTransactions();
			resetTotal();
			
			setCorrectTitle();
													
			addAllTransactions();
	
			removeTransaction.resetRemovalModal();
			
		})
		
		//changes to the next month
		rightArrow.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
					
			if(monthInvoice<12){
				monthInvoice++;
			}else 
			if(monthInvoice==12){
				yearInvoice++;
				monthInvoice=1;
			}
			
			urlMonthInvoice = transactionUrl.concat(`/${monthInvoice}/${yearInvoice}`);
			clearAllTransactions();
			resetTotal();
			
			setCorrectTitle();
	
			addAllTransactions();
			
			removeTransaction.resetRemovalModal();	
		})
		
		//opens add transaction modal
		addTransactionButton.addEventListener(userEvent, (event) => {
		    event.preventDefault();
			openAdditionModal();
		});
		
		//opens remove transaction modal
		removeTransactionButton.addEventListener(userEvent, (event) => {
			event.preventDefault();
			openRemovalModal();
		});	
		
	})
	
	financeTransactionGroupSelect.addEventListener("change",(event) => {
		event.preventDefault();
		urlMonthInvoice = transactionUrl.concat("/"+financeTransactionGroupSelect.value);
		if(urlMonthInvoice == transactionUrl.concat("/Dia a dia")){
			urlMonthInvoice= transactionUrl.concat(`/${monthInvoice}/${yearInvoice}`);
		}
		
		clearAllTransactions();
		resetTotal();
					
		setCorrectTitle();
															
		addAllTransactions();
			
		removeTransaction.resetRemovalModal();
	})
}