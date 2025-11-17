from flask import Flask 
from .utils.security import bcrypt
import os
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

def createApp():
    app = Flask(__name__, static_folder='static')

    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    jwt = JWTManager(app)
    
    bcrypt.init_app(app)

    from .routes import userAdminRoutes
    app.register_blueprint(userAdminRoutes.bp, url_prefix='/admin')

    from .routes import deskRoutes
    app.register_blueprint(deskRoutes.bp, url_prefix='/desk')

    from .routes import clientsRoutes
    app.register_blueprint(clientsRoutes.bp, url_prefix='/client')

    from .routes import menuItemsRoutes
    app.register_blueprint(menuItemsRoutes.bp, url_prefix='/menu')
    

    print("Aplicação criada com sucesso.")
    return app