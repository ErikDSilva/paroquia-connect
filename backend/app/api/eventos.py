from flask import request, jsonify
from . import api_bp
from ..models.eventos import Evento;
from ..models.inscricao_evento import InscricaoEvento;
from flask_login import login_required, current_user

# --- ROTA EVENTOS ---

@api_bp.route('/eventos', methods=['POST'])
@login_required
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
            descricao=data.get('descricao'),
            criado_por=current_user.idusuario
            
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
        # Busca todos os eventos. 
        # NOTA: Usamos a propriedade 'inscricoes' (backref) do modelo Evento.
        eventos = Evento.select()
        
        lista_eventos = []
        for e in eventos:
            total = InscricaoEvento.select().where(InscricaoEvento.evento == e.id).count()
            # Realiza a contagem de inscritos para cada evento

            lista_eventos.append({
                "id": e.id,
                "titulo": e.titulo,
                "tipo": e.tipo,
                "local": e.local,
                "tipo_vagas": e.tipo_vagas,
                "numero_vagas": e.numero_vagas,
                "data": str(e.data), 
                "horario": str(e.horario),
                "descricao": e.descricao,
                "registered_count": total, # <<< CAMPO NOVO COM A CONTAGEM
                "criado_por": e.criado_por.idusuario if e.criado_por else None
            })
            
        return jsonify(lista_eventos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ROTA PARA ATUALIZAR (EDITAR)
@api_bp.route('/eventos/<int:id>', methods=['PUT'])
@login_required
def update_evento(id):
    data = request.json
    try:
        # Busca o evento pelo ID
        evento = Evento.get_or_none(Evento.id == id)
        if not evento:
            return jsonify({"error": "Evento não encontrado"}), 404
        
        # Lógica de Permissão
        if current_user.tipo != 'admin' and evento.criado_por.idusuario != current_user.idusuario:
            return jsonify({"error": "Sem permissão"}), 403

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
@login_required
def delete_evento(id):
    try:
        evento = Evento.get_or_none(Evento.id == id)
        if not evento:
            return jsonify({"error": "Não encontrado"}), 404

        # Lógica de Permissão
        if current_user.tipo != 'admin' and evento.criado_por.idusuario != current_user.idusuario:
            return jsonify({"error": "Sem permissão"}), 403

        evento.delete_instance()
        return jsonify({"message": "Excluído"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500




# --- ROTA INSCRIÇÃO DE EVENTOS ---

@api_bp.route('/eventos/<int:evento_id>/inscricao', methods=['POST'])
def create_inscricao(evento_id):
    data = request.json
    
    # 1. Validação dos dados
    if not data or not data.get('nome') or not data.get('telefone'):
        return jsonify({"error": "Nome e Telefone são obrigatórios para a inscrição."}), 400

    try:
        # 2. Verifica se o evento existe
        evento = Evento.get_or_none(Evento.id == evento_id)
        if not evento:
            return jsonify({"error": "Evento não encontrado para inscrição."}), 404
            
        # 3. Verifica limite de vagas (se for limitado)
        if evento.tipo_vagas == 'limitada' and evento.numero_vagas is not None:
            # Conta as inscrições existentes (IMPORTANTE: Você deve criar a contagem no modelo)
            total_inscritos = InscricaoEvento.select().where(InscricaoEvento.evento == evento).count()
            
            if total_inscritos >= evento.numero_vagas:
                return jsonify({"error": "As vagas para este evento já estão esgotadas."}), 403

        # 4. Cria a inscrição no banco
        InscricaoEvento.create(
            nome=data.get('nome'),
            numero=data.get('telefone'), # O seu modelo chama o campo de telefone de 'numero'
            evento=evento # Peewee lida com a Foreign Key
        )
        
        return jsonify({"message": "Inscrição realizada com sucesso!"}), 201
        
    except Exception as e:
        print(f"Erro ao criar inscrição: {e}")
        return jsonify({"error": "Erro interno ao processar a inscrição."}), 500


# --- ROTA LISTAGEM DE INSCRITOS (Para a Secretaria) ---

@api_bp.route('/eventos/<int:evento_id>/inscricoes', methods=['GET'])
def get_inscricoes_evento(evento_id):
    try:
        # Busca todas as inscrições para o evento específico
        inscricoes = InscricaoEvento.select().where(InscricaoEvento.evento == evento_id)
        
        lista_inscricoes = []
        for i in inscricoes:
            lista_inscricoes.append({
                "id": i.id,
                "nome": i.nome,
                "telefone": i.numero,
                # O Peewee pode ter um campo 'data_inscricao' se você o adicionou, 
                # mas vou usar um padrão se não houver um campo explícito no seu modelo
                "data_inscricao": i.data_criacao if hasattr(i, 'data_criacao') else "N/A" 
            })
            
        return jsonify(lista_inscricoes), 200
        
    except Exception as e:
        print(f"Erro ao buscar inscrições: {e}")
        return jsonify({"error": "Erro ao buscar a lista de inscritos."}), 500
    
    
