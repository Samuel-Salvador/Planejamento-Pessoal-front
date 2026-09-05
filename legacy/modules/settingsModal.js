import {userClickEvents, formattedDate, urlAPI, urlFront} from "./global.js";
import { userUrl,userData,fetchUser, token } from "./login.js";
import {updateBalanceHeader} from "./header.js";
import { addModalTransactionGroupSelect, createOptionSelectionGroup } from "./addModal.js";
import { financeTransactionGroupSelect } from "./finance.js";

const settingsModal = document.querySelector(".user_settings_modal_section");
const settingsInnerContentElement = document.querySelector(".container_settings_inner_content");
const settingsInnerContentUserData = document.querySelector(".container_settings_inner_content").innerHTML;

let dataSettingIncomeInput = document.getElementById("user_settings_income_input");
export let dataSettingBalanceInput = document.getElementById("user_settings_balance_input");
let invoiceClosingDateInput = document.getElementById("user_settings_invoice_closingdate_input");

let rightArrowImg = document.querySelector(".active_option_img");
let parentElementImg = rightArrowImg.parentElement;
let closeModalButton = document.querySelector(".x_settings");
export function openSettingsModal(){
	settingsModal.classList.add("flex");
}

function closeSettingsModal(event){
	event.preventDefault();
	
	settingsModal.classList.remove("flex");
}

function clickOutsideModal(event){
	if(event.target===this){
		closeSettingsModal(event);
	}	
}

function populateInvoiceDueDate(){
	
	for(let i=1;i<=28;i++){
		const option = document.createElement("option");
		option.innerHTML=i;
		option.setAttribute("value",i);
		invoiceClosingDateInput = document.getElementById("user_settings_invoice_closingdate_input");
		invoiceClosingDateInput.appendChild(option);
	}
}

function changeVisibilityDropdownMenu(parentElement,dropdownMenu){
	dropdownMenu.classList.toggle("active");
	parentElement.classList.toggle("active_option");
}


function changeVisibilityPassword(){
	
	const containerPassword = document.querySelector(".container_password_settings");
	const dataSettingPasswordInput = document.getElementById("user_settings_password_input");
	const currentImg = containerPassword.querySelector("img");
	
	const visibilityOn = document.createElement("img");
	visibilityOn.setAttribute("src","../img/visibility_on.png");
	visibilityOn.setAttribute("class","settings_password_visibility");
	visibilityOn.setAttribute("img_visibility_on","");
	
	const visibilityOff = document.createElement("img");
	visibilityOff.setAttribute("src","../img/visibility_off.png");
	visibilityOff.setAttribute("class","settings_password_visibility");
	visibilityOff.setAttribute("img_visibility_off","");

	userClickEvents.forEach((userEvent)=>{
		visibilityOn.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			changeVisibilityPassword();
		});	
		visibilityOff.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			changeVisibilityPassword();
		});
	})
	
	if(currentImg.hasAttribute("img_visibility_on")){
		containerPassword.removeChild(currentImg);
		containerPassword.appendChild(visibilityOff);
		dataSettingPasswordInput.setAttribute("placeholder","••••••••••••");
	}else{
		containerPassword.removeChild(currentImg);
		containerPassword.appendChild(visibilityOn);
		dataSettingPasswordInput.setAttribute("placeholder",userData.password);

	}
	
	
}

function resetTransactionGroupInputValue(){
	document.forms.transaction_group_form.transaction_group.value='';
}

async function handleAddTransactionGroupButton(){
	await fetchUser();
	
	const financeGroupInput = document.forms.transaction_group_form.transaction_group.value.trimEnd();

	
	const options = {
		method: "PUT",
		headers: {
			"Content-Type": "application/json; charset=utf-8",
            'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({
            transactionGroup: financeGroupInput,
            invoiceClosingDate: userData.invoiceClosingDate
        })
	}
	await fetch(userUrl,options);
	await fetchUser();
	addTransactionGroupToDom(financeGroupInput);
	createOptionSelectionGroup(userData.transactionGroups.length-1,addModalTransactionGroupSelect);
	createOptionSelectionGroup(userData.transactionGroups.length-1,financeTransactionGroupSelect);
	resetTransactionGroupInputValue();
}

async function handleRemoveTransactionGroupButton(){
	await fetchUser();
		
	const financeGroupInput = document.forms.transaction_group_form.transaction_group.value;
	const arrayTransactionGroups = userData.transactionGroups;
	const financeGroupFormElement = document.querySelector(".settings_finance_group");
	const updateUserMsg = document.createElement("p");
	
	
	if(financeGroupInput==="Dia a dia" || !arrayTransactionGroups.some((item)=>item===financeGroupInput)){

		updateUserMsg.innerHTML = `Não é possível remover este grupo, certifique-se que ele existe ou é diferente do grupo padrão.`;
		updateUserMsg.setAttribute("class","update_user_msg failed_update");
		
		financeGroupFormElement.appendChild(updateUserMsg);
	}else{
	
		const indexForRemoval = arrayTransactionGroups.indexOf(financeGroupInput);
        const deletionString = "-".concat(financeGroupInput);
		arrayTransactionGroups.splice(indexForRemoval,1);

		const options = {
			method: "PUT",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
                'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
                transactionGroup: deletionString,
                invoiceClosingDate: userData.invoiceClosingDate
            })
		}
		await fetch(userUrl,options);
		removeTransactionGroupFromDOM(financeGroupInput);
	}
	setTimeout(()=>{
					if(financeGroupFormElement.contains(updateUserMsg))
						financeGroupFormElement.removeChild(updateUserMsg);
				},5000);
	resetTransactionGroupInputValue();
}

function addTransactionGroupToDom(transactionGroup){
	const transactionGroupDOMList = document.querySelector(".settings_finance_group_data_list");
	const newTransactionGroup = document.createElement("li");
	newTransactionGroup.setAttribute("class","settings_finance_group_data_item");
	newTransactionGroup.innerHTML = transactionGroup;
	transactionGroupDOMList.appendChild(newTransactionGroup);
	
}

function removeTransactionGroupFromDOM(transactionGroup){
	const transactionGroupDOMList = document.querySelector(".settings_finance_group_data_list");
	const transactionForRemoval = transactionGroupDOMList.querySelectorAll(".settings_finance_group_data_item");
	
	for(let i=0;i<transactionForRemoval.length;i++){
		if(transactionForRemoval[i].innerHTML==transactionGroup){
			transactionGroupDOMList.removeChild(transactionForRemoval[i]);
			break;
		}
	}
}

export async function initSettingsModal(){
	populateInvoiceDueDate();
	
	const menuList = document.querySelector(".settings_menu_list");
	const menuItems = document.querySelectorAll(".settings_menu_list_item");
	
	const financeItemMenuSettings = document.querySelector(".finance_item");
	const dropdownMenuFinance = menuList.querySelector(".dropdown-menu");
	const financeInnerMenuItems = document.querySelectorAll(".finance_menu_list_item");
	
	const allMenuItems = Array.from(menuItems).concat(Array.from(financeInnerMenuItems));
	
	userClickEvents.forEach((userEvent)=>{
		closeModalButton.addEventListener(userEvent,closeSettingsModal);
		settingsModal.addEventListener(userEvent,clickOutsideModal);
		financeItemMenuSettings.addEventListener(userEvent,()=>{
			changeVisibilityDropdownMenu(financeItemMenuSettings,dropdownMenuFinance);
		});
		
		
		allMenuItems.forEach((menuItem)=>menuItem.addEventListener(userEvent,(event)=>{
			event.stopPropagation();
			event.preventDefault();
			changeCurrentMenuItem(menuItem);
		}));
	})
	changePlaceholdersUserData();
	
}

async function changeCurrentMenuItem(menuItem){
	
	if(document.querySelector(".active_option_img")){
		rightArrowImg = document.querySelector(".active_option_img");
		parentElementImg = rightArrowImg.parentElement;
		parentElementImg.removeChild(rightArrowImg);
	}
	
	let isDropdownMenu = false;
	for(let i=0;i<menuItem.classList.length;i++){
		if(menuItem.classList[i]=="finance_item"){
			isDropdownMenu = true;
		}
	}
	if(!isDropdownMenu){
		menuItem.appendChild(rightArrowImg);
	}
	
	const settingsInnerContentDeleteAccount = 
	`<div class="settings_delete_account_data">
		<h3 class="settings_delete_account_title">Excluir conta de usuário</h3>
		<a class="x_settings x" href="">X</a>
		<p class="delete_account_question">Tem certeza que deseja <span>excluir</span> sua conta de usuário?
	<br><br> Esta ação NÃO pode ser desfeita.</p>
		<button class="settings_modal_button delete_account_button" type="button">Excluir</button>
	</div>`;
	
	const settingsInnerContentFinanceGroup = 
		`<div class="settings_finance_group">
			<h3 class="settings_finance_group_title">Grupos de transações</h3>
			<a class="x_settings x" href="">X</a>
			<ul class="settings_finance_group_data_list">
				
			</ul>
			<form name="transaction_group_form">
				<input name="transaction_group" type="text" id="transaction_group_input" placeholder="Ex.: Viagem Rio de Janeiro 2014">
			</form>
			
			<button type="button" class="settings_modal_button remove_transaction_group_button">Remover</button>
			<button type="button" class="settings_modal_button add_transaction_group_button">Adicionar</button>
		</div>`;
	
	if(menuItem.getAttribute("data-content")=="delete_account"){
		settingsInnerContentElement.innerHTML = settingsInnerContentDeleteAccount;
		
		const deleteAccountButton = document.querySelector(".delete_account_button");
		closeModalButton = document.querySelector(".x_settings");
		
		userClickEvents.forEach((userEvent)=>{
			deleteAccountButton.addEventListener(userEvent,()=>{
				location.assign(urlFront);
				fetch(userUrl,{
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
			})
			
			closeModalButton.addEventListener(userEvent,(event)=>{
				closeSettingsModal(event);
			});
		})
		
	}
	if(menuItem.getAttribute("data-content")=="account_data"){
		settingsInnerContentElement.innerHTML = settingsInnerContentUserData;
		closeModalButton = document.querySelector(".x_settings");
		changePlaceholdersUserData();
		populateInvoiceDueDate();
		
		userClickEvents.forEach((userEvent)=>{
			closeModalButton.addEventListener(userEvent,(event)=>{
				closeSettingsModal(event);
			});
		})
		
	}
	if(menuItem.getAttribute("data-content")=="finance_group"){
		
		settingsInnerContentElement.innerHTML = settingsInnerContentFinanceGroup;
		
		const financeGroupDiv = document.querySelector(".settings_finance_group");
		closeModalButton = document.querySelector(".x_settings");
		resetTransactionGroupInputValue();
		
		await fetchUser();
		const arrayTransactionGroups = userData.transactionGroups;
			
		arrayTransactionGroups.forEach((transactionGroup)=>{
			addTransactionGroupToDom(transactionGroup);
		});
		
		const addFinanceGroupButton = document.querySelector(".add_transaction_group_button");
		const removeFinanceGroupButton = document.querySelector(".remove_transaction_group_button");
		
		userClickEvents.forEach((userEvent)=>{
			addFinanceGroupButton.addEventListener(userEvent,()=>{
				handleAddTransactionGroupButton();
			});
			removeFinanceGroupButton.addEventListener(userEvent,()=>{
				handleRemoveTransactionGroupButton();
			});
			closeModalButton.addEventListener(userEvent,(event)=>{
				closeSettingsModal(event);
			});
		})
		
		financeGroupDiv.addEventListener('keydown',(event)=>{
			if(event.key=="Enter"){
				event.preventDefault();
				
				handleAddTransactionGroupButton();
			}
		})
	}
	 
}

export async function changePlaceholdersUserData(){
	const passwordVisibility = document.querySelector(".settings_password_visibility");
		
	const dataSettingFullnameInput = document.getElementById("user_settings_fullname_input");
	const dataSettingUsernameInput = document.getElementById("user_settings_username_input");
	const dataSettingBirthdayInput = document.getElementById("user_settings_birthday_input");
	const dataSettingEmailInput = document.getElementById("user_settings_email_input");
	dataSettingIncomeInput = document.getElementById("user_settings_income_input");
	dataSettingBalanceInput = document.getElementById("user_settings_balance_input");
	const saveDataButton = document.querySelector(".settings_modal_button");
	

		
	await fetchUser();
		
	dataSettingFullnameInput.setAttribute("placeholder",userData.name);
	dataSettingUsernameInput.setAttribute("placeholder",userData.username);
	dataSettingBirthdayInput.setAttribute("placeholder",formattedDate(userData.birthday));
	dataSettingEmailInput.setAttribute("placeholder",userData.email);
	dataSettingIncomeInput.setAttribute("placeholder",userData.income);
	dataSettingBalanceInput.setAttribute("placeholder",userData.balance);
	invoiceClosingDateInput.selectedIndex = userData.invoiceClosingDate-1;
	
	userClickEvents.forEach((userEvent)=>{
		passwordVisibility.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			changeVisibilityPassword();
		});
		saveDataButton.addEventListener(userEvent,()=>handleSaveButton(saveDataButton));
	});		
}

async function handleSaveButton(saveDataButton){
	const incomeFormValue = document.forms.settings_account_data.income.value;
	const balanceFormValue = document.forms.settings_account_data.balance.value;
	const invoiceClosingDateValue = invoiceClosingDateInput.selectedIndex+1;
	
	let options = {};
	
	if(incomeFormValue && balanceFormValue){
		options={	method: "PUT",
					headers:{	
								"Content-Type": "application/json; charset=utf-8",
                                'Authorization': `Bearer ${token}`
							},
					body: JSON.stringify({	income: incomeFormValue,
											balance: balanceFormValue,
											invoiceClosingDate: invoiceClosingDateValue
					}),
				};
	}
	
	if(incomeFormValue && !balanceFormValue){
		options={	method: "PUT",
					headers:{	
								"Content-Type": "application/json; charset=utf-8",
                                'Authorization': `Bearer ${token}`
							},
					body: JSON.stringify({	income: incomeFormValue,
											invoiceClosingDate: invoiceClosingDateValue
					}),
				};
	}
	
	if(balanceFormValue && !incomeFormValue){
		options={	method: "PUT",
					headers:{	
								"Content-Type": "application/json; charset=utf-8",
                                'Authorization': `Bearer ${token}`
							},
					body: JSON.stringify({
											balance: balanceFormValue,
											invoiceClosingDate: invoiceClosingDateValue
					}),
				};
	}
	
	if(!incomeFormValue && !balanceFormValue){
		options={	method: "PUT",
					headers:{	
								"Content-Type": "application/json; charset=utf-8",
                                'Authorization': `Bearer ${token}`
							},
					body: JSON.stringify({
											invoiceClosingDate: invoiceClosingDateValue
					}),
				};
	}
	
	
	const updateUserMsg = document.createElement("p");
	
	if(options.body){
		
		await fetch(userUrl, options);
		updateUserMsg.innerHTML = `Dados salvos com sucesso!`
		updateUserMsg.setAttribute("class","update_user_msg successful_update");
		await fetchUser();
		await updateBalanceHeader();
		dataSettingIncomeInput.setAttribute("placeholder",userData.income);
		dataSettingBalanceInput.setAttribute("placeholder",userData.balance);	
		saveDataButton.disabled = true;
	}else{
		updateUserMsg.innerHTML = `Erro ao Salvar dados, um ou mais<br>campos devem ser modificados!`
		updateUserMsg.setAttribute("class","update_user_msg failed_update");
	}
	
	const existingUpdateUserMsg = document.querySelector(".update_user_msg");
	const accountDataFormElement = document.querySelector(".settings_account_data");
	
	if(existingUpdateUserMsg){
		accountDataFormElement.removeChild(existingUpdateUserMsg);
		
	}
	accountDataFormElement.appendChild(updateUserMsg);
	
	setTimeout(()=>{
				saveDataButton.disabled = false;
				if(accountDataFormElement.contains(updateUserMsg))
					accountDataFormElement.removeChild(updateUserMsg);
			},5000);
}