import sqlite3
import os

# Cria o caminho absoluto para a pasta onde este arquivo (database.py) está
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "chargevolt.db")

def conectar():
    return sqlite3.connect(DB_NAME)

def criar_tabelas():
    with conectar() as conn:
        cursor = conn.cursor()
        # Tabela de Usuários
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                nome TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0
            )
        ''')
        # Tabela de Recargas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS recargas (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                kwh REAL NOT NULL,
                custo REAL NOT NULL,
                status TEXT NOT NULL,
                data_hora TEXT NOT NULL
            )
        ''')
        # Tabela de Agendamentos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agendamentos (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                estacao TEXT NOT NULL,
                data TEXT NOT NULL,
                hora TEXT NOT NULL,
                kwh REAL NOT NULL,
                custo REAL NOT NULL,
                status TEXT NOT NULL
            )
        ''')
        conn.commit()

def cadastrar_usuario(id, username, senha, nome, is_admin=0):
    try:
        with conectar() as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO usuarios (id, username, senha, nome, is_admin) VALUES (?, ?, ?, ?, ?)', (id, username, senha, nome, is_admin))
            conn.commit()
            return True
    except sqlite3.IntegrityError:
        return False

def verificar_login(username, senha):
    with conectar() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM usuarios WHERE username = ? AND senha = ?', (username, senha))
        return cursor.fetchone() is not None

def resetar_senha(username):
    with conectar() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE usuarios SET senha = "123456" WHERE username = ?', (username,))
        conn.commit()
        return cursor.rowcount > 0