import React, { useState, useEffect, useCallback } from "react";

const Timer = ({ totalSeconds, onTimerComplete, onRestartTimer }) => {
  // Initialize state with a function to check sessionStorage
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const savedTimerData = sessionStorage.getItem("quizTimerData");
    if (savedTimerData) {
      try {
        const parsedData = JSON.parse(savedTimerData);
        const elapsedTime = Math.floor(
          (Date.now() - parsedData.startTime) / 1000
        );
        const timeLeft = Math.max(totalSeconds - elapsedTime, 0);
        return timeLeft;
      } catch (error) {
        console.error("Error parsing saved timer data:", error);
        return totalSeconds;
      }
    }
    return totalSeconds;
  });

  const [isActive, setIsActive] = useState(() => {
    const savedTimerData = sessionStorage.getItem("quizTimerData");
    return !!savedTimerData;
  });

  // Memoized callback to start the timer
  const startTimer = useCallback(() => {
    sessionStorage.setItem(
      "quizTimerData",
      JSON.stringify({
        startTime: Date.now(),
        duration: totalSeconds,
      })
    );
    setIsActive(true);
  }, [totalSeconds]);

  // Effect for timer countdown
  useEffect(() => {
    // If totalSeconds changes, reset the timer
    if (remainingSeconds === totalSeconds) {
      startTimer();
    }

    let interval;
    if (isActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prevTime) => {
          const newTime = prevTime - 1;

          // Update sessionStorage
          const savedData = JSON.parse(
            sessionStorage.getItem("quizTimerData") || "{}"
          );
          savedData.startTime = Date.now() - (totalSeconds - newTime) * 1000;
          sessionStorage.setItem("quizTimerData", JSON.stringify(savedData));

          if (newTime <= 0) {
            clearInterval(interval);
            setIsActive(false);
            sessionStorage.removeItem("quizTimerData");
            onTimerComplete && onTimerComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    // Cleanup interval
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, remainingSeconds, totalSeconds, onTimerComplete, startTimer]);

  // Handle page reload preservation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isActive && remainingSeconds > 0) {
        const savedData = {
          startTime: Date.now() - (totalSeconds - remainingSeconds) * 1000,
          duration: totalSeconds,
        };
        sessionStorage.setItem("quizTimerData", JSON.stringify(savedData));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isActive, remainingSeconds, totalSeconds]);

  // Format time to HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((v) => v.toString().padStart(2, "0"))
      .join(":");
  };

  // Determine timer color based on remaining time
  const getTimerColor = () => {
    if (remainingSeconds <= 300) return "text-red-500";
    if (remainingSeconds <= 900) return "text-yellow-500";
    return "text-[#2a3439]";
  };

  // Restart timer handler
  const handleRestartTimer = () => {
    // Remove saved timer data
    sessionStorage.removeItem("quizTimerData");

    // Reset timer to full duration and restart
    setRemainingSeconds(totalSeconds);
    startTimer();

    // Call the original onRestartTimer prop if provided
    onRestartTimer && onRestartTimer();
  };

  return (
    <div
      className={`
      w-32 text-center
      px-4 py-2 
      bg-[#f5efe7] 
      border-2 border-[#2a3439] 
      rounded-md 
      font-bold 
      ${getTimerColor()}
      text-lg
      fixed top-2 left-2 z-10
    `}
    >
      <div className="flex justify-between items-center"> 
        <div>{formatTime(remainingSeconds)}</div>
        <button
          className="text-[#2a3439] hover:text-gray-700 focus:outline-none"
          onClick={handleRestartTimer}
        >
          ↻
        </button>
      </div>
    </div>
  );
};

export default Timer;
