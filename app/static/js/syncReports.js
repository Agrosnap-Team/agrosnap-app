//get reports from indexedDB
//send it to indexedDB
//read the returned result from fastAPI
// if the process succeed then change isSynced to true
// if the process failed then keep it false

import browserDB from "./databaseManager_IndexedDB.js";
import tokenDecodeProcesses from "./tokenDecoding.js";


/* once the user logged in , then we connect with sqlite3 and fetch all reports to indexedDB */
export async function getSavedReportsFromMainDB(token){
    try{
    if(!navigator.onLine){
        alert("no internet connection");
        return;
    }
    alert("connected to internet");
    if(!token)return;
    const response = await fetch("/report",{
    method:"GET",
    headers:{
        "Authorization": `Bearer ${token}`},
    });

    console.log("the response is : " , response.status); 



    // if(!response.ok)
    //     throw new Error(`Failed connection ${response.status}`);

    const allReports = await response.json();
    console.log("The data is " , allReports);
    console.log("All reports has been there " , allReports);


    
  }
  catch(error){
    alert("error with checking connection");
  }

}

function sendReportToMainDB(){

}


function deleteReportsFromMainDB(){

}