from flask import Blueprint, jsonify, request
from ..services import orderItemsServices
from ..utils.decorators import roleRequired 

bp = Blueprint('orderItemsRoutes', __name__)

@bp.route('/<int:orderItemId>', methods=['PATCH'])
@roleRequired('dono', 'gerente', 'garcom') # Quem pode mudar um item?
def updateOrderItemRoute(orderItemId):
    # Rota para atualizar a quantidade de um item num pedido.
    data = request.get_json()
    newAmount = data.get('amount')
    
    if newAmount is None or not isinstance(newAmount, int) or newAmount < 0:
        return jsonify({"error": "O campo 'amount' (quantidade) é obrigatório e deve ser um número."}), 400
        
    response, statusCode = orderItemsServices.updateOrderItemAmount(orderItemId, newAmount)
    return jsonify(response), statusCode

@bp.route('/<int:orderItemId>', methods=['DELETE'])
@roleRequired('dono', 'gerente', 'garcom') # Quem pode remover um item?
def deleteOrderItemRoute(orderItemId):
    # # Rota para remover um item de um pedido.
    
    response, statusCode = orderItemsServices.deleteOrderItem(orderItemId)
    return jsonify(response), statusCode