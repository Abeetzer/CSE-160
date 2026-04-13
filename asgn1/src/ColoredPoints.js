// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  uniform float u_size;
  void main() {
    gl_Position = a_Position;
    // gl_PointSize = 10.0;
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

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

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

}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedcolor = [1.0, 1.0, 1.0, 1.0]; 
let g_selectedsize = 5;
let g_selectedtype = POINT;
let g_selectedseg = 1;
let myGame = new Game();
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
}
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  handleUI();  
  // Register function (event handler) to be called on a mouse press

  canvas.onmousedown = click;
  canvas.onmousemove = function (ev) {if(ev.buttons == 1) {click(ev);} };
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_size = []; // array for sizes of POINTS
var g_shapesList = [];

function handleClicks(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x,y]);
}

function renderAllShapes() {
    // Clear <canvas>
  var start_time = performance.now();
  gl.clear(gl.COLOR_BUFFER_BIT);
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
  myGame.renderTargets();
  var dur = performance.now() - start_time;
  sendTextToHTML("numdot: " + len + "ms: " + Math.floor(dur) + "fps: " + Math.floor(10000/dur), "stats");
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
  // Store the coordinates to g_points array
  // g_points.push([x,y]);
  // Store the coordinates to g_points array
  // g_colors.push(g_selectedcolor.slice()); 

  // g_size.push(g_selectedsize);
  
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
