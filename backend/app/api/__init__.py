from flask import Blueprint

# O url_prefix será definido ao registrar o blueprint no __init__.py principal
api_bp = Blueprint('api', __name__)

# Importa as rotas no final para evitar importação circular
from . import email
from . import dashboard
from . import eventos
from . import agenda
from . import avisos
from . import horarios
