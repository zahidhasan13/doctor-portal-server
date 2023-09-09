const express = require('express');
const jwt = require('jsonwebtoken');
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

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: true, message: "JWT not authorized"})
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.JSON_TOKEN, (error, decode) => {
    if(error){
      return res.status(500).send({error: true, message:"Unauthorized"})
    }
    res.decode = decode;
    next();
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const dieseasCollections = client.db("doctotDB").collection("dieseas");
    const bookingCollections = client.db("doctotDB").collection("bookings");


    // JWT
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign({email: user.email}, process.env.JSON_TOKEN, {expiresIn: '1h'})
      res.send({token});
    })

    // Appointment
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

    app.get('/bookings', verifyJWT, async(req, res) => {
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