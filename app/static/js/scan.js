import { initModel } from "./model.js";

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


export function initElements(){

    initModel();

    console.log("this function called");

    //=============================================
    //initiate the needed html elements 
    //=============================================

     fileInput = document.getElementById("fileInput");
     uploadBox = document.getElementById("uploadBox");
     previewImage =document.getElementById("previewImage");
     boxText = document.getElementById("boxText");
     cameraButton=document.getElementById("cameraChoice");
     fileManagerButton=document.getElementById("fileManager");
     camera=document.getElementById("cameraInput");
     popupElement = document.getElementById("popup");
     closeMark=document.getElementById("closePopup");
     clearButton=document.getElementById("clear-btn");
     checkButton=document.getElementById("send");

    //=============================================
    //initiate the needed html elements 
    //=============================================


    clearBox();

    
    //==================================================================
    //when user click and open popup , choose to open camera or gallery
    //==================================================================

    uploadBox.onclick = openPopup;
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
    document.getElementById("popup").classList.add("showPopup");
    


}
function closePopup(){
    document.getElementById("popup").classList.remove("showPopup");

}

function showImage(event){

    void uploadBox.offsetWidth;    
    //files always return a group of images so we always need the first photo has been selected
    selected_image = event.target.files[0];

    //if no photo selected , then don't do anything 
    if(!selected_image){
        console.log("no image selected");
        return;}
    
    uploadBox.classList.remove("error");
    closePopup();
    canClick=false;
    previewImage.src = URL.createObjectURL(selected_image);
    previewImage.style.display="block";

}

function clearBox(){
    selected_image=null;
    previewImage.src = "";
    previewImage.style.display="none";
    previewImage.classList.remove("checking-and-loading");
    checkButton.innerHTML="Check now"
    canClick=true;
}

function checkThePlantLeaf(){
    uploadBox.classList.remove("error")
    if(!selected_image){
        void uploadBox.offsetWidth;
        uploadBox.classList.add("error");
        return;
    }
        
    canClick=false;
    previewImage.classList.add("checking-and-loading");
    checkButton.innerHTML="Loading..."
}