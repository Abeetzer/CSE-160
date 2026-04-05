// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 10, canvas.width, canvas.height);        // Fill a rectangle with the color

}

function drawVector(v, color){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    x = canvas.width / 2;
    y = canvas.height / 2;
    
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + v.elements[0] * 20, y - v.elements[1] * 20);
    ctx.stroke();
}

function handleDrawEvent(){
     var canvas = document.getElementById('example');
     var ctx = canvas.getContext('2d');
     
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
     ctx.fillRect(0, 10, canvas.width, canvas.height);        // Fill a rectangle with the color

     let x1 = parseFloat(document.getElementById('x1').value);
     let y1 = parseFloat(document.getElementById('y1').value);
     console.log([x1 , y1]);
     let v1 = new Vector3([x1,y1,0]); 
     drawVector(v1, 'red');

     let x2 = parseFloat(document.getElementById('x2').value);
     let y2 = parseFloat(document.getElementById('y2').value);
     console.log([x2 , y2]);
     let v2 = new Vector3([x2,y2,0]); 
     drawVector(v2, 'blue');
}

function angleBetween(v1, v2){
  d = Vector3.dot(v1,v2);
  theta = Math.acos(d/(v1.magnitude() * v2.magnitude()));
  res = (theta * 180) / Math.PI;
  return res;
}

function areaTriangle(v1, v2){
  let c = Vector3.cross(v1, v2);
  let res = (c.magnitude()) * 0.5;
  return res;
}

function handleDrawOperationEvent(){
     var canvas = document.getElementById('example');
     var ctx = canvas.getContext('2d');
     
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
     ctx.fillRect(0, 10, canvas.width, canvas.height);        // Fill a rectangle with the color

     let x1 = parseFloat(document.getElementById('x1').value);
     let y1 = parseFloat(document.getElementById('y1').value);
     let v1 = new Vector3([x1,y1,0]); 
     drawVector(v1, 'red');

     let x2 = parseFloat(document.getElementById('x2').value);
     let y2 = parseFloat(document.getElementById('y2').value);
     let v2 = new Vector3([x2,y2,0]); 
     drawVector(v2, 'blue');
     
     const op = document.getElementById("op").value;
     let sc = document.getElementById("sc").value;

  switch (op) {
    case "add":
      drawVector(v1.add(v2), "green");
      break;

    case "sub":
      drawVector(v1.sub(v2), "green");
      break;

    case "mul":
      drawVector(v1.mul(sc), "green");
      drawVector(v2.mul(sc), "green");
      break;
    
    case "div":
      drawVector(v1.div(sc), "green");
      drawVector(v2.div(sc), "green");
      break;
    
    case "mag":
      console.log(v1.magnitude());
      console.log(v2.magnitude());
      break;
    
    case "nor":
      drawVector(v1.normalize(), "green");
      drawVector(v2.normalize(), "green");
      break;
    
    case "dot":
      console.log(angleBetween(v1, v2));
      break; 
    
    case "cross":
      console.log(areaTriangle(v1, v2));
      break; 

    default:
      console.log("Invalid operation");
  }

}