from flask import Blueprint, jsonify, request
from ..services import ordersServices
from ..utils.decorators import roleRequired 
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

bp = Blueprint('ordersRoutes', __name__)

@bp.route('/create', methods=['POST'])
@roleRequired('client') 
def createOrderRoute():
    # Rota para um CLIENTE criar um novo pedido.    
    clientId = get_jwt_identity() 
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Nenhum dado enviado"}), 400
        
    deskId = data.get('idDesk')
    itemsList = data.get('items')
    observation = data.get('observation')

    if not deskId or not itemsList:
        return jsonify({"error": "idDesk e a lista de 'items' são obrigatórios."}), 400
        
    response, statusCode = ordersServices.createNewOrder(
        clientId, deskId, itemsList, observation
    )
    return jsonify(response), statusCode

@bp.route('/getAll', methods=['GET'])
@roleRequired('dono', 'gerente', 'cozinha', 'garcom') 
def getAllOrdersRoute():
    # Rota para a equipa (Cozinha/Garçom) ver os pedidos ATIVOS.
    response, statusCode = ordersServices.getAllActiveOrders()
    return jsonify(response), statusCode

@bp.route('/getDetail/<int:orderId>', methods=['GET'])
@jwt_required('dono', 'gerente', 'cozinha', 'garcom') 
def getOrderDetailsRoute(orderId): 
    # Rota para um Cliente (dono) ou Admin ver os detalhes de UM pedido.

    response, statusCode = ordersServices.getOrderDetails(orderId)
    return jsonify(response), statusCode

@bp.route('/update/<int:orderId>/status', methods=['PATCH'])
@roleRequired('dono', 'gerente', 'cozinha') 
def updateOrderStatusRoute(orderId):
    # # Rota para a Cozinha/Gerente atualizar o status de um pedido.
    data = request.get_json()
    newStatus = data.get('status')
    
    if not newStatus:
        return jsonify({"error": "O campo 'status' é obrigatório"}), 400
        
    response, statusCode = ordersServices.updateOrderStatus(orderId, newStatus)
    return jsonify(response), statusCode