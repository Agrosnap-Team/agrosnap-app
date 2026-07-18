#this file contain on @router.post("/save") ,@router.post("/delete")............

from fastapi import APIRouter,HTTPException,status
from app import database as db
from app.routers.schema_classes import Data_to_save


database_instance = db.AgrosnapDatabase()

router = APIRouter()

def Save_reports(data_to_save :Data_to_save):

    pass




