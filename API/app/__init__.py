from flask import Flask 
from .utils.security import bcrypt
import os
from flask_jwt_extended import JWTManager

def createApp():
    app = Flask(__name__)

    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    jwt = JWTManager(app)

    bcrypt.init_app(app)

    from .routes import userAdminRoutes
    app.register_blueprint(userAdminRoutes.bp, url_prefix='/admin')
    

    print("Aplicação criada com sucesso.")
    return app