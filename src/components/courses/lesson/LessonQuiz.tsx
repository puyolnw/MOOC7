import React, { useState } from 'react';
import './LessonQuiz.css';

interface LessonQuizProps {
  onComplete: () => void;
}

const LessonQuiz = ({ onComplete }: LessonQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // ตัวอย่างข้อมูลแบบทดสอบ
  const quizData = [
    {
      question: "React ถูกพัฒนาโดยบริษัทใด?",
      options: ["Google", "Facebook", "Microsoft", "Amazon"],
      correctAnswer: 1
    },
    {
      question: "JSX คืออะไร?",
      options: [
        "JavaScript XML", 
        "JavaScript Extension", 
        "JavaScript Extra", 
        "JavaScript Execute"
      ],
      correctAnswer: 0
    },
    {
      question: "ข้อใดไม่ใช่ Hook ที่มีใน React?",
      options: ["useState", "useEffect", "useContext", "useLayout"],
      correctAnswer: 3
    },
    {
      question: "Virtual DOM คืออะไร?",
      options: [
        "DOM จำลองที่ React สร้างขึ้นเพื่อเปรียบเทียบก่อนอัปเดต DOM จริง", 
        "ส่วนของ DOM ที่มองไม่เห็น", 
        "DOM ที่ทำงานบน server", 
        "DOM ที่ทำงานบนอุปกรณ์เสมือน"
      ],
      correctAnswer: 0
    },
    {
      question: "ข้อใดคือวิธีการสร้าง Component ใน React?",
      options: [
        "Function และ Class", 
        "Module และ Package", 
        "HTML และ CSS", 
        "Props และ State"
      ],
      correctAnswer: 0
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // คำนวณคะแนน
      let newScore = 0;
      for (let i = 0; i < quizData.length; i++) {
        if (selectedAnswers[i] === quizData[i].correctAnswer) {
          newScore++;
        }
      }
      setScore(newScore);
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = () => {
    // เรียกฟังก์ชัน onComplete เพื่ออัปเดตความคืบหน้า
    onComplete();
    // รีเซ็ตแบบทดสอบ
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResult(false);
  };

  return (
    <div className="lesson-quiz-container">
      {!showResult ? (
        <>
          <div className="quiz-header">
            <h3>แบบทดสอบ</h3>
            <div className="quiz-progress">
              <span>คำถามที่ {currentQuestion + 1} จาก {quizData.length}</span>
              <div className="quiz-progress-bar">
                <div 
                  className="quiz-progress-fill" 
                  style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="quiz-question">
            <h4>{quizData[currentQuestion].question}</h4>
            <div className="quiz-options">
              {quizData[currentQuestion].options.map((option, index) => (
                <div 
                  key={index} 
                  className={`quiz-option ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="quiz-navigation">
            <button 
              className="quiz-btn previous" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              ย้อนกลับ
            </button>
            <button 
              className="quiz-btn next" 
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
            >
              {currentQuestion < quizData.length - 1 ? 'ถัดไป' : 'ส่งคำตอบ'}
            </button>
          </div>
        </>
      ) : (
        <div className="quiz-result">
          <h3>ผลการทดสอบ</h3>
          <div className="result-score">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/{quizData.length}</span>
            </div>
            <p className="score-percentage">
              {Math.round((score / quizData.length) * 100)}%
            </p>
          </div>
          
          <div className="result-message">
            {score === quizData.length ? (
              <p>ยอดเยี่ยม! คุณตอบถูกทุกข้อ</p>
            ) : score >= quizData.length * 0.7 ? (
              <p>ดีมาก! คุณทำได้ดี</p>
            ) : score >= quizData.length * 0.5 ? (
              <p>ดี! แต่ยังมีพื้นที่ให้ปรับปรุง</p>
            ) : (
              <p>คุณอาจต้องทบทวนเนื้อหาอีกครั้ง</p>
            )}
          </div>
          
          <button className="quiz-btn finish" onClick={handleFinish}>
            เสร็จสิ้น
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonQuiz;
