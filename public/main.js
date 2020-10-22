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

  calcScaleValues();
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
  canvas = createCanvas(scaledWidth, scaledHeight);
  canvas.show(); // Removes scroll bar by changing canvas display: block
  background(000);

  renderMessages();
  renderTextInput();
  fakeMessages();
  filter(DILATE, 1);
  filter(BLUR, 1);
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

  textSize(scaledFontSize);
}
