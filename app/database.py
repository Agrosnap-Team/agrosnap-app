import sqlite3
import os


class AgrosnapDatabase:

    def __init__(self, file_name='database.db'):

        # db_path : instance object
        # file_name : local variable it is destroyed when you exit the function
        self.db_path = file_name # this to make file_name instance object can reach from any place within class
        self.init_database()

    def _get_connection(self):
        # this def return connection with database.db file , conn is the object of connection
        # this connection factory also this '_" mean the def is privet you can't call from API
        # PRAGM this :
        conn = sqlite3.connect(self.db_path)
        conn.execute('PRAGMA foreign_keys = ON')
        return conn

    def init_database(self):


        # table for save users information
        query_users = '''CREATE TABLE IF NOT EXISTS users_info(
            user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            Email TEXT NOT NULL UNIQUE,
            PASSWORD_HASH TEXT NOT NULL
            
        ) '''

        # table fo store information abot plant ,disease and the treatment
        query_disease = """CREATE TABLE IF NOT EXISTS disease_Table (
                disease_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                plant_name TEXT NOT NULL,
                disease_name TEXT NOT NULL UNIQUE,
                organic_treatment TEXT,
                report TEXT
                
         )"""

        # this table let user bookmark  there  report to see it later
        #junction table connect user_info with disease_table
        query_save ="""CREATE TABLE IF NOT EXISTS Save_report (
            save_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER ,
            disease_id INTEGER ,
            confidence REAL NOT NULL,
            -- 'on delete cascade' this mean if row in the parent table is deleted ,all corresponding rows in the child (reference) table should automatically be deleted as well
            FOREIGN KEY (user_id) REFERENCES users_info (user_id) ON DELETE CASCADE,
            FOREIGN KEY (disease_id) REFERENCES disease_Table (disease_id ) ON DELETE CASCADE, 
            -- Prevent a user from saving the exact same disease record multiple times
            UNIQUE(user_id, disease_id)
            
        
        )"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query_users)
            cursor.execute(query_disease)
            cursor.execute(query_save)
            conn.commit()
        print("Agrosnap Database initialized successfully!")


    #this def to use to insert data into users_info
    def insert_into_users_info(self ,username,firstname,last_name,email,password):

        query = """INSERT INTO users_info (username, first_name, last_name, email, PASSWORD_HASH)
                            VALUES (?, ?, ?, ?, ?)"""
        # this is context manger "with " connect with database.db just_in_time

        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (username, firstname, last_name, email, password))
                conn.commit()
        except sqlite3.Error as  db_error:
            print(f"Error occured while inserting into users info: {db_error}")

    def get_user_by_id(self,user_id: int) -> dict:

        query = "SELECT user_id , username, first_name ,last_name, Email ,PASSWORD_HASH FROM users_info WHERE user_id = ?;"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (user_id,))
            return cursor.fetchall()

    # this def to insert data into disease_Table
    def insert_into_disease_Table(self,plant_name,disease_name,organic_treatment,report, confidence):

        """Inserts data into the disease_Table securely."""
        query = """INSERT OR IGNORE INTO disease_Table(plant_name, disease_name, organic_treatment, report)
                           VALUES (?, ?, ?, ?, ?)"""

        # this is context manger "with " connect with database.db just_in_time

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (plant_name, disease_name, organic_treatment, report, confidence))
            conn.commit()

    def insert_into_Save_report(self,user_id,disease_id):

        #Links a user to a disease report (Saves it to their history)

        query = """INSERT OR IGNORE INTO Save_report (user_id , disease_id,confidence)  VALUES (?,?,?)"""

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query ,(user_id , disease_id) )
            conn.commit()





    def Read_text_file (self,plant_name,disease_name,organic_treatment, confidence ):

        """Reads a local text file and saves its contents as a disease report."""
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "disease_report", f"{disease_name}.txt")

        # this is context manger "with " connect with database.db just_in_time

        try:
            with open(file_path, 'r') as file:
                print("Successfully opened file")
                file_content = file.read()

                # Call the object method via 'self' to insert data cleanly
                self.insert_into_disease_Table(
                    plant_name=plant_name,
                    disease_name=disease_name,
                    organic_treatment=organic_treatment,
                    report=file_content,
                    confidence=confidence
                )
        except FileNotFoundError:
            print(f"Error: file not found at {file_path}")

    def Delet_row_from_disease_table(self,disease_id):
        """Deletes a disease record by its ID."""
        query = "DELETE FROM disease_Table WHERE disease_id = ?;"

        # this is context manger "with " connect with database.db just_in_time

        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (disease_id,))
                conn.commit()

                if cursor.rowcount == 0:
                    return {"status": "not_found", "message": f"No disease found with ID {disease_id}."}
                return {"status": "success", "message": "Disease deleted successfully."}

        except sqlite3.Error as e:
            print(f"General database error during deletion: {e}")
            return {"status": "error", "message": "An unexpected database error occurred."}

    def Delet_row_from_user_table (self,user_id):
        """Deletes a user record by its ID."""
        query = "DELETE FROM users_info WHERE user_id = ?;"

        # this is context manger "with " connect with database.db just_in_time

        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (user_id,))
                conn.commit()

                if cursor.rowcount == 0:
                    return {"status": "not_found", "message": f"No user found with ID {user_id}."}
                return {"status": "success", "message": "User deleted successfully."}

        except sqlite3.Error as e:
            print(f"General database error during deletion: {e}")
            return {"status": "error", "message": "An unexpected database error occurred."}



    def Delete_From_save_report(self, save_report_id):
        #Removes a specific saved report from a user's history.

        query = ''' DELETE FROM save_report WHERE save_report_id = ? '''

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (save_report_id,))
            conn.commit()
            if cursor.rowcount == 0:
                return {"status": "not_found", "message": "Report not found in history."}

            return {"status": "success", "message": "Report deleted successfully."}


    def update_user(self, user_id: int, **kwargs) -> dict:
        """Dynamically updates user fields safely."""
        if not kwargs:
            return {"status": "no_change", "message": "No data provided."}

        set_clause = ", ".join([f"{column} = ?" for column in kwargs.keys()])
        values = list(kwargs.values())
        values.append(user_id)

        query = f"UPDATE users_info SET {set_clause} WHERE user_id = ?"

        # this is context manger "with " connect with database.db just_in_time

        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, values)
                conn.commit()

                if cursor.rowcount == 0:
                    return {"status": "not_found", "message": f"No user found with ID {user_id}."}
                return {"status": "success", "message": "User updated successfully."}
        except sqlite3.Error as e:
            return {"status": "error", "message": f"Database error: {e}"}



    def update_disease(self, disease_id: int, **kwargs) -> dict:
        """Dynamically updates fields for a specific disease record."""
        if not kwargs:
            return {"status": "no_change", "message": "No data provided to update."}

        set_clause = ", ".join([f"{column} = ?" for column in kwargs.keys()])
        values = list(kwargs.values())
        values.append(disease_id)

        query = f"UPDATE disease_Table SET {set_clause} WHERE disease_id = ?"

        # this is context manger "with " connect with database.db just_in_time

        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, values)
                conn.commit()

                if cursor.rowcount == 0:
                    return {"status": "not_found", "message": f"No disease record found with ID {disease_id}."}
                return {"status": "success", "message": "Disease record updated successfully."}

        except sqlite3.Error as e:
            print(f"Database error during disease update: {e}")
            return {"status": "error", "message": f"An unexpected database error occurred: {e}"}



    def get_user_report(self , user_id: int) -> list:
        #this function to get the report that user bookmark in history
        # user_id: int -> ths hint mean  enter integer value
        #-> list: mean the data type of return will be as list

        query = """
                    SELECT r.save_id, d.plant_name, d.disease_name, d.organic_treatment,  d.report
                    FROM Save_report r
                    JOIN disease_Table d ON r.disease_id = d.disease_id
                    WHERE r.user_id = ?;
                """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (user_id,))
            # Returns a list of tuples containing all saved reports for this user
            return cursor.fetchall()

    def get_detalts_report(self , save_id: int) -> list:
      pass 


    def get_disease_by_id(self, disease_id : int) :
        # fetches disease report using unique ID (match with AI model  index)
        query = "SELECT disease_id, plant_name, disease_name, organic_treatment, report  FROM disease_Table WHERE disease_id = ?;"
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query,(disease_id,))
            return cursor.fetchall()


    def get_user_by_email(self, email:str):
        # Fetches user details using their unique email (used during Login & JWT generation).

        query = """SELECT user_id ,username,  first_name ,last_name, Email ,PASSWORD_HASH FROM users_info WHERE email = ?;"""

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query,(email,))
            return cursor.fetchall()















if __name__ == '__main__':
    db = AgrosnapDatabase()
    db.init_database()

    # db.insert_into_users_info("tala","tala","sharayre","talasharayre@gmail.com","123456")
    print(  db.get_user_by_id(4))

    # print(db.get_user_by_email("raadAlshrayre@gmail.com"))

    # print(db.Delet_row_from_disease_table(disease_id=10))
    # print(db.Delet_row_from_disease_table(disease_id=11))

    #print(db.get_user_report(user_id=1))
    # print(db.get_disease_by_id(disease_id=9))






    # import sqlite3
    #
    # connection = sqlite3.connect('database.db')
    # cursor = connection.cursor()
    #
    # query = """ SELECT r.save_id, d.plant_name, d.disease_name, d.organic_treatment, d.confidence, d.report
    #            FROM Save_report r JOIN  disease_Table d WHERE r.user_id = 1"""
    #
    # cursor.execute(query)
    # print(cursor.fetchall())




    # here is where the call __init__


    # db.insert_into_Save_report(user_id=1,disease_id=10)
    # db.insert_into_Save_report(user_id= 2, disease_id=10)




    # db.update_user(user_id=110,username='mohammed')
    # db.update_user(user_id=1 , username='Tala')
    # db.update_user(user_id= 2, username='Assel')
    # db.update_user(user_id=110,PASSWORD_HASH='1245')

    #db.update_user(user_id=8 , PASSWORD_HASH='6666')
    # print( db.update_user(user_id=1))
    # print(db.update_user(user_id=8 , PASSWORD_HASH='6666')


    # db.Read_text_file("tomato","towspotted_spider_mite","see report details","50")








    # db.insert_into_users_info('RAAD', 'HOSSAM', 'SHARAYRE', 'raadAlshrayre@gmail.com', '114788')


    # db.insert_into_users_info()





    # db.insert_into_users_info('tala','tala','sharayre','talaShare@gmail.com','123456')
    # db.insert_into_users_info('assel','ahmade','khanfar','asselkhanafar@gmail.com','1147')







    # #file_path = r"C:\Users\user\PycharmProjects\Agrosnap\app\disease_report\yellow_leaf_curl_virus.txt"
    # file_path = r"disease_report\yellow_leaf_curl_virus.txt" #this is short path
    #
    # try:
    #
    #     with open(file_path,'r') as file:
    #          disease_report = file.read()
    #
    #     db.insert_into_disease_Table(
    #        "tomato",
    #        "target_spot",
    #        "via treatment",
    #        report=disease_report,
    #        confidence="70%"
    #
    #     )
    #     print('Done! Report has been successfully saved.')
    #
    # except FileNotFoundError:
    #     print('Error: the file was not found at :{file_path}')
    #
    #     self.cursor.close()


















