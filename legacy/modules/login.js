import {urlAPI, urlFront, userClickEvents} from "./global.js";
//import {userData} from "./header";
export let userData = {};
export let loggedUserId = sessionStorage.userId;
export let userUrl = urlAPI+`users/${loggedUserId}`;
export let token = sessionStorage.token;
export let transactionUrl = urlAPI+`transactions/${loggedUserId}`;

export async function fetchUser(){
    userData = await fetch(userUrl,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }).then((r)=>r.json());
}

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
	
	if(localStorage.userName == null){
		
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
		const token = await fetchToken(localStorage.userName, localStorage.password);
        const userId = getUserIdFromJWT(token);
        checkUserIdAndAssign(userId);
	}
	
	async function login(event){
		event.preventDefault();
		const userNameInput = document.forms.login.user_name.value;
		const userPasswordInput = document.forms.login.password.value;
		const rememberCheckBox = document.forms.login.remember.checked;

        try{
            const token = await fetchToken(userNameInput, userPasswordInput);
            const userId = getUserIdFromJWT(token);

            if(rememberCheckBox){
                localStorage.userName = userNameInput;
                localStorage.password = userPasswordInput;
                localStorage.token = token;
            }

            checkUserIdAndAssign(userId);
        } catch(error){
            return
        }
	}

    async function fetchToken(userNameInput, userPasswordInput){
        const options = {
            method: "POST",
            headers:{
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({
                userName: userNameInput,
                password: userPasswordInput
            }),
        }
        try{
            const responseJWT = await fetch(urlAPI+`login`, options);
            if (responseJWT.status === 403){
                userNameElement.setAttribute("class","login_input login_error");
                userPasswordElement.setAttribute("class","login_input login_error");
            }
            const JWTJSON = await responseJWT.json();
            sessionStorage.token = JWTJSON.token;
            return JWTJSON.token;
        } catch (error){
            console.error("Usuário não cadastrado!");
        }

    }

    function checkUserIdAndAssign(userId){
        if (userId){
            sessionStorage.userId = userId;
            loggedUserId = userId;
            userUrl = urlAPI+`users/${loggedUserId}`;
            transactionUrl = urlAPI+`transactions/${loggedUserId}`;


            removeOutline(userNameElement);
            removeOutline(userPasswordElement);
            location.assign(urlFront+"html/finance.html");
        } else{
            userNameElement.setAttribute("class","login_input login_error");
            userPasswordElement.setAttribute("class","login_input login_error");
        }
    }

    function getUserIdFromJWT(token) {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        return payload.id;
    }
	
	function removeOutline(element){
		element.setAttribute("class","login_input");
	}
}
