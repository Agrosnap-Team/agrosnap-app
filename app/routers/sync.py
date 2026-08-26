import sqlite3
import os
from fastapi import APIRouter, HTTPException, status

router = APIRouter()



@router.get("/diseases")
def sync_diseases_to_indexeddb() -> dict:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Adjust path if routers folder is nested inside app
    db_path = os.path.join(base_dir, "..", "database.db")

    #connect with database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Access columns by name
    cursor = conn.cursor()

    try:
        # Fetch all records from disease_Table
        query = """
            SELECT disease_id, disease_name, organic_treatment, report
            FROM disease_Table
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        diseases_list = []
        for row in rows:
            diseases_list.append(
                {
                    "disease_id": row["disease_id"],
                    "disease_name": row["disease_name"],
                    "organic_treatment": row["organic_treatment"],
                    "report": row["report"],
                }
            )

        return {
            "status": "success",
            "diseases": diseases_list,
        }

    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during sync: {str(e)}",
        )

    finally:
        conn.close()