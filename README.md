# N/A Trust Study

#### Authors: Nick Rabb, Theresa Law, Meia Chita-Tegmark

## Table of Contents

* [Installation](#installation)
* [Navigating the Project](#navigating-the-project)
* [Creating New Pages](#creating-new-pages)

## 💾 Installation

This project contains files necessary to run a study on PsiTurk - an Amazon Mechanical Turk package. For instructions on how to interact with the HRI Lab PsiTurk platform, please check out the [Wiki Page](https://hrilab.tufts.edu/wiki/index.php/Psiturk_Studies).

> Note: You need to be using **Python 2** in order to use PsiTurk. All the below `python` commands should be using Python 2.7 or lower. See [docs](https://psiturk.readthedocs.io/en/stable/install.html) for more info.

To run/develop this experiment locally, you will need to install some Python libraries. To do this, you can use `pip`. To make sure you have `pip` installed on your machine, simply run the command:

```
$ pip --version
```

And you should see something like:

```
pip 20.1 from /usr/local/lib/python2.7/dist-packages/pip (python 2.7)
```

If you need to install `pip`, run (on Ubuntu):

```
$ sudo apt install python-pip
```


We need to install the `psiturk` package, so run

```
$ python -m pip install psiturk
```

> Note: You can run all of the experimental setup inside of a virtual Python environment as well. These instructions do not cover that. It is a fairly big package, so you may want to have a predefined 'psiturk' environment you set up.

Once you have installed `psiturk` installed, you can confirm that you can run the study by running:

```
$ python herokuapp.py
```

You should be able now to navigate to `localhost:22361` in your browser to verify that the PsiTurk page is running.

## 🧭 Navigating the Project

There are a handful of directories and files that are useful for us to take a look at. Let's go in order of the study. But first let's point out important directories in the project.

### Directories

#### `/templates`

This directory contains all of the `.html` files - the pages of the study. Each of them is a web page that gets displayed in the browser as the user goes through the study.

#### `/static`

This directory contains all of the files that are not web pages - images we use, videos, sound, and the JavaScript file that runs the actual study. Accordingly, images are in the `images/` subdirectory, videos could be in a `/videos` subdirectory, and we find the main JavaScript file in the `/js` subdirectory.

### Notable Specific Files

Now let's turn to some specific files in the project. Keep in mind the directories that are listed above when we're referencing where files exist. Now we will go in order of the study.

#### `js/task.js`

This is the main file that runs the whole study. There are a series of specific lines of code that we will explicate later on in this file, but for now, just know that this is _the_ file to go to if there is something wrong with the process of the study; i.e. if you need to change the order of pages, if you want to do any kind of different timings, etc.

#### `templates/consent.html`

This file is the page that displays the consent form. If you want to make any edits to the consent form, this is the place to do it.

For now, those are the main files to worry about when considernig the unchanging important files in the project.

## 🎨 Creating New Pages

Okay, now let's say that you want to create two new pages: a new instructions page, and a new study page. How do we do that? Let's find out.

### New Instructions Page

The first thing that we'd need to do to create a new instructions page is to create the actual page itself. It will be a `.html` file, and we should put it in the `templates/instructions` subdirectory. Let's say we add a new page called `driving-instructions.html`:

```html
<div id="container-instructions">
  <!-- Our instructions -->
  <h1>Driving Instructions</h1>
  <hr />
  <!-- 'well' means to have the instructions have a gray background -->
  <div class="instructions well">
    <p>
      To drive, put your foot on the pedal and press slowly. If you press too hard, you will crash into the cars in front of you. If you press too lightly, you will not go anywhere.
    </p>
  </div>
  <hr />
  <!-- Navigation bar for the bottom of the page -->
  <div class="instructionsnav">
    <div class="row">
      <div class="col-xs-8">
        <center>
          <!-- Make a button so the user can go to the next instructions page -->
          <button type="button" id="next" value="next" class="btn btn-success btn-lg continue">
            Next<span class="glyphicon glyphicon-arrow-right"></span>
          </button>
        </center>
      </div>
    </div>
  </div>
</div>
```

This may look complicated, but we can break it down. If you are really confused and stuck, please check out some HTML tutorials online. They are way better than what I can describe here.

Our instructions page generally has 3 sections: (1) The title, "Driving Instructions"; (2) the instructions, in the `<div class="instructions well">`; and (3) the navigation bar at the bottom with a "Next -->" button. The page can be more complicated than this, but this would be a pretty simple baseline. 

Next, we'd need to add this page to the list of instructions pages in the `task.js` file:

```js
...

// Selecting current user's levels
var time = 300;
var surveyConditionNames = ["myConditionA", "myConditionB"];
var surveyConditionName = surveyConditionNames[myCondition % surveyConditionNames.length];

// All possible pages to be preloaded
var instructionPages = [
  "instructions/instruct-ready.html",
  "instructions/driving-instructions.html" // <- We added that!
];

...
```

That's all there is to adding a new instructions page. It should now be displayed after the `instructions/instruct-ready.html` page.

### New Study Page

As far as adding a new study page goes, it is largely the same procedure as adding a new instructions page, but with a slightly different file and edit in the `task.js` file. Let's say we want to add a questionnaire page that asks people about demographics. Let's first make a `.html` file in the `templates/` directory called `demographics.html`:

```html
<!DOCTYPE html>
<div id="container-exp">
	<div id="trial">
		<p>
			Please answer the following questions about yourself:
		</p>
		<br /> <br />
		<div class="textboxArea">
			<p>How old are you (in years)?  Please use numbers.</p>
			<input type="text" name="Q1"><br>
		</div>
		<br> <br>
		<div class="radioArea">
			<p>What is your gender identity?</p>
			<input type="radio" name="Q2" value="male">Male<br>
			<input type="radio" name="Q2" value="female">Female<br>
			<input type="radio" name="Q2" value="nonbinary">Non-Binary<br>
			<input type="radio" name="Q2" value="other">Other<br>
			<input type="radio" name="Q2" value="noanswer">Prefer not to answer<br>
		</div>
  </div>
</div>
```

As you can see, this file asks participants two questions: how old they are, and what their gender identity is. Each of these questions is contained within a `<div>` with different `class=''` attributes. Let's first take a look at the age question.

Here, we have:

```html
<div class="textboxArea">
  <p>How old are you (in years)? Please use numbers.</p>
  <input type="text" name="Q1" /><br/>
</div>
```

The notable features of this is that the question is surrounded in a `<div class="textboxArea">`. That piece of code is important because it tells the `task.js` file to do something special with it when data is collected. If we did not have that part, no data would be collected.

We can also notice `<input type="text" name="Q1" />`. This is a standard HTML input, so if you want to know more about the `type=''` attribute, I recommend looking up HTML tutorials. What's important for our purpose is the `name="Q1"` attribute; that tells the study to record this result against a data field called "Q1".

If we turn our attention to the second part of the questionnaire page:

```html
<div class="radioArea">
  <p>What is your gender identity?</p>
  <input type="radio" name="Q2" value="male">Male<br>
  <input type="radio" name="Q2" value="female">Female<br>
  <input type="radio" name="Q2" value="nonbinary">Non-Binary<br>
  <input type="radio" name="Q2" value="other">Other<br>
  <input type="radio" name="Q2" value="noanswer">Prefer not to answer<br>
</div>
```

we can see that we have similar things to notice. Here, the main `<div>` wrapper has an attribute `class="radioArea"`. That's because we are collecting data with a series of radio buttons here. We need that `class` attribute to be as such so `task.js` knows what type of data to collect. Further, we see here that each radio button has `name="Q2"` as an attribute. From what we saw in the last piece, we can assume now that whatever choice the participant makes for this field will be collected under the title "Q2" in the data.

If further explanation as to what each input is doing, or even what a radio button is, is needed, I would again recommend looking up HTML tutorials. The final piece for this is very similar to what we did for our instructions page: we need to add this to the `task.js` file so the page will appear for participants:

```js
...

// All possible pages to be preloaded
var instructionPages = [
	"instructions/instruct-ready.html"
];

// The actual order of stages
var stages = [
	"p01-intro.html",
	"demographics.html", // <- We added our page there!
	"postquestionnaire.html",
];

...
```

It's plain to see that here, we added the string with our file name, `demographics.html`, to the `stages` array - which contains all the pages the participant will need to go through to complete the study.