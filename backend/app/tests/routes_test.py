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
from app.models.horario import Horario

# --- Fixtures de Setup ---
@pytest.fixture(scope="session")
def test_db():
    models = [Usuario, Evento, InscricaoEvento, Agenda, Aviso, Horario] 
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
    # Cria e loga um usuário administrador para rotas protegidas
    Usuario.create(
        idusuario=999,
        nome="Admin Teste", 
        email="admin@test.com", 
        senha="admin_pass", 
        is_admin=True
    )
    
    login_payload = {"email": "admin@test.com", "senha": "admin_pass"}
    client.post('/auth/login', data=json.dumps(login_payload), content_type='application/json')
    yield client
    client.post('/auth/logout')
    Usuario.delete().where(Usuario.idusuario == 999).execute()


@pytest.fixture(autouse=True)
def cleanup_data(test_db):
    Evento.delete().execute()
    InscricaoEvento.delete().execute()
    Agenda.delete().execute()
    Aviso.delete().execute()
    Horario.delete().execute()
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

def test_dashboard_data_empty(client, test_db):
    """Testa a rota de dashboard quando o banco está vazio."""
    response = client.get('/api/v1/dashboard')
    assert response.status_code == 200
    data = json.loads(response.data)
    
    assert data['stats']['eventos'] == 0
    assert data['stats']['avisos'] == 0
    assert data['stats']['agenda'] == 0
    assert data['stats']['horarios'] == 0
    assert data['activity'] == []

def test_dashboard_data_full(client, test_db):
    """Testa a rota de dashboard com dados preenchidos e ordenação."""
    for i in range(5):
        Evento.create(titulo=f"E{i}", tipo="T", local="L", data=date.today(), horario=time(10, 0))
        Aviso.create(titulo=f"A{i}", categoria="C", data=date.today())
        Agenda.create(titulo=f"Ag{i}", tipo="T", local="L", data=date.today(), horario=time(10, 0))
        Horario.create(titulo=f"H{i}", horario=time(10, 0), local="L", dia_semana="D")
    
    response = client.get('/api/v1/dashboard')
    assert response.status_code == 200
    data = json.loads(response.data)
    
    assert len(data['activity']) == 5
    
    # O item mais recente deve ser o Evento E4 (o último criado)
    latest_item = data['activity'][0]
    
    assert latest_item['action'] == "Novo Evento Criado"
    assert latest_item['item'] == "E4"

    actions = [item['action'] for item in data['activity']]
    assert "Novo Evento Criado" in actions
    assert "Aviso Publicado" in actions
    assert "Novo Agendamento" in actions

# ---------------------------------------------------------------------
# -------------------- TESTES DE EVENTOS (/eventos) --------------------
# ---------------------------------------------------------------------

def test_eventos_create_success(client, test_db):
    """Testa a criação de um evento com vagas limitadas."""
    payload = {
        "titulo": "Festa Junina",
        "tipo": "Comunidade",
        "local": "Pátio",
        "tipo_vagas": "limitada",
        "numero_vagas": 100,
        "data": "2026-06-20",
        "horario": "18:00",
        "descricao": "Festa para toda a família."
    }
    
    response = client.post('/api/v1/eventos', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 201
    
    evento = Evento.get_or_none(Evento.titulo == "Festa Junina")
    assert evento is not None
    assert evento.numero_vagas == 100
    assert str(evento.data) == "2026-06-20"

def test_eventos_create_no_vagas(client, test_db):
    """Testa a criação de um evento sem especificar vagas."""
    payload = {
        "titulo": "Missa Dominical",
        "tipo": "Religioso",
        "local": "Matriz",
        "data": "2026-06-20",
        "horario": "09:00",
    }
    response = client.post('/api/v1/eventos', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 201
    
    evento = Evento.get_or_none(Evento.titulo == "Missa Dominical")
    assert evento.tipo_vagas is None
    assert evento.numero_vagas is None

def test_eventos_get_list(client, test_db):
    """Testa a listagem de eventos com a contagem de inscritos."""
    e1 = Evento.create(titulo="E1", tipo="T", local="L", data=date.today(), horario=time(10, 0))
    e2 = Evento.create(titulo="E2", tipo="T", local="L", data=date.today(), horario=time(10, 0))
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

def test_eventos_update_success(client, test_db):
    """Testa a atualização de um evento (PUT)."""
    evento = Evento.create(titulo="Original", tipo="T", local="L", data=date.today(), horario=time(10, 0))
    
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
    
    response = client.put(f'/api/v1/eventos/{evento.id}', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 200
    evento_att = Evento.get_by_id(evento.id)
    assert evento_att.titulo == "Atualizado"
    assert evento_att.tipo == "Novo Tipo"

def test_eventos_delete_success(client, test_db):
    """Testa a deleção de um evento (DELETE) e a cascata de inscrições."""
    evento = Evento.create(titulo="A Deletar", tipo="T", local="L", data=date.today(), horario=time(10, 0))
    InscricaoEvento.create(nome="I", numero="1", evento=evento)
    
    assert Evento.select().count() == 1
    assert InscricaoEvento.select().count() == 1
    
    response = client.delete(f'/api/v1/eventos/{evento.id}')
    
    assert response.status_code == 200
    assert Evento.select().count() == 0
    assert InscricaoEvento.select().count() == 0 

# ---------------------------------------------------------------------
# -------------------- TESTES DE INSCRIÇÃO (/inscricao) --------------------
# ---------------------------------------------------------------------

def test_inscricao_create_success(client, test_db):
    """Testa a inscrição em um evento sem limite de vagas."""
    evento = Evento.create(titulo="Livre", tipo="T", local="L", data=date.today(), horario=time(10, 0))
    payload = {"nome": "Novo Inscrito", "telefone": "333"}
    
    response = client.post(f'/api/v1/eventos/{evento.id}/inscricao', data=json.dumps(payload), content_type='application/json')
    
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

def test_inscricao_vagas_esgotadas(client, test_db):
    """Testa a tentativa de inscrição quando as vagas acabaram."""
    evento = Evento.create(
        titulo="Lotado", 
        tipo="T", 
        local="L", 
        data=date.today(), 
        horario=time(10, 0),
        tipo_vagas='limitada',
        numero_vagas=1
    )
    InscricaoEvento.create(nome="Vaga 1", numero="1", evento=evento)
    
    payload = {"nome": "Tentante", "telefone": "2"}
    response = client.post(f'/api/v1/eventos/{evento.id}/inscricao', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 403
    data = json.loads(response.data)
    assert "vagas para este evento já estão esgotadas" in data['error']
    assert InscricaoEvento.select().count() == 1

def test_inscricao_get_list(client, test_db):
    """Testa a listagem de inscritos para um evento específico."""
    evento = Evento.create(titulo="Com Inscritos", tipo="T", local="L", data=date.today(), horario=time(10, 0))
    i1 = InscricaoEvento.create(nome="Inscrito A", numero="1", evento=evento)
    i2 = InscricaoEvento.create(nome="Inscrito B", numero="2", evento=evento)
    
    response = client.get(f'/api/v1/eventos/{evento.id}/inscricoes')
    
    assert response.status_code == 200
    lista = json.loads(response.data)
    assert len(lista) == 2
    assert lista[0]['nome'] == "Inscrito A"

# ---------------------------------------------------------------------
# -------------------- TESTES DE AGENDA (/agenda) --------------------
# ---------------------------------------------------------------------

def test_agenda_create_success(client, test_db):
    """Testa a criação de um item da agenda."""
    payload = {
        "titulo": "Almoço", 
        "tipo": "Pessoal", 
        "data": "2026-01-01", 
        "horario": "13:00",
        "local": "Escritório"
    }
    response = client.post('/api/v1/agenda', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 201
    assert Agenda.select().count() == 1

def test_agenda_get_list(client, test_db):
    """Testa a listagem e ordenação da agenda (por data decrescente)."""
    Agenda.create(titulo="A", tipo="T", local="L", data=date(2026, 1, 3), horario=time(10, 0))
    Agenda.create(titulo="B", tipo="T", local="L", data=date(2026, 1, 1), horario=time(10, 0))
    
    response = client.get('/api/v1/agenda')
    assert response.status_code == 200
    lista = json.loads(response.data)
    assert len(lista) == 2
    assert lista[0]['titulo'] == "A"
    assert lista[1]['titulo'] == "B"

def test_agenda_delete_not_found(client, test_db):
    """Testa a deleção de um item inexistente."""
    response = client.delete('/api/v1/agenda/999')
    assert response.status_code == 404
    
# ---------------------------------------------------------------------
# -------------------- TESTES DE AVISOS (/avisos) --------------------
# ---------------------------------------------------------------------

def test_avisos_create_success(client, test_db):
    """Testa a criação de um aviso com todos os campos."""
    payload = {
        "titulo": "Aviso Urgente", 
        "categoria": "Urgente", 
        "data": "2025-12-31", 
        "url": "http://link.com",
        "descricao": "Desc"
    }
    response = client.post('/api/v1/avisos', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 201
    assert Aviso.select().count() == 1
    aviso = Aviso.get()
    assert aviso.url == "http://link.com"

def test_avisos_get_list(client, test_db):
    """Testa a listagem e ordenação de avisos (por data decrescente)."""
    Aviso.create(titulo="Antigo", categoria="C", data=date(2025, 1, 1))
    Aviso.create(titulo="Novo", categoria="C", data=date.today())
    
    response = client.get('/api/v1/avisos')
    assert response.status_code == 200
    lista = json.loads(response.data)
    assert lista[0]['titulo'] == "Novo"
    assert lista[1]['titulo'] == "Antigo"

# ---------------------------------------------------------------------
# -------------------- TESTES DE HORÁRIOS (/horarios) --------------------
# ---------------------------------------------------------------------

def test_horarios_update_success(client, test_db):
    """Testa a atualização de um horário (PUT)."""
    horario = Horario.create(titulo="Original", horario=time(10, 0), local="L", dia_semana="Segunda")
    
    payload = {"titulo": "Atualizado", "horario": "15:00", "dia": "Terça"}
    response = client.put(f'/api/v1/horarios/{horario.id}', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 200
    horario_att = Horario.get_by_id(horario.id)
    assert horario_att.titulo == "Atualizado"
    assert str(horario_att.horario) == "15:00:00"

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
    payload = {
        "nome": "João Contato", 
        "assunto": "Dúvida Geral",
        "mensagem": "Eu tenho uma pergunta sobre a paróquia."
    }
    
    response = client.post('/api/v1/enviar-email', data=json.dumps(payload), content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Campos obrigatórios faltando" in data['error']
    mock_mail_send.assert_not_called()


# ---------------------------------------------------------------------
# -------------------- TESTES DE ADMINISTRAÇÃO (/admins) --------------------
# ---------------------------------------------------------------------

def test_admins_list_empty(client, test_db):
    """Testa a listagem de usuários/admins quando o DB está quase vazio."""
    Usuario.create(nome="Simples", email="simples@user.com", senha="123", idusuario=10)

    response = client.get('/auth/admins') 
    
    assert response.status_code == 200
    lista = json.loads(response.data)
    
    assert len(lista) == 1 
    assert lista[0]['name'] == "Simples"
    assert lista[0]['is_admin'] is False

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