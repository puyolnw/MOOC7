import { useState, useEffect } from 'react';
import './LessonQuiz.css';
import axios from 'axios';

// เพิ่มการใช้ API URL จาก .env
const API_URL = import.meta.env.VITE_API_URL;

interface LessonQuizProps {
  onComplete: () => void;
  isCompleted?: boolean;
  quizId: number;
  quizData?: any[];
}

// Define different question types
type QuestionType = 'SC' | 'MC' | 'TF' | 'text';

interface Question {
  question_id: number;
  title: string;
  type: QuestionType;
  score: number;
  choices: {
    choice_id: number;
    text: string;
    is_correct: boolean;
  }[];
}

const LessonQuiz = ({ onComplete, isCompleted = false, quizId, quizData = [] }: LessonQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  console.log("Log:", hasAttempted);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // For single choice questions (SC, TF)
  const [selectedSingleAnswers, setSelectedSingleAnswers] = useState<number[]>([]);
  
  // For multiple choice questions (MC)
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<number[][]>([]);
  
  // For text questions
  const [textAnswers, setTextAnswers] = useState<string[]>([]);

  // กำหนดเกณฑ์การผ่าน (65%)
  const PASSING_PERCENTAGE = 65;

  // โหลดข้อมูลแบบทดสอบเมื่อ quizId เปลี่ยน
  useEffect(() => {
    const fetchQuizData = async () => {
      if (quizId <= 0) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // ถ้ามีข้อมูล quizData ที่ส่งมาจาก props ให้ใช้ข้อมูลนั้น
        if (quizData && quizData.length > 0) {
          // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
          const formattedQuestions = quizData.map((q: any) => ({
            question_id: q.question_id,
            title: q.question_text || q.title,
            type: q.type,
            score: q.score || 1,
            choices: q.choices || []
          }));
          
          setQuestions(formattedQuestions);
          setLoading(false);
          return;
        }
        
        // ถ้าไม่มีข้อมูลจาก props ให้ดึงข้อมูลจาก API
        const response = await axios.get(`${API_URL}/api/learn/quiz/${quizId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success && response.data.quiz) {
          setQuestions(response.data.quiz.questions);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizData();
    
    // เช็คว่าทำข้อสอบผ่านแล้วหรือไม่
    if (isCompleted) {
      setIsPassed(true);
      setShowResult(true);
    }
  }, [quizId, quizData, isCompleted]);

  // Handle single choice answer selection (SC, TF)
  const handleSingleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedSingleAnswers];
    newSelectedAnswers[currentQuestion] = answerIndex;
    setSelectedSingleAnswers(newSelectedAnswers);
  };

  // Handle multiple choice answer selection (MC)
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

  // Handle text answer input
  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log("Text answer changed:", handleTextAnswerChange);
    const newTextAnswers = [...textAnswers];
    newTextAnswers[currentQuestion] = e.target.value;
    setTextAnswers(newTextAnswers); 
  };
 
  // ส่งคำตอบไปยัง API
  const submitQuizAnswers = async () => {
    try {
      const answers = questions.map((question, index) => {
        let answer;
        
        switch (question.type) {
          case 'SC':
          case 'TF':
            // ส่ง choice_id ที่เลือก
            answer = question.choices[selectedSingleAnswers[index]]?.choice_id;
            break;
            
          case 'MC':
            // ส่งเป็น array ของ choice_id ที่เลือก
            answer = selectedMultipleAnswers[index]?.map(idx => question.choices[idx]?.choice_id) || [];
            break;
            
          default:
            answer = null;
        }
        
        return {
          question_id: question.question_id,
          answer
        };
      }).filter(a => a.answer !== undefined && a.answer !== null);
      
      const response = await axios.post(`${API_URL}/api/learn/quiz/${quizId}/submit`, 
        { answers },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        const { totalScore, maxScore, percentage, passed } = response.data.result;
        
        setScore(totalScore);
        setIsPassed(passed);
        
        // ถ้าผ่านเกณฑ์ ให้เรียก onComplete
        if (passed) {
          onComplete();
        }
        
        return { totalScore, maxScore, percentage, passed };
      }
      
      return null;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      return null;
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // ส่งคำตอบและแสดงผล
      setHasAttempted(true);
      
      const result = await submitQuizAnswers();
      
      if (result) {
        setScore(result.totalScore);
        setIsPassed(result.passed);
      } else {
        // ถ้าไม่สามารถส่งคำตอบได้ ให้คำนวณคะแนนเอง
        let newScore = 0;
        
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          
          switch (question.type) {
            case 'SC':
            case 'TF':
              if (selectedSingleAnswers[i] !== undefined && 
                  question.choices[selectedSingleAnswers[i]]?.is_correct) {
                newScore += question.score;
              }
              break;
              
            case 'MC':
              // ตรวจสอบว่าเลือกตัวเลือกที่ถูกต้องทั้งหมด
              const selectedChoices = selectedMultipleAnswers[i] || [];
              const correctChoices = question.choices
                .map((choice, idx) => ({ idx, is_correct: choice.is_correct }))
                .filter(choice => choice.is_correct)
                .map(choice => choice.idx);
              
              if (selectedChoices.length === correctChoices.length &&
                  correctChoices.every(idx => selectedChoices.includes(idx))) {
                newScore += question.score;
              }
              break;
          }
        }
        
        const maxScore = questions.reduce((sum, q) => sum + q.score, 0);
        const percentage = (newScore / maxScore) * 100;
        const passed = percentage >= PASSING_PERCENTAGE;
        
        setScore(newScore);
        setIsPassed(passed);
        
        // ถ้าผ่านเกณฑ์ ให้เรียก onComplete
        if (passed) {
          onComplete();
        }
      }
      
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = () => {
    if (isPassed) {
      // ถ้าผ่านแล้ว ให้ไปบทเรียนถัดไป
      onComplete();
    } else {
      // ถ้าไม่ผ่าน ให้เริ่มทำข้อสอบใหม่
      resetQuiz();
    }
  };

  // รีเซ็ตแบบทดสอบเพื่อทำใหม่
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedSingleAnswers([]);
    setSelectedMultipleAnswers([]);
    setTextAnswers([]);
    setShowResult(false);
  };

  // Check if current question has been answered
  const isCurrentQuestionAnswered = () => {
    if (questions.length === 0 || currentQuestion >= questions.length) {
      return false;
    }
    
    const question = questions[currentQuestion];
    
    switch (question.type) {
      case 'SC':
      case 'TF':
        return selectedSingleAnswers[currentQuestion] !== undefined;
        
      case 'MC':
        return selectedMultipleAnswers[currentQuestion]?.length > 0;
        
      default:
        return false;
    }
  };

  // Render the current question based on its type
  const renderQuestion = () => {
    if (questions.length === 0 || currentQuestion >= questions.length) {
      return <div>ไม่พบข้อมูลคำถาม</div>;
    }
    
    const question = questions[currentQuestion];
    
    switch (question.type) {
      case 'SC':
        return (
          <div className="quiz-question">
            <h4>{question.title}</h4>
            <div className="quiz-options">
              {question.choices.map((choice, index) => (
                <div 
                  key={choice.choice_id} 
                  className={`quiz-option ${selectedSingleAnswers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleSingleAnswerSelect(index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{choice.text}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'MC':
        return (
          <div className="quiz-question">
            <h4>{question.title}</h4>
            <p className="text-muted small">เลือกได้มากกว่า 1 ข้อ</p>
            <div className="quiz-options">
              {question.choices.map((choice, index) => (
                <div 
                  key={choice.choice_id} 
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
                  <span className="option-text">{choice.text}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'TF':
        return (
          <div className="quiz-question">
            <h4>{question.title}</h4>
            <div className="quiz-options">
              {question.choices.map((choice, index) => (
                <div 
                  key={choice.choice_id} 
                  className={`quiz-option ${selectedSingleAnswers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleSingleAnswerSelect(index)}
                >
                  <span className="option-letter">{index === 0 ? 'T' : 'F'}</span>
                  <span className="option-text">{choice.text}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return <div>ไม่รองรับคำถามประเภทนี้</div>;
    }
  };

  // ถ้าทำข้อสอบผ่านแล้ว แสดงหน้า "ทำข้อสอบสำเร็จแล้ว"
  if (isCompleted) {
    return (
      <div className="lesson-quiz-container">
        <div className="quiz-completed">
          <div className="completed-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h3>ทำข้อสอบสำเร็จแล้ว</h3>
          <p>คุณได้ทำข้อสอบนี้ผ่านแล้ว สามารถไปเรียนบทเรียนถัดไปได้</p>
          <button className="quiz-btn finish" onClick={() => onComplete()}>
            ไปบทเรียนล่าสุด
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="lesson-quiz-container">
        <div className="quiz-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p>กำลังโหลดแบบทดสอบ...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="lesson-quiz-container">
        <div className="quiz-error">
          <h3>ไม่พบข้อมูลแบบทดสอบ</h3>
          <p>ไม่สามารถโหลดข้อมูลแบบทดสอบได้ กรุณาลองใหม่อีกครั้ง</p>
          <button className="quiz-btn finish" onClick={() => onComplete()}>
            กลับไปบทเรียน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-quiz-container">
      {!showResult ? (
        <>
          <div className="quiz-header">
            <h3>แบบทดสอบ</h3>
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
              <span className="score-total">/{questions.reduce((sum, q) => sum + q.score, 0)}</span>
            </div>
            <p className="score-percentage">
              {Math.round((score / questions.reduce((sum, q) => sum + q.score, 0)) * 100)}%
            </p>
          </div>
          
          <div className="result-message">
            {isPassed ? (
              <p className="pass-message">ยินดีด้วย! คุณสอบผ่านแล้ว</p>
            ) : (
              <div className="fail-message">
                <p>คุณสอบไม่ผ่าน</p>
                <p>คุณต้องได้คะแนนอย่างน้อย {PASSING_PERCENTAGE}% จึงจะผ่าน</p>
                <p>กรุณาลองใหม่อีกครั้ง</p>
              </div>
            )}
          </div>
          
          <button 
            className={`quiz-btn finish ${isPassed ? 'btn-success' : 'btn-retry'}`} 
            onClick={handleFinish}
          >
            {isPassed ? 'เสร็จสิ้น' : 'ลองใหม่'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonQuiz;


