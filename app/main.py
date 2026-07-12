
import re

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr,field_validator,model_validator
from app import database as db
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse,HTMLResponse
import bcrypt
import jwt
from datetime import datetime ,timedelta,timezone


# setting of JWT
SECRET_KEY = "SUPER_SECRET_KEY_DONT_TELL_ANYONE"

# the algorthm use to encrypt the token
ALGORITHM = "HS256"
#expier of token
ACCESS_TOKEN_EXPIRE_MINUTES = 60

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
    confirm_password: str

    @field_validator('PASSWORD_HASH')
    @classmethod
    # v is represent the password you enter
    def check_password_strength(cls, v:str) -> str:
        # check if the length of pass is  equal or grater thane 8
        if len(v) < 8 :
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        #check if password have at lest one digit
        if not any(char.isdigit() for char in v):

            raise HTTPException(status_code=400, detail="Password must contain at least one digit ")

        # check if password has at lest one small letter
        if not any(char.islower() for char in v):
            raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")

        # check if password has at lest one cabital letter(upper)
        if not any(char.isupper() for char in v):
            raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")

        # check on password if have any (symbol/ special character)
        if not re.search(r"[@$!%*?&#_.:+-]", v):
            raise ValueError('Password must contain at least one special character (e.g., @, $, !, %, *, #)')

        return v

    @model_validator(mode='after')
    def check_confirm_password(self):
        if self.confirm_password != self.PASSWORD_HASH:
            raise HTTPException(status_code=400, detail="password does not match")
        return self



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




#  Hybrid Login (will login use email or username and password)
class userSign_in(BaseModel):
    identifier : str # get email / username
    password :str

@app.post("/login")
def login(login_data: userSign_in):



    try:
        user = database_instance.get_user_by_identifier(login_data.identifier)
        # check if user is registered .
        # if get user by identifier return None the condition  "if not user" is like  ask if None this mean  no user  then raise exception
        if not user:
            raise HTTPException(status_code=400, detail="Invalid Email /UserName or Password ")

        #convert the password that enter to bytes for exampl if we enter Tala#123 -> b'Tala#123'
        login_password = login_data.password.encode('utf-8')
        #convert the hash password that store on database to bytes
        password_hash_db= user["PASSWORD_HASH"].encode('utf-8')

        # check if password that user enter matching what was sorted in database
        if not bcrypt.checkpw(login_password, password_hash_db):
            raise HTTPException(status_code=400, detail=f"Invalid Email /UserName or Password , login pass :{login_password} and password hash {password_hash_db}")


        #compute expire time of JWT depending on UTC
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        # the data that we want save inside token
        token_payload = {
            "username": user["username"],
            "email": user["Email"], #changes from user["email"] to user["Email"]
            "exp": expire

        }

        create_token = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)

        #return token to user
        return {
            "create_token": create_token,
            "username": user["username"],
            "message": f"welcome {user['username']}"
        }



    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")



