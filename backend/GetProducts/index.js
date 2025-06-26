const { CosmosClient } = require('@azure/cosmos');
// const https = require("https");
// const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = async function (context, req) {
    try {
        const connectionString = process.env.COSMOS_DB_CONNECTION;
        const endpointMatches = connectionString.match(/AccountEndpoint=([^;]+)/);
        const keyMatches = connectionString.match(/AccountKey=([^;]+)/);
        // const client = new CosmosClient({ endpoint: endpointMatches[1], key: keyMatches[1], agent });
        const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION);
        const container = client.database(process.env.COSMOS_DB_DATABASE).container(process.env.COSMOS_DB_PRODUCTS_CONTAINER);
        const { resources: items } = await container.items.query("SELECT * FROM c").fetchAll();
        context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: items };
    } catch (error) {
        context.log.error(`Error in GetProducts: ${error.message}`);
        context.res = { status: 500, body: `Server error: ${error.message}` };
    }
};
