const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send(`Cars Zone server is ready.! port ${port}`));


const user = process.env.DB_USER;  // mongoDB user
const password = process.env.DB_PASSWORD;  // mongoDB password

const uri = `mongodb+srv://${user}:${password}@cluster0.ekvq6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); // mongoDB client

async function run() {
    try {
        // connect mongoDB client
        await client.connect();

        // users info collection
        const carsCollection = client.db('carsCollection').collection('cars');

        // get cars info from database
        app.get('/cars/:dataAmount', async (req, res) => {
            const dataAmount = req.params.dataAmount;
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.json(dataAmount === 'all' ? cars :
                cars.slice(0, dataAmount));
        })

    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => console.log(`listening to port => ${port}`));
