from flask import request, jsonify
from . import api_bp
from ..models.eventos import Evento;
from ..models.agenda import Agenda;
from ..models.avisos import Aviso;
from ..models.horario import Horario;

# O prefixo /api/v1 já foi definido no create_app
# Então, esta rota será acessível em: http://localhost:5000/api/v1/data
