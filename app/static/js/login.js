
import handleData from "./tokenDecoding.js";
import DB from "./databaseManager_IndexedDB.js";
import { getSavedReportsFromMainDB , syncDiseases } from "./syncReports.js";


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
                    console.log("the response is not ok ");
        
                    let errorMessage;
                    if(Array.isArray(result.detail)){ //pyndatic errors
                        errorMessage=result.detail[0].msg;
                        console.log("this is error");
                    }
                    else{
                        errorMessage=result.detail;
                    }
                    document.getElementById("msg").style.visibility="visible";
                    document.getElementById("msg").innerHTML = errorMessage; 
                    return;
                }

                console.log("THIS IS THE RESULT OF TOKENS AFTER LOGIN: ", result);
                if(result.create_token){
                    console.log("token is exist " , result.create_token);
                    console.log("user info is exist " , result.user_info);

                    localStorage.setItem("user_token",result.create_token);
                    localStorage.setItem("other_info",JSON.stringify(result.user_info));
                    

                    const decodedData = handleData.decodeToken(result.create_token);
                    console.log("this is the decoded data from create_token : ",decodedData);

                    //collect data in one object to store it in indexedDB
                    let allUserData = {
                        user_id: decodedData.user_id,
                        username: decodedData.username,
                        email: decodedData.Email,
                        first_name: result.user_info.first_name,
                        last_name: result.user_info.last_name,
                        exp: decodedData.exp
                    };

                    console.log("Start sync the data");

                    //sync data from sqlite3 to indexedDB
                    const allSavedReports = await getSavedReportsFromMainDB(localStorage.getItem("user_token"));

                    if(allSavedReports.success){
                        console.log("all saved reports that fetched from sqlite3 " , allSavedReports.data );                   
                        await DB.prepareDataAndStoreIt(allUserData); //store all user data in indexedDB
                        
                    }
                    
                    //store all user data in indexedDB


                    // alert("redirecting...");
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





