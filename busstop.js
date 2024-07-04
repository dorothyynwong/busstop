
const urlTFL = "https://api.tfl.gov.uk/StopPoint/";  //TFL API
const urlPostcode = 'https://api.postcodes.io/postcodes/';  //Postcodes API


const prompt = require("prompt-sync")({ sigint: true });
const userPostCode = prompt("Enter post code: ");

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
    const urlStopcode = `${urlTFL}?lat=${latitude}&lon=${longitude}&stopTypes=NaptanPublicBusCoachTram`;
    json = await fetchData(urlStopcode);
    const result_stop = json["stopPoints"][0]
    return result_stop["id"];
}
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

processData();


