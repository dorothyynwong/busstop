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

        //console.log(values);
        body.forEach(item => {
            //console.log('Item:', item);
           // console.log('Line ID:', item.lineId);
           // console.log('Line Name:', item.lineName);
           // console.log('Expected Arrival:', item.expectedArrival);
           console.log('bus :', item.lineId, 'arriving :', item.expectedArrival);
          })

    });

 /*   const myObject = { name: 'Alice', age: 30, city: 'Wonderland' };
    const nameValue = myObject['name'];
    console.log(nameValue); // 'Alice'*/
    


