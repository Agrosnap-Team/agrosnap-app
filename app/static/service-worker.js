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





const CACHE_NAME = "agrosnap-v4";

const FILES_TO_CACHE = [

    // Pages
    "/",
    "/sign",
    "loginForm",
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
    "/static/css/login.css",
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
    "/static/js/all_reports.js",

    
    // Images
    "/static/images/agronsnap_for_index.png",
    "/static/images/agrosnap logo.png",
    "/static/images/agrosnap logo192x192.png",
    "/static/images/agrosnap logo512x512.png",
    "/static/images/delete.png",
    "/static/images/down.png",
    "/static/images/leaf_disease.webp",
    "/static/images/menus.png",
    "/static/images/next.png",
    "/static/images/profile-pic.png",
    "/static/images/trash.png",


    // PWA
    "/static/manifest.json",
    "/static/js/service-worker-register.js",

    //indexedDB
    "/node_modules/idb/build/umd.js",
    "/static/js/databaseManager_IndexedDB.js"
];

self.addEventListener("install", event => {
    console.log("SW installed");
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })

    );

});

self.addEventListener("activate", event => {
    console.log("SW activated");

});

self.addEventListener("fetch", event => {
    console.log("fetching..");


    event.respondWith(

        caches.match(event.request)

        .then(response => {

            // If the file in cache then return it without connecting to FastAPI and network
            if (response) {
                return response;
            }

            // If not then go and take it from network
            return fetch(event.request);

        })

    );


});