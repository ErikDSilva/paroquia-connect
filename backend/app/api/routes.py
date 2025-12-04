from flask import request, jsonify, current_app
from . import api_bp
from ..models.eventos import Evento;
from ..models.agenda import Agenda;
from ..models.avisos import Aviso;
from ..models.horario import Horario;
from flask_mail import Message
from .. import mail

# O prefixo /api/v1 já foi definido no create_app
# Rota: http://localhost:5000/api/v1/data


# --- ROTA DASHBOARD (NOVA) ---
@api_bp.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        # 1. Contagens para os Cards
        total_eventos = Evento.select().count()
        total_avisos = Aviso.select().count()
        total_agenda = Agenda.select().count()
        total_horarios = Horario.select().count()

        # 2. Atividade Recente
        # Buscamos os últimos 3 de cada tabela para misturar na timeline
        # Usamos o ID descrescente como proxy para "mais recente"
        
        recent_activity = []

        # Eventos recentes
        last_eventos = Evento.select().order_by(Evento.id.desc()).limit(3)
        for e in last_eventos:
            recent_activity.append({
                "action": "Novo Evento Criado",
                "item": e.titulo,
                "type": "evento",
                "id": e.id,
                "sort_id": e.id * 1000 # Peso para ordenação misturada simples
            })

        # Avisos recentes
        last_avisos = Aviso.select().order_by(Aviso.id.desc()).limit(3)
        for a in last_avisos:
            recent_activity.append({
                "action": "Aviso Publicado",
                "item": a.titulo,
                "type": "aviso",
                "id": a.id,
                "sort_id": a.id * 1000
            })

        # Agendamentos recentes (Substitui "Membros")
        last_agenda = Agenda.select().order_by(Agenda.id.desc()).limit(3)
        for ag in last_agenda:
            recent_activity.append({
                "action": "Novo Agendamento",
                "item": f"{ag.titulo} - {ag.data}",
                "type": "agenda",
                "id": ag.id,
                "sort_id": ag.id * 1000
            })

        # Ordena a lista misturada e pega os 5 últimos
        # Nota: Num sistema real, usaríamos um campo 'created_at' para ordenar precisamente
        recent_activity.sort(key=lambda x: x['sort_id'], reverse=True)
        final_activity = recent_activity[:5]

        return jsonify({
            "stats": {
                "eventos": total_eventos,
                "avisos": total_avisos,
                "agenda": total_agenda,
                "horarios": total_horarios
            },
            "activity": final_activity
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
                "descricao": a.descricao
            })
            
        return jsonify(lista_agenda), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 2. CRIAR NOVO (POST)
@api_bp.route('/agenda', methods=['POST'])
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
            descricao=data.get('descricao')
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
        query = Agenda.delete().where(Agenda.id == id)
        rows_deleted = query.execute()
        
        if rows_deleted == 0:
            return jsonify({"error": "Item não encontrado"}), 404
            
        return jsonify({"message": "Removido da agenda com sucesso!"}), 200

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
                "data": str(a.data) 
            })
            
        return jsonify(lista_avisos), 200
    except Exception as e:
        print(f"Erro ao buscar avisos: {e}") # Log no terminal
        return jsonify({"error": str(e)}), 500

# 2. CRIAR (POST)
# O React envia: { titulo, categoria, descricao, data, url }
@api_bp.route('/avisos', methods=['POST'])
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
            data=data.get('data') # O Peewee converte string 'YYYY-MM-DD' automaticamente para DateField
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
def update_aviso(id):
    data = request.json
    try:
        aviso = Aviso.get_or_none(Aviso.id == id)
        
        if not aviso:
            return jsonify({"error": "Aviso não encontrado"}), 404

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
def delete_aviso(id):
    try:
        query = Aviso.delete().where(Aviso.id == id)
        rows_deleted = query.execute()
        
        if rows_deleted == 0:
             return jsonify({"error": "Aviso não encontrado"}), 404
             
        return jsonify({"message": "Aviso deletado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# --- ROTAS DE HORÁRIOS ---

# 1. LISTAR (GET)
@api_bp.route('/horarios', methods=['GET'])
def get_horarios():
    try:
        horarios = Horario.select()
        lista = []
        for h in horarios:
            lista.append({
                "id": h.id,
                "dia": h.dia_semana,      
                "titulo": h.titulo,        # Agora usa 'titulo' para alinhar com o front
                "horario": str(h.horario), 
                "local": h.local
            })
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. CRIAR (POST)
@api_bp.route('/horarios', methods=['POST'])
def create_horario():
    data = request.json
    try:
        novo_horario = Horario.create(
            dia_semana=data.get('dia'),
            titulo=data.get('titulo'),     # Recebe 'titulo' do input livre
            horario=data.get('horario'),
            local=data.get('local')
        )
        return jsonify({"message": "Horário criado!", "id": novo_horario.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. ATUALIZAR (PUT)
@api_bp.route('/horarios/<int:id>', methods=['PUT'])
def update_horario(id):
    data = request.json
    try:
        horario = Horario.get_or_none(Horario.id == id)
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
        query = Horario.delete().where(Horario.id == id)
        rows = query.execute()
        if rows == 0:
            return jsonify({"error": "Horário não encontrado"}), 404
        return jsonify({"message": "Horário removido!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ROTA DE ENVIO DE E-MAIL
@api_bp.route('/enviar-email', methods=['POST', "OPTIONS"])
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
    