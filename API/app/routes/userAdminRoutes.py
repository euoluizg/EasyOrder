from flask import Blueprint, request, jsonify

from ..services import userAdminServices
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity

bp = Blueprint('userAdminRoutes', __name__)

@bp.route('/register', methods=['POST'])
def registerUserAdmin():
    # Rota para registrar um novo usuário admin.
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400
    
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    type = data.get('type') # gerente, administrador

    if not all([name, email, password, type]):
        return jsonify({"error": "Dados incompletos"}), 400
    
    response, statusCode = userAdminServices.registerUserAdmin(name, password, email, type)
    return jsonify(response), statusCode

@bp.route('/login', methods=['POST'])
def loginUserAdmin():
    # Rota para login do usuário admin.
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400
    
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    response, statusCode = userAdminServices.loginUserAdmin(email, password)
    return jsonify(response), statusCode

@bp.route('/readAll', methods=['GET'])
@jwt_required()
def readAllUserAdmin():
    # Rota para buscar todos os usuários admin.
    # Verifica se o usuário logado é um dono
    claims = get_jwt()
    userType = claims.get('type')
    if userType != 'dono':
        return jsonify({"error": "Acesso negado"}), 403

    response, statusCode = userAdminServices.getAllUserAdmin()
    return jsonify(response), statusCode

@bp.route('/read/<int:idUser>', methods=['GET'])
@jwt_required()
def readUserAdminById(idUser):   
    # Rota para buscar um usuário admin pelo ID.
    response, statusCode = userAdminServices.getUserAdminById(idUser)
    return jsonify(response), statusCode

@bp.route('/update/<int:idUser>', methods=['PUT', 'PATCH'])
@jwt_required()
def updateUserAdmin(idUser):
    # Rota para atualizar um usuário admin.
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    response, statusCode = userAdminServices.updateUserAdmin(idUser, data)
    return jsonify(response), statusCode

@bp.route('/delete/<int:idUser>', methods=['DELETE'])
@jwt_required()
def deleteUserAdmin(idUser):
    # Rota para deletar um usuário admin.

    claims = get_jwt()
    userType = claims.get('type')
    if userType != 'dono':
        return jsonify({"error": "Acesso negado"}), 403

    response, statusCode = userAdminServices.deleteUserAdmin(idUser)
    return jsonify(response), statusCode