
const url = "https://api.tfl.gov.uk/StopPoint/";
const urlPostcode = 'https://api.postcodes.io/postcodes/';


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

// get the values

async function processData() {
    let json = await fetchData(urlPostcode+userPostCode);
    const result_loc = json["result"];
    const longitude = result_loc["longitude"];
    const latitude = result_loc["latitude"];

    const urlStopcode = `${url}?lat=${latitude}&lon=${longitude}&stopTypes=NaptanPublicBusCoachTram`;
    json = await fetchData(urlStopcode);
    const result_stop = json["stopPoints"][0]
    const stopPointId = result_stop["id"];
    getArrivalTimes(stopPointId);
}

processData();

//part 1
function getArrivalTimes(stopPoint) {
    let urlWithBusstop = url.concat(stopPoint+"/Arrivals");
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
