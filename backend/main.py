from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ems import calcular_energia
import database as db
import uuid
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ChargeVolt API", description="API do sistema inteligente de eletropostos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"], 
)

@app.on_event("startup")
def startup():
    db.criar_tabelas()

@app.get("/")
def read_root():
    return {"status": "online", "mensagem": "API do ChargeVolt funcionando!"}

class PedidoCotacao(BaseModel):
    kwh_desejado: float
    hora_simulada: int 

@app.post("/cotacao")
def cotacao(pedido: PedidoCotacao):
    return calcular_energia(pedido.kwh_desejado, pedido.hora_simulada)

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
    user_limpo = dados.username.strip()
    senha_limpa = dados.senha.strip()
    nome_limpo = dados.nome.strip()
    
    sucesso = db.cadastrar_usuario(id_usuario, user_limpo, senha_limpa, nome_limpo)
    if sucesso:
        return {"mensagem": "Usuário cadastrado com sucesso!", "id": id_usuario}
    else:
        raise HTTPException(status_code=400, detail="Nome de usuário já existe.")

@app.post("/login")
def login(dados: DadosLogin):
    user_limpo = dados.username.strip()
    senha_limpa = dados.senha.strip()
    
    logado = db.verificar_login(user_limpo, senha_limpa)
    if logado:
        return {"mensagem": "Login realizado com sucesso!", "username": user_limpo}
    else:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")

class DadosRecarga(BaseModel):
    username: str
    kwh_desejado: float
    hora_simulada: int
    usar_pontos: bool = False 

@app.post("/realizar_recarga")
def realizar_recarga(dados: DadosRecarga):
    resultado_ems = calcular_energia(dados.kwh_desejado, dados.hora_simulada)
    recarga_id = str(uuid.uuid4())
    data_atual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    custo_original = resultado_ems["custo_cliente"]
    custo_final = custo_original
    pontos_gastos = 0
    desconto_aplicado = 0.0

    if dados.usar_pontos:
        pontos_atuais = db.obter_pontos(dados.username.strip())
        if pontos_atuais >= 100:
            blocos = int(pontos_atuais / 100)
            desconto_aplicado = blocos * 10.0
            if desconto_aplicado > custo_original:
                desconto_aplicado = custo_original
            custo_final = custo_original - desconto_aplicado
            pontos_gastos = int((desconto_aplicado / 10.0) * 100)
            db.remover_pontos(dados.username.strip(), pontos_gastos)

    pontos_ganhos = int(custo_final / 2.30)
    
    try:
        with db.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM usuarios WHERE username = ?', (dados.username.strip(),))
            usuario = cursor.fetchone()
            if not usuario:
                raise HTTPException(status_code=404, detail="Usuário não encontrado.")
            
            user_id = usuario[0]
            cursor.execute('''
                INSERT INTO recargas (id, user_id, kwh, custo, status, data_hora)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (recarga_id, user_id, dados.kwh_desejado, custo_final, "Concluída", data_atual))
            conn.commit()
            
            db.adicionar_pontos(dados.username.strip(), pontos_ganhos)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco: {str(e)}")
        
    return {
        "mensagem": "Recarga realizada com sucesso!",
        "recarga_id": recarga_id,
        "detalhes": resultado_ems,
        "desconto_aplicado": desconto_aplicado,
        "custo_final": custo_final,
        "pontos_gastos": pontos_gastos,
        "pontos_ganhos": pontos_ganhos,
        "data_hora": data_atual
    }

@app.get("/usuario/{username}")
def get_usuario(username: str):
    with db.conectar() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT username, nome, is_admin, pontos FROM usuarios WHERE username = ?', (username.strip(),))
        user = cursor.fetchone()
        if user:
            return {"username": user[0], "nome": user[1], "is_admin": bool(user[2]), "pontos": user[3]}
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

@app.get("/historico/{username}")
def buscar_historico(username: str):
    try:
        with db.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM usuarios WHERE username = ?', (username.strip(),))
            usuario = cursor.fetchone()
            if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
            
            user_id = usuario[0]
            cursor.execute('SELECT id, kwh, custo, status, data_hora FROM recargas WHERE user_id = ? ORDER BY data_hora DESC', (user_id,))
            recargas = cursor.fetchall()
            
            historico = [{"id": r[0], "kwh": r[1], "custo": r[2], "status": r[3], "data_hora": r[4]} for r in recargas]
            return {"historico": historico}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agendamentos/{username}")
def buscar_agendamentos(username: str):
    try:
        with db.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM usuarios WHERE username = ?', (username.strip(),))
            usuario = cursor.fetchone()
            if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
            user_id = usuario[0]
            cursor.execute('SELECT id, estacao, data, hora, kwh, custo, status FROM agendamentos WHERE user_id = ? ORDER BY data DESC', (user_id,))
            agendamentos = cursor.fetchall()
            lista = [{"id": a[0], "estacao": a[1], "data": a[2], "hora": a[3], "kwh": a[4], "custo": a[5], "status": a[6]} for a in agendamentos]
            return {"agendamentos": lista}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DadosReset(BaseModel):
    username: str

@app.post("/reset_senha")
def resetar_senha_api(dados: DadosReset):
    sucesso = db.resetar_senha(dados.username.strip())
    if sucesso: return {"mensagem": "Senha redefinida para 123456"}
    raise HTTPException(status_code=404, detail="Usuário não encontrado.")

class DadosNovaSenha(BaseModel):
    username: str
    senha_atual: str
    nova_senha: str

@app.post("/mudar_senha")
def mudar_senha(dados: DadosNovaSenha):
    if not db.verificar_login(dados.username.strip(), dados.senha_atual.strip()):
        raise HTTPException(status_code=401, detail="Senha atual incorreta.")
    with db.conectar() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE usuarios SET senha = ? WHERE username = ?', (dados.nova_senha.strip(), dados.username.strip()))
        conn.commit()
    return {"mensagem": "Senha alterada com sucesso!"}

class DadosAgendamento(BaseModel):
    username: str
    estacao: str
    data: str
    hora: str
    kwh: float
    custo: float
    status_pagamento: str

@app.post("/agendar")
def agendar_recarga(dados: DadosAgendamento):
    agendamento_id = str(uuid.uuid4())
    try:
        with db.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM usuarios WHERE username = ?', (dados.username.strip(),))
            user_id = cursor.fetchone()[0]
            status_final = f"Agendado - {dados.status_pagamento}"
            cursor.execute('''
                INSERT INTO agendamentos (id, user_id, estacao, data, hora, kwh, custo, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (agendamento_id, user_id, dados.estacao, dados.data, dados.hora, dados.kwh, dados.custo, status_final))
            conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"mensagem": "Agendamento realizado com sucesso!", "id": agendamento_id}

@app.get("/pontos/{username}")
def get_pontos(username: str):
    pontos = db.obter_pontos(username.strip())
    return {"pontos": pontos}