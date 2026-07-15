let fileInput;
let uploadBox;
let previewImage;
let boxText;

export function initElements(){
    console.log("this function called");

     fileInput = document.getElementById("fileInput");
     uploadBox = document.getElementById("uploadBox");
     previewImage =document.getElementById("previewImage");
     boxText = document.getElementById("boxText");
     console.log(fileInput,"\n",uploadBox,"\n",previewImage,"\n",boxText);
     uploadBox.addEventListener('click',openFileManager);
}

function openFileManager(event){
    
    console.log("clicked");
    event.stopPropagation();
    fileInput.click();
}