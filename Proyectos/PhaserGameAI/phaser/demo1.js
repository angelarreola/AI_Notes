var w=800;
var h=400;
var jugador;
var fondo;

var bala, balaD=false, balaVerti, balaVertiD=false, nave;

var salto;
var izquierda;
var derecha;
var menu;

var velocidadBala;
var despBala;
var estatusAire;
var estatuSuelo;

var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[];
var modoAuto = false, eCompleto=false;



var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render});

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png',32 ,48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');

}



function create() {

    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w-100, h-70, 'nave');
    bala = juego.add.sprite(w-100, h, 'bala');
    balaVerti = juego.add.sprite(h-100, w, 'bala')
    jugador = juego.add.sprite(50, h, 'mono');


    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre',[8,9,10,11]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala);
    juego.physics.enable(balaVerti);
    bala.body.collideWorldBounds = true;
    balaVerti.body.collideWorldBounds = true;

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

    salto = juego.input.keyboard.addKey(Phaser.Keyboard.UP);
    izquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    derecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

    
    nnNetwork = new synaptic.Architect.Perceptron(6, 20, 20, 20, 4);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {
        rate: 0.0003,
        iterations: 20000, // Aumenta el número de iteraciones si es necesario
        shuffle: true,
        cost: synaptic.Trainer.cost.CROSS_ENTROPY,
        schedule: {
            every: 500, // Intervalo de iteraciones para registrar el progreso
            do: function(data) {
                console.log("Error:", data.error, "Iteraciones:", data.iterations);
            }
        }
    });
    console.log("Entrenamiento Completo");
}



function datosDeEntrenamiento(param_entrada){
    nnSalida = nnNetwork.activate(param_entrada);
    console.log("Salida de la Red Neuronal: ", nnSalida);
    return nnSalida; // Devuelve el array completo de salida
}



function pausa(){
    juego.paused = true;
    menu = juego.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event){
    if(juego.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x  ,
            mouse_y = event.y  ;

        if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ){
            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                eCompleto=false;
                datosEntrenamiento = [];
                modoAuto = false;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                if(!eCompleto) {
                    console.log("","Entrenamiento "+ datosEntrenamiento.length +" valores" );
                    enRedNeural();
                    eCompleto=true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            juego.paused = false;

        }
    }
}


function resetVariables(){
    jugador.body.velocity.x=0;
    jugador.body.velocity.y=0;
    bala.body.velocity.x = 0;
    balaVerti.body.velocity.y = 0;
    bala.position.x = w-100;
    balaVerti.position.y = h-100;
    balaD=false;
    balaVertiD=false;
}


function saltar(){
    jugador.body.velocity.y = -270;
}


function update() {
    fondo.tilePosition.x -= 1; 
    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(balaVerti, jugador, colisionH, null, this);

    estatuSuelo = jugador.body.onFloor() ? 1 : 0;
    estatusAire = jugador.body.onFloor() ? 0 : 1;

    var posXJugador = jugador.position.x;
    var posYJugador = jugador.position.y;
    var despBalaX = Math.floor(posXJugador - bala.position.x);
    var despBalaY = Math.floor(posYJugador - bala.position.y);
    
    var despBalaVertiX = Math.floor(posXJugador - bala.position.y);
    var despBalaVertiY = Math.floor(posYJugador - bala.position.x);

    var accionRealizada = 3; // Por defecto, asumimos que el jugador se queda quieto

    // Control de movimiento del jugador
    if (!modoAuto) {
        accionRealizada = controlManualJugador();
        
        // Recolección de datos para el entrenamiento de la red neuronal
        if (bala.position.x > 0 && balaVerti.position.y > 0) {
            recolectarDatosEntrenamiento(despBalaX, despBalaY, bala.body.velocity.x, bala.body.velocity.y, posXJugador, posYJugador, accionRealizada);
        }
    } else {
        // Ejecuta la acción en base a la predicción de la red neuronal
        var prediccion = datosDeEntrenamiento([despBalaX, despBalaY, bala.body.velocity.x, bala.body.velocity.y, posXJugador, posYJugador]);
        realizarAccion(prediccion);
    }

    // Lógica para disparo de la bala
    if (!balaD) {
        disparo();
    }

    if (bala.position.x <= 0) {
        resetVariables();
    }
}

function controlManualJugador() {
    if (izquierda.isDown) {
        jugador.body.velocity.x = -150;
        return 0; // Moverse a la izquierda
    } else if (derecha.isDown) {
        jugador.body.velocity.x = 150;
        return 1; // Moverse a la derecha
    } else if (salto.isDown && jugador.body.onFloor()) {
        jugador.body.velocity.y = -270;
        return 2; // Saltar
    } else {
        jugador.body.velocity.x = 0;
        return 3; // Quedarse quieto
    }
}

function realizarAccion(prediccion) {
    // Determina la acción con mayor probabilidad
    var accion = prediccion.indexOf(Math.max(...prediccion));

    switch (accion) {
        case 0: // Moverse a la izquierda
            jugador.body.velocity.x = -150;
            break;
        case 1: // Moverse a la derecha
            jugador.body.velocity.x = 150;
            break;
        case 2: // Saltar
            if (jugador.body.onFloor()) {
                jugador.body.velocity.y = -270;
            }
            break;
        default: // Quedarse quieto
            jugador.body.velocity.x = 0;
            break;
    }
}


function recolectarDatosEntrenamiento(accion) {
    var posXJugador = jugador.position.x;
    var posYJugador = jugador.position.y;
    var despBalaX = Math.floor(posXJugador - bala.position.x);
    var despBalaY = Math.floor(posYJugador - bala.position.y);
    var velocidadBalaX = bala.body.velocity.x;
    var velocidadBalaY = bala.body.velocity.y;

    var output = [0, 0, 0, 0]; // Representa [izquierda, derecha, saltar, quieto]
    output[accion] = 1; // Establece la acción realizada a 1

    datosEntrenamiento.push({
        'input': [despBalaX, despBalaY, velocidadBalaX, velocidadBalaY, posXJugador, posYJugador],
        'output': output
    });

    console.log("Datos Recolectados: Desplazamiento Bala X, Desplazamiento Bala Y, Velocidad Bala X, Velocidad Bala Y, Posición X Jugador, Posición Y Jugador, Acción:",
        despBalaX + ", " + despBalaY + ", " + velocidadBalaX + ", " + velocidadBalaY + ", " + posXJugador + ", " + posYJugador + ", " + output);
}




function disparo(){
    velocidadBala =  -1 * velocidadRandom(300,800);
    bala.body.velocity.y = 0 ;
    bala.body.velocity.x = velocidadBala ;
    balaD=true;
}

function colisionH(){
    pausa();
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render(){

}
