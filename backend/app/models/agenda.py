from peewee import *
from . import BaseModel

class Agenda(BaseModel):
    id = AutoField()
    titulo = CharField(max_length=60)
    tipo = CharField(max_length=45)
    data = DateField()
    local = CharField(max_length=45)
    horario = TimeField()
    descricao = TextField(null=True)
