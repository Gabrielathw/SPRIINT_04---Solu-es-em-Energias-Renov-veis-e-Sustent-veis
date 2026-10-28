from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ems import calcular_energia
import database as db
import uuid
from fastapi.middleware.cors import CORSMiddleware

# 1. Primeiro criamos o app
app = FastAPI(title="ChargeVolt API", description="API do sistema inteligente de eletropostos")

# 2. Configuramos o CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# 3. Criamos as tabelas ao iniciar
@app.on_event("startup")
def startup():
    db.criar_tabelas()

# 4. Agora sim, as rotas vêm uma depois da outra
@app.get("/")
def read_root():
    return {"status": "online", "mensagem": "API do ChargeVolt funcionando!"}

class PedidoCotacao(BaseModel):
    kwh_desejado: float
    hora_simulada: int 

@app.post("/cotacao")
def cotacao(pedido: PedidoCotacao):
    resultado = calcular_energia(pedido.kwh_desejado, pedido.hora_simulada)
    return resultado

class DadosCadastro(BaseModel):
    username: str
    senha: str
    nome: str

class DadosLogin(BaseModel):
    username: str
    senha: str

@app.post("/cadastro")
def cadastrar(dados: DadosCadastro):
    id_usuario = str(uuid.uuid4())
    sucesso = db.cadastrar_usuario(id_usuario, dados.username, dados.senha, dados.nome)
    if sucesso:
        return {"mensagem": "Usuário cadastrado com sucesso!", "id": id_usuario}
    else:
        raise HTTPException(status_code=400, detail="Nome de usuário já existe.")

@app.post("/login")
def login(dados: DadosLogin):
    logado = db.verificar_login(dados.username, dados.senha)
    if logado:
        return {"mensagem": "Login realizado com sucesso!", "username": dados.username}
    else:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")

class DadosRecarga(BaseModel):
    username: str
    kwh_desejado: float
    hora_simulada: int

@app.post("/realizar_recarga")
def realizar_recarga(dados: DadosRecarga):
    resultado_ems = calcular_energia(dados.kwh_desejado, dados.hora_simulada)
    recarga_id = str(uuid.uuid4())
    data_atual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    try:
        with db.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM usuarios WHERE username = ?', (dados.username,))
            usuario = cursor.fetchone()
            if not usuario:
                raise HTTPException(status_code=404, detail="Usuário não encontrado.")
            
            user_id = usuario[0]
            cursor.execute('''
                INSERT INTO recargas (id, user_id, kwh, custo, status, data_hora)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (recarga_id, user_id, dados.kwh_desejado, resultado_ems["custo_cliente"], "Concluída", data_atual))
            conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco: {str(e)}")
        
    return {
        "mensagem": "Recarga realizada com sucesso!",
        "recarga_id": recarga_id,
        "detalhes": resultado_ems,
        "data_hora": data_atual
    }

@app.get("/historico/{username}")
def buscar_historico(username: str):
    try:
        with db.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM usuarios WHERE username = ?', (username,))
            usuario = cursor.fetchone()
            if not usuario:
                raise HTTPException(status_code=404, detail="Usuário não encontrado.")
            
            user_id = usuario[0]
            cursor.execute('''
                SELECT id, kwh, custo, status, data_hora 
                FROM recargas 
                WHERE user_id = ? 
                ORDER BY data_hora DESC
            ''', (user_id,))
            recargas = cursor.fetchall()
            
            historico = []
            for r in recargas:
                historico.append({
                    "id": r[0], "kwh": r[1], "custo": r[2], "status": r[3], "data_hora": r[4]
                })
            return {"historico": historico}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ROTAS DE CONFIGURAÇÃO ---

class DadosReset(BaseModel):
    username: str

@app.post("/reset_senha")
def resetar_senha_api(dados: DadosReset):
    sucesso = db.resetar_senha(dados.username)
    if sucesso:
        return {"mensagem": "Senha redefinida para 123456"}
    else:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

@app.get("/usuario/{username}")
def get_usuario(username: str):
    with db.conectar() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT username, nome, is_admin FROM usuarios WHERE username = ?', (username,))
        user = cursor.fetchone()
        if user:
            return {"username": user[0], "nome": user[1], "is_admin": bool(user[2])}
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

class DadosNovaSenha(BaseModel):
    username: str
    senha_atual: str
    nova_senha: str

@app.post("/mudar_senha")
def mudar_senha(dados: DadosNovaSenha):
    if not db.verificar_login(dados.username, dados.senha_atual):
        raise HTTPException(status_code=401, detail="Senha atual incorreta.")
    
    with db.conectar() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE usuarios SET senha = ? WHERE username = ?', (dados.nova_senha, dados.username))
        conn.commit()
    return {"mensagem": "Senha alterada com sucesso!"}

# --- ROTAS DE AGENDAMENTO ---

class DadosAgendamento(BaseModel):
    username: str
    estacao: str
    data: str
    hora: str
    kwh: float
    custo: float
    status_pagamento: str # <-- NOVO CAMPO AQUI

@app.post("/agendar")
def agendar_recarga(dados: DadosAgendamento):
    agendamento_id = str(uuid.uuid4())
    try:
        with db.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM usuarios WHERE username = ?', (dados.username,))
            user_id = cursor.fetchone()[0]
            
            # Usamos a string de status que vem do frontend
            cursor.execute('''
                INSERT INTO agendamentos (id, user_id, estacao, data, hora, kwh, custo, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (agendamento_id, user_id, dados.estacao, dados.data, dados.hora, dados.kwh, dados.custo, dados.status_pagamento))
            conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"mensagem": "Agendamento realizado com sucesso!", "id": agendamento_id}