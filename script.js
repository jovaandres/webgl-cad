const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
const shapeSelect = document.getElementById("shapeSelect");
const colorSelect = document.getElementById("colorSelect");

let color = {}

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
  color = hexToRgb(event.target.value);
});

const vertexShaderSource = `
        attribute vec2 position;
  
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

const fragmentShaderSource = `
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
        }
      `;

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
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Create the vertex buffer
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

function drawLine(vertices) {
  const colors = [
    1.0,
    1.0,
    1.0,
    1.0, // white
    1.0,
    0.0,
    0.0,
    1.0, // red
    0.0,
    1.0,
    0.0,
    1.0, // green
    0.0,
    0.0,
    1.0,
    1.0, // blue
  ];

  // Create a vertex buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  
  // const colorBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Enable the vertex buffer
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // Draw the line
  gl.drawArrays(gl.LINES, 0, 2);
}

function drawSquare(vertices) {
  // Create a vertex buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  const startX = vertices[0];
  const startY = vertices[1];
  const size = 0.1;

  const newVertices = [
    startX, startY,
    startX + size, startY,
    startX + size, startY + size,
    startX, startY + size,
    startX, startY
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newVertices), gl.STATIC_DRAW);

  // Enable the vertex buffer
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // Draw the square
  gl.drawArrays(gl.LINE_LOOP, 0, 5);
}

function drawRectangle(vertices) {
  // Create a vertex buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  const startX = vertices[0];
  const startY = vertices[1];
  const width = 0.1;
  const height = 0.05;

  const newVertices = [startX, startY, startX + width, startY, startX + width, startY + height, startX, startY + height, startX, startY];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newVertices), gl.STATIC_DRAW);

  // Enable the vertex buffer
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // Draw the rectangle
  gl.drawArrays(gl.LINE_LOOP, 0, 5);
}

function drawPolygon(vertices) {
  // Create a vertex buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Enable the vertex buffer
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // Draw the polygon
  gl.drawArrays(gl.LINE_LOOP, 0, vertices.length / 2);
}

let isDrawing = false;
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

  if (vertices.length >= 4) {
    vertices = []
  }

  vertices.push(x, y);

  if (vertices.length >= 4) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawShape()
  }
});