from peewee import *
from . import BaseModel
from .eventos import Evento

class InscricaoEvento(BaseModel):
    id = AutoField()
    nome = CharField(max_length=150)
    numero = CharField(max_length=13)

    # Relação
    evento = ForeignKeyField(Evento, backref="inscricoes", on_delete="CASCADE")
