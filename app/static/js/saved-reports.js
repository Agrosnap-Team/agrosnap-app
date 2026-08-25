import db from "./databaseManager_IndexedDB.js";
import {showScanButton , show_report} from "./dynamic_pages.js";
import sync from "./syncReports.js";



let reportContainer , allReportsContainer , noContentMsg , dialogContainer , deletionDialog , closeDialogIcon , confirmDeletionButton , cancelDeletionButton , reportToDelete , clickedReportCard;

export async function startSavedReportsPage(reportData){
    showScanButton();
    await sync.syncReports(); //get the newest update from sqlite3
    let isInitiated =  initiateElements();
    if(!isInitiated)return;
    showReports(reportData);
    allReportsContainer.addEventListener('click',async function (clickedItem) {
        if(clickedItem.target.classList.contains("more-btn")){
            const parentItem = clickedItem.target.closest(".saved-reports");
            reportToDelete = parentItem;             

            showDeleteDialog();

        }

        else if(clickedItem.target.closest(".saved-reports")){
            clickedReportCard = clickedItem.target.closest(".saved-reports");
            openReport(clickedReportCard.id);


        }
      });

    confirmDeletionButton.addEventListener('click',async function(){
            console.log(" confirm clicked !!");
            console.log("the delete report ", reportToDelete);
        
            const deletionStatus = await deleteReport(reportToDelete.id);
            if(!deletionStatus)return `deleted status ${deletionStatus}`;
            hideDeleteDialog();
            reportToDelete.classList.add("removeReportCardWithAnimation");
            reportToDelete.addEventListener('animationend',async function(){
                console.log("done");
                reportToDelete.remove();
                let remainReports = await checkAllReports();
                console.log(`the report ${reportToDelete.id} has been deleted`);
                console.log("the remain reports : ", remainReports);
                reportToDelete = null;
            });

            await sync.syncReports();



        });

        cancelDeletionButton.addEventListener('click',hideDeleteDialog);
        closeDialogIcon.addEventListener('click',hideDeleteDialog);

}

export async function showReports(reportData){
        //synced first if any new reports should store from sqlite3 , in case if any report added from different device
        let allReports = await checkAllReports();
        if (allReports && allReports.length > 0){
            hideNoContentMsg();
            sortReports(allReports);
            for(let reportNum=0; reportNum<allReports.length;reportNum++){
                createReportElement(allReports[reportNum]);
                if(reportData != undefined || reportData != null){
                    if (allReports[reportNum].save_id== reportData.save_id){
                        console.log('the new report is : ' , allReports[reportNum]);
                        highlightNewSavedReport(allReports[reportNum].save_id);
                    }
                
                }
            }
    }
    else{
        showNoContentMsg();
    }

}

function initiateElements(){
    let definedElements =0;
    reportContainer = document.getElementById("report-card");
    allReportsContainer = document.getElementById("reports-container");
    noContentMsg = document.getElementById("no-content");
    dialogContainer = document.getElementById("deleteReportContainer");
    deletionDialog = document.getElementById("confirmDeletionDialog");
    closeDialogIcon = document.getElementById("deleteReportCloseIcon");
    confirmDeletionButton=document.getElementById("confirmDeletion");
    cancelDeletionButton=document.getElementById("cancelDeletion");

    let elements = {reportContainer , allReportsContainer , noContentMsg , dialogContainer , deletionDialog , closeDialogIcon , confirmDeletionButton,cancelDeletionButton};
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

export async function checkAllReports(){
    const allReports = await db.get_all_reports_from_indexedDB();
    console.log("this is check , and the reports is : " , allReports);
    if(allReports.length<=0){
        console.log("no reports remained");
        showNoContentMsg();}
    else hideNoContentMsg();
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
    let savedReportDateTime= new Date(reportData.created_at);
    let savedDate = savedReportDateTime.toDateString();
    let savedTime = savedReportDateTime.toTimeString();
    savedReportDateTime = savedReportDateTime.toLocaleString("en-US");

    newReportCard.id=reportData.save_id;
    reportName.innerHTML=reportData.plant_name;
    reportImage.src = diseasesImages[reportData.disease_id];
    createDate.innerHTML = savedReportDateTime;
    // newReportCard.removeAttribute('id');
    allReportsContainer.appendChild(newReportCard);

}

async function deleteReport(reportId){

    let isDeleted = await db.add_deleted_reports(reportId);
    if(!isDeleted) return isDeleted;
    return isDeleted;

}

async function openReport(reportId){
        let reportInfo = await db.get_report_by_id(reportId);
        console.log("The report Info " , reportInfo);
        let diseaseInfo = await db.get_diseases_info(reportInfo.disease_id);
        diseaseInfo ={
            classIndex:diseaseInfo.disease_id,
            confidence:reportInfo.confidence
        };
        localStorage.setItem("predictedDiseaseIndex",diseaseInfo.classIndex);
        localStorage.setItem("confidence", diseaseInfo.confidence);
        console.log("And the disease ID is : " , diseaseInfo);
        sessionStorage.setItem("CallerPage",1);
        show_report(diseaseInfo);
}

function highlightNewSavedReport(newReportID){

    document.getElementById(newReportID).classList.add("highlightNewReport");
    document.getElementById(newReportID).addEventListener('animationend',()=>{
        document.getElementById(newReportID).classList.remove("highlightNewReport");
    });


}

function sortReports(reportsData){
    reportsData.sort((firstReport,secondReport) => {

        return new Date(secondReport.created_at) - new Date(firstReport.created_at);

    });
}

function showDeleteDialog(){
    dialogContainer.classList.add("showDeletionContainer");

}

function hideDeleteDialog(){
    dialogContainer.classList.remove("showDeletionContainer");

}

function showNoContentMsg(){
    noContentMsg.style.display="block";

}

function hideNoContentMsg(){
    noContentMsg.style.display="none";
    

}