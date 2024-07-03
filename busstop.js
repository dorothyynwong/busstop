const url = "https://api.tfl.gov.uk/StopPoint/490008660N";

const prompt = require("prompt-sync")({ sigint: true });
const userInput = prompt("Enter bus stop: ");

console.log(userInput);

/*
fetch(url)
    .then(response => response.json())
    .then(body => console.log(body));

    */