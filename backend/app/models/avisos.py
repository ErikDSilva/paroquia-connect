from peewee import *
from . import BaseModel
from .usuario import Usuario

class Aviso(BaseModel):
    id = AutoField()
    titulo = CharField(max_length=100)
    categoria = CharField(max_length=45)
    url = CharField(max_length=250, null=True)
    descricao = TextField(null=True)
    data = DateField()

    criado_por = ForeignKeyField(Usuario, backref='avisos') # Relação
