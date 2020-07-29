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
var surveyConditionNames = ["control", "na"];
var surveyConditionName = surveyConditionNames[myCondition % surveyConditionNames.length];

// All possible pages to be preloaded
var instructionPages = [
	"instructions/procedure1.html",
	"instructions/procedure2.html",
];

///////////////////////////
// N/A STUDY SPECIFIC STUFF
///////////////////////////

const vignettePages = [
	'vignette1.html',
	'vignette2.html',
	'vignette3.html',
	'vignette4.html',
];

const vignette1Followup = [ 'malle_Q7', 'jianEtAl_Q4', 'heerinkEtAl_Q1', 'jianEtAl_Q12' ];
const vignette2Followup = [ 'ghazali_Q3', 'malle_Q1', 'schaefer2_Q4', 'schaefer2_Q8' ];
const vignette3Followup = [ 'malle_Q8', 'schaefer1_Q4', 'malle_Q3', 'cameron_Q2' ];
const vignette4Followup = [ 'malle_Q10', 'schaefer1_Q2', 'jianEtAl_Q7', 'schaefer2_Q3' ];

/**
 * An object to keep track of specific responses per vignette.
 * Structure: { 'vignette': [responses] }
 */
const followupResponses = {};

let naResponses = {};
const naResponseLength = () => Object.values(naResponses).reduce((len, responses) => len + responses.length, 0);

// The actual order of stages
var experimentPages = [
	'vignette1-vid.html',
	'vignette1.html',
	'vignette1-followup.html',
	'vignette2-vid.html',
	'vignette2.html',
	'vignette2-followup.html',
	'vignette3-vid.html',
	'vignette3.html',
	'vignette3-followup.html',
	'vignette4-vid.html',
	'vignette4.html',
	'vignette4-followup.html',
	'na-followup.html',
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

		if (surveyConditionName === 'na') {
			pool = pool.concat(naAnswers);
		}

		const randAnswer = pool[Math.floor(Math.random() * pool.length)];
		$(radioArea).find('.choices').find(`input:radio[value='${randAnswer}']`).attr('checked', true);
	})
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

	console.log("SurveyConditionName: " + surveyConditionName);

	// Set up the next page
	var next = function() {

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

		// Create preliminary elements on the page - these MUST GO IN
		// FRONT OF THE PRIMITIVE QUESTION ELEMENT CREATION
		createLikertUniformAreas();
		createLikertVariableAreas();
		createPercentAreas();

		// Create primitive question elements on page
		createRadioAreas();
		createVideos();
		createTextInsertAreas();

		// N/A study-specific things

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

			measureItem.before(`<p>On the previous page, you answered the following question:</p>`);

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
			const suretyLikert = createLikertUniformRadioAreas(suretyData, `${measureItemName}_surety`)[0];
			measureItem.after(suretyLikert);

			const difficultyLikert = createLikertUniformRadioAreas(difficultyData, `${measureItemName}_difficulty`)[0];
			measureItem.after(difficultyLikert);
		}

		const addNaFollowupQuestions = (measureItemName, vignette) => {
			const measureItem = $(`#${measureItemName}`);
			const formatVignette = v => v.replace('.html', '').replace('vignette', 'Scenario ');
			// Create follow-up questions
			measureItem.after(`<div class='textboxArea container'>
				<div class="row"><p>If you chose 'Other,' please explain here:</p></div>
				<div class="row"><textarea class="col-xs-10" name='${measureItemName}_na_other' /></div>
			`);
			measureItem.after(`<div class='radioArea container'>
				<div class="row"><p>You chose N/A to rate the above item for <strong>${formatVignette(vignette)}</strong>. Why?</p></div>
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
			if (naResponseLength() > 5) {
				const shorterNaResponses = {};
				while (responseQuestions.length < 5) {
					const pages = Object.keys(naResponses);
					const randPage = pages[Math.floor(Math.random() * pages.length)];
					const questions = naResponses[randPage];
					const randQuestion = questions[Math.floor(Math.random() * questions.length)];

					responseQuestions.push(randQuestion);

					// We don't want exact duplicates
					if (shorterNaResponses[randPage] !== undefined && shorterNaResponses[randPage].indexOf(randQuestion) > -1) {
						continue;
					}

					// Collect a shorter version of the na responses that preserves
					// which vignette the answers came from.
					if (shorterNaResponses[randPage] === undefined) {
						shorterNaResponses[randPage] = []
					}
					shorterNaResponses[randPage].push(randQuestion);
				}
				naResponses = shorterNaResponses;
			} else {
				responseQuestions = Object.keys(naResponses).reduce((questions, page) => {
					const res = naResponses[page];
					res.vignette = page;
					questions = questions.concat(res);
					return questions;
				});
			}
			return responseQuestions;
		}

		// Add N/A options for the experimental condition
		if (surveyConditionName === 'na') {
			naConditionModifications();
		}

		if (currentPage === 'na-followup.html') {
			collectNaResponses();
			console.log(naResponses);
			Object.keys(naResponses).map(vignette => {
				const measures = naResponses[vignette];
				const vignetteNum = vignette.replace('.html','').replace('vignette','');
				measures.map(measureObj => {
					const measureItemName = measureObj.id;
					const measure = measureItemName.substring(0, measureItemName.indexOf('_'));
					const measureIndex = Number(measureItemName.substring(measureItemName.indexOf('Q')+1));
					const vignetteMeasureId = `v${vignetteNum}_${measure}`;

					const data = JSON.parse(JSON.stringify(MEASURES[measure]));
					data.item = data.items[measureIndex-1];

					let measureEl;
					switch (data.type) {
						case MEASURE_TYPES.LIKERT_UNIFORM:
							measureEl = createLikertUniformRadioArea(data, vignetteMeasureId, measureIndex);
							$(`#${vignette.replace('.html','')}`).append('<div class="likert likertUniform"></div>');
							break;
						case MEASURE_TYPES.LIKERT_VARIABLE:
							measureEl = createLikertVariableRadioArea(data, vignetteMeasureId, measureIndex);
							$(`#${vignette.replace('.html','')}`).append('<div class="likert likertVariable"></div>');
							break;
						case MEASURE_TYPES.PERCENT:
							measureEl = createPercentRadioArea(data, vignetteMeasureId, measureIndex);
							$(`#${vignette.replace('.html','')}`).append('<div class="likert percent"></div>');
							break;
						default:
					}
					$(`#${vignette.replace('.html','')}`).children().last().append(measureEl);
					$(`#${vignette.replace('.html','')}`).children().last().append('<hr />');
					addNaChoices(`v${vignetteNum}_${measureItemName}`, data.type);
				});
			});

			Object.keys(naResponses).map(vignette => {
				const measures = naResponses[vignette];
				const vignetteNum = vignette.replace('.html','').replace('vignette','');
				measures.map(measureObj => {
					const vignetteMeasureId = `v${vignetteNum}_${measureObj.id}`;
					deactivateAndSelectMeasureItem(vignetteMeasureId, measureObj.val);
					addNaFollowupQuestions(vignetteMeasureId, vignette);
				});
			});

			// Activate vignette tabs
			$('#vignette-tabs a').click(function (e) {
			  e.preventDefault()
  			$(this).tab('show')
			})
		}
		// On follow-up pages, remove all unrelevant measures, and fill & disable relevant ones
		else if (currentPage.indexOf('followup') > -1) {
			const measures = Object.keys(MEASURES);
			let toKeep;
			switch (currentPage) {
				case 'vignette1-followup.html':
					toKeep = vignette1Followup;
					break;
				case 'vignette2-followup.html':
					toKeep = vignette2Followup;
					break;
				case 'vignette3-followup.html':
					toKeep = vignette3Followup;
					break;
				case 'vignette4-followup.html':
					toKeep = vignette4Followup;
					break;
			}
			measures.map(measure => {
				MEASURES[measure].items.map((item, i) => {
					const measureItemName = `${measure}_Q${i+1}`;
					if (toKeep.indexOf(measureItemName) > -1) {
						const responses = followupResponses[currentPage.replace('-followup', '')];
						const val = responses[measureItemName];
						deactivateAndSelectMeasureItem(measureItemName, val);
						addFollowupQuestions(measureItemName);
					} else {
						removeMeasureItem(measureItemName);
					}
				});
			});
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
		if (vignettePages.indexOf(currentPage) > -1 && surveyConditionName === 'na') {
			$('#na_extra_likert').append('If you feel that the statement or descriptor in the question does not apply to the robot in this scenario, or does not apply to robots in general, use the appropriate NA option.')
			$('#na_extra_percent').append('If you feel that descriptor does not apply to the robot in this scenario, or does not apply to robots in general, use the appropriate NA option.')
		}
	}

	const storeResponsesLocally = (currentPage, responses) => {
		let ids;

		switch(currentPage) {
			case 'vignette1.html':
				ids = vignette1Followup;
				break;
			case 'vignette2.html':
				ids = vignette2Followup;
				break;
			case 'vignette3.html':
				ids = vignette3Followup;
				break;
			case 'vignette4.html':
				ids = vignette4Followup;
				break;
			default:
		}
		followupResponses[currentPage] = ids.reduce((accum, id) => {
			const response = responses.find(res => res.id === id);
			return !!response ? Object.assign(accum, { [response.id]: response.val }) : accum;
		}, {});
		naResponses[currentPage] = responses.filter(res => ['na', 'na-robot'].indexOf(res.val) > -1 );
	}

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

	// Locally save info from page and show the next page
	var finishPage = function(radioNum, textNum, checkboxNum) {
		if (allQueriesFilled()) {
			// Collect arrays of inputs
			var r1 = collectRadioInputs(radioNum);
			var r2 = collectTextInputs(textNum);
			var r3 = collectCheckboxInputs(checkboxNum);
			var response = r1.concat(r2).concat(r3);

			// N/A specific code
			if (vignettePages.indexOf(currentPage) > -1) {
				storeResponsesLocally(currentPage, r1);
			}
			// Skip the na-followup page if it's the control condition or
			// if its the N/A condition with no N/A responses
			else if ((currentPage === 'vignette4-followup.html' && surveyConditionName === 'control') ||
				(currentPage === 'vignette4-followup.html' && naResponseLength() === 0)) {
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
