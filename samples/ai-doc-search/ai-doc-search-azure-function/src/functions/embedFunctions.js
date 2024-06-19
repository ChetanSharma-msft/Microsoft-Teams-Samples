// Import necessary libraries and modules

const { OpenAIClient, AzureKeyCredential } = require("@azure/openai"); // Import Azure OpenAI SDK
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter'); // Import the RecursiveCharacterTextSplitter
const { BlobServiceClient } = require('@azure/storage-blob');
const officeParser = require('officeparser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { CosmosClient } = require("@azure/cosmos");
require('dotenv').config();

const appInsights = require('applicationinsights');

// Configure Application Insights with your instrumentation key or connection string
const instrumentationKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;

// Or use connection string
const connectionString = process.env.APPINSIGHTS_CONNECTIONSTRING;

appInsights.setup(connectionString || instrumentationKey)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setUseDiskRetryCaching(true)
  .start();

const appInsightsClient = appInsights.defaultClient;

// Azure Storage connection string and container name.
const azureStorageConnString = process.env.AzureStorageDBConnString;
const azureBlobContainerName = process.env.AzureBlobContainerName;

// Azure Open AI service endpoint, API key, and deployment name.
const azureAiApiEndpoint = process.env.AzureOpenAIEndpoint;
const openAIApiKey = process.env.AzureOpenAIApiKey;
const openAIDeploymentName = process.env.AzureOpenAIDeploymentName; // Ensure this is correct

// Create an instance of the Azure OpenAI client
const client = new OpenAIClient(azureAiApiEndpoint, new AzureKeyCredential(openAIApiKey));

// Cosmos DB configuration.
const cosmosEndpoint = process.env.CosmosDBEndpoint;
const cosmosKey = process.env.CosmosDBKey;

const cosmosClientOptions = {}; // Optional client options
const cosmosClient = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey }, cosmosClientOptions);

// Cosmos DB database and container IDs.
const databaseId = process.env.CosmosDBDatabaseId;
const containerId = process.env.CosmosDBContainerId;

// Get a reference to the Cosmos DB container.
const container = cosmosClient.database(databaseId).container(containerId);

/**
 * Function to split the text content of a file into smaller chunks.
 *
 * @param {string} fileContentsAsString - The content of the file as a single string.
 * @returns {Array} - An array of objects, each containing a chunk of the original text.
 * @throws Will throw an error if text splitting fails.
 */
async function splitText(fileContentsAsString) {
  // Create an instance of the RecursiveCharacterTextSplitter with specified options
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 5,
    separators: ['\n\n', '\n', ' ', '']
  });

  // Split the file content into smaller chunks and return the result
  return await splitter.createDocuments([fileContentsAsString]);
}

/**
 * Function to list all blobs in a container and retrieve their URLs.
 *
 * @returns {Array} - An array containing URLs of all blobs in the container.
 * @throws Will throw an error if listing blobs fails.
 */
async function InitiateEmbeddings(blobUrl, context) {
  try {

    // Define the list of allowed extensions
    const allowedExtensions = ['.docx', '.pdf'];

    try {
      const blobName = path.basename(blobUrl);
      const downloadFilePath = path.join(__dirname, blobName);

      const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnString);
      const containerClient = blobServiceClient.getContainerClient(azureBlobContainerName);

      await downloadBlobToLocal(containerClient, blobName, downloadFilePath);

      if (fs.existsSync(downloadFilePath)) {
        const extension = path.extname(blobName);
        if (extension === '.txt') {
          const fileContents = await readFileContents(downloadFilePath);
          const fileChunks = await createFileChunks(fileContents, context);

          context.log(`FileName ${blobName}, Chunks ${fileChunks.length}`);
          console.log(`FileName ${blobName}, Chunks ${fileChunks.length}`);
          console.log(`=================================================`);

          await createEmbeddings(fileChunks, blobUrl, blobName, context);
          // createEmbeddings(fileChunks, blobUrl, blobName);
          // Call the async function to delete the file
        } else {
          // Check if the extension is in the allowed list
          if (allowedExtensions.includes(extension)) {
            await parseOfficeFile(downloadFilePath, blobUrl, blobName, context);
          } else {
            context.log(`${blobName} is not one of the allowed file types.`);
            console.log(`${blobName} is not one of the allowed file types.`);
            appInsightsClient.trackEvent({ name: "BlobNotAllowed", properties: { blobName } });
          }
        }
      } else {
        context.log(`File ${downloadFilePath} does not exist!`);
        console.error(`File ${downloadFilePath} does not exist!`);
        appInsightsClient.trackEvent({ name: "FileNotDownloaded", properties: { downloadFilePath } });
      }

      // Replace double backslashes with single backslashes
      // var filePath = downloadFilePath.replace(/\\\\/g, '\\');
      var filePath = downloadFilePath.replace(/\\/g, '/');

      // Delete the file after processing.
      fs.unlink(downloadFilePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err); // Log an error message if deletion fails
          appInsightsClient.trackEvent({ name: "FailedToDeleteLocalFile", properties: { filePath } });
        } else {
          console.log(`File deleted successfully: ${filePath}`); // Log the path of the deleted file
          appInsightsClient.trackEvent({ name: "LocalFileDeletedSuccessfully", properties: { err, filePath } });
        }
      });

    } catch (error) {
      context.log(`Failed to process blob ${blobUrl}:`, error);
      console.error(`Failed to process blob ${blobUrl}:`, error);
      appInsightsClient.trackException({ exception: error, properties: { blobUrl } });
    }
  } catch (error) {
    context.log("An error occurred while processing your request:", error);
    console.error("An error occurred while processing your request:", error);
    appInsightsClient.trackException({ exception: error, properties: { blobUrl } });
  }
}

/**
 * Function to download a blob from a container to a local file.
 *
 * @param {Object} containerClient - The container client used to access the blob.
 * @param {string} blobName - The name of the blob to download.
 * @param {string} downloadFilePath - The local file path where the blob will be downloaded.
 * @returns {Promise<void>} - A promise that resolves when the blob has been downloaded.
 */
async function downloadBlobToLocal(containerClient, blobName, downloadFilePath) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Download the blob to a local file
  await blockBlobClient.downloadToFile(downloadFilePath);
}

/**
 * Function to parse an office file, split the text, and store the parsed data along with embeddings in a database.
 *
 * @param {string} filePath - The path to the office file.
 * @param {string} blobUrl - The URL of the blob storage where the file is stored.
 * @param {string} fileName - The name of the file.
 * @returns {Array} - An array of records containing similarity score, file name, URL, and contents.
 * @throws Will throw an error if parsing or embedding retrieval fails.
 */
async function parseOfficeFile(filePath, blobUrl, fileName, context) {
  try {
    // Parse the office file asynchronously
    const data = await officeParser.parseOfficeAsync(filePath);

    // Split the parsed text
    const result = await splitText(data);
    const records = [];

    console.log(`FileName ${fileName}, Chunks ${result.length}`);
    console.log(`=================================================`);

    // Log the result and get embeddings for each item
    for (const item of result) {
      context.log(item.pageContent);
      console.log(item.pageContent);
      console.log("====================================");
      // Get embedding for the current item
      try {
        const embedding = await getEmbeddingAsync(item.pageContent);

        // Create the DocumentEmbeddingDetail object
        const documentEmbedding = {
          id: uuidv4(), // Ensure the item has a unique 'id'
          partitionKey: "teamid", // Adjust based on your partition key strategy
          contents: item.pageContent,
          fileName: fileName,
          url: blobUrl,
          vectors: Array.from(embedding), // Assuming embedding is already an array
        };

        records.push({
          // SimilarityScore: 0.0,
          FileName: fileName,
          Url: blobUrl,
          Contents: item.pageContent
        });

        // Insert the document into the Cosmos DB container
        await container.items.create(documentEmbedding);
      } catch (error) {
        context.log("Error getting embedding:", error);
        console.error("Error getting embedding:", error);
        appInsightsClient.trackException({ exception: error, properties: { records } });
      }
    }

    return records;
  } catch (err) {
    // Handle parsing error
    context.log("Error parsing office file:", err);
    console.error("Error parsing office file:", err);
    appInsightsClient.trackException({ exception: err, properties: { err } });
  }
}

/**
 * Function to get the embedding vector for a given content.
 * It calls an API to generate the embedding for the provided content.
 *
 * @param {string} content - The content for which to generate an embedding.
 * @returns {Array} - The generated embedding vector.
 * @throws Will throw an error if the API call fails.
 */
async function getEmbeddingAsync(content) {

  try {
    // Call the API to get embeddings
    const response = await client.getEmbeddings(openAIDeploymentName, [content]);

    // The response includes the generated embedding
    const item = response.data[0];
    const embedding = item.embedding;

    return embedding;
  } catch (error) {
    context.log("Error getting embeddings:", error);
    console.error("Error getting embeddings:", error);
    throw error;
  }
}

async function createFileChunks(fileContentsAsString, context) {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 20,
      separators: ['\n\n', '\n', ' ', '']
    });

    const fileChunks = await splitter.createDocuments([fileContentsAsString]);
    // Generate embeddings for file chunks here or perform other operations
    context.log('File chunks:', fileChunks);
    console.log('File chunks:', fileChunks);
    console.log(`=================================================`);
    return fileChunks; // Return or process the file chunks as needed
  } catch (error) {
    context.log('Error processing file contents:', error);
    console.error('Error processing file contents:', error);
    throw error; // Rethrow the error for handling at a higher level if necessary
  }
}

async function readFileContents(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

async function createEmbeddings(fileChunks, blobUrl, fileName, context) {
  try {

    const records = [];

    // Log the result and get embeddings for each item
    for (const chunk of fileChunks) {
      context.log(chunk);
      console.log(chunk);
      console.log("====================================");

      // Get embedding for the current item
      try {
        const embedding = await getEmbeddingAsync(chunk.pageContent);

        // Create the DocumentEmbeddingDetail object
        const documentEmbedding = {
          id: uuidv4(), // Ensure the item has a unique 'id'
          partitionKey: "teamid", // Adjust based on your partition key strategy
          contents: chunk.pageContent,
          fileName: fileName,
          url: blobUrl,
          vectors: Array.from(embedding), // Assuming embedding is already an array
        };

        records.push({
          // SimilarityScore: 0.0,
          FileName: fileName,
          Url: blobUrl,
          Contents: chunk.pageContent
        });

        // Insert the document into the Cosmos DB container
        await container.items.create(documentEmbedding);
        // console.log("Document created successfully:", createdItem);
        // console.log("Document created successfully:", createdItem.contents);

        // console.log("Embedding:", embedding);
        // return records;
      } catch (error) {
        context.log("Error getting embedding:", error);
        console.error("Error getting embedding:", error);
      }
    }

    return records;
  } catch (err) {
    // Handle parsing error
    context.log("Error parsing office file:", err);
    console.error("Error parsing office file:", err);
  }
}

module.exports = {
  InitiateEmbeddings,
};