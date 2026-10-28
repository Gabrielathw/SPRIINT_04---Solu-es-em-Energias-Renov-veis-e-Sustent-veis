def calcular_energia(kwh_desejado, hora_simulada):
    """
    Simula a inteligência do sistema (EMS).
    Decide a origem da energia com base na hora do dia.
    """
    TARIFA_REDE_NORMAL = 0.65
    TARIFA_REDE_PICO = 1.10
    PRECO_VENDA_KWH = 0.90
    
    energia_solar = 0
    energia_bateria = 0
    energia_rede = 0

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

    custo_compra_rede = energia_rede * (TARIFA_REDE_PICO if 18 <= hora_simulada <= 21 else TARIFA_REDE_NORMAL)
    custo_compra_solar_bateria = (energia_solar + energia_bateria) * 0.10 # Custo de manutenção
    custo_total_energia = custo_compra_rede + custo_compra_solar_bateria
    
    receita_cliente = kwh_desejado * PRECO_VENDA_KWH
    margem_lucro = receita_cliente - custo_total_energia

    energia_renovavel = energia_solar + energia_bateria
    porcentagem_renovavel = (energia_renovavel / kwh_desejado) * 100 if kwh_desejado > 0 else 0

    return {
        "kwh_desejado": kwh_desejado,
        "fonte_principal": fonte_principal,
        "porcentagem_renovavel": round(porcentagem_renovavel, 1),
        "custo_cliente": round(receita_cliente, 2),
        "margem_estabelecimento": round(margem_lucro, 2),
        "divisao_goodwe": round(receita_cliente * 0.10, 2), # 10% GoodWe
        "divisao_estabelecimento": round(receita_cliente * 0.90, 2) # 90% Estabelecimento
    }