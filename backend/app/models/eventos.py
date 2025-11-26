from peewee import *
from . import BaseModel

class Evento(BaseModel):
    id = AutoField()
    titulo = CharField(max_length=45)
    tipo = CharField(max_length=45)
    local = CharField(max_length=45)
    tipo_vagas = CharField(max_length=45, null=True)
    numero_vagas = IntegerField(null=True)
    data = DateField()
    horario = TimeField()
    descricao = TextField(null=True)
