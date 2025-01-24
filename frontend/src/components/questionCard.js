import React, { useState } from "react";

const QuestionCard = ({ question, onAnswerChange, error }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (selectedAnswer) => {
    setSelectedOption(selectedAnswer);
    onAnswerChange(selectedAnswer);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold text-[#2a3439] mb-4">
        {question.question}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              type="radio"
              id={`${question.id}-option-${index}`}
              name={`question-${question.id}`}
              value={option}
              checked={selectedOption === option}
              onChange={() => handleOptionChange(option)}
              className="mr-3 text-[#2a3439] focus:ring-[#2a3439]"
            />
            <label
              htmlFor={`${question.id}-option-${index}`}
              className="text-[#2a3439]"
            >
              {option}
            </label>
          </div>
        ))}
      </div>

      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </div>
  );
};

export default QuestionCard;
