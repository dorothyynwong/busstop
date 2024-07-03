//const url = "https://api.tfl.gov.uk/StopPoint/490008660N";
const url = "https://api.tfl.gov.uk/StopPoint/";

const prompt = require("prompt-sync")({ sigint: true });
//const userInput = prompt("Enter bus stop: ");
const userInput = "490008660N";

//console.log(userInput);

let urlWithBusstop = url.concat(userInput+"/Arrivals");
//console.log(urlWithBusstop);


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

        //console.log(values);
        body.forEach(item => {
           console.log('bus :', item.lineId, 'arriving :', item.expectedArrival);
          })

    });



