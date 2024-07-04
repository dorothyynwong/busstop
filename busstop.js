/*const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'userInput.log' })
    ]
});

logger.info('What rolls down stairs');
logger.info('alone or in pairs,');
logger.info('and over your neighbors dog?');
logger.warn('Whats great for a snack,');
logger.info('And fits on your back?');
logger.error('Its log, log, log');*/

// initalise log 

const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: `busstop.log` })
    ]
});

const urlTFL = "https://api.tfl.gov.uk/StopPoint/";  //TFL API
const urlPostcode = 'https://api.postcodes.io/postcodes/';  //Postcodes API


const prompt = require("prompt-sync")({ sigint: true });
let userPostCode;
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

// get stop points from longitude, latitude
async function getStopPoints(longitude, latitude) {
    const urlStopcode = `${urlTFL}?lat=${latitude}&lon=${longitude}&stopTypes=NaptanPublicBusCoachTram&radius=500`;
    json = await fetchData(urlStopcode);
    //console.log(json);
    log(json, "info");
    const result_stop = json["stopPoints"][0]
    const result_stops = json["stopPoints"];
    result_stops.sort((a,b) => a.distance - b.distance);
    log(result_stops,"info");
    return result_stop["id"];
}

/*
async function getStopPoints(longitude, latitude) {
    const urlStopcode = `${urlTFL}?lat=${latitude}&lon=${longitude}&stopTypes=NaptanPublicBusCoachTram&radius=500`;
    json = await fetchData(urlStopcode)
    /*
    .then (body => {
        console.log(body)
        body.sort((a,b) => {
            const b_distance= new Date(b.distance);
            const a_distance = new Date(a.distance);
        return b_distance - a_distance;
        })
    });
    
   console.log(json["stopPoints.distance"]);
    //console.log(json);
    log(json, "info");
    const result_stop = json["stopPoints"][0];
    return result_stop["id"];
}
*/

//part 1: get top 5 arrival times and bus lines of a stop point
function getArrivalTimes(stopPoint) {
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

        });
    
}

async function processData() {
    const [longitude, latitude] = await getCoordinatesFromPostCode();
    const stopPointId = await getStopPoints(longitude, latitude);
    getArrivalTimes(stopPointId);
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


