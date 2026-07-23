
import handleData from "./tokenDecoding.js";
import DB from "./databaseManager_IndexedDB.js";


document.addEventListener('click',check_user_data);

async function check_user_data(element) {
    console.log("you are in check method");
    if(element.target && element.target.id === "submit"){
        element.preventDefault();
        const user_data = get_values_from_fields();
        try{

            if (user_data){
                console.log("user data is not empty \n " ,user_data );

                const response = await fetch("/login",{
                method:"POST",
                headers:{"Content-Type": "application/json"},
                body:JSON.stringify(user_data)
                });//end of response

                const result = await response.json();//get result in json

                //check the response
                if (!response.ok) {
        
                    let errorMessage;
                    if(Array.isArray(result.detail)){ //pyndatic errors
                        errorMessage=result.detail[0].msg;
                    }
                    else{
                        errorMessage=result.detail;
                    }
                    document.getElementById("msg").style.visibility="visible";
                    document.getElementById("msg").innerHTML = errorMessage; 
                    return;
                }

                console.log(result);
                if(result.create_token){
                    console.log("token is exist " , result.create_token);

                    localStorage.setItem("user_token",result.create_token);

                    const decodedData = handleData.decodeToken(result.create_token);

                    DB.prepareDataAndStoreIt(decodedData);
                    //store all user data in indexedDB
                    window.location.href="/sidebar";
                }
                

            }//end if




        }//end of try

        catch(error){
                    document.getElementById("msg").style.visibility="visible";
                    document.getElementById("msg").innerHTML ="No internet connection , please connect to internet first"; 
        }



        
    }
    
}


function get_values_from_fields(){
    const collected_data = {
        "identifier": document.getElementById("username").value,
        "password" : document.getElementById("password").value
    };
    return collected_data;
}



