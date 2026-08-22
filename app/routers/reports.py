#this file contain on @router.post("/save") ,@router.post("/delete")............
import jwt
from fastapi import APIRouter,HTTPException,Depends
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from app import database as db
from app.routers.authentication import Token_decoding
from app.routers.schema_classes import SaveReportRequest
import sqlite3
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


database_instance = db.AgrosnapDatabase()

router = APIRouter()
# define the security system
# HTTPBearer is response about detect if the token sent with request in header
# after check the HTTPBearer will but the token data in  HTTPAuthorizationCredentials
security = HTTPBearer()

# this depends function by this def we get the data of user via "token_decoding"
def get_info_current_user(crdentials : HTTPAuthorizationCredentials = Depends(security) ):

    # this will return the token
    token = crdentials.credentials

    try:
        user_info= Token_decoding(token)
        return user_info
    except Exception :
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# this code for save the result after apper for user and depends on the get_inf_current_user
@router.post("/save")
def Save_scan_report(request_data : SaveReportRequest , user_info : dict = Depends(get_info_current_user)) -> dict:

    # get the user_id from the token we  had decode
    user_id = user_info.get("user_id")

    #connect with database
    conn = sqlite3.connect("./app/database.db")
    cursor = conn.cursor()

    try:
        query ="INSERT INTO Save_report(save_id,user_id ,disease_id ,plant_name ,confidence , created_at ) VALUES (?,?,?,?,?,?)"

        cursor.execute(query
                     ,(request_data.save_id,
                       user_id,
                       request_data.disease_index ,
                       request_data.plant_name if request_data.plant_name else "Disease Report", # in case user dose not entre name when save report , by default save as "Disease Report "
                       f"{request_data.confidence:.2f}%",
                       request_data.created_at))
        conn.commit()
        return {"status": "success" ,"message": "Successfully Save Report"}


    except sqlite3.Error as db_error:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
    finally:
        conn.close()



# function to let user get there won save_report
@router.get("/report")
def my_Report(user_info : dict = Depends(get_info_current_user)) ->list :

    # get the user_id from the token we  had decode
    user_id = user_info.get("user_id")

    # connect with database
    conn = sqlite3.connect("./app/database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()


    try:
        query = ("SELECT sr.save_id , sr.plant_name ,sr.confidence ,"
                 " dt.disease_name , dt.organic_treatment , dt.report AS disease_description  FROM Save_report sr"
                " INNER JOIN disease_Table dt ON sr.disease_id = dt.disease_id  where sr.user_id = ?")
        cursor.execute(query,(user_id,))
        rows = cursor.fetchall()


        # create list of dictionary to return more than one report if user have multi report
        # also we convert the result of sql from list of tuple to list of dictionary , because FastAPI can not deal with list of tuple and convert to jason
        list_reports=[]
        for row in rows:
            list_reports.append(
                {
                    "save_id": row["save_id"],
                    "plant_name": row["plant_name"],
                    "confidence": row["confidence"],
                    "disease_name": row["disease_name"],
                    "organic_treatment": row["organic_treatment"],
                    "disease_description": row["disease_description"]
                }
            )
        return list_reports


    except sqlite3.Error as db_error:

        raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")

    finally:

        conn.close()




