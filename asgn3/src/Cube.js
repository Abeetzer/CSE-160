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

    drawTriangle3DUV(allverts, alluvs);
  }

}
