from ..config.db import createConnection
from ..utils.security import hashPassword, checkPassword
from flask_jwt_extended import create_access_token
import psycopg2.errors

def registerClient(name, password, email=None, phone=None):
    # service para criar um novo cliente (com email ou telefone).

    hashedPassword = hashPassword(password)

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        insertQuery = """
            INSERT INTO clients (name, email, phone, password)
            VALUES (%s, %s, %s, %s)
            RETURNING idClient, name, email, phone;
        """
        cursor.execute(insertQuery, (name, email, phone, hashedPassword))

        newClient = cursor.fetchone()
        conn.commit()
        
        print("Cliente inserido com sucesso.")
        return {
            "idClient": newClient[0],
            "name": newClient[1],
            "email": newClient[2],
            "phone": newClient[3]
        }, 201
    
    except psycopg2.errors.UniqueViolation as e:
        conn.rollback()
        return {"error": "Email ou telefone já estão em uso."}, 409 # 409 = Conflict
    except psycopg2.errors.CheckViolation as e:
        conn.rollback()
        return {"error": "Email ou Telefone são obrigatórios."}, 400
    except Exception as e:
        conn.rollback()
        print(f"Erro ao inserir cliente: {e}")
        return {"error": str(e)}, 400
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def loginClient(loginIndetifier, password):
    # Service para login do cliente. Pode ser usado email ou telefone como identificador.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        selectQuery = """
            SELECT idClient, name, email, phone, password
            FROM clients
            WHERE (email = %s OR phone = %s) AND active = TRUE;
        """
        cursor.execute(selectQuery, (loginIndetifier, loginIndetifier))
        clientData = cursor.fetchone()

        if clientData is None:
            return {"error": "Credenciais inválidas"}, 404
        
        clientId, name, email, phone, hashedPassword = clientData

        if checkPassword(hashedPassword, password):
            print("Login de cliente bem-sucedido.")

            identity = str(clientId)
            additionalClaims = {
                "type": "client",
                "name": name
            }
            accessToken = create_access_token(identity=identity, additional_claims=additionalClaims)
            return{
                "message": f"Bem-vindo, {name}!",
                "accessToken": accessToken
            }, 200
        else:
            return {"error": "Credenciais inválidas"}, 401
    except Exception as e:
        print(f"Erro ao fazer login do cliente: {e}")
        return {"error": str(e)}, 400
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def getClientById(idClient):
    # Service para buscar um cliente pelo ID.

    conn = createConnection()
    if conn is None:
        return{"error": "Database connection failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        selectQuery = """
            SELECT idClient, name, email, phone, dateRegister
            FROM clients
            WHERE idClient = %s
        """
        cursor.execute(selectQuery, (idClient,))
        clientData = cursor.fetchone()
        if clientData is None:
            return {"error": "Cliente não encontrado"}, 404
        
        client = {
            "idClient": clientData[0],
            "name": clientData[1],
            "email": clientData[2],
            "phone": clientData[3]
        }
        return client, 200

    except Exception as e:
        print(f"Erro ao buscar cliente: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def updateClient(idClient, data):
    # Service para atualizar os dados do cliente.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
    
    allowedFields = ['name', 'email', 'phone', 'password']
    fieldsToUpdate = []
    values = []

    for key, value in data.items():
        if key in allowedFields:
            if key == 'password':
                if value and isinstance(value, str):
                    fieldsToUpdate.append(f"password = %s")
                    values.append(hashPassword(value))
            else:
                fieldsToUpdate.append(f"{key} = %s")
                values.append(value)

    if not fieldsToUpdate:
        return {"error": "Nenhum campo válido para atualizar"}, 400
    
    values.append(idClient)
    updateClient = f"UPDATE clients SET {', '.join(fieldsToUpdate)} WHERE idClient = %s RETURNING idClient, name, email, phone;"

    try:
        cursor = conn.cursor()
        cursor.execute(updateClient, tuple(values))

        updateClient = cursor.fetchone()
        if updateClient is None:
            return {"error": "Usuário não encontrado"}, 404
        
        conn.commit()

        client = {
            "idClient": updateClient[0],
            "name": updateClient[1],
            "email": updateClient[2],
            "phone": updateClient[3]
        }
        print("Usuário atualizado com sucesso.")
        return client, 200
    
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return {"error": f"Email ou telefone já estão em uso."}, 409
    except Exception as e:
        conn.rollback()
        print(f"Erro ao atualizar usuário: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def deleteClient(idClient):
    # Service para "deletar" um cliente. Desativa.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed."}, 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        query = "UPDATE clients SET active =  FALSE WHERE idClient = %s RETURNING idClient, name;"
        cursor.execute(query, (idClient,))

        deletedClient = cursor.fetchone()

        if deletedClient is None:
            return {"error": "Cliente não encontrado."}, 404
        
        conn.commit()
        return {"message": f"Cliente '{deletedClient[1]}' foi desativado com sucesso."}, 200
    except Exception as e:
        conn.rollback()
        print(f"Erro ao desativar cliente: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

