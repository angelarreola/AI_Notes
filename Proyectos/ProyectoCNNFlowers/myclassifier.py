import pickle
import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split

def load_data():
    pick = open('data.pickle', 'rb')
    data = pickle.load(pick)
    pick.close()

    np.random.shuffle(data)

    feature = []
    labels = []

    for img, label in data:
        feature.append(img)
        labels.append(label)

    feature = np.array(feature, dtype=np.float32)
    labels = np.array(labels)

    feature = feature/255.0

    return[feature, labels]

(feature, labels) = load_data()

# División de Datos
x_train, x_test, y_train, y_test = train_test_split(feature, labels, test_size=0.1)

categories = ['cempasuchil','girasol','lavanda','margarita','nochebuena']

# Creacion de la arquitectura del modelo
input_layer = tf.keras.layers.Input([224,224,3])

conv1 = tf.keras.layers.Conv2D(filters = 32, kernel_size = (5,5), padding='Same', activation = 'relu')(input_layer)
pool1 = tf.keras.layers.MaxPooling2D(pool_size = (2,2))(conv1)

conv2 = tf.keras.layers.Conv2D(filters = 64, kernel_size = (3,3), padding='Same', activation = 'relu')(pool1)
pool2 = tf.keras.layers.MaxPooling2D(pool_size = (2,2), strides=(2,2))(conv2)

conv3 = tf.keras.layers.Conv2D(filters = 96, kernel_size = (3,3), padding='Same', activation = 'relu')(pool2)
pool3 = tf.keras.layers.MaxPooling2D(pool_size = (2,2), strides=(2,2))(conv3)

conv4 = tf.keras.layers.Conv2D(filters = 96, kernel_size = (3,3), padding='Same', activation = 'relu')(pool3)
pool4 = tf.keras.layers.MaxPooling2D(pool_size = (2,2), strides=(2,2))(conv4)

flt1 = tf.keras.layers.Flatten()(pool4)
dn1 = tf.keras.layers.Dense(512, activation = 'relu')(flt1)

out = tf.keras.layers.Dense(5, activation = 'softmax')(dn1)

# Creacion y compilado del modelo
model = tf.keras.Model(input_layer, out)
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

model.fit(x_train, y_train, batch_size = 100, epochs = 10)
model.save('mymodel.h5')



