from peewee import *
from . import BaseModel

class Usuario(BaseModel):
    idusuario = AutoField()
    nome = CharField(max_length=150)
    email = CharField(max_length=150, unique=True)
    senha = CharField(max_length=20)
    telefone = CharField(max_length=13, null=True)
