
localStorage.setItem("current_page",0);


async function fit_the_page() {
    let the_url = fetch("scan.html")
    .then(response => {
        return response.text();
    })
    .then(HTML_data =>{
        document.getElementById("content").innerHTML=HTML_data;
    })
    .catch(error =>{
        console.error("something went wrong , " + error);
    }); 
}


window.onload = function(){
    var current_page = localStorage.getItem("current_page");

    if (current_page == 0){
        fit_the_page();

    }
    else{
        console.log("the current page is " + current_page);
    }
    


};

