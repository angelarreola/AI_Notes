import matplotlib.pyplot as plt

def leer_datos(archivo):
    """
    Lee los datos del archivo de texto.
    Cada línea debe contener 8 valores separados por comas.
    """
    with open(archivo, 'r') as file:
        lineas = file.readlines()

    datos = [list(map(float, linea.strip().split(','))) for linea in lineas]
    return datos

def graficar_datos(datos):
    """
    Grafica los datos.
    Asume que los primeros 5 valores son entradas y los últimos 3 son salidas.
    """
    entradas = [d[:5] for d in datos]
    salidas = [d[5:] for d in datos]

    fig, axs = plt.subplots(2, 1, figsize=(10, 8))

    # Graficar entradas
    for i, entrada in enumerate(entradas):
        axs[0].plot(entrada, label=f'Conjunto {i+1}')
    axs[0].set_title('Entradas de la Red Neuronal')
    axs[0].set_ylabel('Valores de Entrada')
    axs[0].legend()

    # Graficar salidas
    for i, salida in enumerate(salidas):
        axs[1].plot(salida, label=f'Conjunto {i+1}')
    axs[1].set_title('Salidas de la Red Neuronal')
    axs[1].set_ylabel('Valores de Salida')
    axs[1].legend()

    plt.tight_layout()
    plt.show()

# Usar el script
archivo = 'C:\\Users\\angel\\Desktop\\AI\\Proyectos\\PhaserGameAI\\phaser\\phaserLogHuman.txt'  # Reemplaza con el nombre de tu archivo
datos = leer_datos(archivo)
graficar_datos(datos)
