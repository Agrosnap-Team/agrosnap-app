//the user will click on the li 
// we will take the index of li 
//change the localStorage to that index
// we pass it to fit_the_page()
// we create an array of [pageName.html] to get them fast
// we navigate the idex of li with array of pages to get the page name 
// pass it to fetch()
//change the background of clicked li 
// if user logged out , the localStorage will reset the page to 0 which is the default page
import {slideAnimation} from './help.js';
import { init } from './fill-Profile-Info.js';
import { initElements } from "./scan.js";
import { showReports } from './saved-reports.js';


sessionStorage.setItem("current_page", 0);


const listItems = document.querySelectorAll('#pages li');
const profile_Btn = document.getElementById("user-profile");
const close_btn = document.getElementById("close-label");
document.getElementById("logout-btn").addEventListener('click',logout_process);

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
});



document.addEventListener("click", (event) => { //when user opens profile and then clicks close
    if (event.target && event.target.id === "close-label") {
        
        var prev_page_str = sessionStorage.getItem("previous_page"); //go and get the previous page
        var prev_page = prev_page_str !== null ? parseInt(prev_page_str, 10) : 0;
        
        if (prev_page !== 4){
            sessionStorage.setItem("current_page", prev_page);
            fit_the_page(prev_page);
        } else {
            sessionStorage.setItem("current_page", 0);
            fit_the_page(0);
        }
    }
});





window.onload = function(){
     
    let saved_page = sessionStorage.getItem("current_page");

    // Convert the string to a number. If it's the first visit (null), default to 0.
    var current_page = saved_page !== null ? parseInt(saved_page, 10) : 0;

    fit_the_page(current_page);
    highlightActiveTab(current_page);
    change_page_name(current_page);

    
}


async function fit_the_page(curr_page) {

    const all_pages = ["/scan","/all_saved_reports","/help","/about","/profile"];
    const allPages = [
        {path:"/scan",initJSFunction:initElements},
        {path:"/all_saved_reports",initJSFunction:showReports},
        {path:"/help",initJSFunction:slideAnimation},
        {path:"/about",initJSFunction:null},
        {path:"/profile",initJSFunction:init}

    ];
    var clicked_page = allPages[curr_page]; //get the name of page

    fetch(clicked_page.path) //this method will go and search about this page
    .then(response => {
        return response.text();
    })
    .then(HTML_data =>{
        document.getElementById("main").scrollTop=0; //this to let the page go to top again , if user scrolled down
        document.getElementById("content").innerHTML=HTML_data; // put the new page here
        if(clicked_page.initJSFunction){
            clicked_page.initJSFunction();
        }


    })


    .catch(error =>{
        console.error("something went wrong , " + error);
    }); 
}


function highlightActiveTab(activeIndex){

    //li's
    listItems.forEach((li, index) => {
        if (index === activeIndex) {
            li.classList.add("active");// Highlight active tab
        } else {
            li.classList.remove("active");// Reset others
        }
    });

}


function change_page_name(index){
    const pages_names = ["Agrosnap | Scan","Agrosnap | My reports","Agrosnap | Help center","Agrosnap | About Agrosnap"];
    let index_page = parseInt(index,10);
    document.title=pages_names[index_page];
}




function logout_process(){
    localStorage.removeItem("user_token");
    window.location.href="/sign";
}

