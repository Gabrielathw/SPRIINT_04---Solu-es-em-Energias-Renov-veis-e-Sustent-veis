def calcular_energia(kwh_desejado, hora_simulada):
    PRECO_NORMAL = 0.75
    PRECO_PICO = 1.15
    TAXA_FIXA = 0.15
    
    energia_solar = 0
    energia_bateria = 0
    energia_rede = 0

    # Regras de Energia (Solar x Bateria x Rede)
    if 10 <= hora_simulada <= 16:
        energia_solar = kwh_desejado * 0.70
        energia_rede = kwh_desejado * 0.30
        fonte_principal = "Solar"
    elif 18 <= hora_simulada <= 21:
        energia_bateria = kwh_desejado * 0.40
        energia_rede = kwh_desejado * 0.60
        fonte_principal = "Bateria"
    else:
        energia_rede = kwh_desejado
        fonte_principal = "Rede Elétrica"

    # Regra de Preço (Pico: 12h-14h e 18h-22h)
    is_pico = (12 <= hora_simulada < 14) or (18 <= hora_simulada < 22)
    preco_kwh = PRECO_PICO if is_pico else PRECO_NORMAL
    
    # Cálculo do Cliente: (KWh * Preço) + Taxa Fixa
    custo_energia = kwh_desejado * preco_kwh
    custo_cliente = custo_energia + TAXA_FIXA
    
    # Cálculo de Custos Operacionais (Simulação)
    custo_compra_rede = energia_rede * (1.10 if is_pico else 0.65)
    custo_compra_solar_bateria = (energia_solar + energia_bateria) * 0.10
    margem_lucro = custo_cliente - (custo_compra_rede + custo_compra_solar_bateria)

    energia_renovavel = energia_solar + energia_bateria
    porcentagem_renovavel = (energia_renovavel / kwh_desejado) * 100 if kwh_desejado > 0 else 0

    return {
        "kwh_desejado": kwh_desejado,
        "fonte_principal": fonte_principal,
        "porcentagem_renovavel": round(porcentagem_renovavel, 1),
        "custo_cliente": round(custo_cliente, 2),
        "margem_estabelecimento": round(margem_lucro, 2),
        "divisao_goodwe": round(custo_cliente * 0.10, 2), 
        "divisao_estabelecimento": round(custo_cliente * 0.90, 2) 
    }