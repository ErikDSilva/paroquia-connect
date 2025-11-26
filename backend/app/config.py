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