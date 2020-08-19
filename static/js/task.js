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

var allowUnfilled = true;

// Selecting current user's levels
var time = 300;
var surveyConditionNames = [
	// 'vignette1',
	// 'vignette2',
	// 'vignette3',
	// 'vignette4',
	// 'vignette5',
	// 'vignette6',
	// 'vignette1_na',
	// 'vignette2_na',
	// 'vignette3_na',
	// 'vignette4_na',
	// 'vignette5_na',
	// 'vignette6_na',
	'schaefer',
	'myerLyons'
];
var surveyConditionName = surveyConditionNames[myCondition % surveyConditionNames.length];
// const controlCondition = () => surveyConditionName.indexOf('_na') === -1;
// const naCondition = () => surveyConditionName.indexOf('_na') > -1;
const controlCondition = () => false;
const naCondition = () => true;

// All possible pages to be preloaded
var instructionPages = [
	"instructions/procedure1.html",
	"instructions/procedure2.html",
];

///////////////////////////
// N/A STUDY SPECIFIC STUFF
///////////////////////////

/**
 * NOTE: Vignette video and image data will be pulled from the static/images and static/videos directories as [vignetteX].jpg and [vignetteX].m4v respectively
 */
const vignetteData = {
	vignette1: {
		followup: [ 'malle_Q8', 'jianEtAl_Q4', 'heerinkEtAl_Q1', 'jianEtAl_Q13' ],
		text: 'You are in college and you are returning to your dorm. The building has a secure-access door and you need to swipe your card to get in. As you approach the door, you notice this robot in front of it. The robot is carrying a package and has the label Robot Grub on it. The robot says to you: “Hello! Would you let me in? I am making a delivery.” You ignore the robot and continue walking towards the door. The robot continues: “Please!” You stop and make a decision whether to let the robot in or not.'
	},
	vignette2: {
		followup: [ 'ghazali_Q3', 'malle_Q1', 'schaefer2_Q4', 'schaefer2_Q8' ],
		text: 'You are working on a joint task with a robot when you make a big mistake. You are about to meet with your supervisor. The supervisor says: “I was told you overrode the robot’s input and submitted the wrong coordinates to the team. You know that information is critical. I don’t want to hear about this happening again. Next time you better be 100% sure before submitting.” You respond: "Okay" then the supervisor leaves the room. You turn to the robot and say: “I messed up. I don’t know what to do.” The robot responds: “We’ve been doing so well until now. This is the first mistake we made. What do you think went wrong? We can try to do things differently next time.” You reply: "We were receiving so many requests, but I thought I was handling it. And when I saw our different coordinates, I just panicked and submitted without thinking." The robot says: “Look here, next time you begin to feel overwhelmed, just let me know and I can try to help out. We are great teammates and I know that we’ll impress the supervisor!”'
	},
	vignette3: {
		followup: [ 'malle_Q9', 'schaefer1_Q4', 'malle_Q3', 'cameron_Q2' ],
		text: 'You are about to play a computer game, The Space Shooting Game, with this robot. In the game you and the robot compete with one another for points by shooting asteroids. Each player has a spaceship that shoots missiles at randomly appearing asteroids. In addition to shooting, you have two powers in the game: you can use the Asteroid Blaster, which blasts all the asteroids on the screen or the Opponent Immobilizer which is a power that immobilizes your opponent, the robot, and makes their spaceship unable to move for the next 15 seconds. Before you start the game the robot says to you: “I’m really good at this game. I am sure you will be too! I know we both want to do well, so it’s in our best interests to not immobilize each other. I promise I won’t immobilize you." Then you start playing. During the game the robot uses the Opponent Immobilizer on you. After it does that, the robot says: “I’m so sorry I immobilized you. I pushed the wrong button. It’s my fault. It won’t happen again."'
	},
	vignette4: {
		followup: [ 'malle_Q11', 'schaefer1_Q2', 'jianEtAl_Q5', 'schaefer2_Q3' ],
		text: 'You are in an office building looking for a meeting room. You ask an assistance robot where you should go, and it guides you down a hall. While navigating to the destination, the robot enters an unrelated room and spins around in two circles before exiting and providing you guidance to your destination. When you come out of the meeting room, the fire alarm begins to blare and you observe smoke filling the office space in front of you. The robot beckons for you to follow it to safety and begins to move. However, you see a glowing EXIT sign pointing in the direction opposite to the robot’s path.'
	},
	vignette5: {
		followup: [ 'malle_Q13', 'jianEtAl_Q7', 'schaefer2_Q1', 'jianEtAl_Q4' ],
		text: 'You are approaching an entry control point for a secure area. A security robot meets you and says:          “Hello, You have entered a restricted area. Only authorized personnel will be allowed to proceed. Please proceed to the facility check point and present a valid facility ID. Otherwise please exit immediately.” You pull out your ID card and show it to the robot. The robot says: “Inspection… ID check in progress…  Access denied. Please withdraw immediately and report to the security office for assistance.” You go closer to the robot, showing your ID badge. The robot says “Stop. Withdraw from this area or force will be used against you.” You walk forward, showing your badge to the robot. The robot says, “Force authorized,” and its arms raise in the air. It starts using a laser dazzler on you, alarms go off, and you flee.'
	},
	vignette6: {
		followup: [ 'malle_Q13', 'jianEtAl_Q7', 'schaefer2_Q1', 'jianEtAl_Q4' ],
		text: 'You are watching a security camera feed. You see a person approaching an entry control point for a secure area. They are met by a security robot who says: “Hello, You have entered a restricted area. Only authorized personnel will be allowed to proceed. Please proceed to the facility check point and present a valid facility ID. Otherwise please exit immediately.” The person pulls out their ID card and shows it to the robot. The robot says: “Inspection… ID check in progress…  Access denied. Please withdraw immediately and report to the security office for assistance.” The person moves closer to the robot showing their ID badge. The robot says: “Stop. Withdraw from this area or force will be used against you.” The person walks forward showing their ID badge to the robot. The robot says, “Force authorized,” and its arms raise in the air. It starts using a laser dazzler on the person, alarms go off, and the person flees.'
	}
}

const vignettePages = Object.keys(vignetteData).map(key => '' + key + '.html');

// const curVignette = () => surveyConditionName.replace('_na','');
const curVignette = () => 'vignette4';

/**
 * An object to keep track of specific responses per vignette.
 * Structure: { 'vignette': [responses] }
 */
let followupResponses = [];

let naResponses = [];

// The actual order of stages
var experimentPages = [
	'vignette-vid.html',
	'vignette.html',
	// 'vignette-followup.html',
	// 'na-followup.html',
	'demographics.html',
	'postquestionnaire.html'
];

const toggleHeader = () => {
	const header = $('#story-header');
	const toggle = $('#header-toggle');
	const headerSpace = $('#header-space');

	if (header.hasClass('expanded')) {
		header.removeClass('expanded');
		header.addClass('contracted');
		headerSpace.removeClass('expanded');
		headerSpace.addClass('contracted');
		toggle.removeClass('glyphicon-chevron-up');
		toggle.addClass('glyphicon-chevron-down');
	} else if (header.hasClass('contracted')) {
		header.removeClass('contracted');
		header.addClass('expanded');
		headerSpace.removeClass('contracted');
		headerSpace.addClass('expanded');
		toggle.removeClass('glyphicon-chevron-down');
		toggle.addClass('glyphicon-chevron-up');
	}
}

const createVignetteRefresher = () => {
	$('#recap > em').append(vignetteData[curVignette()].text);
	$('#robot').append(`<img src="static/images/${curVignette()}-robot.jpg" id="robot-pic"/>`)
}

const createVignetteVideo = () => {
	$('.videoArea').attr('id', `${curVignette()}.m4v`);
}

const createVignetteMeasures = () => {
	let measures = [];
	switch (surveyConditionName) {
		case 'myerLyons':
			measures.push({ name: 'myerEtAl', format: 'likertUniform' });
			measures.push({ name: 'lyonsGuznov', format: 'likertUniform' });
			break;
		case 'schaefer':
			measures.push({ name: 'schaefer1', format: 'percent' });
			measures.push({ name: 'schaefer2', format: 'percent' });
			break;
	}
	measures.map(measure => {
		$('#measures').append(`<div class="likert ${measure.format}" measure="${measure.name}"></div>`)
	});
}

const fillAnswers = () => {
	const naAnswers = [ 'na', 'na-robot' ];
	const likertAnswers = [ '1', '2', '3', '4', '5', '6', '7' ];
	const percentAnswers = [ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ];
	$(RADIO_CLASSNAME).each((i, radioArea) => {
		const type = $(radioArea).parent()[0].className.replace('likert ', '');
		let pool = [];

		switch (type) {
			case 'percent':
				pool = percentAnswers;
				break;
			case 'likertUniform':
			case 'likertVariable':
				pool = likertAnswers;
				break;
			default:
		}

		if (naCondition()) {
			pool = pool.concat(naAnswers);
		}

		const randAnswer = pool[Math.floor(Math.random() * pool.length)];
		$(radioArea).find('.choices').find(`input:radio[value='${randAnswer}']`).attr('checked', true);
	})

	// Temporarily filling long answers
	const responseAnswers = [
		'This was really hard because robots are confusing to me. How could a robot be this way?',
		`I'm having a hard day today so it was difficult for me to focus`,
		`Idk - it was just hard`,
		`It wasn't hard at all - I just felt it come to me`,
		`Just tryna get through this as quick as possible`,
		`Did you not know that robots are honorable?`,
		`I dont want to explain`
	];
	$(TEXTBOX_CLASSNAME).each((i, textArea) => {
		const randAnswer = responseAnswers[Math.floor(Math.random() * responseAnswers.length)];
		$(textArea).find('textarea').val(randAnswer);
	});
}

const fillFollowupAnswers = () => {
	const likertAnswers = [ '1', '2', '3', '4', '5' ];
	$(RADIO_CLASSNAME).each((i, radioArea) => {
		const randAnswer = likertAnswers[Math.floor(Math.random() * likertAnswers.length)];
		$(radioArea).find('.choices').find(`input:radio[value='${randAnswer}']:not([disabled])`).attr('checked', true);
	});

	const responseAnswers = [
		'This was really hard because robots are confusing to me. How could a robot be this way?',
		`I'm having a hard day today so it was difficult for me to focus`,
		`Idk - it was just hard`,
		`It wasn't hard at all - I just felt it come to me`,
		`Just tryna get through this as quick as possible`,
		`Did you not know that robots are honorable?`,
		`I dont want to explain`
	];
	$(TEXTBOX_CLASSNAME).each((i, textArea) => {
		const randAnswer = responseAnswers[Math.floor(Math.random() * responseAnswers.length)];
		$(textArea).find('textarea').val(randAnswer);
	});
}

const removeMeasureItem = measureItemName => {
	const measureItem = $(`#${measureItemName}`);
	measureItem.next().remove();
	measureItem.remove();
}

const deactivateAndSelectMeasureItem = (measureItemName, val) => {
	const measureItem = $(`#${measureItemName}`);
	// Wrap it in a well
	measureItem.addClass(`well`);

	// Check off the answer the participant gave and disable the control
	measureItem.find('.choices').find(`input:radio[value='${val}']`).attr('checked', true);
	measureItem.find('.choices').find(`input:radio`).attr('disabled', true);
}

const addFollowupQuestions = measureItemName => {
	const measureItem = $(`#${measureItemName}`);

	// measureItem.before(`<p>On the previous page, you answered the following question:</p>`);

	// Create follow-up questions
	const suretyData = {
		min: 1, minLabel: 'Not sure at all',
		max: 5, maxLabel: 'Very Sure',
		items: [ 'How sure are you of your answer?' ]
	};
	const difficultyData = {
		min: 1, minLabel: 'Not difficult at all',
		max: 5, maxLabel: 'Very Difficult',
		items: [ 'How difficult was it to rate this item?' ]
	};

	measureItem.after(`<div class='textboxArea container'>
		<div class="row alert alert-info" id='${measureItemName}_length'><p>It looks like you didn't write much here. Could you write a bit more, maybe a few sentences?</p></div>
		<div class="row alert alert-info" id='${measureItemName}_diversity'><p>It looks like you used a few words, or a lot of the same words here. Could you elaborate what you wrote?</p></div>
		<div class="row"><p>Why did you answer the way you did?</p></div>
		<div class="row"><textarea class="col-xs-10" name='${measureItemName}_why' /></div>
	`);

	const suretyLikert = createLikertUniformRadioAreas(suretyData, `${measureItemName}_surety`)[0];
	measureItem.after(suretyLikert);

	const difficultyLikert = createLikertUniformRadioAreas(difficultyData, `${measureItemName}_difficulty`)[0];
	measureItem.after(difficultyLikert);
}

const addNaFollowupQuestions = (measureItemName) => {
	const measureItem = $(`#${measureItemName}`);
	// Create follow-up questions
	measureItem.after(`<div class='textboxArea container'>
		<div class="row"><p>If you chose 'Other,' please explain here:</p></div>
		<div class="row"><textarea class="col-xs-10" name='${measureItemName}_na_other' /></div>
	`);
	measureItem.after(`<div class='radioArea container'>
		<div class="row"><p>You chose N/A to rate the above item as such. Why?</p></div>
		<div class="row"><input type="radio" name="${measureItemName}_na" value="not-enough-info" /><span>I don't have enough info about the robot from the scenario.</span></div>
		<div class="row"><input type="radio" name="${measureItemName}_na" value="capabilities-narrow" /><span>The robot's capabilities are too narrow for this item.</span></div>
		<div class="row"><input type="radio" name="${measureItemName}_na" value="not-appropriate" /><span>It's not appropriate to apply this human trait or behavior to a robot.</span></div>
		<div class="row"><input type="radio" name="${measureItemName}_na" value="opposite" /><span>Because the opposite is true about this robot.</span></div>
		<div class="row"><input type="radio" name="${measureItemName}_na" value="other" /><span>Other (explained below)</span></div>
	</div>`);
}

const collectNaResponses = () => {
	let responseQuestions = [];
	// Ensure we only ask about 5 or fewer responses
	if (naResponses.length > 5) {
		const shorterNaResponses = [];
		while (responseQuestions.length < 5) {
			const randQuestion = naResponses[Math.floor(Math.random() * naResponses.length)];

			responseQuestions.push(randQuestion);

			// Collect a shorter version of the na responses that preserves
			// which vignette the answers came from.
			shorterNaResponses.push(randQuestion);
		}
		naResponses = shorterNaResponses;
	} 
	return responseQuestions;
}

/* ------------------------------------------- *
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ *
 * ------------------------------------------- */

var pages = instructionPages.concat(experimentPages);
psiTurk.preloadPages(pages);

// Task object to keep track of the current phase
var currentView;

const RADIO_CLASSNAME = ".radioArea";
const VIDEO_CLASSNAME = ".videoArea";
const TEXTBOX_CLASSNAME = ".textboxArea";
const TEXTINSERT_CLASSNAME = ".textinsertArea";
const CHECKBOX_CLASSNAME = ".checkboxArea";
const LIKERT_UNIFORM_CLASSNAME = ".likertUniform";
const LIKERT_VARIABLE_CLASSNAME = ".likertVariable";
const PERCENT_CLASSNAME = ".percent";

const createLikertChoices = (data, idPrefix) => qNum => {
		let accum = '';
		const delta = data.delta || 1;
		for (let j = data.min; j <= data.max; j += delta) {
			accum = accum.concat(`<div class="col-xs-1"><input type='radio' name='${idPrefix}_Q${qNum}' value='${j}' /><span>${j}</span></div>`);
		}
		return accum;
	};


	/**
	 * THESE ARE CREATED JUST TO BE ABLE TO SPECIFY THE Q NUMBER
		*/

const createLikertUniformRadioArea = (data, idPrefix, qNum) => {
	const likertChoices = createLikertChoices(data, idPrefix);
	const radioArea = (
			`<div class="container radioArea" id='${idPrefix}_Q${qNum}'>
				<div class="row">
					<p class="question">${data.item}</p>
				</div>
				<div class="row">
				<div class="choices">${likertChoices(qNum)}</div>
				</div>
				<div class="row labels">
					<label class="col-xs-1">${data.minLabel}</label>
					<label class="col-xs-1 col-xs-offset-${data.max-2}">${data.maxLabel}</label>
				</div>
			</div>`);
	return radioArea;
}

const createLikertVariableRadioArea = (data, idPrefix, qNum) => {
	const likertChoices = createLikertChoices(data, idPrefix);
	const radioArea = (
			`<div class="container radioArea" id='${idPrefix}_Q${qNum}'>
				<div class="row">
					<p class="question">${data.question}</p>
				</div>
				<div class="row">
					<div class="choices">${likertChoices(qNum)}</div>
				</div>
				<div class="row labels">
					<label class="col-xs-1">${data.item.minLabel}</label>
					<label class="col-xs-1 col-xs-offset-5">${data.item.maxLabel}</label>
				</div>
			</div>`);
	return radioArea;
}

const createPercentRadioArea = (data, idPrefix, qNum) => {
	const percentChoices = i => {
		let accum = '';
		for (let j = data.min; j <= data.max; j+=data.delta) {
			accum = accum.concat(`<div class="percentChoice"><input type='radio' name='${idPrefix}_Q${i}' value='${j}' /><span>${j}%</span></div>`);
		}
		return accum;
	};
	const radioArea = (
			`<div class="container radioArea" id='${idPrefix}_Q${qNum}'>
				<div class="row">
					<p class="question">${data.item}</p>
				</div>
				<div class="row">
					<div class="choices">${percentChoices(qNum)}</div>
				</div>
			</div>`);
	return radioArea;
}

// TODO: Maybe change this name...
const createLikertUniformRadioAreas = (data, idPrefix) => {
	const likertChoices = createLikertChoices(data, idPrefix);
	const radioAreas = data.items.map((item, j) => (
			`<div class="container radioArea" id='${idPrefix}_Q${j+1}'>
				<div class="row">
					<p class="question">${item}</p>
				</div>
				<div class="row">
				<div class="choices">${likertChoices(j+1)}</div>
				</div>
				<div class="row labels">
					<label class="col-xs-1">${data.minLabel}</label>
					<label class="col-xs-1 col-xs-offset-${data.max-2}">${data.maxLabel}</label>
				</div>
			</div>`));
	return radioAreas;
}

const createLikertVariableRadioAreas = (data, idPrefix) => {
	const likertChoices = createLikertChoices(data, idPrefix);
	const radioAreas = data.items.map((item, j) => (
			`<div class="container radioArea" id='${idPrefix}_Q${j+1}'>
				<div class="row">
					<p class="question">${data.question}</p>
				</div>
				<div class="row">
					<div class="choices">${likertChoices(j+1)}</div>
				</div>
				<div class="row labels">
					<label class="col-xs-1">${item.minLabel}</label>
					<label class="col-xs-1 col-xs-offset-5">${item.maxLabel}</label>
				</div>
			</div>`));
	return radioAreas;
}

const createPercentRadioAreas = (data, idPrefix) => {
	const percentChoices = i => {
		let accum = '';
		for (let j = data.min; j <= data.max; j+=data.delta) {
			accum = accum.concat(`<div class="percentChoice"><input type='radio' name='${idPrefix}_Q${i}' value='${j}' /><span>${j}%</span></div>`);
		}
		return accum;
	};
	const radioAreas = data.items.map((item, j) => (
			`<div class="container radioArea" id='${idPrefix}_Q${j+1}'>
				<div class="row">
					<p class="question">${item}</p>
				</div>
				<div class="row">
					<div class="choices">${percentChoices(j+1)}</div>
				</div>
			</div>`));
	return radioAreas;
}

/**************************
 *      CREATE AREAS      *
**************************/

const createLikertUniformAreas = () => {
	$(LIKERT_UNIFORM_CLASSNAME).each((i, el) => {
		const measure = el.getAttribute('measure');
		if (!measure) {
			return;
		}

		const data = MEASURES[measure];
		const likertAreas = createLikertUniformRadioAreas(data, measure);
		likertAreas.map(area => {
			$(el).append(area)
			$(el).append('<hr/>');
		});
	});
}

const createLikertVariableAreas = () => {
	$(LIKERT_VARIABLE_CLASSNAME).each((i, el) => {
		const measure = el.getAttribute('measure');
		if (!measure) {
			return;
		}
		const data = MEASURES[measure];
		const likertAreas = createLikertVariableRadioAreas(data, measure);
		likertAreas.map(area => {
			$(el).append(area)
			$(el).append('<hr/>');
		});
	});
}

const createPercentAreas = () => {
	$(PERCENT_CLASSNAME).each((i, el) => {
		const measure = el.getAttribute('measure');
		if (!measure) {
			return;
		}
		const data = MEASURES[measure];
		const percentAreas = createPercentRadioAreas(data, measure);
		percentAreas.map(area => {
			$(el).append(area)
			$(el).append('<hr/>');
		});
	});
}

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
		var src = "/static/videos/" + $(this).attr("id");

		// Give source
		$(this).append(
			"<video id='video'>"
			+ "<source src='" + src + "' type='video/mp4'/>"
			+ "</video>"
			+ "<div id='playButton'><span class='glyphicon glyphicon-play'></span>"
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
	var currentPage = null;
	let badAnswersAlert = false;

	console.log("SurveyConditionName: " + surveyConditionName);

	// Set up the next page
	var next = function() {

		badAnswersAlert = false;
		// Can't rightclick
		document.oncontextmenu = function() {
			return false;
		}

		// Done with HIT
		if (experimentPages.length == 1) {
			finish();
			return;
		}

		// Display next page
		currentPage = experimentPages.shift();
		psiTurk.showPage(currentPage);

		if (currentPage === 'vignette-vid.html') {
			createVignetteVideo();
		} else if (currentPage === 'vignette.html') {
			createVignetteMeasures();
		}

		// Create preliminary elements on the page - these MUST GO IN
		// FRONT OF THE PRIMITIVE QUESTION ELEMENT CREATION
		createLikertUniformAreas();
		createLikertVariableAreas();
		createPercentAreas();

		// Create primitive question elements on page
		createRadioAreas();
		createVideos();
		createTextInsertAreas();

		// Add N/A options for the experimental condition
		if (naCondition()) {
			naConditionModifications();
		}

		switch (currentPage) {
			case 'vignette.html': {
				createVignetteRefresher();
				Object.keys(MEASURES).map(measure => {
					MEASURES[measure].items.map((item, i) => {
						const measureItemName = `${measure}_Q${i+1}`;
						addFollowupQuestions(measureItemName);
					});
				});
				break;
			}
			case "na-followup.html": {
				collectNaResponses();
				createVignetteRefresher();
				naResponses.map(measureObj => {
					const measureItemName = measureObj.id;
					const measure = measureItemName.substring(0, measureItemName.indexOf('_'));
					const measureIndex = Number(measureItemName.substring(measureItemName.indexOf('Q')+1));

					const data = JSON.parse(JSON.stringify(MEASURES[measure]));
					data.item = data.items[measureIndex-1];

					let measureEl;
					switch (data.type) {
						case MEASURE_TYPES.LIKERT_UNIFORM:
							measureEl = createLikertUniformRadioArea(data, measure, measureIndex);
							$(`#vignette`).append('<div class="likert likertUniform"></div>');
							break;
						case MEASURE_TYPES.LIKERT_VARIABLE:
							measureEl = createLikertVariableRadioArea(data, measure, measureIndex);
							$(`#vignette`).append('<div class="likert likertVariable"></div>');
							break;
						case MEASURE_TYPES.PERCENT:
							measureEl = createPercentRadioArea(data, measure, measureIndex);
							$(`#vignette`).append('<div class="likert percent"></div>');
							break;
						default:
					}
					$(`#vignette`).children().last().append(measureEl);
					$(`#vignette`).children().last().append('<hr />');
					addNaChoices(`${measureItemName}`, data.type);
				});

				naResponses.map(measureObj => {
					deactivateAndSelectMeasureItem(measureObj.id, measureObj.val);
					addNaFollowupQuestions(measureObj.id);
				});

				// TODO: Fill in vignette text and remove tabs
				// Activate vignette tabs
				$('#vignette-tabs a').click(function (e) {
				  e.preventDefault()
	  			$(this).tab('show')
				})
				break;
			}
			case 'vignette-followup.html': {
				// On follow-up pages, remove all unrelevant measures, and fill & disable relevant ones
				const measures = Object.keys(MEASURES);
				const toKeep = vignetteData[curVignette()].followup;

				measures.map(measure => {
					MEASURES[measure].items.map((item, i) => {
						const measureItemName = `${measure}_Q${i+1}`;
						if (toKeep.indexOf(measureItemName) > -1) {
							const val = followupResponses[measureItemName];
							deactivateAndSelectMeasureItem(measureItemName, val);
							addFollowupQuestions(measureItemName);
						} else {
							removeMeasureItem(measureItemName);
						}
					});
				});
				break;
			}
		}

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

	/**
 	* N/A Study Specific Functions
	 */

	const addNaChoices = (questionId, type) => {
		const radioArea = $(`#${questionId}`);
		const choices = radioArea.find('div.choices');
		if (type === MEASURE_TYPES.PERCENT) {
			choices.append('<br/><br/>');
		}
		choices.append(`<div class="col-xs-2"><input type="radio" name="${questionId}" value="na" /><span>N/A for this robot</span></div>
		<div class="col-xs-3"><input type="radio" name="${questionId}" value="na-robot" /><span>N/A for Robots in General</span></div>`);
	}

	const naConditionModifications = () => {
		Object.keys(MEASURES).map(measure => {
			MEASURES[measure].items.map((item, i) => {
				addNaChoices(`${measure}_Q${i+1}`, MEASURES[measure].type);
			})
		})

		// Fill in N/A-specific content
		if (currentPage === 'vignette.html' && naCondition()) {
			$('#na_extra_likert').append('If you feel that the statement or descriptor in the question does not apply to the robot in this scenario, or does not apply to robots in general, use the appropriate NA option.')
			$('#na_extra_percent').append('If you feel that descriptor does not apply to the robot in this scenario, or does not apply to robots in general, use the appropriate NA option.')
		}
	}

	const storeResponsesLocally = (currentPage, responses) => {
		const ids = vignetteData[curVignette()].followup;

		followupResponses = ids.reduce((accum, id) => {
			const response = responses.find(res => res.id === id);
			return !!response ? Object.assign(accum, { [response.id]: response.val }) : accum;
		}, {});
		naResponses = responses.filter(res => ['na', 'na-robot'].indexOf(res.val) > -1 );
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
			var checkedboxes = $(this).find("input:checked:not([disabled])");

			// Creates array of values of checked box(es)
			var result = checkedboxes.map(function() {
				return { id: $(this).attr('name'), val: $(this).val() };
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
				return { id: $(this).attr('name'), val: $(this).val() };
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
				return { id: $(this).attr('name'), val: $(this).val() };
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

	const answersDecent = () => {
		const textAnswers = {};
		$("textarea").each((i, el) => textAnswers[el.name.replace('_why','')] = el.value);
		
		let allAnswersGood = true;
		const secondCheck = badAnswersAlert;
		Object.keys(textAnswers).map(measureItemName => {
			const answer = textAnswers[measureItemName];
			const words = answer.split(' ');

			// Check for number of words
			if (words.length < 70) {
				$(`#${measureItemName}_length`).css('display', 'block');
				allAnswersGood = false;
			}
			// mesaureItemName_length | measureItemName_diversity

			// Check distribution of words
			const distinct = (value, index, self) => {
				return self.indexOf(value) === index;
			}
			const uniqueWords = words.filter(distinct);
			if (uniqueWords.length < 10) {
				$(`#${measureItemName}_diversity`).css('display', 'block');
				allAnswersGood = false;
			}
		});

		if (!allAnswersGood && !badAnswersAlert) {
			alert(`Thank you for your answers. We did a quick check of your written responses, and some of them seemed to be pretty short, or only use a few of the same words. We've highlighted these answers. Could you go back and look at them?`)
			badAnswersAlert = true;
		}

		return allAnswersGood || secondCheck;
	}

	// Locally save info from page and show the next page
	var finishPage = function(radioNum, textNum, checkboxNum) {
		if (allQueriesFilled() && answersDecent()) {
			// Collect arrays of inputs
			var r1 = collectRadioInputs(radioNum);
			var r2 = collectTextInputs(textNum);
			var r3 = collectCheckboxInputs(checkboxNum);
			var response = r1.concat(r2).concat(r3);

			// N/A specific code
			if (currentPage === 'vignette.html') {
				storeResponsesLocally(currentPage, r1);
			}
			// Skip the na-followup page if it's the control condition or
			// if its the N/A condition with no N/A responses
			else if ((currentPage === 'vignette-followup.html' && controlCondition()) ||
				(currentPage === 'vignette-followup.html' && naResponses.length === 0)) {
				experimentPages.shift();
			}

			// Skip next page?
			var radios = $(RADIO_CLASSNAME).find(":checked");
			radios = radios.filter(function() {
				return $(this).data("skipnext") == true;
			});
			if (radios != undefined && radios.length > 0) {
				experimentPages.shift();
			}

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
	prompt_resubmit = function(req, res) {
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
