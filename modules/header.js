import * as global from './global.js';
import {dataSettingBalanceInput} from './settingsModal.js';
import {invoiceNumber} from './finance.js';
import { userUrl } from './login.js';

const balanceSPAN = document.querySelector(".balance span");
const balanceContainer = document.querySelector(".balance");
const balanceManagementContainer = balanceContainer.querySelector(".balance_management_list");

const plusIncomeElement = balanceManagementContainer.querySelector(".plus_income");
const minusInvoiceElement = balanceManagementContainer.querySelector(".minus_invoice");

export let userData = {};

export async function initHeader(){

	const userName = document.querySelector(".user_name");
	const balanceVisibilityImg = document.querySelector(".balance_visibility_img");
	
	await fetchUser();
	
	userName.innerHTML = userData.username;
	updateBalanceHeader();
	
	global.userClickEvents.forEach((userEvent)=>{
		balanceVisibilityImg.addEventListener(userEvent,(event)=>{
			event.stopPropagation();
			event.preventDefault();
			changeVisibilityBalance();
		});
		balanceContainer.addEventListener(userEvent,(event)=>{
			event.stopPropagation();
			event.preventDefault();
			toggleBalanceManagementContainer();
		});
		plusIncomeElement.addEventListener(userEvent,depositIncome);
		minusInvoiceElement.addEventListener(userEvent,payInvoice);
	})
}

export async function fetchUser(){
	userData = await fetch(userUrl).then((r)=>r.json());
}

export async function updateBalanceHeader(){
	
	await fetchUser();
	
	if(userData.balance==null){
		balanceSPAN.innerHTML = 'R$ 0,00';
	}else{
		balanceSPAN.innerHTML = global.formattedPrice(userData.balance);
	}
}

function changeVisibilityBalance(){
	
	const containerBalance = document.querySelector(".container_balance");
	const currentImg = containerBalance.querySelector(".balance_visibility_img");	
	
	const visibilityOn = document.createElement("img");
	visibilityOn.setAttribute("src","../img/visibility_on.png");
	visibilityOn.setAttribute("class","balance_visibility_img");
	visibilityOn.setAttribute("img_visibility_on","");
		
	const visibilityOff = document.createElement("img");
	visibilityOff.setAttribute("src","../img/visibility_off.png");
	visibilityOff.setAttribute("class","balance_visibility_img");
	visibilityOff.setAttribute("img_visibility_off","");

	global.userClickEvents.forEach((userEvent)=>{
		visibilityOn.addEventListener(userEvent,(event)=>{
			event.stopPropagation();
			event.preventDefault();
			changeVisibilityBalance();
		});	
		visibilityOff.addEventListener(userEvent,(event)=>{
			event.stopPropagation();
			event.preventDefault();
			changeVisibilityBalance();
		});	
	})
		
	if(currentImg.hasAttribute("img_visibility_on")){
		containerBalance.removeChild(currentImg);
		containerBalance.appendChild(visibilityOff);
		balanceSPAN.innerHTML = "•••••••••";
	}else{
		containerBalance.removeChild(currentImg);
		containerBalance.appendChild(visibilityOn);
		balanceSPAN.innerHTML = global.formattedPrice(userData.balance);
	}	
}

function toggleBalanceManagementContainer(){
	balanceManagementContainer.classList.toggle("flex");
}

async function depositIncome(){
	await fetchUser();
	const newBalance = userData.balance+userData.income;
	const options={	method: "PUT",
					headers:{	
								"Content-Type": "application/json; charset=utf-8",
							},
					body: JSON.stringify({	
						balance: newBalance,
						invoiceClosingDate: userData.invoiceClosingDate
					}),
					};
	await fetch(userUrl,options);
	await updateBalanceHeader();
	dataSettingBalanceInput.setAttribute("placeholder",newBalance.toFixed(2));
}

async function payInvoice(){
	await fetchUser();

	const newBalance = userData.balance-invoiceNumber;
	const options= {method: "PUT",
					headers:{	
								"Content-Type": "application/json; charset=utf-8",
							},
					body: JSON.stringify({	
						balance: newBalance,
                        invoiceClosingDate: userData.invoiceClosingDate

					}),
					};
	await fetch(userUrl, options);
	await updateBalanceHeader();
	dataSettingBalanceInput.setAttribute("placeholder",newBalance.toFixed(2));

}