//const url = "https://api.tfl.gov.uk/StopPoint/490008660N";
const url = "https://api.tfl.gov.uk/StopPoint/";

const prompt = require("prompt-sync")({ sigint: true });
const userInput = prompt("Enter bus stop: ");

//console.log(userInput);

let urlWithBusstop = url.concat(userInput);
//console.log(urlWithBusstop);

fetch(urlWithBusstop)
    .then(response => response.json())
    .then(body => console.log(body));

