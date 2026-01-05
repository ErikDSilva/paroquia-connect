from app.models.config import db
from app.models.eventos import Evento
from app.models.inscricao_evento import InscricaoEvento
from app.models.usuario import Usuario
from app.models.agenda import Agenda
from app.models.avisos import Aviso

db.connect()
db.create_tables([Usuario, Evento, Agenda, Aviso, InscricaoEvento])
db.close()