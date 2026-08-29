//get reports from indexedDB
//send it to indexedDB
//read the returned result from fastAPI
// if the process succeed then change isSynced to true
// if the process failed then keep it false

import browserDB from "./databaseManager_IndexedDB.js";


/* once the user logged in , then we connect with sqlite3 and fetch all reports to indexedDB */
export async function getSavedReportsFromMainDB(token){ //return the sataus of the sqlite3 connection process
  try{
    if(!navigator.onLine){ //check connection , but not enough
        return {success:false , data:[] , details:"no internet connection" , responseStatus:0};
    }
    if(!token)return {sucecss:false , data:[] , details:"token is not exist" , responseStatus:401}; //when no token exist

    //send a request to fastAPI to get all saved reports in sqlite3
    const response = await fetch("/report",{
    method:"GET",
    headers:{
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
    });


    if(!response.ok){
        const errorData = await response.json();
        console.log("SQLITE3 ERRORS");
        console.log(response.status);
        console.log(errorData.detail);
        return {success:false ,
          details: errorData.detail,
          responseStatus:response.status
        }
    }

    //get all previously saved reports from sqlite3
    const allReports = await response.json();
    if(allReports.length<=0)return {success:true , data:[] , details:"No data",responseStatus:200}; // if no reports are in sqlite3
    console.log('The returned reports' , allReports);
    let syncedReports=[]; // put reports together

    for(let perReport =0 ; perReport<allReports.length;perReport++){
       let signleSyncedReport = markedReportisSynced(allReports[perReport]); // change isSynced = true
       syncedReports.push(signleSyncedReport); //add the report to array [] 
    }
    console.log("the syncedReport before send to indexedDB , " , syncedReports);
    const isStored = await storeInIndexedDB(syncedReports);
    
    
    return {success:true , data :syncedReports , responseStatus:200 , details:"Data fetched"};

  }
  catch(error){
    // alert("error with checking connection " + error.message);
    return {success:false , data:[] , details:error.message , responseStatus:500}
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

    if(!navigator.onLine)return {success:false , data:[] , details:"no internet connection" , responseStatus:0}; //check connectio
    console.log("connected to internet");


    //check the existance of token before send any request
    if(!token)return {success:false , data:[] , details:"token is not exist" ,responseStatus:401}; //when no token exist

    //send request to server will report info
    const response = await fetch("/save",{
      method:'POST',
      headers:{
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },
      body:JSON.stringify(savedReportJson)
    }); // send report info to sqlite3 by fastAPI

    
    

  if(!response.ok){
      const errorData = await response.json();
      console.log("SQLITE3 ERRORS");
      console.log(response.status);
      console.log(errorData.detail);
      return {success:false ,
        details: errorData.detail,
        responseStatus:response.status
      }
    }


    const isSaved = await response.json();
    if(isSaved.status == 'success'){
      console.log(`marked as synced ${markedReportisSynced(savedReportJson)}`);
      await browserDB.store_report(markedReportisSynced(savedReportJson));
      return {success:true , details:"Saved successfully",responseStatus:200};
    }
    return {success:false , details:isSaved.detail , responseStatus:isSaved.status};

  }
  catch(error){
    console.log("failed to save , " , error.message);
    return {success:false , details:error.message  ,responseStatus:500};
  }


}


async function deleteReportsFromMainDB(token,reportID){
  try{
    //make it just for one report
    //send request with token and report id

    //check the existance of token before send any request
    if(!token)return {sucecss:false , data:[] , details:"token is not exist" ,responseStatus:401}; //when no token exist
    
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
      if(!response.ok){
        const errorData = await response.json();
        return {success:false ,
          details: errorData.detail,
          responseStatus:response.status
      }
      }
      console.log(`response of delete ${response.status}`);
      const deletedResult = await response.json();
      if(deletedResult.status =='success'){
        console.log("the report deleted from main DB successfully");
        let permenant = await browserDB.deleteReportPermenantly(reportID);
        if(permenant)
          return {success:true , details:deletedResult.message , responseStatus:200};
        return {success:false , details:deletedResult.detail , responseStatus:deletedResult.status};
      }
      return {success:false , details:deletedResult.detail , responseStatus:deletedResult.status};
    }
    else{
      console.log (`This report id ${reportID} is not exist or empty`);
      return { success:false , details:"Token is not exist" ,responseStatus:404};
    }
    
    //delete it from indexedDB [ report table]
    //make sure it deleted from sqlite3
    //clear delete table
    //sync to commit changes
  }
  catch(error){
    console.log(`Deletion failed in sqlite3 side , ${error.message}`);
    return { success:false , details:error.message , responseStatus:500};
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
      console.log("report" , " allSavedReportsInDB[reportNum] " , "has been saved")
      
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



let syncPromise = null; //to store the cuurent sync process here to prevent multi call of sync

//The actual sync method
async function syncProcess() {

    const userCurrent = localStorage.getItem("user_token");


    //checking the out of synced reports
    let outOfSyncedReport=[];
    let allReports = await browserDB.get_all_reports_from_indexedDB();
    if(allReports.length<=0) //no reports saved yet
      console.log(`No saved Reports`);

    //loop for sync any out of sync reports and store it in sqlite3
    for(let reportNum=0;reportNum< allReports.length;reportNum++){

      //skip any synced reports , which means this is already stored in sqlite3
        if(allReports[reportNum].isSynced==true)continue; 
        outOfSyncedReport.push(allReports[reportNum]);
        const isSent = await sendReportToMainDB(userCurrent,allReports[reportNum]);

        // 401 means unauthorized , so the token could be expired or not exist
        if(!isSent.success && isSent.responseStatus===401) 
          return{success:false , details:isSent.details , responseStatus:isSent.responseStatus }

    }
    console.log("The out of sync reports are",outOfSyncedReport);  

    //check if there any deleted reports stored in delete table
    let allDeletedReports = await browserDB.get_all_deleted_reports();
    console.log("The deleted reports " , allDeletedReports);
    for(let reportNum =0 ; reportNum<allDeletedReports.length; reportNum++){
      console.log("in deletion loop");
        let isDeleted = await deleteReportsFromMainDB(userCurrent,allDeletedReports[reportNum].save_id); 

        /*================================================================
        This when the user create and delete the report in offline mode , so this deleted report will not reach the
        server , so when fastAPI try to find it in sqlite3 it will not be found to delete , so just 
        delete it from indexedDB in delete table
        ===================================================================*/
        
        if(!isDeleted.success && isDeleted.responseStatus === 404){
          console.log('Failed to delete : ',isDeleted.details);
          await browserDB.deleteReportPermenantly(allDeletedReports[reportNum].save_id);
          // return{success:false , details:isDeleted.details , responseStatus:isDeleted.status }
        }
    }


    let serverReports = await getSavedReportsFromMainDB(userCurrent);
    let indexedDBReports = await browserDB.get_all_reports_from_indexedDB();

    //check before complete the sync
    if (!serverReports.success) {
    console.log("Could not fetch server reports. Skipping server synchronization.");
    console.log("Please re-sign again ");
    console.log(serverReports.details);
    return {success:false, details:serverReports.details, responseStatus:serverReports.responseStatus};
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

    return{success:true, responseStatus:200 , details:"synced successfully"}


    //check if any new changes should be reflected on indexedDB
    // await getSavedReportsFromMainDB(userCurrent);


}



//this to prevent calling the sync method many time at the same time , so the sync method called then the other sync call will not start syncronization until the sync end
async function syncReports(){


  if(syncPromise){
    console.log("Sync already running...");
    return syncPromise;
  }

  syncPromise = syncProcess();
  try {
        console.log("Sync is under proceessing")
        return await syncPromise;
    }
    finally {
        syncPromise = null;
    }


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

