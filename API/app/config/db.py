import psycopg2

def createConnection():
    try:
        connection = psycopg2.connect(
            dbname="EasyOrder",
            user="postgres",
            password="150322",
            host="localhost",
            port="5432"
        )
        print("Database connection established")
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None