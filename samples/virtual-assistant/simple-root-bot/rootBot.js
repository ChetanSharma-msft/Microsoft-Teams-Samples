// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const { ActivityHandler, ActivityTypes } = require('botbuilder');

class RootBot extends ActivityHandler {
    constructor(conversationState, skillsConfig, skillClient, conversationIdFactory) {
        super();
        const client = new OpenAIClient('https://virtual-assistant-superbot-openai.openai.azure.com/', new AzureKeyCredential('15ce1aa33eef4caead7c84905568a160'));
        // var classifier = new natural.BayesClassifier();
        // classifier.addDocument('Please echo', 'echo');
        // classifier.addDocument('echo', 'echo');
        // classifier.addDocument('echo this', 'echo');
        // classifier.addDocument('translate', 'translate');
        // classifier.addDocument('Please translate this', 'translate');
        // classifier.addDocument('Please rewrite this in French', 'translate');
        // classifier.train();

        if (!conversationState) throw new Error('[RootBot]: Missing parameter. conversationState is required');
        if (!skillsConfig) throw new Error('[RootBot]: Missing parameter. skillsConfig is required');
        if (!skillClient) throw new Error('[RootBot]: Missing parameter. skillClient is required');
        if (!conversationIdFactory) throw new Error('[RootBot]: Missing parameter. conversationIdFactory is required');

        this.conversationState = conversationState;
        this.skillsConfig = skillsConfig;
        this.skillClient = skillClient;
        this.conversationIdFactory = conversationIdFactory;

        this.botId = process.env.MicrosoftAppId;

        // We use a single skill in this example.
        const targetSkillId = 'EchoSkillBot';
        this.targetSkill = skillsConfig.skills[targetSkillId];

        const targetAISkillId = 'OpenAiSkillBot';
        this.targetAISkill = skillsConfig.skills[targetAISkillId];

        // Create state property to track the active skill
        this.activeSkillProperty = this.conversationState.createProperty(RootBot.ActiveSkillPropertyName);

        this.onTurn(async (turnContext, next) => {
            // Forward all activities except EndOfConversation to the active skill.
            if (turnContext.activity.type !== ActivityTypes.EndOfConversation) {
                // Try to get the active skill
                const activeSkill = await this.activeSkillProperty.get(turnContext);

                if (activeSkill) {
                    // Send the activity to the skill
                    await this.sendToSkill(turnContext, activeSkill);
                    return;
                }
            }

            // Ensure next BotHandler is executed.
            await next();
        });

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            var res = await client.getCompletions('virtualassistant',
                [`You are an AI assistant. Your task is to classify my input as either "echo" or "translate" and respond accordingly:


            Echo: If my input is a casual greeting like "Hi", "Hello", or similar, reply with "Echo" only.
            Translation: If my input is a request for translation, reply with "translate" only.
            For example:
            
            
            If I say "Hi", you should respond with "Echo".
            If I say "Translate 'Good morning' to Spanish", you should respond with "Translate".
            Please classify and respond to the following input.
            
            ${ context.activity.text }
            
            
            Response:`]
            );

            var result = res.choices[0].text.toLowerCase().split('\n')[0];

            // var result = context.activity.text.toLowerCase();
            // if(classifier.classify(result) === "echo"){
            if (result.indexOf('echo') > -1) {
                // Set active skill
                await this.activeSkillProperty.set(context, this.targetSkill);

                // Send the activity to the skill
                await this.sendToSkill(context, this.targetSkill);

                // }else if(classifier.classify(result) === "translate"){
            } else if (result.indexOf('translate') > -1) {
                // Set active skill
                await this.activeSkillProperty.set(context, this.targetAISkill);

                // Send the activity to the skill
                await this.sendToSkill(context, this.targetAISkill);
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // Handle EndOfConversation returned by the skill.
        this.onEndOfConversation(async (context, next) => {
            // Stop forwarding activities to Skill.
            await this.activeSkillProperty.set(context, undefined);

            // Show status message, text and value returned by the skill
            // let eocActivityMessage = `Received ${ ActivityTypes.EndOfConversation }.\n\nCode: ${ context.activity.code }`;
            // if (context.activity.text) {
            //     eocActivityMessage += `\n\nText: ${ context.activity.text }`;
            // }

            // if (context.activity.value) {
            //     eocActivityMessage += `\n\nValue: ${ context.activity.value }`;
            // }

            // await context.sendActivity(eocActivityMessage);

            // We are back at the root
            // await context.sendActivity('Back in the root bot. Say \'skill\' and I\'ll patch you through');

            // Save conversation state
            await this.conversationState.saveChanges(context, true);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // this.onMembersAdded(async (context, next) => {
        //     const membersAdded = context.activity.membersAdded;
        //     for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
        //         if (membersAdded[cnt].id !== context.activity.recipient.id) {
        //             await context.sendActivity('Hello and welcome!');
        //         }
        //     }

        //     // By calling next() you ensure that the next BotHandler is run.
        //     await next();
        // });
    }

    /**
     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
     */
    async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
    }

    async sendToSkill(context, targetSkill) {
        // NOTE: Always SaveChanges() before calling a skill so that any activity generated by the skill
        // will have access to current accurate state.
        await this.conversationState.saveChanges(context, true);

        // Create a conversationId to interact with the skill and send the activity
        const skillConversationId = await this.conversationIdFactory.createSkillConversationIdWithOptions({
            fromBotOAuthScope: context.turnState.get(context.adapter.OAuthScopeKey),
            fromBotId: this.botId,
            activity: context.activity,
            botFrameworkSkill: targetSkill
        });

        // route the activity to the skill
        const response = await this.skillClient.postActivity(this.botId, targetSkill.appId, targetSkill.skillEndpoint, this.skillsConfig.skillHostEndpoint, skillConversationId, context.activity);

        // Check response status
        if (!(response.status >= 200 && response.status <= 299)) {
            throw new Error(`[RootBot]: Error invoking the skill id: "${ targetSkill.id }" at "${ targetSkill.skillEndpoint }" (status is ${ response.status }). \r\n ${ response.body }`);
        }
    }
}

module.exports.RootBot = RootBot;
RootBot.ActiveSkillPropertyName = 'activeSkillProperty';
