from flask import Blueprint, request, jsonify

from ..services import userAdminServices
from ..utils.decorators import roleRequired

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
@roleRequired('dono')
def readAllUserAdmin():
    # Rota para buscar todos os usuários admin.

    response, statusCode = userAdminServices.getAllUserAdmin()
    return jsonify(response), statusCode

@bp.route('/read/<int:idUser>', methods=['GET'])
@roleRequired('dono', 'gerente')
def readUserAdminById(idUser):   
    # Rota para buscar um usuário admin pelo ID.
    response, statusCode = userAdminServices.getUserAdminById(idUser)
    return jsonify(response), statusCode

@bp.route('/update/<int:idUser>', methods=['PUT', 'PATCH'])
@roleRequired('dono', 'gerente')
def updateUserAdmin(idUser):
    # Rota para atualizar um usuário admin.
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    response, statusCode = userAdminServices.updateUserAdmin(idUser, data)
    return jsonify(response), statusCode

@bp.route('/delete/<int:idUser>', methods=['DELETE'])
@roleRequired('dono')
def deleteUserAdmin(idUser):
    # Rota para deletar um usuário admin.
    
    response, statusCode = userAdminServices.deleteUserAdmin(idUser)
    return jsonify(response), statusCode