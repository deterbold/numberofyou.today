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

//variables for canvas map drawing
let overlayCanvas;
let mapContainer;

//variables for speech
let speechRec;

//variables for sentiment analysis
let sentiment;
let sentimentResult;
let humor;

//Storing data variables
let NumbersOfYou = [];
let todaysDate;

//Timer variables
let countdown;

//**PRELOAD function
function preload() 
{
  // Load the face-api.js models
  faceapi.loadSsdMobilenetv1Model(model_url);
  faceapi.loadAgeGenderModel(model_url);
  faceapi.loadFaceExpressionModel(model_url);

  //for geolocation
  locationData = getCurrentPosition();
    if (!navigator.geolocation) {
    // Geolocation is not available
    // Handle the error here, e.g., display an error message
    console.error("Geolocation is not available.");
    return;
  }

  //for sentiment analysis
  sentiment = ml5.sentiment('MovieReviews');

}

function setup() 
{

  //To do: check whether the date is a new date
  
  // //loading the Numbers of You array
  // NumbersOfYou = getItem('NumbersOfYou');
  // console.log("loaded Numbers: " + NumbersOfYou.length);


  //video data capture
  capture = createCapture(VIDEO);
  capture.id("video_element");
  input = document.getElementById('video_element');
  capture.size(width, height);
  capture.hide();  
  
  //let's start the thing
  introScene();


}

//FLOW CONTROL - SCENES

function introScene()
{
  console.log("introSceneCalled");
  createCanvas(windowWidth, windowHeight);
  fill(255, 0, 0);
  background(255, 255, 255);
  textSize(60);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("please wait while we load the system", windowWidth/2, windowHeight/2 - 100);
  
  timer = setTimeout(getBasicDataScene, 2000);
}


function getBasicDataScene()
{
  console.log("Basic Data Scene called");
  noLoop();
  console.log(getDate());
  geolocationData();
  timer = setTimeout(cameraScene, 3000);

}

function cameraScene()
{
  console.log("Camera Scene called");
  background(255, 255, 255);
  fill(255, 0, 0);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Getting Image Data", windowWidth/2, windowHeight/2 + 100);
  image(capture, 0, 0, width, height/2, 0, 0, 0, 0, CONTAIN); 
  faceRead();
  timer = setTimeout(soundScene, 5000);
}

function soundScene()
{
  console.log("Speech Scene called");
  background(255, 255, 255);
  fill(255, 0, 0);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Say something about yourself today", windowWidth/2, windowHeight/2 - 100);
  //speech stuff
  speechRec = new p5.SpeechRec('en-US', gotSpeech);
  let continuous = false;
  let interim = false;
  speechRec.start(continuous, interim);
}

function endScene()
{
  console.log("endScene called");
  noLoop();
  background(255);
  fill(255, 0, 0);
  textSize(100);
  textAlign(CENTER, CENTER);
  text("52", windowWidth/2, windowHeight/2 - 100);
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
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  text("Getting Date and Location", windowWidth/2, windowHeight/2 - 100);
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
  age = floor(faceDrawings[0].age);
  gender = faceDrawings[0].gender;
  
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
  mood = highestString;
  console.log(age + ' ' + gender + ' ' + mood);

}

// **SPEECH RECOGNITION

function gotSpeech()
{
  console.log("gotSpeech called");
		if(speechRec.resultValue==true) 
    {
			background(192, 255, 192);
			text(speechRec.resultString, width/2, height/2);
			console.log(speechRec.resultString);
		}
    speechRec.onEnd = speechReconEnded;
}

function speechReconEnded()
{
  console.log("speechReconEnded called");
  getSentiment(speechRec.resultString);
  setTimeout(endScene, 2000);
}

// **SENTIMENT ANALYSIS
function getSentiment(result)
{
  const prediction = sentiment.predict(result);

  console.log(prediction);

  sentimentResult = prediction.score;
  
  // a switch statement that divides the sentiment score into 5 categories
  switch(true)
  {
    case (sentimentResult < 0.3):
      console.log("Choleric");
      humor = "Choleric";
      break;
    case (sentimentResult < 0.5):
      console.log("Sanguine");
      humor = "Sanguine";
      break;
    case (sentimentResult < 0.7):
      console.log("Melancholic");
      humor = "Melancholic";
      break;
    case (sentimentResult < 1):
      console.log("Phlegmatic");
      humor = "Phlegmatic";
      break;
    default:
        console.log("Neutral");
        break;
  }
}


// **UTILITIES**

//RESIZE THE WINDOW
// when the browser window is resized
function windowResized() {
  clear();
  resizeCanvas(windowWidth, windowHeight);
  background(255, 255, 255);
  introScene();
}

//INTERACTING TO TEST STUFF
function keyPressed() 
{
  if (keyCode === ENTER) {
    faceRead();
  }
}


//UI CODE
let isFlipped = false;

function flip() 
{
  const flipContainer = document.querySelector('.flip-container');
  flipContainer.classList.toggle('flipped');
  isFlipped = !isFlipped;
}

// let number = 0 ;
// document.getElementById("number").textContent = number;

// Accessing individual elements
const genderOnScreen = document.getElementById("gender");
const ageOnScreen = document.getElementById("age");
const moodOnScreen = document.getElementById("mood");
const locationOnScreen = document.getElementById("location");
const humorOnScreen = document.getElementById("humor");

// Example usage:
genderOnScreen.textContent = "Gender: Female";
ageOnScreen.textContent = "Age: 30";
moodOnScreen.textContent = "Mood: Sad";
locationOnScreen.textContent = "Location: Los Angeles";
humorOnScreen.textContent = "Humor: Sarcastic";

// Change background color with JavaScript
function changeBackgroundColor(color) 
{
  document.body.style.backgroundColor = color;
}