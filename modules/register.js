import {formValidated,url,userClickEvents} from "./global.js";


let visibilityPasswordEyeImg = document.querySelector('.password_visibility_register');;
let visibilityConfirmPasswordEyeImg = document.querySelector('.passwordconfirm_visibility_register');;
const passwordInputElement = document.getElementById('password');
const confirmPasswordInputElement = document.getElementById('password_confirm');
const confirmButton = document.querySelector(".confirm");

if(location.toString()==url+"html/register.html"){
	
	const backButton = document.querySelector(".back");
	confirmButton.removeAttribute('disabled');
	
	
	
	
	userClickEvents.forEach((userEvent)=>{
		
		backButton.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			location.assign(url);
		});
		
		confirmButton.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			
			register();
		});
			
		document.addEventListener("keydown",(event)=>{
			if(event.key==="Enter"){
				register();
			}
		});
		
		visibilityPasswordEyeImg.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			changePasswordVisibility();
		});
		
		visibilityConfirmPasswordEyeImg.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			changeConfirmPasswordVisibility();
		});
	});	
}

function register(){
	const userFullName = document.forms.register.fullname.value;
	const userNickname = document.forms.register.login.value;
	const userBirthday = document.forms.register.birthday.value;
	const userEmail = document.forms.register.email.value;

	const userPassword = document.forms.register.password.value;
	const userConfirmPassword = document.forms.register.password_confirm.value;
	
	
	if(	formValidated(userFullName) &&
		formValidated(userNickname) &&
		formValidated(userBirthday) &&
		formValidated(userEmail) &&
		formValidated(userPassword) &&
		formValidated(userConfirmPassword) &&
		userPassword===userConfirmPassword){
			confirmButton.setAttribute('disabled',true);
			const options = {
			method: "POST",
			headers: {
					"Content-Type": "application/json; charset=utf-8",
			},
			body: JSON.stringify({
						name: userFullName,
						username: userNickname,
						birthday: userBirthday,
						email: userEmail,
						password: userPassword})
			};
			fetch(url+'users', options).then(()=>{location.assign(url)});
	}
}

function changePasswordVisibility(){
	visibilityPasswordEyeImg = document.querySelector('.password_visibility_register');
	const passwordContainer = document.querySelector('.container_register_password');
	const newEyeImg = document.createElement('img');
	
	userClickEvents.forEach((userEvent)=>{
		newEyeImg.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			changePasswordVisibility();
		})
	});
	
	if(visibilityPasswordEyeImg.classList[1]=='visibility_off'){
		passwordInputElement.type='text';
		passwordContainer.removeChild(visibilityPasswordEyeImg);
		newEyeImg.classList.add('password_visibility_register');
		newEyeImg.classList.add('visibility_on');
		newEyeImg.setAttribute('src','../img/input_visibility_on.png');
		passwordContainer.appendChild(newEyeImg);
	}else{
		passwordInputElement.type='password';
		passwordContainer.removeChild(visibilityPasswordEyeImg);
		newEyeImg.classList.add('password_visibility_register');
		newEyeImg.classList.add('visibility_off');
		newEyeImg.setAttribute('src','../img/input_visibility_off.png');
		passwordContainer.appendChild(newEyeImg);
	}
}

function changeConfirmPasswordVisibility(){
	visibilityConfirmPasswordEyeImg = document.querySelector('.passwordconfirm_visibility_register');
	const passwordContainer = document.querySelector('.container_register_confirmpassword');
	const newEyeImg = document.createElement('img');
	
	userClickEvents.forEach((userEvent)=>{
		newEyeImg.addEventListener(userEvent,(event)=>{
			event.preventDefault();
			event.stopPropagation();
			changeConfirmPasswordVisibility();
		})
	});
	
	if(visibilityConfirmPasswordEyeImg.classList[1]=='visibility_off'){
		confirmPasswordInputElement.type='text';
		passwordContainer.removeChild(visibilityConfirmPasswordEyeImg);
		newEyeImg.classList.add('passwordconfirm_visibility_register');
		newEyeImg.classList.add('visibility_on');
		newEyeImg.setAttribute('src','../img/input_visibility_on.png');
		passwordContainer.appendChild(newEyeImg);
	}else{
		confirmPasswordInputElement.type='password';
		passwordContainer.removeChild(visibilityConfirmPasswordEyeImg);
		newEyeImg.classList.add('passwordconfirm_visibility_register');
		newEyeImg.classList.add('visibility_off');
		newEyeImg.setAttribute('src','../img/input_visibility_off.png');
		passwordContainer.appendChild(newEyeImg);
	}
}