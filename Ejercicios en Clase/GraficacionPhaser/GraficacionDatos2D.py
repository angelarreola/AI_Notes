import matplotlib.pyplot as plt
import pandas as pd

# Cargar datos desde el archivo, omitiendo las líneas no relevantes y separando por comas
# Saltando las primeras 4 líneas que son texto explicativo
file_path = 'C:/Users/angel/Desktop/AI/Ejercicios en Clase/GraficacionPhaser/datosEntrenamiento.txt' # Cambia la ruta al lugar donde tengas el archivo
data = pd.read_csv(file_path, skiprows=4, header=None)
data.columns = ['X', 'Y', 'Z']

# Crear un gráfico 2D
plt.figure(figsize=(10, 8))

# Graficar los puntos en 2D utilizando los valores X y Y, usando Z para el color
plt.scatter(data['X'], data['Y'], c=data['Z'], cmap='viridis')

# Agregar etiquetas a los ejes
plt.xlabel('Eje X')
plt.ylabel('Eje Y')
plt.title('Visualización 2D de los Datos')

# Mostrar el gráfico
plt.show()
