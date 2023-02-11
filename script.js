import {
  drawLine,
  drawSquare,
  drawRectangle,
  drawPolygon,
} from "./scripts/index.js";

/* --------------------- REFERENCE VARIABLES --------------------- */

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("experimental-webgl");
const shapeSelect = document.getElementById("shapeSelect");
const allColorSelect = document.getElementById("allColorSelect");

/* -------------------------- VARIABLES -------------------------- */

let hexColors = [];
let selectedColors = [
  { r: 0, g: 0, b: 0 },
  { r: 0, g: 0, b: 0 },
];
let vertices = [];

//* ---------------------- EVENT LISTENERS ---------------------- */

document.addEventListener("DOMContentLoaded", () => {
  renderColorSelect();
});

shapeSelect.addEventListener("change", (event) => {
  gl.clear(gl.COLOR_BUFFER_BIT);
  vertices = [];
  renderColorSelect();
});

allColorSelect.addEventListener("input", (event) => {
  hexColors = [];
  for (let i = 0; i < selectedColors.length; i++) {
    hexColors[i] = event.target.value;
    selectedColors[i] = hexToRgb(event.target.value);
  }
  const colorInputs = document.getElementsByClassName("vertex-color");
  for (let i = 0; i < colorInputs.length; i++) {
    colorInputs[i].value = event.target.value;
  }
  render();
});

canvas.addEventListener("mousedown", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;
  addVertex(x, y);
  render();
  renderColorSelect();
});

/* -------------------------- FUNCTIONS -------------------------- */

function drawShape() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  switch (shapeSelect.value) {
    case "line":
      drawLine(vertices, selectedColors, gl, program);
      break;
    case "square":
      drawSquare(vertices, selectedColors, gl, program);
      break;
    case "rectangle":
      drawRectangle(vertices, selectedColors, gl, program);
      break;
    case "polygon":
      drawPolygon(vertices, selectedColors, gl, program);
      break;
  }
}

function render() {
  if (
    (shapeSelect.value === "line" || shapeSelect.value === "rectangle") &&
    vertices.length !== 4
  ) {
    return;
  }
  if (shapeSelect.value === "polygon" && vertices.length < 6) {
    return;
  }
  drawShape();
}

function addVertex(x, y) {
  vertices.push(x, y);
  if (shapeSelect.value === "line" || shapeSelect.value === "rectangle") {
    if (vertices.length >= 4 && vertices.length % 4 === 0) {
      vertices = vertices.slice(-4);
    }
  } else if (shapeSelect.value === "square") {
    vertices = vertices.slice(-2);
  }
}

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

function renderColorSelect() {
  let vertexCount = 0;
  switch (shapeSelect.value) {
    case "line":
      vertexCount = 2;
      break;
    case "square":
      vertexCount = 4;
      break;
    case "rectangle":
      vertexCount = 4;
      break;
    case "polygon":
      vertexCount = vertices.length / 2;
      break;
  }
  document.getElementById("colorSelect").innerHTML = "";
  for (let i = 0; i < vertexCount; i++) {
    hexColors[i] = hexColors[i] || "#000000";
    selectedColors[i] = hexToRgb(hexColors[i]);

    const div = document.createElement("div");
    div.id = `colorSelect${i}`;
    div.className = "color-toolbar toolbar-component";
    document.getElementById("colorSelect").appendChild(div);

    const label = document.createElement("label");
    label.innerHTML = `Vertex ${i + 1}`;
    document.getElementById(`colorSelect${i}`).appendChild(label);

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.addEventListener("input", (event) => {
      hexColors[i] = event.target.value;
      selectedColors[i] = hexToRgb(event.target.value);
      render();
    });
    colorInput.className = "vertex-color";
    colorInput.value = hexColors[i];
    document.getElementById(`colorSelect${i}`).appendChild(colorInput);
  }
}

/* ------------------------- SHADER CODE ------------------------- */

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

/* ------------------------- WEBGL SETUP ------------------------- */

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);

gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
