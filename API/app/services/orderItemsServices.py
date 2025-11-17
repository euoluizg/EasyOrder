from ..config.db import createConnection
import psycopg2
import psycopg2.errors

def updateOrderItemAmount(orderItemId, newAmount):
    # Service: Atualiza a quantidade de um item num pedido.
    # (Isto também deve recalcular o 'total' do pedido - Lógica complexa)

    # --- A LÓGICA DE RECALCULAR O TOTAL DO PEDIDO IRIA AQUI ---
    # 1. Iniciar Transação
    # 2. UPDATE orderItems SET amount = %s WHERE idOrderItem = %s
    # 3. SELECT para recalcular o novo 'total' do pedido
    # 4. UPDATE orders SET total = %s WHERE idOrder = %s
    # 5. Commit
    
    conn = createConnection()
    if conn is None: return {"error": "DB failed"}, 500
    cursor = None
    
    try:
        cursor = conn.cursor()
        query = "UPDATE orderItems SET amount = %s WHERE idOrderItem = %s RETURNING idOrderItem, amount;"
        cursor.execute(query, (newAmount, orderItemId))
        updatedItem = cursor.fetchone()
        
        if updatedItem is None:
            return {"error": "Item do pedido não encontrado"}, 404
            
        conn.commit()
        return {"idOrderItem": updatedItem[0], "newAmount": updatedItem[1]}, 200

    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def deleteOrderItem(orderItemId):
    """
    Service: Deleta um item de um pedido.
    (Isto também deve recalcular o 'total' do pedido)
    """
    
    conn = createConnection()
    if conn is None: 
        return {"error": "DB failed"}, 500
    cursor = None
    
    try:
        cursor = conn.cursor()
        query = "DELETE FROM orderItems WHERE idOrderItem = %s RETURNING idOrderItem;"
        cursor.execute(query, (orderItemId,))
        deletedItem = cursor.fetchone()
        
        if deletedItem is None:
            return {"error": "Item do pedido não encontrado"}, 404
            
        conn.commit()
        return {"message": f"Item {deletedItem[0]} removido do pedido."}, 200

    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()