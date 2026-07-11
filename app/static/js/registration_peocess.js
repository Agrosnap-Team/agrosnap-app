

// console.log("this is one");
// alert("Origin : "+window.location.origin + "\nPathname: " + window.location.pathname);
document.getElementById("submit").addEventListener('click',complete_registration_process);

async function complete_registration_process(event) {
     
    const based_url = "http://127.0.0.1:8080/signup";
    event.stopPropagation();
    event.preventDefault();//prevent the page to make refresh 

    try{
        let user_data = get_user_info();
        if (user_data !="null"){
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
                // alert("Origin : "+window.location.origin + "\nPathname: " + window.location.pathname);
                document.getElementById("submit").innerHTML="Loading..."
                window.location.href="./login.html";
                // alert("Origin : "+window.location.origin + "\nPathname: " + window.location.pathname);
            }
            else{
                const the_msg = process_results.detail;
                document.getElementById("msg").style.visibility="visible";
                document.getElementById("msg").innerHTML = the_msg; 
                alert("something went wrong");
                // console.log("failed: " , process_results.detail);
                // alert("Read the console log");
                }
        }

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
        // create an array of all values to check whether any of them is empty later
        const all_values = Object.values(user_data);
        
        
        //remove all spaces at the end and start 
        const anyValueIsEmpty = all_values.some(value => value.trim() === "");

        //check then if it empty of not 

        if(anyValueIsEmpty){
            document.getElementById("msg").style.visibility="visible";
            document.getElementById("msg").innerHTML = "Please fill all fields!"; 
            return "null";            
        }
        else{
            return user_data;
        }

}

