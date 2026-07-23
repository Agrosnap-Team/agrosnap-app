import handleData from "./tokenDecoding.js";
import DB from "./databaseManager_IndexedDB.js";

async function setInfo(){
    try{
    const user_id = handleData.getUserIdFromToken(localStorage.getItem("user_token"));

    console.log("user_id from token , ",user_id);
    const userDataFromDB = await DB.getUserByID(user_id);
    console.log(userDataFromDB);

    document.getElementById("username").innerHTML=userDataFromDB.username;
    document.getElementById("user-email").textContent = userDataFromDB.email;
    }
    catch(error){
        console.log("No token");
        window.location.href="/sign";
    }
}

export function init(){
    
    setInfo();
}

