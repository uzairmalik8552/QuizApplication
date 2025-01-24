import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";

const fetchQuestions = async ({ pageParam = 1 }) => {
  try {
    const token = sessionStorage.getItem("token");
    const sessionId = sessionStorage.getItem("sessionId");
    const department = sessionStorage.getItem("department") || "default";

    const response = await axios.get(`http://localhost:3000/mcq/questions`, {
      params: {
        page: pageParam,
        department,
        sessionId,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    // Return both the questions and pagination data
    return {
      questions: response.data.data.questions,
      pagination: response.data.data.pagination,
    };
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const useQuestionQuery = () => {
  return useInfiniteQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Use `hasNextPage` from the pagination data to determine the next page
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
  });
};

export const validateAnswersAPI = async (answers) => {
  const token = sessionStorage.getItem("token");
  try {
    const response = await axios.post("http://localhost:3000/mcq/validate", {
      answers,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error validating answers:", error);
    throw new Error(
      error.response?.data?.error || "Failed to validate answers"
    );
  }
};
