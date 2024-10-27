// dumy.js
const mongoose = require("mongoose");
const MCQ = require("../models/mcq"); // Adjust the path if necessary

// MongoDB connection URI
const mongoURI = "mongodb://localhost:27017/task"; // Change this to your actual database name

// Unique sample questions for aptitude
const uniqueAptitudeQuestions = Array.from({ length: 300 }, (_, i) => ({
  question: `Aptitude Question ${i + 1}`,
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: "Option A", // Change as needed for correct answers
  category: "aptitude",
}));

// Unique sample questions for each department
const uniqueDepartmentQuestions = {
  CSE: Array.from({ length: 200 }, (_, i) => ({
    question: `CSE Question ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A", // Change as needed for correct answers
    category: "department",
    department: "CSE",
  })),
  ECE: Array.from({ length: 200 }, (_, i) => ({
    question: `ECE Question ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A", // Change as needed for correct answers
    category: "department",
    department: "ECE",
  })),
  Mechanical: Array.from({ length: 200 }, (_, i) => ({
    question: `Mechanical Question ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A", // Change as needed for correct answers
    category: "department",
    department: "Mechanical",
  })),
  Civil: Array.from({ length: 200 }, (_, i) => ({
    question: `Civil Question ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A", // Change as needed for correct answers
    category: "department",
    department: "Civil",
  })),
  Chemical: Array.from({ length: 200 }, (_, i) => ({
    question: `Chemical Question ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A", // Change as needed for correct answers
    category: "department",
    department: "Chemical",
  })),
  Biotechnology: Array.from({ length: 200 }, (_, i) => ({
    question: `Biotechnology Question ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A", // Change as needed for correct answers
    category: "department",
    department: "Biotechnology",
  })),
};

async function createQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    // Create 300 unique aptitude questions
    for (const question of uniqueAptitudeQuestions) {
      const aptitudeMCQ = new MCQ({
        ...question,
        department: null, // No department for aptitude questions
      });
      await aptitudeMCQ.save();
    }
    console.log("300 unique aptitude questions created");

    // Create 200 unique departmental questions for each department
    for (const department in uniqueDepartmentQuestions) {
      for (const question of uniqueDepartmentQuestions[department]) {
        const departmentMCQ = new MCQ({
          ...question,
        });
        await departmentMCQ.save();
      }
      console.log(
        `200 unique questions created for the ${department} department`
      );
    }

    console.log("Unique data created successfully");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

createQuestions();

// const mongoose = require("mongoose");
// const faker = require("@faker-js/faker").faker;
// const connectDB = require("./config/db"); // Import the MongoDB connection
// const UserSearch = require("./models/userSearch"); // Adjust path to your UserSearch model

// const generateData = async () => {
//   const records = [];

//   for (let i = 0; i < 1440000; i++) {
//     records.push({
//       firstName: faker.name.firstName(),
//       lastName: faker.name.lastName(),
//       email: faker.internet.email().toLowerCase(),
//     });

//     // Save in batches to manage memory
//     if (records.length >= 10000) {
//       await UserSearch.insertMany(records);
//       records.length = 0; // Clear records array
//       console.log(`Inserted ${i + 1} records`);
//     }
//   }

//   // Insert any remaining records
//   if (records.length > 0) {
//     await UserSearch.insertMany(records);
//   }
//   console.log("Data generation complete!");
// };

// const runDataGeneration = async () => {
//   await connectDB(); // Establish MongoDB connection
//   try {
//     await generateData(); // Start data generation
//   } catch (error) {
//     console.error("Error generating data:", error);
//   } finally {
//     mongoose.connection.close(); // Close connection after completion
//   }
// };

// runDataGeneration();
