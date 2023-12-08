// Configuraciones y variables globales
const config = {
    width: 800,
    height: 400,
    gravity: 800,
    desiredFps: 30
};

let jugador, fondo, bala, balaVertical, balaD = false, balaVerticalD = false, nave;
let salto, teclaIzquierda, teclaDerecha, menu;
let velocidadBala = 0, desplazamientoBala = 0;
let velocidadBalaV = 0, desplazamientoBalaV = 0;
let estadoEnAire, estadoEnSuelo;
let estadoMovIzquierda, estadoMovDerecha, estadoNeutro;
let nnNetwork, nnEntrenamiento, nnSalida, datosEntrenamiento = [];
let modoAuto = false, eCompleto = false;
const UMBRAL = 0.1;
const DISTANCIA_PARED = 20;
let inversionMov = false;
let countImpacts = 0;


const juego = new Phaser.Game(config.width, config.height, Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

function preload() {
    cargarRecursos();
}

function create() {
    iniciarFisicas();
    crearObjetos();
    configurarTeclas();
    iniciarRedNeural();
}

function update() {
    actualizarJuego();
}

function render() {
    // Función de renderizado (si es necesario)
}

// Resto de funciones (cargarRecursos, iniciarFisicas, crearObjetos, etc.)
function cargarRecursos() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png', 32, 48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}

function iniciarFisicas() {
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = config.gravity;
    juego.time.desiredFps = config.desiredFps;
}

function crearObjetos() {
    fondo = juego.add.tileSprite(0, 0, config.width, config.height, 'fondo');
    nave = juego.add.sprite(config.width - 100, config.height - 70, 'nave');
    bala = juego.add.sprite(config.width - 100, config.height, 'bala');
    balaVertical = juego.add.sprite(config.width - 100, config.height, 'bala');
    jugador = juego.add.sprite(50, config.height, 'mono');

    juego.physics.enable([jugador, bala, balaVertical]);
    
    jugador.body.collideWorldBounds = true;
    jugador.animations.add('corre', [8, 9, 10, 11]).play(10, true);
    
    balaVertical.body.collideWorldBounds = true;
    bala.body.collideWorldBounds = true;

    crearTextoPausa();
}

function crearTextoPausa() {
    pausaL = juego.add.text(config.width - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, this);
    juego.input.onDown.add(mPausa, this);
}

function configurarTeclas() {
    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    teclaIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.A);
    teclaDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.D);
}

//*------------------------------------------------------------------------------------
function iniciarRedNeural() {
    // nnNetwork = new synaptic.Architect.Perceptron(4, 8, 8, 8, 8, 4); //! Lo mejor hasta ahora (12,000 iteraciones)
    nnNetwork = new synaptic.Architect.Perceptron(4, 4, 4, 4, 4, 5); //
    // nnNetwork = new synaptic.Architect.Perceptron(4, 8, 8, 8, 4); //? No
    // nnNetwork = new synaptic.Architect.Perceptron(4, 7, 7, 6, 6, 4); //? No
    // nnNetwork = new synaptic.Architect.Perceptron(4, 8, 8, 8, 8, 8, 4); //? No 
    // nnNetwork = new synaptic.Architect.Perceptron(4, 7, 7, 7, 7, 4); //? No 
    // nnNetwork = new synaptic.Architect.Perceptron(4, 10, 10, 10, 10, 4); //? No
    // nnNetwork = new synaptic.Architect.Perceptron(4, 9, 9, 9, 4); //? Un poco bien


    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}

function recopilarDatosEntrenamiento() {
    if (!modoAuto) {
        if (balaD) {
            if (estadoEnAire) {
                datosEntrenamiento.push({
                    'input': [desplazamientoBala, velocidadBala, 0, 0],
                    'output': [estadoEnAire, estadoEnSuelo, 1, 0, 0] // Izquierda
                });
                // datosEntrenamiento.push({
                //     'input': [desplazamientoBala, velocidadBala, 0, 0],
                //     'output': [estadoEnAire, estadoEnSuelo, 0, 0, 1] //Neutro
                // });
                datosEntrenamiento.push({
                    'input': [desplazamientoBala, velocidadBala, 0, 0],
                    'output': [estadoEnAire, estadoEnSuelo, 0, 1, 0] // Derecha 
                });
            } else {
                datosEntrenamiento.push({
                    'input': [desplazamientoBala, velocidadBala, 0, 0],
                    'output': [estadoEnAire, estadoEnSuelo, 1, 0, 0] // Izquierda
                });
                // datosEntrenamiento.push({
                //     'input': [desplazamientoBala, velocidadBala, 0, 0],
                //     'output': [estadoEnAire, estadoEnSuelo, 0, 0, 1] //Neutro
                // });
                datosEntrenamiento.push({
                    'input': [desplazamientoBala, velocidadBala, 0, 0],
                    'output': [estadoEnAire, estadoEnSuelo, 0, 1, 0]  // Derecha 
                });
            }
        }
        if (balaVerticalD) {
            if (estadoMovIzquierda || estadoMovDerecha) {
                datosEntrenamiento.push({
                    'input': [0, 0, desplazamientoBalaV, velocidadBalaV],
                    'output': [0, 1, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Suelo
                });
                datosEntrenamiento.push({
                    'input': [0, 0, desplazamientoBalaV, velocidadBalaV],
                    'output': [1, 0, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Aire
                });
                // datosEntrenamiento.push({
                //     'input': [0, 0, desplazamientoBalaV, velocidadBalaV],
                //     'output': [0, 1, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Suelo x2 para equilibrio
                // });
                // datosEntrenamiento.push({
                //     'input': [0, 0, desplazamientoBalaV, velocidadBalaV],
                //     'output': [1, 0, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Aire x2 para equilibrio
                // });
                // datosEntrenamiento.push({
                //     'input': [0, 0, desplazamientoBalaV, velocidadBalaV],
                //     'output': [0, 1, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Suelo x3 para equilibrio
                // });
                // datosEntrenamiento.push({
                //     'input': [0, 0, desplazamientoBalaV, velocidadBalaV],
                //     'output': [1, 0, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Aire x3 para equilibrio
                // });
                // datosEntrenamiento.push({
                //     'input': [0, 0, desplazamientoBalaV, velocidadBalaV],
                //     'output': [0, 1, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Suelo x4 para equilibrio
                // });
                // datosEntrenamiento.push({
                //     'input': [0, 0, desplazamientoBalaV, velocidadBalaV],
                //     'output': [1, 0, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Aire x4 para equilibrio
                // });
            } else {
                datosEntrenamiento.push({
                    'input': [0, 0, desplazamientoBalaV, velocidadBalaV],
                    'output': [0, 1, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Suelo
                });
                datosEntrenamiento.push({
                    'input': [0, 0, desplazamientoBalaV, velocidadBalaV],
                    'output': [1, 0, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Aire
                });
            }
        }

        // if (balaD || balaVerticalD) {
        //     datosEntrenamiento.push({
        //         'input': [desplazamientoBala, velocidadBala, desplazamientoBalaV, velocidadBalaV],
        //         'output': [estadoEnAire, estadoEnSuelo, estadoMovIzquierda, estadoMovDerecha, estadoNeutro] // Necesitas definir esto
        //     });
        // }

        console.log({desplazamientoBala, velocidadBala, estadoEnAire, estadoEnSuelo, estadoMovDerecha, estadoMovIzquierda, estadoNeutro});
        console.log(datosEntrenamiento.length);
    }
}

function enRedNeural() {
    const opcionesEntrenamiento = {
        rate: 0.0003,
        iterations: 8000,
        shuffle: true,
        schedule: {
            every: 1000, // Ejecuta esta función cada 1000 iteraciones
            do: function(data) {
                console.log("Error: ", data.error, "Iteraciones: ", data.iterations, "Tasa: ", data.rate);
            }
        }
    };
    nnEntrenamiento.train(datosEntrenamiento, opcionesEntrenamiento);
}

function datosDeEntrenamiento(param_entrada) {
    console.log("Entrada", param_entrada);
    nnSalida = nnNetwork.activate(param_entrada);

    // Redondeo para fines de visualización
    var salidaRedondeada = nnSalida.map(s => Math.round(s * 100));
    console.log("Salida", `En el Aire %: ${salidaRedondeada[0]}, En el suelo %: ${salidaRedondeada[1]}, Mov Izquierda %: ${salidaRedondeada[2]}, Mov Neutro: ${salidaRedondeada[4]} ,Mov Derecha %: ${salidaRedondeada[3]}`);
    return nnSalida; // Devuelve el vector completo de salidas
}

//*------------------------------------------------------------------------------------

function actualizarJuego() {
    fondo.tilePosition.x -= 1;
    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(balaVertical, jugador, colisionH, null, this);

    actualizarEstadoJugador();
    calcularDesplazamientoBala();
    gestionarMovimientoJugador();
    gestionarDisparos();
    recopilarDatosEntrenamiento();
}

/*----------------------------------------------- */

function actualizarEstadoJugador() {
    estadoEnSuelo = jugador.body.onFloor() ? 1 : 0;
    estadoEnAire = jugador.body.onFloor() ? 0 : 1;
    estadoMovIzquierda = jugador.body.velocity.x < 0 ? 1 : 0;
    estadoMovDerecha =  jugador.body.velocity.x > 0 ? 1 : 0;
    if (estadoMovDerecha === 0 && estadoMovIzquierda === 0) {
        estadoNeutro = 1;
    } else {
        estadoNeutro = 0;
    }
    console.log(estadoMovDerecha, estadoMovIzquierda, estadoNeutro);
}

function calcularDesplazamientoBala() {
    desplazamientoBala = Math.floor(jugador.position.x - bala.position.x + 50);
    desplazamientoBalaV = Math.floor(jugador.position.y - balaVertical.position.y - 32);

    console.log(`Jugador: ${jugador.position.x}, balaH: ${bala.position.x}, difH: ${jugador.position.x - bala.position.x + 50}`);
    console.log(`Jugador: ${jugador.position.y}, balaV: ${balaVertical.position.y}, difV: ${(jugador.position.y - balaVertical.position.y - 32)}`);
}

function gestionarMovimientoJugador() {
    if (modoAuto) {
        // Ejemplo de cómo podrías interpretar las salidas de la red neuronal en modo automático
        let nnSalida = datosDeEntrenamiento([desplazamientoBala, velocidadBala, desplazamientoBalaV, velocidadBalaV]);
        
        // Aquí estamos interpretando las salidas de la red neuronal para mover al jugador
        if (nnSalida[0] > nnSalida[1] && jugador.body.onFloor()) { // Si la red decide "saltar"
            saltar();
        }

        if (nnSalida[2] > nnSalida[4] > nnSalida[3] /*&& jugador.position.x > DISTANCIA_PARED*/) { // Si la red decide "moverse a la izquierda"
            if (jugador.position.x <= config.width - 400) {
                // if (inversionMov) {
                //     moverseDerecha()
                // } else {
                //     if (jugador.position.x === 0) {
                //         inversionMov = true;
                //     } else {
                //         moverseIzquierda();
                //     }
                // }
            } else {
                inversionMov = false;
                moverseIzquierda();
            }
        }
        else if (nnSalida[3] > nnSalida[4] > nnSalida[2] && jugador.position.x < config.width - 400 /*&& jugador.position.x < config.width - 300*/) { // Si la red decide "moverse a la derecha"
            if (inversionMov) {
                // moverseIzquierda();
            } else {
                if (jugador.position.x >= config.width - 400) {
                    inversionMov = false;
                } else {
                    moverseDerecha();
                }
            }
        } else {
            jugador.body.velocity.x = 0; // Quieto
        }

    } else {
        // Movimiento manual del jugador
        if (teclaIzquierda.isDown) {
            moverseIzquierda();
        } else if (teclaDerecha.isDown) {
            moverseDerecha();
        } else {
            jugador.body.velocity.x = 0; // Quieto
        }
        if (salto.isDown && jugador.body.onFloor()) {
            saltar();
        }
    }
}

function saltar() {
    jugador.body.velocity.y = -270;
}

function moverseDerecha() {
    jugador.body.velocity.x = 200;
}

function moverseIzquierda() {
    jugador.body.velocity.x = -200;
}

function gestionarDisparos() {
    if (!balaD) {
        disparo();
    } else if (bala.position.x <= 0) {
        resetVariables();

    }
    // Gestionar la bala vertical
    if (!balaVerticalD) {
        disparoVertical();
    } else if (balaVertical.position.y >= 380) { // Reiniciar la bala vertical si toca el suelo
        resetVariablesBalaVertical();
    }
}

function disparo() {
    velocidadBala = -1 * velocidadRandom(300, 500);
    bala.body.velocity.y = 0;
    bala.body.velocity.x = velocidadBala;
    balaD = true;
}

// Función para el disparo vertical
function disparoVertical() {
    velocidadBalaV = 1 * velocidadRandom(50, 100);
    balaVertical.position.x = jugador.position.x; // Posicionar la bala encima del jugador
    balaVertical.position.y = 0; // Iniciar desde la parte superior de la pantalla
    balaVertical.body.velocity.y = velocidadBalaV // Velocidad vertical aleatoria
    balaVerticalD = true;
}

function resetVariables() {
    jugador.body.velocity.setTo(0, 0);
    bala.body.velocity.x = 0;
    bala.position.x = config.width - 100;
    countImpacts++;
    balaD = false;
    if (countImpacts === 3) {
        resetPosition();
    }
}

// Función para resetear las variables de la bala vertical
function resetVariablesBalaVertical() {
    balaVertical.body.velocity.y = 0;
    balaVertical.position.y = 0;
    balaVerticalD = false;
    countImpacts++;
    if (countImpacts === 3) {
        resetPosition();
    }
}

function resetPosition() {
    jugador.position.x = 50;
    countImpacts = 0;
}

function resetVariablesNuevoJuego() {
    jugador.body.velocity.setTo(0, 0);
    jugador.position.x = 50;

    bala.body.velocity.x = 0;
    bala.position.x = config.width - 100;
    balaD = false;

    balaVertical.body.velocity.y = 0;
    balaVertical.position.y = 0;
    balaVerticalD = false;
    inversionMov = false;

}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function colisionH() {
    pausa();
}

function pausa() {
    juego.paused = true;
    menu = juego.add.sprite(config.width / 2, config.height / 2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event) {
    if (juego.paused) {
        const menu_x1 = config.width / 2 - 270 / 2,
              menu_x2 = config.width / 2 + 270 / 2,
              menu_y1 = config.height / 2 - 180 / 2,
              menu_y2 = config.height / 2 + 180 / 2;

        const mouse_x = event.x,
              mouse_y = event.y;

        // Verificar si el clic del ratón está dentro de los límites del menú
        if (mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2) {
            // Modo manual
            if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90) {
                eCompleto = false;
                // datosEntrenamiento = [];
                modoAuto = false;
            } 
            // Modo automático
            else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
                if (!eCompleto) {
                    console.log("Entrenamiento con " + datosEntrenamiento.length + " valores");
                    enRedNeural();
                    eCompleto = true;
                }
                modoAuto = true;
            }

            // Quitar el menú y reanudar el juego
            menu.destroy();
            resetVariablesNuevoJuego();
            juego.paused = false;
        }
    }
}