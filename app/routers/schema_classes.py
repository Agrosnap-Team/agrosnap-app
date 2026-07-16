
from pydantic import BaseModel, EmailStr,field_validator,model_validator
import re


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
         raise ValueError("Password must be at least 8 characters long")

         # check if password have at lest one digit
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")

        # check if password has at lest one small letter
        if not any(char.islower() for char in v):
            raise ValueError("Password must contain at least one lowercase letter")

        # check if password has at lest one cabital letter(upper)
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")

        # check on password if have any (symbol/ special character)
        if not re.search(r"[@$!%*?&#_.:+-]", v):
            raise ValueError("Password must contain at least one special character (e.g., @, $, !, %, *, #)")
        return v

    @model_validator(mode='after')
    def check_confirm_password(self):
        if self.confirm_password != self.PASSWORD_HASH:
            raise ValueError("Password does not match")
        return self


#class schema of data token
class Data_of_Token(BaseModel):
    user_id: str
    username: str
    Email : EmailStr


#class schema of login
class userSign_in(BaseModel):
    identifier : str # get email / username
    password :str

