from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .models.config import db  # Importa a conexão do banco
from .api import api_bp        # Importa o blueprint da API

def create_app(config_class=Config):
    """Cria e configura a instância da aplicação Flask (Application Factory)."""
    
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 1. Configuração do CORS (CRÍTICO para resolver o erro net::ERR_FAILED)
    # Permite que o front-end (localhost:5173) faça requisições para este back-end
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', '*')
        }
    }, supports_credentials=True)

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

    # 3. Registro de Blueprints com Prefixo
    # Isso garante que a rota seja acessível em /api/v1/eventos
    app.register_blueprint(api_bp, url_prefix='/api/v1')

    # Rota de teste simples
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy"}), 200

    return app