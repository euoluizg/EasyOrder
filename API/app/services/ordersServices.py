from ..config.db import createConnection
import psycopg2
import psycopg2.errors
import psycopg2.extras
import json

def createNewOrder(idClient, idDesk, itemsList, observation=None, origin='app'):
    # Service para criar um novo pedido ( table 'orders' e 'orderItems'). 
    # 'itemsList' é uma lista de dicts: [{'idItem': 1, 'amount': 2, 'custom':{...}}, ...]

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed"}, 500
    
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    conn.autocommit = False

    try:
        totalPrice = 0

        idsItem = [item['idItem'] for item in itemsList]

        queryPrices = "SELECT idItem, price FROM menuItems WHERE idItem = ANY(%s) AND active = TRUE;"
        cursor.execute(queryPrices, (idsItem,))

        priceMap = {row['iditem']: float(row['price']) for row in cursor.fetchall()}
        
        processedItems = []

        for item in itemsList:
            idItem = item['idItem']
            amount = item['amount']

            if idItem not in priceMap:
                raise Exception(f"Item com ID {idItem} não encontrado ou está inativo.")
            
            unitPrice = priceMap[idItem]
            totalPrice += unitPrice * amount

            processedItems.append({
                "idItem": idItem,
                "amount": amount,
                "unitPrice": unitPrice,
                "custom": item.get('custom'), # Opções de personalização
                "observation": item.get('observation') # Obs do item
            })

        queryOrder = """
        INSERT INTO orders (idClient, idDesk, total, observation, origin, status)
        VALUES (%s, %s, %s, %s, %s, 'recebido')
        RETURNING idOrder, status;
        """
            
        cursor.execute(queryOrder, (idClient, idDesk, totalPrice, observation, origin))

        newOrder = cursor.fetchone()
        newOrderId = newOrder['idorder']

        queryItems = """
        INSERT INTO orderItems (idOrder, idItem, amount, unitPrice, custom, observation)
        VALUES (%s, %s, %s, %s, %s, %s);
        """

        for item in processedItems:
            customJson = json.dumps(item['custom']) if item['custom'] else None

            cursor.execute(queryItems, (
                    newOrderId,
            item['idItem'],
            item['amount'],
            item['unitPrice'],
                customJson,
                item.get('observation')
                ))
        conn.commit()

        return{
            "message": "Pedido criado com sucesso!",
            "idOrder": newOrderId,
            "status": newOrder['status'],
            "total": float(totalPrice)
        }, 201


    except Exception as e:
        conn.rollback()
        print(f"Erro ao criar pedido (ROLLBACK EXECUTADO): {e}")
        return {"error": str(e)}, 500
    finally:
        conn.autocommit = True 
        if cursor: 
            cursor.close()
        if conn: 
            conn.close()

def getAllActiveOrders():
    # Sevice para buscar todos os pedidos ativos (para cozinha/gaçom).

    conn = createConnection()
    if conn is None:
        return {"error": "Database connection failed."}, 500
    
    cursor = None

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Busca pedidos que NÃO estão finalizados
        query = """
            SELECT 
                o.idOrder as "idOrder",
                o.status as "status",
                o.total as "total",
                o.timeDate as "timeDate",
                o.observation as "observation",
                d.deskNumber as "deskNumber", 
                c.name as "clientName"
            FROM orders o
            LEFT JOIN desks d ON o.idDesk = d.idDesk
            LEFT JOIN clients c ON o.idClient = c.idClient
            WHERE o.status NOT IN ('entregue', 'cancelado')
            ORDER BY o.timeDate DESC;
        """

        cursor.execute(query)

        orders = cursor.fetchall()
        
        for order in orders:
            order['total'] = float(order['total'])
            if order['timeDate']:
                order['timeDate'] = order['timeDate'].isoformat()

            if order['clientName'] is None:
                order['clientName'] = "Cliente Balcão"
        return orders, 200

    except Exception as e:
        print(f"Erro ao buscar pedidos ativos: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn: 
            conn.close()

def getOrderItemsByIdOrder(idOrder):
    # Service: Busca APENAS os itens para o Dialog da Cozinha.
    conn = createConnection()
    if conn is None: 
        return {"error": "DB failed"}, 500
    cursor = None
    try:
        # Usamos RealDictCursor para garantir nomes de colunas corretos
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        query = """
            SELECT 
                oi.amount, 
                oi.observation, 
                oi.custom, 
                m.name,
                m.price as "unitPrice"
            FROM orderItems oi
            JOIN menuItems m ON oi.idItem = m.idItem
            WHERE oi.idOrder = %s;
        """
        cursor.execute(query, (idOrder,))
        items = cursor.fetchall()
        
        for item in items:
            item['unitPrice'] = float(item['unitPrice'])
            
        return items, 200
    except Exception as e:
        print(f"Erro ao buscar detalhes do pedido: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def updateOrderStatus(orderId, newStatus):
    # Service: Atualiza o status de um pedido (preparando, pronto, etc.)
    
    conn = createConnection()
    if conn is None: return {"error": "DB failed"}, 500
    cursor = None
    
    try:
        cursor = conn.cursor()
        
        query = "UPDATE orders SET status = %s WHERE idOrder = %s RETURNING idOrder, status;"
        cursor.execute(query, (newStatus, orderId))
        
        updatedOrder = cursor.fetchone()
        
        if updatedOrder is None:
            return {"error": "Pedido não encontrado"}, 404
            
        conn.commit()
        return {"idOrder": updatedOrder[0], "status": updatedOrder[1]}, 200

    except Exception as e:
        conn.rollback()
        print(f"Erro ao atualizar status do pedido: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def getClientOrders(clientId):
    """Service: Busca o histórico de pedidos de um cliente específico."""
    conn = createConnection()
    if conn is None: return {"error": "DB failed"}, 500
    
    cursor = None
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Busca pedidos do cliente ordenados pelo mais recente
        query = """
            SELECT 
                o.idOrder as "idOrder",
                o.status as "status",
                o.total as "total",
                o.timeDate as "timeDate",
                d.deskNumber as "deskNumber"
            FROM orders o
            LEFT JOIN desks d ON o.idDesk = d.idDesk
            WHERE o.idClient = %s
            ORDER BY o.timeDate DESC;
        """
        cursor.execute(query, (clientId,))
        orders = cursor.fetchall()
        
        for order in orders:
            order['total'] = float(order['total'])
            if order['timeDate']:
                order['timeDate'] = order['timeDate'].isoformat()
            if not order['deskNumber']:
                order['deskNumber'] = "?"
                
        return orders, 200
    except Exception as e:
        print(f"Erro ao buscar histórico: {e}")
        return [], 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def getOrderDetails(idOrder, idUser, userType):
    # Service: Busca os detalhes completos de um pedido (Cabeçalho + Itens).
    # Inclui verificação de segurança para garantir que um cliente só veja o SEU pedido.
    
    
    conn = createConnection()
    if conn is None: return {"error": "Database connection failed."}, 500
    
    cursor = None

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # 1. Busca o pedido principal
        queryOrder = "SELECT * FROM orders WHERE idOrder = %s;"
        cursor.execute(queryOrder, (idOrder,))
        orderRaw = cursor.fetchone()

        if orderRaw is None:
            return {"error": "Pedido não encontrado."}, 404
        
        # Converte para dicionário para podermos adicionar campos
        orderDetails = dict(orderRaw)
        
        # Permite se for Staff (Admin/Cozinha)
        isAdminStaff = userType in ['dono', 'gerente', 'garcom', 'cozinha']
        
        # Permite se for o Dono do Pedido (Cliente)
        isOwner = (userType == 'client' and orderDetails['idclient'] == int(idUser))

        if not (isAdminStaff or isOwner):
            return {"error": "Acesso negado a este pedido"}, 403
        
        # 2. Busca os itens desse pedido
        queryItems = """
            SELECT oi.idOrderItem, oi.amount, oi.unitPrice, oi.custom, oi.observation, mi.name 
            FROM orderItems oi
            JOIN menuItems mi ON oi.idItem = mi.idItem
            WHERE oi.idOrder = %s;
        """
        cursor.execute(queryItems, (idOrder,))

        itemsList = []
        for item in cursor.fetchall():
            i = dict(item)
            # Converte decimal para float
            i['unitPrice'] = float(i['unitprice']) if 'unitprice' in i else float(i['unitPrice'])
            itemsList.append(i)

        # 3. Formata a resposta final
        orderDetails['total'] = float(orderDetails['total'])
        
        # Converte datas para string ISO (para o JSON não quebrar)
        if orderDetails.get('timedate'):
             orderDetails['timeDate'] = orderDetails['timedate'].isoformat()
             
        orderDetails['items'] = itemsList
        
        return orderDetails, 200

    except Exception as e:
        print(f"Erro ao buscar detalhes do pedido: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()