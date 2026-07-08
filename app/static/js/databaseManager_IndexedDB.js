
//to keep the connection open once
let dbConnection;


//these are the tables names  we will create it 
const user_table = "user_info"; 
const disease_table = "diseases_info";
const saved_reports_table = "saved_reports";

async function openConnection() {

    dbConnection = await idb.openDB("Agrosnap_database",2,{

        upgrade(db){
            console.log("DB and connection has been created successfully");
            // here where we create our tables
            create_users_table(db);
            create_disease_table(db);
        }
    });
    
}


function create_users_table(db){

    //check first that the table isn't exist
    if(!db.objectStoreNames.contains(user_table)){

        //the command of creating new table with primary key [keyPath]
        const userTable = db.createObjectStore(user_table,{keyPath:"user_id"});


        //to enable us to query in many keys instead of only the keyPath 
        userTable.createIndex("username","username");
        userTable.createIndex("user_email","email");

    }
}



function create_disease_table(db){
    if(!db.objectStoreNames.contains(disease_table)){
        const diseaseTable = db.createObjectStore(disease_table, {keyPath:"disease_id"});
    }
}




openConnection();



