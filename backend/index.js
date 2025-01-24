const express = require("express");
const connectDB = require("./config/db");
const mcqRoutes = require("./routes/mcqRoutes");
const partialRoute = require("./routes/partialRoute");
const contact = require("./routes/contactRouts");
const auth = require("./routes/authRoute");
const cors = require("cors");
const app = express();
require("dotenv").config();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// route for mcq retrival
app.use("/mcq", mcqRoutes);

// route for partial search
app.use("/partial", partialRoute);

app.use("/contact", contact);

app.use("/auth", auth);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
