import mysql.connector

def get_db():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="kimho13254@",
        database="talent_match"
    )
    return conn
