# Propuesta de siguiente version del juego.

## Puntos clave
- Se pretende que el jugador sea capaz de esquivar balas que vayan en forma de onda, como si tuvieran la trayectoria de la funcion seno.
- Se tiene como objetivo realizar la modificacion al modelo que ya se tiene para que sea capaz de poder esquivar las balas con la trayectoria definida en el anterior punto.

## Posibles modificaciones
- La primera modificacion deberia realizarse al videojuego como tal, ya que por el momento solo se nos permite movernos hacia arriba a manera de salto. Por lo que se le debe dar la libertad al jugador de poder moverse hacia sus lados.

- Asi como modificamos el juego tambien debemos modificar las salidas que este nos arroja para poder entrenar al modelo de manera correcta, deberan ser por lo menos 4 salidas, isOnFloor, isOnAir, isOnRight, isOnLeft...

- La modificacion mas importante es en la creacion de la red neuronal, en esta se debera implementar mas entradas como las mencionadas en el punto anterior para que el modelo para que pueda ser entrenado correctamente.