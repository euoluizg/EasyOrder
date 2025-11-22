from flask import Blueprint, jsonify, request
from ..services import menuItemsServices
from ..utils.decorators import roleRequired

bp = Blueprint('menuItemsRoutes', __name__)

@bp.route('/create', methods=['POST'])
@roleRequired('dono', 'gerente')
def createMenuItems():
    # Rota privada para criar um novo item de menu.

    data = request.get_json()    
    if not data.get('name') or data.get('price') is None:
        return jsonify({"error": "Os campos 'name' e 'price' são obrigatórios'"}), 400
    
    response, statusCode = menuItemsServices.createMenuItem(data)
    return jsonify(response), statusCode

@bp.route('/readAll', methods=['GET'])
def getAllMenuItem():
    # Rota pública para buscar todos os itens do menu.

    response, statusCode = menuItemsServices.getAllItems()
    return jsonify(response), statusCode

@bp.route('/read/<int:idItem>', methods=['GET'])
def getItemByID(idItem):
    # Rota pública para buscar item por ID.

    response, statusCode = menuItemsServices.getItemById(idItem)
    return jsonify(response), statusCode

@bp.route('/update/<int:idItem>', methods=['PUT', 'PATCH'])
@roleRequired('dono', 'gerente')
def updateMenuItem(idItem):
    # Rota para atualizar o usuario menu
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    response, statusCode = menuItemsServices.updateMenuItem(idItem, data)
    return jsonify(response), statusCode

@bp.route('/delete/<int:idItem>', methods=['DELETE'])
@roleRequired('dono', 'gerente')
def deleteMenuItem(idItem):
    # Rota para desativar um menu.

    response, statusCode = menuItemsServices.deleteMenuItem(idItem)
    return jsonify(response), statusCode