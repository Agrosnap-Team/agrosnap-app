let menu_btn = document.getElementById("menu-btn");
let sidebar  = document.getElementById("sidebar");
let overlay  = document.getElementById("overlay");

function is_mobile(){
    return window.innerWidth <= 700;
}

function open_sidebar(){
    sidebar.classList.add("open");
    if(is_mobile()) overlay.classList.add("show");
}

function close_sidebar(){
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
}

function toggle_sidebar(){
    sidebar.classList.contains("open") ? close_sidebar() : open_sidebar();
}

menu_btn.addEventListener("click", (e) => {
    e.stopPropagation();      // don't let this click bubble to document and instantly close it
    toggle_sidebar();
});

// click anywhere outside sidebar & menu_btn closes it (desktop + mobile)
document.addEventListener("click", (e) => {
    let clickedInsideSidebar = sidebar.contains(e.target);
    let clickedMenuBtn = menu_btn.contains(e.target);

    if(!clickedInsideSidebar && !clickedMenuBtn){
        close_sidebar();
    }
});

// keep sidebar visually consistent if user resizes across the 700px breakpoint
window.addEventListener("resize", () => {
    if(!is_mobile()){
        overlay.classList.remove("show");
    }
});


document.getElementById("main").addEventListener("scroll",() =>{
    
    if (document.getElementById("main").scrollTop > 0) {
        // Add the shadow
        document.getElementById("header").style.boxShadow="1px 2px 10px gray";
        
        // Optional: Add a smooth transition so it doesn't snap suddenly
        document.getElementById("header").style.transition = "box-shadow 0.3s ease"; 
    } 
    else {
        // Remove the shadow when at the top
        document.getElementById("header").style.boxShadow = "none";
    }
});

