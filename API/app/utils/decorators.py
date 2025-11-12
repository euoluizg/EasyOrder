from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required

def roleRequired(*requiredRoles):
    #  Decorator para verificar se o usuário tem a role necessária para acessar a rota.

    def decorator(fn):
        @wraps(fn)
        @jwt_required()

        def wrapper(*args, **kwargs):
            claims = get_jwt()
            userType = claims.get('type')
            if userType not in requiredRoles:
                return jsonify({"error": "Acesso negado"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator