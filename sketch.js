//Variables for Face API
const model_url = '/models';
let faceDrawings = [];
let capture;
let input;
var finishedStudyingFace;
var gender;
var age;
var mood;

//variables for geolocation
var locationData;
let myMap;
let canvas;
const mappa = new Mappa('Leaflet');
var latd;
var lng;

//Storing data variable
let NumbersOfYou = [];

//Scene Management
let scene = 0;

//Timer management
let timer = 3;
let timerIsDone = false;

//preload function
//for faceAPI
function preload() 
{
  // Load the face-api.js models
  faceapi.loadSsdMobilenetv1Model(model_url);
  faceapi.loadAgeGenderModel(model_url);
  faceapi.loadFaceExpressionModel(model_url);

  //for geolocation
  locationData = getCurrentPosition();


}

function setup() 
{
  //canvas management
  // canvas = createCanvas(windowWidth, windowHeight);
  
  //video data capture
  capture = createCapture(VIDEO);
  capture.id("video_element");
  input = document.getElementById('video_element');
  capture.size(width, height);
  capture.hide();  
  
  // //geolocation capture
  // latd = locationData.latitude;
  // lng = locationData.longitude;
  // const options = 
  // {
  //   lat: latd,
  //   lng: lng,
  //   zoom: 15,
  //   style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
  // }
  // myMap = mappa.tileMap(options); 
  // myMap.overlay(canvas);
  //fill(255, 0, 0);

  //loading the Numbers of You array
  NumbersOfYou = getItem('NumbersOfYou');
  console.log("loaded Numbers: " + NumbersOfYou.length);

  introScene();


}

function draw() 
{
  //background(255, 0, 0);

  // switch(scene) {
  //   case 0:
  //     introScene();
  //     break;
  //   case 1:
  //     getBasicDataScene();
  //     break;
  //   case 2:
  //     cameraScene();
  //     break;
  //   // case 3:
  //   //   soundScene();
  //   //   break;
  //   case 3:
  //     endScene();
  //     break;
  //   default:
  //     break;
  // }
  
}

//FLOW CONTROL - SCENES

function introScene()
{
  console.log("introSceneCalled");
  fill(255, 0, 0);
  background(255, 255, 255);
  textSize(100);
  textAlign(CENTER, CENTER);
  text("Welcome to Number of You", windowWidth/2, windowHeight/2);
  textSize(50);
  text("please wait while we load the system", windowWidth/2, windowHeight/2 + 150);
  timer = setTimeout(getBasicDataScene, 10000);
}

function getBasicDataScene()
{
  console.log("Basic Data Scene called");
  noLoop();
  console.log(getDate());
  geolocationData();
  timer = setTimeout(cameraScene, 4000);

}

function cameraScene()
{
  background(255, 255, 255);
  fill(255, 0, 0);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Getting Image Data", windowWidth/2, windowHeight/2 + 100);
  image(capture, 0, 0, width, height/2, 0, 0, 0, 0, CONTAIN); 
  faceRead();
  timer = setTimeout(endScene, 5000);
}

function endScene()
{
  noLoop();
  background(255);
  fill(255, 0, 0);
  textSize(100);
  textAlign(CENTER, CENTER);
  text("52", windowWidth/2, windowHeight/2);
}


//GETTING THE DATE
// NICKED FROM https://editor.p5js.org/bitSpaz/sketches/hiUY5zSr7
function getDate()
{
  let date = new Date();
  function formateDate()
  {
    return date.toDateString().slice(4);
  }
  return formateDate();
}

//GEOLOCATION FUNCTIONS
function geolocationData()
{
  canvas = createCanvas(windowWidth, windowHeight);
  //geolocation
  //clear();
  latd = locationData.latitude;
  lng = locationData.longitude;
  const options = 
  {
    lat: latd,
    lng: lng,
    zoom: 25,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
  }
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Getting Date and Location", windowWidth/2, windowHeight/2);
  myMap = mappa.tileMap(options); 
  myMap.overlay(canvas);
  const userLocation = myMap.latLngToPixel(latd, lng);
  fill(255, 0, 0);
  ellipse(userLocation.x, userLocation.y, 20, 20);
}



// **FACE DETECTION

function faceRead()
{
  console.log("faceRead function called");
  faceapi.detectAllFaces(input).withAgeAndGender().withFaceExpressions().then((data) => 
    {
      showFaceDetectionData(data);
    });
}

function showFaceDetectionData(data)
{
  faceDrawings = data;
  console.log('age ' + faceDrawings[0].age);
  console.log('gender ' + faceDrawings[0].gender);
  
  const copiedExpression = faceDrawings[0].expressions;
  let highestFloat = Number.MIN_SAFE_INTEGER; // Initialize with the lowest possible float value
  let highestString = '';
  for (let key in copiedExpression) {
    if (copiedExpression.hasOwnProperty(key)) {
      let floatValue = copiedExpression[key];
      if (floatValue > highestFloat) {
        highestFloat = floatValue;
        highestString = key;
      }
    }
  }
  console.log('mood ' + highestString)

}


// **UTILITIES**

//RESIZE THE WINDOW
// when the browser window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//MOVE SCENES
function moveScenes()
{
  console.log('moveScenes called');
  clearTimeout(timer);
  scene = scene + 1;
  loop();
}

//INTERACTING TO TEST STUFF
function keyPressed() 
{
  if (keyCode === ENTER) {
    faceRead();
  }
}