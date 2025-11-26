from ..config.db import createConnection
import psycopg2
import psycopg2.errors
import uuid
from ..utils.qrCodeGenerator import generateQrBase64

def createDesk(deskNumber, capacity):
    # Service para criar uma nova mesa e gera o QR code.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None

    qrCodeUid = str(uuid.uuid4()) # Gera um ID único para o QR code

    try:
        cursor = conn.cursor()
        insertQuery = """
            INSERT INTO desks (deskNumber, qrCodeUid, capacity)
            VALUES (%s, %s, %s)
            RETURNING idDesk, deskNumber, qrCodeUid, capacity;
        """
        cursor.execute(insertQuery, (deskNumber, qrCodeUid, capacity))

        newDesk = cursor.fetchone()

        conn.commit()

        urlApp = f"http://melos.dev.br/easyorder/mesa?uid={qrCodeUid}" 
        qrCodeImage = generateQrBase64(urlApp)  # Gera o QR code em base64

        print("Mesa inserida com sucesso.")
        return {
            "desk": {
                "idDesk": newDesk[0],
                "deskNumber": newDesk[1],
                "qrCodeUid": newDesk[2],
                "capacity": newDesk[3]
            },
            "qrCodeImage": f"data:image/png;base64,{qrCodeImage}"
        }, 201
    except psycopg2.errors.UniqueViolation as e:
        conn.rollback()
        return {"error": "Já existe uma mesa com esse número ou QR Code."}, 409
    except Exception as e:
        conn.rollback()
        print(f"Erro ao inserir mesa: {e}")
        return {"error": str(e)}, 400
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def getAllDesk():
    # Service para obter todas as mesas.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        selectQuery = """
            SELECT idDesk, deskNumber, qrCodeUid, capacity, condition From desks ORDER by deskNumber;
        """
        cursor.execute(selectQuery)

        deskList = []
        for desk in cursor.fetchall():
            deskList.append({
                "idDesk": desk[0],
                "deskNumber": desk[1],
                "qrCodeUd": desk[2],
                "capacity": desk[3],
                "condition": desk[4] # Ex: 'livre', 'ocupada', 'reservado', 'manutenção'
            })
        return deskList, 200
    
    except Exception as e:
        print(f"Erro ao buscar mesas: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def updateDeskToCondition(deskId, data):
    # Service para atualizar uma mesa.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
   
    allowedFields = {'deskNumber', 'qrCodeUid', 'capacity', 'condition'}
    fieldToUpdate = []
    values = []

    for key, value in data.items():
        if key in allowedFields:
            fieldToUpdate.append(f"{key} = %s")
            values.append(value)

    if not fieldToUpdate:
        return {"error": "Nenhum campo válido para atualizar"}, 400
    
    values.append(deskId)
    updateQuery = f"UPDATE desks SET {', '.join(fieldToUpdate)} WHERE idDesk = %s RETURNING idDesk, deskNumber, qrCodeUid, capacity, condition;"
   
    try:
        cursor = conn.cursor()
        cursor.execute(updateQuery, tuple(values))
        
        updateUserAdmin = cursor.fetchone()
        if updateUserAdmin is None:
            return {"error": "Usuário não encontrado"}, 404

        conn.commit()
        
        print("Mesa atualizada com sucesso.")
        return {
            "idDesk": updateUserAdmin[0],
            "deskNumber": updateUserAdmin[1],
            "qrCodeUid": updateUserAdmin[2],
            "capacity": updateUserAdmin[3],
            "condition": updateUserAdmin[4]
        }, 200

    except Exception as e:
        conn.rollback()
        if "unique constraint" in str(e).lower():
            return {"error": "Já existe uma mesa com esse número ou QR Code."}, 409
        print(f"Erro ao atualizar mesa: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def deleteDesk(deskId):
    # Service para deletar uma mesa.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None

    try:
        cursor = conn.cursor()
        deleteQuery = "DELETE FROM desks WHERE idDesk = %s RETURNING idDesk;"
        cursor.execute(deleteQuery, (deskId,))

        deletedDesk = cursor.fetchone()
        if deletedDesk is None:
            return {"error": "Mesa não encontrada"}, 404

        conn.commit()
        print("Mesa deletada com sucesso.")
        return {"message": "Mesa deletada com sucesso."}, 200

    except psycopg2.errors.ForeignKeyViolation:
        conn.rollback()
        return {"error": "Não é possível deletar a mesa, pois ela está associada a outros registros."}, 409

    except Exception as e:
        conn.rollback()
        print(f"Erro ao deletar mesa: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def getDeskInfo(idDesk):
    # Service: Busca informações básicas da mesa (Público).
    conn = createConnection()
    if conn is None: return {"error": "DB failed"}, 500
    cursor = None
    try:
        cursor = conn.cursor()
        # Busca apenas o número da mesa
        query = "SELECT deskNumber FROM desks WHERE idDesk = %s;"
        cursor.execute(query, (idDesk,))
        result = cursor.fetchone()
        
        if result is None:
            return {"error": "Mesa não encontrada"}, 404
            
        return {"deskNumber": result[0]}, 200
    except Exception as e:
        return {"error": str(e)}, 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()