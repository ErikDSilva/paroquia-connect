import smtplib
import random
from email.mime.text import MIMEText
from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from ..models.usuario import Usuario

auth_bp = Blueprint('auth', __name__)

# --- CONFIGURAÇÃO DO GMAIL ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_SENDER = "paroquia.connect@gmail.com" 
EMAIL_PASSWORD = "senha_app"

def enviar_email_codigo(destinatario, codigo):
    try:
        msg = MIMEText(f"Olá! Seu código de verificação para a Paróquia Connect é: {codigo}")
        msg['Subject'] = "Código de Verificação - Paróquia Connect"
        msg['From'] = EMAIL_SENDER
        msg['To'] = destinatario

        # Conecta ao servidor do Gmail
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls() # Criptografia
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_SENDER, destinatario, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        return False

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')
    nome = data.get('nome')

    if Usuario.get_or_none(Usuario.email == email):
        return jsonify({"error": "Email já cadastrado"}), 400

    # Gera código de 6 dígitos
    codigo = str(random.randint(100000, 999999))
    
    senha_hash = generate_password_hash(senha, method='pbkdf2:sha256')

    try:
        # Cria usuário (ainda não verificado)
        novo_usuario = Usuario.create(
            nome=nome,
            email=email,
            senha=senha_hash,
            telefone=data.get('telefone'),
            is_admin=False,
            codigo_verificacao=codigo, # Salva o código
            email_verificado=False
        )

        # Envia o e-mail
        enviou = enviar_email_codigo(email, codigo)
        
        if enviou:
            return jsonify({"message": "Código enviado para o e-mail!", "require_verification": True, "email": email}), 201
        else:
            return jsonify({"error": "Erro ao enviar e-mail. Verifique o endereço."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/verify', methods=['POST'])
def verify_code():
    data = request.json
    email = data.get('email')
    codigo_digitado = data.get('codigo')

    usuario = Usuario.get_or_none(Usuario.email == email)

    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if usuario.codigo_verificacao == codigo_digitado:
        usuario.email_verificado = True
        usuario.codigo_verificacao = None # Limpa o código por segurança
        usuario.save()
        return jsonify({"message": "Email verificado com sucesso! Faça login."}), 200
    else:
        return jsonify({"error": "Código inválido"}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')

    usuario = Usuario.get_or_none(Usuario.email == email)

    if not usuario or not check_password_hash(usuario.senha, senha):
        return jsonify({"error": "Credenciais inválidas"}), 401

    # VERIFICA SE O EMAIL FOI VALIDADO
    if not usuario.email_verificado:
        return jsonify({"error": "Email não verificado. Verifique sua caixa de entrada."}), 403

    login_user(usuario)

    return jsonify({
        "message": "Login realizado",
        "user": {
            "id": usuario.idusuario,
            "nome": usuario.nome,
            "email": usuario.email,
            "is_admin": bool(usuario.is_admin)
        }
    }), 200

# ... (mantenha as rotas de logout e me iguais) ...
@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout realizado"}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            "is_authenticated": True,
            "user": {
                "id": current_user.idusuario,
                "nome": current_user.nome,
                "email": current_user.email,
                "is_admin": current_user.is_admin
            }
        })
    else:
        return jsonify({"is_authenticated": False}), 200