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

        // orders info collection
        const ordersCollection = client.db('ordersCollection').collection('orders');

        // users info collection
        const usersCollection = client.db('usersCollection').collection('users');

        // reviews collection
        const reviewCollection = client.db('reviewCollection').collection('reviews');


        // get cars info from database
        app.get('/cars/:dataAmount', async (req, res) => {
            const dataAmount = req.params.dataAmount;
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.json(dataAmount === 'all' ? cars :
                cars.slice(0, dataAmount));
        })
        // get single car details by id
        app.get('/cars/details/:carID', async (req, res) => {
            const id = req.params.carID;
            const query = { carID: parseInt(id) }
            const result = await carsCollection.findOne(query);
            res.json(result)
        })


        // save order info in database
        app.post('/order/save', async (req, res) => {
            const orderInfo = req.body
            const result = await ordersCollection.insertOne(orderInfo)
            res.json(result)
        })
        // delete order from DB
        app.delete('/order/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        // update status of any order
        app.put('/order', async (req, res) => {
            const { id, status } = req.body;
            const query = { _id: ObjectId(id) }
            const updateDoc = { $set: { status } }
            const options = { upsert: false }
            const result = await ordersCollection.updateOne(query, updateDoc, options)
            res.json(result)
        })

        // get orders
        app.get('/orders/:email', async (req, res) => {
            const { email } = req.params;
            const query = { email: email };
            const userInfo = await usersCollection.findOne(query);
            const orders = userInfo.role === 'admin' ? ordersCollection.find({})
                : ordersCollection.find(query)
            const result = await orders.toArray();
            res.json(result);
        })


        // save user info in database
        app.post('/users', async (req, res) => {
            const newUser = req.body
            const query = { email: newUser.email }
            const filter = await usersCollection.findOne(query)
            const updateDoc = { $set: { ...newUser, role: filter?.role || 'public' } }
            const options = { upsert: true }
            const result = await usersCollection.updateOne(query, updateDoc, options)
            res.json(result)
        })

        // get user info from database
        app.get('/users/:email', async (req, res) => {
            const { email } = req.params
            const query = { email: email }
            const filter = await usersCollection.findOne(query)
            res.json(filter)
        })

        // make admin
        app.post('/admin/add', async (req, res) => {
            const { email } = req.body
            const query = { email }
            const filter = await usersCollection.findOne(query)
            if (filter) {
                const updateDoc = { $set: { role: 'admin' } }
                const options = { upsert: true }
                const result = await usersCollection.updateOne(query, updateDoc, options)
                res.json(result)
            }
            else {
                res.json({ error: "User not found" })
            }
        })

        // add review
        app.post('/review', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.json(result)
        })


    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => console.log(`listening to port => ${port}`));