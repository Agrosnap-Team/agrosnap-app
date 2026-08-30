import db from "./databaseManager_IndexedDB.js";
import {showScanButton , show_report , mainSync} from "./dynamic_pages.js";




let reportContainer , allReportsContainer , noContentMsg , dialogContainer , deletionDialog , closeDialogIcon , confirmDeletionButton , cancelDeletionButton , reportToDelete , clickedReportCard;

export async function startSavedReportsPage(reportData){
    showScanButton();
    await mainSync(); //sync the newest update between indexedDB and sqlite3
    let isInitiated =  initiateElements();
    if(!isInitiated)return;
    await showReports(reportData);
    allReportsContainer.onclick = async function (clickedItem) {
        if(clickedItem.target.classList.contains("more-btn")){
            const parentItem = clickedItem.target.closest(".saved-reports");
            reportToDelete = parentItem;             

            showDeleteDialog();

        }

        else if(clickedItem.target.closest(".saved-reports")){

            clickedReportCard = clickedItem.target.closest(".saved-reports");
            openReport(clickedReportCard.id);

        }
      };

    confirmDeletionButton.onclick = async function(){
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

            await mainSync();

        };
        cancelDeletionButton.onclick = hideDeleteDialog;
        closeDialogIcon.onclick = hideDeleteDialog;

}

export async function showReports(reportData){
        //synced first if any new reports should store from sqlite3 , in case if any report added from different device

        //clear the old reports , this prevent the redundancy
        allReportsContainer
        .querySelectorAll(".generatedReportsCards")
        .forEach(card => card.remove());


        let allReports = await checkAllReports();
        if (allReports && allReports.length > 0){
            hideNoContentMsg();
            sortReports(allReports);
            for(let reportNum=0; reportNum<allReports.length;reportNum++){
               await createReportElement(allReports[reportNum]);
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

async function createReportElement(reportData){
    const diseaseInfo = await db.get_diseases_info(reportData.disease_id);
    console.log("the reports area:  " , diseaseInfo);

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
    let reportContent = newReportCard.querySelector("#repContent");
    newReportCard.classList.remove("hideReportCard");//to let the cards appear on screen
    newReportCard.classList.add("generatedReportsCards");//we will use it to remove only the copied card , not the template
    let savedReportDateTime= new Date(reportData.created_at);
    let savedDate = savedReportDateTime.toDateString();
    let savedTime = savedReportDateTime.toTimeString();
    savedReportDateTime = savedReportDateTime.toLocaleString("en-US");

    newReportCard.id=reportData.save_id;
    reportName.innerHTML=reportData.plant_name;
    reportImage.src = diseasesImages[reportData.disease_id];
    createDate.innerHTML = savedReportDateTime;
    reportContent.innerHTML=diseaseInfo.disease_info;
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
        show_report(reportInfo);
}

function highlightNewSavedReport(newReportID){

    document.getElementById(newReportID).classList.add("highlightNewReport");
    document.getElementById(newReportID).addEventListener('animationend',()=>{
        document.getElementById(newReportID).classList.remove("highlightNewReport");
    }, { once: true });


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