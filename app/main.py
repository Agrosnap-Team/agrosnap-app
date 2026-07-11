import re

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr,field_validator
from fastapi.middleware.cors import CORSMiddleware
from app import database as db
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse,HTMLResponse
import bcrypt

app =  FastAPI() # this is the CEO have archive (contains all URL & Method write in this class)



#========================================================================
# These are mendatory for let fastAPI know the locations of files/folders
#========================================================================
app.mount("/app",StaticFiles(directory="app"),name="app")
app.mount("/static",StaticFiles(directory="app/static"),name="static")
app.mount("/node_modules", StaticFiles(directory="node_modules"), name="node_modules") #library related to indexedDB 



database_instance = db.AgrosnapDatabase()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #specify the paths which send requests to fastAPI
    allow_credentials=True,
    allow_methods=["*"], #allow all methods GET,POST,etc...
    allow_headers=["*"],
)

#======================================================
#the codes below are for routing and move between pages 
#======================================================


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



class UserSign_Up(BaseModel):

    # pydantic class that will tell Aseel what data to be passed
    username: str
    first_name: str
    last_name : str
    email : EmailStr
    PASSWORD_HASH: str

    @field_validator('PASSWORD_HASH')
    @classmethod
    def check_password_strength(cls, v:str) -> str:
        # check if the length of pass is  equal or grater thane 8
        if len(v) < 8 :
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        #check if password have at lest one digit
        if not any(char.isdigit() for char in v):
            raise HTTPException(status_code=400, detail="Password must contain at least 1 digits")

        # check if password has at lest one small letter
        if not any(char.islower() for char in v):
            raise HTTPException(status_code=400, detail="Password must contain at least 1 lowercase letter")

        # check if password has at lest one cabital letter(upper)
        if not any(char.isupper() for char in v):
            raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase letter")

        # check on password if have any (symbol/ special character)
        if not re.search(r"[@$!%*?&#_.:+-]", v):
            raise ValueError('Password must contain at least one special character (e.g., @, $, !, %, *, #)')

        return v


@app.post("/signup")  # this called decorator tell app to save this URL
def signup(user_data: UserSign_Up):
    # farst check if user is registered in database
    try:
        user_existe = database_instance.get_user_by_email(email=user_data.email)
        if user_existe:
            raise HTTPException(status_code=400, detail="this email is already registered")

        # if not exist add_new_user & hash the password
        print("password length:" ,len(user_data.PASSWORD_HASH))

        # convert the password to bytes
        password_bytes = user_data.PASSWORD_HASH.encode('utf-8')
         #encript the password and c=generate the salt
        salt = bcrypt.gensalt()
        hash_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')


        database_instance.insert_into_users_info(username=user_data.username, firstname=user_data.first_name,
                                                 last_name=user_data.last_name, email=user_data.email,
                                                 password=hash_password)
        return {"status": "success", "message": f"user{user_data.username} registered successfully"}



    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"this error occured :str {str(e)}")








    


