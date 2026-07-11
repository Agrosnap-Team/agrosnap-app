

console.log("this is one");
alert("Origin : "+window.location.origin + "\nPathname: " + window.location.pathname);
document.getElementById("submit").addEventListener('click',complete_registration_process);

async function complete_registration_process(event) {
     
    const based_url = "http://127.0.0.1:8080/signup";
    event.stopPropagation();
    event.preventDefault();//prevent the page to make refresh 

    try{
        localStorage.setItem("proc","null");
        let user_data = get_user_info();
        console.log(user_data)
        const response = await fetch(based_url,
        {
            method:"POST",
            headers:{"Content-Type": "application/json","ngrok-skip-browser-warning": "true"},
            body:JSON.stringify(user_data)
        });

        console.log(response);
        const process_results = await response.json();
        console.log(process_results.status);
        if(process_results.status=="success"){
            alert("Origin : "+window.location.origin + "\nPathname: " + window.location.pathname);
            window.location.href="./login.html";
            alert("Origin : "+window.location.origin + "\nPathname: " + window.location.pathname);
        }
        else{console.log("failed: " , process_results.status);}
ئ
    }
    catch(error){
        console.log("failed send: " , error);
    }

    
}


function get_user_info(){
        const user_data = {
        "username":document.getElementById("username").value,
        "first_name": document.getElementById("first_name").value,
        "last_name" : document.getElementById("last_name").value,
        "email" : document.getElementById("email").value,
        "PASSWORD_HASH": document.getElementById("password").value
        };

        console.log("this the data");

        return user_data;
}

