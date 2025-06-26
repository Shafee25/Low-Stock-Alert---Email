const { CosmosClient } = require('@azure/cosmos');
// const https = require("https");
const sgMail = require('@sendgrid/mail');

// const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = async function (context, myTimer) {
    const timeStamp = new Date().toISOString();
    context.log('ScanInventoryForLowStock timer trigger function ran!', timeStamp);

    try {
        const connectionString = process.env.COSMOS_DB_CONNECTION;
        const endpointMatches = connectionString.match(/AccountEndpoint=([^;]+)/);
        const keyMatches = connectionString.match(/AccountKey=([^;]+)/);
        // const client = new CosmosClient({ endpoint: endpointMatches[1], key: keyMatches[1], agent });
        const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION);

        const database = client.database(process.env.COSMOS_DB_DATABASE);
        const productsContainer = database.container(process.env.COSMOS_DB_PRODUCTS_CONTAINER);
        const reportsContainer = database.container(process.env.COSMOS_DB_REPORTS_CONTAINER);

        const querySpec = { query: "SELECT * FROM c WHERE c.currentQty <= c.reorderLevel" };
        const { resources: lowStockItems } = await productsContainer.items.query(querySpec).fetchAll();

        if (lowStockItems.length > 0) {
            const report = { id: new Date().toISOString(), reportGeneratedAt: timeStamp, items: lowStockItems };
            await reportsContainer.items.create(report);
            context.log(`Generated low-stock report with ${lowStockItems.length} items.`);

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const productListHtml = lowStockItems.map(item => `<li>${item.name} (Qty: ${item.currentQty})</li>`).join('');
            const msg = {
                to: process.env.SENDGRID_TO_EMAIL,
                from: process.env.SENDGRID_FROM_EMAIL,
                subject: `[ACTION REQUIRED] Low Stock Alert - ${lowStockItems.length} items`,
                html: `<h1>Low Stock Alert</h1><p>The following items are running low on stock and require reordering:</p><ul>${productListHtml}</ul><p>Report generated at: ${timeStamp}</p>`
            };
            await sgMail.send(msg);
            context.log("Successfully sent low stock email alert.");
        } else {
            context.log('No low-stock items found.');
        }
    } catch (error) {
        context.log.error(`Error during scan: ${error.message}`);
        if (error.response) { context.log.error('SendGrid Error Body:', error.response.body); }
    }
};
