import {urlAPI, urlFront, userClickEvents} from "./global.js";

export let loggedUserId = sessionStorage.userId;

export let userUrl = urlAPI+`users/${loggedUserId}`;

export let transactionUrl = urlAPI+`transactions/${loggedUserId}`;

let visibilityEyeImg = document.querySelector('.password_visibility_login');;
const passwordInputElement = document.querySelector('.login_password');

function changePasswordVisibility(){
	visibilityEyeImg = document.querySelector('.password_visibility_login');
	const passwordContainer = document.querySelector('.container_password_login');
	const newEyeImg = document.createElement('img');
	
	userClickEvents.forEach((userEvent)=>{
		newEyeImg.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			changePasswordVisibility();
		})
	});
	
	if(visibilityEyeImg.classList[1]=='visibility_off'){
		passwordInputElement.type='text';
		passwordContainer.removeChild(visibilityEyeImg);
		newEyeImg.classList.add('password_visibility_login');
		newEyeImg.classList.add('visibility_on');
		newEyeImg.setAttribute('src','./img/input_visibility_on.png');
		passwordContainer.appendChild(newEyeImg);
	}else{
		passwordInputElement.type='password';
		passwordContainer.removeChild(visibilityEyeImg);
		newEyeImg.classList.add('password_visibility_login');
		newEyeImg.classList.add('visibility_off');
		newEyeImg.setAttribute('src','./img/input_visibility_off.png');
		passwordContainer.appendChild(newEyeImg);
	}
}

if(location.toString() == urlFront){
	visibilityEyeImg = document.querySelector('.password_visibility_login');
	userClickEvents.forEach((userEvent)=>{
		visibilityEyeImg.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			changePasswordVisibility();
		})
	});
	
	const userNameElement = document.forms.login.user_name;
	const userPasswordElement = document.forms.login.password;
	
	if(localStorage.userId==null){
		
		const loginButton = document.querySelector(".login_button");
		
		userClickEvents.forEach((userEvent)=>{
			loginButton.addEventListener(userEvent,(event)=>login(event));
			userNameElement.addEventListener(userEvent,()=>removeOutline(userNameElement));
			userPasswordElement.addEventListener(userEvent,()=>removeOutline(userPasswordElement));
		})
		
		document.addEventListener("keydown",(event)=>{
			if(event.key==="Enter"){
				login(event);
			}
		})
	}else{
		sessionStorage.userId = localStorage.userId;
		location.assign(urlFront+"html/finance.html");
	}
	
	async function login(event){
		event.preventDefault();
		const userName = document.forms.login.user_name.value;
		const userPassword = document.forms.login.password.value;
		const rememberCheckBox = document.forms.login.remember.checked;
		
		const responseUsers = await fetch(urlAPI+`users`);
		const usersJSON = await responseUsers.json();
	
		for(let i=0;i<usersJSON.length;i++){
			if(	usersJSON[i].username === userName &&
				usersJSON[i].password === userPassword){
					if(rememberCheckBox){
						localStorage.userId = usersJSON[i].id;
					}
				sessionStorage.userId = usersJSON[i].id;
				loggedUserId = usersJSON[i].id;
				userUrl = urlAPI+`users/${loggedUserId}`;
				transactionUrl = urlAPI+`transactions/${loggedUserId}`;
				location.assign(urlFront+"html/finance.html");
				removeOutline(userNameElement);
				removeOutline(userPasswordElement);
			}else{	
				userNameElement.setAttribute("class","login_input login_error");
				userPasswordElement.setAttribute("class","login_input login_error");
			}
		}
	}
	
	function removeOutline(element){
		element.setAttribute("class","login_input");
	}
}
