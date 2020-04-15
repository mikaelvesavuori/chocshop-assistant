# ChocShop: Google Assistant

This is a VUI for Google Assistant (using DialogFlow), to complement the [ChocShop](https://www.github.com/mikaelvesavuori/chocshop) demo.

The repository assumes that you've already set up accounts at Google Cloud, Actions on Google, and Dialogflow, and done some initial pre-work.

Included you will also find the data I am using.

Webhook-based fulfillment is done for `GetProductPrice` and `GetProductStockStatus`.

## Connected repositories

There's a range of repos that are connected to the overall ChocShop demo.

For the frontend, you would also need the backend repo to be deployed, or at the very least point to local data unless you want the app to crash.

The VUI apps are entirely elective.

- [ChocShop: Frontend](https://github.com/mikaelvesavuori/chocshop): The main demo app, as seen on [https://chocshop.netlify.app](https://chocshop.netlify.app)
- [ChocShop: Backend](https://github.com/mikaelvesavuori/chocshop-backend): The basic API backend to send back stock status and price
- [ChocShop: Alexa Skill](https://github.com/mikaelvesavuori/chocshop-alexa): VUI assistent which gives you a basic product overview, stock status and price information

## Workflow

The code here is very simple, and I've just opted to use the inline editor in Dialogflow.

- Open up [Dialogflow](https://dialogflow.cloud.google.com/)
- Open up [Actions on Google](https://console.actions.google.com/)
- While working, it's easiest to just copy-paste `package.json` and `index.js` into the Inline Editor in the Fulfillment view

## Troubleshooting

- Ensure that you have billing activated for the account
- Ensure that you have added webhook fulfillment for any functions

## References

- Code based on [this demo at Dialogflow](https://blog.dialogflow.com/post/use-slot-filling-in-fulfillment/)
