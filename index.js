'use strict';

/*************/
/* IMPORTS */
/*************/
const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card } = require('dialogflow-fulfillment');
const fetch = require('node-fetch');

process.env.DEBUG = 'dialogflow:debug';

/*************/
/* CONSTANTS */
/*************/

// Backend data endpoint
const BASE_URL = 'https://chocshop.mikaelvesavuori.workers.dev';

const WELCOME_STATEMENT = 'Welcome to ChocShop. How can I help you?';
const FALLBACK_STATEMENT_1 = 'Sorry, I had trouble doing what you asked. Please try again.';
const FALLBACK_STATEMENT_2 = "I'm sorry, can you try again?";

/*
// These two get communicated directly through Dialogflow, without going to the webhook
const GET_OPENING_HOURS_RESPONSE =
  'We are open between 8 am and 6 pm Monday to Friday, and from 10 am to 4 pm on the Weekends.';
const GET_PRODUCTS_RESPONSE =
  "We offer chocolate bars, cakes, gift boxes, ice cream, brownies and pralines. They're sure to be your new favorites!";
*/

/*************/
/*  MATCHES  */
/*************/

// This matches the synonyms that Dialogflow has been taught
const bar = [
  'bar',
  'chocolate bars',
  'white chocolate',
  'milk chocolate',
  'chocolate bar',
  'chocolate',
  'piece of chocolate',
  'stick',
  'bar',
  'choco bar'
];

const box = ['gift box', 'gift_boxes', 'chocolate box', 'box'];

const brownie = ['brownies', 'brownie cake', 'brownie'];

const cake = [
  'cake',
  'cake',
  'pastry',
  'sponge cake',
  'pastries',
  'cakes',
  'chocolate cake',
  'dessert'
];

const icecream = ['ice cream', 'ice_cream', 'chocolate ice cream'];

const pralines = ['pralines', 'chocolate pieces', 'chocolate pralines', 'pieces', 'chocolates'];

function fuzzyMatch(heardName) {
  let product = null;

  if (bar.includes(heardName)) {
    console.log(`${heardName} is part of 'bar'`);
    product = 'bar';
  } else if (box.includes(heardName)) {
    console.log(`${heardName} is part of 'box'`);
    product = 'box';
  } else if (brownie.includes(heardName)) {
    console.log(`${heardName} is part of 'brownie'`);
    product = 'brownie';
  } else if (cake.includes(heardName)) {
    console.log(`${heardName} is part of 'cake'`);
    product = 'cake';
  } else if (icecream.includes(heardName)) {
    console.log(`${heardName} is part of 'icecream'`);
    product = 'icecream';
  } else if (pralines.includes(heardName)) {
    console.log(`${heardName} is part of 'pralines'`);
    product = 'pralines';
  } else {
    console.error(`Could not match '${heardName}' to any product!`);
  }

  return product;
}

/*************/
/* FUNCTIONS */
/*************/
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  console.log('agent.parameters', agent.parameters);

  const PRODUCT_HEARD_AS = agent.parameters.Products ? agent.parameters.Products : null;

  if (!PRODUCT_HEARD_AS) throw new Error('Did not receive any products parameters!');

  function welcome(agent) {
    agent.add(WELCOME_STATEMENT);
  }

  function fallback(agent) {
    agent.add(FALLBACK_STATEMENT_1);
    agent.add(FALLBACK_STATEMENT_2);
  }

  async function getProductStockStatus(agent) {
    const FIXED_PRODUCT_NAME = fuzzyMatch(PRODUCT_HEARD_AS);
    const URL = `${BASE_URL}/?item=${FIXED_PRODUCT_NAME}`;
    const DATA = await fetch(URL).then(async (data) => data.json());
    const IN_STOCK = DATA.inStock ? 'in stock' : 'currently not in stock';

    agent.add(`${PRODUCT_HEARD_AS} is ${IN_STOCK}`);
    agent.add(
      new Card({
        title: `ChocShop product availability`,
        imageUrl: `https://chocshop.netlify.com/img/1400px/${DATA.id}.jpg`,
        text: `${PRODUCT_HEARD_AS} is ${IN_STOCK}`,
        buttonText: 'See the product on our website',
        buttonUrl: `https://chocshop.netlify.com/product-${FIXED_PRODUCT_NAME}`
      })
    );
  }

  async function getProductPrice(agent) {
    const FIXED_PRODUCT_NAME = fuzzyMatch(PRODUCT_HEARD_AS);
    const URL = `${BASE_URL}/?item=${FIXED_PRODUCT_NAME}`;
    const DATA = await fetch(URL).then(async (data) => data.json());
    const PRICE = DATA.price;

    agent.add(`The price of ${PRODUCT_HEARD_AS} is $${PRICE}`);
    agent.add(
      new Card({
        title: `Prices at ChocShop`,
        imageUrl: `https://chocshop.netlify.com/img/1400px/${DATA.id}.jpg`,
        text: `The price of ${PRODUCT_HEARD_AS} is $${PRICE}`,
        buttonText: 'See the product on our website',
        buttonUrl: `https://chocshop.netlify.com/product-${FIXED_PRODUCT_NAME}`
      })
    );
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('GetProductPrice', getProductPrice);
  intentMap.set('GetProductStockStatus', getProductStockStatus);
  agent.handleRequest(intentMap);
});
