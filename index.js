const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send(`Cars Zone server is ready at port ${port}`));


const user = process.env.DB_USER;  // mongoDB user
const password = process.env.DB_PASSWORD;  // mongoDB password

const uri = `mongodb+srv://${user}:${password}@cluster0.ekvq6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); // mongoDB client

async function run() {
    try {
        // connect mongoDB client
        await client.connect();

        // cars info collection
        const carsCollection = client.db('carsCollection').collection('cars');


        // users info collection
        const usersCollection = client.db('usersCollection').collection('users');


        // get cars info from database
        app.get('/cars/:dataAmount', async (req, res) => {
            const dataAmount = req.params.dataAmount;
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.json(dataAmount === 'all' ? cars :
                cars.slice(0, dataAmount));
        })


        // save user info in database
        app.post('/users', async (req, res) => {
            const newUser = req.body
            const query = { email: newUser.email }
            const filter = await usersCollection.findOne(query)
            if (filter) {
                const updateDoc = { $set: { ...newUser } }
                const options = { upsert: true }
                const result = await usersCollection.updateOne(query, updateDoc, options)
                console.log(result)
                res.json(result)
            }
            else {
                res.json({ error: "User not found" })
            }
        })


    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => console.log(`listening to port => ${port}`));