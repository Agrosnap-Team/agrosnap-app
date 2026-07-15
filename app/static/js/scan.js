let fileInput;
let uploadBox;
let previewImage;
let boxText;
let closeMark;
let cameraButton;
let fileManagerButton;
let camera;
let popupElement;

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
     popupElement = document.getElementById("popup");
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

function showImage(event){


     console.log("showImage called");
     console.log(event.target.files);
    //files always return a group of images so we always need the first photo has been selected
    const selected_image = event.target.files[0];
    //if no photo selected , then don't do anything 
    if(!selected_image){
        console.log("no image selected");
        return;}


    closePopup(0);
    previewImage.src = URL.createObjectURL(selected_image);
    previewImage.style.display="block";







}