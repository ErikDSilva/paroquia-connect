import pytest
from datetime import date, time, timedelta
from peewee import SqliteDatabase, IntegrityError

from app.models.usuario import Usuario
from app.models.avisos import Aviso
from app.models.eventos import Evento
from app.models.agenda import Agenda
from app.models.inscricao_evento import InscricaoEvento


@pytest.fixture(scope="module")
def test_db():
    """Provide an in-memory SQLite DB and create tables for models."""
    db = SqliteDatabase(":memory:")
    models = [Usuario, Aviso, Evento, Agenda, InscricaoEvento]
    # Bind the models to the in-memory database for testing
    db.bind(models, bind_refs=False, bind_backrefs=False)
    db.connect()
    # Habilita foreign keys no SQLite
    db.execute_sql('PRAGMA foreign_keys = ON;')
    db.create_tables(models)
    yield db
    db.drop_tables(models)
    db.close()


@pytest.fixture(scope="module")
def admin_user(test_db):
    u = Usuario.create(nome="Admin Test", email="admin@test.com", senha="123", tipo="admin")
    yield u
    Usuario.delete().where(Usuario.idusuario == u.idusuario).execute()


@pytest.fixture(autouse=True)
def cleanup_tests(test_db):
    """Limpa os dados entre testes."""
    yield
    # Cleanup após cada teste
    InscricaoEvento.delete().execute()
    Evento.delete().execute()
    Aviso.delete().execute()
    Agenda.delete().execute()
    Usuario.delete().where(Usuario.email != "admin@test.com").execute()


def test_usuario_fields_and_get_id(test_db):
    u = Usuario.create(nome="João", email="joao@example.com", senha="segredo")
    assert u.idusuario is not None
    assert u.get_id() == str(u.idusuario)


# --- Testes Adicionais para Usuario ---

def test_usuario_unique_email(test_db):
    """Verifica a unicidade do campo 'email'."""
    Usuario.create(nome="Admin", email="admin@igreja.org", senha="123")
    # Tentar criar outro usuário com o mesmo email deve levantar IntegrityError
    with pytest.raises(IntegrityError):
        Usuario.create(nome="Outro", email="admin@igreja.org", senha="456")


def test_usuario_optional_fields(test_db):
    """Verifica que 'telefone' é opcional (null=True)."""
    u = Usuario.create(nome="Sem Tel", email="semtel@example.com", senha="pass")
    assert u.telefone is None


def test_usuario_admin_field(test_db):
    """Verifica a definição do campo 'tipo' para administradores."""
    u = Usuario.create(nome="Admin User", email="admin2@example.com", senha="pass", tipo="admin")
    assert u.tipo == "admin"


# --- Testes Adicionais para Aviso ---

def test_aviso_fields(test_db, admin_user):
    a = Aviso.create(titulo="Aviso 1", categoria="Geral", data=date.today(), criado_por=admin_user)
    assert a.titulo == "Aviso 1"
    assert a.categoria == "Geral"
    assert a.descricao is None


def test_aviso_optional_fields(test_db, admin_user):
    """Verifica que 'url' e 'descricao' são opcionais (null=True)."""
    a = Aviso.create(titulo="Aviso Curto", categoria="Emergência", data=date.today(), criado_por=admin_user)
    assert a.url is None
    assert a.descricao is None


def test_aviso_with_all_fields(test_db, admin_user):
    """Verifica a criação de um Aviso com todos os campos preenchidos."""
    hoje = date.today()
    a = Aviso.create(
        titulo="Com Link e Descrição",
        categoria="Notícias",
        url="http://link.com/aviso",
        descricao="Descrição detalhada do aviso.",
        data=hoje,
        criado_por=admin_user
    )
    assert a.url == "http://link.com/aviso"
    assert a.descricao == "Descrição detalhada do aviso."
    assert a.data == hoje


# --- Testes Adicionais para Evento ---

def test_evento_optional_fields(test_db, admin_user):
    """Verifica que 'tipo_vagas' e 'numero_vagas' são opcionais (null=True)."""
    e = Evento.create(
        titulo="Missa Normal",
        tipo="Religioso",
        local="Matriz",
        data=date.today(),
        horario=time(hour=19, minute=0),
        criado_por=admin_user
    )
    assert e.tipo_vagas is None
    assert e.numero_vagas is None
    assert e.descricao is None


def test_evento_with_vagas(test_db, admin_user):
    """Verifica a criação de um Evento com gerenciamento de vagas."""
    e = Evento.create(
        titulo="Retiro Espiritual",
        tipo="Retiro",
        local="Casa de Retiro",
        tipo_vagas="Limitado",
        numero_vagas=50,
        data=date.today() + timedelta(days=10),
        horario=time(hour=8, minute=0),
        descricao="Retiro de 3 dias.",
        criado_por=admin_user
    )
    assert e.tipo_vagas == "Limitado"
    assert e.numero_vagas == 50
    assert e.descricao == "Retiro de 3 dias."


# --- Testes Adicionais para Agenda ---

def test_agenda_only(test_db, admin_user):
    ag = Agenda.create(
        titulo="Reunião Pastoral",
        tipo="Reunião",
        data=date.today(),
        local="Sala Paroquial",
        horario=time(hour=14, minute=0),
        criado_por=admin_user
    )
    assert ag.titulo == "Reunião Pastoral"


def test_agenda_optional_field(test_db, admin_user):
    """Verifica que 'descricao' é opcional (null=True)."""
    ag = Agenda.create(
        titulo="Compromisso Sem Desc",
        tipo="Pessoa",
        data=date.today(),
        local="Online",
        horario=time(hour=10, minute=0),
        criado_por=admin_user
    )
    assert ag.descricao is None


# Horario model removed; related tests eliminated

# --- Testes Adicionais para InscricaoEvento ---

def test_evento_and_inscricao_relationship(test_db, admin_user):
    """
    Verifica a relação 1:N entre Evento e InscricaoEvento.
    """
    e = Evento.create(
        titulo="Evento Teste",
        tipo="Público",
        local="Igreja",
        data=date.today(),
        horario=time(hour=10, minute=0),
        criado_por=admin_user
    )
    i = InscricaoEvento.create(nome="Maria", numero="5511999999999", evento=e)
    # Deve haver uma inscrição relacionada ao evento
    count = InscricaoEvento.select().where(InscricaoEvento.evento == e).count()
    assert count == 1
    assert i.evento.id == e.id
    assert e.inscricoes.count() == 1


def test_inscricao_multiple_registrations(test_db, admin_user):
    """Verifica se múltiplas inscrições podem ser feitas para o mesmo evento."""
    e = Evento.create(
        titulo="Workshop",
        tipo="Formação",
        local="Salão",
        data=date.today(),
        horario=time(hour=15, minute=0),
        criado_por=admin_user
    )
    InscricaoEvento.create(nome="Pedro", numero="5511888888888", evento=e)
    InscricaoEvento.create(nome="Ana", numero="5511777777777", evento=e)
    assert e.inscricoes.count() == 2


def test_inscricao_on_delete_cascade(test_db, admin_user):
    """
    Verifica se as inscrições são deletadas em cascata
    quando o Evento relacionado é deletado.
    """
    e = Evento.create(
        titulo="A Deletar",
        tipo="Teste",
        local="Virtual",
        data=date.today(),
        horario=time(hour=20, minute=0),
        criado_por=admin_user
    )
    InscricaoEvento.create(nome="Usuário A", numero="123", evento=e)
    InscricaoEvento.create(nome="Usuário B", numero="456", evento=e)

    initial_count = InscricaoEvento.select().count()
    e.delete_instance()  # Deleta o evento

    final_count = InscricaoEvento.select().count()
    assert final_count == initial_count - 2