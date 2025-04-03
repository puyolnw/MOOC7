import { useState } from 'react';
import './LessonQuiz.css';

interface LessonQuizProps {
  onComplete: () => void;
}

// Define different question types
type QuestionType = 'single' | 'multiple' | 'truefalse' | 'text' | 'original';

interface BaseQuestion {
  question: string;
  type: QuestionType;
}

interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single';
  options: string[];
  correctAnswer: number;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple';
  options: string[];
  correctAnswers: number[];
}

interface TrueFalseQuestion extends BaseQuestion {
  type: 'truefalse';
  correctAnswer: boolean;
}

interface TextQuestion extends BaseQuestion {
  type: 'text';
  sampleAnswer: string;
}

interface OriginalQuestion extends BaseQuestion {
  type: 'original';
  options: string[];
  correctAnswer: number;
}

type Question = SingleChoiceQuestion | MultipleChoiceQuestion | TrueFalseQuestion | TextQuestion | OriginalQuestion;

const LessonQuiz = ({ onComplete }: LessonQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  
  // For single choice questions
  const [selectedSingleAnswers, setSelectedSingleAnswers] = useState<number[]>([]);
  
  // For multiple choice questions
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<number[][]>([]);
  
  // For true/false questions
  const [selectedTrueFalseAnswers, setSelectedTrueFalseAnswers] = useState<boolean[]>([]);
  
  // For text questions
  const [textAnswers, setTextAnswers] = useState<string[]>([]);

  // ตัวอย่างข้อมูลแบบทดสอบที่ปรับปรุงแล้ว
  const quizData: Question[] = [
    {
      type: 'multiple',
      question: "เลือกเฟรมเวิร์ค JavaScript ที่ใช้สำหรับการพัฒนาเว็บแอปพลิเคชัน (เลือกได้ 2 ข้อ)",
      options: ["Angular", "React", "Django", "Vue.js", "Flask", "Express.js"],
      correctAnswers: [0, 1] // Angular และ React
    },
    {
      type: 'single',
      question: "React ถูกพัฒนาโดยบริษัทใด?",
      options: ["Google", "Facebook", "Microsoft", "Amazon"],
      correctAnswer: 1 // Facebook
    },
    {
      type: 'truefalse',
      question: "JSX เป็นส่วนขยายของภาษา JavaScript ที่ช่วยให้เขียน HTML ในโค้ด JavaScript ได้",
      correctAnswer: true
    },
    {
      type: 'text',
      question: "อธิบายความแตกต่างระหว่าง Props และ State ใน React",
      sampleAnswer: "Props คือข้อมูลที่ส่งจาก Component แม่ไปยัง Component ลูก ไม่สามารถเปลี่ยนแปลงได้ภายใน Component ที่รับมา ส่วน State คือข้อมูลภายใน Component ที่สามารถเปลี่ยนแปลงได้และทำให้ Component นั้นเกิดการ re-render"
    },
    {
      type: 'original',
      question: "Virtual DOM คืออะไร?",
      options: [
        "DOM จำลองที่ React สร้างขึ้นเพื่อเปรียบเทียบก่อนอัปเดต DOM จริง", 
        "ส่วนของ DOM ที่มองไม่เห็น", 
        "DOM ที่ทำงานบน server", 
        "DOM ที่ทำงานบนอุปกรณ์เสมือน"
      ],
      correctAnswer: 0
    }
  ];

  // Handle single choice answer selection
  const handleSingleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedSingleAnswers];
    newSelectedAnswers[currentQuestion] = answerIndex;
    setSelectedSingleAnswers(newSelectedAnswers);
  };

  // Handle multiple choice answer selection
  const handleMultipleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedMultipleAnswers];
    
    // Initialize the array for current question if it doesn't exist
    if (!newSelectedAnswers[currentQuestion]) {
      newSelectedAnswers[currentQuestion] = [];
    }
    
    // Toggle selection
    const currentSelections = newSelectedAnswers[currentQuestion];
    const selectionIndex = currentSelections.indexOf(answerIndex);
    
    if (selectionIndex === -1) {
      // Add selection
      currentSelections.push(answerIndex);
    } else {
      // Remove selection
      currentSelections.splice(selectionIndex, 1);
    }
    
    setSelectedMultipleAnswers(newSelectedAnswers);
  };

  // Handle true/false answer selection
  const handleTrueFalseSelect = (answer: boolean) => {
    const newSelectedAnswers = [...selectedTrueFalseAnswers];
    newSelectedAnswers[currentQuestion] = answer;
    setSelectedTrueFalseAnswers(newSelectedAnswers);
  };

  // Handle text answer input
  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTextAnswers = [...textAnswers];
    newTextAnswers[currentQuestion] = e.target.value;
    setTextAnswers(newTextAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // คำนวณคะแนน
      let newScore = 0;
      
      for (let i = 0; i < quizData.length; i++) {
        const question = quizData[i];
        
        switch (question.type) {
          case 'single':
            if (selectedSingleAnswers[i] === question.correctAnswer) {
              newScore++;
            }
            break;
            
          case 'multiple':
            // Check if selected answers match correct answers exactly
            const selectedAnswers = selectedMultipleAnswers[i] || [];
            if (
              selectedAnswers.length === question.correctAnswers.length &&
              question.correctAnswers.every(answer => selectedAnswers.includes(answer))
            ) {
              newScore++;
            }
            break;
            
          case 'truefalse':
            if (selectedTrueFalseAnswers[i] === question.correctAnswer) {
              newScore++;
            }
            break;
            
          case 'text':
            // For text questions, we'll give a point if they provided an answer
            // In a real application, this would need manual grading or AI evaluation
            if (textAnswers[i] && textAnswers[i].trim().length > 0) {
              newScore++;
            }
            break;
            
          case 'original':
            if (selectedSingleAnswers[i] === question.correctAnswer) {
              newScore++;
            }
            break;
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
    setSelectedSingleAnswers([]);
    setSelectedMultipleAnswers([]);
    setSelectedTrueFalseAnswers([]);
    setTextAnswers([]);
    setShowResult(false);
  };

  // Check if current question has been answered
  const isCurrentQuestionAnswered = () => {
    const question = quizData[currentQuestion];
    
    switch (question.type) {
      case 'single':
      case 'original':
        return selectedSingleAnswers[currentQuestion] !== undefined;
        
      case 'multiple':
        return selectedMultipleAnswers[currentQuestion]?.length > 0;
        
      case 'truefalse':
        return selectedTrueFalseAnswers[currentQuestion] !== undefined;
        
      case 'text':
        return textAnswers[currentQuestion]?.trim().length > 0;
        
      default:
        return false;
    }
  };

  // Render the current question based on its type
  const renderQuestion = () => {
    const question = quizData[currentQuestion];
    
    switch (question.type) {
      case 'single':
        return (
          <div className="quiz-question">
            <h4>{question.question}</h4>
            <div className="quiz-options">
              {question.options.map((option, index) => (
                <div 
                  key={index} 
                  className={`quiz-option ${selectedSingleAnswers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleSingleAnswerSelect(index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'multiple':
        return (
          <div className="quiz-question">
            <h4>{question.question}</h4>
            <p className="text-muted small">เลือกได้มากกว่า 1 ข้อ</p>
            <div className="quiz-options">
              {question.options.map((option, index) => (
                <div 
                  key={index} 
                  className={`quiz-option ${selectedMultipleAnswers[currentQuestion]?.includes(index) ? 'selected' : ''}`}
                  onClick={() => handleMultipleAnswerSelect(index)}
                >
                  <span className="option-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedMultipleAnswers[currentQuestion]?.includes(index) || false}
                      onChange={() => {}} // Handled by the onClick of the parent div
                      className="me-2"
                    />
                  </span>
                  <span className="option-text">{option}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'truefalse':
        return (
          <div className="quiz-question">
            <h4>{question.question}</h4>
            <div className="quiz-options">
              <div 
                className={`quiz-option ${selectedTrueFalseAnswers[currentQuestion] === true ? 'selected' : ''}`}
                onClick={() => handleTrueFalseSelect(true)}
              >
                <span className="option-letter">A</span>
                <span className="option-text">ถูก (True)</span>
              </div>
              <div 
                className={`quiz-option ${selectedTrueFalseAnswers[currentQuestion] === false ? 'selected' : ''}`}
                onClick={() => handleTrueFalseSelect(false)}
              >
                <span className="option-letter">B</span>
                <span className="option-text">ผิด (False)</span>
              </div>
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div className="quiz-question">
            <h4>{question.question}</h4>
            <textarea
              className="form-control mt-3"
              rows={6}
              placeholder="พิมพ์คำตอบของคุณที่นี่..."
              value={textAnswers[currentQuestion] || ''}
              onChange={handleTextAnswerChange}
              maxLength={5000}
            ></textarea>
            <p className="text-muted small mt-2">
              {textAnswers[currentQuestion]?.length || 0}/5000 ตัวอักษร
            </p>
          </div>
        );
        
      case 'original':
        return (
          <div className="quiz-question">
            <h4>{question.question}</h4>
            <div className="quiz-options">
              {question.options.map((option, index) => (
                <div 
                  key={index} 
                  className={`quiz-option ${selectedSingleAnswers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleSingleAnswerSelect(index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
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
          
          {renderQuestion()}
          
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
              disabled={!isCurrentQuestionAnswered()}
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
