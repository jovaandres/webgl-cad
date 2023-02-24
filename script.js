import { Line } from "./scripts/line.js";
import { Rectangle } from "./scripts/rectangle.js";
import { Square } from "./scripts/square.js";

/* --------------------- REFERENCE VARIABLES --------------------- */

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("experimental-webgl");
const shapeSelect = document.getElementById("shapeSelect");
const allColorSelect = document.getElementById("allColorSelect");
const sliderContainer = document.querySelector('.slider-container');
const slider = document.querySelector('#slider');
const saveButton = document.querySelector('#saveButton');
const loadButton = document.querySelector('#loadButton');
const clearButton = document.querySelector('#clearButton');
const fileInput = document.getElementById("fileInput");

/* -------------------------- VARIABLES -------------------------- */

let drawingObjects = [];
let numOfObjects = -1;

let isDrawing = false;

let isTranslating = false;
let isDragging = false;

let isDilating = false;

//* ---------------------- EVENT LISTENERS ---------------------- */

let radios = document.querySelectorAll('input[type=radio][name="actionSelect"]');
radios.forEach(radio => radio.addEventListener('change', () => {
  isTranslating = radio.value === 'translate';
  isDilating = radio.value === 'dilate';

  if (radio.value === 'dilate') {
    sliderContainer.style.display = 'block';
  } else {
    sliderContainer.style.display = 'none';
  }
}));

document.addEventListener("DOMContentLoaded", () => {
  renderColorSelect();
});

shapeSelect.addEventListener("change", (event) => {
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

  drawingObjects[numOfObjects].addColors(selectedColors);
  render();
});

canvas.addEventListener("mousedown", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;

  if (isTranslating) {
    isDragging = true;
    drawingObjects[numOfObjects].translateVertices([x, y])
    return;
  }

  if (isDilating) return;

  isDrawing = true;
  numOfObjects++;

  if (shapeSelect.value === "line") {
    const line = Line(gl, program);
    line.addVertices([x, y])
    drawingObjects.push(line);
  }

  if (shapeSelect.value === "rectangle") {
    const rectangle = Rectangle(gl, program);
    rectangle.addVertices([x, y])
    drawingObjects.push(rectangle);
  }

  if (shapeSelect.value === "square") {
    const square = Square(gl, program);
    square.addVertices([x, y])
    drawingObjects.push(square);
  }
});

canvas.addEventListener("mousemove", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;

  if (isDragging) {
    drawingObjects[numOfObjects].translateVertices([x, y])
    render();
  }

  if (!isDrawing) return;

  drawingObjects[numOfObjects].addVertices([x, y])
  render();
});

canvas.addEventListener("mouseup", function (event) {
  if (isDragging) {
    isDragging = false;
    return;
  }
  isDrawing = false;
});

slider.addEventListener('input', () => {
  if (!isDilating) return;

  const scale = slider.value;
  drawingObjects[numOfObjects].dilateVertices(scale);
  
  render();
});

saveButton.addEventListener('click', () => {
  if (drawingObjects.length === 0) return;

  const data = [];

  drawingObjects.forEach(obj => {
    data.push({
      vertices: obj.getVertices(),
      colors: obj.getColors(),
      shape: obj.getShape(),
    });
  });

  const json = JSON.stringify(data);

  const blob = new Blob([json], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "model.json";

  link.click();
});

loadButton.addEventListener("click", function() {
  fileInput.click();
});

fileInput.addEventListener("change", function() {
  const file = fileInput.files[0];

  const reader = new FileReader();
  reader.readAsText(file, 'UTF-8');


  reader.onload = readerEvent => {
    const content = readerEvent.target.result;
    const data = JSON.parse(content);

    drawingObjects = [];
    data.forEach(obj => {
      const shape = obj.shape;
      const vertices = obj.vertices;
      const colors = obj.colors;

      let drawingObject;

      if (shape === 'line') {
        drawingObject = Line(gl, program);
      }

      if (shape === 'rectangle') {
        drawingObject = Rectangle(gl, program);
      }

      if (shape === 'square') {
        drawingObject = Square(gl, program);
      }

      drawingObject.setVertices(vertices);
      drawingObject.setColors(colors);

      drawingObjects.push(drawingObject);
    });

    numOfObjects = drawingObjects.length - 1;

    render();
  }
});

clearButton.addEventListener('click', () => {
  drawingObjects = [];
  numOfObjects = -1;
  render();
});

/* -------------------------- FUNCTIONS -------------------------- */
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


let hexColors = [];
let selectedColors = [
  { r: 0, g: 0, b: 0 },
  { r: 0, g: 0, b: 0 },
];

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

      drawingObjects[numOfObjects].addColors(selectedColors);
      render();
    });
    colorInput.className = "vertex-color";
    colorInput.value = hexColors[i];
    document.getElementById(`colorSelect${i}`).appendChild(colorInput);
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawingObjects.forEach((object) => {
    object.draw()
  });
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
