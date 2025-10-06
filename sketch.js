//**VARIABLES

//Variables for Face API
const model_url = '/number_of_you/models';
let faceDrawings = [];
let capture;
let input;
var finishedStudyingFace;
var gender;
var age;
var mood;


//variables for geolocation
var locationData;
var myMap;
var canvas;
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
var dataButton;


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

 
  //for sentiment analysis
  sentiment = ml5.sentiment('MovieReviews');
}

//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************
//************************************************************************************************************************************************************************************

function setup() 
{
  //video data capture
  capture = createCapture(VIDEO);
  capture.id("video_element");
  input = document.getElementById('video_element');

  // Check if video capture is available
  if (!capture || !input) {
    console.error('Error creating video capture');
    // Handle the error case
    return;
  }
  capture.size(width, height);
  capture.hide();  

  //UI Button
  dataButton = createButton("data");
  dataButton.size(150, 50);
  dataButton.position(windowWidth/2 - dataButton.width/2, height - dataButton.height + 20);
  dataButton.style("font-family", "Futura");
  dataButton.style("font-size", "32px");
  dataButton.mouseOver(changeButtonColor);
  dataButton.mouseOut(changeButtonColor);
  dataButton.mouseClicked(dataButtonClicked);
  dataButton.hide();

  //Geolocation
   if (!navigator.geolocation) 
   {
     // Geolocation is not available
     // Handle the error here, e.g., display an error message
     console.error("Geolocation is not available.");
     alert("Geolocation is not available.");
   }

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
  text("give access permission for camera and sound", windowWidth/2, windowHeight/2 - 50);
  
  timer = setTimeout(getBasicDataScene, 2800);
}


function getBasicDataScene()
{
  //debugging
  console.log("Basic Data Scene called");
  clear();
  textSize(50);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  text("Getting Date and Location", windowWidth/2, windowHeight/2 - 100);
  
  saveCurrentDate();

  function getCurrentPosition() {
  
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
  getCurrentPosition()
  .then(position => geolocationData(position))
  .catch(error => {
    console.error("Error getting geolocation:", error);
    setDefaultLocationData();
  });
  
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
  
  timer = setTimeout(soundScene, 4000);
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

  setTimeout(endScene, 15000);
}

function endScene()
{
  //debugging
  console.log("endScene called");

  //numberOfYou = Math.floor(Math.random() * (0 - 255 + 1));
  numberOfYou = generateRandomNumber(age);
  console.log("Number of You: " + numberOfYou);
  backgroundColor = numberOfYou;
  
  
  saveNumberOfYou(numberOfYou);
  saveUserData();
  
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
  let r = backgroundColor;
  let g = backgroundColor;
  let b = backgroundColor;
  background(r, g, b);

  // Determine the contrasting text color
  let textBrightness = (r + g + b) / 3;
  let textColor = (textBrightness < 128) ? 255 : 0;
  // Set the fill color for the text
  fill(textColor);
  
  textSize(100);
  textAlign(CENTER, CENTER);
  text(NoY, windowWidth/2, windowHeight/2 - 100);
}

//function that displays the user data
function displayUserData(backgroundColor) 
{
  clear();
  let r = backgroundColor;
  let g = backgroundColor;
  let b = backgroundColor;
  background(r, g, b);
  
  let data = [
    `Age: ${age}`,
    `Gender: ${gender}`,
    `Mood: ${mood}`,
    `Humor: ${humor}`,
    `Location: ${currentPlace}`
  ];
  
  // Determine the contrasting text color
  let textBrightness = (r + g + b) / 3;
  let textColor = (textBrightness < 128) ? 255 : 0;
  // Set the fill color for the text
  fill(textColor);

  textSize(24);
  textAlign(LEFT, CENTER);
  
  let textY = height / 2 - 400;
  for (let i = 0; i < data.length; i++) {
    text(data[i], width / 2 - 100, textY, width/2, height/2 - 200);
    textY += 80;
  }
}

function dataButtonClicked() 
{
  if (flipped) {
    displayNoY(numberOfYou, backgroundColor);
    dataButton.html("number");
  } else {
    displayUserData(backgroundColor);
    dataButton.html("data");
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
function setDefaultLocationData()
{
  console.log("Setting default location data - no location access");
  latd = 0; // Default latitude
  lngo = 0; // Default longitude
  currentPlace = "Location unavailable";
  localStorage.setItem('latitude', latd);
  localStorage.setItem('longitude', lngo);
  localStorage.setItem('currentPlace', currentPlace);
  localStorage.setItem('locationDataMissing', 'true');
  console.log('Default location data set: lat=' + latd + ', lng=' + lngo + ', place=' + currentPlace);
  
  // Continue to camera scene after setting defaults
  setTimeout(cameraScene, 1000);
}

function geolocationData(position) 
{
  // Process the geolocation data here
  
  latd = position.coords.latitude;
  lngo = position.coords.longitude;
  if(latd && lngo) 
  {
    console.log("lat: " + latd + " lng: " + lngo);
    // Save location data for the closing page
    localStorage.setItem('latitude', latd);
    localStorage.setItem('longitude', lngo);
    localStorage.setItem('locationDataMissing', 'false');
  } 
  const options = 
  {
    lat: latd,
    lng: lngo,
    zoom: 25,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
  }
  
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

  reverseGeocode(latd, lngo)
  .then(address => {
    console.log("Reverse geocoding result:", address);
    currentPlace = address;
    // Save place name for the closing page
    localStorage.setItem('currentPlace', address);
  })
  .catch(error => {
    console.error("Reverse geocoding error:", error);
  });

  setTimeout(cameraScene, 1000);
}


// **FACE DETECTION

function faceRead()
{
  console.log("faceRead function called");
  faceapi.detectAllFaces(input).withAgeAndGender().withFaceExpressions().then((data) => 
    {
      showFaceDetectionData(data);
    })
    .catch((error) => {
      console.error("Face detection failed:", error);
      setDefaultFaceData();
    });
}

function setDefaultFaceData()
{
  console.log("Setting default face data - no camera access or face detection failed");
  age = 30; // Default age
  gender = 'unknown'; // Default gender
  mood = 'neutral'; // Default mood
  localStorage.setItem('cameraDataMissing', 'true');
  console.log('Default face data set: age=' + age + ', gender=' + gender + ', mood=' + mood);
}

function showFaceDetectionData(data)
{
  faceDrawings = data;
  
  // Check if face was detected
  if (!data || data.length === 0) {
    console.log("No face detected in image");
    setDefaultFaceData();
    return;
  }
  
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
  localStorage.setItem('cameraDataMissing', 'false');
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
  
  // Save speech text for the closing page
  localStorage.setItem('speechText', speechRec.resultString);
  
  // Wait 3 seconds then redirect to closing page
  setTimeout(() => {
    console.log("Redirecting to closing page...");
    window.location.href = 'closing-page.html';
  }, 3000);
}

// **SENTIMENT ANALYSIS
function getSentiment(result)
{
  const prediction = sentiment.predict(result);

  console.log(prediction);

  sentimentResult = prediction.score;
  
  // Save sentiment score for the closing page
  localStorage.setItem('sentimentScore', sentimentResult);
  
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
  const random = Math.sin(seed) * 10000;
  return Math.floor((random - Math.floor(random)) * 256);
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
  dataButton.style("background-color", flipped ? "#FF0000" : "#00FF00");
}


//RESIZE THE WINDOW
// when the browser window is resized
function windowResized() {
  clear();
  resizeCanvas(windowWidth, windowHeight);
  background(255, 255, 255);
}