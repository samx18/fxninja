'use strict';
var request = require('request');
var cc = require('currency-codes');
const speech = require('./speech.json');
const url1 = "http://api.fixer.io/latest?base="
const currencyCodes = ['AUD','CAD','CHF','CYP','CZK','DKK','EEK','GBP','HKD','HUF','ISK','JPY','KRW','LTL','LVL','MTL','NOK',
  'NZD','PLN','ROL','SEK','INR','SGD','SIT','SKK','TRL','USD','ZAR','EUR'];
const url2 = "&symbols="
let base = 'USD'
var countries = cc.countries();

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession,cardOutput) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: title,
            content: cardOutput,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = speech.greet;
    const cardOutput = speech.greet;
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = speech.reprompt;
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardOutput));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = speech.bye;
    const cardOutput = speech.bye;
    const shouldEndSession = true;
    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession,cardOutput));
}


function getExchangeRate(base,symbol,callback){

	request.get(url1+base+url2+symbol, function(err,res,body){
		console.log(body);
		var info = JSON.parse(body); // convert JSON to JS Object
		//console.log(info); // Debug
		//console.log(info.rates[symbol]);
		callback(info.rates[symbol])
	});

}

function getExchangeDetails(intent,session,callback){
  const cardTitle = "Exchange Rate Details";
  let country = intent.slots.Country.value;
  let currencySymbol ='';
  let repromptText = '';
  let sessionAttributes = {};
  let shouldEndSession = false;
  let speechOutput = '';
  let cardOutput = '';
  if(typeof country != 'undefined'){ // handle if intent is invoked without any value
    country=country.toLowerCase(); // convert country to lower case
    if (countries.indexOf(country) > -1){ // check if the country is part of the list of countries in the 'currency-codes' npm
      var ccCode = cc.country(country); // get list object for the specified ountry
      currencySymbol=ccCode[0].code // get currency symbol from the list
    }else{
      speechOutput = speech.unsupported+speech.bye;
      cardOutput = speech.invalidcard;
      shouldEndSession = true;
      callback(sessionAttributes,
                   buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardOutput));
    }
  }
  else{
    speechOutput = speech.repormpt;
    cardOutput = speech.greet;
    repromptText = speech.repormpt;
    shouldEndSession = true;
    callback(sessionAttributes,
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardOutput));
  }
  currencySymbol = currencySymbol.toUpperCase();
  console.log(currencySymbol); //Debug
  if (currencyCodes.indexOf(currencySymbol) > -1){
    getExchangeRate(base,currencySymbol, function(rate){
      console.log(rate); //Debug
      speechOutput = "The current exchange rate for 1 "+currencySymbol+" is "+rate+" USD. Thank you for trying Fx Ninja.";
      cardOutput = "The current exchange rate for 1 "+currencySymbol+" is "+rate+" USD."
      shouldEndSession = true;
      callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardOutput));
    })
  } else {
    speechOutput = speech.unsupported+speech.bye;
    cardOutput = speech.invalidcard;
     shouldEndSession = true;
     callback(sessionAttributes,
                  buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession,cardOutput));
  }

}

// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'GetExchangeIntent') {
        getExchangeDetails(intent, session, callback);
        //setColorInSession(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent' || intentName === 'AMAZON.StartOverIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
