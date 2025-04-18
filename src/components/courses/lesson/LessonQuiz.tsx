import { useState, useEffect } from 'react';
import axios from 'axios';
import './LessonQuiz.css';

interface LessonQuizProps {
  onComplete: () => void;
  quizData: any;
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

const LessonQuiz = ({ onComplete, quizData }: LessonQuizProps) => {
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
      if (!token || !quizData?.quiz_id) return;
      
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
      
      const response = await axios.post(
        `${apiURL}/api/courses/quizzes/${quizData.quiz_id}/submit`,
        { answers },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setScore(response.data.score || 0);
        return true;
      }
      
      return false;
    } catch (error) {
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
      await axios.post(
        `${apiURL}/api/courses/quizzes/${quizData.quiz_id}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Call the onComplete callback
      onComplete();
      
      // Reset quiz state
      setCurrentQuestion(0);
      setSelectedSingleAnswers([]);
      setSelectedMultipleAnswers([]);
      setSelectedTrueFalseAnswers([]);
      setTextAnswers([]);
      setShowResult(false);
    } catch (error) {

    }
  };

  // Check if current question has been answered
  const isCurrentQuestionAnswered = () => {
    if (!questions[currentQuestion]) return false;
    
    const question = questions[currentQuestion];
    
    switch (question.type) {
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

  // Render the current question based on its type
  const renderQuestion = () => {
    if (isLoading || !questions[currentQuestion]) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">กำลังโหลดคำถาม...</p>
        </div>
      );
    }
    
    const question = questions[currentQuestion];
    
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
    
  default:
    return (
      <div className="quiz-question">
        <h4>ไม่รองรับรูปแบบคำถามนี้</h4>
      </div>
    );
}
};

if (isLoading) {
  return (
    <div className="lesson-quiz-container">
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">กำลังโหลดแบบทดสอบ...</span>
        </div>
        <p className="mt-3">กำลังโหลดแบบทดสอบ...</p>
      </div>
    </div>
  );
}

if (error) {
return (
  <div className="lesson-quiz-container">
    <div className="alert alert-danger">
      <i className="fas fa-exclamation-circle me-2"></i>
      {error}
    </div>
    <button 
      className="btn btn-primary mt-3"
      onClick={() => window.location.reload()}
    >
      <i className="fas fa-sync-alt me-2"></i>
      ลองใหม่อีกครั้ง
    </button>
  </div>
);
}

return (
<div className="lesson-quiz-container">
  {!showResult ? (
    <>
      <div className="quiz-header">
        <h3>{quizData?.title || "แบบทดสอบ"}</h3>
        <div className="quiz-progress">
          <span>คำถามที่ {currentQuestion + 1} จาก {questions.length}</span>
          <div className="quiz-progress-bar">
            <div 
              className="quiz-progress-fill" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
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
          {currentQuestion < questions.length - 1 ? 'ถัดไป' : 'ส่งคำตอบ'}
        </button>
      </div>
    </>
  ) : (
    <div className="quiz-result">
      <h3>ผลการทดสอบ</h3>
      <div className="result-score">
        <div className="score-circle">
          <span className="score-number">{score}</span>
          <span className="score-total">/{questions.length}</span>
        </div>
        <p className="score-percentage">
          {Math.round((score / questions.length) * 100)}%
        </p>
      </div>
      
      <div className="result-message">
        {score === questions.length ? (
          <p>ยอดเยี่ยม! คุณตอบถูกทุกข้อ</p>
        ) : score >= questions.length * 0.7 ? (
          <p>ดีมาก! คุณทำได้ดี</p>
        ) : score >= questions.length * 0.5 ? (
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
