require("dotenv").config()

let fs = require("fs")
let request = require("request")
let twitter = require("twitter")
let tumblr = require("tumblr")
let spotifyAPI = require("node-spotify-api")
let keys = require("./keys.js")

let nodeArgs = process.argv
let command = process.argv[2]
let userInput = ""

// loops through to capture all of the words in the song or movie name and stores them in the userInput string.
function storeInput() {
	for (let i = 3; i < nodeArgs.length; i++) {
		userInput = userInput + " " + nodeArgs[i]
	}
	console.log("Searching for: " + userInput + "\n")
}

//function to call and return tumblr posts.
function myTumblr() {
	let client = new tumblr.Blog('sandynism.tumblr.com', keys.tumblr)

	client.posts({limit: 20 }, function (err, data) {
		if (err) {
			return console.log(err)
		}

		console.log("\nHere are my latest Tumblr posts:\n\n")
		fs.appendFile("log.txt", "\nHere are my latest Tumblr posts:\n\n", function (err) {
			if (err) {
				console.log(err)
			}
		})

		for (let i = 0; i < 20; i++) {
			console.log("Type: " + data.posts[i].type + 
			"\nLink: " + data.posts[i].post_url + 
			"\nPosted on: " + data.posts[i].date + 
			"\n---------------\n")

			fs.appendFile("log.txt", 
			"Type: " + data.posts[i].type + 
			"\nLink: " + data.posts[i].post_url +  
			"\nPosted on: " + data.posts[i].date + 
			"\n---------------\n", function (err) {

				if (err) {
					console.log(err)
				}
			})
		}
	})
}

// function to call and return tweets (if they gave me the api key).
function myTweets() {
	let client = new twitter(keys.twitter)
	let params = { screen_name: "sandynism" }

	client.get("statuses/user_timeline", params, function (error, tweets, response) {
		if (error) {
			return console.log(error)
		}

		console.log("\nHERE ARE THE LAST 20 TWEETS:\n\n")
		fs.appendFile("log.txt", "\nHERE ARE THE LAST 20 TWEETS:\n\n", function (err) {
			if (err) {
				console.log(err)
			}
		})

		// loops through the returned tweets object and console.logs the most recent 20 tweets and when they were tweeted.
		for (let i = 0; i < 20; i++) {
			console.log(tweets[i].text + "\nTweeted on: " + tweets[i].created_at + "\n---------------\n")

			fs.appendFile("log.txt", tweets[i].text + "\nTweeted on: " + tweets[i].created_at + "\n---------------\n", function (err) {

				if (err) {
					console.log(err)
				}
			})
		}
	})
}

// function to call and return user's provided song.
function spotifyThisSong() {
	storeInput()

	let spotify = new spotifyAPI(keys.spotify)
	let query

	if (userInput !== "" && userInput !== null) {
		query = userInput
	} else {
		query = "Here Comes The Sun"
	}

	spotify.search({ type: "track", query: query }, function (err, data) {
		if (err) {
			return console.log("Error occurred: " + err)
		}

		console.log("\nTHE SONG YOU REQUESTED:\n\n" +
			"Artist: " + data.tracks.items[0].album.artists[0].name +
			"\nSong: " + query +
			"\nAlbum: " + data.tracks.items[0].album.name +
			"\nPreview link: " + data.tracks.items[0].album.artists[0].external_urls.spotify +
			"\n---------------\n")

		fs.appendFile("log.txt", "\nTHE SONG YOU REQUESTED:\n\n" +
			"Artist: " + data.tracks.items[0].album.artists[0].name +
			"\nSong: " + query +
			"\nAlbum: " + data.tracks.items[0].album.name +
			"\nPreview link: " + data.tracks.items[0].album.artists[0].external_urls.spotify +
			"\n---------------\n",
			function (err) {

				if (err) {
					console.log(err)
				} else {
					console.log("Song added!")
				}
			})
	})
}

// function to call and return user's provided movie.
function movieThis() {
	storeInput()
	let movieName

	if (userInput !== "" && userInput !== null) {
		movieName = userInput
	} else {
		movieName = "Crazy Rich Asians"
	}

	let queryURL = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy"
	console.log(queryURL)

	request(queryURL, function (err, response, body) {
		if (!err && response.statusCode === 200) {

			console.log("\nTHE MOVIE YOU REQUESTED:\n\n" +
				"Title: " + JSON.parse(body).Title +
				"\nYear: " + JSON.parse(body).Year +
				"\nIMDB Rating: " + JSON.parse(body).imdbRating +
				"\nCountry: " + JSON.parse(body).Country +
				"\nLanguage: " + JSON.parse(body).Language +
				"\nPlot: " + JSON.parse(body).Plot +
				"\nActors: " + JSON.parse(body).Actors +
				"\n---------------\n")

			fs.appendFile("log.txt", "\nTHE MOVIE YOU REQUESTED:\n\n" +
				"Title: " + JSON.parse(body).Title +
				"\nYear: " + JSON.parse(body).Year +
				"\nIMDB Rating: " + JSON.parse(body).imdbRating +
				"\nCountry: " + JSON.parse(body).Country +
				"\nLanguage: " + JSON.parse(body).Language +
				"\nPlot: " + JSON.parse(body).Plot +
				"\nActors: " + JSON.parse(body).Actors +
				"\n---------------\n",
				function (err) {

					if (err) {
						console.log(err)
					} else {
						console.log("Movie added!")
					}
				})
		}
	})
}

function doWhatItSays() {
	fs.readFile("random.txt", "utf8", function (err, data) {
		if (err) {
			return console.log(err)
		}

		// stores the returned data as an array, split where there are commas.
		let dataArray = data.split(",")
		console.log(dataArray)

		// sets the command and user query by index number.
		command = dataArray[0]
		userInput = dataArray[1]

		switch (command) {
			case "my-tweets":
				myTweets()
				break

			case "spotify-this-song":
				spotifyThisSong()
				break

			case "movie-this":
				movieThis()
				break

			case "my-tumblr-posts":
				myTumblr()
				break
		}
	})
}

// a switch-case statement that will determine which function to run.
switch (command) {
	case "my-tweets":
		myTweets()
		break

	case "spotify-this-song":
		spotifyThisSong()
		break

	case "movie-this":
		movieThis()
		break

	case "my-tumblr-posts":
		myTumblr()
		break

	case "do-what-it-says":
		doWhatItSays()
		break
}