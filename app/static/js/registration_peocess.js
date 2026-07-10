

console.log("this is one");
document.getElementById("submit").addEventListener('click',complete_registration_process);


const based_url = "http://127.0.0.1:8001/signup";

async function complete_registration_process(event) {
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

        if(response.ok){

            const process_results = await response.json();
            console.log(process_results);
            let process_status = process_results.status;
            localStorage.setItem("proc",process_status);
            if(process_status=="success"){
                // alert(window.location.origin);
                window.location.href= "./login.html";
            }
            else{
                console.log("didn't registered");
            }
        }
        else{
            const error_data = await response.json();
            console.log("Backend rejected the request. Details:", error_data);
            alert(error_data.details);
        }


        console.log("i reached here");

 
        
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

