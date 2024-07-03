
const url = "https://api.tfl.gov.uk/StopPoint/";
const urlPostcode = 'https://api.postcodes.io/postcodes/';
//const urlStopcode = 'https://api.tfl.gov.uk/StopPoint/?lat=51.553814&lon=-0.143951&stopTypes=NaptanPublicBusCoachTram';


/*Test code*/
const userPostCode = "NW5 1NU"

const prompt = require("prompt-sync")({ sigint: true });
//const userInput = prompt("Enter bus stop: ");
//let userInput = "490008660N";

//console.log(userInput);

//let urlWithBusstop = url.concat(userInput+"/Arrivals");
//console.log(urlWithBusstop);

// get the longitude and latitute based on postcode
  async function fetchDataLoc(urlIn) {
    try {
        const response = await fetch(urlIn);
        const data = await response.json();
        return data["result"];
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchDataStop(urlIn) {
    try {
        const response = await fetch(urlIn);
        const data = await response.json();
        //console.log(data["stopPoints"][0]);
        return data["stopPoints"][0];
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the values
let longitude;
let latitude;
async function processData() {
    const result_loc = await fetchDataLoc(urlPostcode+userPostCode);
    longitude = result_loc["longitude"];
    latitude = result_loc["latitude"];

    const urlStopcode = `https://api.tfl.gov.uk/StopPoint/?lat=${latitude}&lon=${longitude}&stopTypes=NaptanPublicBusCoachTram`;
    const result_stop = await fetchDataStop(urlStopcode);
    const stopPointId = result_stop["id"];
    getArrivalTimes(stopPointId);
}

processData();

function getArrivalTimes(stopPoint) {

    let urlWithBusstop = url.concat(stopPoint+"/Arrivals");
    console.log(urlWithBusstop);




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

        //console.log(values);
        top5.forEach(item => {
           console.log('bus :', item.lineId, 'arriving :', item.expectedArrival);
          })

    });
    
}
