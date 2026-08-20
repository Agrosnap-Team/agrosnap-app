//navigator is an object that provide data of the browser and the user 
if("serviceWorker" in navigator){
    navigator.serviceWorker.register("/service-worker.js")//add the json file in navigator 
    .then(() => {
        console.log("Service Worker registered");
    })
    .catch(error => {
        console.log(error);
        alert("This is service worker and there was something wrong in it please check the error: "+error);
    });

}