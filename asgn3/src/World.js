var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix; // <-- Removed the space here
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

 // Fragment shader program
 var FSHADER_SOURCE = `
   precision mediump float;
   varying vec2 v_UV;
   uniform vec4 u_FragColor;
   uniform sampler2D u_Sampler0;
   uniform sampler2D u_Sampler1;
   uniform sampler2D u_Sampler2;
   uniform sampler2D u_Sampler3;
   uniform int u_whichTexture;
   uniform float u_texColorWeight;
   void main() {    
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    }
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }
    else if (u_whichTexture == 0) {
      vec4 texColor = texture2D(u_Sampler0, v_UV);
      gl_FragColor = (1.0 - u_texColorWeight) * u_FragColor + u_texColorWeight * texColor;
    }
    else if (u_whichTexture == 1) {
       gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else if (u_whichTexture == 2) {
       gl_FragColor = texture2D(u_Sampler2, v_UV);
    }
    else if (u_whichTexture == 3) {
       gl_FragColor = texture2D(u_Sampler3, v_UV);
    }
    else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }

  }`
 let canvas;
 let gl;
 let a_Position;
 let a_UV;
 let u_FragColor;
 let u_Size;
 let u_ModelMatrix;
 let u_ProjectionMatrix;
 let u_ViewMatrix;
 let u_GlobalRotateMatrix;
 let u_Sampler0;
 let u_Sampler1;
 let u_Sampler2;
 let u_Sampler3;
 let u_whichTexture;
 let u_texColorWeight;
 let g_camera;
 let g_customBlocks = [];
 let g_enemies = [];
function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }


  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (!u_texColorWeight) {
    console.log('Failed to get the storage location of u_texColorWeight');
    return;
  }
}

let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_pinkAngle = 0;
let g_EyeAngle = 0;

function handleUI(){
  document.getElementById('ga').addEventListener('mousemove',  function () {g_globalAngle = this.value; renderAllShapes();});
  document.getElementById('ya').addEventListener('mousemove',  function () {g_yellowAngle = this.value; renderAllShapes();});
  document.getElementById('pa').addEventListener('mousemove',  function () {g_pinkAngle = this.value; renderAllShapes();});
  document.getElementById('ey').addEventListener('mousemove',  function () {g_EyeAngle = this.value; renderAllShapes();});

}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  g_camera = new Camera();
  handleUI();  
  initTextures();
  document.onkeydown = keydown;
  canvas.onmousedown = function(ev) {
    g_lastX = ev.clientX;
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    canvas.requestPointerLock();
  };
  canvas.onmousemove = function(ev) {
    if (g_gameOver) return;
    if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
      
      // Grab both X and Y movements
      let deltaX = ev.movementX;
      let deltaY = ev.movementY; 

      let sensitivity = 0.2; 
      let alphaX = deltaX * sensitivity;
      let alphaY = deltaY * sensitivity; // Calculate pitch angle

      // Turn the camera left/right
      g_camera.panRight(alphaX); 
      
      // Tilt the camera up/down
      // (Depending on how your brain works, you might need to make this -alphaY to invert the Y-axis!)
      g_camera.panUp(-alphaY); 
      
      renderAllShapes();
    }
    
  };
  
  
 gl.clearColor(0.0, 0.0, 0.0, 1.0);
 
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  renderAllShapes();
  setInterval(spawnEnemy, 5000);

  requestAnimationFrame(tick);

}

let g_gameOver = false;

function updateEnemies() {
  if (g_gameOver) return;

  let px = g_camera.eye.elements[0];
  let pz = g_camera.eye.elements[2];
  let speed = 0.005;

  for (let i = g_enemies.length - 1; i >= 0; i--) {
    let e = g_enemies[i];
    
    let dx = px - e.x;
    let dz = pz - e.z;
    let dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.6) {
      g_gameOver = true;
      document.getElementById('gameOverScreen').style.display = 'block';
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
      return;
    }

    let touchedBlock = false;
    for (let j = 0; j < g_customBlocks.length; j++) {
      let b = g_customBlocks[j];
      
      if (e.x >= b.x - 0.25 && e.x <= b.x + 0.75 &&
          e.z >= b.z - 0.25 && e.z <= b.z + 0.75) {
        touchedBlock = true;
        break;
      }
    }

    if (touchedBlock) {
      g_enemies.splice(i, 1);
      continue;
    }

    let moveX = (dx / dist) * speed;
    let moveZ = (dz / dist) * speed;
    let buffer = 0.2;

    let checkX = e.x + moveX + (moveX > 0 ? buffer : -buffer);
    if (!g_camera.isSolid(checkX, e.z)) {
      e.x += moveX;
    }

    let checkZ = e.z + moveZ + (moveZ > 0 ? buffer : -buffer);
    if (!g_camera.isSolid(e.x, checkZ)) {
      e.z += moveZ;
    }
  }
}

var g_st = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_st;

function tick(){
  g_seconds = performance.now()/1000.0 - g_st;
  //console.log(performance.now());
  updateEnemies();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function initTextures() {
  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create the image0 object');
    return false;
  }
  image0.onload = function(){ loadTexture0(image0); };
  image0.src = '../textures/marble.jpg';// add cyan for interpolation

  var image1 = new Image(); 
  if (!image1) {
    console.log('Failed to create the image1 object');
    return false;
  }
  image1.onload = function(){ loadTexture1(image1); };
  image1.src = '../textures/sky.jpg'; 

  var image2 = new Image(); 
  if (!image2) {
    console.log('Failed to create the image2 object');
    return false;
  }
  image2.onload = function(){ loadTexture2(image2); };
  image2.src = '../textures/enemy.jpg'; 

    var image3 = new Image(); 
  if (!image3) {
    console.log('Failed to create the image3 object');
    return false;
  }
  image3.onload = function(){ loadTexture3(image3); };
  image3.src = '../textures/block.jpg'; 

  return true;
}

function loadTexture0(image) {
  
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
}

function loadTexture1(image) {
  
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
}

function loadTexture2(image) {
  
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler2, 2);
}


function loadTexture3(image) {
  
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE3);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler3, 3);
}


var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

function drawMap() {
  var body = new Cube();
  body.color = [0.0, 1.0, 1.0, 1.0];
  body.textureNum = 0;
  body.textureWeight = 0.85;

  for (x = 0; x < g_map.length; x++) {
    for (y = 0; y < g_map[x].length; y++) {
      if (g_map[x][y] == 1) {
        body.matrix.setIdentity();
        body.matrix.translate(x - 16, -.75, y - 16); 
        //body.matrix.scale(0.5, 0.5, 0.5);
        body.render(); 
      }
    }
  }
}

function spawnEnemy() {
  if (g_enemies.length >= 20) return;

  let spawned = false;
  let attempts = 0;
  
  while (!spawned && attempts < 100) {
    let rx = Math.floor(Math.random() * 32);
    let rz = Math.floor(Math.random() * 32);

    if (g_map[rx][rz] === 0) {
      let worldX = rx - 15.5;
      let worldZ = rz - 15.5;

      g_enemies.push({
        x: worldX,
        z: worldZ
      });
      spawned = true;
    }
    attempts++;
  }
}

function drawEnemies() {
  var enemy = new Cube();
  enemy.color = [0.8, 0.0, 0.8, 1.0]; 
  enemy.textureNum = 2;

  for (let i = 0; i < g_enemies.length; i++) {
    let e = g_enemies[i];
    
    enemy.matrix.setIdentity();
    enemy.matrix.translate(e.x - 0.25, -.75, e.z - 0.25);
    enemy.matrix.scale(0.5, 1.5, 0.5);
    
    enemy.render();
  }
}

function renderAllShapes() {
  var start_time = performance.now();
  
  // Pass the projection matrix
  var projMat=new Matrix4();
  projMat.setPerspective (50, 1*canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

// Pass the view matrix dynamically from the live camera
  var viewMat=new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Pass them to the GPU
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);




  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

    
  // Draw Map  
  drawMap();
  drawCustomBlocks();
  drawEnemies();

  // Draw the floor
  var body = new Cube();
  body.color = [0.0,1.0,0.2,1.0];
  body.textureNum=-2;
  body.matrix.translate(0, -.75, 0.0);
  body.matrix.scale(32, 0, 32);
  body.matrix.translate (-.5, 0, -0.5);
  body.render();

  // Draw the body cube
  var box = new Cube();
  box.color = [1.0,0.0,0.0,1.0];
  box.textureNum=0;
  box.textureWeight = 1.0;
  box.matrix.translate(-.25, -.75, -3.0);
  box.matrix.rotate(-5,1,0,0);
  box.matrix.scale(0.5, .3, .5);
  box.render();


  var sky = new Cube();
  sky.textureNum = 1;
  sky.matrix.scale(32,32,32);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  var duration = performance.now() - start_time;
  
  // Prevent divide-by-zero errors if duration is 0
  var fps = 0;
  if (duration !== 0) {
    fps = 10000 / duration; 
  }
  
  // Send the result to the <p id="stats"> tag in your HTML
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(fps), "stats");
  updateCrosshair();
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function keydown(ev) {
  if (g_gameOver) return;
  // set movement speed & panning degree
  let speed = 0.2; 
  let alpha = 5;

  if (ev.key === 'w' || ev.key === 'W') {
    g_camera.moveForward(speed);
  } else if (ev.key === 's' || ev.key === 'S') {
    g_camera.moveBackwards(speed);
  } else if (ev.key === 'a' || ev.key === 'A') {
    g_camera.moveLeft(speed);
  } else if (ev.key === 'd' || ev.key === 'D') {
    g_camera.moveRight(speed);
  } else if (ev.key === 'q' || ev.key === 'Q') {
    g_camera.panLeft(alpha);
  } else if (ev.key === 'e' || ev.key === 'E') {
    g_camera.panRight(alpha);
  }
//ENTITY BUILDING CONTROLS (F to build, G to destroy)
  else if (ev.key === 'f' || ev.key === 'F' || ev.key === 'g' || ev.key === 'G') {
    
    // Calculate the Forward vector
    let f = new Vector3();
    f.set(g_camera.at);
    f.sub(g_camera.eye);
    f.normalize(); 

    // Project a target point in 3D space (this is your "cursor")
    let reach = 2.0; 
    let targetX = g_camera.eye.elements[0] + (f.elements[0] * reach);
    let targetY = g_camera.eye.elements[1] + (f.elements[1] * reach); // We use actual Y now!
    let targetZ = g_camera.eye.elements[2] + (f.elements[2] * reach); 

    // PLACE BOX
    if (ev.key === 'f' || ev.key === 'F') {
      g_customBlocks.push({ x: targetX, y: targetY, z: targetZ });
    } 
    
    // DESTROY BOX
    else if (ev.key === 'g' || ev.key === 'G') {
      // Find the closest box to our "cursor"
      let closestIndex = -1;
      let closestDist = 999; // Start with a huge dummy number

      for (let i = 0; i < g_customBlocks.length; i++) {
        let b = g_customBlocks[i];
        
        // Basic 3D distance math (Pythagorean theorem)
        let dx = b.x - targetX;
        let dy = b.y - targetY;
        let dz = b.z - targetZ;
        let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        // If the box is within 0.8 units of our cursor, consider it a "hit"
        if (dist < 0.8 && dist < closestDist) { 
          closestDist = dist;
          closestIndex = i;
        }
      }

      // If we found a box under our cursor, delete it from the list!
      if (closestIndex !== -1) {
        g_customBlocks.splice(closestIndex, 1);
      }
    }
  }

  // redraw scene to show new camera pos
  renderAllShapes();
}

function drawCustomBlocks() {
  var box = new Cube();
  box.color = [1.0, 0.0, 0.0, 1.0];
  box.textureNum = 3;
  box.textureWeight = 1.0;

  for (let i = 0; i < g_customBlocks.length; i++) {
    let pos = g_customBlocks[i]; // Get the saved X, Y, Z
    
    box.matrix.setIdentity();
    // Move the box to where the user clicked!
    box.matrix.translate(pos.x, pos.y, pos.z); 
    
    // Apply your custom tilt and scale
    box.matrix.rotate(-5, 1, 0, 0);
    box.matrix.scale(0.5, 0.3, 0.5);
    
    box.render();
  }
}

function updateCrosshair() {
  let crosshair = document.getElementById('crosshair');
  if (!crosshair) return;

  // 1. Figure out exactly where the camera is looking
  let f = new Vector3();
  f.set(g_camera.at);
  f.sub(g_camera.eye);
  f.normalize(); 

  // Use the exact same reach distance you used in your keydown function!
  let reach = 2.0; 
  let targetX = g_camera.eye.elements[0] + (f.elements[0] * reach);
  let targetY = g_camera.eye.elements[1] + (f.elements[1] * reach);
  let targetZ = g_camera.eye.elements[2] + (f.elements[2] * reach); 

  // 2. Check if there is a block at that target spot
  let hoveringOverBlock = false;
  for (let i = 0; i < g_customBlocks.length; i++) {
    let b = g_customBlocks[i];
    let dx = b.x - targetX;
    let dy = b.y - targetY;
    let dz = b.z - targetZ;
    let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

    // If a block is within 0.8 units of our cursor, we are targeting it!
    if (dist < 0.8) { 
      hoveringOverBlock = true;
      break; 
    }
  }

  // 3. Update the UI colors
  if (hoveringOverBlock) {
    crosshair.style.color = "red";   // Red means destroy
  } else {
    crosshair.style.color = "white"; // White means build
  }
}