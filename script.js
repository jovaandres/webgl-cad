const canvas = document.getElementById("canvas");
const gl = canvas.getContext("experimental-webgl");
const shapeSelect = document.getElementById("shapeSelect");
const colorSelect = document.getElementById("colorSelect");

let selectedColor = { r: 0, g: 0, b: 0 };

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : null;
}

shapeSelect.addEventListener("change", (event) => {
  gl.clear(gl.COLOR_BUFFER_BIT);
});

colorSelect.addEventListener("input", (event) => {
  selectedColor = hexToRgb(event.target.value);
});

const vertexShaderSource =
  "attribute vec3 coordinates;" +
  "attribute vec3 color;" +
  "varying vec3 vColor;" +
  "void main(void) {" +
  " gl_Position = vec4(coordinates, 1.0);" +
  "vColor = color;" +
  "}";

const fragmentShaderSource =
  "precision mediump float;" +
  "varying vec3 vColor;" +
  "void main(void) {" +
  "gl_FragColor = vec4(vColor, 1.);" +
  "}";

// Compile the vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

// Compile the fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

// Create the program and attach the shaders
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

// Link the program
gl.linkProgram(program);

// Use the program
gl.useProgram(program);

// Clear the color buffer to white
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

function drawLine(vertices) {
  const colors = [
    selectedColor.r,
    selectedColor.g,
    selectedColor.b,
    selectedColor.r,
    selectedColor.g,
    selectedColor.b,
  ];

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
  gl.drawArrays(gl.LINES, 0, 2);
}

function drawSquare(vertices) {
  console.log(vertices);
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

  for (let i = 0; i < 4; i++) {
    colors.push(selectedColor.r);
    colors.push(selectedColor.g);
    colors.push(selectedColor.b);
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

function drawRectangle(vertices) {
  // TODO: Implement
}

function drawPolygon(vertices) {
  // TODO: Implement
}

let vertices = [];

function drawShape() {
  switch (shapeSelect.value) {
    case "line":
      drawLine(vertices);
      break;
    case "square":
      drawSquare(vertices);
      break;
    case "rectangle":
      drawRectangle(vertices);
      break;
    case "polygon":
      drawPolygon(vertices);
      break;
  }
}

canvas.addEventListener("mousedown", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;

  vertices.push(x, y);

  if (shapeSelect.value === "line" && vertices.length === 4) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawShape();
    vertices = [];
  }

  if (
    (shapeSelect.value === "square" || shapeSelect.value === "rectangle") &&
    vertices.length === 2
  ) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawShape();
    vertices = [];
  }
});
