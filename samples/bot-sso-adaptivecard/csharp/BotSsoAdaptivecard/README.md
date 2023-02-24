---
page_type: sample
description: Microsoft Teams Bot-SSO-Adaptivecard
products:
- office-teams
- office
- office-365
languages:
- csharp
extensions:
 contentType: samples
 createdDate: "03/01/2023 07:54:21 PM"
urlFragment: officedev-microsoft-teams-samples-bot-sso-adaptivecard-csharp
---

# SSO for your Adaptive Cards

This sample code demonstrates how to get enable SSO authentication for your Adaptive Cards.

## Interaction with app

 ![Preview](Images/PreviewAppSSOCsharp.gif)

## Try it yourself - experience the App in your Microsoft Teams client
Please find below demo manifest which is deployed on Microsoft Azure and you can try it yourself by uploading the app package (.zip file link below) to your teams and/or as a personal app. (Sideloading must be enabled for your tenant, [see steps here](https://docs.microsoft.com/microsoftteams/platform/concepts/build-and-test/prepare-your-o365-tenant#enable-custom-teams-apps-and-turn-on-custom-app-uploading)).

**Implement SSO authentication for your Adaptive Cards.:** [Manifest](/samples/bot-sso-adaptivecard/csharp/demo-manifest/bot-sso-adaptivecard.zip)

## Prerequisites

- Microsoft Teams is installed and you have an account
- [.NET SDK](https://dotnet.microsoft.com/download) version 6.0
- [ngrok](https://ngrok.com/) or equivalent tunnelling solution

## Setup

### 1. Setup for Bot
Register your application with Azure AD

1. Register a new application in the [Azure Active Directory – App Registrations](https://go.microsoft.com/fwlink/?linkid=2083908) portal.
2. Select **New Registration** and on the *register an application page*, set following values:
    * Set **name** to your app name.
    * Choose the **supported account types** (any account type will work)
    * Leave **Redirect URI** empty.
    * Choose **Register**.
3. On the overview page, copy and save the **Application (client) ID, Directory (tenant) ID**. You’ll need those later when updating your Teams application manifest and in the appsettings.json.
4. Under **Manage**, select **Expose an API**. 
5. Select the **Set** link to generate the Application ID URI in the form of `api://{AppID}`. Insert your fully qualified domain name (with a forward slash "/" appended to the end) between the double forward slashes and the GUID. The entire ID should have the form of: `api://fully-qualified-domain-name/botid-{AppID}`
    * ex: `api://botid-00000000-0000-0000-0000-000000000000`.
6. Select the **Add a scope** button. In the panel that opens, enter `access_as_user` as the **Scope name**.
7. Set **Who can consent?** to `Admins and users`
8. Fill in the fields for configuring the admin and user consent prompts with values that are appropriate for the `access_as_user` scope:
    * **Admin consent title:** Teams can access the user’s profile.
    * **Admin consent description**: Allows Teams to call the app’s web APIs as the current user.
    * **User consent title**: Teams can access the user profile and make requests on the user's behalf.
    * **User consent description:** Enable Teams to call this app’s APIs with the same rights as the user.
9. Ensure that **State** is set to **Enabled**
10. Select **Add scope**
    * The domain part of the **Scope name** displayed just below the text field should automatically match the **Application ID** URI set in the previous step, with `/access_as_user` appended to the end:
        * `api://botid-00000000-0000-0000-0000-000000000000/access_as_user.
11. In the **Authorized client applications** section, identify the applications that you want to authorize for your app’s web application. Each of the following IDs needs to be entered:
    * `1fec8e78-bce4-4aaf-ab1b-5451cc387264` (Teams mobile/desktop application)
    * `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams web application)
    ![Authentication](Images/ExposeAPI.png)
12.  Add any necessary API permissions for downstream calls
     * Navigate to "API permissions" blade on the left hand side
     ![Authentication](Images/APIPermission.png)
13. Navigate to **Authentication**
    If an app hasn't been granted IT admin consent, users will have to provide consent the first time they use an app.
    Set a redirect URI:
    * Select **Add a platform**.
    * Select **web**.
    * Enter the **redirect URI** for the app in the following format: 
    1) https://token.botframework.com/.auth/web/redirect
    
    Enable implicit grant by checking the following boxes:  
    ✔ ID Token  
    ✔ Access Token  
![Authentication](Images/Authentication.png)
14.  Navigate to the **Certificates & secrets**. In the Client secrets section, click on "+ New client secret". Add a description(Name of the secret) for the secret and select “Never” for Expires. Click "Add". Once the client secret is created, copy its value, it need to be placed in the appsettings.json.

- Ensure that you've [enabled the Teams Channel](https://docs.microsoft.com/en-us/azure/bot-service/channel-connect-teams?view=azure-bot-service-4.0)

- While registering the bot, use `https://<your_ngrok_url>/api/messages` as the messaging endpoint.
    > NOTE: When you create your bot you will create an App ID and App password - make sure you keep these for later.

### 2. Setup NGROK
1) Run ngrok - point to port 3978

```bash
# ngrok http -host-header=rewrite 3978
```
### 3. Setup for code

- Clone the repository

    ```bash
    git clone https://github.com/OfficeDev/Microsoft-Teams-Samples.git
    ```

- Run the bot from a terminal or from Visual Studio:

  A) From a terminal, navigate to `samples/bot-sso-adaptivecard/csharp`

  ```bash
  # run the bot
  dotnet run
  ```
  B) Or from Visual Studio

  - Launch Visual Studio
  - File -> Open -> Project/Solution
  - Navigate to `samples/bot-sso-adaptivecard/csharp` folder
  - Select `BotSsoAdaptivecard.sln` file
  - Press `F5` to run the project

1. Update the appsettings.json configuration for the bot to use the MicrosoftAppId (Microsoft App Id), MicrosoftAppPassword (App Password) and connectionName (OAuth Connection Name).
2. Navigate to samples\bot-sso-adaptivecard\csharp\BotSsoAdaptivecard\Resources\AdaptiveCardResponse.json
   - On line 32, replace `<<YOUR-MICROSOFT-APP-ID>>`.
3. Navigate to samples\bot-sso-adaptivecard\csharp\BotSsoAdaptivecard\Resources\AdaptiveCardWithSSOInRefresh.json
   - *Update everywhere* you see the place holder string `<<YOUR-MICROSOFT-APP-ID>>` and Update On line 12, replace `<<YOUR-CONNECTION-NAME>>`.
4. Navigate to samples\bot-sso-adaptivecard\csharp\BotSsoAdaptivecard\Resources\options.json
   - On line 29, replace `<<YOUR-MICROSOFT-APP-ID>>`.

**Notes:**
- If you are facing any issue in your app,  [please uncomment this line](https://github.com/OfficeDev/Microsoft-Teams-Samples/blob/727ae5487d750c25e02a6de5b0c0912b72d86b94/samples/bot-sso-adaptivecard/csharp/BotSsoAdaptivecard/AdapterWithErrorHandler.cs#L27) and put your debugger for local debug.

**Bot Configuration:**

![BotConfg](Images/BotConfg.png)

**Bot OAuth Connection:**

![Bot Connections](Images/BotConnections.png)

 ### 5. Setup Manifest for Teams

**This step is specific to Teams.**
   - **Edit** the `manifest.json` contained in the  `TeamsAppManifest` folder to replace your Microsoft App Id (that was created when you registered your bot earlier) *everywhere* you see the place holder string `<<YOUR-MICROSOFT-APP-ID>>` (depending on the scenario the Microsoft App Id may occur multiple times in the `manifest.json`)
   - **Edit** the `manifest.json` for `validDomains` and `{{domain-name}}` with base Url domain. E.g. if you are using ngrok it would be `https://1234.ngrok.io` then your domain-name will be `1234.ngrok.io`.
   - **Edit** he manifest.json for webApplicationInfo resource "api://botid-`<<YOUR-MICROSOFT-APP-ID>>`" with base Url of your domain. E.g. if you are using ngrok it would be https://1234.ngrok.io then your domain-name will be "api://botid-`<<YOUR-MICROSOFT-APP-ID>>`".
   - **Zip** up the contents of the `TeamsAppManifest` folder to create a `manifest.zip` folder into a `manifest.zip`.(Make sure that zip file does not contains any subfolder otherwise you will get error while uploading your .zip package)
   - **Upload** the `manifest.zip` to Teams (In Teams Apps/Manage your apps click "Upload an app to your org's app catalog'". Browse to and Open the .zip file. At the next dialog, click the Add button.)

> Note: This `manifest.json` specified that the bot will be installed in a "personal" scope only. Please refer to Teams documentation for more details.   

## Running the sample

**Upload App:**

![Upload](Images/Upload.png)

![UploadSucess](Images/UploadSucess.png)

**Install App:**

![InstallApp](Images/InstallApp.png)

**Welcome UI:**

![Welcome](Images/WelcomeCard.png)

**Sign-In UI:**

![SignButton](Images/SignButton.png)

**Login Successfully:**

![InstallApp](Images/loginsuccess.png)

## Deploy the bot to Azure

To learn more about deploying a bot to Azure, see [Deploy your bot to Azure](https://aka.ms/azuredeployment) for a complete list of deployment instructions.

## Further reading

- [Universal Actions for Adaptive Cards](https://review.learn.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/universal-actions-for-adaptive-cards/sso-adaptive-cards-universal-action?branch=pr-en-us-7547#add-code-to-receive-the-token)


