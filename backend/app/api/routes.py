from flask import request, jsonify
from . import api_bp
from ..models.eventos import Evento;
from ..models.agenda import Agenda;
from ..models.avisos import Aviso;
from ..models.horario import Horario;

# O prefixo /api/v1 já foi definido no create_app
# Então, esta rota será acessível em: http://localhost:5000/api/v1/data

# --- ROTA EVENTOS ---

@api_bp.route('/eventos', methods=['POST'])
def create_evento():
    data = request.json
    
    try:
        # Cria o evento usando o Peewee
        novo_evento = Evento.create(
            titulo=data.get('titulo'),
            tipo=data.get('tipo'),
            local=data.get('local'),
            tipo_vagas=data.get('tipo_vagas'),
            # Converte para int se houver valor, senão None
            numero_vagas=int(data.get('numero_vagas')) if data.get('numero_vagas') else None,
            data=data.get('data'),
            horario=data.get('horario'),
            descricao=data.get('descricao')
        )
        
        return jsonify({
            "message": "Evento criado com sucesso!",
            "id": novo_evento.id
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api_bp.route('/eventos', methods=['GET'])
def get_eventos():
    try:
        # Busca todos os eventos no banco
        eventos = Evento.select()
        
        lista_eventos = []
        for e in eventos:
            lista_eventos.append({
                "id": e.id,
                "titulo": e.titulo,
                "tipo": e.tipo,
                "local": e.local,
                "tipo_vagas": e.tipo_vagas,
                "numero_vagas": e.numero_vagas,
                # Convertendo data e hora para string para o JSON aceitar
                "data": str(e.data), 
                "horario": str(e.horario),
                "descricao": e.descricao
            })
            
        return jsonify(lista_eventos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ROTA PARA ATUALIZAR (EDITAR)
@api_bp.route('/eventos/<int:id>', methods=['PUT'])
def update_evento(id):
    data = request.json
    try:
        # Busca o evento pelo ID
        evento = Evento.get_or_none(Evento.id == id)
        if not evento:
            return jsonify({"error": "Evento não encontrado"}), 404

        # Atualiza os campos
        evento.titulo = data.get('titulo')
        evento.tipo = data.get('tipo')
        evento.local = data.get('local')
        evento.tipo_vagas = data.get('tipo_vagas')
        evento.numero_vagas = int(data.get('numero_vagas')) if data.get('numero_vagas') else None
        evento.data = data.get('data')
        evento.horario = data.get('horario')
        evento.descricao = data.get('descricao')
        
        evento.save() # Salva as alterações no banco
        
        return jsonify({"message": "Evento atualizado com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ROTA PARA DELETAR
@api_bp.route('/eventos/<int:id>', methods=['DELETE'])
def delete_evento(id):
    try:
        query = Evento.delete().where(Evento.id == id)
        rows_deleted = query.execute()
        
        if rows_deleted == 0:
            return jsonify({"error": "Evento não encontrado"}), 404
            
        return jsonify({"message": "Evento deletado com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


    