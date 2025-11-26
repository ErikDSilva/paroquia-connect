from flask import Blueprint

# O url_prefix será definido ao registrar o blueprint no __init__.py principal
api_bp = Blueprint('api', __name__)

# Importa as rotas no final para evitar importação circular
from . import routes
