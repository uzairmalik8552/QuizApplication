const MCQ = require("../models/mcq");
const mongoose = require("mongoose");

const getQuestion = async (req, res) => {
  try {
    const { department, page = 1, sessionId } = req.query;
    console.log(department, page, sessionId);
    // to check if the session idis passed
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "sessionId is required for consistent pagination",
      });
    }

    const questionsPerPage = 5;
    const currentPage = parseInt(page);
    const totalDeptQuestions = 20;
    const totalAptQuestions = 30;
    const totalQuestions = totalDeptQuestions + totalAptQuestions;
    const totalPages = Math.ceil(totalQuestions / questionsPerPage);

    // validate page number
    if (currentPage < 1 || currentPage > totalPages) {
      return res.status(400).json({
        success: false,
        error: `Invalid page number. Must be between 1 and ${totalPages}`,
      });
    }
    // this is used to paginate
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = Math.min(startIndex + questionsPerPage, totalQuestions);
    // this is used for decentralized shuffling because of which there will be no duplicate in different page
    // aldo for every session id the ordr will be different
    const userSeed = parseInt(sessionId.replace(/[^0-9]/g, "")) || Date.now();

    // fetch the question based on hash
    // const [deptQuestions, aptQuestions] = await Promise.all([
    //   MCQ.aggregate([
    //     {
    //       $match: {
    //         category: "department",
    //         department: department,
    //       },
    //     },
    //     {
    //       $addFields: {
    //         // this funfion geenerate randome hasvalue using seed value for the retrival of question
    //         sortOrder: {
    //           $function: {
    //             body: `function(id, seed) {
    //               const str = id.toString() + seed.toString();
    //               let hash = 0;

    //               for (let i = 0; i < str.length; i++) {
    //                 hash = ((hash << 5) - hash) + str.charCodeAt(i);
    //                 hash = hash & hash;
    //               }
    //                 console.log(hash);
    //               return hash;
    //             }`,
    //             args: ["$_id", userSeed],
    //             lang: "js",
    //           },
    //         },
    //       },
    //     },
    //     { $sort: { sortOrder: 1 } },
    //     { $limit: totalDeptQuestions },
    //   ]),

    //   MCQ.aggregate([
    //     {
    //       $match: {
    //         category: "aptitude",
    //       },
    //     },
    //     {
    //       $addFields: {
    //         sortOrder: {
    //           // it is also the same as previos funtion
    //           $function: {
    //             body: `function(id, seed) {
    //               const str = id.toString() + seed.toString();
    //               let hash = 0;
    //               for (let i = 0; i < str.length; i++) {
    //                 hash = ((hash << 5) - hash) + str.charCodeAt(i);
    //                 hash = hash & hash;
    //               }
    //               return hash;
    //             }`,
    //             args: ["$_id", userSeed + 1],
    //             lang: "js",
    //           },
    //         },
    //       },
    //     },
    //     { $sort: { sortOrder: 1 } },
    //     { $limit: totalAptQuestions },
    //   ]),
    // ]);
    const generateHash = (id, seed) => {
      const str = id.toString() + seed.toString();
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash;
    };

    let executionCount = 0;

    const [deptQuestions, aptQuestions] = await Promise.all([
      MCQ.aggregate([
        {
          $match: {
            category: "department",
            department: department,
          },
        },
        {
          $addFields: {
            sortOrder: {
              $function: {
                body: `function(id, seed) {
                  const str = id.toString() + seed.toString();
                  let hash = 0;
                  for (let i = 0; i < str.length; i++) {
                    hash = ((hash << 5) - hash) + str.charCodeAt(i);
                    hash = hash & hash;
                  }
                  return hash;
                }`,
                args: ["$_id", userSeed],
                lang: "js",
              },
            },
          },
        },
        { $sort: { sortOrder: 1 } },
        { $limit: totalDeptQuestions },
      ]).then((questions) => {
        executionCount++;
        console.log("Department Pipeline executed, hash values:");
        questions.forEach((q) =>
          console.log(`ID: ${q._id}, Hash: ${generateHash(q._id, userSeed)}`)
        );
        return questions;
      }),

      MCQ.aggregate([
        {
          $match: {
            category: "aptitude",
          },
        },
        {
          $addFields: {
            sortOrder: {
              $function: {
                body: `function(id, seed) {
                  const str = id.toString() + seed.toString();
                  let hash = 0;
                  for (let i = 0; i < str.length; i++) {
                    hash = ((hash << 5) - hash) + str.charCodeAt(i);
                    hash = hash & hash;
                  }
                  return hash;
                }`,
                args: ["$_id", userSeed + 1],
                lang: "js",
              },
            },
          },
        },
        { $sort: { sortOrder: 1 } },
        { $limit: totalAptQuestions },
      ]).then((questions) => {
        executionCount++;
        console.log("Aptitude Pipeline executed, hash values:");
        questions.forEach((q) =>
          console.log(
            `ID: ${q._id}, Hash: ${generateHash(q._id, userSeed + 1)}`
          )
        );
        return questions;
      }),
    ]);

    console.log(`Total Pipelines Executed: ${executionCount}`);

    let questionsForThisPage = [];
    // in this we are trying to show the department question fo\irst aand then the apptitude question
    if (startIndex < totalDeptQuestions) {
      const deptStart = startIndex;
      const deptEnd = Math.min(
        startIndex + questionsPerPage,
        totalDeptQuestions
      );
      questionsForThisPage.push(...deptQuestions.slice(deptStart, deptEnd));
    }

    if (
      questionsForThisPage.length < questionsPerPage &&
      endIndex > totalDeptQuestions
    ) {
      const aptStart = Math.max(0, startIndex - totalDeptQuestions);
      const aptQuestionsNeeded = questionsPerPage - questionsForThisPage.length;
      questionsForThisPage.push(
        ...aptQuestions.slice(aptStart, aptStart + aptQuestionsNeeded)
      );
    }

    // format questions for response which is retrived
    const formattedQuestions = questionsForThisPage.map((q) => ({
      id: q._id,
      question: q.question,
      options: q.options,
      category: q.category,
      department: q.department || null,
    }));

    res.json({
      success: true,
      data: {
        questions: formattedQuestions,
        pagination: {
          currentPage,
          totalPages,
          questionsPerPage,
          totalQuestions,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
          departmentQuestions: totalDeptQuestions,
          aptitudeQuestions: totalAptQuestions,
          questionsInThisPage: formattedQuestions.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// const validateAnswers = async (req, res) => {
//   try {
//     const { answers } = req.body;
//     console.log(answers);

//     // Input validation
//     if (!Array.isArray(answers) || answers.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid or empty answers array",
//       });
//     }

//     // Extract question IDs from the answers
//     const questionIds = answers.map((answer) => answer.questionId);

//     // Fetch all questions in a single database query
//     const questions = await MCQ.find({
//       _id: { $in: questionIds.map((id) => new mongoose.Types.ObjectId(id)) },
//     });

//     // Create a map for quick question lookup
//     const questionsMap = questions.reduce((acc, question) => {
//       acc[question._id.toString()] = question;
//       return acc;
//     }, {});

//     // Validate answers
//     const validationResults = answers.map((userAnswer) => {
//       const correspondingQuestion = questionsMap[userAnswer.questionId];

//       // Check if question exists
//       if (!correspondingQuestion) {
//         return {
//           questionId: userAnswer.questionId,
//           isCorrect: false,
//           error: "Question not found",
//         };
//       }

//       // Validate answer structure
//       if (!userAnswer.selectedOption) {
//         return {
//           questionId: userAnswer.questionId,
//           isCorrect: false,
//           error: "Selected option is required",
//         };
//       }

//       // Validate the selected option
//       const isCorrect =
//         correspondingQuestion.correctAnswer === userAnswer.selectedOption;

//       return {
//         questionId: userAnswer.questionId,
//         isCorrect: isCorrect,
//         selectedOption: userAnswer.selectedOption,
//         correctOption: correspondingQuestion.correctAnswer,
//         category: correspondingQuestion.category,
//         department: correspondingQuestion.department,
//       };
//     });

//     // Calculate overall score
//     const totalQuestions = validationResults.length;
//     const correctAnswers = validationResults.filter(
//       (result) => result.isCorrect
//     ).length;
//     const score = (correctAnswers / totalQuestions) * 100;

//     // Categorize results
//     const categorizedResults = {
//       total: totalQuestions,
//       departmentQuestions: validationResults.filter(
//         (r) => r.category === "department"
//       ).length,
//       aptitudeQuestions: validationResults.filter(
//         (r) => r.category === "aptitude"
//       ).length,
//       correct: correctAnswers,
//     };

//     // Prepare response
//     res.json({
//       success: true,
//       data: {
//         validationResults,
//         score: {
//           total: totalQuestions,
//           correct: correctAnswers,
//           percentage: score.toFixed(2),
//         },
//         categorizedResults,
//       },
//     });
//   } catch (error) {
//     console.error("Error validating answers:", error);
//     res.status(500).json({
//       success: false,
//       error: "Internal server error",
//       message: error.message,
//     });
//   }
// };

const validateAnswers = async (req, res) => {
  try {
    const { answers } = req.body;
    console.log(answers);

    // Handle empty or non-array answers gracefully
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.json({
        success: true,
        data: {
          validationResults: [],
          score: {
            total: 0,
            correct: 0,
            percentage: "0.00",
          },
          categorizedResults: {
            total: 0,
            departmentQuestions: 0,
            aptitudeQuestions: 0,
            correct: 0,
          },
        },
      });
    }

    // Extract question IDs from the answers
    const questionIds = answers.map((answer) => answer.questionId);

    // Fetch all questions in a single database query
    const questions = await MCQ.find({
      _id: { $in: questionIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    // Create a map for quick question lookup
    const questionsMap = questions.reduce((acc, question) => {
      acc[question._id.toString()] = question;
      return acc;
    }, {});

    // Validate answers
    const validationResults = answers.map((userAnswer) => {
      const correspondingQuestion = questionsMap[userAnswer.questionId];

      // Check if question exists
      if (!correspondingQuestion) {
        return {
          questionId: userAnswer.questionId,
          isCorrect: false,
          error: "Question not found",
        };
      }

      // Validate answer structure
      if (!userAnswer.selectedOption) {
        return {
          questionId: userAnswer.questionId,
          isCorrect: false,
          error: "Selected option is required",
        };
      }

      // Validate the selected option
      const isCorrect =
        correspondingQuestion.correctAnswer === userAnswer.selectedOption;

      return {
        questionId: userAnswer.questionId,
        isCorrect: isCorrect,
        selectedOption: userAnswer.selectedOption,
        correctOption: correspondingQuestion.correctAnswer,
        category: correspondingQuestion.category,
        department: correspondingQuestion.department,
      };
    });

    // Calculate overall score
    const totalQuestions = 50;
    const correctAnswers = validationResults.filter(
      (result) => result.isCorrect
    ).length;
    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Categorize results
    const categorizedResults = {
      total: totalQuestions,
      departmentQuestions: validationResults.filter(
        (r) => r.category === "department"
      ).length,
      aptitudeQuestions: validationResults.filter(
        (r) => r.category === "aptitude"
      ).length,
      correct: correctAnswers,
    };

    // Prepare response
    res.json({
      success: true,
      data: {
        validationResults,
        score: {
          total: totalQuestions,
          correct: correctAnswers,
          percentage: score.toFixed(2),
        },
        categorizedResults,
      },
    });
  } catch (error) {
    console.error("Error validating answers:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

module.exports = { getQuestion, validateAnswers };
