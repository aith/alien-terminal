//https://mipav.cit.nih.gov/pubwiki/index.php/Barrel_Distortion_Correction
const socket = io.connect("http://localhost:3000");
let aspectWidth = 1600;
let aspectHeight = 900;
let canvas;
let scale;
let font = "mono";
let scaledWidth;
let scaledHeight;
let scaledFontSize;
let input;
let line1;
let line2;
let messages = [];
let maxMessages = 3;
// lens distortion
// TODO recalc after
let centerX;
let centerY;
let meshGridX;
let meshGridY;
let rArray;
let thetaArray;
let maxR;

/*Event-listener for "chat" event. Used by all connected users.*/
socket.on("chat", (data) => {
  //reset feedback when click send
  pushNewMessage(data.message);
});

/*Event-listener for when a new connection requests text info*/
socket.on("requestMessages", (data) => {
  socket.emit("giveMessages", {
    // Package this user's lines here
    messages: messages,
  });
});

socket.on("giveMessages", (data) => {
  //check if lines are filled, then receive lines here
  // line1 = data.line1;
  // line2 = data.line2;
  // data.lines.forEach((element) => console.log(element));
  if (messages != undefined) {
    messages = data.messages;
    // data.messages.forEach((element) => console.log(element));
  }
});

function preload() {
  fontRegular = loadFont("./fonts/UbuntuMono-Regular.ttf");
  // fontItalic = loadFont('./fonts/UbuntuMono-Italic.ttf');
  // fontBold = loadFont('./fonts/UbuntuMono-Bold.ttf');
}

function setup() {
  socket.emit("requestMessages", {});

  textFont(fontRegular);
  // fill(192, 192, 192);

  calcScaleValues(); // This is ran at start (here) and onWindowResize()
  renderTerminal();
}

/* Event-emitter pressing enter in text-input box */
function submitMessage() {
  socket.emit("chat", {
    message: input.value(), // Store the input box's value as 'message' in the socket
    // handle: handle.value,
  });
  // if (lines[0] == null) lines[0] = input.value();
  // else lines[1] = input.value();
  input.value(""); // clear input box
}

function pushNewMessage(message) {
  messages.unshift(message);
  messages = messages.slice(0, maxMessages);
  console.log("Current array:");
  messages.forEach((element) => console.log(element));
}

function renderTerminal() {
      console.log("hi");
  canvas = createCanvas(scaledWidth, scaledHeight);
  canvas.show(); // Removes scroll bar by changing canvas display: block
  background(000); // Black

  renderMessages();
  renderTextInput();
  fakeMessages();
  filter(DILATE, 1);
  filter(BLUR, 1);
  applyLensDistortion();
}

function renderMessages() {
  // console.log(scale);
  fill(67, 226, 157);
  renderMessage();
}

function fakeMessages() {
  text(
    "roitsnpuadhut rrustuaauufehtfeahi t,vfohrt iohrd ittvdhritf ro,itdotirst oatahr.rd rtosnt. ",
    100,
    100
  );
  text(
    "roitsnpuadhut rrustuaauufehtfeahi t,vfohrt iohrd ittvdhritf ro,itdotirst oatahr.rd rtosnt. ",
    100,
    500
  );
  text(
    "roitsnpuadhut rrustuaauufehtfeahi t,vfohrt iohrd ittvdhritf ro,itdotirst oatahr.rd rtosnt. ",
    100,
    700
  );
  text(
    "roitsnpuadhut rrustuaauufehtfeahi t,vfohrt iohrd ittvdhritf ro,itdotirst oatahr.rd rtosnt. ",
    100,
    300
  );
}

function renderMessage() {
  // text("word", scaledWidth * 0.1, scaledHeight * 0.1); //TODO make the position proportional to canvas
}

function renderTextInput() {
  if (input == null) input = createInput("");
  input.style("font-size", scaledFontSize + "px");
  input.position(scaledWidth - 500, scaledHeight - 100);
  input.id("localInput");
  // input.style("border", "none");
  // input.style("background", "transparent");
  // input.style("opacity", "0.0");
  // input.style("width", "200");
  /// i think i should make the font size based on scale, since i want it to be proportional based on the screen.
  input.changed(submitMessage); // when the user presses enter
}

//  https://stackoverflow.com/questions/59604343/how-to-resize-canvas-based-on-window-width-height-and-maintain-aspect-ratio

function windowResized() {
  calcScaleValues();
  renderTerminal();
  // when the canvas is resized its erased... so you need to make sure all elements are stored in variables, so you can redraw
}

function calcAspectRatioScale(aspectWidth, aspectHeight) {
  let aspectRatio = aspectWidth / aspectHeight;
  scale = Math.min(windowWidth / aspectWidth, windowHeight / aspectHeight);
  return scale;
}

function calcScaleValues() {
  scale = calcAspectRatioScale(aspectWidth, aspectHeight);
  scaledWidth = 1600 * scale;
  scaledHeight = 900 * scale;
  scaledFontSize = 30 * scale;

  // lens distortion
  centerX = (scaledWidth - 1) / 2;
  centerY = (scaledHeight - 1) / 2;

  textSize(scaledFontSize);
}

// pixels[] is a p5 array. it represents rgba in sequential order per pixel
function applyLensDistortion() {
  let originalPixels = pixels;
  updatePixels();
  centerX = Math.floor(scaledWidth / 2);
  centerY = Math.floor(scaledHeight / 2);

  // Create N x M (#pixels) x-y points

  // Convert the mesh into a column vector of coordinates relative to the centre
  // So if the positions are:
  // (1,1) (2,1) (3,1)
  // (1,2) (2,2) (3,2)
  // (1,3) (2,3) (3,3)
  // then...
  // meshGridX contains [ 1 2 3 1 2 3 1 2 3 ]
  // meshGridY contains [ 1 1 1 2 2 2 3 3 3 ]
  meshGridX = [0];  // Initialize a trivial value to get coordinate system
  meshGridY = [0];
  for (let y = 1; y <= scaledHeight; y++) {
    for (let x = 1; x <= scaledWidth; x++) {
      meshGridY.push(y - centerY); // Make sure to shift around center
      console.log(y - centerY);
      meshGridX.push(x - centerX);
    }
  }

  getPolarCoords();
  maxR = Math.sqrt(
    Math.pow(centerX, 2)
      + Math.pow(centerY, 2)
  );

  r = r/maxR;
}

function getPolarCoords() {
  if (meshGridX.length != meshGridY.length)
    print("Error: coordinate arrays mismatched.");
  rArray = [];
  thetaArray = [];
  for (let coordCount = 1; coordCount <= xArray.length; coordCount++) {
    rArray.push(Math.sqrt(
      Math.pow(meshGridX[coordCount], 2)
      + Math.pow(meshGridY[coordCount], 2)
    ));
    thetaArray.push(Math.atan(
      meshGridY[coordCount]
      / meshGridX[coordCount]
    ));
  }
}
