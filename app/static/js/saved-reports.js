import db from "./databaseManager_IndexedDB.js";



let reportContainer , allReportsContainer;

export function startSavedReportsPage(reportData){
    let isInitiated =  initiateElements();
    if(!isInitiated)return;
    showReports(reportData);
    
    

}

export async function showReports(reportData){
        let allReports = await checkAllReports();
        sortReports(allReports);
        for(let reportNum=0; reportNum<allReports.length;reportNum++){
            createReportElement(allReports[reportNum]);
            if(reportData != undefined || reportData.length > 0){
                if (allReports[reportNum].report_id== reportData.report_id){
                    console.log('the new report is : ' , allReports[reportNum]);
                    highlightNewSavedReport(allReports[reportNum].report_id);
                }
            
             }
        }

        
    
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
    //console.log("All reports from indexedDB: ", allReports);
    return allReports;
}

function createReportElement(reportData){
    //copy the element with its css styles , children and contents
    let newReportCard = reportContainer.cloneNode(true); 
    let reportName = newReportCard.querySelector("#reportName");
    let createDate = newReportCard.querySelector("#saveDate");
    newReportCard.classList.remove("hideReportCard");
    console.log("this is the copied element  \n" , newReportCard );
    let savedReportDateTime= new Date(reportData.created_at);
    let savedDate = savedReportDateTime.toDateString();
    let savedTime = savedReportDateTime.toTimeString();
    savedReportDateTime = savedReportDateTime.toLocaleString("en-US");

    newReportCard.id=reportData.report_id;
    reportName.innerHTML=reportData.report_name;
    createDate.innerHTML=savedReportDateTime;
    // newReportCard.removeAttribute('id');
    allReportsContainer.appendChild(newReportCard);

}

function deleteReport(reportId){

}

function showReportDetails(reportId){

}

function highlightNewSavedReport(newReportID){
    document.getElementById(newReportID).classList.add("highlightNewReport");

}

function sortReports(reportsData){
    reportsData.sort((firstReport,secondReport) => {
        return new Date(secondReport.created_at) - new Date(firstReport.created_at);
    });
}