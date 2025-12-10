# ⛪ Projeto de Gestão Paroquial

## ✨ Visão Geral

Este projeto é um sistema de administração digital desenvolvido para auxiliar na gestão de rotinas de uma paróquia. Ele centraliza informações essenciais como horários de missas, inscrição em eventos, agenda de compromissos internos e dados de contato, otimizando a comunicação e a administração.

**Objetivo:** Simplificar a comunicação e otimizar as tarefas administrativas, tornando a informação acessível e organizada para a secretaria e para os membros da comunidade.

## 🔑 Funcionalidades Chave

O sistema é dividido nos seguintes módulos principais:

* **📅 Horários:**
    * Gestão e visualização de horários fixos (Missas, Adoração, Confissões).
    * Módulo para horários especiais e sazonais (Feriados, Datas Comemorativas).
* **🎉 Eventos:**
    * Cadastro e divulgação de eventos paroquiais (festas, retiros, encontros de formação).
    * Exibição em formato de calendário e lista.
* **🗓️ Agenda Interna:**
    * Calendário exclusivo para a equipe administrativa e pastoral.
    * Gestão de compromissos, reservas de salas e marcações internas.
* **📞 Contato:**
    * Diretório de contatos importantes (Lideranças de Pastorais, Conselhos, Voluntários).
    * Formulário de contato direto para a secretaria da paróquia.
* **📣 Avisos:**
  * Módulo para a equipe administrativa criar, editar e publicar comunicados urgentes ou importantes.
  * Funcionalidade de destaque para avisos prioritários na página inicial ou em um painel dedicado.

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | [React, TypeScript] | Interface de usuário moderna e responsiva. |
| **Backend** | [Flask, Python] | API RESTful para manipulação de dados. |
| **Banco de Dados** | [MySQL] | Armazenamento seguro de dados paroquiais. |
| **Estilização** | [Tailwind CSS / Shadcn-ui / CSS] | Ferramenta de estilos. |

## 🚀 Como Executar o Projeto Localmente

Siga os passos abaixo para configurar e rodar o projeto em sua máquina:

### Pré-requisitos

Você deve ter o seguinte software instalado:

* `Git` Ferramenta de controle de versionamento
* `Node.js` (ou ambiente de execução do Backend)
* `Mysql` (recomendado para banco de dados local)
* `Python`

### 1. Clonagem e Navegação

```bash
git clone [https://github.com/ErikDSilva/paroquia-connect.git]

cd paroquia-connect
```

### 2. Instalação dependencias Frontend

```bash
cd .\frontend\

npm install
```
### Comando para executar o frontend
```bash
npm run dev
```

### 3 Cria o ambiente virtual
#### Abra um novo terminal

```bash
python -m venv venv
```
### **Ativação**
| Sistema Operacional | Comando de Ativação
| :--- | :--- 
| **Linux/macOS** | ```source venv/bin/activate``` |
| **Windows (CMD)** | ```venv\Scripts\activate.bat``` |
| **Windows (PowerShell)** | ```venv\Scripts\Activate.ps1``` |

### 3.1 Criando o banco de dados
#### Antes de criar as tabelas do banco de dados é preciso criar um banco de dados, pelo workbanch do mysql usando esse comando

```bash
CREATE DATABASE  IF NOT EXISTS paroquia;
```

#### Esté comando para criar o banco de dados

```bash
cd .\backend\

python -m app.models.create_tables
```

### Instalação dependencias backend


### 3.2 apos ativar o ambiente virtual, você vai instalar as dependencias
```bash
pip install -r .\requirements.txt
```

### Comando para execular o backend
```bash
flask run
```

### 📂 Estrutura do Projeto

A estrutura principal do repositório é dividida em frontend e backend:

* `paroquia-connect/`
    * `frontend/` (Contém o código React/TypeScript)
        * `src/components/`
        * `src/pages/`
    * `backend/` (Contém o código Flask/Python)
        * `venv/` (Ambiente virtual Python)
        * `app/` (Módulos da aplicação Flask)
            * `models/`
            * `routes/`
        * `requirements.txt`
        * `.env`