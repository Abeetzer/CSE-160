class Cube{
  constructor() {
    this.type='cube';
    this.color = [1.0,1.0,1.0,1.0];
    this.matrix = new Matrix4();
    this.textureNum = 0;
    this.textureWeight = 0.5;
  }


render() {
    var rgba = this.color;

    // Pass texture, weight, color, and matrix data to uniforms ONCE
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform1f(u_texColorWeight, this.textureWeight);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var allverts = [];
    var alluvs = [];

    // FRONT
    allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
    alluvs   = alluvs.concat([0,0, 1,1, 1,0]);
    allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);
    alluvs   = alluvs.concat([0,0, 0,1, 1,1]);

    // TOP
    allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);
    alluvs   = alluvs.concat([0,0, 0,1, 1,1]);
    allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);
    alluvs   = alluvs.concat([0,0, 1,1, 1,0]);

    // BACK
    allverts = allverts.concat([0,0,1, 1,0,1, 1,1,1]);
    alluvs   = alluvs.concat([0,0, 1,0, 1,1]);
    allverts = allverts.concat([0,0,1, 1,1,1, 0,1,1]);
    alluvs   = alluvs.concat([0,0, 1,1, 0,1]);

    // BOTTOM
    allverts = allverts.concat([0,0,0, 1,0,1, 0,0,1]);
    alluvs   = alluvs.concat([0,1, 1,0, 0,0]);
    allverts = allverts.concat([0,0,0, 1,0,0, 1,0,1]);
    alluvs   = alluvs.concat([0,1, 1,1, 1,0]);

    // LEFT
    allverts = allverts.concat([0,0,0, 0,0,1, 0,1,1]);
    alluvs   = alluvs.concat([0,0, 1,0, 1,1]);
    allverts = allverts.concat([0,0,0, 0,1,1, 0,1,0]);
    alluvs   = alluvs.concat([0,0, 1,1, 0,1]);

    // RIGHT
    allverts = allverts.concat([1,0,0, 1,1,1, 1,0,1]);
    alluvs   = alluvs.concat([0,0, 1,1, 1,0]);
    allverts = allverts.concat([1,0,0, 1,1,0, 1,1,1]);
    alluvs   = alluvs.concat([0,0, 0,1, 1,1]);

    // Draw all 36 vertices and UVs in one single call!
    drawTriangle3DUV(allverts, alluvs);
  }


renderfast() {
    var rgba = this.color;

    // Pass texture and matrix data
    // Pass the tetxure number
    //gl.uniformli (u_whichTexture, this.textureNum);
    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv (u_ModelMatrix, false, this.matrix.elements);
    var allverts=[];
    // Front of cube
    allverts =  allverts.concat( [0,0,0, 1,1,0, 1,0,0]);
    allverts = allverts.concat( [0,0,0, 0,1,0, 1,1,0 ]);

    // Top of cube
    allverts = allverts.concat( [0,1,0, 0,1,1, 1,1,1]);
    allverts = allverts.concat( [0,1,0, 1,1,1, 1,1,0]);
    // right 
    allverts = allverts.concat( [1,1,0, 1,1,1, 1,0,0]);
    allverts = allverts.concat( [1,0,0, 1,1,1, 1,0,1]);
    // Left of cube
    allverts = allverts.concat( [0,1,0, 0,1,1, 0,0,0]);
    allverts = allverts.concat( [0,0,0, 0,1,1, 0,0,1]);

    // bottom
    allverts = allverts.concat( [0,0,0, 0,0,1, 1,0,1]);
    allverts = allverts.concat( [0,0,0, 1,0,1, 1,0,0]);

    // back
    allverts = allverts.concat( [0,0,1, 1,1,1, 1,0,1]);
    allverts = allverts.concat( [0,0,1, 0,1,1, 1,1,1]);
    drawTriangle3D(allverts);
 }

}
