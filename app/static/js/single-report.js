import db from "./databaseManager_IndexedDB.js";
import handleData from "./tokenDecoding.js";
import { backToHome , backToCallerPage } from "./dynamic_pages.js";

//these variables for prograss bar
let progressesContainer,progTitle , progPercent , progLine;

// these variables for report 
let reportContainer,reportTitle , diseaseImg , diseaseContent ,  treatmentContent;

// these variables for buttons
let  saveButton , downloadButton , closeButton , confirmRenameButton , renameCloseMark , exitCloseMark , renameDialog , closeDialog  , exitConfirmationButton , cancelCloseReport;

// the popup
let alertPopUp , reportRenameInput;

// other variables
const pageIndex = 5;

export function initReport(diseaseInfo){

    let isElementsInitiated=initiateElements();
    if(isElementsInitiated){
        fillReportStructure(diseaseInfo.classIndex,diseaseInfo.confidence);
        closeButton.addEventListener('click',closeReport);
        saveButton.addEventListener('click',showRenameDialog);
        renameCloseMark.addEventListener('click',hideRenameDialog);
        confirmRenameButton.addEventListener('click',()=>saveReportProcess(diseaseInfo));
    }
    else{
        console.log("Something went wrong while initiating html elements");
    }

}

async function fillReportStructure(index,confidence){
    try{

        //this condition is used to get the last predicted disease that stored in localStorage , and this will use it to get the index back after refresh the page , so the data won't be lost
        if(index==null || index == undefined) index = parseInt(localStorage.getItem("predictedDiseaseIndex"));

        //sometime the code above could return NaN , and this happens when there is no value in localStorage , so we have to check that the previous condition stored a real value not null/NaN, if no real value then return to home page
        if (isNaN(index)) {
                return backToHome();
            }

        //this index will used to retreive the disease info from indexedDB
        console.log("this is fillReportStructure() , and the index is ", index);

        //get the disease info from indexedDB
        let the_disease = await db.get_diseases_info(index);
        console.log(the_disease);
        await setDiseaseImage(index);

        //fill the elements with data of disease to represent it in user interface
        reportTitle.innerHTML = the_disease.disease_name;
        diseaseContent.innerHTML = the_disease.report;
        treatmentContent.innerHTML = the_disease.treatment;
        progPercent.innerHTML = `${confidence}%`;
        progLine.style.width = `${confidence}%`;



        

    }
    catch(e){
        //if any error occured then go back to homePage
         return backToHome();

    }

}


//define the HTML elements to use
function initiateElements(){

    let definedElements =0;

    //===========================================
    // Prograss elements
    //===========================================
    progressesContainer = document.getElementsByClassName("progresses-container")[0];
    // progTitle = document.getElementsByClassName("disease-title")[0];
    progPercent = document.getElementsByClassName("precentage")[0];
    progLine = document.getElementsByClassName("dynamic-line")[0];

    //===========================================
    // Report elements
    //===========================================
    reportContainer = document.getElementsByClassName("all-report")[0];
    reportTitle = document.getElementsByClassName("the-header")[0];
    diseaseImg = document.getElementById("disease-image");
    diseaseContent = document.getElementsByClassName("about-disease")[0];
    treatmentContent = document.getElementsByClassName("about-treatment")[0];

    //===========================================
    // Buttons elements
    //===========================================

    saveButton=document.getElementById("save-btn");
    downloadButton=document.getElementById("save-download-btn");
    closeButton=document.getElementById("close-btn");
    confirmRenameButton = document.getElementById("saveReportName");
    renameCloseMark = document.getElementById("closePopup");
    exitCloseMark = document.getElementById("closePopupIcon");
    renameDialog = document.getElementById("rename");
    closeDialog = document.getElementById("closeReport");
    exitConfirmationButton = document.getElementById("yes");
    cancelCloseReport = document.getElementById("cancel");

    //=============================================
    // Pop up 
    //=============================================
    alertPopUp=document.getElementById("popup");
    reportRenameInput = document.getElementById("report-name");



    let elements = {progressesContainer , progPercent , progLine , reportContainer, reportTitle , diseaseImg , diseaseContent ,  treatmentContent , saveButton , downloadButton , closeButton , confirmRenameButton , renameCloseMark , exitCloseMark , renameDialog , closeDialog  , exitConfirmationButton , cancelCloseReport , alertPopUp , reportRenameInput};
    for(let key in elements){
        if(elements[key] === undefined || elements[key] === null){
            console.log(`this ${key} is null`);
            continue;
        }
        definedElements++;
    }

    if(definedElements == Object.keys(elements).length ){
    console.log(`defined ${definedElements} out of ${Object.keys(elements).length}`);
    return true;
    }
    return false;
}

function closeReport(){

    showCloseReportDialog();

    // click yes 
    exitConfirmationButton.addEventListener('click',()=>{
    sessionStorage.setItem("current_page",sessionStorage.getItem("CallerPage"));
    backToCallerPage(sessionStorage.getItem("current_page"));
    });

    //click cancel
    cancelCloseReport.addEventListener('click',hideCloseReportDialog);

    //click on X icon [close icon]
    exitCloseMark.addEventListener('click',hideCloseReportDialog);


}

function showAlert(){
    console.log("this is show alert");
    console.log(alertPopUp);
    document.getElementById("popup").classList.add("showPopup");
}



function hideAlert(){
    console.log("this is hide alert");
    document.getElementById("popup").classList.remove("showPopup");
    reportRenameInput.value = "";
}

function showRenameDialog(){
    showAlert();
    renameDialog.classList.add("showRenameConfirmation");
    
    

}

function hideRenameDialog(){
    console.log("this is hide report dialog function");
    reportRenameInput.classList.remove("emptyInput");
    hideAlert();
    renameDialog.classList.remove("showRenameConfirmation");

    

}

function showCloseReportDialog(){
    showAlert();
    closeDialog.classList.add("showCloseReportConfirmation");

}

function hideCloseReportDialog(){
    hideAlert();
    closeDialog.classList.remove("showCloseReportConfirmation");
    
}

async function saveReportProcess(diseaseData){
    reportRenameInput.classList.remove("emptyInput");
    console.log("this is saveReportProcess() , and the passed diseaseData  : ",diseaseData);

    if(!reportRenameInput.value){
        void reportRenameInput.offsetWidth;
        reportRenameInput.classList.add("emptyInput");
        return;
    }
    let newUUID = crypto.randomUUID();
    let userID = handleData.getUserIdFromToken(localStorage.getItem("user_token"));
    let diseaseOtherInfo = await db.get_diseases_info(diseaseData.classIndex);

    let reportData = {
        "report_id": newUUID,
        "user_id": userID,
        "disease_id": diseaseData.classIndex,
        "report_name": reportRenameInput.value,
        "confidence": diseaseData.confidence,
        "isSynced": false
    };
    console.log("this is saveReportProcess() , and the diseaseOtherInfo is : ",diseaseOtherInfo);
    console.log("this is saveReportProcess() , and the reportData is : ",reportData);

    console.log("saved");
    hideRenameDialog();
}

async function setDiseaseImage(diseaseIndex){
    const imagesPaths=[
        "/static/images/bacterial_spot.jpeg",
        "/static/images/early_blight.jpg",
        "/static/images/healthy_leaves.jpg",
        "/static/images/late_blight.jpeg",
        "/static/images/leaf_disease.webp",
        "/static/images/YLCV_disease.jpg"

    ];
    console.log("this is setDiseaseImage() , and the disease index is ",diseaseIndex , " and the image path is ",imagesPaths[diseaseIndex]);
    diseaseImg.src = imagesPaths[diseaseIndex];
}



