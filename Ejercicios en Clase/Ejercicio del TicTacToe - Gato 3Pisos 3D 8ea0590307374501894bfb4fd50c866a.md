# Ejercicio del TicTacToe - Gato 3Pisos/3D

: Artificial Intelligence
Status: Not started

## 📌 Recall:

♦️ Estrategia para ganar siempre en 2D.

♦️ Posible estrategia para ganar en el tablero 3D. 

♦️ Medida de rendimiento

## 📕 Notes:

Siempre el que va primero tiene la posibilidad de empatar o ganar dependiendo del movimiento inicial que haga.

Tomar el centro es un punto clave en el juego, ya que es un punto de control de casillas, teniendo esto en cuenta, tomar control de esa posición es fundamental para ganar.

Controlar las esquinas también es parte fundamental, ya que al igual que el centro estas son posiciones que nos dan pauta a realizar movimientos que nos conduzcan al estado de éxito.

Si los dos jugadores conocen bien el juego siempre se va a jugar al empate, nunca habrá un ganador.

![Untitled](Ejercicio%20del%20TicTacToe%20-%20Gato%203Pisos%203D%208ea0590307374501894bfb4fd50c866a/Untitled.png)

Tomando en cuenta como se gana en el tablero 2D, algunos puntos se conservan, solo que se amplían las posibilidades debido a los niveles en donde nos podemos mover, los bloqueos que se pueden realizar y las estrategias a realizar.

Primero que nada, las posibilidades de movimiento al ser aumentadas por 3, tenemos 3*3*3, lo que nos da un total de 27 casillas disponibles. Pero a pesar de este aumento hay puntos que se conservan del tablero 2D para asegurar el éxito como el **control del centro** y el **uso de las esquinas como posiciones estratégicas**, solo que de este modo, tenemos que tomar en cuenta también las diagonales que se pueden formar a través de los 3 niveles.

En este caso las medidas de rendimiento a tomar en cuenta podrían ser las siguientes:

- Espacio disponible de movimientos
- Control del centro
- Movimiento Inicial