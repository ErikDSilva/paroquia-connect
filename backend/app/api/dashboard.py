from flask import jsonify
from . import api_bp
from ..models.eventos import Evento;
from ..models.agenda import Agenda;
from ..models.avisos import Aviso;
from flask_login import login_required, current_user

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
    
    