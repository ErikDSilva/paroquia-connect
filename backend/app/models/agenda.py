from peewee import *
from . import BaseModel
from .usuario import Usuario

class Agenda(BaseModel):
    id = AutoField()
    titulo = CharField(max_length=60)
    tipo = CharField(max_length=45, null=True)
    data = DateField(null=True)
    local = CharField(max_length=45)
    horario = TimeField()
    descricao = TextField(null=True)

    is_public = BooleanField(default=False)
    dia_semana = CharField(max_length=45, null=True)

    criado_por = ForeignKeyField(Usuario, backref='agendas')
