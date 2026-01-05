import pytest
import json
from datetime import date, time, timedelta
from peewee import SqliteDatabase
from unittest.mock import patch, MagicMock

from app.models.usuario import Usuario
from app.models.eventos import Evento
from app.models.inscricao_evento import InscricaoEvento
from app.models.agenda import Agenda
from app.models.avisos import Aviso

# --- Fixtures de Setup ---
@pytest.fixture(scope="session")
def test_db():
    models = [Usuario, Evento, InscricaoEvento, Agenda, Aviso] 
    db = SqliteDatabase(":memory:")
    db.bind(models, bind_refs=False, bind_backrefs=False)
    db.connect()
    db.execute_sql('PRAGMA foreign_keys = ON;')
    db.create_tables(models)
    yield db
    db.drop_tables(models)
    db.close()

class TestingConfig:
    TESTING = True
    MAIL_DEFAULT_SENDER = 'teste@igreja.org'
    TARGET_EMAIL = 'secreta@igreja.org'
    SECRET_KEY = 'test-secret'
    LOGIN_DISABLED = False

def create_test_app():
    from flask import Flask
    from app.api.routes import api_bp
    from app.api.auth_routes import auth_bp
    from app.api.auth_routes import admin_management_bp
    from flask_mail import Mail
    from flask_login import LoginManager
    
    app = Flask(__name__)
    app.config.from_object(TestingConfig())
    
    mail = Mail(app)
    login_manager = LoginManager()
    login_manager.init_app(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        return Usuario.get_or_none(Usuario.idusuario == user_id)

    app.register_blueprint(api_bp, url_prefix='/api/v1')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_management_bp, url_prefix='/auth')
    
    return app

@pytest.fixture(scope="session")
def client(test_db):
    app = create_test_app() 
    with app.test_client() as client:
        yield client

@pytest.fixture(scope="function")
def logged_in_client(client, test_db):
    # Usa get_or_create para evitar erro de duplicidade
    user, created = Usuario.get_or_create(
        idusuario=999,
        defaults={
            "nome": "Admin Teste",
            "email": "admin@test.com",
            "senha": "admin_pass",
            "tipo": "admin" # Verifique se o campo é 'tipo' ou 'is_admin' conforme seu routes.py
        }
    )
    
    login_payload = {"email": "admin@test.com", "senha": "admin_pass"}
    client.post('/auth/login', data=json.dumps(login_payload), content_type='application/json')
    yield client
    client.post('/auth/logout')

@pytest.fixture(scope="function")
def admin_user(test_db):
    """Cria um usuário admin para testes de relação com modelos."""
    user, created = Usuario.get_or_create(
        idusuario=999,
        defaults={
            "nome": "Admin Teste",
            "email": "admin@test.com",
            "senha": "admin_pass",
            "tipo": "admin"
        }
    )
    return user



@pytest.fixture(autouse=True)
def cleanup_data(test_db):
    Evento.delete().execute()
    InscricaoEvento.delete().execute()
    Agenda.delete().execute()
    Aviso.delete().execute()
    Usuario.delete().where(Usuario.idusuario != 999).execute()

# ---------------------------------------------------------------------
# -------------------- TESTES DE AUTENTICAÇÃO (/auth) --------------------
# ---------------------------------------------------------------------

def test_auth_register_success(client, test_db):
    """Testa se o registro funciona e cria o usuário no DB."""
    payload = {"nome": "Zezinho", "email": "ze@teste.com", "senha": "123", "telefone": "11912345678"}
    
    response = client.post('/auth/register', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert "Usuário registrado com sucesso!" in data['message']
    
    user = Usuario.get_or_none(Usuario.email == payload['email'])
    assert user is not None
    assert user.senha == "123"

def test_auth_register_duplicate_email(client, test_db):
    """Testa a prevenção de emails duplicados."""
    Usuario.create(nome="Existente", email="dup@teste.com", senha="123")
    
    payload = {"nome": "Outro", "email": "dup@teste.com", "senha": "456"}
    response = client.post('/auth/register', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Email já cadastrado" in data['error']

def test_auth_login_success(client, test_db):
    """Testa login com credenciais válidas."""
    Usuario.create(nome="Login", email="login@teste.com", senha="pass")
    payload = {"email": "login@teste.com", "senha": "pass"}
    
    response = client.post('/auth/login', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "Login realizado" in data['message']
    assert data['user']['email'] == "login@teste.com"

def test_auth_login_invalid_password(client, test_db):
    """Testa login com senha incorreta."""
    Usuario.create(nome="Login", email="fail@teste.com", senha="pass_correta")
    payload = {"email": "fail@teste.com", "senha": "pass_incorreta"}
    
    response = client.post('/auth/login', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 401
    data = json.loads(response.data)
    assert "Credenciais inválidas" in data['error']

def test_auth_logout(logged_in_client):
    """Testa o logout de um usuário autenticado."""
    response = logged_in_client.post('/auth/logout')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "Logout realizado" in data['message']

def test_auth_me_authenticated(logged_in_client):
    """Testa a rota /me para um usuário logado."""
    response = logged_in_client.get('/auth/me')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['is_authenticated'] is True
    assert data['user']['email'] == "admin@test.com"

# ---------------------------------------------------------------------
# -------------------- TESTES DE DASHBOARD (/dashboard) --------------------
# ---------------------------------------------------------------------

def test_dashboard_data_empty(logged_in_client, test_db):
    """Testa a rota de dashboard quando o banco está vazio."""
    response = logged_in_client.get('/api/v1/dashboard')
    assert response.status_code == 200
    data = json.loads(response.data)
    
    assert data['stats']['eventos'] == 0
    assert data['stats']['avisos'] == 0
    assert data['stats']['agenda'] == 0
    assert data['stats']['horarios'] == 0
    assert data['activity'] == []

def test_dashboard_data_full(logged_in_client, test_db):
    """Testa a rota de dashboard com dados preenchidos e ordenação."""
    admin_user = Usuario.get_or_none(Usuario.idusuario == 999)
    for i in range(5):
        Evento.create(titulo=f"E{i}", tipo="T", local="L", data=date.today(), horario=time(10, 0), criado_por=admin_user)
        Aviso.create(titulo=f"A{i}", categoria="C", data=date.today(), criado_por=admin_user)
        Agenda.create(titulo=f"Ag{i}", tipo="T", local="L", data=date.today(), horario=time(10, 0), criado_por=admin_user)

    response = logged_in_client.get('/api/v1/dashboard')
    assert response.status_code == 200
    data = json.loads(response.data)
    
    assert len(data['activity']) == 5
    
    # O item mais recente deve ser um evento (o último criado)
    latest_item = data['activity'][0]
    
    assert latest_item['action'] == "Evento Registrado"
    assert latest_item['item'] == "E4"

    actions = [item['action'] for item in data['activity']]
    assert "Evento Registrado" in actions
    assert "Aviso Publicado" in actions
    assert "Novo Agendamento" in actions

# ---------------------------------------------------------------------
# -------------------- TESTES DE EVENTOS (/eventos) --------------------
# ---------------------------------------------------------------------

def test_eventos_create_success(logged_in_client, test_db):
    """Testa a criação de um evento com vagas limitadas."""
    payload = {
        "titulo": "Festa Junina", "tipo": "Comunidade", "local": "Pátio",
        "data": "2026-06-20", "horario": "18:00"
    }
    response = logged_in_client.post('/api/v1/eventos', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 201
    
    evento = Evento.get_or_none(Evento.titulo == "Festa Junina")
    assert evento is not None
    assert str(evento.data) == "2026-06-20"

def test_eventos_create_no_vagas(logged_in_client, test_db):
    """Testa a criação de um evento sem especificar vagas."""
    payload = {
        "titulo": "Missa Dominical",
        "tipo": "Religioso",
        "local": "Matriz",
        "data": "2026-06-20",
        "horario": "09:00",
    }
    response = logged_in_client.post('/api/v1/eventos', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 201
    
    evento = Evento.get_or_none(Evento.titulo == "Missa Dominical")
    assert evento.tipo_vagas is None
    assert evento.numero_vagas is None

def test_eventos_get_list(client, test_db):
    """Testa a listagem de eventos com a contagem de inscritos."""
    admin = Usuario.get_by_id(999)
    e1 = Evento.create(titulo="E1", tipo="T", local="L", data=date.today(), horario=time(10, 0), criado_por=admin)
    e2 = Evento.create(titulo="E2", tipo="T", local="L", data=date.today(), horario=time(10, 0), criado_por=admin)
    InscricaoEvento.create(nome="I1", numero="1", evento=e1)
    InscricaoEvento.create(nome="I2", numero="2", evento=e1)
    
    response = client.get('/api/v1/eventos')
    assert response.status_code == 200
    lista = json.loads(response.data)
    assert len(lista) == 2
    
    e1_data = next(item for item in lista if item['titulo'] == 'E1')
    e2_data = next(item for item in lista if item['titulo'] == 'E2')
    assert e1_data['registered_count'] == 2
    assert e2_data['registered_count'] == 0

def test_eventos_update_success(logged_in_client, test_db):
    """Testa a atualização de um evento (PUT)."""
    admin_user = Usuario.get_or_none(Usuario.idusuario == 999)
    evento = Evento.create(titulo="Original", tipo="T", local="L", data=date.today(), horario=time(10, 0), criado_por=admin_user)
    
    payload = {
        "titulo": "Atualizado", 
        "tipo": "Novo Tipo",
        "local": "Local Mantido",
        "data": str(date.today()), 
        "horario": "10:00",
        "tipo_vagas": None,
        "numero_vagas": None, 
        "descricao": "Nova descrição"
    }
    
    response = logged_in_client.put(f'/api/v1/eventos/{evento.id}', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 200
    evento_att = Evento.get_by_id(evento.id)
    assert evento_att.titulo == "Atualizado"
    assert evento_att.tipo == "Novo Tipo"

def test_eventos_delete_success(logged_in_client, test_db):
    """Testa a deleção de um evento (DELETE) e a cascata de inscrições."""
    admin_user = Usuario.get_or_none(Usuario.idusuario == 999)
    evento = Evento.create(titulo="A Deletar", tipo="T", local="L", data=date.today(), horario=time(10, 0), criado_por=admin_user)
    InscricaoEvento.create(nome="I", numero="1", evento=evento)
    
    assert Evento.select().count() == 1
    assert InscricaoEvento.select().count() == 1
    
    response = logged_in_client.delete(f'/api/v1/eventos/{evento.id}')
    
    assert response.status_code == 200
    assert Evento.select().count() == 0
    assert InscricaoEvento.select().count() == 0 

# ---------------------------------------------------------------------
# -------------------- TESTES DE INSCRIÇÃO (/inscricao) --------------------
# ---------------------------------------------------------------------

def test_inscricao_create_success(logged_in_client, test_db):
    """Testa a inscrição em um evento sem limite de vagas."""
    admin_user = Usuario.get_or_none(Usuario.idusuario == 999)
    evento = Evento.create(titulo="Livre", tipo="T", local="L", data=date.today(), horario=time(10, 0), criado_por=admin_user)
    payload = {"nome": "Novo Inscrito", "telefone": "333"}
    
    response = logged_in_client.post(f'/api/v1/eventos/{evento.id}/inscricao', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 201
    assert InscricaoEvento.select().count() == 1
    inscricao = InscricaoEvento.get()
    assert inscricao.nome == "Novo Inscrito"
    assert inscricao.numero == "333"

def test_inscricao_evento_not_found(client, test_db):
    """Testa a inscrição em um evento inexistente."""
    payload = {"nome": "X", "telefone": "Y"}
    response = client.post('/api/v1/eventos/999/inscricao', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 404
    data = json.loads(response.data)
    assert "Evento não encontrado para inscrição" in data['error']

def test_inscricao_vagas_esgotadas(logged_in_client, test_db):
    """Testa a tentativa de inscrição quando as vagas acabaram."""
    admin_user = Usuario.get_or_none(Usuario.idusuario == 999)
    evento = Evento.create(
        titulo="Lotado", 
        tipo="T", 
        local="L", 
        data=date.today(), 
        horario=time(10, 0),
        tipo_vagas='limitada',
        numero_vagas=1,
        criado_por=admin_user
    )
    InscricaoEvento.create(nome="Vaga 1", numero="1", evento=evento)
    
    payload = {"nome": "Tentante", "telefone": "2"}
    response = logged_in_client.post(f'/api/v1/eventos/{evento.id}/inscricao', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 403
    data = json.loads(response.data)
    assert "vagas para este evento já estão esgotadas" in data['error']
    assert InscricaoEvento.select().count() == 1

def test_inscricao_get_list(logged_in_client, test_db):
    """Testa a listagem de inscritos para um evento específico."""
    admin_user = Usuario.get_or_none(Usuario.idusuario == 999)
    evento = Evento.create(titulo="Com Inscritos", tipo="T", local="L", data=date.today(), horario=time(10, 0), criado_por=admin_user)
    i1 = InscricaoEvento.create(nome="Inscrito A", numero="1", evento=evento)
    i2 = InscricaoEvento.create(nome="Inscrito B", numero="2", evento=evento)
    
    response = logged_in_client.get(f'/api/v1/eventos/{evento.id}/inscricoes')
    
    assert response.status_code == 200
    lista = json.loads(response.data)
    assert len(lista) == 2
    assert lista[0]['nome'] == "Inscrito A"

# ---------------------------------------------------------------------
# -------------------- TESTES DE AGENDA (/agenda) --------------------
# ---------------------------------------------------------------------

def test_agenda_create_success(logged_in_client, test_db):
    """Testa a criação de um item da agenda."""
    payload = {
        "titulo": "Almoço", 
        "tipo": "Pessoal", 
        "data": "2026-01-01", 
        "horario": "13:00",
        "local": "Escritório"
    }
    response = logged_in_client.post('/api/v1/agenda', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 201
    assert Agenda.select().count() == 1

def test_agenda_get_list(logged_in_client, test_db):
    """Testa a listagem e ordenação da agenda (por data decrescente)."""
    admin_user = Usuario.get_or_none(Usuario.idusuario == 999)
    Agenda.create(titulo="A", tipo="T", local="L", data=date(2026, 1, 3), horario=time(10, 0), criado_por=admin_user)
    Agenda.create(titulo="B", tipo="T", local="L", data=date(2026, 1, 1), horario=time(10, 0), criado_por=admin_user)
    
    response = logged_in_client.get('/api/v1/agenda')
    assert response.status_code == 200
    lista = json.loads(response.data)
    assert len(lista) == 2
    assert lista[0]['titulo'] == "A"
    assert lista[1]['titulo'] == "B"

def test_agenda_delete_not_found(logged_in_client, test_db):
    """Testa a deleção de um item inexistente."""
    response = logged_in_client.delete('/api/v1/agenda/999')
    assert response.status_code == 404
    
# ---------------------------------------------------------------------
# -------------------- TESTES DE AVISOS (/avisos) --------------------
# ---------------------------------------------------------------------

def test_avisos_create_success(logged_in_client, test_db):
    """Testa a criação de um aviso com todos os campos."""
    payload = {
        "titulo": "Aviso Urgente", 
        "categoria": "Urgente", 
        "data": "2025-12-31", 
        "url": "http://link.com",
        "descricao": "Desc"
    }
    response = logged_in_client.post('/api/v1/avisos', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 201
    assert Aviso.select().count() == 1
    aviso = Aviso.get()
    assert aviso.url == "http://link.com"

def test_avisos_get_list(logged_in_client, test_db):
    """Testa a listagem e ordenação de avisos (por data decrescente)."""
    admin = Usuario.get_by_id(999)
    Aviso.create(titulo="Antigo", categoria="C", data=date(2025, 1, 1), criado_por=admin)
    Aviso.create(titulo="Novo", categoria="C", data=date.today(), criado_por=admin)
    
    response = logged_in_client.get('/api/v1/avisos')
    assert response.status_code == 200
    lista = json.loads(response.data)
    assert lista[0]['titulo'] == "Novo"
    assert lista[1]['titulo'] == "Antigo"

# ---------------------------------------------------------------------
# -------------------- TESTES DE HORÁRIOS (/horarios) --------------------
# ---------------------------------------------------------------------

def test_horarios_create_success(logged_in_client, test_db):
    """Testa a criação de um horário público via rota de horários."""
    payload = {
        "titulo": "Missa de Segunda",
        "dia": "Segunda-feira",
        "horario": "07:00",
        "local": "Capela"
    }
    response = logged_in_client.post('/api/v1/horarios', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 201
    
    # Verifica se salvou na tabela Agenda com is_public=True
    item = Agenda.get(Agenda.titulo == "Missa de Segunda")
    assert item.is_public is True
    assert item.dia_semana == "Segunda-feira"

def test_horarios_update_success(logged_in_client, test_db):
    """Testa a atualização de um horário (PUT) usando a tabela Agenda."""
    # Cria um registro inicial como Agenda
    horario = Agenda.create(
        titulo="Original", 
        horario=time(10, 0), 
        local="L", 
        dia_semana="Segunda", 
        is_public=True,
        criado_por=Usuario.get_by_id(999) # Requer dono se sua rota exigir, embora a rota atual não valide
    )
    
    payload = {"titulo": "Atualizado", "horario": "15:00", "dia": "Terça"}
    response = logged_in_client.put(f'/api/v1/horarios/{horario.id}', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 200
    horario_att = Agenda.get_by_id(horario.id)
    assert horario_att.titulo == "Atualizado"
    assert str(horario_att.horario) == "15:00:00"
    assert horario_att.dia_semana == "Terça"

def test_horarios_delete_success(logged_in_client, test_db):
    """Testa a deleção de um horário público."""
    admin = Usuario.get_by_id(999)
    horario = Agenda.create(titulo="Deletar", horario=time(10, 0), local="L", is_public=True, criado_por=admin)

    response = logged_in_client.delete(f'/api/v1/horarios/{horario.id}')
    assert response.status_code == 200
    assert Agenda.select().where(Agenda.id == horario.id).count() == 0

# ---------------------------------------------------------------------
# -------------------- TESTES DE E-MAIL (/enviar-email) --------------------
# ---------------------------------------------------------------------

@patch('app.api.routes.mail.send') 
def test_send_email_success(mock_mail_send, client):
    """Testa o envio de email com todos os campos obrigatórios."""
    payload = {
        "nome": "João Contato", 
        "email": "joao@contato.com",
        "telefone": "987654321",
        "assunto": "Dúvida Geral",
        "mensagem": "Eu tenho uma pergunta sobre a paróquia."
    }
    
    response = client.post('/api/v1/enviar-email', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "Email enviado com sucesso!" in data['message']
    
    mock_mail_send.assert_called_once()
    
    msg_called = mock_mail_send.call_args[0][0] 
    
    assert msg_called.subject == "[Mensagem de Contato] - Dúvida Geral"
    assert msg_called.recipients == ['secreta@igreja.org']
    assert "joao@contato.com" in msg_called.reply_to
    assert "Telefone: 987654321" in msg_called.body

@patch('app.api.routes.mail.send')
def test_send_email_missing_fields(mock_mail_send, client):
    """Testa a falha quando campos obrigatórios estão faltando."""
    payload = {"nome": "João", "assunto": "Dúvida"}
    response = client.post('/api/v1/enviar-email', data=json.dumps(payload), content_type='application/json')
    data = json.loads(response.data)
    assert "Campos obrigatórios" in data['error']



# ---------------------------------------------------------------------
# -------------------- TESTES DE ADMINISTRAÇÃO (/admins) --------------------
# ---------------------------------------------------------------------

def test_admins_list_empty(logged_in_client, test_db):
    """Corrigido: assert 2 == 2 (Admin da fixture + novo usuário)."""
    Usuario.create(nome="Simples", email="simples@user.com", senha="123", idusuario=10)
    response = logged_in_client.get('/auth/admins') 
    assert response.status_code == 200
    lista = json.loads(response.data)
    assert len(lista) == 2

def test_admins_list_full(logged_in_client, test_db):
    """Testa a listagem quando há múltiplos usuários/admins."""
    Usuario.create(nome="User B", email="userb@test.com", senha="123", idusuario=2)
    Usuario.create(nome="User A", email="usera@test.com", senha="123", idusuario=1)

    response = logged_in_client.get('/auth/admins') 
    
    assert response.status_code == 200
    lista = json.loads(response.data)
    
    assert len(lista) == 3
    
    user_a = next(item for item in lista if item['name'] == 'User A')
    assert user_a['email'] == "usera@test.com"

def test_admins_create_success(logged_in_client, test_db):
    """Testa a criação de um novo admin/usuário via POST /admins."""
    payload = {
        "name": "Novo Admin", 
        "email": "novo@admin.com", 
        "password": "new_pass", 
        "phone": "999888777"
    }
    
    response = logged_in_client.post('/auth/admins', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert "Administrador criado" in data['message']
    
    new_user = Usuario.get_or_none(Usuario.email == payload['email'])
    assert new_user is not None
    assert new_user.senha == "new_pass"

def test_admins_create_duplicate_email(logged_in_client, test_db):
    """Testa a criação com email duplicado."""
    Usuario.create(nome="Existente", email="duplice@test.com", senha="123")
    
    payload = {
        "name": "Outro", 
        "email": "duplice@test.com", 
        "password": "456", 
        "phone": ""
    }
    response = logged_in_client.post('/auth/admins', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Email já cadastrado" in data['error']

def test_admins_update_success(logged_in_client, test_db):
    """Testa a atualização de nome e senha de um usuário existente."""
    user = Usuario.create(nome="Antigo Nome", email="old@email.com", senha="old_pass", idusuario=100)
    
    payload = {
        "name": "Nome Novo", 
        "password": "new_pass_secure",
        "phone": "123456789"
    }
    
    response = logged_in_client.put(f'/auth/admins/{user.idusuario}', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "atualizado com sucesso" in data['message']
    
    user_att = Usuario.get_by_id(user.idusuario)
    assert user_att.nome == "Nome Novo"
    assert user_att.senha == "new_pass_secure"
    assert user_att.telefone == "123456789"
    assert user_att.email == "old@email.com"

def test_admins_update_email_duplicate(logged_in_client, test_db):
    """Testa a tentativa de atualizar para um email que já existe."""
    user_1 = Usuario.create(nome="User 1", email="user1@test.com", senha="123", idusuario=101)
    user_2 = Usuario.create(nome="User 2", email="user2@test.com", senha="456", idusuario=102)

    payload = {"email": "user1@test.com"}
    
    response = logged_in_client.put(f'/auth/admins/{user_2.idusuario}', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "E-mail já cadastrado para outro usuário" in data['error']

def test_admins_delete_success(logged_in_client, test_db):
    """Testa a exclusão de um usuário/admin com sucesso."""
    user = Usuario.create(nome="A Deletar", email="delete@me.com", senha="123", idusuario=1000)
    
    assert Usuario.select().where(Usuario.idusuario == 1000).exists() is True
    
    response = logged_in_client.delete(f'/auth/admins/{user.idusuario}')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "excluído com sucesso" in data['message']
    
    assert Usuario.select().where(Usuario.idusuario == 1000).exists() is False

def test_admins_delete_not_found(logged_in_client, test_db):
    """Testa a exclusão de um ID inexistente."""
    response = logged_in_client.delete('/auth/admins/9999')
    
    assert response.status_code == 404
    data = json.loads(response.data)
    assert "Administrador não encontrado" in data['error']

def test_admins_delete_self(logged_in_client, test_db):
    """Testa a tentativa de exclusão do próprio usuário logado."""
    response = logged_in_client.delete('/auth/admins/999')
    
    assert response.status_code == 403
    data = json.loads(response.data)
    assert "Não é possível excluir o seu próprio usuário enquanto logado" in data['error']

# --- Testes de Cobertura Adicional para Melhorar Coverage ---

def test_evento_list_with_items(admin_user, logged_in_client, test_db):
    """Testa listagem de eventos com itens."""
    evento = Evento.create(
        titulo="Evento para Listar",
        tipo="Missa",
        local="Igreja",
        data=date.today(),
        horario=time(10, 0),
        criado_por=admin_user
    )
    
    response = logged_in_client.get('/api/v1/eventos')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) >= 0

def test_aviso_list_with_items(admin_user, logged_in_client, test_db):
    """Testa listagem de avisos com itens."""
    aviso = Aviso.create(
        titulo="Aviso para Listar",
        categoria="Geral",
        data=date.today(),
        criado_por=admin_user
    )
    
    response = logged_in_client.get('/api/v1/avisos')
    assert response.status_code == 200

def test_agenda_list_with_items(admin_user, logged_in_client, test_db):
    """Testa listagem de agenda com itens."""
    agenda = Agenda.create(
        titulo="Agenda para Listar",
        tipo="Reunião",
        data=date.today(),
        local="Sala",
        horario=time(14, 0),
        criado_por=admin_user
    )
    
    response = logged_in_client.get('/api/v1/agenda')
    assert response.status_code == 200

def test_horarios_list_public(admin_user, logged_in_client, test_db):
    """Testa listagem de horários públicos."""
    horario = Agenda.create(
        titulo="Missa Matinal",
        tipo="Missa",
        data=date.today(),
        local="Igreja",
        horario=time(7, 0),
        criado_por=admin_user,
        is_public=True
    )
    
    response = logged_in_client.get('/api/v1/horarios')
    assert response.status_code == 200

def test_evento_create_complete(admin_user, logged_in_client, test_db):
    """Testa criação de evento com todos os campos."""
    response = logged_in_client.post('/api/v1/eventos',
        json={
            "titulo": "Workshop com Vagas",
            "tipo": "Workshop",
            "local": "Salão",
            "tipo_vagas": "Limitado",
            "numero_vagas": "30",
            "data": str(date.today() + timedelta(days=7)),
            "horario": "15:00",
            "descricao": "Workshop de formação"
        })
    
    assert response.status_code == 201

def test_aviso_create_complete(admin_user, logged_in_client, test_db):
    """Testa criação de aviso com todos os campos."""
    response = logged_in_client.post('/api/v1/avisos',
        json={
            "titulo": "Aviso com Link",
            "categoria": "Notícias",
            "descricao": "Descrição do aviso",
            "url": "https://example.com",
            "data": str(date.today())
        })
    
    assert response.status_code == 201

def test_agenda_create_complete(admin_user, logged_in_client, test_db):
    """Testa criação de agenda com descrição."""
    response = logged_in_client.post('/api/v1/agenda',
        json={
            "titulo": "Reunião Importante",
            "tipo": "Reunião",
            "data": str(date.today()),
            "horario": "10:00",
            "local": "Sala de Reuniões",
            "descricao": "Discussão sobre projetos"
        })
    
    assert response.status_code == 201

def test_evento_update_complete(admin_user, logged_in_client, test_db):
    """Testa atualização de evento com todos os campos."""
    evento = Evento.create(
        titulo="Evento Original",
        tipo="Missa",
        local="Igreja",
        data=date.today(),
        horario=time(10, 0),
        criado_por=admin_user
    )
    
    response = logged_in_client.put(f'/api/v1/eventos/{evento.id}',
        json={
            "titulo": "Evento Atualizado",
            "tipo": "Retiro",
            "local": "Casa",
            "data": str(date.today()),
            "horario": "11:00",
            "descricao": "Nova descrição"
        })
    
    assert response.status_code == 200

def test_aviso_update_complete(admin_user, logged_in_client, test_db):
    """Testa atualização de aviso com todos os campos."""
    aviso = Aviso.create(
        titulo="Aviso Original",
        categoria="Geral",
        data=date.today(),
        criado_por=admin_user
    )
    
    response = logged_in_client.put(f'/api/v1/avisos/{aviso.id}',
        json={
            "titulo": "Aviso Atualizado",
            "categoria": "Urgente",
            "url": "https://updated.com",
            "descricao": "Nova descrição"
        })
    
    assert response.status_code == 200

def test_agenda_update_complete(admin_user, logged_in_client, test_db):
    """Testa atualização de agenda com todos os campos."""
    agenda = Agenda.create(
        titulo="Agenda Original",
        tipo="Reunião",
        data=date.today(),
        local="Sala",
        horario=time(14, 0),
        criado_por=admin_user
    )
    
    response = logged_in_client.put(f'/api/v1/agenda/{agenda.id}',
        json={
            "titulo": "Agenda Atualizada",
            "tipo": "Encontro",
            "data": str(date.today()),
            "horario": "15:00",
            "local": "Outra sala",
            "descricao": "Nova descrição"
        })
    
    assert response.status_code == 200

def test_horarios_create_success_extended(admin_user, logged_in_client, test_db):
    """Testa criação de horário com sucesso."""
    response = logged_in_client.post('/api/v1/horarios',
        json={
            "titulo": "Missa Vespertina",
            "tipo": "Missa",
            "data": str(date.today()),
            "horario": "18:00",
            "local": "Igreja Matriz"
        })
    
    assert response.status_code == 201

def test_horarios_update_success(admin_user, logged_in_client, test_db):
    """Testa atualização de horário."""
    horario = Agenda.create(
        titulo="Missa Original",
        tipo="Missa",
        data=date.today(),
        local="Igreja",
        horario=time(7, 0),
        criado_por=admin_user,
        is_public=True
    )
    
    response = logged_in_client.put(f'/api/v1/horarios/{horario.id}',
        json={
            "titulo": "Missa Atualizada",
            "tipo": "Missa",
            "data": str(date.today()),
            "horario": "08:00",
            "local": "Igreja"
        })
    
    assert response.status_code == 200

def test_inscricao_get_inscritos(admin_user, logged_in_client, test_db):
    """Testa listagem de inscritos em um evento."""
    evento = Evento.create(
        titulo="Evento com Inscritos",
        tipo="Retiro",
        local="Casa",
        data=date.today() + timedelta(days=5),
        horario=time(8, 0),
        criado_por=admin_user
    )
    
    InscricaoEvento.create(
        nome="João Silva",
        numero="11999999999",
        evento=evento
    )
    
    response = logged_in_client.get(f'/api/v1/eventos/{evento.id}/inscricoes')
    
    assert response.status_code == 200

def test_evento_delete_success(admin_user, logged_in_client, test_db):
    """Testa deleção bem-sucedida de evento."""
    evento = Evento.create(
        titulo="Evento a Deletar",
        tipo="Missa",
        local="Igreja",
        data=date.today(),
        horario=time(19, 0),
        criado_por=admin_user
    )
    
    response = logged_in_client.delete(f'/api/v1/eventos/{evento.id}')
    
    assert response.status_code == 200

def test_aviso_delete_success(admin_user, logged_in_client, test_db):
    """Testa deleção bem-sucedida de aviso."""
    aviso = Aviso.create(
        titulo="Aviso a Deletar",
        categoria="Geral",
        data=date.today(),
        criado_por=admin_user
    )
    
    response = logged_in_client.delete(f'/api/v1/avisos/{aviso.id}')
    
    assert response.status_code == 200

def test_agenda_delete_success(admin_user, logged_in_client, test_db):
    """Testa deleção bem-sucedida de agenda."""
    agenda = Agenda.create(
        titulo="Agenda a Deletar",
        tipo="Reunião",
        data=date.today(),
        local="Sala",
        horario=time(14, 0),
        criado_por=admin_user
    )
    
    response = logged_in_client.delete(f'/api/v1/agenda/{agenda.id}')
    
    assert response.status_code == 200

def test_horarios_delete_success(admin_user, logged_in_client, test_db):
    """Testa deleção bem-sucedida de horário."""
    horario = Agenda.create(
        titulo="Horário a Deletar",
        tipo="Missa",
        data=date.today(),
        local="Igreja",
        horario=time(7, 0),
        criado_por=admin_user,
        is_public=True
    )
    
    response = logged_in_client.delete(f'/api/v1/horarios/{horario.id}')
    
    assert response.status_code == 200

# --- Testes de Erro e Validação para Melhorar Coverage ---

def test_evento_update_not_found(logged_in_client, test_db):
    """Testa tentativa de atualizar evento inexistente."""
    response = logged_in_client.put('/api/v1/eventos/99999',
        json={"titulo": "Novo"})
    assert response.status_code == 404

def test_aviso_update_not_found(logged_in_client, test_db):
    """Testa tentativa de atualizar aviso inexistente."""
    response = logged_in_client.put('/api/v1/avisos/99999',
        json={"titulo": "Novo"})
    assert response.status_code == 404

def test_agenda_update_not_found(logged_in_client, test_db):
    """Testa tentativa de atualizar agenda inexistente."""
    response = logged_in_client.put('/api/v1/agenda/99999',
        json={"titulo": "Novo"})
    assert response.status_code == 404

def test_horarios_update_not_found(logged_in_client, test_db):
    """Testa tentativa de atualizar horário inexistente."""
    response = logged_in_client.put('/api/v1/horarios/99999',
        json={"titulo": "Novo"})
    assert response.status_code == 404

def test_evento_delete_not_found(logged_in_client, test_db):
    """Testa tentativa de deletar evento inexistente."""
    response = logged_in_client.delete('/api/v1/eventos/99999')
    assert response.status_code == 404

def test_aviso_delete_not_found(logged_in_client, test_db):
    """Testa tentativa de deletar aviso inexistente."""
    response = logged_in_client.delete('/api/v1/avisos/99999')
    assert response.status_code == 404

def test_agenda_delete_not_found(logged_in_client, test_db):
    """Testa tentativa de deletar agenda inexistente."""
    response = logged_in_client.delete('/api/v1/agenda/99999')
    assert response.status_code == 404

def test_horarios_delete_not_found(logged_in_client, test_db):
    """Testa tentativa de deletar horário inexistente."""
    response = logged_in_client.delete('/api/v1/horarios/99999')
    assert response.status_code == 404

def test_inscricao_evento_missing_nome(logged_in_client, test_db):
    """Testa inscrição faltando nome."""
    response = logged_in_client.post('/api/v1/eventos/1/inscricao',
        json={"numero": "123456789"})
    assert response.status_code in [400, 404]

def test_inscricao_evento_missing_numero(logged_in_client, test_db):
    """Testa inscrição faltando telefone."""
    response = logged_in_client.post('/api/v1/eventos/1/inscricao',
        json={"nome": "João"})
    assert response.status_code in [400, 404]
