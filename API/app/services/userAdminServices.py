from ..config.db import createConnection
from ..utils.security import hashPassword, checkPassword
from flask_jwt_extended import create_access_token

def registerUserAdmin(name, password, email, type):
    # service para criar um novo usuário admin.

    hashedPassword = hashPassword(password)

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        insertQuery = """
            INSERT INTO usersAdmin (name, email, password, type)
            VALUES (%s, %s, %s, %s)
            RETURNING idUser, name, email, type;
        """
        cursor.execute(insertQuery, (name, email, hashedPassword, type))

        newUser = cursor.fetchone()

        conn.commit()
        print("Usuário inserido com sucesso.")
        return {
            "idUser": newUser[0],
            "name": newUser[1],
            "email": newUser[2],
            "type": newUser[3]
            }, 201
    except Exception as e:
        conn.rollback()
        print(f"Erro ao inserir usuário: {e}")
        return {"error": str(e)}, 400
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def loginUserAdmin(email, password):
    #  Service para login do usuário admin.
    
    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        selectQuery = """
            SELECT idUser, name, email, password, type
            FROM usersAdmin
            WHERE email = %s
        """
        cursor.execute(selectQuery, (email,))
        userData = cursor.fetchone()

        if userData is None:
            return {"error": "Usuário não encontrado"}, 404
        
        userId, name, email, hashedPassword, userType = userData
        
        if checkPassword(hashedPassword, password):

            updateLoginQuery = """
                UPDATE usersAdmin
                SET lastLogin = CURRENT_TIMESTAMP
                WHERE idUser = %s
            """
            cursor.execute(updateLoginQuery, (userId,))
            conn.commit()

            print("Login bem-sucedido.")
            
            identity = str(userId) 
 
            additionalClaims = {
                "type": userType
            }

            accessToken = create_access_token(identity=identity, additional_claims=additionalClaims)
            return {
                "message": f"Login bem-sucedido, bem-vindo {name}!",
                "access_token": accessToken
                }, 200
        else:
            return {"error": "Senha incorreta"}, 401 # 401 = Unauthorized
        
    except Exception as e:
        conn.rollback()
        print(f"Erro ao realizar login: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def getAllUserAdmin():
    # Service para buscar todos os usuários admin.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        
        # Nunca retorne a senha, mesmo que criptografada
        query = "SELECT idUser, name, email, type, active, lastLogin FROM usersAdmin ORDER BY name;"
        cursor.execute(query)
        
        users_list = []
        for userData in cursor.fetchall():
            users_list.append({
                "idUser": userData[0],
                "name": userData[1],
                "email": userData[2],
                "type": userData[3],
                "active": userData[4],
                "lastLogin": userData[5]
            })
            
        return users_list, 200

    except Exception as e:
        print(f"Erro ao buscar usuários: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def getUserAdminById(idUser):   
    # Service para buscar um usuário admin pelo ID.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        
        # Nunca retorne a senha, mesmo que criptografada
        query = "SELECT idUser, name, email, type, active, lastLogin FROM usersAdmin WHERE idUser = %s;"
        cursor.execute(query, (idUser,))
        
        userData = cursor.fetchone()
        if userData is None:
            return {"error": "Usuário não encontrado"}, 404

        user = {
            "idUser": userData[0],
            "name": userData[1],
            "email": userData[2],
            "type": userData[3],
            "active": userData[4],
            "lastLogin": userData[5]
        }
            
        return user, 200

    except Exception as e:
        print(f"Erro ao buscar usuário: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def updateUserAdmin(userId, data):
    # Service para atualizar os dados de um usuário admin.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None

    allowedFields = ['name', 'email', 'password', 'type', 'active']
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

    values.append(userId)
    updateQuery = f"UPDATE usersAdmin SET {', '.join(fieldsToUpdate)} WHERE idUser = %s RETURNING idUser, name, email, type;"

    try:
        cursor = conn.cursor()
        cursor.execute(updateQuery, tuple(values))
        conn.commit()
        
        print("Usuário atualizado com sucesso.")
        return {"message": "Usuário atualizado com sucesso."}, 200

    except Exception as e:
        conn.rollback()
        if "unique constraint" in str(e).lower():
            return {"error": f"O email '{data.get('email')}' já está em uso."}, 400
        
        print(f"Erro ao atualizar usuário: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def deleteUserAdmin(userId):
    # Service para deletar um usuário admin.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        deleteQuery = "DELETE FROM usersAdmin WHERE idUser = %s RETURNING idUser, name;"
        cursor.execute(deleteQuery, (userId,))
        deletedUser = cursor.fetchone()
        conn.commit()

        if deletedUser:
            print(f"Usuário deletado com sucesso: {deletedUser[1]}")
            return {"message": f"Usuário deletado com sucesso: {deletedUser[1]}"}, 200
        else:
            return {"error": "Usuário não encontrado"}, 404

    except Exception as e:
        conn.rollback()
        print(f"Erro ao deletar usuário: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()