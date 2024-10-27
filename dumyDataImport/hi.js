const mongoose = require("mongoose");
const faker = require("@faker-js/faker").faker;
const Contact = require("../models/contact"); // Path to your contact model
const connectDB = require("../config/db"); // Your MongoDB config

// Function to generate 4500 contacts with only the required fields
const generateContacts = async () => {
  let contacts = [];
  let uniquePhoneNumbers = new Set(); // Set to track unique phone numbers

  for (let i = 0; i < 4500; i++) {
    let phoneNumber;

    // Keep generating until we get a unique phone number
    do {
      phoneNumber = faker.number
        .int({ min: 1000000000, max: 9999999999 })
        .toString();
    } while (uniquePhoneNumbers.has(phoneNumber)); // Ensure uniqueness

    uniquePhoneNumbers.add(phoneNumber); // Add to the set

    let contact = {
      hrName: faker.person.fullName(),
      hrNumber: phoneNumber,
      hrCompany: faker.company.name(),
      status: faker.helpers.arrayElement([
        "Not called",
        "Blacklisted",
        "Wrong number",
        "Called not reachable",
        "Called and declined",
        "Called and postponed",
        "Called and accepted",
        "Emailed and awaiting",
        "Emailed and declined",
        "Emailed and confirmed",
      ]),
    };

    contacts.push(contact);

    // Insert in batches of 500 to prevent memory issues
    if (contacts.length === 500) {
      try {
        await Contact.insertMany(contacts);
        console.log("Batch of 500 contacts inserted successfully");
        contacts = []; // Clear the array after successful insertion
      } catch (err) {
        console.error("Error inserting contacts:", err);
        return; // Exit if there's an error
      }
    }
  }

  // Insert any remaining contacts
  if (contacts.length > 0) {
    try {
      await Contact.insertMany(contacts);
      console.log(
        `Final batch of ${contacts.length} contacts inserted successfully`
      );
    } catch (err) {
      console.error("Error inserting contacts:", err);
    }
  }

  console.log("All 4500 contacts have been generated and inserted");

  // Close the connection
  await mongoose.connection.close();
};

// Connect to DB and run the script
const start = async () => {
  try {
    await connectDB(); // Call your MongoDB connection function
    console.log("Connected to database");
    await generateContacts(); // Call the data generation function
  } catch (err) {
    console.error("Error starting the script:", err);
    process.exit(1);
  }
};

start();
