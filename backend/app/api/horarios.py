from flask import request, jsonify
from . import api_bp
from ..models.agenda import Agenda;
from flask_login import login_required, current_user


# 1. LISTAR (GET)
@api_bp.route('/horarios', methods=['GET'])
def get_horarios_publicos():
    try:
        # Busca apenas os itens da agenda que são públicos
        agendas = Agenda.select().where(Agenda.is_public == True).order_by(Agenda.horario.asc())
        
        lista = []
        for a in agendas:
            lista.append({
                "id": a.id,
                "dia": a.dia_semana, 
                "titulo": a.titulo,
                "horario": str(a.horario),
                "local": a.local
            })
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/horarios', methods=['POST'])
@login_required
def create_horario_publico():
    data = request.json
    try:
        # Ao criar pela tela de horários, is_public é sempre True
        nova_agenda = Agenda.create(
            titulo=data.get('titulo'),
            dia_semana=data.get('dia'),
            horario=data.get('horario'),
            local=data.get('local'),
            is_public=True,
            criado_por=current_user.idusuario
        )
        return jsonify({"message": "Horário público criado!", "id": nova_agenda.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. ATUALIZAR (PUT)
@api_bp.route('/horarios/<int:id>', methods=['PUT'])
@login_required
def update_horario(id):
    data = request.json
    try:
        horario = Agenda.get_or_none(Agenda.id == id)
        if not horario:
            return jsonify({"error": "Horário não encontrado"}), 404

        horario.dia_semana = data.get('dia', horario.dia_semana)
        horario.titulo = data.get('titulo', horario.titulo) # Atualiza titulo
        horario.horario = data.get('horario', horario.horario)
        horario.local = data.get('local', horario.local)
        
        horario.save()
        return jsonify({"message": "Horário atualizado!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. DELETAR (DELETE)
@api_bp.route('/horarios/<int:id>', methods=['DELETE'])
@login_required
def delete_horario(id):
    try:
        query = Agenda.delete().where(Agenda.id == id)
        rows = query.execute()
        if rows == 0:
            return jsonify({"error": "Horário não encontrado"}), 404
        return jsonify({"message": "Horário removido!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500