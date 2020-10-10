const socket = io.connect("http://localhost:3000");
let aspectWidth = 1600;
let aspectHeight = 900;
let canvas;
let scale;
let font = "mono";
let scaledWidth;
let scaledHeight;
let input;
let line1;
let line2;

/*Event-listener for "chat" event. Used by all connected users.*/
socket.on("chat", (data) => {
  //reset feedback when click send
  console.log(data.message);
});

/*Event-listener for when a new connection requests text info*/

socket.on("requestText", (data) => {
  socket.emit("giveText", {
    line1: line1,
    line2: line2,
  });
  console.log("giving line1 " + line1);
  console.log("giving line2 " + line2);
});

socket.on("giveText", (data) => {
  //check if lines are filled, then
  line1 = data.line1;
  line2 = data.line2;
});

function preload() {
  // inconsolata = loadFont(font);
}

function setup() {
  input = createInput("");
  input.position(200, 200);
  input.id("localInput");
  input.changed(submitText); // when the user presses enter
  // input.style("border", "none");
  // input.style("background", "transparent");
  // input.style("opacity", "0.0");
  // input.style("width", "200");
  /// i think i should make the font size based on scale, since i want it to be proportional based on the screen.
  socket.emit("syncText", {});
  console.log("giving line1 " + line1);
  console.log("giving line2 " + line2);

  // input.input();
  renderTerminal();
}

function submitText() {
  socket.emit("chat", {
    message: input.value(), // Store the input box's value as 'message' in the socket
    // handle: handle.value,
  });
  if (line1 == null) line1 = input.value();
  else line2 = input.value();
  console.log("line1 is " + line1);
  console.log("line2 is " + line2);

  message.value = ""; // r
  input.value(""); // clear input box
}

function renderTerminal() {
  scale = calcAspectRatioScale(aspectWidth, aspectHeight);
  scaledWidth = 1600 * scale;
  scaledHeight = 900 * scale;
  canvas = createCanvas(scaledWidth, scaledHeight);
  background(153);
  renderLines();
}

function renderLines() {
  textSize(30 * scale);
  console.log(scale);
  renderLine();
}

function renderLine() {
  text("word", scaledWidth * 0.1, scaledHeight * 0.1); //TODO make the position proportional to canvas
}

//  https://stackoverflow.com/questions/59604343/how-to-resize-canvas-based-on-window-width-height-and-maintain-aspect-ratio

function windowResized() {
  renderTerminal();
  // when the canvas is resized its erased... so you need to make sure all elements are stored in variables, so you can redraw
}

function calcAspectRatioScale(aspectWidth, aspectHeight) {
  let aspectRatio = aspectWidth / aspectHeight;
  scale = Math.min(windowWidth / aspectWidth, windowHeight / aspectHeight);
  return scale;
}
