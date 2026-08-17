import db from "./databaseManager_IndexedDB.js";



let reportContainer , allReportsContainer;

export function startSavedReportsPage(reportData){
    let isInitiated =  initiateElements();
    if(!isInitiated)return;
    showReports(reportData);
    allReportsContainer.addEventListener('click',function (clickedItem) {
        if(clickedItem.target.classList.contains("more-btn")){
            const parentItem = clickedItem.target.closest(".saved-reports");
            const parentElementID = parentItem.id;
            const deletionStatus = deleteReport(parentElementID);
            if(!deletionStatus)return;
            parentItem.remove();
            console.log(`the report ${parentElementID} has been deleted`);
        }
      });
    
    

}

export async function showReports(reportData){
        let allReports = await checkAllReports();
        sortReports(allReports);
        for(let reportNum=0; reportNum<allReports.length;reportNum++){
            createReportElement(allReports[reportNum]);
            if(reportData != undefined || reportData != null){
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
    let diseasesImages=[
        "/static/images/bacterial_spot.jpeg",
        "/static/images/early_blight.jpg",
        "/static/images/healthy_leaves.jpg",
        "/static/images/late_blight.jpeg",
        "/static/images/leaf_mold.webp",
        "/static/images/YLCV_disease.jpg"
    ];

    let newReportCard = reportContainer.cloneNode(true); 
    let reportName = newReportCard.querySelector("#reportName");
    let createDate = newReportCard.querySelector("#saveDate");
    let reportImage = newReportCard.querySelector("#diseaseImg");
    newReportCard.classList.remove("hideReportCard");
    console.log("this is the copied element  \n" , newReportCard );
    let savedReportDateTime= new Date(reportData.created_at);
    let savedDate = savedReportDateTime.toDateString();
    let savedTime = savedReportDateTime.toTimeString();
    savedReportDateTime = savedReportDateTime.toLocaleString("en-US");

    newReportCard.id=reportData.report_id;
    reportName.innerHTML=reportData.report_name;
    reportImage.src=diseasesImages[reportData.disease_id];
    createDate.innerHTML=savedReportDateTime;
    // newReportCard.removeAttribute('id');
    allReportsContainer.appendChild(newReportCard);

}

async function deleteReport(reportId){

    let isDeleted = await db.delete_report(reportId);
    if(!isDeleted) return isDeleted;
    return isDeleted;

}

function openReport(reportId){

}

function highlightNewSavedReport(newReportID){
    document.getElementById(newReportID).classList.add("highlightNewReport");

}

function sortReports(reportsData){
    reportsData.sort((firstReport,secondReport) => {
        return new Date(secondReport.created_at) - new Date(firstReport.created_at);
    });
}

function showRemoveDialog(){

}

function hideRemoveDialog(){

}