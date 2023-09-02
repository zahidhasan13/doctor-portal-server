const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()


app.use(cors());
app.use(express.json());
// zahid007
// paX5hhySey9SfnBI




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sjxc9jf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const dieseasCollections = client.db("doctotDB").collection("dieseas");
    const bookingCollections = client.db("doctotDB").collection("bookings");

    app.get('/appointment', async(req, res) => {
        const dieseas = await dieseasCollections.find().toArray();
        res.send(dieseas);
    })

    app.get('/appointment/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id) }
      const book = await dieseasCollections.findOne(query);
      res.send(book);
    });

    app.get('/bookings', async(req, res) => {
      let query = {};
      if(req.query?.email){
        query = { email: req.query.email}
      }
      const bookings = await bookingCollections.find(query).toArray();
      res.send(bookings);
    });

    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const bookings = await bookingCollections.insertOne(booking);
      res.send(bookings);
    }),

    app.patch('/bookings/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const appointmentUpdate = req.body;
        const confirm = {
          $set:{
            status: appointmentUpdate.status
          }
        }
        const result = await bookingCollections.updateOne(query, confirm);
        res.send(result);
    })

    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const booking = await bookingCollections.deleteOne(query);
      res.send(booking)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //  await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Doctors portal is running");
});

app.listen(port, () => {
    console.log(`Doctors portal app listening on port ${port}`)
  })