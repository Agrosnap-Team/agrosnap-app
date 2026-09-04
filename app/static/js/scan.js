import { show_report ,hideScanButton } from "./dynamic_pages.js";

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
let canClick = false;
let selected_image;
let convertedImg;
let scanUploadbtns , healthyDialog , okButton , closeHealthyPopupIcon;

let modelThread = new Worker("/static/js/web-worker.js");
let modelIsReady =false;

//Will detect any messages that received from web wroker 
modelThread.onmessage=(event)=>{

    if(event.data.type=="modelReady"){
        console.log("this is message");
        
        console.log("model is ready ! ");
        modelIsReady=true;
        if(modelIsReady){
            canClick=true;
            if(canClick)
                //enable button to let user use AI model
                enableButtons();
        }
    }


    //Result area after the worker predicted the image
    if(event.data.type=='result'){
        console.log("The reuslt of prediction is: " , event.data.diseaseInfo);
        sendDataToGUI(event.data.diseaseInfo);
    }
};





export async function initElements(){

    modelThread.postMessage({
        type:'loadModel'
    });


    hideScanButton();
    

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
     okButton = document.getElementById("healthy-ok");
     closeHealthyPopupIcon= document.getElementById("closeHealthyPopup");
     disableButtons();

    //=============================================
    // Initiate the needed html elements 
    //=============================================


    // clearBox();

    
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
            closeHealthyPopup();
            closePhotoUploadPopup();
        }
    });
    closeMark.addEventListener("click",closePhotoUploadPopup);

    closeHealthyPopupIcon.addEventListener("click",closeHealthyPopup);
    okButton.addEventListener("click",closeHealthyPopup);

    //==============================================================
    // let user click anywhere or click on X mark to close the popup
    //==============================================================


    //===============================================================
    //when user choose or capture a photo , so should appear
    // in previewImage
    //=================================================================

    fileInput.addEventListener("change",showImage);
    camera.addEventListener("change",showImage);


    //================================================================
    // Clear the selected photo and remove it from the box
    // Add event when the user click to check 
    //================================================================
    clearButton.onclick= clearBox;
    checkButton.onclick= checkThePlantLeaf;
}

function disableButtons(){
    clearButton.disabled = true;
    checkButton.disabled =true;
    clearButton.classList.add("disabledButtons");
    checkButton.classList.add("disabledButtons");
    checkButton.innerHTML = "Loading...";
    uploadBox.classList.add("preparingModel");
    boxText.innerHTML="Preparing AI model.<br>This will take few minutes...";
}


function enableButtons(){
    clearButton.disabled = false;
    checkButton.disabled =false;   
    clearButton.classList.remove("disabledButtons");
    checkButton.classList.remove("disabledButtons"); 
    checkButton.innerHTML = "Check now";
    uploadBox.classList.remove("preparingModel");
    boxText.innerHTML="Click here to upload a photo";
}





function openFileManager(event){
    
    event.stopPropagation();
    fileInput.click();
}
function openCamera(event){
    event.stopPropagation();
    camera.click();
    
}

function openPopup(){
    console.log(canClick);
    if(!canClick)
        { console.log("you can't click until you clear the box" , canClick);
            return
        };
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
    closePopup();
    scanUploadbtns.classList.remove("showChoices");
}

function showHealthyPopup(){
    popupElement.classList.add("showPopup");
    healthyDialog.classList.add("showHealthyPopup");
}

function closeHealthyPopup(){
     healthyDialog.classList.remove("showHealthyPopup");
     popupElement.classList.remove("showPopup");
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
    closePhotoUploadPopup();
    uploadBox.classList.remove("error"); //remove red border 
    //check if there any uploaded image before send it to AI 
    if(!selected_image){ 
        /*we used it to let the browser see the changes 
        so the animation can removed,added and worked again*/
        void uploadBox.offsetWidth; 
        uploadBox.classList.add("error");
        return;
    }
        
    canClick=false;
    previewImage.classList.add("checking-and-loading");
    checkButton.innerHTML="Loading...";
    void uploadBox.offsetWidth;
    let bitmapImage = await prepareSelectedImage(previewImage);

    //send the converted image to web worker 
    modelThread.postMessage({
        type:'predict',
        image:bitmapImage
    });
    
    //show_report(predictedDisease);
    }
    catch(error){
        alert("this is in scan.js , in checkThePlantLeaf(), " + error);
    }
        
}

async function prepareSelectedImage(selectedImg){
 
    try{

        //convert file to bitmap , so the web worker can read it 
        let imageBitmap = await createImageBitmap(selectedImg);
        if(!imageBitmap)return false;

        //clear the temp url from browser memory to prevent memory leak 
        URL.revokeObjectURL(selectedImg); 
        return imageBitmap;
    }
    catch(error){
        console.log("Something went wrong during preparing the image , ",error.message);

    }

}


function sendDataToGUI(diseaseInfo){

    console.log("What will send to GUI : " , diseaseInfo);

    //if the value id null
    if(diseaseInfo.disease_id === undefined || diseaseInfo.disease_id === null){
         console.log("no result");
         return;
    }   
    localStorage.setItem("predictedDiseaseIndex",diseaseInfo.disease_id);
    localStorage.setItem("confidence", diseaseInfo.confidence);     
    sessionStorage.setItem("CallerPage",sessionStorage.getItem("current_page"));    
    clearBox();
    if(diseaseInfo.disease_id === 2){ // if the result is healthy , then show the healthy popup
        showHealthyPopup();
        return;
    }
    show_report(diseaseInfo);    

}