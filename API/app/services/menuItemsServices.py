import psycopg2.extras
from ..config.db import createConnection
from flask_jwt_extended import create_access_token
import psycopg2.errors
import json

def createMenuItem(data):
    # Service Cria um novo item de menu.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed."}, 500
    
    cursor = None

    optionsJson = None
    if 'options' in data and data['options']:
        optionsJson = json.dumps(data['options'])

    try:
        cursor = conn.cursor()

        insertQuery = """
            INSERT INTO menuItems (
                name, description, price, cost, timePreparation,
                emphasis, active, imagePath, options
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING idItem, name, price, active;
        """

        cursor.execute(insertQuery, (
            data.get('name'),
            data.get('description'),
            data.get('price'),
            data.get('cost'),
            data.get('timePreparation'),
            data.get('emphasis', False),
            data.get('active', True),
            data.get('imagePath'),
            optionsJson
        ))

        newItem = cursor.fetchone()
        conn.commit()

        itemData = {
            "idItem": newItem[0],
            "name": newItem[1],
            "price": float(newItem[2]),
            "active": newItem[3],
        }
        return itemData, 201
    
    except psycopg2.errors.NotNullViolation as e:
        conn.rollback()
        return {"error": "Campos obrigatórios (como 'nome' ou 'preco') não foram enviados."}, 400
    except Exception as e:
        conn.rollback()
        print(f"Erro ao criar item de menu: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def getAllItems():
    # Service para buscar todos os items do menu.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        selectQuery = """
            Select idItem, name, description, price, cost, timePreparation, 
                    emphasis, active, imagePath, options 
            FROM menuItems 
            WHERE active = TRUE 
            ORDER BY name;
        """

        cursor.execute(selectQuery)

        itemsList = []
        for itemData in cursor.fetchall():
            itemData['price'] = float(itemData['price'])
            itemsList.append({
                "idItem": itemData[0],
                "name": itemData[1],
                "description": itemData[2],
                "price": itemData[3],
                "cost": itemData[4],
                "timePreparation": itemData[5],
                "emphasis": itemData[6],
                "active": itemData[7],
                "imagePath": itemData[8],
                "options": itemData[9]
            })

        return itemsList, 200
    
    except Exception as e:
        print(f"Erro ao buscar itens de menu: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def getItemById(idItem):
    # Service para buscar um item pelo ID.

    conn = createConnection()
    if conn is None:
        return{"error": "Database connection failed."}, 500
    
    cursor = None

    try:
        cursor = conn.cursor()

        query = """
                Select idItem, name, description, price, cost, timePreparation, 
                    emphasis, active, imagePath, options 
            FROM menuItems 
            WHERE idItem = %s;
        """
        cursor.execute(query, (idItem,))

        itemData = cursor.fetchone()
        if itemData is None:
            return {"error": "Item não encontrado."}, 400
        
        item = {
            "idItem": itemData[0],
            "name": itemData[1],
            "description": itemData[2],
            "price": itemData[3],
            "cost": itemData[4],
            "timePreparation": itemData[5],
            "emphasis": itemData[6],
            "active": itemData[7],
            "imagePath": itemData[8],
            "options": itemData[9]
        }
        return item, 200
    
    except Exception as e:
        print(f"Erro ao buscar usuário: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def updateMenuItem(idItem, data):
    # Service privada para atualizar item.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed."}, 500
    
    cursor = None

    allowedFields = [
        'name', 'description', 'price', 'cost', 'timePreparation',
        'emphasis', 'active', 'imagePath', 'options'
    ]
    fieldsToUpdate = []
    values = []

    for key, value in data.items():
        if key in allowedFields:
            if key == 'options':
                if value:
                    fieldsToUpdate.append("options = %s")
                    values.append(json.dumps(value))
                else:
                    fieldsToUpdate.append("options = %s")
            else:
                fieldsToUpdate.append(f"{key} = %s")
                values.append(value)

    if not fieldsToUpdate:
        return {"error": "Nenhum campo válido fornecido para atualização."}, 400
    
    values.append(idItem)

    updateQuery = f"UPDATE  menuitems SET {', '.join(fieldsToUpdate)} WHERE idItem = %s RETURNING idItem, name, price, active;"

    try:
        cursor = conn.cursor()
        cursor.execute(updateQuery, tuple(values))

        updateItem = cursor.fetchone()
        if updateItem is None:
            return {"error": "Usuário não encontrado"}, 404
        
        conn.commit()

        itemData = {
            "idItem": updateItem[0],
            "name": updateItem[1],
            "price": updateItem[2],
            "active": updateItem[3]
        }
        return itemData, 200
    
    except psycopg2.errors.UniqueViolation as e:
        conn.rollback()
        return {"error": "Já existe um item de menu com esse nome."}, 409
    except Exception as e:
        conn.rollback()
        print(f"Erro ao atualizar item de menu: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def deleteMenuItem(idItem):
    # Service privada para deletar item.

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed."}, 500
    
    curso = None
    try:
        cursor = conn.cursor()
        query = "UPDATE menuItems SET active = FALSE WHERE idItem = %s RETURNING idItem, name;"
        cursor.execute(query, (idItem,))

        deletedItem = cursor.fetchone()

        if deletedItem is None:
            return {"error": "Item não encontrado."}, 404
        
        conn.commit()
        return {"message": f"Item '{deletedItem[1]}' foi desativado com sucesso."}, 200
    
    except Exception as e:
        conn.rollback()
        print(f"Erro ao desativar item: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()