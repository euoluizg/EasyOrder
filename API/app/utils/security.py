from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def hashPassword(password):
    """Hash a plaintext password using Bcrypt."""
    return bcrypt.generate_password_hash(password).decode('utf-8')

def checkPassword(hashedPassword, password):
    """Check a plaintext password against a hashed password using Bcrypt."""
    return bcrypt.check_password_hash(hashedPassword, password)