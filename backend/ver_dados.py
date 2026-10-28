import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "chargevolt.db")

def ver_usuarios():
    print("\n--- LENDO O BANCO DE DADOS ---")
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT username, nome, senha FROM usuarios')
        usuarios = cursor.fetchall()
        
        if len(usuarios) == 0:
            print("O banco está VAZIO.")
        else:
            for u in usuarios:
                print(f"Usuário: {u[0]} | Nome: {u[1]} | Senha: {u[2]}")
    print("------------------------------\n")

if __name__ == "__main__":
    ver_usuarios()