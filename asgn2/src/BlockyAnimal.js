// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform float u_size;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_PointSize = u_size;
  }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

}
function initCubeBuffer() {
  // Pack ALL 36 vertices into a single Float32Array
  g_cubeVertices = new Float32Array([
    // Front face
    0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0,
    0.0,0.0,0.0,  0.0,1.0,0.0,  1.0,1.0,0.0,
    // Top face
    0.0,1.0,0.0,  0.0,1.0,1.0,  1.0,1.0,1.0,
    0.0,1.0,0.0,  1.0,1.0,1.0,  1.0,1.0,0.0,
    // Right face
    1.0,0.0,0.0,  1.0,1.0,1.0,  1.0,1.0,0.0,
    1.0,0.0,0.0,  1.0,0.0,1.0,  1.0,1.0,1.0,
    // Left face
    0.0,0.0,0.0,  0.0,1.0,1.0,  0.0,1.0,0.0,
    0.0,0.0,0.0,  0.0,0.0,1.0,  0.0,1.0,1.0,
    // Bottom face
    0.0,0.0,0.0,  1.0,0.0,1.0,  1.0,0.0,0.0,
    0.0,0.0,0.0,  0.0,0.0,1.0,  1.0,0.0,1.0,
    // Back face
    0.0,0.0,1.0,  1.0,1.0,1.0,  1.0,0.0,1.0,
    0.0,0.0,1.0,  0.0,1.0,1.0,  1.0,1.0,1.0
  ]);

  // Create the buffer object ONCE
  g_vertexBuffer = gl.createBuffer();
  if (!g_vertexBuffer) {
    console.log('Failed to create the buffer object');
    return;
  }

  // Bind and send data ONCE
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, g_cubeVertices, gl.STATIC_DRAW); // Use STATIC_DRAW because it doesn't change
}
function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_size = gl.getUniformLocation(gl.program, 'u_size');
  if (!u_size) {
    console.log('Failed to get the storage location of u_size');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedcolor = [1.0, 1.0, 1.0, 1.0]; 
let g_selectedsize = 5;
let g_selectedtype = POINT;
let g_selectedseg = 1;
let myGame = new Game();
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_pinkAngle = 0;
let g_EyeAngle = 0;
let g_forwardA = 0;
let g_yAnim = false;
let g_pAnim = false;
let g_walk = false;
let g_eye  = false;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_isCrying = false;
let g_cryStartTime = 0;
function handleUI(){
  document.getElementById('red').onclick = function () {g_selectedcolor = [1.0, 0.0, 0.0, 1.0];};
  document.getElementById('green').onclick = function () {g_selectedcolor = [0.0, 1.0, 0.0, 1.0];};

  document.getElementById('rs').addEventListener('mouseup',  function () {g_selectedcolor[0] = this.value/100;});
  document.getElementById('gs').addEventListener('mouseup',  function () {g_selectedcolor[1] = this.value/100;});
  document.getElementById('bs').addEventListener('mouseup',  function () {g_selectedcolor[2] = this.value/100;});

  document.getElementById('pb').onclick = function () {g_selectedtype = POINT};
  document.getElementById('tb').onclick = function () {g_selectedtype = TRIANGLE};
  document.getElementById('cb').onclick = function () {g_selectedtype = CIRCLE};
  
  document.getElementById('ss').addEventListener('mouseup',  function () {g_selectedsize = this.value;});
  document.getElementById('se').addEventListener('mouseup',  function () {g_selectedseg = this.value;});
  document.getElementById('clear').onclick = function () {g_shapesList = []; renderAllShapes();};
  document.getElementById('drawPictureButton').onclick = drawMyPicture;

  document.getElementById('start').onclick = function() {
    g_shapesList = [];
    myGame.start();
    renderAllShapes();
  };
 document.getElementById('stop').onclick = function() {
    g_shapesList = [];
    myGame.stop();
    renderAllShapes();
 };

  document.getElementById('ga').addEventListener('mousemove',  function () {g_globalAngleY = this.value; renderAllShapes();});
  document.getElementById('ya').addEventListener('mousemove',  function () {g_yellowAngle = this.value; renderAllShapes();});
  document.getElementById('pa').addEventListener('mousemove',  function () {g_pinkAngle = this.value; renderAllShapes();});
  document.getElementById('ey').addEventListener('mousemove',  function () {g_EyeAngle = this.value; renderAllShapes();});



  document.getElementById('yon').onclick = function () {g_yAnim = true;};
  document.getElementById('yoff').onclick = function () {g_yAnim = false;};

  document.getElementById('pon').onclick = function () {g_pAnim = true;};
  document.getElementById('poff').onclick = function () {g_pAnim = false;};
  document.getElementById('walkon').onclick = function () {g_walk = true;};
  document.getElementById('walkoff').onclick = function () {g_walk = false;};
   document.getElementById('eon').onclick = function () {g_eye = true;};
  document.getElementById('eoff').onclick = function () {g_eye = false;};
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  initCubeBuffer();
  handleUI();  
  // Register function (event handler) to be called on a mouse press

  canvas.onmousedown = function(ev) {
  // Check for the Shift-Click first!
  if (ev.shiftKey) {
    g_isCrying = true;
    g_cryStartTime = performance.now() / 1000.0; // Record exactly when the crying started
    return; // Stop here so it doesn't trigger your rotation code
  }
  };
  canvas.onmousemove = function(ev) {
  if (ev.shiftKey && ev.buttons == 1) {
    g_isCrying = true;
    g_cryStartTime = performance.now() / 1000.0; // Record exactly when the crying started
    return; // Stop here so it doesn't trigger your rotation code
  }
  if (ev.buttons == 1 && (!ev.shiftKey)) {
    var x = ev.clientX; 
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect();

    let webglX = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    let webglY = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    g_globalAngleX = -webglY * 180;
    g_globalAngleY = webglX * 180;
  }
  };
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  renderAllShapes();
  requestAnimationFrame(tick);
}
var g_st = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_st;

function tick(){
  g_seconds = performance.now()/1000.0 - g_st;
  uAA();
  console.log(performance.now());
  renderAllShapes();
  requestAnimationFrame(tick);
}

function handleClicks(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x,y]);
}


function uAA(){
  if(g_yAnim){g_yellowAngle = 45 * Math.sin(g_seconds);}
  if(g_pAnim){g_pinkAngle = 45 * Math.sin(g_seconds);}
  if(g_eye){g_EyeAngle = 45 * Math.sin(3*g_seconds);}
  if(g_walk){
    g_yellowAngle = 2 * Math.sin(g_seconds);
    g_pinkAngle = 2 * Math.sin(g_seconds);
    g_forwardA = 10 * Math.sin(g_seconds);
  }
  
}


function renderAllShapes() {
  var start_time = performance.now();
var globalRotMat = new Matrix4()
  .rotate(g_globalAngleX, 1, 0, 0)
  .rotate(g_globalAngleY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let pink  = [0.95, 0.65, 0.65, 1.0];
  let dark  = [0.2, 0.2, 0.2, 1.0];



  var torsoMat = new Matrix4();
  torsoMat.translate(0.0, -0.1, 0.0); 
  
  var torso = new Cube();
  torso.color = pink;
  torso.matrix = new Matrix4(torsoMat);

  torso.matrix.translate(-0.3, -0.1, -0.25);
  torso.matrix.rotate(-g_yellowAngle, 0,0,1);
  var coor = new Matrix4(torso.matrix);
  torso.matrix.scale(0.6, 0.3, 0.6);
  torso.render();

  let pole = new Cylinder();
  pole.color = dark;
  pole.matrix = new Matrix4(coor);
  pole.matrix.scale(0.4,0.4,0.4);
  pole.matrix.translate(0.5,0.5,0.5);
  pole.matrix.rotate(-5,0,0,1);
  pole.render();

  var head = new Cube();
  head.color = pink;
  head.matrix = new Matrix4(coor); // Attach to torso
  var headBaseMat = new Matrix4(head.matrix);
  head.matrix.scale(0.4, 0.3, 0.3);
  head.matrix.translate(0.2, -0.1, -1);
  head.matrix.rotate(g_pinkAngle, 0, 1, 0);
  head.render();

var legPositions = [
  [0.2, -0.2],   
  [-0.2, -0.2],  
  [0.2, 0.2],    
  [-0.2, 0.2]    
];

for (var i = 0; i < legPositions.length; i++) {
  var leg = new Cube();
  leg.color = pink;
  leg.matrix.translate(legPositions[i][0], -0.45, legPositions[i][1]);
  var legMat = new Matrix4(leg.matrix);
  
  leg.matrix.scale(0.15, 0.25, 0.2);
  leg.matrix.translate(-0.5, 0, -0.5);
  if(i == 0 || i == 2){leg.matrix.rotate(g_forwardA, 1,0,0);}
  else{leg.matrix.rotate(-g_forwardA, 1,0,0);}
  leg.render();

  var hoof = new Cube();
  hoof.color = dark; 
  hoof.matrix = new Matrix4(legMat); 
  hoof.matrix.scale(0.15, 0.1, 0.21); 
  hoof.matrix.translate(-0.5, -1.0, -0.5);
  if(i == 0 || i == 2){hoof.matrix.rotate(g_forwardA, 1,0,0);}
  else{hoof.matrix.rotate(-g_forwardA, 1,0,0);}
  hoof.render();
}
var eyepos = [[0.4, 0.15], [0.2, 0.15]];
  for (var i = 0; i < eyepos.length; i++) {
    var eyes = new Cube();
    eyes.color = [0.0, 0.0, 0.0, 1.0];
    eyes.matrix = new Matrix4(headBaseMat);
    eyes.matrix.translate(eyepos[i][0], eyepos[i][1], -0.35); 
    
    eyes.matrix.scale(0.05, 0.05, 0.05);
    eyes.matrix.translate(-0.5, -0.5, -0.5);
    eyes.matrix.rotate(-g_EyeAngle, 0,0,1);
    eyes.render();
  }

  if (g_isCrying) {
    
    let colorBlue = [0.2, 0.5, 1.0, 1.0]; // Water/Tear color
    
    let timeElapsed = (performance.now() / 1000.0) - g_cryStartTime;
    
    if (timeElapsed > 3.0) {
      g_isCrying = false;
    } else {
      let tearDropY = (timeElapsed * 1.5) % 0.5; 

      var tearPositions = [
        [0.4, 0.05 - tearDropY, -0.4],
        [0.2, 0.05 - tearDropY, -0.4]
      ];

      for (var i = 0; i < tearPositions.length; i++) {
        var tear = new Cube();
        tear.color = colorBlue;
        
        tear.matrix = new Matrix4(headBaseMat); 
        
        tear.matrix.translate(tearPositions[i][0], tearPositions[i][1], tearPositions[i][2]);
        
        tear.matrix.scale(0.03, 0.08, 0.03); 
        tear.matrix.translate(-0.5, -0.5, -0.5);
        tear.render();
      }
    }
  }

  var dur = performance.now() - start_time;
  sendTextToHTML("ms: " + Math.floor(dur) + " fps: " + Math.floor(10000/dur), "stats");
}

function sendTextToHTML(text, htmlid){
  var e = document.getElementById(htmlid);
  e.innerHTML = text;
}

function click(ev) {
  [x,y] = handleClicks(ev);

  if (myGame.isActive){
    let hit = myGame.checkHit(x, y);
    if (hit) {renderAllShapes(); return;}
  }
  
  let point;
  if(g_selectedtype == POINT){point = new Point();}
  else if(g_selectedtype == TRIANGLE){
    point = new Triangle();  
  }
  else{point = new Circle(g_selectedseg);}
  point.position = [x,y];
  point.color = g_selectedcolor.slice();
  point.size = g_selectedsize;
  g_shapesList.push(point);
  
  renderAllShapes();
}

function drawMyPicture() {
  //bodies
  gl.uniform4f(u_FragColor, 0.88, 0.88, 0.88, 1.0); 
  
  // queen
  drawTriangle([-0.75, -0.4, -0.25, -0.4, -0.65, -0.2]);
  drawTriangle([-0.25, -0.4, -0.35, -0.2, -0.65, -0.2]);
  drawTriangle([-0.6, -0.2, -0.4, -0.2, -0.575, 0.1]);
  drawTriangle([-0.4, -0.2, -0.425, 0.1, -0.575, 0.1]);
  drawTriangle([-0.65, 0.1, -0.35, 0.1, -0.5, 0.025]);
  drawTriangle([-0.65, 0.1, -0.35, 0.1, -0.575, 0.175]);
  drawTriangle([-0.35, 0.1, -0.425, 0.175, -0.575, 0.175]);
  
  // king
  drawTriangle([0.3, -0.4, 0.7, -0.4, 0.3, -0.2]);
  drawTriangle([0.7, -0.4, 0.3, -0.2, 0.7, -0.2]);
  drawTriangle([0.35, -0.2, 0.65, -0.2, 0.45, 0.0]);
  drawTriangle([0.65, -0.2, 0.45, 0.0, 0.55, 0.0]);
  drawTriangle([0.45, 0.0, 0.55, 0.0, 0.35, 0.15]);
  drawTriangle([0.55, 0.0, 0.35, 0.15, 0.65, 0.15]);
  drawTriangle([0.35, 0.15, 0.65, 0.15, 0.25, 0.2]);
  drawTriangle([0.65, 0.15, 0.25, 0.2, 0.75, 0.2]);
  drawTriangle([0.25, 0.2, 0.75, 0.2, 0.4, 0.25]);
  drawTriangle([0.75, 0.2, 0.4, 0.25, 0.6, 0.25]);
  drawTriangle([0.35, 0.35, 0.65, 0.35, 0.5, 0.25]);
  drawTriangle([0.35, 0.35, 0.5, 0.35, 0.4, 0.45]);
  drawTriangle([0.65, 0.35, 0.5, 0.35, 0.6, 0.45]);


  // initials
  gl.uniform4f(u_FragColor, 0.86, 0.08, 0.24, 1.0); 
  
  // A
  drawTriangle([-0.6, -0.375, -0.55, -0.375, -0.5, -0.225]);
  drawTriangle([-0.4, -0.375, -0.45, -0.375, -0.5, -0.225]);
  drawTriangle([-0.54, -0.3, -0.46, -0.3, -0.53, -0.275]);
  drawTriangle([-0.46, -0.3, -0.47, -0.275, -0.53, -0.275]);
  drawTriangle([-0.525, 0.225, -0.475, 0.225, -0.5, 0.275]); // Crown Cutout

  // V
  drawTriangle([0.38, -0.25, 0.44, -0.25, 0.5, -0.36]);
  drawTriangle([0.62, -0.25, 0.56, -0.25, 0.5, -0.36]);

  // accessroeis
  gl.uniform4f(u_FragColor, 1.0, 0.84, 0.0, 1.0); 
  
  // crown
  drawTriangle([-0.575, 0.175, -0.55, 0.25, -0.625, 0.325]);
  drawTriangle([-0.55, 0.25, -0.45, 0.25, -0.5, 0.375]);
  drawTriangle([-0.425, 0.175, -0.45, 0.25, -0.375, 0.325]);
  drawTriangle([-0.575, 0.175, -0.5, 0.175, -0.55, 0.25]);
  drawTriangle([-0.425, 0.175, -0.5, 0.175, -0.45, 0.25]);
  drawTriangle([-0.55, 0.25, -0.45, 0.25, -0.5, 0.175]);
  drawTriangle([-0.54, 0.43, -0.46, 0.43, -0.5, 0.48]);
  drawTriangle([-0.54, 0.43, -0.46, 0.43, -0.5, 0.39]);

  // cross
  drawTriangle([0.48, 0.48, 0.52, 0.48, 0.48, 0.62]);
  drawTriangle([0.52, 0.48, 0.48, 0.62, 0.52, 0.62]);
  drawTriangle([0.42, 0.53, 0.58, 0.53, 0.42, 0.57]);
  drawTriangle([0.58, 0.53, 0.42, 0.57, 0.58, 0.57]);
}
