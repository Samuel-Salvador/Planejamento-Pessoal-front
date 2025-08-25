import outsideClick from "./outsideClick.js";
import {openSettingsModal} from "./settingsModal.js";
import {userClickEvents, urlAPI, urlFront} from "./global.js";

export default function initDropdownMenu(){
	const userNameDiv = document.querySelector(".container_user_name");
	const dropdownMenu = document.querySelector(".dropdown-menu");
	const settingsDropdown = document.querySelector(".settings_dropdown");
	const signOutDropdown = document.querySelector(".logout");
	
	userClickEvents.forEach(userEvent =>{
		userNameDiv.addEventListener(userEvent, handleClickDropdownMenu);
		signOutDropdown.addEventListener(userEvent,handleClickSignOut);
		settingsDropdown.addEventListener(userEvent,openSettingsModal);
	})
	
	function handleClickDropdownMenu(event){
		event.preventDefault();
		this.classList.add('active');
		
		outsideClick(this, userClickEvents, ()=>this.classList.remove('active'));
	}
	
	function handleClickSignOut(event){
		event.preventDefault();
		
		localStorage.removeItem("userId");
		sessionStorage.removeItem("userId");
		location.assign(urlFront);
	}	
}

