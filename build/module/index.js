// Import the environment vars
require('dotenv').config();
// Import Botkit's core features
import { Botkit } from 'botkit';
import { BotkitCMSHelper } from 'botkit-plugin-cms';
// Import a platform-specific adapter for slack.
import { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } from 'botbuilder-adapter-slack';
//Import Mongo Adapter
// Setup Slack Client
const adapter = new SlackAdapter({
    // parameters used to secure webhook endpoint
    verificationToken: process.env.VERIFICATION_TOKEN,
    clientSigningSecret: process.env.CLIENT_SECRET,
    // auth token for a single-team app
    botToken: process.env.BOT_TOKEN,
    // credentials used to set up oauth for multi-team apps
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['bot'],
    redirectUri: process.env.REDIRECT_URI,
    // functions required for retrieving team-specific info
    // for use in multi-team apps
    getTokenForTeam: getTokenForTeam,
    getBotUserByTeam: getBotUserByTeam,
});
// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new SlackEventMiddleware());
// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
adapter.use(new SlackMessageTypeMiddleware());
let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url: process.env.MONGO_URI,
    });
}
const controller = new Botkit({
    debug: true,
    webhook_uri: '/api/messages',
    adapter: adapter,
    storage
});
if (process.env.cms_uri) {
    controller.usePlugin(new BotkitCMSHelper({
        cms_uri: process.env.cms_uri,
        token: process.env.cms_token,
    }));
}
// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {
    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');
    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);
            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }
});
controller.webserver.get('/install', (req, res) => {
    // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
    res.redirect(controller.adapter.getInstallLink());
});
controller.webserver.get('/install/auth', async (req, res) => {
    try {
        const results = await controller.adapter.validateOauthCode(req.query.code);
        console.log('FULL OAUTH DETAILS', results);
        // Store token by team in bot state.
        tokenCache[results.team_id] = results.bot.bot_access_token;
        // Capture team to bot id
        userCache[results.team_id] = results.bot.bot_user_id;
        res.json('Success! Bot installed.');
    }
    catch (err) {
        console.error('OAUTH ERROR:', err);
        res.status(401);
        res.send(err.message);
    }
});
let tokenCache = {};
let userCache = {};
if (process.env.TOKENS) {
    tokenCache = JSON.parse(process.env.TOKENS);
}
if (process.env.USERS) {
    userCache = JSON.parse(process.env.USERS);
}
async function getTokenForTeam(teamId) {
    if (tokenCache[teamId]) {
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve(tokenCache[teamId]);
            }, 150);
        });
    }
    else {
        console.error('Team not found in tokenCache: ', teamId);
    }
}
async function getBotUserByTeam(teamId) {
    if (userCache[teamId]) {
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve(userCache[teamId]);
            }, 150);
        });
    }
    else {
        console.error('Team not found in userCache: ', teamId);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsOEJBQThCO0FBQzlCLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUUzQixnQ0FBZ0M7QUFDaEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNoQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFcEQsZ0RBQWdEO0FBQ2hELE9BQU8sRUFBRSxZQUFZLEVBQUUsMEJBQTBCLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUUxRyxzQkFBc0I7QUFFdEIscUJBQXFCO0FBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksWUFBWSxDQUFDO0lBQzdCLDZDQUE2QztJQUM3QyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtJQUNqRCxtQkFBbUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWE7SUFFOUMsbUNBQW1DO0lBQ25DLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7SUFFL0IsdURBQXVEO0lBQ3ZELFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7SUFDL0IsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYTtJQUN2QyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUM7SUFDZixXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZO0lBRXJDLHVEQUF1RDtJQUN2RCw2QkFBNkI7SUFDN0IsZUFBZSxFQUFFLGVBQWU7SUFDaEMsZ0JBQWdCLEVBQUUsZ0JBQWdCO0NBQ3JDLENBQUMsQ0FBQztBQUVILHVGQUF1RjtBQUN2RixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO0FBRXhDLDZHQUE2RztBQUM3RyxPQUFPLENB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