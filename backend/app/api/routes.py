from flask import request, jsonify, current_app
from . import api_bp
from ..models.eventos import Evento;
from ..models.inscricao_evento import InscricaoEvento;
from ..models.agenda import Agenda;
from ..models.avisos import Aviso;
from flask_mail import Message
from ..extensions import mail
from flask_login import login_required, current_user

# O prefixo /api/v1 já foi definido no create_app
# Rota: http://localhost:5000/api/v1/data


# --- ROTA DASHBOARD (NOVA) ---
@api_bp.route('/dashboard', methods=['GET'])
@login_required # Importante: Identifica quem está logado
def get_dashboard_data():
    try:
        user = current_user
        
        # Define o filtro base: Admin vê tudo, Gestor vê apenas o dele
        if user.tipo == 'admin':
            # Consultas globais
            q_eventos = Evento.select()
            q_avisos = Aviso.select()
            q_agenda = Agenda.select()
        else:
            # Consultas filtradas por dono
            q_eventos = Evento.select().where(Evento.criado_por == user.idusuario)
            q_avisos = Aviso.select().where(Aviso.criado_por == user.idusuario)
            q_agenda = Agenda.select().where(Agenda.criado_por == user.idusuario)

        # 1. Contagens para os Cards
        stats = {
            "eventos": q_eventos.count(),
            "avisos": q_avisos.count(),
            "agenda": q_agenda.count(),
            "horarios": Agenda.select().where(Agenda.is_public == True).count() # Horários públicos todos veem
        }

        # 2. Atividade Recente filtrada
        recent_activity = []

        # Eventos recentes do usuário (ou todos se admin)
        last_eventos = q_eventos.order_by(Evento.id.desc()).limit(3)
        for e in last_eventos:
            recent_activity.append({
                "action": "Evento Registrado",
                "item": e.titulo,
                "type": "evento",
                "sort_id": e.id * 1000
            })

        # Avisos recentes
        last_avisos = q_avisos.order_by(Aviso.id.desc()).limit(3)
        for a in last_avisos:
            recent_activity.append({
                "action": "Aviso Publicado",
                "item": a.titulo,
                "type": "aviso",
                "sort_id": a.id * 1000
            })

        # Agendas recentes
        last_agenda = q_agenda.order_by(Agenda.id.desc()).limit(3)
        for ag in last_agenda:
            recent_activity.append({
                "action": "Novo Agendamento",
                "item": f"{ag.titulo}",
                "type": "agenda",
                "sort_id": ag.id * 1000
            })

        recent_activity.sort(key=lambda x: x['sort_id'], reverse=True)
        
        return jsonify({
            "stats": stats,
            "activity": recent_activity[:5],
            "user_role": user.tipo # Informativo para o front
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
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
            # Realiza a contagem de inscritos para cada evento
            total_inscritos = e.inscricoes.count() 

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
                "registered_count": total_inscritos, # <<< CAMPO NOVO COM A CONTAGEM
                "criado_por": e.criado_por.idusuario if e.criado_por else None
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
    
    

# --- ROTA AGENDA ---

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
    

# --- ROTAS DE AVISOS ---

# 1. LISTAR (GET)
# O React espera uma lista de objetos com: id, titulo, categoria, descricao, data, url
@api_bp.route('/avisos', methods=['GET'])
def get_avisos():
    try:
        # Busca todos os avisos, ordenados pela data (mais recentes primeiro)
        avisos = Aviso.select().order_by(Aviso.data.desc())
        
        lista_avisos = []
        for a in avisos:
            lista_avisos.append({
                "id": a.id,
                "titulo": a.titulo,
                "categoria": a.categoria,
                "url": a.url if a.url else "", # Garante string vazia se for None
                "descricao": a.descricao,
                # Converte objeto date para string (YYYY-MM-DD) para o React não quebrar
                "data": str(a.data),
                "criado_por_id": a.criado_por.idusuario if a.criado_por else None
            })
            
        return jsonify(lista_avisos), 200
    except Exception as e:
        print(f"Erro ao buscar avisos: {e}") # Log no terminal
        return jsonify({"error": str(e)}), 500

# 2. CRIAR (POST)
# O React envia: { titulo, categoria, descricao, data, url }
@api_bp.route('/avisos', methods=['POST'])
@login_required
def create_aviso():
    data = request.json
    
    # Validação simples
    if not data.get('titulo') or not data.get('categoria') or not data.get('data'):
        return jsonify({"error": "Campos obrigatórios faltando (titulo, categoria, data)"}), 400

    try:
        novo_aviso = Aviso.create(
            titulo=data.get('titulo'),
            categoria=data.get('categoria'),
            url=data.get('url'),
            descricao=data.get('descricao'),
            data=data.get('data'), # O Peewee converte string 'YYYY-MM-DD' automaticamente para DateField
            criado_por=current_user.idusuario
        )
        
        return jsonify({
            "message": "Aviso criado com sucesso!", 
            "id": novo_aviso.id
        }), 201
        
    except Exception as e:
        print(f"Erro ao criar aviso: {e}")
        return jsonify({"error": str(e)}), 500

# 3. ATUALIZAR (PUT)
# Nota: Seu frontend atual tem o botão de editar, mas ainda não implementou a lógica de chamar essa rota.
# Já deixo pronta para quando você fizer o modal de edição.
@api_bp.route('/avisos/<int:id>', methods=['PUT'])
@login_required
def update_aviso(id):
    data = request.json
    try:
        aviso = Aviso.get_or_none(Aviso.id == id)
        
        if not aviso:
            return jsonify({"error": "Aviso não encontrado"}), 404
        
        # Regra: Admin tudo, Gestor apenas o dele
        if current_user.tipo != 'admin' and aviso.criado_por.idusuario != current_user.idusuario:
            return jsonify({"error": "Sem permissão"}), 403

        # Atualiza apenas os campos enviados
        aviso.titulo = data.get('titulo', aviso.titulo)
        aviso.categoria = data.get('categoria', aviso.categoria)
        aviso.url = data.get('url', aviso.url)
        aviso.descricao = data.get('descricao', aviso.descricao)
        aviso.data = data.get('data', aviso.data)
        
        aviso.save()
        
        return jsonify({"message": "Aviso atualizado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. DELETAR (DELETE)
# O React chama: /api/v1/avisos/{id}
@api_bp.route('/avisos/<int:id>', methods=['DELETE'])
@login_required
def delete_aviso(id):
    try:
        aviso = Aviso.get_or_none(Aviso.id == id)
        if not aviso: return jsonify({"error": "Não encontrado"}), 404

        if current_user.tipo != 'admin' and aviso.criado_por.idusuario != current_user.idusuario:
            return jsonify({"error": "Sem permissão"}), 403

        aviso.delete_instance()
        return jsonify({"message": "Aviso deletado!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# --- ROTAS DE HORÁRIOS ---

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
def delete_horario(id):
    try:
        query = Agenda.delete().where(Agenda.id == id)
        rows = query.execute()
        if rows == 0:
            return jsonify({"error": "Horário não encontrado"}), 404
        return jsonify({"message": "Horário removido!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ROTA DE ENVIO DE E-MAIL
@api_bp.route('/enviar-email', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        
        # Extração e Validação
        name = data.get('nome')
        email = data.get('email')
        phone = data.get('telefone')
        subject = data.get('assunto')
        message_body = data.get('mensagem')

        if not all([name, email, subject, message_body]):
            return jsonify({'error': 'Campos obrigatórios (Nome, Email, Assunto, Mensagem) estão faltando.'}), 400

        # Criação da Mensagem
        msg = Message(
            subject=f"[Mensagem de Contato] - {subject}",
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=[current_app.config['TARGET_EMAIL']], 
            body=f"""
Nome: {name}
Email: {email}
Telefone: {phone or 'Não informado'}
---------------------------
Mensagem:
{message_body}
            """,
            reply_to=email
        )
        
        # Envio
        mail.send(msg)

        return jsonify({'message': 'Email enviado com sucesso!'}), 200

    except Exception as e:
        current_app.logger.error(f"Erro ao enviar email: {e}")
        return jsonify({'error': 'Falha interna do servidor ao enviar o e-mail.'}), 500
    