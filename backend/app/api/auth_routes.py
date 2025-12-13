from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from playhouse.shortcuts import model_to_dict
from functools import wraps 

from ..models.usuario import Usuario

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')
    nome = data.get('nome')
    telefone = data.get('telefone')

    if not all([email, senha, nome]):
        return jsonify({"error": "Nome, email e senha são obrigatórios"}), 400

    if Usuario.get_or_none(Usuario.email == email):
        return jsonify({"error": "Email já cadastrado"}), 400

    try:
        novo_usuario = Usuario.create(
            nome=nome,
            email=email,
            senha=senha,
            telefone=telefone
        )

        return jsonify({
            "message": "Usuário registrado com sucesso!",
            "id": novo_usuario.idusuario
        }), 201

    except Exception as e:
        return jsonify({"error": f"Erro ao registrar usuário: {str(e)}"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')

    usuario = Usuario.get_or_none(Usuario.email == email)

    if not usuario or usuario.senha != senha: 
        return jsonify({"error": "Credenciais inválidas"}), 401

    login_user(usuario)

    return jsonify({
        "message": "Login realizado",
        "user": {
            "id": usuario.idusuario,
            "nome": usuario.nome,
            "email": usuario.email,
        }
    }), 200

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
            }
        })
    else:
        return jsonify({"is_authenticated": False}), 200
    
# --- Administração Routes ---

admin_management_bp = Blueprint('admin_management', __name__)

def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        # Implemente a lógica de verificação de permissão aqui
        return f(*args, **kwargs)
    return decorated_function


@admin_management_bp.route('/admins', methods=['GET'])
def list_admins():
    try:
        admins = Usuario.select() 
        
        admin_list = [
            {
                "id": admin.idusuario, 
                "name": admin.nome,
                "email": admin.email,
                "phone": admin.telefone or "N/A",
                "joined": "N/A", 
                "is_admin": False
            } 
            for admin in admins
        ]
        return jsonify(admin_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_management_bp.route('/admins', methods=['POST'])
def create_admin():
    data = request.json
    nome = data.get('name')
    email = data.get('email')
    senha = data.get('password')
    telefone = data.get('phone')

    if not all([nome, email, senha]):
        return jsonify({"error": "Nome, email e senha são obrigatórios"}), 400

    if Usuario.get_or_none(Usuario.email == email):
        return jsonify({"error": "Email já cadastrado"}), 400
    
    try:
        novo_admin = Usuario.create(
            nome=nome,
            email=email,
            senha=senha, 
            telefone=telefone
        )
        return jsonify({"message": "Administrador criado", "id": novo_admin.idusuario}), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao criar administrador: {str(e)}"}), 500

@admin_management_bp.route('/admins/<int:admin_id>', methods=['DELETE'])
def delete_admin(admin_id):
    try:
        admin_to_delete = Usuario.get_by_id(admin_id)

        if current_user.is_authenticated and current_user.idusuario == admin_id:
            return jsonify({"error": "Não é possível excluir o seu próprio usuário enquanto logado"}), 403

        admin_to_delete.delete_instance()
        return jsonify({"message": f"Administrador {admin_id} excluído com sucesso"}), 200
    except Usuario.DoesNotExist:
        return jsonify({"error": "Administrador não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": f"Erro ao excluir administrador: {str(e)}"}), 500
    
@admin_management_bp.route('/admins/<int:admin_id>', methods=['PUT'])
# @admin_required
def update_admin(admin_id):
    data = request.json
    
    try:
        admin = Usuario.get_by_id(admin_id)
        
        updates = {}
        
        # 1. ATUALIZAÇÃO DE CAMPOS BÁSICOS
        if 'name' in data and data['name']:
            updates[Usuario.nome] = data['name']
        
        if 'email' in data and data['email']:
            if Usuario.select().where(Usuario.email == data['email'], Usuario.idusuario != admin_id).exists():
                return jsonify({"error": "E-mail já cadastrado para outro usuário"}), 400
            updates[Usuario.email] = data['email']
            
        if 'phone' in data:
            updates[Usuario.telefone] = data['phone']
        
        # 2. ATUALIZAÇÃO DE SENHA
        if 'password' in data and data['password']:
            updates[Usuario.senha] = data['password'] 
            
        if not updates:
            return jsonify({"message": "Nenhum dado fornecido para atualização"}), 200

        # 3. Executa a atualização
        query = Usuario.update(updates).where(Usuario.idusuario == admin_id)
        query.execute()

        return jsonify({"message": f"Administrador {admin_id} atualizado com sucesso"}), 200
        
    except Usuario.DoesNotExist:
        return jsonify({"error": "Administrador não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": f"Erro ao atualizar administrador: {str(e)}"}), 500