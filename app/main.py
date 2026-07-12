
import re

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr,field_validator,model_validator
from app import database as db
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

database_instance = db.AgrosnapDatabase()


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
            raise HTTPException(status_code=400, detail="Invalid Email /UserName or Password")


        #compute expire time of JWT depending on UTC
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        # the data that we want save inside token
        token_payload = {
            "username": user["username"],
            "Email": user["Email"],
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










# {
#   "username": "toto",
#   "first_name": "aseel",
#   "last_name": "sharayre",
#   "email": "aseelsharayre@gmail.com",
#   "PASSWORD_HASH": "Aseel2003&",
#   "confirm_password": "Aseel2003&"
#
# }