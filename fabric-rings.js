
/*var canvas = this.__canvas = new fabric.Canvas('logocanvas'); */
const canvas = new fabric.Canvas("logocanvas", {
  backgroundColor: "transparent"
});

fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.originX = fabric.Object.prototype.originY = "center";
fabric.Canvas.prototype.getAbsoluteCoords = function(object) {
  return {
    left: object.left + this._offset.left,
    top: object.top + this._offset.top
  };
};

const ring4 = new fabric.Circle({
  fill: "#1c1a1a",
  radius: 800,
  stroke: "red"
});

const ring3 = new fabric.Circle({
  fill: "#262323",
  radius: 600,
  stroke: "red"
});

const ring2 = new fabric.Circle({
  fill: "#2d2929",
  radius: 400,
  stroke: "red"
});

const ring1 = new fabric.Circle({
  fill: "#332f2f",
  radius: 200,
  stroke: "red"
});

var rings = new fabric.Group([ring4, ring3, ring2, ring1]);
canvas.add(rings);

let ui ;
fabric.Image.fromURL("./gate.png", (img) => {
  ui = img;
  debugger;
  img.scale(1).set({
    selectable: false,
    left: 0,
    top: 0
  });
  canvas.add(img).setActiveObject(img);
});
window.ui = ui;

canvas.on("mouse:wheel", function(opt) {
  let delta = -opt.e.deltaY;
  let zoom = canvas.getZoom();
  zoom = zoom + delta / 200;

  if (zoom > 20) zoom = 20;
  if (zoom < 0.6) zoom = 0.6;

  canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
  ui.setScale(ui.scale * zoom);

  opt.e.preventDefault();
  opt.e.stopPropagation();
});

canvas.on("mouse:down", function(opt) {
  let evt = opt.e;

  if (evt.altKey === true) {
    this.isDragging = true;
    this.selection = false;
    this.lastPosX = evt.clientX;
    this.lastPosY = evt.clientY;
  }
});

canvas.on("mouse:move", function(opt) {
  if (this.isDragging) {
    let e = opt.e;
    this.viewportTransform[4] += e.clientX - this.lastPosX;
    this.viewportTransform[5] += e.clientY - this.lastPosY;
    this.requestRenderAll();
    this.lastPosX = e.clientX;
    this.lastPosY = e.clientY;
  }
});

canvas.on("mouse:up", function(opt) {
  this.isDragging = false;
  this.selection = true;
});

function resizeCanvas() {
  canvas.setHeight(window.innerHeight);
  canvas.setWidth(window.innerWidth);
  canvas.renderAll();
}

resizeCanvas();

rings.center();

window.c = canvas;
