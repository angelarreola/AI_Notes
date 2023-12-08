// Configuraciones y variables globales
const config = {
    width: 800,
    height: 400,
    gravity: 800,
    desiredFps: 30
};

let jugador, fondo, bala, balaD = false, nave;
let salto, menu;
let velocidadBala, despBala;
let estadoEnAire, estadoEnSuelo;
let nnNetwork, nnEntrenamiento, nnSalida, datosEntrenamiento = [];
let modoAuto = false, eCompleto = false;

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
    jugador = juego.add.sprite(50, config.height, 'mono');

    juego.physics.enable([jugador, bala]);

    jugador.body.collideWorldBounds = true;
    jugador.animations.add('corre', [8, 9, 10, 11]).play(10, true);
    
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
}

//*------------------------------------------------------------------------------------
function iniciarRedNeural() {
    nnNetwork = new synaptic.Architect.Perceptron(2, 6, 6, 2);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}

function recopilarDatosEntrenamiento() {
    if (!modoAuto && bala.position.x > 0) {
        datosEntrenamiento.push({
            'input': [despBala, velocidadBala],
            'output': [estadoEnAire, estadoEnSuelo]
        });

        console.log("Desplazamiento Bala, Velocidad Bala, Estado en Aire, Estado en Suelo: ",
            despBala + " " + velocidadBala + " " + estadoEnAire + " " + estadoEnSuelo);
    }
}

function enRedNeural() {
    const opcionesEntrenamiento = {
        rate: 0.0003,
        iterations: 10000,
        shuffle: true
    };
    nnEntrenamiento.train(datosEntrenamiento, opcionesEntrenamiento);
}

function datosDeEntrenamiento(param_entrada) {
    console.log("Entrada", param_entrada[0] + " " + param_entrada[1]);
    nnSalida = nnNetwork.activate(param_entrada);

    var aire = Math.round(nnSalida[0] * 100);
    var piso = Math.round(nnSalida[1] * 100);
    console.log("Valor", "En el Aire %: " + aire + " En el suelo %: " + piso);

    return nnSalida[0] >= nnSalida[1];
}

//*------------------------------------------------------------------------------------

function actualizarJuego() {
    fondo.tilePosition.x -= 1;
    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);

    actualizarEstadoJugador();
    calcularDesplazamientoBala();
    gestionarSaltos();
    gestionarDisparos();
    recopilarDatosEntrenamiento();
}

/*----------------------------------------------- */

function actualizarEstadoJugador() {
    estadoEnSuelo = jugador.body.onFloor() ? 1 : 0;
    estadoEnAire = jugador.body.onFloor() ? 0 : 1;
}

function calcularDesplazamientoBala() {
    despBala = Math.floor(jugador.position.x - bala.position.x);
}

function gestionarSaltos() {
    if (modoAuto && bala.position.x > 0 && jugador.body.onFloor()) {
        if (datosDeEntrenamiento([despBala, velocidadBala])) {
            saltar();
        }
    } else if (!modoAuto && salto.isDown && jugador.body.onFloor()) {
        saltar();
    }
}

function saltar() {
    jugador.body.velocity.y = -270;
}

function gestionarDisparos() {
    if (!balaD) {
        disparo();
    } else if (bala.position.x <= 0) {
        resetVariables();
    }
}

function disparo() {
    velocidadBala = -1 * velocidadRandom(300, 800);
    bala.body.velocity.y = 0;
    bala.body.velocity.x = velocidadBala;
    balaD = true;
}

function resetVariables() {
    jugador.body.velocity.setTo(0, 0);
    bala.body.velocity.x = 0;
    bala.position.x = config.width - 100;
    jugador.position.x = 50;
    balaD = false;
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
                datosEntrenamiento = [];
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
            resetVariables();
            juego.paused = false;
        }
    }
}