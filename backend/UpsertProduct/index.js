const { CosmosClient } = require('@azure/cosmos');
const https = require("https");
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = async function (context, req) {
    try {
        const productToUpsert = req.body;
        if (!productToUpsert || !productToUpsert.id) {
            context.res = { status: 400, body: "Request must contain a product with an 'id'." };
            return;
        }
        const sanitizedProduct = {
            id: productToUpsert.id,
            name: productToUpsert.name,
            currentQty: productToUpsert.currentQty,
            reorderLevel: productToUpsert.reorderLevel
        };
        const connectionString = process.env.COSMOS_DB_CONNECTION;
        const endpointMatches = connectionString.match(/AccountEndpoint=([^;]+)/);
        const keyMatches = connectionString.match(/AccountKey=([^;]+)/);
        const client = new CosmosClient({ endpoint: endpointMatches[1], key: keyMatches[1], agent });
        const container = client.database(process.env.COSMOS_DB_DATABASE).container(process.env.COSMOS_DB_PRODUCTS_CONTAINER);
        const { resource: upsertedItem } = await container.items.upsert(sanitizedProduct);
        context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: upsertedItem };
    } catch (error) {
        context.log.error(`Error in UpsertProduct: ${error.message}`);
        context.res = { status: 500, body: `Server error: ${error.message}` };
    }
};
