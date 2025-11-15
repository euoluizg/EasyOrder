from flask import Blueprint, request, jsonify

from ..utils.decorators import roleRequired
from ..services import clientsServices

bp = Blueprint('clientsRoutes', __name__)

@bp.route('/register', methods=['POST'])
def registerClient():
    # Rota "Pública" para registrar um novo cliente.

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400
    
    name = data.get('name')
    password = data.get('password')

    # Validação do Email/Telefone
    email = data.get('email')
    phone = data.get('phone')

    if not all([name, password]):
        return jsonify({"error": "Dados incompletos"}), 400
    
    if not (email or phone):
        return jsonify({"error": "Email ou Telefone são obrigatórios"}), 400
    
    response, statusCode = clientsServices.registerClient(name, password, email, phone)
    return jsonify(response), statusCode

@bp.route('/login', methods=['POST'])
def loginClient():
    # Rota "Pública" para login do cliente.

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400
    
    loginIdentifier = data.get('loginIdentifier') # email ou telefone
    password = data.get('password')

    if not all([loginIdentifier, password]):
        return jsonify({"error": "Identificador de login e senha são obrigatórios"}), 400

    response, statusCode = clientsServices.loginClient(loginIdentifier, password)
    return jsonify(response), statusCode

@bp.route('/profile/<int:idClient>', methods=['GET'])
@roleRequired('client')
def getClientProfile(idClient):
    # Rota para buscar o perfil do cliente pelo ID.
    # Admins(dono) podem ver qualquer perfil.
    # Clientes só podem ver o próprio perfil.

    response, statusCode = clientsServices.getClientById(idClient)
    return jsonify(response), statusCode

@bp.route('/update/<int:idClient>', methods=['PUT', 'PATCH'])
@roleRequired('client')
def updateClient(idClient):
    # Rota para atualizar o usuario cliente
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    response, statusCode = clientsServices.updateClient(idClient, data)
    return jsonify(response), statusCode

@bp.route('/delete/<int:idClient>', methods=['DELETE'])
@roleRequired('client')
def deleteClient(idClient):
    # Rota para desativar um cliente.

    response, statusCode = clientsServices.deleteClient(idClient)
    return jsonify(response), statusCode