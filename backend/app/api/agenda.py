from flask import request, jsonify
from . import api_bp
from ..models.agenda import Agenda;
from flask_login import login_required, current_user

@api_bp.route('/agenda', methods=['GET'])
def get_agenda():
    try:
        # Busca todos os registros, ordenados por data (opcional)
        agendas = Agenda.select().order_by(Agenda.data.desc())
        
        lista_agenda = []
        for a in agendas:
            lista_agenda.append({
                "id": a.id,
                "titulo": a.titulo,
                "tipo": a.tipo,
                "local": a.local,
                # Convertendo Date e Time para string (ISO format) para o JSON
                "data": str(a.data), 
                "horario": str(a.horario),

                "descricao": a.descricao,
                "criado_por": a.criado_por.idusuario if a.criado_por else None
            })
            
        return jsonify(lista_agenda), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 2. CRIAR NOVO (POST)
@api_bp.route('/agenda', methods=['POST'])
@login_required
def create_agenda():
    data = request.json
    
    # Validação básica (opcional, mas recomendada)
    if not data.get('titulo') or not data.get('data'):
        return jsonify({"error": "Título e Data são obrigatórios"}), 400

    try:
        nova_agenda = Agenda.create(
            titulo=data.get('titulo'),
            tipo=data.get('tipo'),
            data=data.get('data'),       # Espera string 'YYYY-MM-DD'
            local=data.get('local'),
            horario=data.get('horario'), # Espera string 'HH:MM'
            descricao=data.get('descricao'),
            criado_por=current_user.idusuario
        )
        
        return jsonify({
            "message": "Agendamento criado com sucesso!",
            "id": nova_agenda.id
        }), 201
        
    except Exception as e:
        print(f"Erro ao salvar: {e}") # Bom para debug no terminal
        return jsonify({"error": str(e)}), 500


# 4. DELETAR (DELETE)
@api_bp.route('/agenda/<int:id>', methods=['DELETE'])
@login_required
def delete_agenda(id):
    try:
        agenda_item = Agenda.get_or_none(Agenda.id == id)

        if not agenda_item:
            return jsonify({"error": "Item não encontrado"}), 404

        # --- LÓGICA DE PERMISSÃO ---
        is_admin = current_user.tipo == 'admin'
        is_owner = agenda_item.criado_por.idusuario == current_user.idusuario

        if not (is_admin or is_owner):
            return jsonify({"error": "Você não tem permissão para excluir este registro"}), 403
        # ---------------------------

        agenda_item.delete_instance()
        return jsonify({"message": "Removido com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# 3. ATUALIZAR (PUT)
@api_bp.route('/agenda/<int:id>', methods=['PUT'])
@login_required
def update_agenda(id):
    data = request.json
    try:
        # Busca o item no banco pelo ID que veio na URL
        agenda_item = Agenda.get_or_none(Agenda.id == id)
        
        if not agenda_item:
            return jsonify({"error": "Item da agenda não encontrado"}), 404

        # Atualiza os campos com os dados novos vindos do React
        agenda_item.titulo = data.get('titulo')
        agenda_item.tipo = data.get('tipo')
        agenda_item.local = data.get('local')
        agenda_item.data = data.get('data')
        agenda_item.horario = data.get('horario')
        agenda_item.descricao = data.get('descricao')
        
        
        agenda_item.save() # Salva no banco de dados
        
        return jsonify({"message": "Agendamento atualizado com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    