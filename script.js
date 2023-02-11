import {
  drawLine,
  drawSquare,
  drawRectangle,
  drawPolygon,
} from "./scripts/index.js";

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
  vertices = [];
});

colorSelect.addEventListener("input", (event) => {
  selectedColor = hexToRgb(event.target.value);
  render();
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

let vertices = [];

function drawShape() {
  switch (shapeSelect.value) {
    case "line":
      drawLine(vertices, selectedColor, gl, program);
      break;
    case "square":
      drawSquare(vertices, selectedColor, gl, program);
      break;
    case "rectangle":
      drawRectangle(vertices, selectedColor, gl, program);
      break;
    case "polygon":
      drawPolygon(vertices, selectedColor, gl, program);
      break;
  }
}

function render() {
  console.log(vertices);
  if (shapeSelect.value === "line" && vertices.length >= 4) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawShape();
  }

  if (
    (shapeSelect.value === "square" || shapeSelect.value === "rectangle") &&
    vertices.length === 2
  ) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawShape();
  }

  if (shapeSelect.value === "polygon" && vertices.length >= 6) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawShape();
  }
}

function addVertex(x, y) {
  if (shapeSelect.value === "line") {
    vertices.push(x, y);
    if (vertices.length % 4 === 0 && vertices.length >= 4) {
      vertices = vertices.slice(-4);
    }
  } else {
    vertices.push(x, y);
    vertices = vertices.slice(-2);
  }
}

canvas.addEventListener("mousedown", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;

  addVertex(x, y);

  render();
});
