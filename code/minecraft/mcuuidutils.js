var PNGImage = require('pngjs-image');var pad = require('pad-left');var request = require('request');function getColoursFromUUID(code, topad, callback) {	var colours = []; // Array of colours	PNGImage.readImage(('https://crafatar.com/avatars/' + code + '?size=8'), // Url to get heads 	function(err, image) {	if (err) throw err;	var colour; // Variable colour is stored in on retreival from image	for (var i = 0; i < image.getHeight(); i++) { // For every line of pixels (height)		for (var j = 0; j < image.getWidth(); j++) { // For every pixel			colour = (image.getColor(j, i)).toString(16); // Get a Hex colour			colour = pad(colour, 6, 0) // Make it full width			if (topad) { // Whether to add hex colour symbol				colour = "#" + colour;			}			colours.push(colour); // And add to the array of colours		}	}	if (callback) {		callback(colours);	}});	}function getUUIDFromUsername(username, callback) {	request('http://minecraft-techworld.com/admin/api/uuid?action=uuid&username=' + username, function(error, response, body) {		if (error) throw error;		if (!error && response.statusCode == 200) {			//console.log((JSON.parse(body)).output);			if (callback) {				var uuid = ((JSON.parse(body)).output);				callback(uuid);			}		}	});}// ExamplegetUUIDFromUsername("01_", uuid => {	getColoursFromUUID(uuid, true, colours => {	console.log(colours);});});