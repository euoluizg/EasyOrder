import psycopg2
import os

def createConnection():
    # Cria uma conexão com o barco de dados (Local ou nuvem).

    try:
        database_url = os.getenv("DATABE_URL")
        if database_url:
            conn = psycopg2.connect(database_url)
        else:
            conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao DB: {e}")
        return None