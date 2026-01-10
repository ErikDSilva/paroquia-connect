import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

class Config:
    """Configurações base da aplicação."""
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Lista de origens permitidas para o CORS
    CORS_ORIGINS = [
        os.environ.get('REACT_APP_URL') or 'http://localhost:5173'
    ]

    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 465))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', 'seu-email@paroquia.com.br')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', 'sua-senha-do-email')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'contato@paroquia.com.br')

    TARGET_EMAIL = os.environ.get('TARGET_EMAIL', 'contato@paroquia.com.br')
