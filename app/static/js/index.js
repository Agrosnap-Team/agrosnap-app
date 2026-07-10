

function display_Agrosnap_logo(){
    try{
    document.getElementById("logo_container").style.visibility = "visible";
    document.getElementById("logo_container").classList.add("fade-in");
// 2. Professionally detect exactly when the animation ends
    document.getElementById("logo_container").addEventListener("animationend", move_to_sign_page);
    }
    catch(error){
        console.log(error);
    }
}

function move_to_sign_page(){
    console.log("we are in the move_to_sign_page");

    setTimeout(() => {
        console.log("i'am in the timeout");
        window.location.href = "../templates/sign_choices.html";
    }, 2000);

}
