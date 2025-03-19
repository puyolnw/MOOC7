import React, { useState } from "react";
import "./LessonQuiz.css";

interface Question {
   id: number;
   question: string;
   options: string[];
   correctAnswer: number;
}

const quizData: Question[] = [
   {
      id: 1,
      question: "What is React?",
      options: ["Library", "Framework", "Language", "Tool"],
      correctAnswer: 1,
   },
   {
      id: 2,
      question: "What is JSX?",
      options: ["JavaScript", "HTML", "JavaScript XML", "CSS"],
      correctAnswer: 2,
   },
   {
      id: 3,
      question: "What is the use of useState in React?",
      options: ["Manage state", "Handle routing", "Fetch data", "Optimize performance"],
      correctAnswer: 1,
   },
   {
      id: 4,
      question: "What is a React component?",
      options: ["A function or class", "A library", "A framework", "A database"],
      correctAnswer: 1,
   },
   {
      id: 5,
      question: "What is the virtual DOM?",
      options: ["A copy of the real DOM", "A database", "A server", "A framework"],
      correctAnswer: 1,
   },
];

const LessonQuiz = () => {
   const [currentQuestion, setCurrentQuestion] = useState(0);
   const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(Array(quizData.length).fill(null));
   const [showResults, setShowResults] = useState(false);

   const handleAnswer = (optionIndex: number) => {
      const updatedAnswers = [...selectedAnswers];
      updatedAnswers[currentQuestion] = optionIndex;
      setSelectedAnswers(updatedAnswers);
   };

   const calculateScore = () => {
      return selectedAnswers.reduce((score, answer, index) => {
         if (answer === quizData[index].correctAnswer) {
            return score + 1;
         }
         return score;
      }, 0);
   };

   const handleNext = () => {
      if (currentQuestion < quizData.length - 1) {
         setCurrentQuestion(currentQuestion + 1);
      }
   };

   const handlePrevious = () => {
      if (currentQuestion > 0) {
         setCurrentQuestion(currentQuestion - 1);
      }
   };

   const handleSubmit = () => {
      setShowResults(true);
   };

   const handleRetry = () => {
      setSelectedAnswers(Array(quizData.length).fill(null));
      setCurrentQuestion(0);
      setShowResults(false);
   };

   return (
      <div className="quiz-container">
         <h2 className="quiz-title">Lesson Quiz</h2>
         {!showResults ? (
            <div className="quiz-question">
               <h4 className="question-text">
                  {currentQuestion + 1}. {quizData[currentQuestion].question}
               </h4>
               <ul className="options-list">
                  {quizData[currentQuestion].options.map((option, index) => (
                     <li
                        key={index}
                        className={`option-item ${
                           selectedAnswers[currentQuestion] === index ? "selected" : ""
                        }`}
                        onClick={() => handleAnswer(index)}
                     >
                        {option}
                     </li>
                  ))}
               </ul>
               <div className="navigation-buttons">
                  <button
                     className="prev-button"
                     onClick={handlePrevious}
                     disabled={currentQuestion === 0}
                  >
                     Previous
                  </button>
                  {currentQuestion < quizData.length - 1 ? (
                     <button
                        className="next-button"
                        onClick={handleNext}
                        disabled={selectedAnswers[currentQuestion] === null}
                     >
                        Next
                     </button>
                  ) : (
                     <button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={selectedAnswers[currentQuestion] === null}
                     >
                        Submit
                     </button>
                  )}
               </div>
            </div>
         ) : (
            <div className="quiz-results">
               <h3>Your Score: {calculateScore()} / {quizData.length}</h3>
               <p>Thank you for completing the quiz!</p>
               <button className="retry-button" onClick={handleRetry}>
                  Retry Quiz
               </button>
            </div>
         )}
      </div>
   );
};

export default LessonQuiz;