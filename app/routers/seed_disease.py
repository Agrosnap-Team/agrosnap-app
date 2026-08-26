import json
import sqlite3
import os
from pathlib import Path


def seed_disease_insert_into_table():
    # let the os find the file
    base_dir = Path(__file__).resolve().parent.parent
    json_path = base_dir / "disease_report"/"disease.json"


    # Build reliable paths using os.path.join
    db_path = os.path.join(base_dir, "database.db" )

    # Verify JSON file existence
    if not os.path.exists(json_path):
        print(f"Error: File not found at path: {json_path}")
        return

    # 2. Read and parse the JSON file
    with open(json_path , "r" , encoding="utf-8") as file:
        diseases_data = json.load(file)

    # 3. connection to SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 4. Loop through the list and insert each field into its specific column
        for item in diseases_data:
            cursor.execute("""
                    INSERT INTO disease_Table (disease_name, organic_treatment, report)
                    VALUES (?, ?, ?)
                """, (
                item["disease_name"],
                item["organic_treatment"],
                item["report"]
            ))

        conn.commit()
        print(f"Successfully inserted {len(diseases_data)} diseases into disease_Table.")

    except sqlite3.Error as e:
        conn.rollback()
        print(f"Database error while seeding: {e}")

    finally:
        conn.close()

if __name__ == "__main__":
    seed_disease_insert_into_table()


