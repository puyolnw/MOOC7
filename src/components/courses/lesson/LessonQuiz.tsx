import { useState, useEffect, useRef } from 'react';
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
type QuestionType = 'SC' | 'MC' | 'TF' | 'text' | 'FB';

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
  console.log("isCompleted:", hasAttempted);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSpecialQuiz, setIsSpecialQuiz] = useState(false);
  const [isAwaitingReview, setIsAwaitingReview] = useState(false);
  
  // For single choice questions (SC, TF)
  const [selectedSingleAnswers, setSelectedSingleAnswers] = useState<number[]>([]);
  
  // For multiple choice questions (MC)
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<number[][]>([]);
  
  // For text questions and Fill in the Blank
  const [textAnswers, setTextAnswers] = useState<string[]>([]);
  
  // For file uploads
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          
          // ตรวจสอบว่าเป็นแบบทดสอบพิเศษหรือไม่ (มีคำถามประเภท FB)
          const hasFillInBlank = formattedQuestions.some(q => q.type === 'FB');
          setIsSpecialQuiz(hasFillInBlank);
          
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
          
          // ตรวจสอบว่าเป็นแบบทดสอบพิเศษหรือไม่
          const hasFillInBlank = response.data.quiz.questions.some((q: any) => q.type === 'FB');
          setIsSpecialQuiz(hasFillInBlank);
          
          // ตรวจสอบสถานะการรอตรวจ
          if (response.data.quiz.status === 'awaiting_review') {
            setIsAwaitingReview(true);
          }
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
    const newTextAnswers = [...textAnswers];
    newTextAnswers[currentQuestion] = e.target.value;
    setTextAnswers(newTextAnswers); 
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };
  
  // Remove uploaded file
  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
 
  // ส่งคำตอบไปยัง API
  const submitQuizAnswers = async () => {
    try {
      const formData = new FormData();
      
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
            
          case 'FB':
            // ส่งคำตอบแบบข้อความ
            answer = textAnswers[index] || '';
            break;
            
          default:
            answer = null;
        }
        
        return {
          question_id: question.question_id,
          answer
        };
      }).filter(a => a.answer !== undefined && a.answer !== null);
      
      // เพิ่ม answers เข้าไปใน FormData
      formData.append('answers', JSON.stringify(answers));
      
      // เพิ่มไฟล์ที่อัปโหลด (ถ้ามี)
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await axios.post(
        `${API_URL}/api/learn/quiz/${quizId}/submit`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        const { totalScore, maxScore, percentage, passed, isSpecialQuiz } = response.data.result;
        
        setScore(totalScore || 0);
        setIsPassed(passed);
        
        // ถ้าเป็นแบบทดสอบพิเศษ ให้แสดงสถานะรอตรวจ
        if (isSpecialQuiz) {
          setIsAwaitingReview(true);
        }
        
        // ถ้าผ่านเกณฑ์ ให้เรียก onComplete
        if (passed) {
          onComplete();
        }
        
        return { totalScore, maxScore, percentage, passed, isSpecialQuiz };
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
        setScore(result.totalScore || 0);
        setIsPassed(result.passed);
        
        // ถ้าเป็นแบบทดสอบพิเศษ ให้แสดงสถานะรอตรวจ
        if (result.isSpecialQuiz) {
          setIsAwaitingReview(true);
        }
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
              
            // ไม่สามารถตรวจคำตอบแบบ FB ได้อัตโนมัติ
            case 'FB':
              setIsAwaitingReview(true);
              break;
          }
        }
        
        // ถ้าเป็นแบบทดสอบพิเศษ ไม่ต้องคำนวณคะแนน
        if (isSpecialQuiz) {
          setIsAwaitingReview(true);
        } else {
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
    if (isPassed || isAwaitingReview) {
      // ถ้าผ่านแล้วหรือรอตรวจ ให้ไปบทเรียนถัดไป
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
    setFiles([]);
    setShowResult(false);
    setIsAwaitingReview(false);
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
          
        case 'FB':
          return textAnswers[currentQuestion]?.trim().length > 0;
          
        default:
          return false;
      }
    };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดแบบทดสอบ...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          ไม่พบข้อมูลแบบทดสอบ
        </div>
      </div>
    );
  }

  if (isAwaitingReview) {
    return (
      <div className="quiz-container">
        <div className="result-container">
          <div className="awaiting-review">
            <div className="icon-container">
              <i className="fas fa-hourglass-half text-warning"></i>
            </div>
            <h2>รอการตรวจจากอาจารย์</h2>
            <p>แบบทดสอบนี้เป็นแบบทดสอบที่ต้องรอการตรวจจากอาจารย์</p>
            <p>คุณจะได้รับการแจ้งเตือนเมื่ออาจารย์ตรวจแบบทดสอบเสร็จแล้ว</p>
            <button className="btn btn-primary" onClick={onComplete}>
              กลับไปยังบทเรียน
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const maxScore = questions.reduce((sum, q) => sum + q.score, 0);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    
    return (
      <div className="quiz-container">
        <div className="result-container">
          <div className={`result ${isPassed ? 'passed' : 'failed'}`}>
            <div className="icon-container">
              {isPassed ? (
                <i className="fas fa-check-circle text-success"></i>
              ) : (
                <i className="fas fa-times-circle text-danger"></i>
              )}
            </div>
            <h2>{isPassed ? 'ยินดีด้วย! คุณผ่านแบบทดสอบนี้' : 'คุณไม่ผ่านแบบทดสอบนี้'}</h2>
            <div className="score-info">
              <p>คะแนนของคุณ: <span className="score">{score}</span> / {maxScore}</p>
              <p>คิดเป็น: <span className="percentage">{percentage}%</span></p>
              <p>เกณฑ์ผ่าน: {PASSING_PERCENTAGE}%</p>
            </div>
            <button className="btn btn-primary" onClick={handleFinish}>
              {isPassed ? 'ไปยังบทเรียนถัดไป' : 'ลองทำอีกครั้ง'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="question-counter">
          คำถามที่ {currentQuestion + 1} จาก {questions.length}
        </div>
        <div className="progress">
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            aria-valuenow={((currentQuestion + 1) / questions.length) * 100}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>
      
      <div className="question-container">
        <div className="question">
          <h3>{questions[currentQuestion]?.title}</h3>
          <p className="question-type">
            {questions[currentQuestion]?.type === 'SC' && '(เลือกคำตอบเดียว)'}
            {questions[currentQuestion]?.type === 'MC' && '(เลือกได้หลายคำตอบ)'}
            {questions[currentQuestion]?.type === 'TF' && '(ถูก/ผิด)'}
            {questions[currentQuestion]?.type === 'FB' && '(เติมคำตอบ)'}
          </p>
          <p className="question-score">
            คะแนน: {questions[currentQuestion]?.score || 1} คะแนน
          </p>
        </div>
        
        <div className="answers">
          {/* Single Choice or True/False Questions */}
          {(questions[currentQuestion]?.type === 'SC' || questions[currentQuestion]?.type === 'TF') && (
            <div className="single-choice">
              {questions[currentQuestion]?.choices.map((choice, index) => (
                <div 
                  key={index} 
                  className={`answer-option ${selectedSingleAnswers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleSingleAnswerSelect(index)}
                >
                  <div className="option-marker">
                    {selectedSingleAnswers[currentQuestion] === index ? (
                      <i className="fas fa-check-circle"></i>
                    ) : (
                      <i className="far fa-circle"></i>
                    )}
                  </div>
                  <div className="option-text">{choice.text}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Multiple Choice Questions */}
          {questions[currentQuestion]?.type === 'MC' && (
            <div className="multiple-choice">
              {questions[currentQuestion]?.choices.map((choice, index) => (
                <div 
                  key={index} 
                  className={`answer-option ${selectedMultipleAnswers[currentQuestion]?.includes(index) ? 'selected' : ''}`}
                  onClick={() => handleMultipleAnswerSelect(index)}
                >
                  <div className="option-marker">
                    {selectedMultipleAnswers[currentQuestion]?.includes(index) ? (
                      <i className="fas fa-check-square"></i>
                    ) : (
                      <i className="far fa-square"></i>
                    )}
                  </div>
                  <div className="option-text">{choice.text}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Fill in the Blank Questions */}
          {questions[currentQuestion]?.type === 'FB' && (
            <div className="text-answer">
              <textarea
                className="form-control"
                placeholder="พิมพ์คำตอบของคุณที่นี่..."
                value={textAnswers[currentQuestion] || ''}
                onChange={handleTextAnswerChange}
                rows={5}
              ></textarea>
              
              {/* File Upload Section (only for FB questions) */}
              <div className="file-upload-section mt-3">
                <p className="mb-2">
                  <i className="fas fa-paperclip me-2"></i>
                  แนบไฟล์เพิ่มเติม (ถ้ามี)
                </p>
                
                <div className="input-group mb-3">
                  <input
                    type="file"
                    className="form-control"
                    id="fileUpload"
                    onChange={handleFileChange}
                    multiple
                    ref={fileInputRef}
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    เลือกไฟล์
                  </button>
                </div>
                
                {/* Show uploaded files */}
                {files.length > 0 && (
                  <div className="uploaded-files mt-2">
                    <p className="mb-2">ไฟล์ที่แนบ:</p>
                    <ul className="list-group">
                      {files.map((file, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <i className="fas fa-file me-2"></i>
                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                          </div>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <p className="text-muted small mt-2">
                  <i className="fas fa-info-circle me-1"></i>
                  สามารถอัปโหลดไฟล์ได้สูงสุด 10 ไฟล์ ขนาดไม่เกิน 10MB ต่อไฟล์
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="quiz-footer">
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
              <i className="fas fa-paper-plane ms-2"></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LessonQuiz;
