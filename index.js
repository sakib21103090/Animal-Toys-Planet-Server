const express = require('express');
const cors = require('cors');

require('dotenv').config()

const app= express();
const port =process.PORT || 5000;

// middleware
app.use(cors());
app.use (express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.as0dvvq.mongodb.net/?retryWrites=true&w=majority`;

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

    const CategoryCollection=client.db('AnimalPlanet').collection('Category')
    const AddAToyCollection=client.db('AnimalPlanet').collection('AddAToy')

    const indexKeys = { name: 1}; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "ToyName" }; // Replace index_name with the desired index name
    const result = await AddAToyCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    app.get("/getToyName/:text", async (req, res) => {
      const text = req.params.text;
      const result = await AddAToyCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } }
           
          ],
        })
        .toArray();
      res.send(result);
    });

    app.post("/AddAToy", async (req, res) => {
      const body = req.body;
      const result = await AddAToyCollection.insertOne(body);
      console.log(body)
      res.send(result);
    });

    app.get("/AllToys", async (req, res) => {
      const Toys = await AddAToyCollection.find({}).limit(20).toArray();
        // .sort({ createdAt: -1 })
        
      res.send(Toys);
    });

  

    
    app.get('/Category',async(req,res)=>{
        const cursor=CategoryCollection.find();
        const result=await cursor.toArray();
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get ('/',(req,res)=>{
    res.send('animal server planet is running ')
})

app.listen(port,()=>{
    console.log(` animal planet is running on port ${port}`)
})