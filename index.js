const express = require('express');
const app = express();
const cors = require('cors')
//url secreate korar jonno
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//midleware
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Car doctor Services Start')
})

//Car-doctor
//2V7imzFIVpmI0hu1

//console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.atafojn.mongodb.net/?retryWrites=true&w=majority`;

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

    const serviceCollection =client.db('carDoctor').collection('services');
    ///
    app.get('/services', async(req, res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    //id by id
    
    app.get('/services/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        //option 
        const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: {title: 1, price: 1, service_id: 1 , img: 1},
          };
        const result = await serviceCollection.findOne(query, options);
        res.send(result);
    })

    ///POST DATA cheekOut
    const CheekoutCollection = client.db('carDoctor').collection('cheekout')
    app.post('/cheekout', async(req, res)=>{
        const cheekout = req.body;
        //console.log(cheekout);
        const result = await CheekoutCollection.insertOne(cheekout);
        res.send(result);
    })
    ///GET DATA CheekOut data
    app.get('/cheekout', async(req, res)=>{
     // console.log(req.query.email);
      
      let query = {};
      if(req.query?.email){
          query ={email: req.query.email}
      }
      const result= await CheekoutCollection.find(query).toArray();
      res.send(result);
    })
    ///data DELETE 
    app.delete('/cheekout/:id', async(req, res)=>{
       const id = req.params.id;
       const query ={_id: new ObjectId(id)}
       const result = await CheekoutCollection.deleteOne(query);
       res.send(result)
    })
    ///Data Update
    app.patch('/cheekout/:id', async(req, res)=>{
       const id = req.params.id;
       const filter = {_id: new ObjectId(id)};
       const updated = req.body;
       const updateDoc ={
          $set:{
            status: updated.status
          }
       }
       const result= await  CheekoutCollection.updateOne(filter, updateDoc);
       res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})