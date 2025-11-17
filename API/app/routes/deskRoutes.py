from flask import Blueprint, request, jsonify
from ..services import deskServices
from ..utils.decorators import roleRequired

bp = Blueprint('deskRoutes', __name__)

@bp.route('/create', methods=['POST'])
@roleRequired('dono', 'gerente')
def createDesk():
    # Rota para criar uma nova mesa.
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    deskNumber = data.get('deskNumber')
    capacity = data.get('capacity')

    if not all([deskNumber, capacity]):
        return jsonify({"error": "Dados incompletos"}), 400

    response, statusCode = deskServices.createDesk(deskNumber, capacity)
    return jsonify(response), statusCode

@bp.route('/readAll', methods=['GET'])
@roleRequired('dono', 'gerente')
def readAllDesk():
    # Rota para obter todas as mesas.

    response, statusCode = deskServices.getAllDesk()
    return jsonify(response), statusCode

@bp.route('/update/<int:idDesk>', methods=['PUT', 'PATCH'])
@roleRequired('dono', 'gerente')
def updateDesk(idDesk):
    # Rota para atualizar uma mesa.

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    response, statusCode = deskServices.updateDeskToCondition(idDesk, data)
    return jsonify(response), statusCode

@bp.route('/delete/<int:idDesk>', methods=['DELETE'])
@roleRequired('dono', 'gerente')
def deleteDesk(idDesk):
    # Rota para deletar uma mesa.

    response, statusCode = deskServices.deleteDesk(idDesk)
    return jsonify(response), statusCode