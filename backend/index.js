const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const Product = require("./models/Product");
const moment = require("moment");
const cors = require('cors');

const app = express();

app.use(cors());

mongoose
  .connect(
    "mongodb+srv://shrawanibc:Shrawani%4011@cluster0.rvwbtjb.mongodb.net/roxiler-db?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const priceRanges = [
  { range: "0-100", min: 0, max: 100 },
  { range: "101-200", min: 101, max: 200 },
  { range: "201-300", min: 201, max: 300 },
  { range: "301-400", min: 301, max: 400 },
  { range: "401-500", min: 401, max: 500 },
  { range: "501-600", min: 501, max: 600 },
  { range: "601-700", min: 601, max: 700 },
  { range: "701-800", min: 701, max: 800 },
  { range: "801-900", min: 801, max: 900 },
  { range: "901-above", min: 901, max: Infinity },
];

// Route to initialize the database
app.get("/initialize-db", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const products = response.data;

    await Product.insertMany(products);

    res.status(200).send("Database initialized successfully!");
  } catch (err) {
    console.error("Error initializing the database:", err);
    res.status(500).send("Database initialization failed");
  }
});

// Route to get transactions
app.get("/transactions", async (req, res) => {
  try {
    const { page = 1, perPage = 10, search = "", month } = req.query;
    const pipeline = [];

    // Handle month filter
    if (month) {
      const monthNumber = moment().month(month).format("M");

      pipeline.push({
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, parseInt(monthNumber)],
          },
        },
      });
    }

    // Handle search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            ...(!isNaN(search) ? [] : [{ price: parseFloat(search) }]),
          ],
        },
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(perPage);
    const limit = parseInt(perPage);

    // Fetch paginated transactions
    const transactions = await Product.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get total count of transactions
    const totalTransactions = await Product.countDocuments(
      pipeline.length > 0 ? pipeline[0].$match : {}
    );

    res.json({
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalTransactions,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).send("Server error");
  }
});

// Route to get statistics
app.get("/statistics", async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).send("Month is required");
    }

    const monthNumber = moment().month(month).format("M");

    const matchMonth = {
      $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(monthNumber)] },
    };

    // Calculate total sales
    const totalSales = await Product.aggregate([
      { $match: { sold: true, ...matchMonth } },
      { $group: { _id: null, totalSaleAmount: { $sum: "$price" } } },
    ]);

    // Count sold and unsold items
    const soldItemsCount = await Product.countDocuments({
      sold: true,
      ...matchMonth,
    });

    const unsoldItemsCount = await Product.countDocuments({
      sold: false,
      ...matchMonth,
    });

    res.json({
      totalSaleAmount:
        totalSales.length > 0 ? totalSales[0].totalSaleAmount : 0,
      soldItemsCount,
      unsoldItemsCount,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).send("Server error");
  }
});

// Route to get price range data
app.get('/price-range-chart', async (req, res) => {
    try {
        const { month } = req.query;

        // Check if month is provided
        if (!month) {
            return res.status(400).send('Month is required');
        }

        // Convert month name to month number
        const monthNumber = moment().month(month).format('M'); // Month number (1-12)

        // Query to match the month for dateOfSale
        const matchMonth = { $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(monthNumber)] } };

        // Initialize an object to hold the counts for each price range
        const priceRangeCounts = {};

        // Loop through each price range and count the number of items in that range
        for (let range of priceRanges) {
            const count = await Product.countDocuments({
                ...matchMonth,
                price: { $gte: range.min, $lte: range.max }
            });
            priceRangeCounts[range.range] = count;
        }

        // Respond with the price range counts
        res.json(priceRangeCounts);
    } catch (error) {
        console.error('Error fetching price range data:', error);
        res.status(500).send('Server error');
    }
});

// Route to get category data
app.get("/category-chart", async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).send("Month is required");
    }

    const monthNumber = moment().month(month).format("M");
    const matchMonth = {
      $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(monthNumber)] },
    };

    const categoryData = await Product.aggregate([
      { $match: matchMonth },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const response = categoryData.map((data) => ({
      category: data._id,
      itemCount: data.count,
    }));

    res.json(response);
  } catch (error) {
    console.error("Error fetching category data:", error);
    res.status(500).send("Server error");
  }
});

// Route to get combined data
app.get("/combined-data", async (req, res) => {
  try {
    const { month } = req.query;
    const [statisticsResponse, priceRangeChartResponse, categoryChartResponse] =
      await Promise.all([
        axios.get("http://localhost:5000/statistics", { params: { month } }),
        axios.get("http://localhost:5000/price-range-chart", { params: { month } }),
        axios.get("http://localhost:5000/category-chart", { params: { month } }),
      ]);

    const combinedData = {
      statistics: statisticsResponse.data,
      priceRangeChart: priceRangeChartResponse.data,
      categoryChart: categoryChartResponse.data,
    };

    res.json(combinedData);
  } catch (error) {
    console.error("Error fetching combined data:", error);
    res.status(500).send("Server error");
  }
});

app.listen(5000, () => console.log(`Server running on port ${5000}`));
