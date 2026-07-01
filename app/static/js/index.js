

function display_Agrosnap_logo(){
document.getElementById("logo_container").classList.add("fade-in");
setTimeout(move_to_sign_page, 4000);

}

function move_to_sign_page(){

    window.location.href = "../templates/sign_choice.html";

}
