//**VARIABLES

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
var lngo;
var currentPlace;


//variables for speech
let speechRec;

//variables for sentiment analysis
let sentiment;
let sentimentResult;
let humor;

//UI Variables
let flipped = false;
var backgroundColor;
let dataButton;


//Number of You to save
var numberOfYou; 

//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************



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
  //video data capture
  capture = createCapture(VIDEO);
  capture.id("video_element");
  input = document.getElementById('video_element');
  capture.size(width, height);
  capture.hide();  

  //UI Button
  dataButton = createButton("Data");
  dataButton.position(width / 2 - button.width / 2, height - 100);
  dataButton.style("font-family", "Futura");
  dataButton.mouseOver(changeButtonColor);
  dataButton.mouseOut(changeButtonColor);
  dataButton.mouseClicked(dataButtonClicked);
  dataButton.hide();
  
  //Checking if it is a new day
  //Uncomment this for deployment
  // if(isNewDay())
  // {
  //   deleteUserData();
  //   deleteNumberOfYou();
  //   deleteCurrentDate();
  //   introScene();
  // }
  // else
  // {
  //   todaysNumber();
  // }

  //For debugging: starting the program from the beginning
  introScene();
}

//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************

//FLOW CONTROL - SCENES

function introScene()
{
  //debugging
  console.log("introSceneCalled");

  canvas = createCanvas(windowWidth, windowHeight);
  
  background(255, 255, 255);

  fill(255, 0, 0);
  textSize(60);
  textAlign(CENTER, CENTER);
  textSize(30);
  
  text("please wait while we load the system", windowWidth/2, windowHeight/2 - 100);
  
  timer = setTimeout(getBasicDataScene, 2800);
}


function getBasicDataScene()
{
  //debugging
  console.log("Basic Data Scene called");
  
  saveCurrentDate();
  geolocationData();
  
  timer = setTimeout(cameraScene, 3000);

}

function cameraScene()
{
  //debugging
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
  //debugging
  console.log("Speech Scene called");

  background(255, 255, 255);
  fill(255, 0, 0);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Say something in English about yourself today", windowWidth/2, windowHeight/2 - 100);
  
  //speech stuff
  speechRec = new p5.SpeechRec('en-US', gotSpeech);
  let continuous = false;
  let interim = false;
  speechRec.start(continuous, interim);
}

function endScene()
{
  //debugging
  console.log("endScene called");

  numberOfYou = Math.floor(Math.random() * (0 - 255 + 1));
  backgroundColor = generateRandomNumber(age);
  
  saveNumberOfYou(numberOfYou);
  saveUserData();
  
  //background(generateRandomNumber(age), generateRandomNumber(age), generateRandomNumber(age));
  // fill(255, 0, 0);
  // textSize(100);
  // textAlign(CENTER, CENTER);
  // text(numberOfYou, windowWidth/2, windowHeight/2 - 100);
  dataButton.show();
  displayNoY(numberOfYou, backgroundColor);
}

function todaysNumber()
{
  //debugging
  console.log("todaysNumber called");

  loadUserData();

  canvas = createCanvas(windowWidth, windowHeight);
  numberOfYou = localStorage.getItem('numberOfYou');
  //debugging
  console.log("Number of You: " + numberOfYou);
  
  if(backgroundColor)
  {
    backgroundColor = generateRandomNumber(age);
  }
  else
  {
    background(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
  }

  displayNoY(numberOfYou, backgroundColor);
}


//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************


//**DISPLAY FUNCTIONS **//

//function that displays the NoY
function displayNoY(NoY, backgroundColor)
{
  //debugging
  console.log("displayNoY called");

  clear();
  background(backgroundColor, backgroundColor, backgroundColor);
  fill(255, 0, 0);
  textSize(100);
  textAlign(CENTER, CENTER);
  text(NoY, windowWidth/2, windowHeight/2 - 100);
}

//function that displays the user data
function displayUserData(backgroundColor) 
{
  clear();
  background(backgroundColor, backgroundColor, backgroundColor);
  let data = [
    `Age: ${age}`,
    `Gender: ${gender}`,
    `Mood: ${mood}`,
    `Humor: ${humor}`,
    `Location: ${currentPlace}`
  ];
  
  fill(255, 0, 0);
  textSize(24);
  textAlign(CENTER, CENTER);
  
  let textY = height / 2 - 50;
  for (let i = 0; i < data.length; i++) {
    text(data[i], width / 2, textY);
    textY += 40;
  }
}

function dataButtonClicked() 
{
  if (flipped) {
    displayNoY(NoY, backgroundColor);
    button.html("Number of You");
  } else {
    displayUserData(backgroundColor);
    button.html("Data");
  }
  flipped = !flipped;
}

//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************

//**DATA FUNCTIONS**//

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
  //geolocation
  clear();
  latd = locationData.latitude;
  lngo = locationData.longitude;
  console.log("lat: " + latd + " lng: " + lngo);
  const options = 
  {
    lat: latd,
    lng: lngo,
    zoom: 25,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
  }
  textSize(50);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  text("Getting Date and Location", windowWidth/2, windowHeight/2 - 100);
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);
  currentPlace = 255;

  
  // reverseGeocode(latd, lngo)
  // .then(address => {
  //   console.log("Reverse geocoding result:", address);
  //   currentPlace = address;
  // })
  // .catch(error => {
  //   console.error("Reverse geocoding error:", error);
  // });
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

// **REVERSE GEOLOCATION**
async function reverseGeocode(lat, lng) {
  const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const address = data.display_name;
    return address;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************


// **UTILITIES**


//generate a random number based on a seed
function generateRandomNumber(seed) {
  const hash = (value) => {
    let x = Math.sin(value) * 10000;
    return x - Math.floor(x);
  };

  const normalizedSeed = seed % 1; // Ensure seed is between 0 and 1
  const randomFloat = hash(normalizedSeed);
  const randomNumber = Math.floor(randomFloat * 256);

  return randomNumber;
}

//CHECKING WHETHER IT'S A NEW DAY
function isNewDay() {
  const savedDate = localStorage.getItem('savedDate');
  if (savedDate) {
    const currentDate = new Date();
    const currentDateString = currentDate.toDateString();
    return currentDateString !== savedDate;
  }
  return true; // If no saved date exists, consider it a new day
}

//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************

// **SAVING AND LOADING AND DELETING**


//Saving the User Data
function saveUserData(age, gender, mood, currentPlace) {
  localStorage.setItem('age', age);
  localStorage.setItem('gender', gender);
  localStorage.setItem('mood', mood);
  localStorage.setItem('humor', humor);  
  localStorage.setItem('currentPlace', currentPlace);
  localStorage.setItem('backgroundColor', backgroundColor);
}

//Loading the user data
function loadUserData() {
  age = localStorage.getItem('age');
  gender = localStorage.getItem('gender');
  mood = localStorage.getItem('mood');
  humor = localStorage.getItem('humor'); 
  currentPlace = localStorage.getItem('currentPlace');
  backgroundColor = localStorage.getItem('backgroundColor');

  // return {
  //   age,
  //   gender,
  //   mood,
  //   humor,
  //   currentPlace
  // };
}

function deleteUserData() {
  localStorage.removeItem('age');
  localStorage.removeItem('gender');
  localStorage.removeItem('mood');
  localStorage.removeItem('humor');  
  localStorage.removeItem('currentPlace');
  localStorage.removeItem('backgroundColor'); 
}

//Saving the NoY
function saveNumberOfYou(numberOfYou) {
  localStorage.setItem('numberOfYou', numberOfYou);
}

//deleting the NoY
function deleteNumberOfYou() {
  localStorage.removeItem('numberOfYou');
}

//SAVING THE DAY
function saveCurrentDate() {
  const currentDate = new Date();
  console.log("current date: ", currentDate);
  const dateString = currentDate.toDateString();
  localStorage.setItem('savedDate', dateString);
}

function deleteCurrentDate() {
  localStorage.removeItem('savedDate');
}


//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************

// **USER INTERFACE**

function changeButtonColor() {
  button.style("background-color", flipped ? "#FF0000" : "#00FF00");
}


//RESIZE THE WINDOW
// when the browser window is resized
function windowResized() {
  clear();
  resizeCanvas(windowWidth, windowHeight);
  background(255, 255, 255);
}






// //UI CODE
// let isFlipped = false;

// function flip() 
// {
//   const flipContainer = document.querySelector('.flip-container');
//   flipContainer.classList.toggle('flipped');
//   isFlipped = !isFlipped;
// }

// // let number = 0 ;
// // document.getElementById("number").textContent = number;

// // Accessing individual elements
// const genderOnScreen = document.getElementById("gender");
// const ageOnScreen = document.getElementById("age");
// const moodOnScreen = document.getElementById("mood");
// const locationOnScreen = document.getElementById("location");
// const humorOnScreen = document.getElementById("humor");

// // Example usage:
// genderOnScreen.textContent = "Gender: Female";
// ageOnScreen.textContent = "Age: 30";
// moodOnScreen.textContent = "Mood: Sad";
// locationOnScreen.textContent = "Location: Los Angeles";
// humorOnScreen.textContent = "Humor: Sarcastic";

// // Change background color with JavaScript
// function changeBackgroundColor(color) 
// {
//   document.body.style.backgroundColor = color;
// }