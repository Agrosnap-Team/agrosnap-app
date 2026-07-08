
//to keep the connection open once
let dbConnection;


//these are the tables names  we will create it 
const user_table = "user_info"; 
const disease_table = "diseases_info";
const saved_reports_table = "saved_reports";
const report_details = "report_details";



//will use for create the db and open a connection
async function openConnection() {

    dbConnection = await idb.openDB("Agrosnap_database",2,{

        upgrade(db){
            console.log("DB and connection has been created successfully");
            // here where we create our tables
            create_users_table(db);
            create_disease_table(db);
            create_saved_reports(db);
            create_reports_details(db)
            
        }
    });
    
}


function create_users_table(db){

    //check first that the table isn't exist
    if(!db.objectStoreNames.contains(user_table)){

        //the command of creating new table with primary key [keyPath]
        const userTable = db.createObjectStore(user_table,{keyPath:"user_id"});


        //to enable us to query in many keys instead of only the keyPath 
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




openConnection();



