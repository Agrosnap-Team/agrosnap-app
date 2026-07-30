import db from "./databaseManager_IndexedDB.js";
import { backToHome , backToCallerPage } from "./dynamic_pages.js";

//these variables for prograss bar
let progressesContainer,progTitle , progPercent , progLine;

// these variables for report 
let reportContainer,reportTitle , diseaseImg , diseaseContent ,  treatmentContent;

// these variables for buttons
let  saveButton , downloadButton , closeButton , confirmRenameButton , closeMark;

// the popup
let alertPopUp , reportRenameInput;


export function initReport(diseaseIndex){
    console.log("this is single report");
    let isElementsInitiated=initiateElements();
    if(isElementsInitiated){
        fillReportStructure(diseaseIndex);
        closeButton.addEventListener('click',closeReport);
        saveButton.addEventListener('click',showAlert);
        closeMark.addEventListener('click',hideAlert);
    }
    else{
        console.log("Something went wrong while initiating html elements");
    }

}

async function fillReportStructure(index,diseaseName){
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
        

        //fill the elements with data of disease to represent it in user interface
        reportTitle.innerHTML = the_disease.disease_name;
        progTitle.innerHTML = the_disease.disease_name;
        diseaseContent.innerHTML = the_disease.report;
        treatmentContent.innerHTML = the_disease.treatment;

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
    progTitle = document.getElementsByClassName("disease-title")[0];
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
    closeMark = document.getElementById("closePopup");

    //=============================================
    // Pop up 
    //=============================================
    alertPopUp=document.getElementById("popup");
    reportRenameInput = document.getElementById("report-name");



    let elements = {reportRenameInput , confirmRenameButton , closeMark , progressesContainer , progTitle , progPercent , progLine , reportContainer,reportTitle , diseaseImg ,  diseaseContent , treatmentContent, saveButton , downloadButton , closeButton , alertPopUp};
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
    sessionStorage.setItem("current_page",sessionStorage.getItem("CallerPage"));
    backToCallerPage(sessionStorage.getItem("current_page"));
}

function showAlert(){
    console.log("this is show alert");
    console.log(alertPopUp);
    document.getElementById("popup").classList.add("showPopup");
  }

function hideAlert(){
    document.getElementById("popup").classList.remove("showPopup");

  }