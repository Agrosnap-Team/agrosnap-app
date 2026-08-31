// service-worker.js
// │
// ├── const CACHE_NAME
// ├── FILES_TO_CACHE
// ├── install
// ├── activate
// ├── fetch
// ├── cache logic
// ├── sync
// └── ...


const CACHE_NAME = "Agrosanp-1";
console.log("this is service worker, " + CACHE_NAME);
const FILES_TO_CACHE = [

    // Pages
    "/",
    "/sign",
    "/loginForm",
    "/signupForm",
    "/sidebar",
    "/profile",
    "/scan",
    "/all_saved_reports",
    "/single_report",
    "/help",
    "/about",

    // CSS
    "/static/css/index.css",
    "/static/css/general_style.css",
    "/static/css/signStyle.css",
    "/static/css/sign-choices.css",
    "/static/css/registration.css",
    "/static/css/sidebar.css",
    "/static/css/scan.css",
    "/static/css/all-reports.css",
    "/static/css/report.css",
    "/static/css/help.css",
    "/static/css/about.css",
    "/static/css/profile.css",

    // JS
    "/static/js/index.js",
    "/static/js/login.js",
    "/static/js/registration_process.js",
    "/static/js/interactive-sidebar.js",
    "/static/js/dynamic_pages.js",
    "/static/js/back_to_sign.js",
    "/static/js/help.js",
    "/static/js/single-report.js",
    "/static/js/fill-Profile-Info.js",
    "/static/js/tokenDecoding.js",
    "/static/js/scan.js", 
    "/static/js/saved-reports.js",
    "/static/js/about.js",
    "/static/js/syncReports.js",
    "/static/js/web-worker.js",

    
    // Images
    "/static/images/agronsnap_for_index.png",
    "/static/images/agrosnap logo.PNG",
    "/static/images/agrosnap logo192x192.png",
    "/static/images/agrosnap logo512x512.png",
    "/static/images/delete.png",
    "/static/images/down.png",
    "/static/images/leaf_mold.webp",
    "/static/images/menus.png",
    "/static/images/next.png",
    "/static/images/profile-pic.png",
    "/static/images/trash.png",
    "/static/images/closePopup.png",
    "/static/images/bacterial_spot.jpeg",
    "/static/images/early_blight.jpg",
    "/static/images/healthy_leaves.jpg",
    "/static/images/late_blight.jpeg",
    "/static/images/YLCV_disease.jpg",
    "/static/images/check.png",
    "/static/images/scanner-white.png",
    "/static/images/no-wifi.png",
    "/static/images/synchronize.png",

    //PDFs
    "/static/ReportsPdf/Bacterial_Spot.pdf",
    "/static/ReportsPdf/Early_Blight.pdf",
    "/static/ReportsPdf/healthy.pdf",
    "/static/ReportsPdf/Late_Blight.pdf",
    "/static/ReportsPdf/Leaf_Mold.pdf",
    "/static/ReportsPdf/YLCV.pdf",

    // PWA
    "/static/manifest.json",
    "/static/js/service-worker-register.js",

    //indexedDB
    "/static/js/databaseManager_IndexedDB.js",
    "/node_modules/idb/build/index.js",


    //tf files
    "/node_modules/@tensorflow/tfjs/dist/tf.js",
    "/node_modules/jwt-decode/build/esm/index.js",
    "/static/models/web_model/model.json",
    "/static/models/web_model/group1-shard1of8.bin",
    "/static/models/web_model/group1-shard2of8.bin",
    "/static/models/web_model/group1-shard3of8.bin",
    "/static/models/web_model/group1-shard4of8.bin",
    "/static/models/web_model/group1-shard5of8.bin",
    "/static/models/web_model/group1-shard6of8.bin",
    "/static/models/web_model/group1-shard7of8.bin",
    "/static/models/web_model/group1-shard8of8.bin"

 

];


self.addEventListener("install", event => {
    console.log("Installation started , service-worker.js");
    self.skipWaiting();
    console.log("SW installed");
    event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {

        for (const file of FILES_TO_CACHE) {

            try {
                await cache.add(file);
                console.log("Cached:", file);
            }
            catch (e) {
                console.log("Failed:", file, e.message);
                console.log("This is service-worker.js , and something went error when cache the files" + e.message);
            }

        }

        console.log("All files installed , service-worker.js ");
    })

    

    );

});

self.addEventListener("activate", event => {
    clients.claim();

    event.waitUntil(
        caches.keys().then(cacheNames => {

            return Promise.all(
                cacheNames.map(cache => {

                    if(cache !== CACHE_NAME){
                        console.log("Deleting old cache:", cache); 
                        return caches.delete(cache);//delete any old cache
                    }

                })
            );

        })
    );

});

self.addEventListener("fetch", event => {

    try{

        if(event.request.method !== "GET"){
            return;
        }

        console.log("FETCH REQUEST:", event.request.url);


        event.respondWith(

            caches.match(event.request , { ignoreVary: true })

            .then(response => {

                // If the file in cache then return it without connecting to FastAPI and network
                if (response) {
                    console.log("FROM CACHE:", event.request.url);
                    return response;
                }

                // If not then go and take it from network
                
                console.log("Trying network:", event.request.url);

                return fetch(event.request)
                .then(response => {
                    console.log("Network SUCCESS:", event.request.url);
                    return response;
                })
                .catch(error => {
                    console.log("Network FAILED:", event.request.url, error.message);
                    return new Response("You are offline and the resource is not cached.", {
                        status: 503,
                        statusText: "Service Unavailable",
                        headers: new Headers({ "Content-Type": "text/plain" })
                    });
                });

            })

        );
}
catch(e){
    console.log("something went error when fetching the pages in service worker , service_worker.js , fetch method ,"+ e.message);

}

});
