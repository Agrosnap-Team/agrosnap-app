

// console.log("this is one");
// alert("Origin : "+window.location.origin + "\nPathname: " + window.location.pathname);
document.getElementById("submit").addEventListener('click',complete_registration_process);

async function complete_registration_process(event) {
     
    const based_url = "/signup";
    event.stopPropagation();
    event.preventDefault();//prevent the page to make refresh 

    try{
        let user_data = get_user_info();
        if (user_data != null){
            const response = await fetch(based_url,
            {
                method:"POST",
                headers:{"Content-Type": "application/json","ngrok-skip-browser-warning": "true"},
                body:JSON.stringify(user_data)
            });


            const process_results = await response.json();


            if (!response.ok) {
                // const the_msg = process_results.detail;
                let errorMessage;
                if(Array.isArray(process_results.detail)){ //pyndatic errors
                    errorMessage=process_results.detail[0].msg;
                }
                else{
                    errorMessage=process_results.detail;
                }
                document.getElementById("msg").style.visibility="visible";
                document.getElementById("msg").innerHTML = errorMessage; 
                return;
            }

            if(process_results.status=="success"){
                // alert("Origin : "+window.location.origin + "\nPathname: " + window.location.pathname);
                document.getElementById("submit").innerHTML="Loading...";
                


                // await new Promise(resolve => setTimeout(resolve, 400));

                // window.location.href="./login.html"

                window.location.href="/loginForm";
                
                // alert("here");
                // alert("Origin : "+window.location.origin + "\nPathname: " + window.location.pathname);
            }


        }//end of check the empty of user_data

    }
    catch(error){
            document.getElementById("msg").style.visibility = "visible";
            document.getElementById("msg").innerHTML ="No internet connection , please connect to internet first"; 
    }

    
}


function get_user_info(){
        const user_data = {
        "username":document.getElementById("username").value,
        "first_name": document.getElementById("first_name").value,
        "last_name" : document.getElementById("last_name").value,
        "email" : document.getElementById("email").value,
        "PASSWORD_HASH": document.getElementById("password").value,
        "confirm_password":document.getElementById("confirm-password").value
        };
        // create an array of all values to check whether any of them is empty later
        const all_values = Object.values(user_data);
        
        
        //remove all spaces at the end and start 
        const anyValueIsEmpty = all_values.some(value => value.trim() === "");

        //check then if it empty of not 

        if(anyValueIsEmpty){
            document.getElementById("msg").style.visibility="visible";
            document.getElementById("msg").innerHTML = "Please fill all fields!"; 
            return null;            
        }
        else{
            return user_data;
        }

}

function appear_Successfully(){
     document.getElementById("msg").style.visibility="visible";
     document.getElementById("msg").innerHTML = "Registered successfully !"; 
     document.getElementById("msg").style.color="#0a861e";
     document.getElementById("msg").style.backgroundColor="#487550";
     


    
}

