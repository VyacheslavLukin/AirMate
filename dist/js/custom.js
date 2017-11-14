var mymap = L.map('map').setView([50.7343800, 7.0954900], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoienVpcmlzIiwiYSI6ImNqOXpoMXQxdDZhaGYzM3Bna2Z5eHoxMTIifQ.bEG8N1zXKtOA3RGxDoe9tg'
}).addTo(mymap);