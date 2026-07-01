

function display_Agrosnap_logo(){
    document.getElementById("logo_container").style.visibility = "visible";
    document.getElementById("logo_container").classList.add("fade-in");
// 2. Professionally detect exactly when the animation ends
    document.getElementById("logo_container").addEventListener("animationend", move_to_sign_page);

}

function move_to_sign_page(){

    setTimeout(() => {
        window.location.href = "sign_choices.html";
    }, 2000);

}
