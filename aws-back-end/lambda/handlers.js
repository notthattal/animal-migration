const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

const ddbClient = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client();

exports.connectHandler = async (event) => {
    console.log('Connect event:', JSON.stringify(event, null, 2));

    try {
        const connectionId = event.requestContext.connectionId;

        await ddbDocClient.send(new PutCommand({
            TableName: process.env.CONNECTIONS_TABLE,
            Item: {
                connectionId: connectionId,
                ttl: Math.floor(Date.now() / 1000) + 7200
            }
        }));

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({message: 'Connected'})
        };
    } catch (err) {
        console.error('Error:', err);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({message: 'Failed to connect', error: err.message})
        };
    }
};

exports.messageHandler = async (event) => {
    console.log('Message event:', JSON.stringify(event, null, 2));

    try {
        const connectionId = event.requestContext.connectionId;
        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;
        const { startYear, startMonth, endYear, endMonth } = JSON.parse(event.body);

        console.log('Query parameters:', { startYear, startMonth, endYear, endMonth });

        // Initialize API Gateway management client
        const apiGw = new ApiGatewayManagementApiClient({
            endpoint: `https://${domain}/${stage}`
        });

        // Get CSV file from S3
        console.log('Fetching CSV from S3');
        const s3Response = await s3Client.send(new GetObjectCommand({
            Bucket: process.env.DATA_BUCKET,
            Key: 'animals.csv'
        }));

        // Read and process the CSV data
        let csvData = '';
        for await (const chunk of s3Response.Body) {
            csvData += chunk.toString();
        }
        console.log('CSV data loaded');

        // Parse CSV and filter data
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        console.log('Processing CSV with headers:', headers);

        const parsedData = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
                const values = line.split(',');
                return {
                    id: values[1],
                    year: parseInt(values[2]), // COUNT column
                    month: parseInt(values[3]),
                    date: values[4],
                    time: values[5],
                    latitude: parseFloat(values[9]),
                    longitude: parseFloat(values[10]),
                    number: parseInt(values[13]),
                    species: {
                        blueWildebeest: values[24] === 'True',
                        buffalo: values[25] === 'True',
                        bushbuck: values[26] === 'True',
                        bushpig: values[27] === 'True',
                        commonReedbuck: values[28] === 'True',
                        duikerGrey: values[29] === 'True',
                        duikerRed: values[30] === 'True',
                        eland: values[31] === 'True',
                        elephant: values[32] === 'True',
                        hartebeest: values[33] === 'True',
                        hippo: values[34] === 'True',
                        impala: values[35] === 'True',
                        kudu: values[36] === 'True',
                        nyala: values[37] === 'True',
                        oribi: values[38] === 'True',
                        sable: values[39] === 'True',
                        warthog: values[40] === 'True',
                        waterbuck: values[41] === 'True',
                        zebra: values[42] === 'True'
                    }
                };
            })
            .filter(record => {
                const recordDate = (record.year * 12) + record.month;
                const startDate = (startYear * 12) + startMonth;
                const endDate = (endYear * 12) + endMonth;
                return recordDate >= startDate && recordDate <= endDate;
            });

        console.log(`Found ${parsedData.length} matching records`);

        // Send data in chunks
        const chunkSize = 50;
        for (let i = 0; i < parsedData.length; i += chunkSize) {
            const chunk = parsedData.slice(i, i + chunkSize);
            await apiGw.send(new PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: JSON.stringify({
                    type: 'data',
                    payload: chunk,
                    isLastChunk: i + chunkSize >= parsedData.length,
                    totalRecords: parsedData.length,
                    currentChunk: Math.floor(i / chunkSize) + 1,
                    totalChunks: Math.ceil(parsedData.length / chunkSize)
                })
            }));
            console.log(`Sent chunk ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(parsedData.length / chunkSize)}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Data sent successfully',
                recordsProcessed: parsedData.length
            })
        };
    } catch (error) {
        console.error('Error in message handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing request',
                error: error.message
            })
        };
    }
};

exports.disconnectHandler = async (event) => {
    return { statusCode: 200, body: 'Disconnected.' };
};