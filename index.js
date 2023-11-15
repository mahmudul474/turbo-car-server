const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");

//middleware
app.use(express.json());
app.use(cors());

const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://trubo-car:npkAQt1EZk2sP3EK@474.79d3jxt.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db("trubo-car");
    const services = database.collection("services");
    const features = database.collection("features");

    app.post("/service", async (req, res) => {
      const data = req.body;
      const result = await services.insertOne(data);
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const data = await services.find({}).toArray();
      res.send(data);
    });
    app.get("/features", async (req, res) => {
      const data = await features.find({}).toArray();
      res.send(data);
    });

    app.get("/products", async (req, res) => {
      let filteredProducts = await services.find({}).toArray();

      if (req.query.titleSort) {
        if (req.query.titleSort === "asc") {
          filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        } else if (req.query.titleSort === "desc") {
          filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
        }
      }

      if (req.query.sortPrice) {
        if (req.query.sortPrice === "asc") {
          filteredProducts.sort(
            (a, b) => a.pricing.basePrice - b.pricing.basePrice
          );
        } else if (req.query.sortPrice === "desc") {
          filteredProducts.sort(
            (a, b) => b.pricing.basePrice - a.pricing.basePrice
          );
        }
      }

      const page = req.query.page || 1;
      const pageSize = 6; // Adjust as needed
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      res.json({ data: paginatedProducts, total: filteredProducts.length });
    });

    app.get("/products/result", async (req, res) => {
      let searchedProducts = await services.find({}).toArray();

      if (req.query.search) {
        searchedProducts = searchedProducts.filter((product) =>
          product.title.toLowerCase().includes(req.query.search.toLowerCase())
        );
      }

      const page = req.query.page || 1;
      const pageSize = 10; // Adjust as needed
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      const paginatedProducts = searchedProducts.slice(startIndex, endIndex);

      res.json({ data: paginatedProducts, total: searchedProducts.length });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async () => {
  res.send("assinment-9 is start ");
});

app.listen(port, () => {
  console.log("server is   listening on port " + port);
});
