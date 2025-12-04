from peewee import *
from flask_login import UserMixin
from . import BaseModel

class Usuario(BaseModel, UserMixin):
    idusuario = AutoField()
    nome = CharField(max_length=150)
    email = CharField(max_length=150, unique=True)
    senha = CharField(max_length=255)
    telefone = CharField(max_length=20, null=True)
    is_admin = BooleanField(default=False)
    
    # NOVOS CAMPOS PARA VERIFICAÇÃO
    codigo_verificacao = CharField(max_length=6, null=True) # Guarda o código de 6 dígitos
    email_verificado = BooleanField(default=False) # Só deixa logar se for True

    def get_id(self):
        return str(self.idusuario)