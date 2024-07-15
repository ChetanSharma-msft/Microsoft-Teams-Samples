
# Setup Event based Azure Blob storage and Azure Function to store embeddings vectors in CosmosDB

This is a sample application that demonstrates how to perform RAG-based semantic search using CosmosDB.

## Setup Blob Storage
- [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)

## Setup CosmosDB
- [Azure CosmosDB](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search)

## Setup Azure Function
- [Azure Function](https://learn.microsoft.com/en-us/azure/azure-functions/functions-event-grid-blob-trigger?pivots=programming-language-javascript)

![RAG Based CosmosDB Semantic Search Gif](Images/rag-based-cosmos-db.gif)

## Setup the Azure function app locally

### Create and configure Azure Cosmos DB for NoSQL:
**> Note: You can ignore this step if you have already created Azure Cosmos DB account.**

 - **[Create Azure Cosmos DB Account](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/quickstart-portal#create-account)** in Azure portal and [Enroll in the Vector Search Preview Feature](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search#enroll-in-the-vector-search-preview-feature)
  
 - Create and collect `CosmosDBEndpoint`, `CosmosDBKey`, `CosmosDBDatabaseId`, `CosmosDBContainerId`, `PartitionKey` and save those values in Notepad to update in `.local.settings.json` file later.

### Create Azure Open AI service:
**> Note: You can ignore this step if you have already created Azure Open AI service.**
- In Azure portal, create a [Azure Open AI servie](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource?pivots=web-portal).
- Create and collect `AzureOpenAIEndpoint`, `AzureOpenAIApiKey`, `AzureOpenAIDeploymentName`, and save those values in Notepad to update in `.local.settings.json` file later.

### Create Azure Blob storage:
**> Note: You can ignore this step if you have already created Azure Blob storage.**

- In Azure portal, create a [Azure Blob storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction).
- - Create and collect `AzureStorageDBConnString`, `AzureBlobContainerName`, and save those values in Notepad to update in `.local.settings.json` file later.

   
### Setup for code:

  - Clone the repository

    ```bash
    git clone https://github.com/OfficeDev/Microsoft-Teams-Samples.git
    ```
  - Navigate to `samples/api-doc-search/azure-function-nodejs` folder and open the project in Visual Studio Code.
  - Open `azure-function-nodejs` folder and `.local.settings.json` file.
  - Update the `.local.settings.json` configuration for the application to use the `AzureOpenAIEndpoint`, `AzureOpenAIApiKey`, `AzureOpenAIDeploymentName`, `CosmosDBEndpoint`, `CosmosDBKey`, `CosmosDBDatabaseId`, `CosmosDBContainerId`, `PartitionKey`, `SimilarityScore`, `APPINSIGHTS_INSTRUMENTATIONKEY`, `APPINSIGHTS_CONNECTIONSTRING` values.
  - In a terminal, navigate to `samples/api-doc-search/api-doc-search`

 - Install node modules and run application via pressing F5 in Visual Studio Code
 - 
   ```bash
    npm install
   ```

### Setup Azure Function:    
- ![Refer this documentation]()


## Running the sample

- **Application Home Page:**
![API Home page](Images/1.app-home-page.png)


- **Search query and results:**
![Search query and result - 1](Images/2.search-result-postman-1.png)


- **Search query and results:**
![Search query and result - 2](Images/3.search-result-postman-2.png)


  - **Search query and results:**
![Search query and result - 3](Images/4.search-result-postman-3.png)
  
  - **Search query and results:**
![Search query and result - 4](Images/5.search-result-web.png)

![Upload file to blob storage](Images/blob-container.png)

![Automatically trigger Azure function app](Images/azure-function-invocation.png)

![Embeddings stored in Cosmos DB](Images/cosmos-db-embeddings.png)

![Hit doc search API and test your prompts/queries](Images/search-result-postman.png)

## Deploy the sample in Azure environment

[Refer this documentation](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs?tabs=windows&pivots=development-environment-vscode#configure-the-app-service-app-and-deploy-code)

## Further reading

- [Azure CosmosDB](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search)

- [Vector Search Preview Feature](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search#enroll-in-the-vector-search-preview-feature)

- [Azure Open AI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview)

- [Azure Function](https://learn.microsoft.com/en-us/azure/azure-functions/functions-event-grid-blob-trigger?pivots=programming-language-javascript)

- [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)

- [Azure App Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/nodejs)


<img src="https://pnptelemetry.azurewebsites.net/microsoft-teams-samples/samples/api-doc-search" />