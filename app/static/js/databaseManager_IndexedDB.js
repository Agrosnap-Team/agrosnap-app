
import { openDB } from "/node_modules/idb/build/index.js";
//to keep the connection open once
let dbConnection;


//these are the tables names  we will create it 
const user_table = "user_info"; 
const disease_table = "diseases_info";
const saved_reports_table = "saved_reports";
const report_details = "report_details";
const deleted_report_table = "deleted_reports";

console.log("IndexedDB file loaded");


//==========================================================
// will use for create the db and open a connection
//==========================================================

async function openConnection() {


    try{
        console.log("Opening database...");

        if(!dbConnection){

            dbConnection = await openDB("AgrosnapBrowserDatabase", 1 ,{

            upgrade(db){
            console.log("Creating tables...");

            console.log("DB , tables and connection has been created successfully");
            // here where we create our tables
            create_users_table(db);
            create_disease_table(db);
            create_saved_reports(db);
            create_deleted_reports(db);
                
            }

        });  

        }//end if 

        return dbConnection;


    }

    catch(error){
        console.log("something went wrong in connection " );
    }
}



//==========================================================
// Create the needed tables which are already in sqlite3
//==========================================================

async function create_users_table(db){

    //user_id , username , email , first name , last name

    //check first that the table isn't exist
    if(!db.objectStoreNames.contains(user_table)){

        //the command of creating new table with primary key [keyPath]
        const userTable = db.createObjectStore(user_table,{keyPath:"user_id"});


        //to enable us to query in many keys instead of only the keyPath
        //{   the index we used   ,   the key in json that returned from fastAPI    }
        userTable.createIndex("username","username",{unique:true});
        userTable.createIndex("user_email","email",{unique:true});

    }
}



async function create_disease_table(db){
    if(!db.objectStoreNames.contains(disease_table)){
        const diseaseTable = db.createObjectStore(disease_table, {keyPath:"disease_id"});
    }
}


async function create_saved_reports(db){
    if(!db.objectStoreNames.contains(saved_reports_table)){

        const saved_report = db.createObjectStore(saved_reports_table,{keyPath:"save_id"});

    }

}




async function create_deleted_reports(db){
    if(!db.objectStoreNames.contains(deleted_report_table)){
        const deletedReports = db.createObjectStore(deleted_report_table,{keyPath:"save_id"});
    }

}




//==========================================================
// ADD from sqlite3 to indexedDB
//==========================================================


async function add_new_user(newData){

    try{
        

        if (newData){

            const db = await openConnection();
            //Permission 
            const trans = db.transaction(user_table,'readwrite');
            const current_table = trans.objectStore(user_table);
            await   current_table.put(newData);
            
            console.log("added succesfully");
            await trans.done; //end the transaction
        }

        else{
            console.log("there is no data to add");
        }

    }

    catch(e){
        console.log("something went wrong " , e);
    }
}


async function add_disease_info(all_diseases) {
    //After got the disease from fastAPI we add it to indexedDB
    try{
        if(all_diseases){
            const db = await openConnection();    
            const trans = db.transaction(disease_table,"readwrite");
            const current_table = trans.objectStore(disease_table);

            await Promise.all( all_diseases.map(  row => current_table.put(row)  ) );

            trans.done;
            console.log("add all successfully");

        }

    }
    catch(error){
        console.log("Adding disease failed , " , error.message);
    }

    
}

async function add_deleted_reports(reportID){
    try{


        if(reportID){
            console.log("the report id is: " , reportID);
            const db = await openConnection();
            const trans = await db.transaction(deleted_report_table,"readwrite");
            const current_table = await trans.objectStore(deleted_report_table);
            const deletedReport = { save_id: reportID };  //convert it to object
            await   current_table.put(deletedReport);

            trans.done;
            const deletionStatus = await delete_report(reportID);
            if(deletionStatus){
                console.log("Report deleted successfully");
                // await deleteReportPermenantly(reportID);
                return true;
            }
            return true;
            
        }
        else{
            console.log(`there is no report with ${reportID} exist `);
            return false;
        }

    }

    catch(error){

        console.log("Deleting failed , ",error.message);
        return false;

    }

}


//==========================================================
// ADD reports to indexedDB
//==========================================================


async function store_report(report_data){
    try{
        if(report_data == null || report_data==undefined)return;
        const db = await openConnection();
        const trans = db.transaction(saved_reports_table,"readwrite");
        const current_table = trans.objectStore(saved_reports_table);

        await current_table.put(report_data);
        trans.done;
        return true;

    }
    catch(error){

        console.log("something went wrong while sending report to indexedDB , " ,error);
        return false;
    }
      

}




async function get_all_reports_from_indexedDB(){
    //will return all saved reports from indexedDB and will be used in the saved reports page
    const db = await openConnection();
    const trans = db.transaction(saved_reports_table, "readonly");
    const current_table = trans.objectStore(saved_reports_table);
    const allReports = await current_table.getAll();
    trans.done;
    return allReports;
}

async function get_report_by_id(report_id){
    const db = await openConnection();
    const trans = db.transaction(saved_reports_table, "readonly");
    const current_table = trans.objectStore(saved_reports_table);
    const report = await current_table.get(report_id);
    trans.done;
    return report;
}


async function get_all_deleted_reports() {
    const db = await openConnection();
    const trans = db.transaction(deleted_report_table, "readonly");
    const current_table = trans.objectStore(deleted_report_table);
    const allDeletedReports = await current_table.getAll();
    trans.done;
    return allDeletedReports;

}
//==========================================================
// This for get information from Sqlite3
//==========================================================


async function prepareDataAndStoreIt(user_info){

    const db = await openConnection();
    let new_user ={
        "user_id":user_info.user_id,
        "username":user_info.username,
        "email" : user_info.email,
        "first_name" : user_info.first_name,
        "last_name":user_info.last_name

    } 
    
    //we get the diseases from FastAPI
    const all_disease = [
        {"disease_id":0,"disease_name":"Bacterial Spot","report":"this is the report of Bacterial Spot disease and dummy data","treatment":"this is the Bacterial Spot treatment section"},
        {"disease_id":1,"disease_name":"Early Blight","report":"this is the report of  early blight disease and dummy data","treatment":"this is the early blight treatment section"},
        {"disease_id":2,"disease_name":"Healthy","report":"this is the report of healthy disease and dummy data","treatment":"this is the Healthy treatment section"},
        {"disease_id":3,"disease_name":"Late Blight","report":"this is the report of Late Blight disease and dummy data","treatment":"this is the Late Blight treatment section"},
        {"disease_id":4,"disease_name":"Leaf Mold","report":"this is the report of  Leaf Mold disease and dummy data","treatment":"this is the Leaf Mold treatment section"},
        {"disease_id":5,"disease_name":"Yellow Leaf Curl Virus","report":"this is the report of Yellow Leaf Curl Virus disease and dummy data","treatment":"this is the Yellow Leaf Curl Virus treatment section"}
    ];//this is fake data

    await add_disease_info(all_disease);
    console.log("this is the user info which prepared : \n",new_user);

    await add_new_user(new_user);
    console.log("the user has been added to indexedDB");
}



async function getUserByID(userID) {
    try{
        if(!userID)return;
        const db = await openConnection();

        const trans = db.transaction(user_table,"readonly");
        const current_table = trans.objectStore(user_table);

        const userData = await current_table.get(userID);

        trans.done;

        if(!userData)return;

        return userData;

    }
    catch(error){
        console.log("something went wrong while fetching user data , ",error);
    }
    
}


async function get_diseases_info(diseaseIndex) {

    try{
        if(diseaseIndex == null || diseaseIndex==undefined)return;
        const db = await openConnection();
        const trans = db.transaction(disease_table,"readonly");
        const current_table = trans.objectStore(disease_table);

        const diseaseData = await current_table.get(diseaseIndex);
        console.log("this is disease : " , diseaseData);
        trans.done;

        if(!diseaseData)return;

        return diseaseData;




    }
    catch(e){

        console.log("something went error when fetching disease data , " ,e);

    }

    
}


async function get_saved_reports() {
    //this method to get all saved reports from indexedDB and will be used in the saved reports page
    
}



//==========================================================
// Delete from tables
//==========================================================
async function delete_user(user_id){

    try{
        const db = await openConnection();
        if(!user_id){
            console.log("this user ID is not exist");
            return
        }
        const trans = db.transaction(user_table,"readwrite");
        const current_table = trans.objectStore(user_table);

        await current_table.delete(user_id);

        await trans.done;
        console.log("deleted successfully");
    }
    catch(error){
        console.log("deletion failed , " ,error);
    }


}

async function delete_report(report_id){

    try{
        const db = await openConnection();
        if(get_report_by_id(report_id)){
            const trans = db.transaction(saved_reports_table,"readwrite");
            const current_table = trans.objectStore(saved_reports_table);

            await current_table.delete(report_id);
            await trans.done;

            console.log("report deleted successfully");
            return true;

        }
        else{
            console.log("this report is not found !");
            return false;
        }


    }
    catch(error){
        console.log(" Report deletion failed , " ,error);
        return false;

    }


}

async function clear_DB_tables(){
    try{
        const db = await openConnection();
        const trans =await  db.transaction([user_table, saved_reports_table, deleted_report_table , disease_table],"readwrite");
        const current_table =await trans.objectStore(saved_reports_table);
        await Promise.all([
            trans.objectStore(user_table).clear(),
            trans.objectStore(saved_reports_table).clear(),
            trans.objectStore(deleted_report_table).clear(),
            trans.objectStore(disease_table).clear()
        ]);

        trans.done;
        return true

        

    }
    catch(error){
        alert(error.message);
        return false;
    }
}

async function deleteReportPermenantly(reportId) {
    try{

        if(!reportId) return false;
        const db = await openConnection();
        const trans = await db.transaction(deleted_report_table,"readwrite");
        const current_table = trans.objectStore(deleted_report_table);

        await current_table.delete(reportId);
        await trans.done;

        return true;

    }
    catch(error){
        return false;
    }
    
}






//==========================================================
// Start the info and this will export to dynamic.js 
//==========================================================

async function startDB() {

    await openConnection();
    
}

startDB();





export default {
    add_new_user,
    add_disease_info,
    get_diseases_info,
    prepareDataAndStoreIt,
    get_saved_reports,
    getUserByID,
    delete_user,
    store_report,
    get_all_reports_from_indexedDB,
    delete_report,
    get_report_by_id,
    add_deleted_reports,
    clear_DB_tables,
    get_all_deleted_reports,
    deleteReportPermenantly
}