from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON, ENUM

db = SQLAlchemy()

userTypeEnum = ENUM('dono', 'gerente', 'garcom', 'cozinha', name='usertype')
deskConditionEnum = ENUM('livre', 'ocupada', 'reservada', 'manutencao', name='deskcondition')
orderStatusEnum = ENUM('recebido', 'preparando', 'pronto', 'entregue', 'cancelado', name='orderstatus')
orderOriginEnum = ENUM('app', 'balcao', 'telefone', name='orderorigin')
promotionTypeEnum = ENUM('desconto', 'brinde', 'fidelidade', name='promotiontype')

class UsersAdmin(db.Model):
    __tablename__ = 'usersadmin'
    idUser = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    type = db.Column(userTypeEnum, nullable=False)
    active = db.Column(db.Boolean, default=True)
    dateRegister = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    lastLogin = db.Column(db.TIMESTAMP)
    logs = db.relationship('Logs', back_populates='userAdmin')

class Clients(db.Model):
    __tablename__ = 'clients'
    idClient = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255))
    birthDate = db.Column(db.Date)
    dateRegister = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    loyaltyPoints = db.Column(db.Integer, default=0)
    orders = db.relationship('Orders', back_populates='client')
    feedbacks = db.relationship('Feedbacks', back_populates='client')
    logs = db.relationship('Logs', back_populates='client')

class Desks(db.Model):
    __tablename__ = 'desks'
    idDesk = db.Column(db.Integer, primary_key=True)
    deskNumber = db.Column(db.Integer, unique=True, nullable=False)
    qrCodeUid = db.Column(db.String(50), unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    condition = db.Column(deskConditionEnum, default='livre')
    orders = db.relationship('Orders', back_populates='desk')

class Categories(db.Model):
    __tablename__ = 'categories'
    idCategory = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    menuOrder = db.Column(db.Integer, default=0)
    active = db.Column(db.Boolean, default=True)
    menuItems = db.relationship('MenuItems', back_populates='category')

class MenuItems(db.Model):
    __tablename__ = 'menuitems'
    idItem = db.Column(db.Integer, primary_key=True)
    idCategory = db.Column(db.Integer, db.ForeignKey('categories.idCategory'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    cost = db.Column(db.Numeric(10, 2))
    timePreparation = db.Column(db.Integer)
    emphasis = db.Column(db.Boolean, default=False)
    active = db.Column(db.Boolean, default=True)
    imagePath = db.Column(db.String(255))
    options = db.Column(JSON)
    category = db.relationship('Categories', back_populates='menuItems')
    stock = db.relationship('Stock', back_populates='menuItem')
    orderItems = db.relationship('OrderItems', back_populates='menuItem')

class Orders(db.Model):
    __tablename__ = 'orders'
    idOrder = db.Column(db.Integer, primary_key=True)
    idClient = db.Column(db.Integer, db.ForeignKey('clients.idClient')) 
    idDesk = db.Column(db.Integer, db.ForeignKey('desks.idDesk'))
    timeDate = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    status = db.Column(orderStatusEnum, default='recebido')
    total = db.Column(db.Numeric(10, 2), nullable=False)
    observation = db.Column(db.Text)
    origin = db.Column(orderOriginEnum, default='app')
    client = db.relationship('Clients', back_populates='orders')
    desk = db.relationship('Desks', back_populates='orders')
    orderItems = db.relationship('OrderItems', back_populates='order')
    feedbacks = db.relationship('Feedbacks', back_populates='order')

class OrderItems(db.Model):
    __tablename__ = 'orderitems'
    idOrderItem = db.Column(db.Integer, primary_key=True)
    idOrder = db.Column(db.Integer, db.ForeignKey('orders.idOrder', ondelete='CASCADE'), nullable=False)
    idItem = db.Column(db.Integer, db.ForeignKey('menuitems.idItem'), nullable=False)
    amount = db.Column(db.Integer, default=1, nullable=False)
    unitPrice = db.Column(db.Numeric(10, 2), nullable=False)
    custom = db.Column(JSON)
    observation = db.Column(db.Text)
    order = db.relationship('Orders', back_populates='orderItems')
    menuItem = db.relationship('MenuItems', back_populates='orderItems')

class Feedbacks(db.Model):
    __tablename__ = 'feedbacks'
    idFeedback = db.Column(db.Integer, primary_key=True)
    idOrder = db.Column(db.Integer, db.ForeignKey('orders.idOrder'), nullable=False)
    idClient = db.Column(db.Integer, db.ForeignKey('clients.idClient'), nullable=False)
    rating = db.Column(db.Integer)
    comments = db.Column(db.Text)
    timeDate = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    answered = db.Column(db.Boolean, default=False)
    adminResponse = db.Column(db.Text)
    order = db.relationship('Orders', back_populates='feedbacks')
    client = db.relationship('Clients', back_populates='feedbacks')

class Promotions(db.Model):
    __tablename__ = 'promotions'
    idPromotion = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(promotionTypeEnum, nullable=False)
    discountValue = db.Column(db.Numeric(10, 2))
    code = db.Column(db.String(50), unique=True)
    validFrom = db.Column(db.TIMESTAMP)
    validUntil = db.Column(db.TIMESTAMP)
    status = db.Column(db.Boolean, default=True)

class Logs(db.Model):
    __tablename__ = 'logs'
    idLog = db.Column(db.Integer, primary_key=True)
    idUser = db.Column(db.Integer, db.ForeignKey('usersadmin.idUser'))
    idClient = db.Column(db.Integer, db.ForeignKey('clients.idClient'))
    action = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    ipAddress = db.Column(db.String(50))
    timeDate = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    userAdmin = db.relationship('UsersAdmin', back_populates='logs')
    client = db.relationship('Clients', back_populates='logs')