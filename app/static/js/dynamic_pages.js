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



const listItems = document.querySelectorAll('#pages li');
const profile_Btn = document.getElementById("user-profile");
const close_btn = document.getElementById("close-label");

// 2. Loop through each item
listItems.forEach((item, index) => {
  
  // 3. Add the click listener to each individual item
  item.addEventListener('click', () => {
    localStorage.setItem("current_page",index);//put the index of li inside localStorage
    var current_page = localStorage.getItem("current_page");

    fit_the_page(current_page);
    highlightActiveTab(index);
    change_page_name(index);
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebar").classList.add("close");
    document.getElementById("overlay").classList.remove("show");
    

  });
});

profile_Btn.addEventListener("click", () => {
    localStorage.setItem("previous_page",localStorage.getItem("current_page"));
    localStorage.setItem("current_page",4);
    var current_page = localStorage.getItem("current_page");
    fit_the_page(current_page);
});



document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "close-label") {
        
        var prev_page_str = localStorage.getItem("previous_page");
        var prev_page = prev_page_str !== null ? parseInt(prev_page_str, 10) : 0;
        
        if (prev_page !== 4){
            localStorage.setItem("current_page", prev_page);
            fit_the_page(prev_page);
        } else {
            localStorage.setItem("current_page", 0);
            fit_the_page(0);
        }
    }
});





window.onload = function(){
     

     let saved_page = localStorage.getItem("current_page");

     console.log(saved_page + " " +typeof(saved_page));
    // Convert the string to a number. If it's the first visit (null), default to 0.
    var current_page = saved_page !== null ? parseInt(saved_page, 10) : 0;

    fit_the_page(current_page);
    highlightActiveTab(current_page);
    change_page_name(current_page);
    fit_the_page(current_page);

    
}


async function fit_the_page(curr_page) {

    const all_pages = ["scan.html","single-report.html","help-center.html","about.html","profile.html"];
    var clicked_page = all_pages[curr_page]; //get the name of page

    let the_url = fetch(clicked_page) //this method will go and search about this page
    .then(response => {
        return response.text();
    })
    .then(HTML_data =>{
        document.getElementById("main").scrollTop=0; //this to let the page go to top again , if user scrolled down
        document.getElementById("content").innerHTML=HTML_data; // put the new page here

        if (clicked_page === "help-center.html") {
            slideAnimation();
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

