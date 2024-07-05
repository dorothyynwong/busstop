
// initalise log, prompt and variables
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        //new winston.transports.Console(),
        new winston.transports.File({ filename: `busstop.log` })
    ]
});

const urlTFL = "https://api.tfl.gov.uk/StopPoint/";  //TFL API
const urlPostcode = 'https://api.postcodes.io/postcodes/';  //Postcodes API
//const urlJourney = "https://api.tfl.gov.uk/Journey/JourneyResults/NW51TL/to/490008660N" // journey planner API
const urlJourney = "https://api.tfl.gov.uk/Journey/JourneyResults/" // journey planner API


const prompt = require("prompt-sync")({ sigint: true });


let userPostCode;
let userRadius;
let postcodeCheck = false;
let fromPostCode;
let toPostCode;

let choice = "";

do  {
  choice = prompt("1. Plan Journey, 2. Nearest Bus Stop (default 2)", "2");
} while (choice !== "1" && choice !== "2");

if (choice === "1") planJourney();
else getNearestBus();

//get postcode from users
//input: text - instruction to users
//       defaultPostCode - default post code if it's not entered
function getPostCode(text, defaultPostCode) {
    let validPostCode = false;
    let postCode = "";
    do {
        postCode = prompt(`${text}, default ${defaultPostCode}`, defaultPostCode);
        if (valid_postcode(postCode)) validPostCode = true;
        if (!validPostCode){
            userExit = prompt("Invalid from postcode. Enter 1 if you want to exit or press enter to try again");
            if (userExit==='1')
                break;
        }
        log(`postcode ${postCode}`, "info");

    } while(!validPostCode);
    return postCode;
}

// Plan Journey (option 1 from the menu, part 3 of the exercise)
function planJourney() {

    fromPostCode = getPostCode("Please input the from postcode", "NW5 1NU");
    toPostCode = getPostCode("Please input the to postcode", "BR1 1DN");
    getJourneyPlanner(urlJourney, fromPostCode,toPostCode);
}


// Get the nearest bus stops and arriving time (part 2 of the exercise)
function getNearestBus() {
    postcodeCheck = false;

    // prompt user input of postcode & radius
    while (!postcodeCheck) {
        userPostCode = prompt("Enter post code (will default to NW5 1TL): ","NW5 1TL");
        // check if postcode is valid
        postcodeCheck = valid_postcode(userPostCode);
        // if not valid, ask user if they want to exit
        if (!postcodeCheck)
            {
            userExit = prompt("Enter 1 if you want to exit:")
            if (userExit==='1')
                break
            }
        //console.log(postcodeCheck);
        log(postcodeCheck, "info");
    }

    userRadius = prompt("Enter radius (will default to 500): ",500);
    if (userRadius <0 ) userRadius = 200;
    
    // only process if the postcode is valid
    if (postcodeCheck)
    {
        processData();
    }
    
}

// validate postcode to see if it's in correct format
function valid_postcode(postcode) {
    postcode = postcode.replace(/\s/g, "");
    var regex = /^[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}$/i;
    return regex.test(postcode);
}

// get data from URL
  async function fetchData(urlIn) {
    try {
        const response = await fetch(urlIn);
        return await response.json();
        //return json["result"];
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get longitude & latitude from post code
async function getCoordinatesFromPostCode() {
    let json = await fetchData(urlPostcode+userPostCode);
    const result_loc = json["result"];
    const longitude = result_loc["longitude"];
    const latitude = result_loc["latitude"];
    return [longitude, latitude];
}

// get 2 nearest stop points from longitude, latitude
async function getStopPoints(longitude, latitude) {
    const urlStopcode = `${urlTFL}?lat=${latitude}&lon=${longitude}&stopTypes=NaptanPublicBusCoachTram&radius=${userRadius}`;
    json = await fetchData(urlStopcode);
    //console.log(json);
    //log(json, "info");
   // const result_stop = json["stopPoints"][0]
   //try {
    const result_stops = json["stopPoints"];
    result_stops.sort((a,b) => a.distance - b.distance);
    if (result_stops.length < 1) throw "No stop points found";
    const twoStopPoints = result_stops.length > 2 ? result_stops.slice(0,2) : result_stops;
    let stopPointIds = [];
    for(let stopPoint of twoStopPoints) {
        stopPointIds.push(stopPoint.id);
    }
    return stopPointIds;
   /*} catch (err) {
    log(`No stop points found for post code ${userPostCode}`, "error");
    console.log(`No stop points found for post code ${userPostCode}`);
   }*/

    //stopPointId = json.stopPoints[0].id;
   // log(result_stops,"info");
    //return stopPointId;
    //const twoStopPoints = result_stops.slice(0,2);
    //return [twoStopPoints[0].id, twoStopPoints[1].id];
}

//part 1: get top 5 arrival times and bus lines of a stop point
function getArrivalTimes(stopPoints) {
    
    for(let stopPoint of stopPoints) {
        let urlWithBusstop = urlTFL.concat(stopPoint+"/Arrivals");
        fetch(urlWithBusstop)
            .then(response => response.json())
            .then(body => {
                //console.log(body)
                const keys = Object.keys(body);
                const values = Object.values(body);
    
                body.sort((a,b) => {
                    const b_time = new Date(b.expectedArrival);
                    const a_time = new Date(a.expectedArrival);
                    return b_time - a_time;
                });
    
                const top5 = body.slice(0,5);
                top5.forEach(item => {
                console.log('bus :', item.lineId, 'arriving :', item.expectedArrival);
                })
            })
        
    }
 
}

// get the first journey from TFL API by inputting from and to location
function getJourneyPlanner(urlIn, fromLocation, toLocation) {
    
        let newUrl = urlIn.concat(fromLocation,'/to/',toLocation);  // add the postcode and stop id
        log(newUrl,'info');
        fetch(newUrl)
            .then(response => response.json())
            .then(body => {
                // console.log(body);
                const journeys = body["journeys"];
                const journey = journeys[0];
                const legs = journey["legs"];
                const leg = legs[0];
                // const instruction = leg["instruction"];
                // const summary = instruction["summary"];
                // const steps = instruction["steps"];
                let startDate = new Date(journey.startDateTime);
                let toDate = new Date(journey.arrivalDateTime);
                console.log('Journey start/end times:',startDate.toLocaleTimeString(), toDate.toLocaleTimeString());
                for (let eachLeg of legs) {
                    const instruction = eachLeg["instruction"];
                    const steps = instruction["steps"];
                    stepStartDate = new Date(eachLeg.departureTime);
                    stepFromDate = new Date(eachLeg.arrivalTime);
                    console.log('leg summary: ',instruction.summary, ', duration: ',eachLeg.duration,', departure/arrival times: ', stepFromDate.toLocaleTimeString(), ',',stepFromDate.toLocaleTimeString())
                    for(let step of steps) {
                        console.log('detailed Steps: ',step.descriptionHeading, step.description );
                    }
                }
            })
}

function getDisruption(urlIn, stopPointId) {
    
    let newUrl = urlIn.concat(fromLocation,'/disruption/');  // generate the URL required to get disruptions for a given stop point
    log(newUrl,'info');
    fetch(newUrl)
        .then(response => response.json())
        .then(body => {
            console.log(body);
            /*
            const journeys = body["journeys"];
            const journey = journeys[0];
            const legs = journey["legs"];
            const leg = legs[0];
            // const instruction = leg["instruction"];
            // const summary = instruction["summary"];
            // const steps = instruction["steps"];
            let startDate = new Date(journey.startDateTime);
            let toDate = new Date(journey.arrivalDateTime);
            console.log('Journey start/end times:',startDate.toLocaleTimeString(), toDate.toLocaleTimeString());
            for (let eachLeg of legs) {
                const instruction = eachLeg["instruction"];
                const steps = instruction["steps"];
                stepStartDate = new Date(eachLeg.departureTime);
                stepFromDate = new Date(eachLeg.arrivalTime);
                console.log('leg summary: ',instruction.summary, ', duration: ',eachLeg.duration,', departure/arrival times: ', stepFromDate.toLocaleTimeString(), ',',stepFromDate.toLocaleTimeString())
                for(let step of steps) {
                    console.log('detailed Steps: ',step.descriptionHeading, step.description );
                }
            }
                */
        })
        .catch( error => {console.log('no disruptions are stop point', stopPointId)})
}

/* 
1. get coordinates from postcodes
2. get 2 nearest stop points from postcodes
3. get arrival times of 5 buses from the stop points
4. get journey instructions from the postcode to the nearest stop point
*/
async function processData() {
    const [longitude, latitude] = await getCoordinatesFromPostCode();
   // const stopPointIds = await getStopPoints(longitude, latitude);
   try {
    const stopPointIds = await getStopPoints(longitude, latitude);
    if (stopPointIds.length <= 0) throw "No stop points found";
    try {
        await getArrivalTimes(stopPointIds);
        // get the steps from and to
        getJourneyPlanner(urlJourney, userPostCode,stopPointIds[0]);
        console.log('checking for disruptions');
        getDisruption(urlDisruption,stopPointIds[0]);

    }
    catch(err) {log('No buses from this stop','warn');
        console.log("No buses from this stop");
    }
   } catch(err) {
    log(`No stop points found for post code ${userPostCode}`, "error");
    console.log(`No stop points found for post code ${userPostCode}`);
   }
   

}



// log
function log(text, level) {
    switch (level) {
        case 'info':
            logger.info(text);
            break;
        case 'warn':
            logger.warn(text);
            break;
        case 'error':
            logger.error(text);
            break;
        default:
            logger.info(text);
            break;
    }
}





