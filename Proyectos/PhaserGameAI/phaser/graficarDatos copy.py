import matplotlib.pyplot as plt
import numpy as np

def leer_datos(archivo):
    """
    Lee los datos del archivo de texto.
    Cada línea debe contener 8 valores separados por comas.
    """
    with open(archivo, 'r') as file:
        lineas = file.readlines()

    datos = [list(map(float, linea.strip().split(','))) for linea in lineas]
    return datos

def graficar_promedios(datos):
    """
    Calcula y grafica los promedios de las entradas y salidas.
    """
    # Calcular los promedios
    datos_np = np.array(datos)
    promedios_entradas = np.mean(datos_np[:, :5], axis=0)
    promedios_salidas = np.mean(datos_np[:, 5:], axis=0)

    # Crear gráficas
    fig, axs = plt.subplots(2, 1, figsize=(10, 8))

    # Graficar promedios de entradas
    axs[0].bar(range(len(promedios_entradas)), promedios_entradas, color='blue')
    axs[0].set_title('Promedio de Entradas de la Red Neuronal')
    axs[0].set_ylabel('Valor Promedio de Entrada')
    axs[0].set_xticks(range(len(promedios_entradas)))
    axs[0].set_xticklabels([f'Entrada {i+1}' for i in range(len(promedios_entradas))])

    # Graficar promedios de salidas
    axs[1].bar(range(len(promedios_salidas)), promedios_salidas, color='green')
    axs[1].set_title('Promedio de Salidas de la Red Neuronal')
    axs[1].set_ylabel('Valor Promedio de Salida')
    axs[1].set_xticks(range(len(promedios_salidas)))
    axs[1].set_xticklabels([f'Salida {i+1}' for i in range(len(promedios_salidas))])

    plt.tight_layout()
    plt.show()

# Usar el script
archivo = 'C:\\Users\\angel\\Desktop\\AI\\Proyectos\\PhaserGameAI\\phaser\\phaserLogNeuro.txt'  # Reemplaza con el nombre de tu archivo
datos = leer_datos(archivo)
graficar_promedios(datos)
