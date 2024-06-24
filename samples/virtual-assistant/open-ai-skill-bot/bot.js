// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, ActivityTypes, EndOfConversationCodes } = require('botbuilder');
// const TextTranslationClient = require('@azure-rest/ai-translation-text').default;
// const { AzureKeyCredential } = require('@azure/core-auth');
// const { isUnexpected } = require("@azure-rest/ai-translation-text");

const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
// let apiKey = "59cd7a2f04204ec8948ca01082cd60af";
// let endpoint = "https://api.cognitive.microsofttranslator.com/";

// location, also known as region.
// required if you're using a multi-service or regional (not global) resource. It can be found in the Azure portal on the Keys and Endpoint page.
// let region = "eastus";

class AIBot extends ActivityHandler {
    constructor() {
        super();

        const client = new OpenAIClient(
            process.env.AzureOpenAIEndpoint,
            new AzureKeyCredential(process.env.AzureOpenAIApiKey));

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const messages = [
                { role: 'system', content: 'You are an AI assistant. Your task is to eliminate user instructions from query and translate the following text as per user inputs. Also, do not add any greetings or extra sentence in result' },
                { role: 'user', content: context.activity.text }
            ];

            const response = await client.getChatCompletions(process.env.AzureOpenAIDeploymentId, messages, { maxTokens: 2000 });
            const responseContent = response.choices[0].message.content;
            await context.sendActivity(`AI Translator bot: ${ responseContent }`);

            // var res = await client.getCompletions(process.env.AzureOpenAIDeploymentId, `
            // ${context.activity.text}
            // `);

            // var result = res.choices[0].text.split('\n')[0];
            // await context.sendActivity(`AI Translator bot: ${result}`);

            await context.sendActivity({
                type: ActivityTypes.EndOfConversation,
                code: EndOfConversationCodes.CompletedSuccessfully
            });

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // this.onEndOfConversation(async (context, next) => {
        //     // This will be called if the root bot is ending the conversation.  Sending additional messages should be
        //     // avoided as the conversation may have been deleted.
        //     // Perform cleanup of resources if needed.

        //     // By calling next() you ensure that the next BotHandler is run.
        //     await next();
        // });
    }
}

module.exports.AIBot = AIBot;
