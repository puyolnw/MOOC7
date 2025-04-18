import { useState, useEffect } from 'react';
import axios from 'axios';
import './LessonQuiz.css';

interface LessonQuizProps {
  onComplete: (score?: number, passed?: boolean) => void; // เพิ่ม parameters
  quizData: any;
  subjectId?: string; // เพิ่ม subjectId เพื่อใช้ในการส่งข้อมูลไปยัง API
}

// Define different question types
type QuestionType = 'single' | 'multiple' | 'truefalse' | 'text' | 'original';

interface BaseQuestion {
  question: string;
  type: QuestionType;
  question_id: number;
}

interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single';
  options: string[];
  correctAnswer?: number;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple';
  options: string[];
  correctAnswers?: number[];
}

interface TrueFalseQuestion extends BaseQuestion {
  type: 'truefalse';
  correctAnswer?: boolean;
}

interface TextQuestion extends BaseQuestion {
  type: 'text';
  sampleAnswer?: string;
}

type Question = SingleChoiceQuestion | MultipleChoiceQuestion | TrueFalseQuestion | TextQuestion;

const LessonQuiz = ({ onComplete, quizData, subjectId }: LessonQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const apiURL = import.meta.env.VITE_API_URL;
  
  // For single choice questions
  const [selectedSingleAnswers, setSelectedSingleAnswers] = useState<number[]>([]);
  
  // For multiple choice questions
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<number[][]>([]);
  
  // For true/false questions
  const [selectedTrueFalseAnswers, setSelectedTrueFalseAnswers] = useState<boolean[]>([]);
  
  // For text questions
  const [textAnswers, setTextAnswers] = useState<string[]>([]);

  // Load quiz data
  useEffect(() => {
    const loadQuizData = async () => {
      if (!quizData) {
        setIsLoading(false);
        setError("ไม่พบข้อมูลแบบทดสอบ");
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // If we already have the questions in quizData
        if (quizData.questions && Array.isArray(quizData.questions)) {
          processQuizQuestions(quizData.questions);
          return;
        }
        
        // Otherwise fetch questions from API
        const token = localStorage.getItem("token");
        if (!token) {
          setError("ต้องเข้าสู่ระบบก่อนทำแบบทดสอบ");
          setIsLoading(false);
          return;
        }
        
        const quizId = quizData.quiz_id;
        if (!quizId) {
          setError("ไม่พบรหัสแบบทดสอบ");
          setIsLoading(false);
          return;
        }
        
        const apiEndpoint = `${apiURL}/api/courses/quizzes/${quizId}/questions`;
        
        const response = await axios.get(
          apiEndpoint,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Check different possible locations for questions in the response
        if (response.data.questions && Array.isArray(response.data.questions)) {
          processQuizQuestions(response.data.questions);
        } else if (response.data.quiz && response.data.quiz.questions && Array.isArray(response.data.quiz.questions)) {
          processQuizQuestions(response.data.quiz.questions);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          processQuizQuestions(response.data.data);
        } else {
          setError("ไม่พบข้อมูลคำถามในแบบทดสอบ");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading quiz data:", error);
        setError("เกิดข้อผิดพลาดในการโหลดคำถาม");
        setIsLoading(false);
      }
    };
    
    loadQuizData();
  }, [quizData, apiURL]);

  
  // Process quiz questions from API
  const processQuizQuestions = (apiQuestions: any[]) => {
    try {
      if (!apiQuestions || apiQuestions.length === 0) {
        setError("ไม่พบคำถามในแบบทดสอบ");
        setIsLoading(false);
        return;
      }
      
      const formattedQuestions: Question[] = apiQuestions.map(q => {
        // ดึงข้อมูลคำถาม
        const questionText = q.question_text || q.title || q.question || "";
        const questionId = q.question_id || q.id || 0;
        
        // แปลงประเภทคำถาม
        let type: QuestionType = 'single';
        
        // แปลงประเภทคำถามจาก API เป็นประเภทที่ frontend เข้าใจ
        if (q.type === 'SC' || q.type === 'single_choice') {
          type = 'single';
        } else if (q.type === 'MC' || q.type === 'multiple_choice') {
          type = 'multiple';
        } else if (q.type === 'TF' || q.type === 'true_false') {
          type = 'truefalse';
        } else if (q.type === 'FB' || q.type === 'text') {
          type = 'text';
        }
        
        // ดึงตัวเลือก - ตรวจสอบทุกรูปแบบที่เป็นไปได้
        let options: string[] = [];
        
        if (q.options && Array.isArray(q.options)) {
          // กรณีที่มี options เป็น array ตรง ๆ
          options = q.options.map((opt: any) => 
            typeof opt === 'string' ? opt : (opt.text || opt.title || "")
          );
        } else if (q.choices && Array.isArray(q.choices)) {
          // กรณีที่มี choices เป็น array
          options = q.choices.map((choice: any) => 
            typeof choice === 'string' ? choice : (choice.text || choice.title || "")
          );
        }
        
        // สร้างออบเจ็กต์คำถามตามประเภท
        const baseQuestion = {
          question: questionText,
          type,
          question_id: questionId
        };
        
        switch (type) {
          case 'single':
          case 'multiple':
            return {
              ...baseQuestion,
              options
            };
            
          case 'truefalse':
            // สำหรับคำถามถูก/ผิด ถ้าไม่มีตัวเลือกให้สร้างตัวเลือกเอง
            return {
              ...baseQuestion,
              options: options.length > 0 ? options : ["ถูก (True)", "ผิด (False)"]
            };
            
          case 'text':
            return {
              ...baseQuestion,
              sampleAnswer: q.sample_answer || ""
            } as TextQuestion;
            
          default:
            return {
              ...baseQuestion,
              options
            };
        }
      });

      setQuestions(formattedQuestions);
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing quiz questions:", error);
      setError("เกิดข้อผิดพลาดในการประมวลผลคำถาม");
      setIsLoading(false);
    }
  };
  

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

  // Submit quiz answers
  const submitQuizAnswers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !quizData?.quiz_id) return false;
      
      const answers = questions.map((question, index) => {
        let answer;
        
        switch (question.type) {
          case 'single':
            answer = selectedSingleAnswers[index];
            break;
          case 'multiple':
            answer = selectedMultipleAnswers[index] || [];
            break;
          case 'truefalse':
            answer = selectedTrueFalseAnswers[index];
            break;
          case 'text':
            answer = textAnswers[index];
            break;
        }
        
        return {
          question_id: question.question_id,
          answer_type: question.type,
          answer
        };
      });
      
      // ปรับปรุง URL ให้ตรงกับ API
      const submitEndpoint = `${apiURL}/api/courses/quizzes/${quizData.quiz_id}/submit`;
      console.log("Submitting quiz answers to:", submitEndpoint);
      console.log("Quiz data:", quizData);
      console.log("Answers:", answers);
      
      const response = await axios.post(
        submitEndpoint,
        { 
          answers,
          subject_id: subjectId // เพิ่ม subject_id เพื่อให้ API รู้ว่าเป็นแบบทดสอบของรายวิชาใด
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log("Quiz submission response:", response.data);
      
      if (response.data.success) {
        setScore(response.data.score || 0);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error submitting quiz answers:", error);
      return false;
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit answers and show results
      const success = await submitQuizAnswers();
      
      if (success) {
        setShowResult(true);
      } else {
        alert("เกิดข้อผิดพลาดในการส่งคำตอบ กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !quizData?.quiz_id) return;
      
      // Mark quiz as completed
      const completeEndpoint = `${apiURL}/api/courses/quizzes/${quizData.quiz_id}/complete`;
      console.log("Marking quiz as completed:", completeEndpoint);
      
      const response = await axios.post(
        completeEndpoint,
        {
          subject_id: subjectId // เพิ่ม subject_id เพื่อให้ API รู้ว่าเป็นแบบทดสอบของรายวิชาใด
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log("Quiz completion response:", response.data);
      
      // ตรวจสอบว่าคะแนนผ่านเกณฑ์หรือไม่
      const passed = response.data.passed !== undefined ? response.data.passed : true;
      
      // Call the onComplete callback with score and passed status
      onComplete(score, passed);
      
      // Reset quiz state
      setCurrentQuestion(0);
      setSelectedSingleAnswers([]);
      setSelectedMultipleAnswers([]);
      setSelectedTrueFalseAnswers([]);
      setTextAnswers([]);
      setShowResult(false);
    } catch (error) {
      console.error("Error completing quiz:", error);
    }
  };

   // Check if current question has been answered
   const isCurrentQuestionAnswered = () => {
    if (!questions[currentQuestion]) return false;
    
    switch (questions[currentQuestion].type) {
      case 'single':
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

  // Calculate progress percentage
  const progressPercentage = Math.round(((currentQuestion + 1) / questions.length) * 100);

  if (isLoading) {
    return (
      <div className="quiz-container loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
        <p>กำลังโหลดแบบทดสอบ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container error">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (showResult) {
    // Calculate percentage score
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    
    return (
      <div className="quiz-container result">
        <div className="quiz-result">
          <h2>ผลการทดสอบ</h2>
          
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{percentage}%</span>
            </div>
            <p>คุณได้คะแนน {score} จาก {questions.length} คะแนน</p>
          </div>
          
          
          <button 
            className="btn btn-primary btn-lg mt-4"
            onClick={handleFinish}
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-container empty">
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          ไม่พบคำถามในแบบทดสอบนี้
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h3>{quizData?.title || "แบบทดสอบ"}</h3>
        <div className="quiz-progress">
          <div className="progress">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${progressPercentage}%` }} 
              aria-valuenow={progressPercentage} 
              aria-valuemin={0} 
              aria-valuemax={100}
            ></div>
          </div>
          <span className="progress-text">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
      </div>
      
      <div className="quiz-content">
        <div className="question-container">
          <h4 className="question-text">
            <span className="question-number">{currentQuestion + 1}.</span> {currentQ.question}
          </h4>
          
          <div className="answer-options">
            {currentQ.type === 'single' && (
              <div className="single-choice-options">
                {(currentQ as SingleChoiceQuestion).options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`option-item ${selectedSingleAnswers[currentQuestion] === index ? 'selected' : ''}`}
                    onClick={() => handleSingleAnswerSelect(index)}
                  >
                    <div className="option-marker">
                      <div className="option-radio"></div>
                    </div>
                    <div className="option-text">{option}</div>
                  </div>
                ))}
              </div>
            )}
            
            {currentQ.type === 'multiple' && (
              <div className="multiple-choice-options">
                {(currentQ as MultipleChoiceQuestion).options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`option-item ${selectedMultipleAnswers[currentQuestion]?.includes(index) ? 'selected' : ''}`}
                    onClick={() => handleMultipleAnswerSelect(index)}
                  >
                    <div className="option-marker checkbox">
                      <div className="option-checkbox"></div>
                    </div>
                    <div className="option-text">{option}</div>
                  </div>
                ))}
              </div>
            )}
            
            {currentQ.type === 'truefalse' && (
              <div className="truefalse-options">
                <div 
                  className={`option-item ${selectedTrueFalseAnswers[currentQuestion] === true ? 'selected' : ''}`}
                  onClick={() => handleTrueFalseSelect(true)}
                >
                  <div className="option-marker">
                    <div className="option-radio"></div>
                  </div>
                  <div className="option-text">ถูก (True)</div>
                </div>
                <div 
                  className={`option-item ${selectedTrueFalseAnswers[currentQuestion] === false ? 'selected' : ''}`}
                  onClick={() => handleTrueFalseSelect(false)}
                >
                  <div className="option-marker">
                    <div className="option-radio"></div>
                  </div>
                  <div className="option-text">ผิด (False)</div>
                </div>
              </div>
            )}
            
            {currentQ.type === 'text' && (
              <div className="text-answer">
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="พิมพ์คำตอบของคุณที่นี่..."
                  value={textAnswers[currentQuestion] || ''}
                  onChange={handleTextAnswerChange}
                ></textarea>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="quiz-navigation">
        <button 
          className="btn btn-outline-primary"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <i className="fas fa-arrow-left me-2"></i>
          ข้อก่อนหน้า
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!isCurrentQuestionAnswered()}
        >
          {currentQuestion < questions.length - 1 ? (
            <>
              ข้อถัดไป
              <i className="fas fa-arrow-right ms-2"></i>
            </>
          ) : (
            <>
              ส่งคำตอบ
              <i className="fas fa-check ms-2"></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LessonQuiz;

