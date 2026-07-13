
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers import authentication,reports


# this is the CEO have archive (contains all URL & Method write )
app = FastAPI(
    title="Agrosnap Api",
    version="1.0",
)

#connect the routers to the application core
app.include_router(authentication.router)
app.include_router(reports.router)


#========================================================================
# These are mandatory for let fastAPI know the locations of files/folders
#========================================================================

app.mount("/app",StaticFiles(directory="app"),name="app")

app.mount("/static",StaticFiles(directory="app/static"),name="static")
app.mount("/node_modules", StaticFiles(directory="node_modules"), name="node_modules") #library related to indexedDB


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #specify the paths which send requests to fastAPI
    allow_credentials=True,
    allow_methods=["*"], #allow all methods GET,POST,etc...
    allow_headers=["*"],
)

#===============================================================================
#the codes below are for routing and move between pages this called auto mounting
#================================================================================


# This is mendatory and tell the FastAPI which page is the main/start page to run it
@app.get("/")
def indexPage():
    return FileResponse("app/templates/index.html")

@app.get("/sign")
def signChoices():
    return FileResponse("app/templates/sign_choices.html")

@app.get("/loginForm")
def loginPage():
    return FileResponse("app/templates/login.html")

@app.get("/signupForm")
def signPage():
    return FileResponse("app/templates/registration.html")

@app.get("/sidebar")
def sidebar():
    return FileResponse("app/templates/sidebar.html")

@app.get("/profile")
def profilePage():
    return FileResponse("app/templates/profile.html")

@app.get("/scan")
def scanPage():
    return FileResponse("app/templates/scan.html")

@app.get("/all_saved_reports")
def saved_report():
    return FileResponse("app/templates/all-saved-reports.html")

@app.get("/help")
def help_center():
    return FileResponse("app/templates/help-center.html")

@app.get("/about")
def aboutPage():
    return FileResponse("app/templates/about.html")

@app.get("/single_report")
def show_report():
    return FileResponse("app/templates/single-report.html")

#================================================
#================================================









