from flask_mail import Mail
from flask_login import LoginManager

# Instanciamos as extensões aqui, vazias.
# Elas serão iniciadas com o app (init_app) depois.
mail = Mail()
login_manager = LoginManager()