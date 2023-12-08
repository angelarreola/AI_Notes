from tensorflow import keras
import cv2
import numpy as np

def preprocesar(cuadro):
    # Asegurarse de que esté en el formato RGB
    cuadro_rgb = cv2.cvtColor(cuadro, cv2.COLOR_BGR2RGB)
    # Redimensionar a 224x224
    cuadro_redimensionado = cv2.resize(cuadro_rgb, (224, 224))
    # Normalizar dividiendo por 255
    cuadro_normalizado = cuadro_redimensionado / 255.0
    # Expandir dimensiones para simular un lote de tamaño 1
    cuadro_expandido = np.expand_dims(cuadro_normalizado, axis=0)
    return cuadro_expandido



modelo = keras.models.load_model('mymodel.h5')
categories = ['cempasuchil','girasol','lavanda','margarita','nochebuena']
camara = cv2.VideoCapture(0) # El '0' suele ser la cámara predeterminada

while True:
    ret, cuadro = camara.read()
    if ret:
        # Pre-procesar el cuadro
        cuadro_procesado = preprocesar(cuadro)

        # Hacer la predicción
        prediccion = modelo.predict(cuadro_procesado)

        # Obtener el nombre de la clase predicha
        # Aquí debes convertir el valor numérico de la predicción a un nombre legible
        # Por ejemplo, si tienes un diccionario que mapea índices a nombres de flores:
        # nombre_flor = diccionario_clases[np.argmax(prediccion)]
        nombre_flor = categories[np.argmax(prediccion)]  # Reemplaza esto con el nombre real obtenido

        # Mostrar el texto de la clase predicha
        cv2.putText(cuadro, nombre_flor, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        # Mostrar el cuadro
        cv2.imshow('Video', cuadro)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

camara.release()
cv2.destroyAllWindows()


#! Accuary, Recal, f-1 score SACAR ESTOS VALORES


