//get reports from indexedDB
//send it to indexedDB
//read the returned result from fastAPI
// if the process succeed then change isSynced to true
// if the process failed then keep it false

import browserDB from "./databaseManager_IndexedDB.js";


/* once the user logged in , then we connect with sqlite3 and fetch all reports to indexedDB */
export async function getSavedReportsFromMainDB(token){
    try{
    if(!navigator.onLine){ //check connection , but not enough
        return {success:false , data:[]};
    }
    if(!token)return {sucecss:false , data:[]};

    //send a request to fastAPI to get all saved reports in sqlite3
    const response = await fetch("/report",{
    method:"GET",
    headers:{
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
    });


    if(!response.ok)
        throw new Error(`Failed connection ${response.status}`);

    //get all previously saved reports from sqlite3
    const allReports = await response.json();
    if(allReports.length<=0)return {success:true , data:[]}; // if no reports are in sqlite3
    console.log('The returned reports' , allReports);
    let syncedReports=[]; // put reports together

    for(let perReport =0 ; perReport<allReports.length;perReport++){
       let signleSyncedReport = markedReportisSynced(allReports[perReport]); // change isSynced = true
       syncedReports.push(signleSyncedReport); //add the report to array [] 
    }
    console.log("the syncedReport before send to indexedDB , " , syncedReports);
    const isStored = await storeInIndexedDB(syncedReports);
    
    
    return {success:true , data :syncedReports};

  }
  catch(error){
    alert("error with checking connection " , error.message);
    return {success:false , data:[]}
  }

}

async function sendReportToMainDB(token , savedReports){
  // send token in header 
  // send savedReports in body
  // check the status if success or not
  // change the isSynced to true , which means the reports stored in sqlite3 successfully
  try{
    const savedReportJson={
      save_id:savedReports.save_id,
      disease_id: parseInt(savedReports.disease_id)+1,
      plant_name :savedReports.plant_name,
      confidence : parseFloat(savedReports.confidence),
      created_at: new Date(savedReports.created_at).toISOString()
    }

    console.log(savedReportJson.created_at , `The type ${typeof(savedReportJson.created_at)}`);

    if(!navigator.onLine)return false; //check connectio
    console.log("connected to internet");

      const response = await fetch("/save",{
        method:'POST',
        headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(savedReportJson)
      }); // send report info to sqlite3 by fastAPI

    
    

    if(!response.ok){
      let errorDetails = await response.json();
      throw new Error(`Couldn't save to main database, Status: ${response.status}, The error is: ${JSON.stringify(errorDetails)}`);
      
    }
    const isSaved = await response.json();
    console.log(`isSaved ?` , isSaved); //return the response and the status on request
    if(isSaved.status == 'success'){
      console.log(`marked as synced ${markedReportisSynced(savedReportJson)}`);
      await browserDB.store_report(markedReportisSynced(savedReportJson));
      return true
    }
    return false

  }
  catch(error){
    console.log("failed to save , " , error.message);
    return false;
  }







}


async function deleteReportsFromMainDB(token,reportID){
  try{
    //make it just for one report
    //send request with token and report id
    
    if(reportID){
      const response = await fetch(`/delete-report/${reportID}`,
        {
        method:'DELETE',
        headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        
        }
      );
      if(!response.ok)return false;
      console.log(`response of delete ${response.status}`);
      const deletedResult = await response.json();
      if(deletedResult.status =='success'){
        console.log("the report deleted successfully");
        let permenant = await browserDB.deleteReportPermenantly(reportID);
        console.log("the permenant ? " , permenant);
        return true;
      }
      return false;
    }
    else{
      console.log (`This report id ${reportID} is not exist or empty`);
      return false;
    }
    
    //delete it from indexedDB [ report table]
    //make sure it deleted from sqlite3
    //clear delete table
    //sync to commit changes
  }
  catch(error){
    console.log(`Deletion failed in sqlite3 side , ${error.message}`);
    return false;
  }
  
  

}


async function storeInIndexedDB(allSavedReportsInDB) {
  try{
    console.log("you are in storeInIndexedDB , the passed report ", allSavedReportsInDB);

    for(let reportNum =0 ; reportNum<allSavedReportsInDB.length; reportNum++){

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

function markedReportisSynced(perReport){
      const theReports={
      save_id:perReport.save_id,
      disease_id: parseInt(perReport.disease_id)-1,
      plant_name :perReport.plant_name,
      confidence : parseFloat(perReport.confidence),
      created_at: new Date(perReport.created_at).toISOString(),
      isSynced : true
    };

    return theReports;
}


async function syncReports(){
    //connect to sqlite3 
    //check if any report is not synced

    const userCurrent = localStorage.getItem("user_token");


    //checking the out of synced reports
    let outOfSyncedReport=[];
    let allReports = await browserDB.get_all_reports_from_indexedDB();

    for(let reportNum=0;reportNum< allReports.length;reportNum++){
        if(allReports[reportNum].isSynced==true)continue;
        outOfSyncedReport.push(allReports[reportNum]);
        await sendReportToMainDB(userCurrent,allReports[reportNum]);
    }

    //check if there any deleted reports
    let allDeletedReports = await browserDB.get_all_deleted_reports();
    console.log("The deleted reports " , allDeletedReports);
    for(let reportNum =0 ; reportNum<allDeletedReports.length; reportNum++){
      console.log("in deletion loop");
        let isDeleted = await deleteReportsFromMainDB(userCurrent,allDeletedReports[reportNum].save_id); 
        console.log("the deletion is ", isDeleted);
    }


    let serverReports = await getSavedReportsFromMainDB(userCurrent);
    let indexedDBReports = await browserDB.get_all_reports_from_indexedDB();

    //check before complete the sync
    if (!serverReports.success) {
    console.log("Could not fetch server reports. Skipping server synchronization.");
    return;
    }


    console.log("SERVER REPORTS : " , serverReports.data);
    console.log("INDEXEDDB REPORTS : " , indexedDBReports);
    let setOfReportsID = creatSetOfReports(serverReports.data); //send server reports [ sqlite3 reports ] and get the set of reports with ID only

 

    //compare the differences of indexedDB reports and sqlite3 reports
    for (let reportIndex =0;reportIndex<indexedDBReports.length;reportIndex++){
      let this_report = indexedDBReports[reportIndex]
      if(setOfReportsID.has(this_report.save_id))continue;
      if(this_report.isSynced===true) await browserDB.delete_report(this_report.save_id);
      
    }


    //check if any new changes should be reflected on indexedDB
    // await getSavedReportsFromMainDB(userCurrent);
    console.log("The out of suync reports are",outOfSyncedReport);

}


//this method to check if any report has been deleted by other devices for the same account
function creatSetOfReports(serverReports){

  //create a set of server reports id
  const setOfServerReports = new Set(serverReports.map(currentReport => currentReport.save_id));
  console.log("this is the server reports set -> " , setOfServerReports);

  return setOfServerReports;

}



export default {
  deleteReportsFromMainDB,
  sendReportToMainDB,
  getSavedReportsFromMainDB,
  syncReports
}

