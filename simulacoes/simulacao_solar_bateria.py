"""
ChargeVolt - Sprint 4
Simulação de 1 dia inteiro (12 passos de 2h): geração solar + bateria + EMS.

O EMS (Energy Management System) decide, a cada passo, de onde vem a energia
que abastece os carros da estação:
  1. Solar direto (prioridade máxima);
  2. Bateria, somente no horário de pico (18h-22h) e respeitando a reserva mínima;
  3. Rede elétrica, para o que faltar.
A sobra de solar carrega a bateria; o que não couber é registrado como excedente.

IMPORTANTE: todos os números abaixo são PREMISSAS DE SIMULAÇÃO (marcadas com
[SUPOSIÇÃO]) e podem ser trocados no bloco de configuração. Antes de citar no
README, confirmem valores reais (tarifa da distribuidora, fator de emissão da
rede, especificação dos equipamentos GoodWe).
"""
import csv
import math
import os

# ============================================================
# CONFIGURAÇÃO
# ============================================================
PASSO_H = 2                      # duração de cada passo (horas)
N_PASSOS = 24 // PASSO_H         # 12 passos: 00h-02h ... 22h-24h

# Modelo de negócio (já usado no app e no backend da Sprint 3)
PRECO_KWH_USUARIO = 0.90         # R$/kWh cobrado do motorista
GOODWE_SHARE = 0.10
VENUE_SHARE = 0.90

# Geração solar
PV_KWP = 20.0                    # [SUPOSIÇÃO] potência instalada (kWp)
PV_PR = 0.80                     # [SUPOSIÇÃO] performance ratio (perdas do sistema)
# [SUPOSIÇÃO] fator de nebulosidade por passo (1.0 = céu limpo). Tarde parcialmente nublada.
NUVENS = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.75, 0.60, 1.0, 1.0, 1.0]

# Bateria
BAT_CAP_KWH = 30.0               # [SUPOSIÇÃO] capacidade total (kWh)
BAT_RESERVA = 0.20               # [SUPOSIÇÃO] reserva mínima (20% nunca é usada)
BAT_SOC_INICIAL = 0.50           # [SUPOSIÇÃO] começa o dia com 50%
BAT_P_MAX_KW = 10.0              # [SUPOSIÇÃO] potência máxima de carga/descarga (kW)
BAT_EF_CARGA = 0.96              # [SUPOSIÇÃO] eficiência na carga
BAT_EF_DESCARGA = 0.96           # [SUPOSIÇÃO] eficiência na descarga

# Rede elétrica
GRID_LIMITE_KW = 30.0            # [SUPOSIÇÃO] limite de importação da estação (kW)
PICO_INICIO, PICO_FIM = 18, 22   # horário de pico (igual à Sprint 2: 18h-22h)
TARIFA_REDE_NORMAL = 0.65        # [SUPOSIÇÃO] custo da energia da rede fora do pico (R$/kWh)
TARIFA_REDE_PICO = 1.10          # [SUPOSIÇÃO] custo da energia da rede no pico (R$/kWh)
FATOR_CO2_REDE = 0.05            # [A CONFIRMAR] kg CO2/kWh da rede brasileira (usar fonte oficial)

# Demanda da estação: kWh pedidos pelos carros em cada passo de 2h
# [SUPOSIÇÃO] perfil típico: pouco de madrugada, pico no fim da tarde.
#               00-02 02-04 04-06 06-08 08-10 10-12 12-14 14-16 16-18 18-20 20-22 22-24
DEMANDA_KWH = [0.0, 0.0, 2.0, 6.0, 14.0, 24.0, 30.0, 28.0, 32.0, 38.0, 20.0, 6.0]


# ============================================================
# MODELOS
# ============================================================
def rotulo(i):
    ini = i * PASSO_H
    return f"{ini:02d}h-{ini + PASSO_H:02d}h"


def geracao_solar_kwh(i):
    """Energia gerada no passo i. Curva senoidal entre 6h e 18h, média de 8 amostras por passo."""
    ini = i * PASSO_H
    amostras = 8
    soma = 0.0
    for k in range(amostras):
        h = ini + (k + 0.5) * PASSO_H / amostras
        if 6 <= h <= 18:
            soma += math.sin(math.pi * (h - 6) / 12)
    irradiancia_media = soma / amostras
    return PV_KWP * PV_PR * irradiancia_media * PASSO_H * NUVENS[i]


def e_pico(i):
    return PICO_INICIO <= i * PASSO_H < PICO_FIM


# ============================================================
# EMS + SIMULAÇÃO
# ============================================================
def simular():
    soc = BAT_SOC_INICIAL * BAT_CAP_KWH          # energia armazenada (kWh)
    soc_min = BAT_RESERVA * BAT_CAP_KWH
    soc_max = BAT_CAP_KWH
    linhas = []

    for i in range(N_PASSOS):
        pico = e_pico(i)
        solar = geracao_solar_kwh(i)
        demanda = DEMANDA_KWH[i]

        # 1) Solar direto para os carros
        solar_ev = min(demanda, solar)
        falta = demanda - solar_ev
        sobra_solar = solar - solar_ev

        # 2) Sobra de solar carrega a bateria
        cabe = (soc_max - soc) / BAT_EF_CARGA
        limite_pot = BAT_P_MAX_KW * PASSO_H
        carga_bat = max(0.0, min(sobra_solar, cabe, limite_pot))
        soc += carga_bat * BAT_EF_CARGA
        excedente = sobra_solar - carga_bat

        # 3) Bateria descarrega somente no pico, respeitando a reserva
        bateria_ev = 0.0
        if pico and falta > 0:
            disponivel = max(0.0, (soc - soc_min) * BAT_EF_DESCARGA)
            bateria_ev = min(falta, disponivel, BAT_P_MAX_KW * PASSO_H)
            soc -= bateria_ev / BAT_EF_DESCARGA
            falta -= bateria_ev

        # 4) Rede cobre o restante, até o limite de importação
        rede_ev = min(falta, GRID_LIMITE_KW * PASSO_H)
        nao_atendida = falta - rede_ev

        entregue = solar_ev + bateria_ev + rede_ev
        renovavel = solar_ev + bateria_ev
        tarifa_rede = TARIFA_REDE_PICO if pico else TARIFA_REDE_NORMAL

        receita = entregue * PRECO_KWH_USUARIO
        custo_rede = rede_ev * tarifa_rede
        custo_base = entregue * tarifa_rede           # cenário sem solar/bateria
        linhas.append({
            "faixa": rotulo(i),
            "pico": pico,
            "solar_gerado": solar,
            "demanda": demanda,
            "solar_ev": solar_ev,
            "bateria_ev": bateria_ev,
            "rede_ev": rede_ev,
            "carga_bateria": carga_bat,
            "excedente": excedente,
            "nao_atendida": nao_atendida,
            "soc_kwh": soc,
            "soc_pct": soc / BAT_CAP_KWH * 100,
            "renovavel_pct": (renovavel / entregue * 100) if entregue > 0 else 0.0,
            "receita": receita,
            "custo_rede": custo_rede,
            "custo_base": custo_base,
            "co2_rede": rede_ev * FATOR_CO2_REDE,
            "co2_base": entregue * FATOR_CO2_REDE,
        })
    return linhas


# ============================================================
# RELATÓRIO
# ============================================================
def imprimir(linhas):
    print("\n" + "=" * 100)
    print(" CHARGEVOLT - SIMULAÇÃO DE 1 DIA (passos de 2h) | solar + bateria + EMS")
    print("=" * 100)
    print(f" Solar: {PV_KWP:.0f} kWp | Bateria: {BAT_CAP_KWH:.0f} kWh "
          f"(reserva {BAT_RESERVA * 100:.0f}%, início {BAT_SOC_INICIAL * 100:.0f}%) | "
          f"Pico: {PICO_INICIO}h-{PICO_FIM}h")
    print("-" * 100)
    cab = (f"{'Faixa':<10}{'Solar':>7}{'Demanda':>9}{'Solar>EV':>10}{'Bat>EV':>8}"
           f"{'Rede>EV':>9}{'Excedente':>11}{'SOC bat':>9}{'%Renov.':>9}  Obs")
    print(cab)
    print("-" * 100)
    for l in linhas:
        obs = "PICO" if l["pico"] else ""
        if l["nao_atendida"] > 0:
            obs += " (demanda não atendida)"
        print(f"{l['faixa']:<10}{l['solar_gerado']:>7.1f}{l['demanda']:>9.1f}{l['solar_ev']:>10.1f}"
              f"{l['bateria_ev']:>8.1f}{l['rede_ev']:>9.1f}{l['excedente']:>11.1f}"
              f"{l['soc_pct']:>8.0f}%{l['renovavel_pct']:>8.0f}%  {obs}")
    print("-" * 100)

    soma = lambda k: sum(l[k] for l in linhas)
    entregue = soma("solar_ev") + soma("bateria_ev") + soma("rede_ev")
    renovavel = soma("solar_ev") + soma("bateria_ev")
    receita = soma("receita")
    custo_rede = soma("custo_rede")
    custo_base = soma("custo_base")
    goodwe = receita * GOODWE_SHARE
    venue = receita * VENUE_SHARE
    margem_venue = venue - custo_rede
    margem_venue_base = venue - custo_base
    co2_rede = soma("co2_rede")
    co2_base = soma("co2_base")

    print(" RESULTADOS DO DIA (unidades em kWh, R$ e kg de CO2)")
    print(f"  Energia solar gerada ............ {soma('solar_gerado'):8.1f} kWh")
    print(f"  Energia entregue aos carros ..... {entregue:8.1f} kWh")
    print(f"    - via solar direto ............ {soma('solar_ev'):8.1f} kWh")
    print(f"    - via bateria ................. {soma('bateria_ev'):8.1f} kWh")
    print(f"    - via rede .................... {soma('rede_ev'):8.1f} kWh")
    print(f"  Energia renovável na recarga .... {renovavel / entregue * 100:8.1f} %")
    print(f"  Solar excedente (não aproveitado) {soma('excedente'):8.1f} kWh")
    print(f"  Demanda não atendida ............ {soma('nao_atendida'):8.1f} kWh")
    print(f"  Bateria: início {BAT_SOC_INICIAL * 100:.0f}% -> fim {linhas[-1]['soc_pct']:.0f}%")
    print(f"  Receita total ................... R$ {receita:8.2f}")
    print(f"    - GoodWe (10%) ................ R$ {goodwe:8.2f}")
    print(f"    - Estabelecimento (90%) ....... R$ {venue:8.2f}")
    print(f"  Custo de energia da rede ........ R$ {custo_rede:8.2f}  (sem solar/bateria: R$ {custo_base:.2f})")
    print(f"  Economia com solar + bateria .... R$ {custo_base - custo_rede:8.2f}")
    print(f"  Margem do estabelecimento ....... R$ {margem_venue:8.2f}  (sem solar/bateria: R$ {margem_venue_base:.2f})")
    print(f"  CO2 da rede (com EMS) ........... {co2_rede:8.2f} kg  (sem solar/bateria: {co2_base:.2f} kg)")
    print(f"  CO2 evitado pelo EMS ............ {co2_base - co2_rede:8.2f} kg")
    print("=" * 100)
    print(" Premissas marcadas [SUPOSIÇÃO] no código: confirmem valores reais antes de citar no README.\n")


def salvar_csv(linhas, caminho):
    with open(caminho, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(linhas[0].keys()))
        w.writeheader()
        for l in linhas:
            w.writerow({k: (round(v, 3) if isinstance(v, float) else v) for k, v in l.items()})


def salvar_grafico(linhas, caminho):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib não instalado: gráfico não gerado (pip install matplotlib).")
        return
    x = range(len(linhas))
    faixas = [l["faixa"] for l in linhas]
    solar = [l["solar_ev"] for l in linhas]
    bat = [l["bateria_ev"] for l in linhas]
    rede = [l["rede_ev"] for l in linhas]
    base_bat = [s for s in solar]
    base_rede = [s + b for s, b in zip(solar, bat)]

    fig, ax = plt.subplots(figsize=(11, 5.5))
    ax.bar(x, solar, label="Solar direto", color="#F2B134")
    ax.bar(x, bat, bottom=base_bat, label="Bateria", color="#2E86AB")
    ax.bar(x, rede, bottom=base_rede, label="Rede", color="#9AA5B1")
    ax.plot(x, [l["solar_gerado"] for l in linhas], "o--", color="#D97706",
            label="Solar gerado (kWh)")
    ax.set_xticks(list(x))
    ax.set_xticklabels(faixas, rotation=45, ha="right")
    ax.set_ylabel("Energia por passo de 2h (kWh)")
    ax.set_title("ChargeVolt: origem da energia entregue aos carros (simulação de 1 dia)")
    for i, l in enumerate(linhas):
        if l["pico"]:
            ax.axvspan(i - 0.5, i + 0.5, color="#EF4444", alpha=0.08)

    ax2 = ax.twinx()
    ax2.plot(x, [l["soc_pct"] for l in linhas], "s-", color="#10B981", label="Bateria (SOC %)")
    ax2.set_ylabel("Carga da bateria (%)")
    ax2.set_ylim(0, 105)

    h1, l1 = ax.get_legend_handles_labels()
    h2, l2 = ax2.get_legend_handles_labels()
    ax.legend(h1 + h2, l1 + l2, loc="upper left", fontsize=9)
    fig.text(0.01, 0.01, "Faixa vermelha = horário de pico (18h-22h). Premissas de simulação.",
             fontsize=8, color="#6C757D")
    fig.tight_layout()
    fig.savefig(caminho, dpi=150)
    plt.close(fig)


if __name__ == "__main__":
    pasta = os.path.dirname(os.path.abspath(__file__))
    resultado = simular()
    imprimir(resultado)
    salvar_csv(resultado, os.path.join(pasta, "simulacao_dia.csv"))
    salvar_grafico(resultado, os.path.join(pasta, "simulacao_dia.png"))
    print("Arquivos gerados: simulacao_dia.csv e simulacao_dia.png")
