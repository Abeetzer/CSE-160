class Cylinder {
  constructor() {
    this.type = 'cylinder';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 12;
  }

  render() {
    var rgba = this.color;

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let step = 360 / this.segments;
    
    for (var angle = 0; angle < 360; angle += step) {
      let centerPt = [0.5, 0.5]; 
      
      let angle1 = angle;
      let angle2 = angle + step;
      
      
      let vec1 = [Math.cos(angle1 * Math.PI / 180) * 0.5, Math.sin(angle1 * Math.PI / 180) * 0.5];
      let vec2 = [Math.cos(angle2 * Math.PI / 180) * 0.5, Math.sin(angle2 * Math.PI / 180) * 0.5];
      
      let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
      let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      drawTriangle3D([0.5, 1.0, 0.5,   pt1[0], 1.0, pt1[1],   pt2[0], 1.0, pt2[1]]);
      drawTriangle3D([0.5, 0.0, 0.5,   pt2[0], 0.0, pt2[1],   pt1[0], 0.0, pt1[1]]);
      
      gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
      
      drawTriangle3D([pt1[0], 1.0, pt1[1],   pt1[0], 0.0, pt1[1],   pt2[0], 0.0, pt2[1]]);
      drawTriangle3D([pt1[0], 1.0, pt1[1],   pt2[0], 0.0, pt2[1],   pt2[0], 1.0, pt2[1]]);
    }
  }
}