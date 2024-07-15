---
page_type: sample
description: This is a sample API application that demonstrates how to perform RAG-based semantic search using NoSQL CosmosDB.
products:
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

# RAG-based semantic search API using NoSQL CosmosDB

This is a sample application that demonstrates how to perform RAG-based semantic search using CosmosDB.

## Included Features
* Blob based Event Grid Trigger
* Azure Open AI Embeddings
* Vector search based on VectorDistance() function

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

## Setup the application locally

### Create and configure Azure Cosmos DB for NoSQL

1. **[Create Azure Cosmos DB Account](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/quickstart-portal#create-account)** in Azure portal and [Enroll in the Vector Search Preview Feature](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search#enroll-in-the-vector-search-preview-feature)
  - Create and collect `CosmosDBEndpoint`, `CosmosDBKey`, `CosmosDBDatabaseId`, `CosmosDBContainerId`, `PartitionKey` and save those values in Notepad to update in `.env` file later.


 2. **Create Azure Open AI service**
   - In Azure portal, create a [Azure Open AI servie](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource?pivots=web-portal).

3. **Create Azure Blob storage**

- In Azure portal, create a [Azure Blob storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction).

   

4. **Setup for code**

  - Clone the repository

    ```bash
    git clone https://github.com/OfficeDev/Microsoft-Teams-Samples.git
    ```
  - Navigate to `samples/api-doc-search/api-doc-search` folder and open the project in Visual Studio Code.
  - Open `ai-doc-search` folder and `.env` file.
  - Update the `.env` configuration for the application to use the `AzureOpenAIEndpoint`, `AzureOpenAIApiKey`, `AzureOpenAIDeploymentName`, `CosmosDBEndpoint`, `CosmosDBKey`, `CosmosDBDatabaseId`, `CosmosDBContainerId`, `PartitionKey`, `SimilarityScore`, `APPINSIGHTS_INSTRUMENTATIONKEY`, `APPINSIGHTS_CONNECTIONSTRING` values.
  - In a terminal, navigate to `samples/api-doc-search/api-doc-search`

 - Install node modules and run application via pressing F5 in Visual Studio Code
 - 
   ```bash
    npm install
   ```

    
5. Setup Azure Function
    - ![Refer this documentation]()


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

## Deploy the sample in Azure environment

[Refer this documentation](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs?tabs=windows&pivots=development-environment-vscode#deploy-to-azure)

## Further reading

- [Azure CosmosDB](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search)

- [Vector Search Preview Feature](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search#enroll-in-the-vector-search-preview-feature)

- [Azure Open AI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview)

- [Azure Function](https://learn.microsoft.com/en-us/azure/azure-functions/functions-event-grid-blob-trigger?pivots=programming-language-javascript)

- [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)

- [Azure App Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/nodejs)


<img src="https://pnptelemetry.azurewebsites.net/microsoft-teams-samples/samples/api-doc-search" />