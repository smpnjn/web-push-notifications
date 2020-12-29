
import express from 'express'
import rateLimit from 'express-rate-limit'
import bodyParser from 'body-parser'
import ejs from 'ejs'
import webpush from 'web-push'
import mongoose from 'mongoose'
import objectHash from 'object-hash'

// Parsers
let jsonParser = bodyParser.json();

const database = 'mongodb://localhost:27017/subscriptions';
const connection = mongoose.connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const app = express()
let port = 3000

// limit number of requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200 // limit each IP to 100 requests per windowMs
});
   
// apply to all requests
app.use(limiter);

// subscriptions
import * as Subscription from './model.js';

// app settings
app.engine('html', ejs.renderFile);
app.use(express.static('./views'));

// Service Worker Notifications
// Generate your own vapid keys by running: 
    // npm i web-push -g 
    // web-push generate-vapid-keys
const publicVapidKey = '<<Public Key>>';
const privateVapidKey = '<<Private Key>>';

webpush.setVapidDetails('mailto:mail@someEmail.com', publicVapidKey, privateVapidKey);

app.post('/subscribe', jsonParser, async function(req, res) {
    try {
        let hash = objectHash(req.body);
        let subscription = req.body;
        let checkSubscription = await Subscription.Subscription.find({ 'hash' : hash });
        
        let theMessage = JSON.stringify({ title: 'You have already subscribed', body: 'Although we appreciate you trying to again' });
        if(checkSubscription.length == 0) {
            const newSubscription = new Subscription.Subscription({
                hash: hash,
                subscriptionEl: subscription
            });
            newSubscription.save(function (err) {
                if (err) {
                    theMessage = JSON.stringify({ title: 'We ran into an error', body: 'Please try again later' });
                    res.status(201).json({});
                    webpush.sendNotification(subscription, theMessage).catch(error => {
                        console.error(error.stack);
                    });
                } else {
                    theMessage = JSON.stringify({ title: 'Thank you for Subscribing!', body: 'Some body message here' });
                    res.status(201).json({});
                    webpush.sendNotification(subscription, theMessage).catch(error => {
                        console.error(error.stack);
                    });
                }
            });
        } else {
            res.status(201).json({});
            webpush.sendNotification(subscription, theMessage).catch(error => {
                console.error(error.stack);
            });
        }
    } catch(e) {
        console.log(e);
    }
});

/* THIS IS FOR DEMONSTRATION PURPOSES ONLY */
/* Please ensure you put the correct security on the mechanism you use to send notifications to all your users */
app.get('/send-notification', jsonParser, async function(req, res) {
    /*  IMPORTANT NOTE:
        Please ensure you add the apropriate security here so that not just anyone can access this
        and send a notification to all users. You might what to add authentication with username and password
        or something like that */
    try {
        const allSubscriptions = await Subscription.Subscription.find();
        allSubscriptions.forEach(function(item) {
            let theMessage = JSON.stringify({
                'title' : 'Some notification',
                'body' : 'Some description'
            });
            webpush.sendNotification(item.subscriptionEl, theMessage).catch(error => {
                console.error(error.stack);
            });
        });
        res.status(200).json({"message" : "notification sent"});
    } catch(e) {
        console.log(e);
    }
});

app.listen(port, () => {
    console.log(`listening on :${port}`);
})