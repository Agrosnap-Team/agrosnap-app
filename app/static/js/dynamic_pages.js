//the user will click on the li 
// we will take the index of li 
//change the localStorage to that index
// we pass it to fit_the_page()
// we create an array of [pageName.html] to get them fast
// we navigate the idex of li with array of pages to get the page name 
// pass it to fetch()
// change the background of clicked li 
// if user logged out , the localStorage will reset the page to 0 which is the default page
import {slideAnimation} from './help.js';
import { init } from './fill-Profile-Info.js';
import { initElements } from "./scan.js";
import { startSavedReportsPage } from './saved-reports.js';
import handleToken from "./tokenDecoding.js";
import DB from "./databaseManager_IndexedDB.js";
import { initReport } from './single-report.js';
import { startAboutPage } from './about.js';


if(sessionStorage.getItem("current_page")==null || sessionStorage.getItem("current_page")==undefined ){
sessionStorage.setItem("current_page", 0);
}

console.log("dynamic pages loaded");



let diseaseInfo;
const listItems = document.querySelectorAll('#pages li');
const profile_Btn = document.getElementById("user-profile");
let current_user_name = document.getElementById("user-name");
const close_btn = document.getElementById("close-label");
let scanButton = document.getElementById("scanPAge");
document.getElementById("logout-btn").addEventListener('click',logoutConfirmationDialog);

scanButton.addEventListener("click",backToHome);

setInterval(()=>{
    scanButton.classList.add("addAnimation");
},20000);

scanButton.addEventListener("animationend",()=>{
    void scanButton.offsetWidth;
    scanButton.classList.remove("addAnimation");
});



export function hideScanButton(){
    scanButton.classList.add("hideScanButton");
  }

export function showScanButton(){
    scanButton.classList.remove("hideScanButton");
}


// 2. Loop through each item
listItems.forEach((item, index) => {
  
  // 3. Add the click listener to each individual item

  item.addEventListener('click', () => { //this is for all pages except profile
    sessionStorage.setItem("current_page",index);//put the index of li inside localStorage
    var current_page = sessionStorage.getItem("current_page");

    fit_the_page(current_page); //go and inject the page by fetch()
    highlightActiveTab(index); 
    change_page_name(index);

    //to close the sidebar
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("overlay").classList.remove("show");
  });
});


profile_Btn.addEventListener("click", () => { //this is only for profile because it is not belong to <ul></ul>
    sessionStorage.setItem("previous_page",sessionStorage.getItem("current_page"));
    sessionStorage.setItem("current_page",4);
    var current_page = sessionStorage.getItem("current_page");
    fit_the_page(current_page);
    change_page_name(current_page);
});



document.addEventListener("click", (event) => { //when user opens profile and then clicks close
    if (event.target && event.target.id === "close-label") {
        
        var prev_page_str = sessionStorage.getItem("previous_page"); //go and get the previous page
        var prev_page = prev_page_str !== null ? parseInt(prev_page_str, 10) : 0;
        
        if (prev_page !== 4){
            sessionStorage.setItem("current_page", prev_page);
            fit_the_page(prev_page, diseaseInfo);
            
        } else {
            sessionStorage.setItem("current_page", 0);
            fit_the_page(0);
        }
    }
});





window.onload = function(){
     
    let saved_page = sessionStorage.getItem("current_page");

    let userToken = handleToken.getUserIdFromToken(localStorage.getItem("user_token"));
    let userFullName = DB.getUserByID(userToken).then(userData => {
        if (userData) {
            current_user_name.textContent = userData.first_name + " " + userData.last_name;}
        });




    diseaseInfo = {
        classIndex: parseInt(localStorage.getItem("predictedDiseaseIndex")),
        confidence: localStorage.getItem("confidence")
    };

    // Convert the string to a number. If it's the first visit (null), default to 0.
    // var current_page = saved_page !== null ? parseInt(saved_page, 10) : 0;

    console.log("this is window.onload() , and the diseaseInfo is : ", diseaseInfo);
    fit_the_page(saved_page,diseaseInfo);
    highlightActiveTab(saved_page);
    change_page_name(saved_page);

    
}


async function fit_the_page(curr_page,additionalData) {

    console.log("the parameters:" , additionalData);

    const allPages = [
        {path:"/scan",initJSFunction:initElements},
        {path:"/all_saved_reports",initJSFunction:startSavedReportsPage},
        {path:"/help",initJSFunction:slideAnimation},
        {path:"/about",initJSFunction:startAboutPage},
        {path:"/profile",initJSFunction:init},
        {path:"/single_report",initJSFunction:initReport}

    ];

    var clicked_page = allPages[curr_page]; //get part of name by the index -> curr_page

    fetch(clicked_page.path) //this method will go and search about this page
    .then(response => {
        return response.text();
    })
    .then(HTML_data =>{
        void document.getElementById("content").offsetWidth;
        if(curr_page != 4){
            document.getElementById("content").classList.add("changePagesAnimation");
            document.getElementById("content").addEventListener("animationend",()=>{
                document.getElementById("content").classList.remove("changePagesAnimation");
            
            });
        }
        document.getElementById("main").scrollTop=0; //this to let the page go to top again , if user scrolled down
        document.getElementById("content").innerHTML=HTML_data; // put the new page here
        sessionStorage.setItem("current_page",curr_page);


        if(clicked_page.initJSFunction){ //if we have an exported functions that should work once the page called

            clicked_page.initJSFunction(additionalData);//call the function that belong to specific page
        }
    })

    .catch(error =>{
        console.error("something went wrong , " + error);
    }); 
}


function highlightActiveTab(activeIndex){

    //li's
    listItems.forEach((li, index) => {
        if (index == activeIndex) {
            li.classList.add("active");// Highlight active tab
        } else {
            li.classList.remove("active");// Reset others
        }
    });

}


function change_page_name(index){
    const pages_names = ["Agrosnap | Scan","Agrosnap | My reports","Agrosnap | Help center","Agrosnap | About Agrosnap" ,"Agrosnap | Profile", "Agrosnap | Disease report"];
    let index_page = parseInt(index,10);
    document.title=pages_names[index_page];
}




export function show_report(diseaseInfo){
  //this function will send a report index page and call the fit_the_page()
  // will fetch the page and call its js file/ js functions
  console.log("this is show_report() , and the diseaseInfo is : ", diseaseInfo);
  const thePage=5; // index of the page
  change_page_name(thePage);
  highlightActiveTab(sessionStorage.getItem("current_page"));
  fit_the_page(thePage,diseaseInfo);

}

export function backToHome() {
    const homePageIndex = 0;
    change_page_name(homePageIndex);
    fit_the_page(homePageIndex);
    highlightActiveTab(homePageIndex);

  }

export function backToCallerPage(callerPageIndex){
    callerPageIndex = parseInt(callerPageIndex);
    change_page_name(callerPageIndex);
    fit_the_page(callerPageIndex);
    highlightActiveTab(callerPageIndex);

}

export function goToMyReports(reportData){
    const myReportsPageIndex = 1;
    console.log("this is goToMyReports() , and the reportData is : ", reportData);
    change_page_name(myReportsPageIndex);
    fit_the_page(myReportsPageIndex,reportData);
    highlightActiveTab(myReportsPageIndex);
}

function logoutConfirmationDialog(){
    let confirmDialog = document.getElementById("dialogContainer");
    let confirmButton = document.getElementById("confirmLogout");
    let cancelButton = document.getElementById("cancelLogout");
    let closeDialog = document.getElementById("closeDialog");
    confirmDialog.classList.add("showLogutDialog");
    closeDialog.addEventListener('click',()=>{
        confirmDialog.classList.remove("showLogutDialog");
    });
    cancelButton.addEventListener('click',()=>{
        confirmDialog.classList.remove("showLogutDialog");
    });
    confirmButton.addEventListener('click',logout_process);

}


async function logout_process(){
    const userID = handleToken.getUserIdFromToken(localStorage.getItem("user_token"));
    await DB.delete_user(userID);
    sessionStorage.removeItem("current_page");
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    window.location.href="/sign";
}




