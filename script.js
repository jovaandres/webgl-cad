import { Line } from "./scripts/line.js";
import { Rectangle } from "./scripts/rectangle.js";
import { Square } from "./scripts/square.js";
import { Polygon } from "./scripts/polygon.js";

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
const contPolygonInput = document.getElementById("polygon-input-container")
const sidesofPolygon = document.getElementById("sides");

/* -------------------------- VARIABLES -------------------------- */

let drawingObjects = [];
let cornerOfPolygon = []
let numOfObjects = -1;

let nowDrawing = -1

let drawingAction = true;

let translateAction = false;
let objTranslateNum = -1;

let dilateAction = false;
let objDilateNum = -1;

let moveCornerAction = false
let isMoveCorner = false;
let objMoveCornerNum = -1
let idxOfVerticesToMove = -1

//* ---------------------- EVENT LISTENERS ---------------------- */

let radios = document.querySelectorAll('input[type=radio][name="actionSelect"]');
radios.forEach(radio => radio.addEventListener('change', () => {
  drawingAction = radio.value === 'noaction'
  moveCornerAction = radio.value === 'moveCorner';
  translateAction = radio.value === 'translate';
  dilateAction = radio.value === 'dilate';

  if (radio.value === "translate" || radio.value === "dilate") {
    drawingObjects.forEach(obj => obj.cleanTempData());
  }

  if (radio.value === 'dilate') {
    sliderContainer.style.display = 'block';
    slider.value = 20;
  } else {
    sliderContainer.style.display = 'none';
  }
}));

document.addEventListener("DOMContentLoaded", () => {
  renderColorSelect();
});

sidesofPolygon.addEventListener("input", function(){
	renderColorSelect()
})

shapeSelect.addEventListener("change", (event) => {
  if (shapeSelect.value === "polygon"){
		contPolygonInput.style.display = 'block'

	}else{
		contPolygonInput.style.display = 'none'
	}
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
  console.log("-----------------MOUSE DOWN------------------");
  console.log("Drawing action : ", drawingAction);
  console.log("Translate action : ", translateAction);
  console.log("Dilate action : ", dilateAction);
  console.log("Move Corner action : ", moveCornerAction);
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;

  if(drawingAction){
    numOfObjects++
    nowDrawing = numOfObjects;
    console.log("DRAWING ACTION");
    if (shapeSelect.value === "line") {
      console.log("Line draw");
      const line = Line(gl, program);
      line.addVertices([x, y])
      drawingObjects.push(line);
    }
    if (shapeSelect.value === "rectangle") {
      console.log("Rectangle draw");
      const rectangle = Rectangle(gl, program);
      rectangle.addVertices([x, y])
      drawingObjects.push(rectangle);
    }
    
    if (shapeSelect.value === "square") {
      console.log("Square draw");
      const square = Square(gl, program);
      square.addVertices([x, y])
      drawingObjects.push(square);
      render()
    }
    
    if (shapeSelect.value === "polygon") {
      console.log("Polygon draw");
      const polygon = Polygon(gl, program);
      polygon.addVertices([x, y],document.getElementById("sides").value)
      drawingObjects.push(polygon);
      for(let i = 0; i< polygon.getVertices().length ; i++){
        cornerOfPolygon.push(polygon.getVertices()[i])
      }
      render()
    }
  }

  if (translateAction) {
    console.log("TRANSLATE ACTION", drawingObjects.length);

    for (let i = drawingObjects.length - 1; i >= 0; i--) {
      if (drawingObjects[i].isObjectSelected([x, y])) {
        objTranslateNum = i;
        break;
      }
    }
  }

  if (dilateAction) {
    console.log("DILATE ACTION");
    isMoveCorner = false;
    for (let i = drawingObjects.length - 1; i >= 0; i--) {
      if (drawingObjects[i].isObjectSelected([x, y])) {
        objDilateNum = i;
        break;
      }
    }
  }
  
  if (moveCornerAction){
    console.log("MOVE CORNER ACTION");
    for(let i = drawingObjects.length - 1; i>= 0; i--){
      if(drawingObjects[i].getShape() === "polygon"){
        let temp = drawingObjects[i].nearestVertex([x,y])
        if(temp[0]){ //temp[0] return boolean
          isMoveCorner = true
          idxOfVerticesToMove = temp[1]
          objMoveCornerNum = i
          console.log("--> Object di-Corner Move : ", objMoveCornerNum);
          console.log("--> Idx Object di-Corner Move : ", idxOfVerticesToMove);
        }
      }
    }
  } 
});

canvas.addEventListener("mousemove", function (event) {
  console.log("-----------------MOUSE MOVE------------------");
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;

  if(drawingAction && nowDrawing != -1){
    if(shapeSelect.value == 'line'){
      console.log("DRAWING LINE MOVE");
      drawingObjects[nowDrawing].addVertices([x, y])
      render()
    }else if(shapeSelect.value == 'square'){
      console.log("DRAWING SQUARE MOVE");
      drawingObjects[nowDrawing].translateVertices([x,y])
      render()
      return
    }else if(shapeSelect.value == 'rectangle'){
      console.log("DRAWING RECTANGLE MOVE");
      drawingObjects[nowDrawing].addVertices([x, y])
      render()
    }else if(shapeSelect.value == 'polygon'){
      console.log("DRAWING POLYGON MOVE");
      drawingObjects[nowDrawing].translateVertices([x,y])
      render()
    }  
  }else if(translateAction){
    console.log("TRANSLATE MOUSEMOVE1");
    if(objTranslateNum != -1){
      console.log("TRANSLATE MOUSEMOVE2");
      drawingObjects[objTranslateNum].translateVertices([x,y])
      render()
    }
  }else if(dilateAction){
    return;
  }else if(moveCornerAction){
    if (isMoveCorner){
      if (objMoveCornerNum === -1) return;
      drawingObjects[objMoveCornerNum].updateVertices([x,y], idxOfVerticesToMove)
      render()
    }
  }else{
    return
  }
  return
});

canvas.addEventListener("mouseup", function (event) {
  console.log("-----------------MOUSE UP------------------");
  if(drawingAction){
    console.log("Mouse Up Drawing");
    if(shapeSelect.value == 'line'){

    }else if(shapeSelect.value == 'square'){

    }else if(shapeSelect.value == 'rectangle'){

    }else if(shapeSelect.value == 'polygon'){

    }
    
  }else if(translateAction){
    
  }else if(dilateAction){

  }else if(moveCornerAction){

  }else{
    return
  }
  nowDrawing = -1
  objTranslateNum = -1
  isMoveCorner = false

});

slider.addEventListener('input', () => {
  if (!dilateAction) return;

  const scale = slider.value * 0.05;
  
  drawingObjects[objDilateNum].dilateVertices(scale);
  
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
      vertexCount = document.getElementById("sides").value;
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
