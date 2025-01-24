const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker"); // Importing the faker library
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/task", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// User model
const User = require("./models/user"); // Assuming this is where your User model is located

// Function to generate random student data
const generateRandomStudent = () => {
  return {
    name: faker.person.fullName(), // Corrected for faker-js
    email: faker.internet.email(),
    password: "1234", // Plain text password (will be hashed later)
    role: "Student",
    registerNo: faker.string.alphanumeric(8), // Corrected method for alphanumeric string
    department: faker.helpers.arrayElement([
      "Computer Science",
      "Mechanical",
      "Electrical",
      "Civil",
    ]),
    score: "", // Random score between 0 and 100
  };
};

// Function to hash the password before saving the user
const hashPassword = async (password) => {
  const saltRounds = 10; // Define the salt rounds for bcrypt
  const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash the password
  return hashedPassword;
};

// Function to insert random student data into MongoDB
const insertRandomStudents = async (count) => {
  for (let i = 0; i < count; i++) {
    const randomStudent = generateRandomStudent();

    // Hash the password before saving the student
    const hashedPassword = await hashPassword(randomStudent.password);
    randomStudent.password = hashedPassword;

    const user = new User(randomStudent);

    try {
      await user.save(); // Save the student data in MongoDB
      console.log(`Student ${randomStudent.name} inserted successfully`);
    } catch (error) {
      console.error(`Error inserting student: ${error.message}`);
    }
  }
};

// Run the script
const run = async () => {
  const numberOfStudents = 10; // You can adjust the number of students to insert
  await insertRandomStudents(numberOfStudents);
  mongoose.connection.close(); // Close the connection after insertion
};

run();
