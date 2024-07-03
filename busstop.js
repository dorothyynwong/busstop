//const url = "https://api.tfl.gov.uk/StopPoint/490008660N";
const url = "https://api.tfl.gov.uk/StopPoint/";
const urlPostcode = 'https://api.postcodes.io/postcodes/E12 6UQ';

const prompt = require("prompt-sync")({ sigint: true });
//const userInput = prompt("Enter bus stop: ");
let userInput = "490008660N";

//console.log(userInput);

//let urlWithBusstop = url.concat(userInput+"/Arrivals");
//console.log(urlWithBusstop);

// get the longitude and latitute based on postcode
  async function fetchData(urlIn) {
    try {
        const response = await fetch(urlIn);

        
        const data = await response.json();
        
        return data["result"];
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the values
let longitude;
let latitude;
async function processData() {
    const result = await fetchData(urlPostcode);
    //result.forEach(item => console.log(item.longitude));
    longitude = result["longitude"];
    latitude = result["latitude"];
    userInput= getBusStop(longitude, latitude);
    //console.log(userInput);
   // getArrivalTimes(userInput);
    //console.log(longitude, latitude);

}

processData();

function getBusStop(longitude, latitude) {
    console.log(longitude, latitude);
    urlToGetPostcode = 'https://api.tfl.gov.uk/StopPoint/?lat=51.553814&lon=-0.143951&stopTypes=NaptanPublicBusCoachTram';
}
/*function getBusStop(longitude, latitude)
{

    urlToGetPostcode = 'https://api.tfl.gov.uk/StopPoint/?lat=51.553814&lon=-0.143951&stopTypes=NaptanPublicBusCoachTram'
    async function fetchData2() {
        try {
            const response = await fetch(urlToGetPostcode);
            
            const data = await response.json();
            
            return data["result"];
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    
    // get the values
     async function processData2() {
        const result = await fetchData2();
        console.log(result);
        //result.forEach(item => console.log(item.longitude));
        //longitude = result["longitude"];
        //latitude = result["latitude"];
        //getArrivalTimes(longitude, latitude);
        //console.log(longitude, latitude);
    
    }
}*/


function getArrivalTimes(userInput) {

    let urlWithBusstop = url.concat(userInput+"/Arrivals");
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
