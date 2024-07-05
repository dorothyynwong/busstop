
// initalise log 

const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        //new winston.transports.Console(),
        new winston.transports.File({ filename: `busstop.log` })
    ]
});

const urlTFL = "https://api.tfl.gov.uk/StopPoint/";  //TFL API
const urlPostcode = 'https://api.postcodes.io/postcodes/';  //Postcodes API
const urlJourney = "https://api.tfl.gov.uk/Journey/JourneyResults/NW51TL/to/490008660N" // journey planner API


const prompt = require("prompt-sync")({ sigint: true });
let userPostCode;
let userRadius = 200;
let postcodeCheck = false;


while (!postcodeCheck) {
    userPostCode = prompt("Enter post code: ");

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

userRadius = prompt("Enter radius: ");
if (userRadius <0 ) userRadius = 200;

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


function getJourneyPlanner(urlIn) {
    
  //  for(let stopPoint of stopPoints) {
        //let urlWithBusstop = urlTFL.concat(stopPoint+"/Arrivals");
        fetch(urlIn)
            .then(response => response.json())
            .then(body => {
                //console.log(body);
                const journeys = body["journeys"];
                const journey = journeys[0];
                const legs = journey["legs"];
                const leg = legs[0];
                const instruction = leg["instruction"];
                const summary = instruction["summary"];
                const steps = instruction["steps"];
                console.log(summary);
                for(let step of steps) {
                    console.log(instruction.summary,':',step.descriptionHeading, step.description);
                }
               // const step = steps[0];
               // console.log(step.description);
                //console.log([legs][instruction][steps][descriptionHeading])
 
            })
        
   // }
 
}


async function processData() {
    const [longitude, latitude] = await getCoordinatesFromPostCode();
   // const stopPointIds = await getStopPoints(longitude, latitude);
   try {
    const stopPointIds = await getStopPoints(longitude, latitude);
    if (stopPointIds.length <= 0) throw "No stop points found";
    try {
        await getArrivalTimes(stopPointIds);
    }
    catch(err) {log('No buses from this stop','warn')}
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

//initaliseLog("userInput.log");

// only process if the postcode is valid
if (postcodeCheck)
{
    processData();
}
// get the steps from and to
getJourneyPlanner(urlJourney);


