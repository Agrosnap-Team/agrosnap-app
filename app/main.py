import re

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr,field_validator
from app import database as db
import bcrypt


app =  FastAPI() # this is the CEO have archive (contains all URL & Method write in this class)

database_instance = db.AgrosnapDatabase()


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
            raise HTTPException(status_code=400, detail="Password must contain only digits")

        # check if password has at lest one small letter
        if not any(char.islower() for char in v):
            raise HTTPException(status_code=400, detail="Password must contain only letters")

        # check if password has at lest one small letter
        if not any(char.isupper() for char in v):
            raise HTTPException(status_code=400, detail="Password must contain only uppercase letters")

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

        # hash_password = pwd_hash.hash(user_data.PASSWORD_HASH)
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



@app.post("/login")
def login(user_data: userSign_in): # login into user account
    try:
        check_existe_user = database_instance.get_user_by_email(email=user_data.email)


    


