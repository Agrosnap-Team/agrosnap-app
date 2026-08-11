import db from "./databaseManager_IndexedDB.js";



let reportContainer , allReportsContainer;

export function startSavedReportsPage(reportData){
    let isInitiated =  initiateElements();
    if(!isInitiated)return;
    showReports(reportData);
    

}

export function showReports(reportData){
    if(reportData == undefined || reportData.length <= 0){
        checkAllReports();
        return;
    }
    console.log("this is showReports() , and the passed reportData is : ",reportData);
    
}

function initiateElements(){
    let definedElements =0;
    reportContainer = document.getElementById("report-card");
    allReportsContainer = document.getElementById("reports-container");

    let elements = {reportContainer , allReportsContainer};
    for(let key in elements){
        if(elements[key] === undefined || elements[key] === null){
            console.log(`this ${key} is null`);
            continue;
        }
        definedElements++;
    }
    if(definedElements == Object.keys(elements).length ){
        console.log("elements have been initiated successfully !");
        return true;
    }
    return false;
}

async function checkAllReports(){
    const allReports = await db.get_all_reports_from_indexedDB();
    console.log("All reports from indexedDB: ", allReports);
}

function createReportElement(){

}

function deleteReport(reportId){

}

function showReportDetails(reportId){

}

function highlightNewSavedReport(reportId){

}