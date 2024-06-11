// Import necessary libraries and modules
const express = require('express'); // Import the Express framework              
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai"); // Import Azure OpenAI SDK
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter'); // Import the RecursiveCharacterTextSplitter
const { BlobServiceClient } = require('@azure/storage-blob');
const officeParser = require('officeparser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { CosmosClient } = require("@azure/cosmos");
require('dotenv').config();
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

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

const app = express(); // Create an Express application

// Middleware to parse incoming JSON data
app.use(express.json());

app.listen(3978, function () {
  console.log('app listening on port 3978!');
});

/**
 * Endpoint to perform a semantic search on documents.
 */
app.get('/search', async (req, res) => {
  try {
    // Perform semantic search using the query parameter from the request
    const result = await semanticSearchDocumentsAsync(req.query.query);

    // Send the search result as the response
    res.send(result);
  } catch (error) {
    // Log and send an error response if the search fails
    console.error("Error during semantic search:", error);
    res.status(500).send("Error during semantic search");
  }
});

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
async function listBlobs() {
  try {
    // Create the BlobServiceClient object
    const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnString);

    // Get the container client
    const containerClient = blobServiceClient.getContainerClient(azureBlobContainerName);

    // List all blobs in the container and get their URLs
    const blobUrls = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      // Construct the blob URL
      const blobUrl = `${containerClient.url}/${blob.name}`;
      blobUrls.push(blobUrl);
    }

    return blobUrls;
  } catch (error) {
    console.error("Error listing blobs:", error);
    throw error;
  }
}

app.get('/getblobs', async (req, res) => {
  try {
    const blobUrls = await listBlobs();

    if (blobUrls.length === 0) {
      res.status(404).send('No blobs found.');
      return;
    }

    for (const blobUrl of blobUrls) {
      try {
        // const blobUrl = blobUrls[0];
        const blobName = path.basename(blobUrl);
        const downloadFilePath = path.join(__dirname, blobName);

        const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnString);
        const containerClient = blobServiceClient.getContainerClient(azureBlobContainerName);

        await downloadBlobToLocal(containerClient, blobName, downloadFilePath);

        if (fs.existsSync(downloadFilePath)) {
          const result = await parseOfficeFile(downloadFilePath, blobUrl, blobName);
          res.send(result);
        } else {
          console.error(`File ${downloadFilePath} does not exist!`);
          res.status(404).send(`File ${downloadFilePath} does not exist!`);
        }
      } catch (error) {
        console.error(`Failed to process blob ${blobUrl}:`, error);
      }
    }

  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});


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
async function parseOfficeFile(filePath, blobUrl, fileName) {
  try {
    // Parse the office file asynchronously
    const data = await officeParser.parseOfficeAsync(filePath);

    // Split the parsed text
    const result = await splitText(data);
    const records = [];

    // Log the result and get embeddings for each item
    for (const item of result) {
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
        const { resource: createdItem } = await container.items.create(documentEmbedding);
        console.log("Document created successfully:", createdItem);

        console.log("Embedding:", embedding);
        return records;
      } catch (error) {
        console.error("Error getting embedding:", error);
      }
    }

    return records;
  } catch (err) {
    // Handle parsing error
    console.error("Error parsing office file:", err);
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
    console.error("Error getting embeddings:", error);
    throw error;
  }
}

/**
 * Function to perform a semantic search on documents.
 * It retrieves the top 5 most similar documents based on the provided query.
 *
 * @param {string} query - The search query for which to find similar documents.
 * @returns {Array} - A sorted array of the top 5 most similar documents.
 * @throws Will throw an error if the search fails.
 */
async function semanticSearchDocumentsAsync(query) {
  try {
    // Get embedding vector for the search query.
    const embedding = await getEmbeddingAsync(query);
    const similarityScore = 0.50;

    // The SQL query to find the top 5 most similar documents
    const queryText = `
      SELECT TOP 5 c.contents, c.fileName, c.url,
      VectorDistance(c.vectors, @vectors, false) as similarityScore
      FROM c
      WHERE VectorDistance(c.vectors, @vectors, false) > @similarityScore`;

    const querySpec = {
      query: queryText,
      parameters: [
        { name: "@vectors", value: embedding },
        { name: "@similarityScore", value: similarityScore }
      ]
    };

    // Fetch the top 5 results directly
    const { resources } = await container.items.query(querySpec).fetchAll();
    var result = resources.sort((a, b) => b.similarityScore - a.similarityScore);

    return result;
  } catch (error) {
    console.error("Error during semantic search:", error);
    throw error;
  }
}
