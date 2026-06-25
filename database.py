import sqlite3
import os


class AgrosnapDatabase:
    def __init__(self):
        self.connection = sqlite3.connect('database.db')
        self.cursor = self.connection.cursor()

        # table for save users information
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS users_info(
            user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            Email TEXT NOT NULL UNIQUE,
            PASSWORD_HASH TEXT NOT NULL
            
        ) ''')

        # table fo store information abot plant ,disease and the treatment
        self.cursor.execute("""CREATE TABLE IF NOT EXISTS disease_Table (
                disease_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                plant_name TEXT NOT NULL,
                disease_name TEXT NOT NULL UNIQUE,
                organic_treatment TEXT,
                report TEXT,
                confidence REAL
                
         )""")

        # this table let user bookmark the theport to see it later
        #junction table connect user_info with disease_atble
        self.cursor.execute("""CREATE TABLE IF NOT EXISTS Save_report (
            save_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER ,
            disease_id INTEGER ,
            FOREIGN KEY (user_id) REFERENCES users_info (user_id) ON DELETE CASCADE,
            FOREIGN KEY (disease_id) REFERENCES disease_Table (disease_id ) ON DELETE CASCADE,
            -- Prevent a user from saving the exact same disease record multiple times
            UNIQUE(user_id, disease_id)
        
        )""")

        self.connection.commit()
        print("Agrosnap Database connected and initialized successfully!")


    #this def to use to insert data into users_info
    def insert_into_users_info(self ,username,firstname,last_name,email,password):

        query = """INSERT OR IGNORE INTO users_info (username, first_name, last_name, email, PASSWORD_HASH)
                    VALUES ( ?, ?, ?, ?, ?)"""

        self.cursor.execute(query, ( username, firstname, last_name, email, password))
        self.connection.commit()

    # this def to insert data into disease_Table
    def insert_into_disease_Table(self,plant_name,disease_name,organic_treatment,report, confidence):

        query = """ INSERT OR IGNORE INTO disease_Table(plant_name,disease_name,organic_treatment,report, confidence)
           VALUES (  ?, ?, ?, ?, ?) """

        self.cursor.execute(query,(plant_name,disease_name,organic_treatment,report, confidence))
        self.connection.commit()

    def Read_text_file (self,plant_name,disease_name,organic_treatment, confidence ):

        # file_path = input("please inter file path")
        base_dir =  os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "disease_report",f"{disease_name}.txt")


        try:
            with open(file_path , 'r' ) as file:
                print("successfully opened file")
                file_content = file.read()

                self.insert_into_disease_Table(
                    plant_name=plant_name,
                    disease_name=disease_name,
                    organic_treatment=organic_treatment,
                    report=file_content,
                    confidence=confidence
                )
        except FileNotFoundError:
            print("Error: file not found")

    def Delet_row_from_disease_table(self,disease_id):
        query = " DELETE FROM disease_Table WHERE disease_id = ?; "

        #Try to execute the deletion
        try:
            self.cursor.execute(query, (disease_id,))
            self.connection.commit()# Make sure to commit the transaction!

            # Check if the row actually existed and was deleted
            if self.cursor.rowcount == 0:
                #If it returns 0, it means no rows matched that ID (ID not found).
                return {"status": "not_found", "message": f"No disease found with ID {disease_id}."}
            # If it returns 1 (or more), the deletion was successful.
            return {"status": "success", "message": "Disease deleted successfully."}


        except sqlite3.Error as e:
            #  other database issues (syntax, constraints,file_lock  ,etc.)

            print(f"General database error: {e}")
            return {"status": "error", "message": "An unexpected database error occurred."}

    def Delet_row_from_user_table (self,user_id):
        query = " DELETE FROM users_info WHERE user_id = ?; "
        try:
            self.cursor.execute(query, (user_id,))
            self.connection.commit()

            if self.cursor.rowcount == 0:
                return {"status": "not_found", "message": f"No user found with ID {user_id}."}
            return {"status": "success", "message": "User deleted successfully."}

        except sqlite3.Error as e:
            print(f"General database error: {e}")
            return {"status": "error", "message": "An unexpected database error occurred."}





    # destructor this def close the connection automatcly you do not need to call
    def __del__(self):
        #hasattr[has attribute] built_in function chick on connection first
        if hasattr(self, "connection") and self.connection : # in the  first ask if variable connection are created inside class and if variable exist what is there value is true ?
            #close the connection with databae
            self.connection.close()
            print("database connection closed")



if __name__ == '__main__':

    # here is where the call __init__
    db = AgrosnapDatabase()
    db.insert_into_users_info('RAAD', 'HOSSAM', 'SHARAYRE', 'raadAlshrayre@gmail.com', '114788')

    #db.Read_text_file("tomato","towspotted_spider_mite","see report details","50")

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


















