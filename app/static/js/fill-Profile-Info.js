function setInfo(){
    
    document.getElementById("username").innerHTML=localStorage.getItem("username");
    document.getElementById("user-email").textContent = "myemail@gmail.com";
}

export function init(){
    
    setInfo();
}

