from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .models.config import db

# 1. IMPORTAR AS EXTENSÕES DO ARQUIVO SEPARADO
# Isso evita o erro de "circular import"
from .extensions import mail, login_manager

def create_app(config_class=Config):
    """Cria e configura a instância da aplicação Flask (Application Factory)."""
    
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 2. CONFIGURAR O LOGIN MANAGER
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login' # Define a rota de login padrão

    # Configuração do CORS
    CORS(app, resources={
            r"/api/*": {
                "origins": ["http://localhost:5173"] 
            }
        }, supports_credentials=True)

    # 3. INICIAR O MAIL
    mail.init_app(app)

    # Gerenciamento de Conexão com Banco de Dados
    @app.before_request
    def _db_connect():
        if db.is_closed():
            db.connect()

    @app.teardown_request
    def _db_close(exc):
        if not db.is_closed():
            db.close()

    # 4. REGISTRAR BLUEPRINTS
    # Importamos aqui dentro para garantir que tudo acima já esteja pronto
    from .api import api_bp 
    app.register_blueprint(api_bp, url_prefix='/api/v1')
    
    from .api.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

    from .api.auth_routes import admin_management_bp 
    app.register_blueprint(admin_management_bp, url_prefix='/api/v1/admin_management')

    # Rota de teste
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy"}), 200

    return app

# 5. CARREGADOR DE USUÁRIO
# Mantemos fora da factory, decorando o objeto importado de extensions
@login_manager.user_loader
def load_user(user_id):
    from .models.usuario import Usuario
    return Usuario.get_or_none(Usuario.idusuario == int(user_id))