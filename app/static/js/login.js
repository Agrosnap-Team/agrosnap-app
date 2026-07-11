alert("Origin : "+window.location.origin + "\nPathname: " + window.location.pathname);

document.addEventListener('click',(element) => {
    if(event.target && event.target.id === "submit")
    window.location.replace("sidebar.html");
})

