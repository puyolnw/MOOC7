import { useState, useEffect } from 'react';
import axios from 'axios';
import './LessonQuiz.css';

interface LessonQuizProps {
  onComplete: (score?: number, passed?: boolean) => void;
  quizData: any;
  subjectId?: string;
}

type QuestionType = 'single' | 'multiple' | 'truefalse' | 'text' | 'original';

interface BaseQuestion {
  question: string;
  type: QuestionType;
  question_id: number;
}

interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single';
  options: Array<{ text: string; choice_id: number }>;
  correctAnswer?: number;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple';
  options: Array<{ text: string; choice_id: number }>;
  correctAnswers?: number[];
}

interface TrueFalseQuestion extends BaseQuestion {
  type: 'truefalse';
  options: Array<{ text: string; choice_id: number }>;
  correctAnswer?: boolean;
}

interface TextQuestion extends BaseQuestion {
  type: 'text';
  sampleAnswer?: string;
}

type Question = SingleChoiceQuestion | MultipleChoiceQuestion | TrueFalseQuestion | TextQuestion;

const LessonQuiz = ({ onComplete, quizData, }: LessonQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPreTest, setIsPreTest] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const apiURL = import.meta.env.VITE_API_URL;
  
  const [selectedSingleAnswers, setSelectedSingleAnswers] = useState<number[]>([]);
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<number[][]>([]);
  const [selectedTrueFalseAnswers, setSelectedTrueFalseAnswers] = useState<boolean[]>([]);
  const [textAnswers, setTextAnswers] = useState<string[]>([]);

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
        
        // ตรวจสอบว่าเป็นแบบทดสอบก่อนเรียนหรือไม่
        if (quizData.quiz_type === 'pre_test' || quizData.type === 'pre_test' || 
            (quizData.title && quizData.title.toLowerCase().includes('ก่อนเรียน'))) {
          setIsPreTest(true);
        }
        
        if (quizData.questions && Array.isArray(quizData.questions)) {
          processQuizQuestions(quizData.questions);
          return;
        }
        
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
        
        const response = await axios.get(`${apiURL}/api/courses/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // ตรวจสอบว่าเป็นแบบทดสอบก่อนเรียนหรือไม่จากข้อมูลที่ได้รับ
        if (response.data.quiz?.type === 'pre_test' || response.data.type === 'pre_test' ||
            (response.data.quiz?.title && response.data.quiz.title.toLowerCase().includes('ก่อนเรียน')) ||
            (response.data.title && response.data.title.toLowerCase().includes('ก่อนเรียน'))) {
          setIsPreTest(true);
        }
        
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

  const processQuizQuestions = (apiQuestions: any[]) => {
    try {
      if (!apiQuestions || apiQuestions.length === 0) {
        setError("ไม่พบคำถามในแบบทดสอบ");
        setIsLoading(false);
        return;
      }
      
      const formattedQuestions: Question[] = apiQuestions.map(q => {
        const questionText = q.question_text || q.title || q.description || q.question || "";
        const questionId = q.question_id || q.id || 0;
        
        let type: QuestionType = 'single';
        
        if (q.type === 'SC' || q.type === 'single_choice') {
          type = 'single';
        } else if (q.type === 'MC' || q.type === 'multiple_choice') {
          type = 'multiple';
        } else if (q.type === 'TF' || q.type === 'true_false') {
          type = 'truefalse';
        } else if (q.type === 'FB' || q.type === 'text') {
          type = 'text';
        }
        
        let formattedOptions: Array<{ text: string; choice_id: number }> = [];
        
        if (q.options && Array.isArray(q.options)) {
          formattedOptions = q.options.map((opt: any, index: number) => {
            return typeof opt === 'string' 
              ? { text: opt, choice_id: q.choice_ids?.[index] || index + 1 }
              : { text: opt.text || opt.title || "", choice_id: opt.choice_id || opt.id || index + 1 };
          });
        } else if (q.choices && Array.isArray(q.choices)) {
          formattedOptions = q.choices.map((choice: any, index: number) => {
            return typeof choice === 'string' 
              ? { text: choice, choice_id: q.choice_ids?.[index] || index + 1 }
              : { text: choice.text || choice.title || "", choice_id: choice.choice_id || choice.id || index + 1 };
          });
        }
        
        const baseQuestion = {
          question: questionText,
          type,
          question_id: questionId
        };
        
        switch (type) {
          case 'single':
            return {
              ...baseQuestion,
              options: formattedOptions
            } as SingleChoiceQuestion;
            
          case 'multiple':
            return {
              ...baseQuestion,
              options: formattedOptions
            } as MultipleChoiceQuestion;
            
          case 'truefalse':
            return {
              ...baseQuestion,
              options: formattedOptions.length > 0 ? formattedOptions : [
                { text: "ถูก (True)", choice_id: 1 }, 
                { text: "ผิด (False)", choice_id: 2 }
              ]
            } as TrueFalseQuestion;
            
          case 'text':
            return {
              ...baseQuestion,
              sampleAnswer: q.sample_answer || ""
            } as TextQuestion;
            
          default:
            return {
              ...baseQuestion,
              options: formattedOptions
            } as SingleChoiceQuestion;
        }
      });
  
      setQuestions(formattedQuestions);
      setTotalScore(formattedQuestions.length);
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing quiz questions:", error);
      setError("เกิดข้อผิดพลาดในการประมวลผลคำถาม");
      setIsLoading(false);
    }
  };

  const handleSingleAnswerSelect = (answerIndex: number, choiceId: number) => {
    const newSelectedAnswers = [...selectedSingleAnswers];
    newSelectedAnswers[currentQuestion] = choiceId; // เก็บ choice_id แทน index
    setSelectedSingleAnswers(newSelectedAnswers);
    console.log("selectedSingleAnswers:", answerIndex);
  };
 
  const handleMultipleAnswerSelect = (answerIndex: number, choiceId: number) => {
    const newSelectedAnswers = [...selectedMultipleAnswers];
    console.log("selectedSingleAnswers:", answerIndex);
    
    if (!newSelectedAnswers[currentQuestion]) {
      newSelectedAnswers[currentQuestion] = [];
    }
    
    const currentSelections = newSelectedAnswers[currentQuestion];
    const selectionIndex = currentSelections.indexOf(choiceId); // ใช้ choice_id แทน index
    
    if (selectionIndex === -1) {
      currentSelections.push(choiceId); // เพิ่ม choice_id
    } else {
      currentSelections.splice(selectionIndex, 1);
    }
    
    setSelectedMultipleAnswers(newSelectedAnswers);
  };

  const handleTrueFalseSelect = (answer: boolean) => {
    const newSelectedAnswers = [...selectedTrueFalseAnswers];
    newSelectedAnswers[currentQuestion] = answer;
    setSelectedTrueFalseAnswers(newSelectedAnswers);
  };

  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTextAnswers = [...textAnswers];
    newTextAnswers[currentQuestion] = e.target.value;
    setTextAnswers(newTextAnswers);
  };

  const submitQuizAnswers = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token || !quizData?.quiz_id) return false;
      
      // รวบรวมคำตอบทั้งหมด
      const answers = questions.map((question, index) => {
        let answer;
        
        switch (question.type) {
          case 'single':
            answer = selectedSingleAnswers[index]; // ส่ง choice_id
            break;
          case 'multiple':
            answer = selectedMultipleAnswers[index] || []; // ส่งอาร์เรย์ของ choice_id
            break;
          case 'truefalse':
            // ส่งค่า boolean เป็นข้อความ "true" หรือ "false"
            answer = selectedTrueFalseAnswers[index] !== undefined ? 
              String(selectedTrueFalseAnswers[index]) : "";
            break;
          case 'text':
            answer = textAnswers[index] || "";
            break;
        }
        
        return {
          question_id: question.question_id,
          answer_type: question.type,
          answer
        };
      });
      
      const submitEndpoint = `${apiURL}/api/courses/quizzes/${quizData.quiz_id}/submit`;
      console.log("Submitting quiz answers to:", submitEndpoint);
      console.log("Answers:", answers);
      
      const response = await axios.post(submitEndpoint, 
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setScore(response.data.score || 0);
        setTotalScore(response.data.total || questions.length);
        setIsPassed(response.data.passed || false);
        setShowResult(true);
        return true;
      } else {
        setError("เกิดข้อผิดพลาดในการส่งคำตอบ: " + (response.data.message || "ไม่ทราบสาเหตุ"));
        return false;
      }
    } catch (error: any) {
      console.error("Error submitting quiz answers:", error);
      setError("เกิดข้อผิดพลาดในการส่งคำตอบ: " + (error.response?.data?.message || error.message || "ไม่ทราบสาเหตุ"));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    // ตรวจสอบว่าได้ตอบคำถามปัจจุบันหรือไม่
    const currentQuestionObj = questions[currentQuestion];
    let hasAnswered = false;
    
    if (currentQuestionObj.type === 'single') {
      hasAnswered = selectedSingleAnswers[currentQuestion] !== undefined;
    } else if (currentQuestionObj.type === 'multiple') {
      hasAnswered = selectedMultipleAnswers[currentQuestion]?.length > 0;
    } else if (currentQuestionObj.type === 'truefalse') {
      hasAnswered = selectedTrueFalseAnswers[currentQuestion] !== undefined;
    } else if (currentQuestionObj.type === 'text') {
      hasAnswered = textAnswers[currentQuestion]?.trim().length > 0;
    }
    
    if (!hasAnswered) {
      alert("กรุณาตอบคำถามก่อนไปข้อถัดไป");
      return;
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // ตรวจสอบว่าตอบครบทุกข้อหรือไม่
    let allAnswered = true;
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      let hasAnswered = false;
      
      if (question.type === 'single') {
        hasAnswered = selectedSingleAnswers[i] !== undefined;
      } else if (question.type === 'multiple') {
        hasAnswered = selectedMultipleAnswers[i]?.length > 0;
      } else if (question.type === 'truefalse') {
        hasAnswered = selectedTrueFalseAnswers[i] !== undefined;
      } else if (question.type === 'text') {
        hasAnswered = textAnswers[i]?.trim().length > 0;
      }
      
      if (!hasAnswered) {
        allAnswered = false;
        break;
      }
    }
    
    if (!allAnswered) {
      const confirmSubmit = window.confirm("คุณยังตอบคำถามไม่ครบทุกข้อ ต้องการส่งคำตอบหรือไม่?");
      if (!confirmSubmit) return;
    }
    
    const success = await submitQuizAnswers();
    
    if (success) {
      // ถ้าเป็นแบบทดสอบก่อนเรียน ให้ผ่านไปได้เลย
      if (isPreTest) {
        setTimeout(() => {
          onComplete(score, true);
        }, 3000);
      }
    }
  };

  const handleCompleteQuiz = () => {
    onComplete(score, isPassed);
  };

  if (isLoading) {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดแบบทดสอบ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="quiz-error">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button className="btn btn-primary" onClick={() => onComplete()}>
            กลับไปที่บทเรียน
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
    const passThreshold = 70; // 70% ถือว่าผ่าน
    const passed = percentage >= passThreshold;
    
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <h2>ผลการทำแบบทดสอบ</h2>
          
          <div className="score-display">
            <div className="score-circle">
              <div className="score-number">{percentage}%</div>
            </div>
            <div className="score-text">
              คะแนนของคุณ: {score}/{totalScore}
            </div>
          </div>
          
          <div className={`result-message ${passed ? 'passed' : 'failed'}`}>
            {isPreTest ? (
              <p>คุณได้ทำแบบทดสอบก่อนเรียนเสร็จสิ้นแล้ว</p>
            ) : passed ? (
              <p>ยินดีด้วย! คุณผ่านแบบทดสอบนี้</p>
            ) : (
              <p>คุณไม่ผ่านเกณฑ์ขั้นต่ำ {passThreshold}%</p>
            )}
          </div>
          
          <button 
            className="btn btn-primary btn-lg mt-4" 
            onClick={handleCompleteQuiz}
          >
            {isPreTest ? "ไปยังบทเรียน" : "เสร็จสิ้น"}
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="quiz-error">
          <div className="alert alert-warning" role="alert">
            ไม่พบคำถามในแบบทดสอบนี้
          </div>
          <button className="btn btn-primary" onClick={() => onComplete()}>
            กลับไปที่บทเรียน
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionObj = questions[currentQuestion];
  const questionNumber = currentQuestion + 1;
  const totalQuestions = questions.length;
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{quizData?.title || "แบบทดสอบ"}</h2>
        <div className="progress">
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${progress}%` }} 
            aria-valuenow={progress} 
            aria-valuemin={0} 
            aria-valuemax={100}
          >
            {questionNumber}/{totalQuestions}
          </div>
        </div>
      </div>
      
      <div className="quiz-body">
        <div className="question">
          <h3>ข้อที่ {questionNumber}: {currentQuestionObj.question}</h3>
          
          {currentQuestionObj.type === 'single' && (
            <div className="options single-choice">
              {(currentQuestionObj as SingleChoiceQuestion).options.map((option, index) => (
                <div className="option" key={index}>
                  <input 
                    type="radio" 
                    id={`option-${index}`} 
                    name={`question-${currentQuestion}`} 
                    checked={selectedSingleAnswers[currentQuestion] === option.choice_id}
                    onChange={() => handleSingleAnswerSelect(index, option.choice_id)}
                  />
                  <label htmlFor={`option-${index}`}>{option.text}</label>
                </div>
              ))}
            </div>
          )}
          
          {currentQuestionObj.type === 'multiple' && (
            <div className="options multiple-choice">
              {(currentQuestionObj as MultipleChoiceQuestion).options.map((option, index) => (
                <div className="option" key={index}>
                  <input 
                    type="checkbox" 
                    id={`option-${index}`} 
                    name={`question-${currentQuestion}`} 
                    checked={selectedMultipleAnswers[currentQuestion]?.includes(option.choice_id) || false}
                    onChange={() => handleMultipleAnswerSelect(index, option.choice_id)}
                  />
                  <label htmlFor={`option-${index}`}>{option.text}</label>
                </div>
              ))}
            </div>
          )}
          
          {currentQuestionObj.type === 'truefalse' && (
            <div className="options true-false">
              <div className="option">
                <input 
                  type="radio" 
                  id="option-true" 
                  name={`question-${currentQuestion}`} 
                  checked={selectedTrueFalseAnswers[currentQuestion] === true}
                  onChange={() => handleTrueFalseSelect(true)}
                />
                <label htmlFor="option-true">ถูก (True)</label>
              </div>
              <div className="option">
                <input 
                  type="radio" 
                  id="option-false" 
                  name={`question-${currentQuestion}`} 
                  checked={selectedTrueFalseAnswers[currentQuestion] === false}
                  onChange={() => handleTrueFalseSelect(false)}
                />
                <label htmlFor="option-false">ผิด (False)</label>
              </div>
            </div>
          )}
          
          {currentQuestionObj.type === 'text' && (
            <div className="text-answer">
              <textarea 
                rows={5} 
                placeholder="พิมพ์คำตอบของคุณที่นี่..." 
                value={textAnswers[currentQuestion] || ''}
                onChange={handleTextAnswerChange}
              ></textarea>
            </div>
          )}
        </div>
      </div>
      
      <div className="quiz-footer">
        <button 
          className="btn btn-secondary" 
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0 || submitting}
        >
          ข้อก่อนหน้า
        </button>
        
        {currentQuestion < questions.length - 1 ? (
          <button 
            className="btn btn-primary" 
            onClick={handleNextQuestion}
            disabled={submitting}
          >
            ข้อถัดไป
          </button>
        ) : (
          <button 
            className="btn btn-success" 
            onClick={handleSubmitQuiz}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                กำลังส่งคำตอบ...
              </>
            ) : (
              "ส่งคำตอบ"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonQuiz;
