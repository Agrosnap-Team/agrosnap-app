#this file contain on @router.post("/save") ,@router.post("/delete")............

from fastapi import APIRouter,HTTPException,status
from app import database as db

database_instance = db.AgrosnapDatabase()

router = APIRouter()

