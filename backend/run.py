from app import create_app

# Cria a aplicação usando a fábrica definida em app/__init__.py
app = create_app()

if __name__ == '__main__':
    # debug=True ajuda a ver erros detalhados no terminal do Python
    app.run(host='0.0.0.0', port=5000, debug=True)