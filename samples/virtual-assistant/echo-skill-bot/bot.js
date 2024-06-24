// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, ActivityTypes, EndOfConversationCodes } = require('botbuilder');

//const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");



class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // const client = new OpenAIClient(
        //     "https://virtual-assistant-superbot-openai.openai.azure.com/", 
        //     new AzureKeyCredential("15ce1aa33eef4caead7c84905568a160")
        //   );
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            //switch (context.activity.text.toLowerCase()) {
            // case 'end':
            // case 'stop':
            //     await context.sendActivity({
            //         type: ActivityTypes.EndOfConversation,
            //         code: EndOfConversationCodes.CompletedSuccessfully
            //     });
            //     break;
            // default:
                //const { id, created, choices, usage } = await client.getChatCompletions("virtualassistant", [{role:"system",content:"You are helpfull assistant"},{role:"user",content:context.activity.text}]);

                // await context.sendActivity(`Echo Latest (JS) : '${ context.activity.text }'`);
                // await context.sendActivity('Say "end" or "stop" and I\'ll end the conversation and back to the parent.');
            //}

            await context.sendActivity(`Echo bot: ${ context.activity.text }`);

            await context.sendActivity({
                        type: ActivityTypes.EndOfConversation,
                        code: EndOfConversationCodes.CompletedSuccessfully
                    });
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        //this.onEndOfConversation(async (context, next) => {
            // This will be called if the root bot is ending the conversation.  Sending additional messages should be
            // avoided as the conversation may have been deleted.
            // Perform cleanup of resources if needed.

            // By calling next() you ensure that the next BotHandler is run.
            //await next();
        //});
    }
}

module.exports.EchoBot = EchoBot;
