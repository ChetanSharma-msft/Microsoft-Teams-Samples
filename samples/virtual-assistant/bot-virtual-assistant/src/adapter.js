// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  ConfigurationBotFrameworkAuthentication,
} = require("botbuilder");

const config = require("./config");

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  {},
  new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: config.botId,
    MicrosoftAppPassword: config.botPassword,
    MicrosoftAppType: "MultiTenant",
  })
);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Only send error message for user messages, not for other message types so the bot doesn't spam a channel or chat.
  if (context.activity.type === "message") {
    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
      "OnTurnError Trace",
      `${error}`,
      "https://www.botframework.com/schemas/error",
      "TurnError"
    );

    await sendErrorMessage(context, error);
    await endSkillConversation(context);
    await clearConversationState(context);

    // Send a message to the user
    await context.sendActivity("The bot encountered an error or bug.");
    await context.sendActivity("To continue to run this bot, please fix the bot source code.");
  }
};

async function sendErrorMessage(context, error) {
    try {
        // Send a message to the user.
        let onTurnErrorMessage = 'The bot encountered an error or bug.';
        await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.IgnoringInput);

        onTurnErrorMessage = 'To continue to run this bot, please fix the bot source code.';
        await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);

        // Send a trace activity, which will be displayed in Bot Framework Emulator.
        await context.sendTraceActivity(
            'OnTurnError Trace',
            `${ error }`,
            'https://www.botframework.com/schemas/error',
            'TurnError'
        );
    } catch (err) {
        console.error(`\n [onTurnError] Exception caught in sendErrorMessage: ${ err }`);
    }
}

async function endSkillConversation(context) {
    try {
        // Inform the active skill that the conversation is ended so that it has
        // a chance to clean up.
        // Note: ActiveSkillPropertyName is set by the RooBot while messages are being
        // forwarded to a Skill.
        const activeSkill = await conversationState.createProperty("activeSkillProperty").get(context);
        if (activeSkill) {
            const botId = config.botId;

            let endOfConversation = {
                type: ActivityTypes.EndOfConversation,
                code: 'RootSkillError'
            };
            endOfConversation = TurnContext.applyConversationReference(
                endOfConversation, TurnContext.getConversationReference(context.activity), true);

            await conversationState.saveChanges(context, true);
            await skillClient.postActivity(botId, activeSkill.appId, activeSkill.skillEndpoint, skillsConfig.skillHostEndpoint, endOfConversation.conversation.id, endOfConversation);
        }
    } catch (err) {
        console.error(`\n [onTurnError] Exception caught on attempting to send EndOfConversation : ${ err }`);
    }
}

async function clearConversationState(context) {
    try {
        // Delete the conversationState for the current conversation to prevent the
        // bot from getting stuck in a error-loop caused by being in a bad state.
        // ConversationState should be thought of as similar to "cookie-state" in a Web page.
        await conversationState.delete(context);
    } catch (err) {
        console.error(`\n [onTurnError] Exception caught on attempting to Delete ConversationState : ${ err }`);
    }
}

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

module.exports = adapter;
