// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuestionQuery, validateAnswersAPI } from "../features/questionsApi";
// import QuestionCard from "./questionCard";

// const QuestionList = () => {
//   const [answers, setAnswers] = useState([]);
//   const [errors, setErrors] = useState([]);
//   const [isValidated, setIsValidated] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Prevent any navigation
//     const blockNavigation = (event) => {
//       event.preventDefault();
//       event.returnValue = ""; // For Chrome
//       return false;
//     };

//     // Check session validation
//     const sessionValidated = sessionStorage.getItem("sessionValidated");
//     if (!sessionValidated || sessionValidated !== "true") {
//       navigate("/student/session");
//       return;
//     }

//     // Block browser back/forward buttons and prevent navigation
//     window.addEventListener("popstate", blockNavigation);
//     window.history.pushState(null, document.title, window.location.href);

//     // Disable browser back button
//     window.history.pushState(null, null, window.location.href);
//     window.onpopstate = blockNavigation;

//     return () => {
//       window.removeEventListener("popstate", blockNavigation);
//     };
//   }, [navigate]);

//   // Rest of the component remains the same as previous implementation
//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetching,
//     isFetchingNextPage,
//     status,
//   } = useQuestionQuery();

//   const allQuestions = data?.pages.flatMap((page) => page.questions) || [];

//   const updateAnswer = (questionId, selectedOption) => {
//     const existingIndex = answers.findIndex((a) => a.questionId === questionId);

//     if (existingIndex !== -1) {
//       const newAnswers = [...answers];
//       newAnswers[existingIndex] = { questionId, selectedOption };
//       setAnswers(newAnswers);
//     } else {
//       setAnswers([...answers, { questionId, selectedOption }]);
//     }
//   };

//   const validateAnswers = () => {
//     const newErrors = [];

//     allQuestions.forEach((question) => {
//       const answer = answers.find((a) => a.questionId === question.id);

//       if (!answer) {
//         newErrors.push({
//           questionId: question.id,
//           error: "This question must be answered.",
//         });
//       }
//     });

//     setErrors(newErrors);
//     return newErrors.length === 0;
//   };

//   const handleSubmit = async () => {
//     try {
//       const isValid = validateAnswers();
//       setIsValidated(true);

//       if (!isValid) {
//         console.log("Validation failed. Fix the errors.");
//         return;
//       }

//       const data = await validateAnswersAPI(answers);
//       const totalScore = data.data.score.percentage;

//       // Set quiz submitted flag
//       sessionStorage.setItem("quizSubmitted", "true");

//       navigate("/student/result", { state: { score: totalScore } });
//     } catch (error) {
//       console.error(error.message);
//       alert("An error occurred during validation. Please try again.");
//     }
//   };

//   // Render methods remain the same as previous implementation
//   if (status === "pending") {
//     return (
//       <div className="bg-[#2a3439] min-h-screen flex items-center justify-center">
//         <p className="text-white">Loading questions...</p>
//       </div>
//     );
//   }

//   if (status === "error") {
//     return (
//       <div className="bg-[#2a3439] min-h-screen flex items-center justify-center">
//         <p className="text-red-500">Error fetching questions</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#2a3439] min-h-screen p-8">
//       <div className="bg-[#f5efe7] p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
//         <h1 className="text-2xl font-bold text-center text-[#2a3439] mb-6">
//           MCQ Questionnaire
//         </h1>

//         {allQuestions.map((question) => (
//           <QuestionCard
//             key={question.id}
//             question={question}
//             onAnswerChange={(selectedOption) =>
//               updateAnswer(question.id, selectedOption)
//             }
//             error={
//               isValidated &&
//               errors.find((err) => err.questionId === question.id)?.error
//             }
//           />
//         ))}

//         <div className="flex justify-between mt-6">
//           {hasNextPage ? (
//             <button
//               onClick={() => fetchNextPage()}
//               disabled={isFetchingNextPage}
//               className="py-2 px-4 bg-[#2a3439] text-white font-semibold rounded-md
//                 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isFetchingNextPage ? "Loading..." : "Next Page"}
//             </button>
//           ) : (
//             <button
//               onClick={handleSubmit}
//               className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md
//                 hover:bg-green-700 transition-colors"
//             >
//               Submit Answers
//             </button>
//           )}
//         </div>

//         {isFetching && !isFetchingNextPage && (
//           <p className="text-center text-[#2a3439] mt-4">Refreshing...</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default QuestionList;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Howl } from "howler";
import { useQuestionQuery, validateAnswersAPI } from "../features/questionsApi";
import QuestionCard from "./questionCard";
import Timer from "./Timer";

const QuestionList = () => {
  const [answers, setAnswers] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [soundReady, setSoundReady] = useState(false);
  const navigate = useNavigate();

  const EXAM_DURATION = 60;

  const safeExitFullscreen = () => {
    try {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Fullscreen exit error:", error);
    }
  };

  const alarmSound = new Howl({
    src: [require("./alarm-clock-90867.mp3")],
    volume: 1.0,
    onload: () => setSoundReady(true),
    onloaderror: (id, err) => {
      console.error("Sound load error:", err);
      setSoundReady(false);
    },
  });

  useEffect(() => {
    alarmSound.load();
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useQuestionQuery();

  const allQuestions = data?.pages.flatMap((page) => page.questions) || [];

  const validateAllQuestionsAnswered = useCallback(() => {
    const unansweredQuestions = allQuestions.filter(
      (question) => !answers.some((answer) => answer.questionId === question.id)
    );

    if (unansweredQuestions.length > 0) {
      const unansweredNumbers = unansweredQuestions
        .map((q) => allQuestions.findIndex((aq) => aq.id === q.id) + 1)
        .sort((a, b) => a - b)
        .join(", ");

      alert(
        `Please answer all questions before submitting.\nUnanswered questions: ${unansweredNumbers}`
      );
      return false;
    }
    return true;
  }, [answers, allQuestions]);

  const handleManualSubmit = useCallback(async () => {
    try {
      if (!validateAllQuestionsAnswered()) {
        return;
      }

      const formattedAnswers = answers.map((answer) => ({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
      }));

      const data = await validateAnswersAPI(formattedAnswers);
      const totalScore = data.data.score.percentage;
      sessionStorage.setItem("quizSubmitted", "true");
      safeExitFullscreen();
      navigate("/student/result", { state: { score: totalScore } });
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred during validation.";
      alert(errorMessage);
    }
  }, [answers, navigate, validateAllQuestionsAnswered]);

  const handleAutoSubmit = useCallback(async () => {
    try {
      const formattedAnswers = answers.map((answer) => ({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
      }));

      const data = await validateAnswersAPI(formattedAnswers);
      const totalScore = data.data.score.percentage;
      sessionStorage.setItem("quizSubmitted", "true");
      safeExitFullscreen();
      navigate("/student/result", { state: { score: totalScore } });
    } catch (error) {
      console.error("Auto-submission error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred during auto-submission.";
      alert(errorMessage);
    }
  }, [answers, navigate]);

  useEffect(() => {
    const sessionValidated = sessionStorage.getItem("sessionValidated");
    if (!sessionValidated || sessionValidated !== "true") {
      navigate("/student/session");
      return;
    }

    const enterFullscreen = () => {
      try {
        const docElm = document.documentElement;
        if (document.fullscreenElement) return;
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen().catch(console.error);
        } else if (docElm.mozRequestFullScreen) {
          docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
          docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
          docElm.msRequestFullscreen();
        }
      } catch (error) {
        console.error("Fullscreen permission error:", error);
      }
    };

    enterFullscreen();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;

          if (newCount <= 2) {
            if (soundReady) {
              alarmSound.play();
            }

            const confirmContinue = window.confirm(
              `Warning: Tab/Application switch detected (${newCount}/3)\n` +
                `Switching tabs or applications is not allowed during the exam.\n` +
                `Further switches will auto-submit your exam.`
            );

            enterFullscreen();
          }

          if (newCount > 2) {
            handleAutoSubmit();
          }

          return newCount;
        });
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          const confirmContinue = window.confirm(
            `Warning: Back to normal screen switch detected (${newCount}/3)\n` +
              `Switching tabs or applications is not allowed during the exam.\n` +
              `Further switches will auto-submit your exam.`
          );

          if (confirmContinue) {
            enterFullscreen();
          } else {
            enterFullscreen();
          }
          if (newCount > 2) {
            handleAutoSubmit();
          }

          return newCount;
        });
      }
    };

    const blockNavigation = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return false;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", blockNavigation);
    window.history.pushState(null, document.title, window.location.href);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", blockNavigation);
    };
  }, [navigate, soundReady, handleAutoSubmit, alarmSound]);

  const updateAnswer = (questionId, selectedOption) => {
    const existingIndex = answers.findIndex((a) => a.questionId === questionId);

    if (existingIndex !== -1) {
      const newAnswers = [...answers];
      newAnswers[existingIndex] = { questionId, selectedOption };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionId, selectedOption }]);
    }
  };

  if (status === "pending") {
    return (
      <div className="bg-[#2a3439] min-h-screen flex items-center justify-center">
        <p className="text-white">Loading questions...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-[#2a3439] min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error fetching questions</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2a3439] min-h-screen p-8">
      <div className="bg-[#f5efe7] p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2a3439]">MCQ</h1>
          <Timer
            totalSeconds={EXAM_DURATION}
            onTimerComplete={handleAutoSubmit}
          />
        </div>

        {allQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onAnswerChange={(selectedOption) =>
              updateAnswer(question.id, selectedOption)
            }
            error={
              isValidated &&
              errors.find((err) => err.questionId === question.id)?.error
            }
          />
        ))}

        <div className="flex justify-between mt-6">
          {hasNextPage ? (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="py-2 px-4 bg-[#2a3439] text-white font-semibold rounded-md 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? "Loading..." : "Next Page"}
            </button>
          ) : (
            <button
              onClick={handleManualSubmit}
              className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md 
                hover:bg-green-700 transition-colors"
            >
              Submit Answers
            </button>
          )}
        </div>

        {isFetching && !isFetchingNextPage && (
          <p className="text-center text-[#2a3439] mt-4">Refreshing...</p>
        )}
      </div>
    </div>
  );
};

export default QuestionList;
