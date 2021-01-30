const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;
let model_predictions = [0, 0];
let outcometext;
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  outcometxt = document.getElementById("outcometxt");
  var wbcom_container = document.getElementById("webcam-container");
  var startbtn = document.getElementById("startbtn");
  startbtn.disabled = true;
  wbcom_container.innerHTML =
    " <br /> <br /> <br /> <br /> <br /> <br />Loading.. Please Wait..";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(256, 256, flip);
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  wbcom_container.innerHTML = "";
  wbcom_container.appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  startbtn.style.display = "none";
  document.getElementById("confidancelvl").style.display = "block";
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    model_predictions[i] = prediction[i].probability.toFixed(2);
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
    printMsg();
  }
}

function printMsg() {
  if (model_predictions[0] > model_predictions[1]) {
    outcometxt.innerHTML =
      '<h1 class="greentext">Mask Found, Thank You for Wearing the mask</h1>';
    SpeakThankForWearingMask();
  } else {
    SpeakWearMask();
    outcometxt.innerHTML =
      '<h1 class="redtext">No Mask Found, Please Wear A Mask</h1>';
  }
}
var speak_wearmask = 0,
  speak_thanks = 0,
  wearmask_ts = 0,
  thanks_ts = 0;
function SpeakWearMask() {
  const currdate = Date.now();
  if (!speak_wearmask && (!wearmask_ts || currdate - wearmask_ts >= 4000)) {
    speak_wearmask = 1;
    speak_thanks = 0;
    wearmask_ts = currdate;
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance("No Mask Found. Please Wear a Mask")
    );
  }
}
function SpeakThankForWearingMask() {
  const currdate = Date.now();
  if (!speak_thanks && (!thanks_ts || currdate - thanks_ts >= 4000)) {
    speak_thanks = 1;
    speak_wearmask = 0;
    thanks_ts = currdate;
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance("Mask Found. Thank You for Wearing the mask")
    );
  }
}
