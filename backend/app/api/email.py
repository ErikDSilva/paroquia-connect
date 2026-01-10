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
    