let fileInput;
let uploadBox;
let previewImage;
let boxText;
let closeMark;
let cameraButton;
let fileManagerButton;
let camera;

export function initElements(){
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
     let popupElement = document.getElementById("popup");
     closeMark=document.getElementById("closePopup");

    //=============================================
    //initiate the needed html elements 
    //=============================================


    

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
    // let user click anywhere pr click on x mark to close the popup
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
    document.getElementById("popup").classList.add("showPopup");
    


}
function closePopup(){
    document.getElementById("popup").classList.remove("showPopup");

}