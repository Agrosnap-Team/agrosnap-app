

function display_Agrosnap_logo(){
    try{
    console.log("display logo called");
    document.getElementById("logo_container").style.visibility = "visible";
    document.getElementById("logo_container").classList.add("fade-in");
// 2. Professionally detect exactly when the animation ends
    document.getElementById("logo_container").addEventListener("animationend", check_if_user_logged_in);
    }
    catch(error){
        console.log(error);
    }
}

function move_to_sign_page(){
    console.log("we are in the move_to_sign_page");
    setTimeout(() => {
        window.location.href="/sign";
    }, 500);

}

async function check_if_user_logged_in(){
    let user_token = localStorage.getItem("user_token");
    if(user_token){
        console.log("sheck any update ......");
        window.location.href="/sidebar";
    }
    else{
        move_to_sign_page();
    }

}

