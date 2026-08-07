import { initModel , loadModel } from "./model.js";
import { show_report } from "./dynamic_pages.js";

let fileInput;
let uploadBox;
let previewImage;
let boxText;
let closeMark;
let cameraButton;
let fileManagerButton;
let camera;
let popupElement;
let clearButton;
let checkButton;
let canClick = true;
let selected_image;
let convertedImg;
let scanUploadbtns , healthyDialog;


export function initElements(){

    if(localStorage.getItem("user_token")===null || localStorage.getItem("user_token")===undefined){
        window.location.href="/sign";
    }


    // initModel();
    loadModel()
    .then(()=>{
        console.log("Model OK");
    })
    .catch(
        e => {
            alert("load model failed: " + e.message);

        }); 

    console.log("this function called");

    //=============================================
    //  initiate the needed html elements 
    //=============================================

     fileInput = document.getElementById("fileInput");
     uploadBox = document.getElementById("uploadBox");
     previewImage =document.getElementById("previewImage");
     boxText = document.getElementById("boxText");
     cameraButton=document.getElementById("cameraChoice");
     fileManagerButton=document.getElementById("fileManager");
     camera=document.getElementById("cameraInput");
     popupElement = document.getElementById("scanPopup");
     closeMark=document.getElementById("closePopup");
     clearButton=document.getElementById("clear-btn");
     checkButton=document.getElementById("send");
     scanUploadbtns =document.getElementById("choices");
     healthyDialog = document.getElementById("healthy-dialog");


    //=============================================
    // Initiate the needed html elements 
    //=============================================


    clearBox();

    
    //==================================================================
    // when user click and open popup , choose to open camera or gallery
    //==================================================================

    uploadBox.onclick = showPhotoUploadPopup;
    cameraButton.onclick=openCamera;
    fileManagerButton.onclick=openFileManager;

    //==================================================================
    //when user click and open popup , choose to open camera or gallery
    //==================================================================


    //==============================================================
    // let user click anywhere or click on x mark to close the popup
    //==============================================================

    popupElement.addEventListener('click', (event) => {
         
        if (event.target === popupElement) {
            closePopup();
        }
    });
    closeMark.addEventListener("click",closePopup);

    //==============================================================
    // let user click anywhere or click on X mark to close the popup
    //==============================================================


    //===============================================================
    //when user choose or capture a photo , so should appear
    // in previewImage
    //=================================================================

    fileInput.addEventListener("change",showImage);
    camera.addEventListener("change",showImage);

    //===============================================================
    //when user choose or capture a photo , so should appear
    // in previewImage
    //=================================================================


    //================================================================
    // Clear the selected photo and remove it from the box
    // Add event when the user click to check 
    //================================================================
    clearButton.onclick= clearBox;
    checkButton.onclick= checkThePlantLeaf;

     



}

function openFileManager(event){
    
    console.log("clicked");
    event.stopPropagation();
    fileInput.click();
}
function openCamera(event){
    event.stopPropagation();
    camera.click();
    
}

function openPopup(){
    
    if(!canClick)return;
    popupElement.classList.add("showPopup");
    


}
function closePopup(){
    popupElement.classList.remove("showPopup");

}

function showPhotoUploadPopup(){
    openPopup();
    scanUploadbtns.classList.add("showChoices");
}

function closePhotoUploadPopup(){
    scanUploadbtns.classList.remove("showChoices");
    closePopup();
}

function showHealthyPopup(){
     openPopup();
     healthyDialog.classList.add("showHealthyPopup");
}

function closeHealthyPopup(){
    healthyDialog.classList.remove("showHealthyPopup");
    closePopup();
}




function showImage(event){

    void uploadBox.offsetWidth;    
    //files always return a group of images so we always need the first photo has been selected
    selected_image = event.target.files[0]; //tehe selected file from fileManager / camera / gallery

    //if no photo selected , then don't do anything 
    if(!selected_image){
        return;}
    
    uploadBox.classList.remove("error");//when the user upload a photo successfully
    closePopup();

    //when the photo has been uploaded and appeared inside the box , you can't upload another one until yoy clear the box
    canClick=false; 
    convertedImg=URL.createObjectURL(selected_image); //make a temp url in browser 
    previewImage.src = convertedImg; // fill the url inside <img src=".."/>
    previewImage.style.display="block";//make the image visible

}


function clearBox(){

    if(convertedImg){
        URL.revokeObjectURL(convertedImg); //clear the memory from any temp url
        convertedImg = null; 
    }
    selected_image=null;
    previewImage.src = "";
    previewImage.style.display="none";
    previewImage.classList.remove("checking-and-loading");
    checkButton.innerHTML="Check now";
    canClick=true; //user can upload images again after the box is cleared
}

async function checkThePlantLeaf(){
    try{
    const diseases =['bacterial_spot', 'early_blight', 'healthy', 'late_blight', 'leaf_mold', 'yellow_leaf_curl_virus'];
    uploadBox.classList.remove("error"); //remove red border 
    
    //check if there any uploaded image before send it to AI 
    if(!selected_image){ 
        //we used it to let the browser see the changes so the animation can removed,added and worked again
        void uploadBox.offsetWidth; 
        uploadBox.classList.add("error");
        return;
    }
        
      
    canClick=false;
    previewImage.classList.add("checking-and-loading");
    checkButton.innerHTML="Loading...";
    void uploadBox.offsetWidth;
    
    
    const predictedDisease = await convertImageToHTMLElement(convertedImg);

    if(predictedDisease === undefined || predictedDisease === null)
        {
         console.log("no result");
         return;
        }

    // alert(diseases[predictedDiseaseIndex]);
    // window.location.href="/single_report";
    localStorage.setItem("predictedDiseaseIndex",predictedDisease.classIndex);
    localStorage.setItem("confidence", predictedDisease.confidence);
    sessionStorage.setItem("CallerPage",sessionStorage.getItem("current_page"));
    console.log("this is checkThePlantLeaf() , and the predicted disease is : ",predictedDisease);
    show_report(predictedDisease);
    clearBox();

    }
    catch(error){
        alert("this is in scan.js , in checkThePlantLeaf(), " + error);
    }
        
}


async function convertImageToHTMLElement(selectedImg){

    try{

        console.log("In convert method: ");

        //wait until the image be ready to read and use 
        await  previewImage.decode();

        //check the result before
        // console.log("the image url : " , selectedImg);
        // console.log("the HTML element is : ", previewImage );

        const modelResult = await initModel(previewImage);
        console.log("this is convertImageToHTMLElement , and the model result is : ", modelResult);

        //clear the temp url from browser memory to prevent memory leak 
        URL.revokeObjectURL(selectedImg); 
        return  modelResult;//this is the result of prediction
    }
    catch(error){
        alert("this is in scan.js , in convertImageToHTMLElement(), " + error);
    }
}