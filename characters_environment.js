
/*=================================
=            Variables            =
=================================*/

/* Variables del personaje principal */
var ninja, bricks,clouds,mountains,enemyMushrooms,pipes,platforms,coins;

/* Variables de control */
var control={
  up: "UP_ARROW", // 32=spaceBar
  left: 'LEFT_ARROW',
  right: 'RIGHT_ARROW',
  revive: 32
}

//Estado interno del juego, que podría afectar al equilibrio del juego o a la jugabilidad.
var gameConfig={
  
  // empezar, jugar, perder
  status: "start", 
  
  // vidas iniciales del ninja
  initialLifes: 4,

  // velocidad de los movimientos del personaje
  moveSpeed: 5,
  enemyMoveSpeed: 1,

  // gravedad y velocidad de salto para todos los personajes
  gravity: 1,
  gravityEnemy: 10,
  jump:-15,

  // punto de partida del personaje
  startingPointX: 500,
  startingPointY: 0,

  // tamaño del lienzo por defecto
  screenX:1240,
  screenY:336,

  // puntajes
  timeScores: 0,
  scores: 0
}


/*=====  Fin de las variables  ======*/


/*====================================
=        Estatus del jeugo           =
====================================*/
noseX = "";
noseY = "";
GameStatus = "";

function game(){

  console.log("noseX = " + noseX +" ,noseY =  "+ noseY);

  instializeInDraw();
  moveEnvironment(ninja);
  drawSprites();
  
  if(gameConfig.status==='start'){

    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);

    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("Press Play Button To Start The Game ", gameConfig.screenX/2, gameConfig.screenY/2);
    textSize(40);

    stroke(255);
    strokeWeight(7);
    noFill();

    changeGameStatud();
  }
  
  if(gameConfig.status==='play'){
    positionOfCharacter(ninja);
    enemys(enemyMushrooms);
    checkStatus(ninja);
    scores(ninja);
    manualControl(ninja);
  
  }

    // si el juego se termina 
  if(gameConfig.status==='gameover'){
    
    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);

    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("GAME OVER", gameConfig.screenX/2, gameConfig.screenY/2+105);
    textSize(15);
    text("Press SPACE to Restart", gameConfig.screenX/2, gameConfig.screenY/2+135);
    textSize(40);
    text(round(gameConfig.scores),gameConfig.screenX/2,gameConfig.screenY/2-35);
    text("points",gameConfig.screenX/2,gameConfig.screenY/2);

    stroke(255);
    strokeWeight(7);
    noFill();
    ellipse(gameConfig.screenX/2,gameConfig.screenY/2-30,160,160)
    changeGameStatud(ninja)
  }
}  

function startGame()
{
  GameStatus = "start";
  document.getElementById("status").innerHTML = "Game Is Loading";
}

// cambiar el estado del juego si se pulsa cualquier tecla
function changeGameStatud(character){
 if(noseX !="" && gameConfig.status==="start" && GameStatus=="start") { 
   document.getElementById("status").innerHTML = "Game Is Loaded";
   world_start.play();
 initializeCharacterStatus(ninja)
    gameConfig.status= "play"
  }
  if(gameConfig.status==="gameover" && keyDown(control.revive)) {
    gameConfig.status= "start"        
  }
}




/*=====  Fin del estatus del juego   ======*/


/*=============================================
=                 Inicializar                  =
=============================================*/

//inicializar
function instializeInSetup(character){
	frameRate(120);
	
	character.scale=0.35;
	initializeCharacterStatus(character)

  bricks.displace(bricks);
	platforms.displace(platforms);
	coins.displace(coins);
	coins.displace(platforms);
	coins.collide(pipes);
	coins.displace(bricks);		

  // cambiar la escala de las nubes
	clouds.forEach(function(element){
		element.scale=random(1,2);
	})
}

function initializeCharacterStatus(character){
  // establecer la configuración inicial del personaje  
  character.scale=0.35;
  character["killing"]=0; //mientras mata al enemigo
  character["kills"]=0;
  character["live"]=true;
  character["liveNumber"]=gameConfig.initialLifes;
  character["status"]='live';
  character["coins"]=0;
  character["dying"]=0;
  character.position.x=gameConfig.startingPointX;
  character.position.y=gameConfig.startingPointY;
}

function instializeInDraw(){
  background(109,143,252);
  
  //mientras mata
  if(ninja.killing>0){
    ninja.killing-=1;
  }else{
    ninja.killing=0;
  }
  
  // hacer que los objetos no se superpongan entre sí.
  pipes.displace(pipes);
  enemyMushrooms.displace(enemyMushrooms);
  enemyMushrooms.collide(pipes);
  clouds.displace(clouds);

  // hacer que el personaje no se superponga a otros objetos
  if(ninja.live){
    bricks.displace(ninja);
    pipes.displace(ninja);
    enemyMushrooms.displace(ninja);
    platforms.displace(ninja);
  }
  
  // character config initialize
  ninja["standOnObj"]=false;
  ninja.velocity.x=0;
  ninja.maxSpeed=20;

}

/*=====       Fin de la inicialización        ======*/



/*============================================
=           Elementos interactivos           =
============================================*/

// El personaje obtiene monedas
function getCoins(coin,character){
  if( character.overlap(coin) && character.live && coin.get==false){
    character.coins+=1;
    coin.get=true;
    ninja_coin.play();
  };
}
    
// Reaparece la moneda después de conseguir el goin.
function coinVanish(coin){
  if(coin.get){
    coin.position.x=random(50,gameConfig.screenX)+gameConfig.screenX;
    coin.get=false;
  };
}

/*=====  Fin de los elementos interactivos  ======*/


/*==========================================================
=    Configuración y control del personaje principal       =
===========================================================*/

/* Hacer que el personaje principal esté de pie sobre los objetos */
function positionOfCharacter(character){
  
  // No en la plataforma
  if(character.live){
    
    // Ver si al estar de pie en los ladrillos
    platforms.forEach(function(element){ standOnObjs(character,element); });
    bricks.forEach(function(element){ standOnObjs(character,element); });
    pipes.forEach(function(element){ standOnObjs(character,element); });
    
    // Personaje afectado por la gravedad
    falling(character);

    // Si el personaje sólo puede saltar si está sobre el objeto
    if(character.standOnObj) jumping(character);
      
  }

  // Evento de interacción con las monedas
  coins.forEach(function(element){
    getCoins(element,ninja);
    coinVanish(element);
  });

  // Evento de interacción EnemyMushrooms
  enemyMushrooms.forEach(function(element){
    StepOnEnemy(character,element);
    if((element.touching.left||element.touching.right)&&character.live&&character.killing===0) die(ninja);
    
  })

  // Hacer que se quede en la pantalla
  dontGetOutOfScreen(ninja);

}

/* Personaje en movimiento automático  */
function autoControl(character){
    character.velocity.x+=gameConfig.moveSpeed;
    character.changeAnimation('move');
    character.mirrorX(1);
}

/* Personaje de control manual */
function manualControl(character){
  
  if(character.live){
    if(noseX < 300){
      character.velocity.x-=gameConfig.moveSpeed;
      character.changeAnimation('move');
      character.mirrorX(-1);
    }

    if(noseX > 300){
        character.velocity.x+=gameConfig.moveSpeed;
      character.changeAnimation('move');
      character.mirrorX(1);
    }

    if(!keyDown(control.left)&&!keyDown(control.right)&&!keyDown(control.up)){ 
      character.changeAnimation('stand');
    }
  }
 
}

/* Movimientos del personaje */
function jumping(character){
	if( (noseY < 168  &&character.live) || (touchIsDown&&character.live) ){
    character.velocity.y+=gameConfig.jump;
    ninja_jump.play();
	}
}


/* Movimientos del personaje */
function falling(character){
	character.velocity.y += gameConfig.gravity;
  character.changeAnimation('jump');
}


/* Ver si obj1 se para sobre obj2, principalmente para ver si se para sobre los objcs */
function standOnObjs(obj1,obj2){
  
	var obj1_Left=leftSide(obj1);
	var obj1_Right=rightSide(obj1);
	var obj1_Up=upSide(obj1);
	var obj1_Down=downSide(obj1);

	var obj2_Left=leftSide(obj2);
	var obj2_Right=rightSide(obj2);
	var obj2_Up=upSide(obj2);
	var obj2_Down=downSide(obj2);

	if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7){
		// println("SI");
		obj1.velocity.y = 0;
		obj1.position.y=obj2_Up-(obj1.height/2)-1;
		obj1.standOnObj= true;
	}
}

/* Ver si obj1 pisa a obj2 para matarlo */
function StepOnEnemy(obj1,obj2){
  
	var obj1_Left=leftSide(obj1);
	var obj1_Right=rightSide(obj1);
	var obj1_Up=upSide(obj1);
	var obj1_Down=downSide(obj1);

	var obj2_Left=leftSide(obj2);
	var obj2_Right=rightSide(obj2);
	var obj2_Up=upSide(obj2);
	var obj2_Down=downSide(obj2);

	if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7 && obj2.live==true && obj2.touching.top){
		obj2.live=false;
    obj1.killing=30;
    obj1.kills++;
    if(obj1.velocity.y>=gameConfig.jump*0.8){
      obj1.velocity.y=gameConfig.jump*0.8;
    }else{
      obj1.velocity.y+=gameConfig.jump*0.8;
    }
    ninja_kick.play();
	}
}


// hacer que el personaje muera si es tocado por el enemigo
function die(character){
    character.live=false;
    character.dying+=120;
    character.liveNumber--;
    character.status="dead";
    character.changeAnimation('dead');
    character.velocity.y-=2;
    console.log("die - " + character.liveNumber);
    if(character.liveNumber > 0)
    {
      ninja_die.play();
    }
}

// comprobar el estado del personaje y la respuesta al sprite y al estado del juego
function checkStatus(character){    
  if(character.live==false){
    character.changeAnimation('dead');
    character.dying-=1;
    reviveAfterMusic(character);
  }
  if(character.live==false && character.liveNumber==0){
    gameConfig.status="gameover";
    ninja_gameover.play();
  }

}

// revivir después de morir la música terminó
function reviveAfterMusic(character){
  if( character.live === false && ninja.liveNumber !==0 && character.dying===0 ){
    character.live=true;
    character.status="live";
    character.position.x=500;
    character.position.y=40;
    character.velocity.y=0;
  }
}


/* Hacer que el personaje permanezca en la pantalla */
function dontGetOutOfScreen(character){
  
  //si el ninja cae en los agujeros 
  if(character.position.y>gameConfig.screenY&&character.live && character==ninja){
    die(ninja);
  }

  if(character.position.x>gameConfig.screenX-(character.width*0.5)){
  	character.position.x=gameConfig.screenX-(character.width*0.5);
  }else if(character.position.x<character.width*0.5){
    if(character==ninja){
      character.position.x=character.width*0.5;
    }else{ 
      character.live=false; 
    }
  }

}

/*=====  Fin de la configuración y el control del personaje principal ======*/


/*=============================================
=  Configuración y control de los enemigos   =
=============================================*/


function enemys(enemys){
    enemys.forEach(function(enemy){
      stateOfEnemy(enemy);
	    positionOfEnemy(enemy);
	    enemy.position.x-=gameConfig.enemyMoveSpeed;
  });
} 

// Comprobar el estado de los enemigos
function stateOfEnemy(enemy){
  if (enemy.live==false||enemy.position.y>gameConfig.screenY+50){
    enemy.position.x=random(gameConfig.screenX*1.5,2*gameConfig.screenX+50);
    enemy.position.y=random(gameConfig.screenY*0.35,gameConfig.screenY*0.75);
    enemy.live=true;
  }
}

/* Hacer que el enemigo se pare en los objetos */
function positionOfEnemy(enemy){

	platforms.forEach(function(element){ enemyStandOnObjs(enemy, element); });
	bricks.forEach(function(element){ enemyStandOnObjs(enemy, element);});
  pipes.forEach(function(element){ enemyStandOnObjs(enemy, element); })
	
	enemy.position.y+=gameConfig.gravityEnemy;

	dontGetOutOfScreen(enemy);
}


/* Ver si obj1 se para sobre obj2, principalmente para ver si se para sobre el objcs */
function enemyStandOnObjs(obj1,obj2){
  
  var obj1_Left=leftSide(obj1);
  var obj1_Right=rightSide(obj1);
  var obj1_Up=upSide(obj1);
  var obj1_Down=downSide(obj1);

  var obj2_Left=leftSide(obj2);
  var obj2_Right=rightSide(obj2);
  var obj2_Up=upSide(obj2);
  var obj2_Down=downSide(obj2);

  if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7){
    // println("SI");
    obj1.velocity.y = 0;
    obj1.position.y=obj2_Up-(obj1.height);
  }
}



/*=====  Fin del ajuste y control del enemigo ======*/


/*===================================
=            Entorno            =
===================================*/

// llamar a todas las funciones de desplazamiento del entorno 
function moveEnvironment(character){
  var environmentScrollingSpeed=gameConfig.moveSpeed*0.3; 
  
  if(gameConfig.status==='play'){
    environmentScrolling(platforms,environmentScrollingSpeed);
    environmentScrolling(bricks,environmentScrollingSpeed);
    environmentScrolling(clouds,environmentScrollingSpeed*0.5);
    environmentScrolling(mountains,environmentScrollingSpeed*1.3); 
    environmentScrolling(pipes,environmentScrollingSpeed); 
    environmentScrolling(coins,environmentScrollingSpeed); 
    environmentScrolling(enemyMushrooms,environmentScrollingSpeed); 
    character.position.x-=environmentScrollingSpeed;
  }
}

// desplazar diferentes elementos en la pantalla
function environmentScrolling(group,environmentScrollingSpeed){
  group.forEach(function(element){
    if(element.position.x>-50){
      element.position.x-=environmentScrollingSpeed;
    }else{
      element.position.x=gameConfig.screenX+50;
      
      //si el grupo es de bloques, aleatorizar su posición y
      if(group===bricks){
        element.position.y=random(gameConfig.screenY*0.35,gameConfig.screenY*0.75);
      }

      //si el grupo es de bloques o montañas, aleatoriza su posición x
      if(group===pipes||group===mountains){
        element.position.x=random(50,gameConfig.screenX)+gameConfig.screenX;
      }

      //si el grupo está nublado, aleatorizar su posición x e y
      if(group===clouds){
        element.position.x=random(50,gameConfig.screenX)+gameConfig.screenX;
        element.position.y=random(0,gameConfig.screenY*0.5);
        element.scale=random(0.3,1.5);
      }

      if(group===coins){
        element.position.x=random(0,gameConfig.screenX)+gameConfig.screenX;
        element.position.y=random(gameConfig.screenY*0.2,gameConfig.screenY*0.8);
      }

    }

  })
}

/*=====  Fin del entorno  ======*/


/*=====================================
=            Para Depurar            =
=====================================*/

/* para el estado de posición del personaje */
function debugging(character){
	strokeWeight(1);
	fill(255);
	textSize(12);
  text(character.dying, 20,20);
	text(gameConfig.status, 20,80);
	// texto("v: "+character.velocity.y,150,20);
	noFill();
	// outline(tube01);
	stroke(251);
	strokeWeight(2);
	outline(character);

	pipes.forEach(function(element){ outline(element); });
  enemyMushrooms.forEach(function(element){ outline(element); });

}


// calcular los resultados de cada juego
function scores(character){

  strokeWeight(0);
  fill(255, 255, 255, 71);
  textSize(40);

  gameConfig.scores=character.coins+character.kills+gameConfig.timeScores;


  if(character.live&&gameConfig.status==='play') gameConfig.timeScores+=0.05;
  
  text("scores: "+round(gameConfig.scores),20,40);
  text("lives: "+character.liveNumber,20,80);

  if(ninja.live==false && ninja.liveNumber!=0){
    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);
    
    strokeWeight(7);
    noFill();
    
    stroke(255);
    ellipse(gameConfig.screenX/2,gameConfig.screenY/2-30,150,150)

    stroke("red");
    var ratio=(character.liveNumber/gameConfig.initialLifes);
    arc(gameConfig.screenX/2,gameConfig.screenY/2-30,150,150, PI+HALF_PI,(PI+HALF_PI)+(TWO_PI*ratio));
    fill(255, 255, 255);
    noStroke();
    textAlign(CENTER);
    textSize(40);
    text(round(character.liveNumber),gameConfig.screenX/2,gameConfig.screenY/2-35);
    text("lives",gameConfig.screenX/2,gameConfig.screenY/2);

    
  }


}

/* hacer el contorno del objeto */
function outline(obj){ rect(leftSide(obj),upSide(obj),rightSide(obj)-leftSide(obj),downSide(obj)-upSide(obj));}

/* obtener la posición de cada lado del objeto */
function leftSide(obj){ return obj.position.x-(obj.width/2);}
function rightSide(obj){ return obj.position.x+(obj.width/2);}
function upSide(obj){ return obj.position.y-(obj.height/2);}
function downSide(obj){ return obj.position.y+(obj.height/2);}

/*=====  Fin de Para la depuración  ======*/


