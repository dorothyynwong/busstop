//const url = "https://api.tfl.gov.uk/StopPoint/490008660N";
const url = "https://api.tfl.gov.uk/StopPoint/";
const urlPostcode = 'https://api.postcodes.io/postcodes/E12 6UQ';

const prompt = require("prompt-sync")({ sigint: true });
//const userInput = prompt("Enter bus stop: ");
const userInput = "490008660N";

//console.log(userInput);

let urlWithBusstop = url.concat(userInput+"/Arrivals");
//console.log(urlWithBusstop);

/*let variable;
try {
const response = await fetch(“url.com”);
const variable = response;
if (response.status !== “200”) {
throw “Error!”;
} 
console.log(variable);
} catch (error) {
console.log(error);
}
console.log(“Ok!”);*/
let variable;
  async function fetchData() {
    try {
        const response = await fetch(urlPostcode);
        variable = response;
        
        const data = await response.json();
        
        return data["result"];
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Usage
async function processData() {
    const result = await fetchData();
    //result.forEach(item => console.log(item.longitude));
    let longitude = result["longitude"];
    let latitude = result["latitude"];
    //console.log(result["longitude"]);
    console.log(longitude, latitude);
}

processData();

//result.forEach(item => {console.log(item.longitude)});


/*fetchData().then(result => {
    //console.log('Fetched data:', result);
    result.forEach(item => {console.log(item.longitude)});
        
    });*/



/*
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

*/

