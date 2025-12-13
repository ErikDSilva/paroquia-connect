from peewee import *
from flask_login import UserMixin
from . import BaseModel

class Usuario(BaseModel, UserMixin):
    idusuario = AutoField()
    nome = CharField(max_length=150)
    email = CharField(max_length=150, unique=True)
    senha = CharField(max_length=255)
    telefone = CharField(max_length=20, null=True)


    def get_id(self):
        return str(self.idusuario)