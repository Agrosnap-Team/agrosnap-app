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

fit_the_page();