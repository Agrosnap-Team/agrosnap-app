from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import app.database as DB

app =  FastAPI() # this is the CEO have archive (contains all URL & Method write in this class)


class UserSign_up(BaseModel): # pydantic class that will tell Aseel what data to be passed
    email: EmailStr
    password: str
    username: str

    @app.post("/signup")  # this called decorator tell app to save this URL 
    def sigup(user_data: UserSign_up):
        # farst check if user is registered in database 
        try:
            user_existe = DB.db.get_user_by_email(user_data.email)
            if user_existe:
                raise HTTPException(status_code=400,detail="this email is already registered")
            
            # if not exist add_new_user 
            DB.db.insert_into_users_info(user_data.email, user_data.username, user_data.password)
            
            return {"status":"success" , "message":f"user{user_data.username} registered successfully"}
        except HTTPException as http_ex:
            raise http_ex
        except Exception as e:
            raise HTTPException(status_code=500,detail= f"this error occured :str {e}")
        
            
            

    
    


