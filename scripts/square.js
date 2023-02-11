export function drawSquare(vertices, selectedColor, gl, program) {
  const side = 0.5;
  const halfSide = side / 2;
  const squareVertices = [
    vertices[0] - halfSide,
    vertices[1] - halfSide,
    vertices[0] + halfSide,
    vertices[1] - halfSide,
    vertices[0] + halfSide,
    vertices[1] + halfSide,
    vertices[0] - halfSide,
    vertices[1] + halfSide,
  ];

  let colors = [];

  for (let i = 0; i < selectedColor.length; i++) {
    colors.push(selectedColor[i].r);
    colors.push(selectedColor[i].g);
    colors.push(selectedColor[i].b);
  }

  // Create a vertex buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(squareVertices),
    gl.STATIC_DRAW
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Enable the vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  const coordinates = gl.getAttribLocation(program, "coordinates");
  gl.vertexAttribPointer(coordinates, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordinates);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  const programColor = gl.getAttribLocation(program, "color");
  gl.vertexAttribPointer(programColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programColor);

  // Draw the square
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
