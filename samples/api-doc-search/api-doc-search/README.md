---
page_type: sample
description: This is a sample API application that demonstrates how to perform RAG-based semantic search using CosmosDB.
products:
- azure
- azure-cosmos-db
- azure-openai
- azure-functions
languages:
- nodejs
extensions:
 contentType: samples
 createdDate: "07/15/2024 12:00:00 PM"
urlFragment: officedev-microsoft-teams-samples-api-doc-search-nodejs

---

# RAG-based semantic search API using CosmosDB

This is a sample application that demonstrates how to perform RAG-based semantic search using CosmosDB.

## Included Features
* Azure Open AI Embeddings Search
* Blob based Event Grid Trigger

## Interaction with app

![RAG Based CosmosDB Semantic Search Gif](Images/rag-based-cosmos-db.gif)

## Prerequisites


- [NodeJS](https://nodejs.org/en/)
- [Azure Open AI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview)
- [Azure CosmosDB](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search)
- [Azure Function](https://learn.microsoft.com/en-us/azure/azure-functions/functions-event-grid-blob-trigger?pivots=programming-language-javascript)


- [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)
- [Azure App Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/nodejs)
- [Postman or other API testing tool](https://www.postman.com/api-platform/api-testing/)

## Run the app (Using Visual Studio Code)

The simplest way to run this sample is to use Visual Studio Code.
1. Ensure you have downloaded and installed [Visual Studio Code](https://code.visualstudio.com/docs/setup/setup-overview)
1. Select **File > Open Folder** in VS Code and choose this samples directory from the repo
1. Select **Debug > Start Debugging** or **F5** to run the app in a Teams web client.

## Setup

### Create and configure Azure Cosmos DB for NoSQL

1. [Create Azure Cosmos DB Account](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/quickstart-portal#create-account) in Azure portal.
    - [Enroll in the Vector Search Preview Feature](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search#enroll-in-the-vector-search-preview-feature)
  - Create and collect `CosmosDBEndpoint`, `CosmosDBKey`, `CosmosDBDatabaseId`, `CosmosDBContainerId`, `PartitionKey` and save those to use in .env file later.


 2. Create Azure Open AI service
   - In Azure portal, create a [Azure Open AI servie](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-authentication?view=azure-bot-service-  4.0&tabs=csharp%2Caadv2).
  - Ensure that you've [enabled the Teams Channel](https://docs.microsoft.com/en-us/azure/bot-service/channel-connect-teams?view=azure-bot-service-4.0)
  **NOTE:** When you create app registration, you will create an App ID and App password - make sure you keep these for later.

3. Create Azure Blob storage
- Run ngrok - point to port 3978

   

4. Setup for code

  - Clone the repository

    ```bash
    git clone https://github.com/OfficeDev/Microsoft-Teams-Samples.git
    ```
  - Update the `.env` configuration for the application to use the `App-Id`, `App-Secret`
`AzureOpenAIEndpoint`
`AzureOpenAIApiKey`
`AzureOpenAIDeploymentName`

`CosmosDBEndpoint`
`CosmosDBKey`
`CosmosDBDatabaseId`
`CosmosDBContainerId`
`PartitionKey`
`SimilarityScore` = 0.70
`APPINSIGHTS_INSTRUMENTATIONKEY`
`APPINSIGHTS_CONNECTIONSTRING` 
 
 - In a terminal, navigate to `samples/api-doc-search/api-doc-search`

 - Install node modules and run application 
   ```bash
    npm install
   ```

     ```bash
     npm start
    ```

    
5. Setup Azure Function
    - **Edit** the `local.settings.json` contained in the ./appManifest folder to replace your Microsoft App Id (that was created when you registered your app registration earlier) *everywhere* you see the place holder string `{{Microsoft-App-Id}}` (depending on the scenario the Microsoft App Id may occur multiple times in the `manifest.json`)
    - **Zip** up the contents of the `appManifest` folder to create a `manifest.zip` (Make sure that zip file does not contains any subfolder otherwise you will get error while uploading your .zip package)

- Upload the manifest.zip to Teams (in the Apps view click "Upload a custom app")
   - Go to Microsoft Teams. From the lower left corner, select Apps
   - From the lower left corner, choose Upload a custom App
   - Go to your project directory, the ./appManifest folder, select the zip folder, and choose Open.
   - Select Add in the pop-up dialog box. Your app is uploaded to Teams.

## Running the sample

![API Home page](Images/1.app-home-page.png)
![Search query and result - 1](Images/2.search-result-postman-1.png)
![Search query and result - 2](Images/3.search-result-postman-2.png)
![Search query and result - 3](Images/4.search-result-postman-3.png)
![Search query and result - 4](Images/5.search-result-web.png)
![Upload file to blob storage](Images/blob-container.png)

![Automatically trigger Azure function app](Images/azure-function-invocation.png)

![Embeddings stored in Cosmos DB](Images/cosmos-db-embeddings.png)

![Hit doc search API and test your prompts/queries](Images/search-result-postman.png)

## Further reading

- [Azure CosmosDB](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search)

- [Vector Search Preview Feature](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search#enroll-in-the-vector-search-preview-feature)

- [Azure Open AI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview)

- [Azure Function](https://learn.microsoft.com/en-us/azure/azure-functions/functions-event-grid-blob-trigger?pivots=programming-language-javascript)

- [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)

- [Azure App Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/nodejs)


<img src="https://pnptelemetry.azurewebsites.net/microsoft-teams-samples/samples/api-doc-search" />