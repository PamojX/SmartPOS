const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// const { initDB } = require("./db/init");
const db = require("./db/init");
// No need to call initDB(), because init logic is run automatically


const itemRoutes = require("./routes/items");
const transactionRoutes = require("./routes/transactions");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// initDB();

app.use("/api/items", itemRoutes);
app.use("/api/transactions", transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
