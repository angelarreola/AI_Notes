// Configuraciones y variables globales
const config = {
    width: 800,
    height: 400,
    gravity: 800,
    desiredFps: 30,
  };
  
  let jugador,
    jugadorD = true,
    fondo,
    bala,
    balaVertical,
    balaD = false,
    balaVerticalD = false,
    nave;
  let salto, teclaIzquierda, teclaDerecha, menu;
  let velocidadBala = 0,
    desplazamientoBala = 0;
  let velocidadBalaV = 0,
    desplazamientoBalaV = 0;
    posicionXBalaV = 0;
  let estadoEnAire;
  let estadoMovDerecha;
  let estadoMovIzquierda;
  let nnNetwork,
    nnNetwork2,
    nnEntrenamiento,
    nnEntrenamiento2,
    nnSalida,
    nnSalida2,
    datosEntrenamiento = [],
    datosEntrenamiento2 = [];
  let modoAuto = false,
    eCompleto = false;
  const UMBRAL_MEDIO = 0.33;
  const UMBRAL_BAJO = 0.15;
  const DISTANCIA_PARED_DERECHA = 400;
  let inversionMov = false;
  let diff = 0;
  
  const juego = new Phaser.Game(config.width, config.height, Phaser.CANVAS, "", {
    preload: preload,
    create: create,
    update: update,
    render: render,
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
    juego.load.image("fondo", "assets/game/fondo.jpg");
    juego.load.spritesheet("mono", "assets/sprites/altair.png", 32, 48);
    juego.load.image("nave", "assets/game/ufo.png");
    juego.load.image("bala", "assets/sprites/purple_ball.png");
    juego.load.image("menu", "assets/game/menu.png");
  }
  
  function iniciarFisicas() {
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = config.gravity;
    juego.time.desiredFps = config.desiredFps;
  }
  
  function crearObjetos() {
    fondo = juego.add.tileSprite(0, 0, config.width, config.height, "fondo");
    nave = juego.add.sprite(config.width - 100, config.height - 70, "nave");
    bala = juego.add.sprite(config.width - 100, config.height, "bala");
    balaVertical = juego.add.sprite(config.width - 100, config.height, "bala");
    jugador = juego.add.sprite(69.9999, config.height, "mono");
  
    juego.physics.enable([jugador, bala, balaVertical]);
  
    jugador.body.collideWorldBounds = true;
    jugador.animations.add("corre", [8, 9, 10, 11]).play(10, true);
  
    balaVertical.body.collideWorldBounds = true;
    bala.body.collideWorldBounds = true;
  
    crearTextoPausa();
  }
  
  function crearTextoPausa() {
    pausaL = juego.add.text(config.width - 100, 20, "Pausa", {
      font: "20px Arial",
      fill: "#fff",
    });
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
    nnNetwork = new synaptic.Architect.Perceptron(2, 5, 1); 
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
  }

  function iniciarRedNeural2() {
    nnNetwork2 = new synaptic.Architect.Perceptron(3, 8, 2); 
    nnEntrenamiento2 = new synaptic.Trainer(nnNetwork2);
  }
  
  function recopilarDatosEntrenamiento() {
    if (!modoAuto) {
      if (balaD) {
        datosEntrenamiento.push({
          input: [desplazamientoBala, velocidadBala],
          output: [
            estadoEnAire,
          ], //+ Salidas para saltar o no saltar
        });
      }
  
      if (balaVerticalD && jugadorD) {
        datosEntrenamiento2.push({
          input: [desplazamientoBalaV, velocidadBalaV, posicionXBalaV],
          output: [
            estadoMovDerecha,
            estadoMovIzquierda
          ], //+ Salidas para moverse a los lados dependiendo de todos los valores de la Bala Vertical
        });
      }
  
      console.log(`
        D-BalaH: ${desplazamientoBala},
        V-BalaH: ${velocidadBala},
        D-BalaV: ${desplazamientoBalaV},
        V-BalaV: ${velocidadBalaV},
        X-BalaV: ${posicionXBalaV},
        Aire: ${estadoEnAire},
        Derecha: ${estadoMovDerecha},
        Izquieda: ${estadoMovIzquierda}
      `);
      console.log(`RED1: ${datosEntrenamiento.length}`);
      console.log(`RED2: ${datosEntrenamiento2.length}`);
    }
  }
  
  function enRedNeural() {

    const opcionesEntrenamiento = {
      rate: 0.0003,
      iterations: 10000,
      shuffle: true,
      schedule: {
        every: 1000, // Ejecuta esta función cada 1000 iteraciones
        do: function (data) {
          console.log(
            "RED 1",
            "Error: ",
            data.error,
            "Iteraciones: ",
            data.iterations,
          );
        },
      },
    };
    console.log('Iniciando entrenamiento de nnEntrenamiento...');
    nnEntrenamiento.train(datosEntrenamiento, opcionesEntrenamiento);
    console.log('Entrenamiento de nnEntrenamiento completado.');


    iniciarRedNeural2()
    enRedNeural2()
  }

  function enRedNeural2() {
    const opcionesEntrenamiento2 = {
      rate: 0.0003,
      iterations: 30000,
      shuffle: true,
      schedule: {
        every: 1000, // Ejecuta esta función cada 1000 iteraciones
        do: function (data) {
          console.log(
            "RED 2",
            "Error: ",
            data.error,
            "Iteraciones: ",
            data.iterations,
          );
        },
      },
    };
    console.log('Iniciando entrenamiento de nnEntrenamiento2...');
    nnEntrenamiento2.train(datosEntrenamiento2, opcionesEntrenamiento2);
    console.log('Entrenamiento de nnEntrenamiento2 completado.');
  }
  
  function datosDeEntrenamiento(param_entrada) {
    console.log("Entrada", param_entrada);
    nnSalida = nnNetwork.activate(param_entrada);
  
    // Redondeo para fines de visualización
    let salidaRedondeada = nnSalida.map((s) => Math.round(s * 100));
    console.log(
      "Salida",
      `En el Aire %: ${salidaRedondeada[0]}} `
    );
    return nnSalida; // Devuelve el vector completo de salidas
  }

  function datosDeEntrenamiento2(param_entrada) {
    console.log("Entrada", param_entrada);
    nnSalida2 = nnNetwork2.activate(param_entrada);
  
    // Redondeo para fines de visualización
    let salidaRedondeada2 = nnSalida2.map((s) => Math.round(s * 100));
    console.log(
      "Salida",
      `Mov Derecha %: ${salidaRedondeada2[0]},  Mov Izquierda %: ${salidaRedondeada2[1]} `
    );
    return nnSalida2; // Devuelve el vector completo de salidas
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
    estadoEnAire = jugador.body.onFloor() ? 0 : 1;
    estadoMovDerecha = jugador.body.velocity.x > 0 ? 1 : 0;
    estadoMovIzquierda = jugador.body.velocity.x < 0 ? 1: 0
  }
  
  function calcularDesplazamientoBala() {
    desplazamientoBala = Math.floor(jugador.position.x - bala.position.x + 50);
    desplazamientoBalaV = Math.floor(
      jugador.position.y - balaVertical.position.y - 32
    );
  }
  
  async function gestionarMovimientoJugador() {
    if (modoAuto) { //? Modo Automatico
      let nnSalida = datosDeEntrenamiento([
        desplazamientoBala,
        velocidadBala,
      ]);

      let nnSalida2 = datosDeEntrenamiento2([
        desplazamientoBalaV,
        velocidadBalaV,
        posicionXBalaV
      ]);
  
      //***** Aquí estamos interpretando las salidas de la red neuronal para mover al jugador ****/
      if (nnSalida[0] >= 0.5 && jugador.body.onFloor()) { //+ Si la red decide "saltar"
        saltar();
      }
      if (jugadorD) {
        if (nnSalida2[0] >= UMBRAL_MEDIO) { //+ Si la red decide "moverse a la derecha"
          if ( balaVertical.position.x > 69.9999 && balaVertical.position.x < 110.0 ) { //110
            moverEjeXJugador(moverseIzquierda, 200, 'l');
          } else {
            moverEjeXJugador(moverseDerecha, 200, 'r');
          }
        } else if (nnSalida2[1] >= UMBRAL_MEDIO) { //+ Si la red decide "moverse a la izquierda"
          if ( balaVertical.position.x < 69.9999 && balaVertical.position.x > 30.0 ) {
            moverEjeXJugador(moverseDerecha, 200, 'r');
          } else {
            moverEjeXJugador(moverseIzquierda, 200, 'l');
          }
        } else { //+ Si la red NO tiene un valor claro nos quedamos "neutros"
          console.log(jugador.position.x - balaVertical.position.x);
          diff = jugador.position.x - balaVertical.position.x;
          if (diff > -20 && diff < -24 && diff !== 0 ) {
            moverEjeXJugador(moverseIzquierda, 200, 'l');
          } else if (diff > 0 && diff < -2 && diff !== 0) {
            moverEjeXJugador(moverseDerecha, 200, 'r');
          } else {
            jugador.body.velocity.x = 0; 
          }
        }
      }
      //*****************************************************************************************/
    } else { //? Movimiento manual del jugador
      console.log(balaVertical.position.x);
      if (salto.isDown && jugador.body.onFloor()) {//+ Accion Saltar
        saltar();
      }
      if (jugadorD) {
        if (teclaIzquierda.isDown) { //+ Accion Movimiento Izquierda
          moverEjeXJugador(moverseIzquierda, 200, 'l');
        } else if (teclaDerecha.isDown) { //+ Accion Movimiento Derecha
          moverEjeXJugador(moverseDerecha, 200, 'r');
        }
      } 
    }
  }
  
  function moverEjeXJugador(funcionMove, duracion, direccion) {
    if (typeof funcionMove !== 'function') {
      console.error('funcionMove no es una función');
    }
    jugadorD = false;
    let intervalo = setInterval(() => {
        funcionMove()
    }, 0);
    // Detener después de la duración especificada
    setTimeout(() => {
        clearInterval(intervalo);
        if (direccion === 'r') {
          moverEjeXJugador(moverseIzquierda, duracion, 'salir')
        } else if (direccion === 'l') {
          console.log('izquierdita');
          moverEjeXJugador(moverseDerecha, duracion, 'salir')
        } else if (direccion === 'salir') {
          moverEjeXJugador(moverseNeutro, duracion, '')
        } else {
          jugadorD = true;
          jugador.position.x = 69.999;
        }
    }, duracion);
  }
  
  function saltar() {
    jugador.body.velocity.y = -270;
  }
  
  function moverseDerecha() {
    // console.log('hola1');
    jugador.body.velocity.x = 350;
  }
  
  function moverseIzquierda() {
    // console.log('hola2');
    jugador.body.velocity.x = -350;
  }
  
  function moverseNeutro() {
    // console.log('hola3');
    jugador.body.velocity.x = 0;
  }
  
  function gestionarDisparos() {
    if (!balaD) {
      // disparo();
    } else if (bala.position.x <= 0) {
      resetVariables();
    }
    // Gestionar la bala vertical
    if (!balaVerticalD) {
      disparoVertical();
    } else if (balaVertical.position.y >= 380) {
      // Reiniciar la bala vertical si toca el suelo
      resetVariablesBalaVertical();
    }
  }
  
  function disparo() {
    velocidadBala = -1 * velocidadRandom(400, 600);
    bala.body.velocity.y = 0;
    bala.body.velocity.x = velocidadBala;
    balaD = true;
  }
  
  // Función para el disparo vertical
  function disparoVertical() {
    velocidadBalaV = 1 * velocidadRandom(150, 300);
    balaVertical.body.velocity.y = velocidadBalaV; // Velocidad vertical aleatoria
    balaVertical.position.x = jugador.position.x; // Posicionar la bala encima del jugador
    posicionXBalaV = balaVertical.position.x; // Obtener la posicion en X de la Bala Vertical (Para el aprendizaje)
    balaVertical.position.y = 0; // Iniciar desde la parte superior de la pantalla
    balaVerticalD = true;
  }
  
  function resetVariables() {
    jugador.body.velocity.setTo(0, 0);
    bala.body.velocity.x = 0;
    bala.position.x = config.width - 100;
    balaD = false;
  }
  
  // Función para resetear las variables de la bala vertical
  function resetVariablesBalaVertical() {
    balaVertical.body.velocity.y = 0;
    balaVertical.position.y = 0;
    balaVerticalD = false;
    diff = 0;
  }
  
  function resetVariablesNuevoJuego() {
    jugador.body.velocity.setTo(0, 0);
    jugador.position.x = 69.999;
  
    bala.body.velocity.setTo(0, 0);
    bala.position.x = config.width - 100;
    balaD = false;
    jugadorD = true;
  
    balaVertical.body.velocity.setTo(0, 0);
    balaVertical.position.y = 0;
    balaVerticalD = false;
    inversionMov = false;
    diff = 0;
  }
  
  function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function colisionH() {
    pausa();
  }
  
  function pausa() {
    juego.paused = true;
    menu = juego.add.sprite(config.width / 2, config.height / 2, "menu");
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
      if (
        mouse_x > menu_x1 &&
        mouse_x < menu_x2 &&
        mouse_y > menu_y1 &&
        mouse_y < menu_y2
      ) {
        // Modo manual
        if (
          mouse_x >= menu_x1 &&
          mouse_x <= menu_x2 &&
          mouse_y >= menu_y1 &&
          mouse_y <= menu_y1 + 90
        ) {
          eCompleto = false;
          // datosEntrenamiento = [];
          modoAuto = false;
        }
        // Modo automático
        else if (
          mouse_x >= menu_x1 &&
          mouse_x <= menu_x2 &&
          mouse_y >= menu_y1 + 90 &&
          mouse_y <= menu_y2
        ) {
          if (!eCompleto) {
            console.log(
              "RED 1 Entrenamiento con " + datosEntrenamiento.length + " valores"
            );
            console.log(
              "RED 2 Entrenamiento con " + datosEntrenamiento2.length + " valores"
            );
            enRedNeural();
            eCompleto = true;
          }
          modoAuto = true;
        }
  
        // Quitar el menú y reanudar el juego
        resetVariablesNuevoJuego();
        menu.destroy();
        juego.paused = false;
      }
    }
  }
  