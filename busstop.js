const url = "https://api.tfl.gov.uk/StopPoint/490008660N";

fetch(url)
    .then(response => response.json())
    .then(body => console.log(body));