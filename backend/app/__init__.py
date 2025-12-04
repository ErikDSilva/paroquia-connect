from flask import Flask, jsonify
from flask_mail import Mail
from flask_cors import CORS
# 1. IMPORTAR O LOGIN MANAGER
from flask_login import LoginManager # <--- NOVO
from .config import Config
from .models.config import db
from .api import api_bp

# 2. IMPORTAR O BLUEPRINT DE AUTH (Que criamos no passo anterior)
# Certifique-se de que o arquivo auth_routes.py existe dentro de 'api'
from .api.auth_routes import auth_bp # <--- NOVO

# 3. INICIALIZAR O LOGIN MANAGER GLOBALMENTE (Fora da função)
login_manager = LoginManager() # <--- NOVO
mail = Mail()

def create_app(config_class=Config):
    """Cria e configura a instância da aplicação Flask (Application Factory)."""
    
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 4. INICIAR O LOGIN MANAGER DENTRO DO APP
    login_manager.init_app(app) # <--- NOVO
    # Define qual rota o Flask deve chamar se alguém não logado tentar acessar área restrita
    # O nome 'auth.login' refere-se à função login() dentro do blueprint 'auth'
    login_manager.login_view = 'auth.login' # <--- NOVO

    # Configuração do CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', '*')
        }
    }, supports_credentials=True)

    # Gerenciamento de Conexão com Banco de Dados
    mail.init_app(app)

    # 2. Gerenciamento de Conexão com Banco de Dados
    # (Movido do run.py para cá para garantir que funcione em toda a app)
    @app.before_request
    def _db_connect():
        if db.is_closed():
            db.connect()

    @app.teardown_request
    def _db_close(exc):
        if not db.is_closed():
            db.close()

    # Registro de Blueprints
    # 3. Registro de Blueprints com Prefixo
    # Isso garante que a rota seja acessível em /api/v1/eventos
    
    from .api import api_bp # Importa o blueprint da API  
    app.register_blueprint(api_bp, url_prefix='/api/v1')
    
    # 5. REGISTRAR O BLUEPRINT DE AUTENTICAÇÃO
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth') # <--- NOVO

    # Rota de teste simples
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy"}), 200

    return app

# 6. DEFINIR O CARREGADOR DE USUÁRIO (Fora da função, no final do arquivo)
@login_manager.user_loader # <--- NOVO
def load_user(user_id):
    # Importação deve ser aqui dentro para evitar erro de Ciclo de Importação
    from .models.usuario import Usuario 
    
    # Busca o usuário no banco pelo ID salvo na sessão (cookie)
    return Usuario.get_or_none(Usuario.idusuario == int(user_id))