
//to keep the connection open once
let dbConnection;


//these are the tables names  we will create it 
const user_table = "user_info"; 
const disease_table = "diseases_info";
const saved_reports_table = "saved_reports";
const report_details = "report_details";




//==========================================================
// will use for create the db and open a connection
//==========================================================

async function openConnection() {

    try{

        dbConnection = await idb.openDB("Agrosnap_database", 2 ,{

            upgrade(db){

                console.log("DB and connection has been created successfully");
                // here where we create our tables
                create_users_table(db);
                create_disease_table(db);
                create_saved_reports(db);
                create_reports_details(db);
                
            }

        });  
    }

    catch(error){
        console.log("something went wrong in connection " , e);
    }
}



//==========================================================
// Create the needed tables which are already in sqlite3
//==========================================================

function create_users_table(db){

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





function create_disease_table(db){
    if(!db.objectStoreNames.contains(disease_table)){
        const diseaseTable = db.createObjectStore(disease_table, {keyPath:"disease_id"});
    }
}




function create_saved_reports(db){
    if(!db.objectStoreNames.contains(saved_reports_table)){

        const saved_report = db.createObjectStore(saved_reports_table,{keyPath:"report_id"});

    }

}




function create_reports_details(db){

        if(!db.objectStoreNames.contains(report_details)){

        const saved_report = db.createObjectStore(report_details,{keyPath:"unique_report"});

        saved_report.createIndex("reports_id_group","reports_id",{unique:false});

    }

}





//==========================================================
// ADD from sqlite3 to indexedDB
//==========================================================


async function add_new_user(db,newData){

    try{

        if (newData){

            //Permission 
            const trans = db.transaction(user_table,'readwrite');
            const current_table = trans.objectStore(user_table);
            await   current_table.put(newData);
            
            console.log("added succesfully");
            const the_new_user_id = await current_table.get(1);
            console.log("his Id is " , the_new_user_id);
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


async function add_disease_info(db,all_reports) {
    //After got the disease from fastAPI we add it to indexedDB
    if(all_reports){
    const trans = db.transaction(disease_table,"readwrite");
    const current_table = trans.objectStore(disease_table);

    await Promise.all(  all_reports.map(  row => current_table.put(row)  ) );

    trans.done;
    console.log("add all successfully");

    }





    
    
}


async function add_saved_disease(db,all_saved_disease) {

    //will all saved disease
    
}


//==========================================================
// This for get information from Sqlite3
//==========================================================


async function get_new_user_info(db){
    let new_user ={
        "user_id":1,
        "email" : "aseel@gmail.com",
        "first_name" : "ASEEL",
        "last_name":"KHANFER",
        "password":"123456"

    } //this data for test only and will be replaced by data from sqlite3 using fetch() method

    await add_new_user(db,new_user);
}






async function get_diseases_info(db) {

    //we get the diseases from FastAPI
    const all_disease = [
        {"disease_id":0,"disease_name":"leaf_mold","report":"this is the report of disease and dummy data","treatment":"this is the treatment section"},
        {"disease_id":1,"disease_name":"early_blight","report":"this is the report of  early blight disease and dummy data","treatment":"this is the rearly blight treatment section"},
        {"disease_id":2,"disease_name":"late_blight","report":"this is the report of late blight disease and dummy data","treatment":"this is the late blight treatment section"}
    ];//this is fake data

    add_disease_info(db,all_disease);


    
}


async function get_saved_reports(db) {


    
}






//==========================================================
// Start the info and this will export to dynamic.js 
//==========================================================

async function start() {

    await openConnection();
    await get_new_user_info(dbConnection);
    await get_diseases_info(dbConnection);
    
}

start();



