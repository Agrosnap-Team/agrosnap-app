# this file contain @router.post ("/signup") @router.post("/login")


from fastapi import  HTTPException, APIRouter,Body
from app import database as db
import bcrypt
import jwt
from datetime import datetime ,timedelta,timezone
from app.routers.schema_classes import userSign_in, Data_of_Token,UserSign_Up

database_instance = db.AgrosnapDatabase()



# setting of JWT this is the super key of the token
SECRET_KEY = "SUPER_SECRET_KEY_DONT_TELL_ANYONE"

# the algorthm use to encrypt the token
ALGORITHM = "HS256"
#expier of token
ACCESS_TOKEN_EXPIRE_MINUTES = 2

# instantiation an isolated router
router = APIRouter()





@router.post("/signup")  # this called decorator tell app to save this URL
def signup(user_data: UserSign_Up):
    # check if email is already existe
    try:
        email_existe = database_instance.get_user_by_email(email=user_data.email )
        if email_existe:
            raise HTTPException(status_code=400, detail="Email or Username is already registered")

        # check if username is already existe

        username_existe = database_instance.get_user_by_username(username=user_data.username)
        if username_existe:
            raise HTTPException(status_code=400, detail="Email or Username is already registered")


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


# function that create the token
def create_access_token(token_payload: Data_of_Token):
    # this variable save data token that convert from pydantic class to dictionary because jwt library does not understand pydantic object (token_payload) it is just deal with dict
    # .model_dum this is the methode use for convert to dictionary
    data_to_but_in_token = token_payload.model_dump()
    print(data_to_but_in_token)

    # compute expire time of JWT depending on UTC
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    #merge expire  time with  token
    data_to_but_in_token.update({"exp": expire})

    # encode the token
    create_encod_token = jwt.encode( data_to_but_in_token, SECRET_KEY, algorithm=ALGORITHM)

    return create_encod_token

@router.post("/decoding")
def Token_decoding(data_token : str = Body(..., embed=True)):

   try :

       get_payload = jwt.decode(data_token, SECRET_KEY, algorithms=[ALGORITHM])

       user_id = get_payload.get("user_id")
       username = get_payload.get("username")
       Email = get_payload.get("Email")
       first_name = get_payload.get("first_name")
       last_name = get_payload.get("last_name")

       return {"user_id": user_id, "username": username, "email": Email , "first_name": first_name, "last_name": last_name}


   except jwt.ExpiredSignatureError:
       # if token is expire
       raise HTTPException(status_code=401, detail="Token has expired!")

   except jwt.JWTError:
       # if the token was fake
       raise HTTPException(status_code=400, detail="Invalid Token")



@router.post("/login")
def login(login_data: userSign_in):
    try:
        user = database_instance.get_user_by_identifier(login_data.identifier)
        # check if user is registered .
        # if get user by identifier return None the condition  "if not user" is like  ask if None this mean  no user  then raise exception
        if not user:
            raise HTTPException(status_code=400, detail="User not registered")

        #convert the password that enter to bytes for exampl if we enter Tala#123 -> b'Tala#123'
        login_password = login_data.password.encode('utf-8')
        #convert the hash password that store on database to bytes
        password_hash_db= user["PASSWORD_HASH"].encode('utf-8')

        # check if password that user enter matching what was sorted in database
        if not bcrypt.checkpw(login_password, password_hash_db):
            raise HTTPException(status_code=400, detail=f"Invalid Email /UserName or Password ")

        # create object  from Data_of_token
        payload_token = Data_of_Token (user_id=str(user["user_id"]), username = user["username"], Email = user[ "Email"] )

        # call function that create token send to it payload
        create_token = create_access_token(payload_token)

        return {"create_token": create_token,
                "token_type": "bearer",
                "user_info":{"first_name": user["first_name"],
                             "last_name": user["last_name"],}

                }


    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")








