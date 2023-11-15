import pandas as pd
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Cargar datos desde el archivo, omitiendo las líneas no relevantes y separando por comas
# Saltando las primeras 4 líneas que son texto explicativo
file_path = 'C:/Users/angel/Desktop/AI/Ejercicios en Clase/GraficacionPhaser/datosEntrenamiento.txt'
data = pd.read_csv(file_path, skiprows=4, header=None)
data.columns = ['X', 'Y', 'Z']

# Crear un gráfico 3D
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

# Graficar los puntos
scatter = ax.scatter(data['X'], data['Y'], data['Z'], c=data['Z'], cmap='viridis')

# Agregar etiquetas a los ejes
ax.set_xlabel('Eje X')
ax.set_ylabel('Eje Y')
ax.set_zlabel('Eje Z')

# Mostrar el gráfico
plt.show()
