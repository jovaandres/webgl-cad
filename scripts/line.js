export function drawLine(vertices, selectedColor, gl, program) {
  const colors = [];
  for (let i = 0; i < vertices.length / 2; i++) {
    colors.push(selectedColor[i].r);
    colors.push(selectedColor[i].g);
    colors.push(selectedColor[i].b);
  }

  // Create a vertex buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
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

  // Draw the line
  gl.drawArrays(gl.LINES, 0, vertices.length / 2);
}
