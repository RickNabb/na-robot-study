/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

// these two variables are passed by the psiturk server process
// they tell you which condition you have been assigned to
var myCondition = condition;
var myCounterbalance = counterbalance;

/* ------------------------------------------- *
 * vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv *
 * ------------------------------------------- */

var allowUnfilled = false;

// Selecting current user's levels
var time = 300;
var surveyConditionNames = ["myConditionA", "myConditionB"];
var surveyConditionName = surveyConditionNames[myCondition % surveyConditionNames.length];

// All possible pages to be preloaded
var instructionPages = [
	"instructions/instruct-1.html",
	"instructions/instruct-2.html"
];

// The actual order of stages
var stages = [
	"text-example.html",
	"gif-example.html",
	"demographics.html",
	"postquestionnaire.html",
];


/* ------------------------------------------- *
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ *
 * ------------------------------------------- */


var pages = instructionPages.concat(stages);
psiTurk.preloadPages(pages);


// Task object to keep track of the current phase
var currentView;

const RADIO_CLASSNAME = ".radioArea";
const VIDEO_CLASSNAME = ".videoArea";
const TEXTBOX_CLASSNAME = ".textboxArea";
const TEXTINSERT_CLASSNAME = ".textinsertArea";
const CHECKBOX_CLASSNAME = ".checkboxArea";


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and
* insert them into the document.
*
********************/

/********************
* EXPERIMENT       *
********************/
var Experiment = function() {
	psiTurk.finishInstructions();
	psiTurk.recordTrialData({
		"phase": "INITIAL",
		"condition": surveyConditionName
	});
	var timeStart = performance.now();
	var puzzle;
	var vargame1Won = null;
	var currentPage = null;

	console.log("SurveyConditionName: " + surveyConditionName);

	// Set up the next page
	var next = function() {

		// Can't rightclick
		document.oncontextmenu = function() {
			return false;
		}

		// Done with HIT
		if (stages.length == 1) {
			finish();
			return;
		}

		// Display next page
		currentPage = stages.shift();
		psiTurk.showPage(currentPage);


		// Create elements on page
		createRadioAreas();
		createVideos();
		createTextInsertAreas();

		// Count elems initially loaded on this page
		// So that client doesn't change amount sent to server
		var radioNum = $(RADIO_CLASSNAME).length;
		var textNum = $(TEXTBOX_CLASSNAME).length;
		var checkboxNum = $(CHECKBOX_CLASSNAME).length;

		// Buttons on page
		$("#next").on("click", function() {
			finishPage(radioNum, textNum, checkboxNum);
		});
	}


/**************************
 *      CREATE AREAS      *
 **************************/
	// Puts radio buttons as table elements onto html page
	// REQUIRES IN HTML: <div class="radioArea" data-value="[NUM]">
	var createRadioAreas = function() {
		$(RADIO_CLASSNAME).each(function(groupIndex) {

			// Get from html the number of radio buttons to create
			var radioNum = $(this).data("value");

			// No radio buttons to create
			if (radioNum === undefined) {
				return;
			}

			// TODO make numbering start from previous
			// element's name="Q[NUM]..."

			// Create radio buttons
			for (var j = 0; j < radioNum; j++) {
				$(this).append(
					"<td><input "
					+ "type=\"radio\" "
					+ "name=\"Q" + groupIndex + "\" "
					+ "value=\"" + j + "\""
					+ "></td>"
				);
			}
		});
	}

	// REQUIRES IN HTML: <div class="videoArea" id="v[NUM]">
	// REQUIRES IN JS: v1, v2, ..., v[n] (video file name)
	// NOTE: Does not need to be v[n], just the variable name in the JS
	var createVideos = function() {
		// Set up each video
		$(VIDEO_CLASSNAME).each(function() {
			// Path of video to load
			var src = "/static/videos/" + eval($(this).attr("id"));


			// Give source
			$(this).append(
				"<video id='video'>"
				+ "<source src='" + src + "' type='video/mp4'/>"
				+ "</video>"
				+ "<div id='playButton'>"
				+ "</div>"
			);


			// Mouse events
			var playButton = $(this).find("#playButton");
			var vid = $(this).find("#video");


			// When play button clicked, play video
			playButton.on("click", function() {
				playButton.get(0).style.visibility = "hidden";
				vid.get(0).play();
			});
			// When video ends, reveal "next" button
			vid.on("ended", function() {
				$("#next").get(0).style.visibility = "visible";
			});
		});
	}


	// REQUIRES IN HTML: <div class="textinsertArea" id="t[NUM]">
	// REQUIRES IN JS: t1, t1, ..., t[n] (text to put in HTML)
	// NOTE: Does not need to be t[n], just the variable name in the JS
	var createTextInsertAreas = function() {
		$(TEXTINSERT_CLASSNAME).each(function(groupIndex) {

			// Get from html the number of radio buttons to create
			var src = eval($(this).attr("id"));

			// Give source
			$(this).append(
				"<p>"
				+ src
				+ "</p>"
			);
		});
	}


/**************************
 *      COLLECT DATA      *
 **************************/

	// Collects the info of each radio button on the page
	var collectRadioInputs = function(radioNum) {
		var radioAreas = $(RADIO_CLASSNAME);

		// Truncate/extend if client messed with number of radios
		radioAreas.length = radioNum;

		// Creates array of values from each radio group
		return radioAreas.map(function() {
			// Checked box(es) in the radio group
			var checkedboxes = $(this).find("input:checked");

			// Creates array of values of checked box(es)
			var result = checkedboxes.map(function() {
				return $(this).val();
			}).get();

			return result == null ? "-1" : result;
		}).get();
	}

	// Collects the info of each textbox on the page
	var collectTextInputs = function(textNum) {
		var textboxAreas = $(TEXTBOX_CLASSNAME);

		// Truncate/extend if client messed with number of text areas
		textboxAreas.length = textNum;

		// Creates array of values from each textbox group
		return textboxAreas.map(function() {
			// textbox(es) in the area
			var textboxes = $(this).find("input[type='text'],"
						   + "input[type='number'],"
						   + "textarea");

			// Creates array of values of textbox(es)
			var result = textboxes.map(function() {
				return $(this).val();
			}).get();

			// Every item must have some result
			return result == null ? "-1" : result;
		}).get();
	}

	// Collects the info of each button on the page
	var collectCheckboxInputs = function(checkboxNum) {
		var checkboxAreas = $(CHECKBOX_CLASSNAME);

		// Truncate/extend if client messed with number of text areas
		checkboxAreas.length = checkboxNum;

		// Creates array of checkbox values from each checkbox group
		return checkboxAreas.map(function() {
			// checkbox(es) in the area
			var checkboxes = $(this).find("input:checked");

			// Creates array of values of checkbox(es)
			var result = checkboxes.map(function() {
				return $(this).val();
			}).get();


			return result == null ? "-1" : result;
		}).get();
	}

	// Check if all input fields have been filled
	var allQueriesFilled = function() {

		// Count the page's total vs filled areas
		var radioTotal = $(RADIO_CLASSNAME).length;
		var radioFilled = $(RADIO_CLASSNAME).find(":checked").length;

		var textTotal = $(TEXTBOX_CLASSNAME).length;
		var textFilled = $(TEXTBOX_CLASSNAME).filter(function() {
			return $(this).find($("input[type='text'],"
					    + "input[type='number'],"
					    + "textarea")).filter(function() {
				return $(this).val().trim() != "";
			}).length > 0;
		}).length;

		var checkboxTotal = $(CHECKBOX_CLASSNAME).length;
		var checkboxFilled = $(CHECKBOX_CLASSNAME).filter(function() {
			return $(this).find("input:checked").length > 0;
		}).length;


		// Total questions/answers
		QuestionsTotal = radioTotal + textTotal + checkboxTotal;
		QuestionsFilled = radioFilled + textFilled + checkboxFilled;


		// Demographics: Must be 18+
		if (currentPage == "demographics.html"
		&& $(TEXTBOX_CLASSNAME).find("input[type='number']").val() < 18) {
			alert("Must be age 18+.  Please use numbers.");
			return false;
		}


		// Missing field(s)
		if (QuestionsFilled < QuestionsTotal) {

			// allowUnfilled: lets user not answer
			// Note: "demographics.html" always required filled
			if (allowUnfilled && currentPage != "demographics.html") {
				return confirm("Some questions have been "
				+ "left unanswered.  Are you sure you "
				+ "would like to continue?");
			}

			// Must fill everything
			alert("Missing field(s)");
			return false;
		}

		// No missing fields
		return true;
	}

	// Locally save info from page and show the next page
	var finishPage = function(radioNum, textNum, checkboxNum) {
		if (allQueriesFilled()) {
			// Collect arrays of inputs
			var r1 = collectRadioInputs(radioNum);
			var r2 = collectTextInputs(textNum);
			var r3 = collectCheckboxInputs(checkboxNum);
			var response = r1.concat(r2).concat(r3);


			// Skip next page?
			var radios = $(RADIO_CLASSNAME).find(":checked");
			radios = radios.filter(function() {
				return $(this).data("skipnext") == true;
			});
			if (radios != undefined && radios.length > 0) {
				stages.shift();
			}


			// if (response.length > 0) {
			// 	console.log({
			// 		"phase": "TEST",
			// 		"stage": currentPage,
			// 		"response": response
			// 	});
			// }


			// If there's something to record, record it
			if (response.length > 0) {
				psiTurk.recordTrialData({
					"phase": "TEST",
					"stage": currentPage,
					"response": response
				});
			}

			next();
			window.scrollTo(0,0);
		}
	}

	// Completed survey
	var finish = function() {
		var timeEnd = performance.now();
		var timeTotal = timeEnd - timeStart;

		psiTurk.recordTrialData({
			"phase": "TESTEND",
			"total_time": timeTotal
		});

		currentView = new Questionnaire();
	}

	// Start the test
	next();
}


/****************
* Questionnaire *
****************/

var Questionnaire = function() {

	// Click to resubmit to server
	prompt_resubmit = function() {
		document.body.innerHTML = "<h1>Oops!</h1><p>Something went "
		+ "wrong submitting your HIT. This might happen if you lose "
		+ "your internet connection. Press the button to resubmit."
		+ "</p><button id='resubmit'>Resubmit</button>";

		$("#resubmit").click(resubmit);
	}

	// Try to resubmit to server
	resubmit = function() {
		document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
		reprompt = setTimeout(prompt_resubmit, 10000);

		psiTurk.saveData({
			success: function() {
				clearInterval(reprompt);
				// when finished saving, compute bonus and quit
				psiTurk.computeBonus('compute_bonus', function() {
					psiTurk.completeHIT();
				});
			},
			error: prompt_resubmit
		});
	}

	// Load the questionnaire snippet
	psiTurk.showPage('postquestionnaire.html');

	// Save locally
	psiTurk.recordTrialData({
		"phase":"postquestionnaire",
		"status":"begin"
	});

	// Submit to server
	$("#next").click(function () {
		//record_responses();
		psiTurk.saveData({
			success: function() {
				// when finished saving compute bonus and quit
				//psiTurk.computeBonus('compute_bonus', function() {
					psiTurk.completeHIT();
				//});
			},
			error: prompt_resubmit
		});
	});
}


/*******************
 * Run Task
 ******************/
$(window).load(function() {
	// A list of pages you want to display in sequence
	// And then what you want to do when you are done with instructions
	psiTurk.doInstructions(instructionPages, function() {
		currentView = new Experiment();
	});
});
