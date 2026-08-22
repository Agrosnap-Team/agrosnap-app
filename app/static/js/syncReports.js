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
        return false;
    }
    alert("connected to internet");
    if(!token)return false;
    const response = await fetch("/report",{
    method:"GET",
    headers:{
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
    });

    console.log("the response is : " , response.status); 



    if(!response.ok)
        throw new Error(`Failed connection ${response.status}`);

    const allReports = await response.json();
    console.log("All reports has been there " , allReports);
    if(allReports.length<=0)return false; // if no reports are in sqlite3
    const isStored = await storeInIndexedDB(allReports);
    return isStored;


    
    

  }
  catch(error){
    alert("error with checking connection " , error.message);
    return false
  }

}

async function sendReportToMainDB(token , savedReports){
  // send token in header 
  // send savedReports in body
  // check the status if success or not
  // change the isSynced to true , which means the reports stored in sqlite3 successfully
  try{
    const savedReportJson={
      save_id:savedReports.report_id,
      disease_index: parseInt(savedReports.disease_id)+1,
      plant_name :savedReports.report_name,
      confidence : parseFloat(savedReports.confidence),
      created_at: new Date(savedReports.created_at).toISOString()
    }

    console.log(savedReportJson.created_at , `The type ${typeof(savedReportJson.created_at)}`);

    if(!navigator.onLine)return false;
    console.log("connected to internet");
    const response = await fetch("/save",{
      method:'POST',
      headers:{
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },
      body:JSON.stringify(savedReportJson)
    });

    
    

    if(!response.ok)
      throw new Error(`Couldn't save to main database , ${response.status} ,the error is :   ${ await response.json()}`);

    const isSaved = await response.json();
    console.log(`isSaved ?` , isSaved);
    if(isSaved.status == 'success'){
      console.log("report saved to sqlite3");
      return true
    }
    return false

  }
  catch(error){
    console.log("failed to save , " , error.message);
    return false;
  }







}


async function deleteReportsFromMainDB(){

}


async function storeInIndexedDB(allSavedReportsInDB) {
  try{
    console.log("you are in storeInIndexedDB , the passed report ", allSavedReportsInDB);

    for(let reportNum =0 ; reportNum<allSavedReportsInDB.length; reportNum++){
      console.log("you are in storeInIndexedDB in loop");

      const isStored = await browserDB.store_report( allSavedReportsInDB[ reportNum ] );
      if(!isStored){
        throw new Error(`can't save this report ${  allSavedReportsInDB[ reportNum ]  } `);
      }
      console.log(`report ${allSavedReportsInDB[reportNum]} has been saved`)
      
    }

    return true;

  }
  catch(error){
    console.log("Can't store in indexedDB , " , error.message); 
    return false;
  }
  
}

export default {
  deleteReportsFromMainDB,
  sendReportToMainDB,
  getSavedReportsFromMainDB
}

