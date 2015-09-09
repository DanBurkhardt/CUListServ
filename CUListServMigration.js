//******************************
//Copyright 2015 Giganom, LLC 
//Developed by Dan Burkhardt, Columbia University
//******************************


//******************************
// Class Variables
//******************************
// Initializations
var userCookie = "YOUR AUTH KEY HERE";// Edit with your auth cookie (use firebug)
var listName = "YOUR LIST NAME HERE";// The exact spelling of your list name
var baseURL = "https://lists.columbia.edu/mailman/admin/";
// Escaped string from HTML source for each uniqure user email entry
var userEmailKey = "INPUT name=\"user\" type=\"HIDDEN\" value=\"";
var maxChunk = 0;
var totalAddresses = 0;

// Concat the base URL with the listname
var fullURL = baseURL+listName+"/members?";

// For each letter in the alphabet
var letterArray = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

// An empty array for dictionaries that contain data associated with a letter
var letterObjects = {};

// Add the filesystem module
var fs = require('fs');
// Add the async module
var async = require('async');
// Add the request module
var request = require('request');


// Iterate over the initial array and create the default email letter objects
for (var i = 0; i < letterArray.length; i++) {
	
	// Letter for the key
	var letter = letterArray[i];
	// Default chunk value (each page is referred to as a chunk)
	var defaultMaxChunk = 0;
	
	// Object
	var object = {
		'maxChunk': defaultMaxChunk,
		'addressArray': [],
		'iterations': 0,
		'complete':'no'
	};
	
	// Store it
	letterObjects[letter] = object;
	
}



// For storing addresses
var addressArray = [];
var totalEmailAddresses = "";

var iterations = 0;

var asyncTasks = [];



//******************************
// Class Methods
//******************************

for (var i = 0; i <= (letterArray.length+1); i++) {
	
	if (i < letterArray.length) {
		//console.log("added task for letter "+letterArray[i]);
		
		// Push a task into 
		asyncTasks.push(function(callback){
			setTimeout(function(){
				
				var specificIteration = iterations;
				
				// Concat the current letter into the url
				var concationatedLetterURL = fullURL+"letter="+letterArray[iterations];

				// First, get the max chunk number then pass in the letter and index
				getMaxChunkNumber(concationatedLetterURL,letterArray[iterations],iterations);

				if(iterations == letterArray.length) {
					console.log("It is finished");
				}
				
				// Simply increment every execution
				iterations++;

				callback(null, specificIteration);
			}, 5000);
		})
	}else if(i == (letterArray.length+1)){
		//console.log("Added final hold task to the stack");
		asyncTasks.push(function(callback){
			setTimeout(function(){
				
				console.log("Holdoff task..");
				

				callback(null, 1);
			}, 15000);
		});

	}else{
		//console.log("Added cleanup function to the task stack");
		asyncTasks.push(function(callback){
			setTimeout(function(){
				
				console.log("Running final tasks..");
				
				storeAndWriteToFile();

				callback(null, 1);
			}, 10000);
		});

	};
	//console.log(asyncTasks);
	
	//console.log(letterArray.length+1);
	if(i == letterArray.length){
		
		console.log("Tasks created for each page of the mailing list, running them now..");
		beginAsync();
		//console.log(asyncTasks);
		
	};
	
};



function beginAsync() {
	async.series(asyncTasks, function (err, results) {
		console.log("Listserv download complete.\n");
	
	})
}



function storeAndWriteToFile() {
	console.log("Writing all addresses to a comma separated text file..");
	
	// For each letter in the array
	for (var i = 0; i < letterArray.length; i++) {
		
		var currentLetter = letterArray[i];
		
		var currentLetterAddressArray = letterObjects[currentLetter].addressArray;
		
		//console.log("Letter array length: "+letterArray.length);
		//console.log("File writing current letter "+currentLetter);
		
		totalEmailAddresses += currentLetterAddressArray+",";
		
		
		if (currentLetter == 'z'){
			
			console.log("Total addresses: "+totalAddresses);
			
			var fileName = listName+"ListServ"+".txt"
			
			fs.writeFile(fileName, totalEmailAddresses, function(err) {
				if(err) {
					return console.log(err); 
				}

				console.log("The file was saved! You can find the output in the root folder.");
			}); 
		};
	};
};


function getMaxChunkNumber(concationatedLetterURL,letter,index) {
	
	//console.log("Testing pass-in, URL: "+concationatedLetterURL+", Letter: "+letter+", Index:"+index);
	
	var options = {
		url: concationatedLetterURL+"&chunk=0",
		headers: {
			'Cookie': userCookie,
			Host: 'lists.columbia.edu',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:40.0) Gecko/20100101 Firefox/40.0',
			Connection: 'keep-alive'
		}
	};

	function callback(error,response,body) {
		var currentTopIndex = "0";
		var topChunk = "0";
		var chunkWasChanged = false;
		//console.log("Response: "+JSON.stringify(response));
		
		while(body.search("chunk=") >= 0) {		
			
			// Get the current location of the start of the first chunk 
			currentTopIndex = body.search("chunk=");
			body = body.slice(currentTopIndex+6);
			chunkWasChanged = true;
			
		};
		
		
		// Get the index for the end of the string
		var topChunkLastSliceIndex = body.search("\"");
		// Cut the rest of the body out and leav only the number
		body = body.slice(0, topChunkLastSliceIndex);
		//console.log("Chunk in the body:"+body);
		
		
		// If the chunk was not changed, then keep it at zero
		if (chunkWasChanged){
			// Assign the body to the class-wide max chunk number
			letterObjects[letter].maxChunk = body;
		}else{
			letterObjects[letter].maxChunk = '0';
		};
		
		// Call with concatonated letter URL
		executeCall(concationatedLetterURL,letter);
		
	};
	
	// Test to see if the item was already processed
	if (letterObjects[letter].complete == 'no') {
		// Execute the request
		console.log("Extracting all addresses for the letter "+letter+" ..")
		request(options, callback)
	} else {
		console.log("Duplicate run for letter: "+letter+" denied.");
	};
};


function executeCall(concationatedLetterURL,letter) {
	//***********************************
	//	Request Related Objects
	//***********************************
		var newURL = "";
		
		var options = {
			url: newURL,
			headers: {
				'Cookie': userCookie,
				Host: 'lists.columbia.edu',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:40.0) Gecko/20100101 Firefox/40.0',
				Connection: 'keep-alive'
			}
		};

	function callback(error,response,body) {
		
		// Start the process of email extraction
		extractEmail(body,newURL,letter);
	};
	
		for (var i = 0; i <= letterObjects[letter].maxChunk; i++) {
			
			newURL = concationatedLetterURL+"&chunk="+i;
			
			options.url = newURL;
			
			request(options, callback);
			
			};
		;
		
	};


function extractEmail(body,url,letter) {
	
	var newBody = body;
	

	// If there is still an entry for a user's email address, this is the function to execute
	while(newBody.search(userEmailKey) >= 0){
		
		var bodySnapshot = newBody;
		//console.log("Body snapshot: "+bodySnapshot);
		
		// Process of slicing from either end to get the address
		var emailAddyStart = bodySnapshot.search(userEmailKey);// Starting index of the first email address
		var emailAddyWorkspace = bodySnapshot.slice(emailAddyStart);// Cut out everything before the address
		var emailStartString = emailAddyWorkspace.search("value=\"");// Index of the beginning of the address key
		var addressStart = emailAddyWorkspace.slice(emailStartString+7);// Beginning of the actual address
		var addressEndIndex = addressStart.search("\"");// Index of the end of the address
		var address= addressStart.slice(addressStart,addressEndIndex);// Cut out the actual address from the body
		
		address = address.replace("%40","@");// Replace the HTML @ char with the actual char
		
		// Debugging
		//console.log(address);
		
		// Push into the address array for the letter
		letterObjects[letter].addressArray.push(address);
		
		// Keep track of the total for later comparison
		totalAddresses++;
		
		// Reduce the original body section by removing everything up to this entry
		var slicingIndex = emailAddyStart+emailStartString+addressEndIndex;
		var editedBody = newBody.slice(slicingIndex);
		newBody = editedBody;
	};// END OF WHILE LOOP
	
	// Increment the class-wide increment tracker
	letterObjects[letter].iterations++;
	
	// Parse the string to an Int for evaluation
	var terminationPoint = parseInt(letterObjects[letter].maxChunk);
	//console.log("Max chunk from object: "+letterObjects[letter].maxChunk);
	
	// If the current iteration is the las one
	if(letterObjects[letter].iterations == (terminationPoint+1)){
		// Print the address array
		console.log("All addresses extracted, array for letter "+letter+" stored.");
		
		// Set the completion status
		letterObjects[letter].complete = 'yes';
	
	};// END OF TEST TO SEE IF THIS IS THE TERMINATION POINT
};// END OF EXTRACT EMAIL FUNCTION







