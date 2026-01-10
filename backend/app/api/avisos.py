from flask import request, jsonify;
from . import api_bp
from ..models.avisos import Aviso;

from flask_login import login_required, current_user

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
    