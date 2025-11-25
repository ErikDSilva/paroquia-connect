from peewee import *
from . import BaseModel

class Horario(BaseModel):
    id = AutoField()
    titulo = CharField(max_length=45)
    horario = TimeField()
    local = CharField(max_length=45)
    dia_semana = CharField(max_length=45)
