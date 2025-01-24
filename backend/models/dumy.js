const mongoose = require("mongoose");
const Session = require("./sessionID"); // Assuming your session model is in the 'models' folder

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/task", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    insertSession();
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Insert the session ID into the database
async function insertSession() {
  try {
    const newSession = new Session({
      sessionId: "8946", // The session ID you want to store
      createdAt: new Date(),
    });

    // Save the session to the database
    const savedSession = await newSession.save();
    console.log("Session inserted with ID:", savedSession._id);
  } catch (error) {
    console.error("Error inserting session:", error);
  } finally {
    // Close the connection after the operation
    mongoose.connection.close();
  }
}
