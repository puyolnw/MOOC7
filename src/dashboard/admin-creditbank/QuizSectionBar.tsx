import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddQuestions from '../../forms/Course/Questions/AddQuestions';

interface LessonFile {
  file_id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
}

interface QuizQuestion {
  question_id: number;
  question_text: string;
  question_type: string;
  score?: number;
  choices?: Array<{
    choice_id: number;
    choice_text: string;
    is_correct: boolean;
  }>;
}

interface LessonQuiz {
  quiz_id: number;
  title: string;
  description: string;
  questions?: QuizQuestion[];
}

interface Lesson {
  lesson_id: number;
  title: string;
  description: string;
  content: string;
  video_url: string | null;
  order_number: number;
  status: string;
  created_at: string;
  can_preview?: boolean;
  has_quiz?: boolean;
  quiz_id?: number | null;
  file_count?: string;
  files?: LessonFile[];
  quiz?: LessonQuiz;
}

interface QuizSectionBarProps {
  lesson: Lesson;
  onQuizUpdate?: (updatedLesson: Lesson) => void;
}

const QuizSectionBar: React.FC<QuizSectionBarProps> = ({ lesson, onQuizUpdate }) => {
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [quizQuestionsExpanded, setQuizQuestionsExpanded] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>(lesson.quiz?.questions || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState<any>(null);

  // ✅ เพิ่ม function สำหรับสร้าง quiz ใหม่
  const createQuizForLesson = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const quizData = {
        title: `แบบทดสอบ - ${lesson.title}`,
        description: `แบบทดสอบสำหรับบทเรียน: ${lesson.title}`,
        type: 'lesson',
        lessons: [lesson.lesson_id],
        status: 'draft',
        timeLimit: {
          enabled: false,
          value: 60,
          unit: 'minutes'
        },
        passingScore: {
          enabled: false,
          value: 0
        },
        attempts: {
          limited: true,
          unlimited: false,
          value: 1
        }
      };

      console.log('Creating quiz with data:', quizData);

      const response = await axios.post(
        `${apiUrl}/api/courses/quizzes`,
        quizData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Create quiz response:', response.data);

      if (response.data && response.data.success && response.data.quiz) {
        const newQuiz = {
          quiz_id: response.data.quiz.quiz_id,
          title: response.data.quiz.title,
          description: response.data.quiz.description,
          questions: []
        };

        setQuizData(newQuiz);

        // อัปเดต lesson ด้วย quiz ใหม่
        if (onQuizUpdate) {
          const updatedLesson = {
            ...lesson,
            has_quiz: true,
            quiz_id: newQuiz.quiz_id,
            quiz: newQuiz
          };
          onQuizUpdate(updatedLesson);
        }

        return newQuiz.quiz_id;
      } else {
        throw new Error('ไม่สามารถสร้างแบบทดสอบได้');
      }
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      const errorMessage = error.response?.data?.message || 'ไม่สามารถสร้างแบบทดสอบได้';
      setError(errorMessage);
      throw error;
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('=== QuizSectionBar Debug ===');
    console.log('Lesson data:', lesson);
    console.log('lesson.quiz:', lesson.quiz);
    console.log('lesson.quiz_id:', lesson.quiz_id);
    console.log('lesson.has_quiz:', lesson.has_quiz);
    console.log('quizData:', quizData);
    console.log('Has quiz?', !!lesson.quiz || !!quizData);
    console.log('Quiz ID sources:', {
      'lesson.quiz?.quiz_id': lesson.quiz?.quiz_id,
      'lesson.quiz_id': lesson.quiz_id,
      'quizData?.quiz_id': quizData?.quiz_id
    });
    console.log('===========================');
  }, [lesson, quizData]);

  // Fetch questions when quiz is expanded
  useEffect(() => {
    const currentQuiz = lesson.quiz || quizData;
    const hasQuizId = currentQuiz?.quiz_id || lesson.quiz_id;
    
    if (quizExpanded && hasQuizId && questions.length === 0) {
      console.log('Fetching questions for expanded quiz:', hasQuizId);
      fetchQuizQuestions(hasQuizId);
    }
  }, [quizExpanded, lesson.quiz?.quiz_id, lesson.quiz_id, quizData?.quiz_id, questions.length]);

  const fetchQuizQuestions = async (quizId?: number) => {
    const targetQuizId = quizId || lesson.quiz?.quiz_id || lesson.quiz_id || quizData?.quiz_id;
    if (!targetQuizId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${apiUrl}/api/courses/quizzes/${targetQuizId}/questions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        if (response.data.quiz) {
          console.log('Quiz info:', response.data.quiz);
          setQuizData(response.data.quiz);
          
          if (onQuizUpdate) {
            const updatedLesson = {
              ...lesson,
              has_quiz: true,
              quiz_id: response.data.quiz.quiz_id,
              quiz: {
                quiz_id: response.data.quiz.quiz_id,
                title: response.data.quiz.title,
                description: response.data.quiz.description,
                questions: response.data.questions || []
              }
            };
            onQuizUpdate(updatedLesson);
          }
        }
        
        if (response.data.questions) {
          const formattedQuestions = response.data.questions.map((q: any) => ({
            question_id: q.question_id,
            question_text: q.question_text,
            question_type: q.question_type,
            score: q.score,
            choices: q.choices?.map((c: any) => ({
              choice_id: c.choice_id,
              choice_text: c.text,
              is_correct: c.is_correct
            })) || []
          }));
          
          console.log('Formatted questions:', formattedQuestions);
          setQuestions(formattedQuestions);
        } else {
          console.log('No questions found in response');
          setQuestions([]);
        }
      } else {
        setError('ไม่พบข้อมูลคำถาม');
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      setError('ไม่สามารถโหลดคำถามได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (questionData: any) => {
    try {
      console.log('=== handleAddQuestion ===');
      console.log('Question data being sent:', questionData);
      
      const currentQuiz = lesson.quiz || quizData;
      let targetQuizId = currentQuiz?.quiz_id || lesson.quiz_id;
      
      console.log('Current quiz:', currentQuiz);
      console.log('Target quiz ID:', targetQuizId);

      // ✅ ถ้าไม่มี quiz ให้สร้างใหม่
      if (!targetQuizId) {
        console.log('No quiz found, creating new quiz...');
        try {
          targetQuizId = await createQuizForLesson();
          console.log('Created new quiz with ID:', targetQuizId);
        } catch (createError) {
          console.error('Failed to create quiz:', createError);
          setError('ไม่สามารถสร้างแบบทดสอบได้ กรุณาลองใหม่อีกครั้ง');
          return;
        }
      }

      if (!targetQuizId) {
        setError('ไม่พบ Quiz ID หลังจากสร้างแบบทดสอบแล้ว');
        return;
      }

      // ✅ ปรับ format ข้อมูลให้ตรงกับ API
      const formattedData = {
        title: questionData.title || questionData.question_text,
        description: questionData.description || '',
        category: questionData.category || 'objective',
        type: questionData.type || questionData.question_type,
        score: questionData.score || 1,
        choices: questionData.choices?.map((choice: any) => ({
          text: choice.text || choice.choice_text,
          isCorrect: choice.isCorrect || choice.is_correct || false,
          explanation: choice.explanation || ''
        })) || [],
        shuffleChoices: questionData.shuffleChoices || false,
        showExplanation: questionData.showExplanation || false,
        autoGrade: questionData.autoGrade !== false,
        quizzes: [targetQuizId]
      };

      console.log('Formatted data:', formattedData);

      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${apiUrl}/api/courses/questions`,
        formattedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Add question response:', response.data);
      
      if (response.data && response.data.success && response.data.question) {
        const newQuestion: QuizQuestion = {
          question_id: response.data.question.question_id,
          question_text: response.data.question.title,
          question_type: response.data.question.type,
          score: response.data.question.score,
          choices: response.data.question.choices?.map((c: any) => ({
            choice_id: c.choice_id,
            choice_text: c.text,
            is_correct: c.is_correct
          })) || []
        };
        
        setQuestions(prev => [...prev, newQuestion]);
        
        // อัปเดต quiz data
        const updatedQuiz = {
          ...(currentQuiz || quizData),
          quiz_id: targetQuizId,
          questions: [...questions, newQuestion]
        };

        if (onQuizUpdate) {
          const updatedLesson = {
            ...lesson,
            has_quiz: true,
            quiz_id: targetQuizId,
            quiz: updatedQuiz
          };
          onQuizUpdate(updatedLesson);
        }
        
        setShowAddQuestionForm(false);
        setError('');
        
        // แสดงข้อความสำเร็จ
        console.log('Question added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding question:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'ไม่สามารถเพิ่มคำถามได้';
      setError(errorMessage);
    }
  };


  // ✅ เพิ่ม function สำหรับสร้าง quiz ใหม่จากปุ่ม
  const handleCreateQuiz = async () => {
    try {
      setLoading(true);
      const newQuizId = await createQuizForLesson();
      console.log('Quiz created successfully with ID:', newQuizId);
      
      // เปิด quiz section หลังจากสร้างเสร็จ
      setQuizExpanded(true);
    } catch (error) {
      console.error('Failed to create quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeText = (type: string): string => {
    switch (type) {
      case 'multiple_choice':
      case 'MC': 
        return 'ปรนัย (หลายตัวเลือก)';
      case 'single_choice':
      case 'SC':
        return 'ปรนัย (ตัวเลือกเดียว)';
      case 'true_false':
      case 'TF':
        return 'ถูก/ผิด';
      case 'short_answer':
      case 'FB':
        return 'อัตนัย (เติมคำ)';
      case 'essay':
        return 'อัตนัย (เรียงความ)';
      default: 
        return type;
    }
  };

  const getQuestionTypeColor = (type: string): string => {
    switch (type) {
      case 'multiple_choice':
      case 'MC':
        return 'bg-primary';
      case 'single_choice':
      case 'SC':
        return 'bg-info';
      case 'true_false':
      case 'TF':
        return 'bg-warning';
      case 'short_answer':
      case 'FB':
        return 'bg-success';
      case 'essay':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const renderQuestionItem = (question: QuizQuestion, index: number) => (
    <div key={question.question_id} className="question-item-card mb-3">
      <div className="question-header">
        <div className="question-number">
          <span>{index + 1}</span>
        </div>
        <div className="question-info flex-grow-1">
          <div className="question-text">
            {question.question_text}
          </div>
          <div className="question-meta">
            <span className={`badge ${getQuestionTypeColor(question.question_type)} me-2`}>
              {getQuestionTypeText(question.question_type)}
            </span>
            {question.score && (
              <span className="badge bg-light text-dark">
                {question.score} คะแนน
              </span>
            )}
          </div>
        </div>
      
      </div>
      
      {question.choices && question.choices.length > 0 && (
        <div className="question-choices mt-2">
          {question.choices.map((choice) => (
            <div key={choice.choice_id} className="choice-item">
              <div className="choice-indicator">
                <i className={`fas ${choice.is_correct ? 'fa-check-circle text-success' : 'fa-circle text-muted'}`}></i>
              </div>
              <div className="choice-text">
                {choice.choice_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const currentQuiz = lesson.quiz || quizData;
  const hasQuiz = lesson.has_quiz || !!lesson.quiz || !!quizData;
  const quizTitle = currentQuiz?.title || quizData?.title || 'แบบทดสอบ';
  const currentQuizId = currentQuiz?.quiz_id || lesson.quiz_id || quizData?.quiz_id;
 console.log('currentQuizId:', currentQuizId);
  if (showAddQuestionForm) {
    return (
      <div className="content-section-bar">
        <div className="section-bar-header">
          <div className="section-bar-icon quiz-icon">
            <i className="fas fa-plus-circle"></i>
          </div>
          <div className="section-bar-info">
            <h5 className="section-bar-title">เพิ่มคำถามใหม่</h5>
            <p className="section-bar-subtitle">
              เพิ่มคำถามในแบบทดสอบ: {quizTitle}
            </p>
          </div>
          <div className="section-bar-expand">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowAddQuestionForm(false)}
            >
              <i className="fas fa-times"></i> ยกเลิก
            </button>
          </div>
        </div>
        
        <div className="section-bar-content expanded">
          <div className="add-question-form-container">
            <div className="form-wrapper">
              {error && (
                <div className="alert alert-danger alert-sm mb-3">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                  <button 
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={() => setError('')}
                  >
                    ปิด
                  </button>
                </div>
              )}
              <AddQuestions
                onSubmit={handleAddQuestion}
                onCancel={() => setShowAddQuestionForm(false)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-section-bar">
      {/* Debug info - เฉพาะ development */}
      
      <div 
        className={`section-bar-header ${quizExpanded ? 'expanded' : ''}`}
        onClick={() => setQuizExpanded(!quizExpanded)}
      >
        <div className="section-bar-icon quiz-icon">
          <i className="fas fa-question-circle"></i>
        </div>
        <div className="section-bar-info">
          <h5 className="section-bar-title">แบบทดสอบ</h5>
          <p className="section-bar-subtitle">
            {hasQuiz 
              ? `แบบทดสอบ: ${quizTitle}` 
              : 'ยังไม่มีแบบทดสอบ'
            }
          </p>
        </div>
        <div className="section-bar-count">
          {questions.length || 0}
        </div>
        <div className="section-bar-expand">
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>
      
      <div className={`section-bar-content ${quizExpanded ? 'expanded' : ''}`}>
        <div className="section-content-inner">
          <div className="quiz-section">
            {hasQuiz ? (
              <div className="quiz-info-card">
                <div className="quiz-header">
                  <h5 className="quiz-title">{quizTitle}</h5>
                  <div className="quiz-header-actions">
                    <button 
                      className="btn btn-sm btn-success me-2"
                      onClick={() => setShowAddQuestionForm(true)}
                      disabled={loading}
                    >
                      <i className="fas fa-plus"></i>
                      <span>เพิ่มคำถาม</span>
                    </button>
                    <button 
                      className="expand-quiz-btn"
                      onClick={() => setQuizQuestionsExpanded(!quizQuestionsExpanded)}
                    >
                      <span>{quizQuestionsExpanded ? 'ซ่อน' : 'ดู'}คำถาม</span>
                      <i className={`fas fa-chevron-${quizQuestionsExpanded ? 'up' : 'down'}`}></i>
                    </button>
                  </div>
                </div>
                
                <div className="quiz-stats">
                  <div className="quiz-stat">
                    <span className="quiz-stat-number">{questions.length}</span>
                    <p className="quiz-stat-label">คำถาม</p>
                  </div>
                  <div className="quiz-stat">
                    <span className="quiz-stat-number">
                      {questions.reduce((total, q) => total + (q.score || 1), 0)}
                    </span>
                    <p className="quiz-stat-label">คะแนนเต็ม</p>
                  </div>
                </div>
                
                {currentQuiz?.description && (
                  <p style={{ color: '#718096', marginBottom: '1rem' }}>
                    {currentQuiz.description}
                  </p>
                )}

                {error && (
                  <div className="alert alert-danger alert-sm mb-3">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                    <button 
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() => setError('')}
                    >
                      ปิด
                    </button>
                  </div>
                )}
                
                <div className={`quiz-questions ${quizQuestionsExpanded ? 'expanded' : ''}`}>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      <span>กำลังโหลดคำถาม...</span>
                    </div>
                  ) : questions.length > 0 ? (
                    <div className="questions-list">
                      {questions.map((question, qIndex) => 
                        renderQuestionItem(question, qIndex)
                      )}
                    </div>
                  ) : (
                    <div className="no-questions-message">
                      <div className="text-center py-4">
                        <i className="fas fa-question-circle fa-2x text-muted mb-3"></i>
                        <p className="text-muted mb-3">ยังไม่มีคำถามในแบบทดสอบนี้</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => setShowAddQuestionForm(true)}
                          disabled={loading}
                        >
                          <i className="fas fa-plus me-2"></i>
                          เพิ่มคำถามแรก
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                

              </div>
            ) : (
              <div className="quiz-empty">
                <i className="fas fa-question-circle fa-3x mb-3"></i>
                <p className="mb-3">ยังไม่มีแบบทดสอบสำหรับบทเรียนนี้</p>
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateQuiz}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      กำลังสร้าง...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-2"></i>
                      สร้างแบบทดสอบ
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Custom Styles */}
      <style>{`
        /* Debug styles */
        .debug-info {
          background: #f0f8ff;
          border: 1px solid #b3d9ff;
          padding: 12px;
          margin: 10px 0;
          font-size: 12px;
          border-radius: 6px;
        }

        .debug-info details {
          margin-bottom: 0.5rem;
        }

        .debug-info summary {
          cursor: pointer;
          font-weight: bold;
          color: #0066cc;
          padding: 4px 0;
        }

        .debug-info pre {
          background: #fff;
          padding: 8px;
          border-radius: 4px;
          font-size: 11px;
          overflow-x: auto;
          margin: 8px 0 0 0;
          border: 1px solid #e0e0e0;
          font-family: 'Courier New', monospace;
        }

        /* Form Container Styles */
        .add-question-form-container {
          max-height: 80vh;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin: 1rem;
        }

        .form-wrapper {
          background: white;
          border-radius: 8px;
                   padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-width: 100%;
        }

        /* Scrollbar styling */
        .add-question-form-container::-webkit-scrollbar {
          width: 8px;
        }

        .add-question-form-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .add-question-form-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .add-question-form-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Quiz Section Styles */
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .quiz-header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .question-item-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          background: #fff;
          transition: all 0.2s ease;
        }

        .question-item-card:hover {
          border-color: #cbd5e0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .question-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .question-number {
          background: #4299e1;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .question-info {
          flex: 1;
        }

        .question-text {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .question-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .question-actions {
          display: flex;
          align-items: flex-start;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .question-choices {
          margin-left: 3rem;
          padding-left: 1rem;
          border-left: 2px solid #e2e8f0;
        }

        .choice-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0;
        }

        .choice-indicator {
          width: 20px;
          display: flex;
          justify-content: center;
        }

        .choice-text {
          color: #4a5568;
          font-size: 0.875rem;
        }

        .no-questions-message {
          border: 2px dashed #e2e8f0;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
        }

        .alert-sm {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }

        .expand-quiz-btn {
          background: none;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          color: #4a5568;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .expand-quiz-btn:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
        }

        .expand-quiz-btn span {
          margin-right: 0.5rem;
        }

        .quiz-questions {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .quiz-questions.expanded {
          max-height: none;
        }

        .questions-list {
          margin-top: 1rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .questions-list::-webkit-scrollbar {
          width: 6px;
        }

        .questions-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .questions-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .quiz-stat-number {
          font-size: 1.5rem;
          font-weight: bold;
          color: #2d3748;
        }

        .quiz-stat-label {
          font-size: 0.875rem;
          color: #718096;
          margin: 0;
        }

        .quiz-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .quiz-stat {
          text-align: center;
        }

        .section-content-inner {
          padding: 1rem;
        }

        .quiz-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .modern-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #4a5568;
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .modern-btn:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
          color: #2d3748;
          text-decoration: none;
        }

        .modern-btn.secondary.small {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .add-question-form-container {
            max-height: 70vh;
            margin: 0.5rem;
            padding: 0.75rem;
          }

          .form-wrapper {
            padding: 1rem;
          }

          .quiz-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .quiz-header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .quiz-stats {
            gap: 1rem;
          }

          .question-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .question-actions {
            align-self: flex-end;
          }

          .question-choices {
            margin-left: 1rem;
          }

          .questions-list {
            max-height: 300px;
          }
        }

        /* Animation Improvements */
        .section-bar-content {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .section-bar-content.expanded {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .question-item-card {
          animation: fadeInUp 0.3s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Loading States */
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Error States */
        .alert {
          border-radius: 6px;
          border: none;
          position: relative;
        }

        .alert-danger {
          background-color: #fee;
          color: #c53030;
          border-left: 4px solid #e53e3e;
        }

        .alert-success {
          background-color: #f0fff4;
          color: #2f855a;
          border-left: 4px solid #38a169;
        }

        /* Form Specific Improvements */
        .add-question-form-container .form-group {
          margin-bottom: 1rem;
        }

        .add-question-form-container .form-control {
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          transition: border-color 0.2s ease;
        }

        .add-question-form-container .form-control:focus {
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
          outline: none;
        }

        .add-question-form-container .btn {
          border-radius: 6px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .add-question-form-container .btn-primary {
          background-color: #4299e1;
          border-color: #4299e1;
        }

        .add-question-form-container .btn-primary:hover {
          background-color: #3182ce;
          border-color: #3182ce;
          transform: translateY(-1px);
        }

        .add-question-form-container .btn-secondary {
          background-color: #718096;
          border-color: #718096;
        }

        .add-question-form-container .btn-secondary:hover {
          background-color: #4a5568;
          border-color: #4a5568;
        }

        /* Better Typography */
        .quiz-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .section-bar-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .section-bar-subtitle {
          font-size: 0.875rem;
          color: #718096;
          margin: 0;
        }

        /* Better Spacing */
        .content-section-bar {
          margin-bottom: 1rem;
        }

        .section-bar-header {
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .section-bar-header:hover {
          border-color: #cbd5e0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .section-bar-header.expanded {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          border-bottom-color: transparent;
        }

        .section-bar-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #edf2f7;
          color: #4a5568;
          flex-shrink: 0;
        }

        .section-bar-icon.quiz-icon {
          background: #e6fffa;
          color: #319795;
        }

        .section-bar-info {
          flex: 1;
        }

        .section-bar-count {
          background: #edf2f7;
          color: #4a5568;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }

        .section-bar-expand {
          color: #718096;
          transition: transform 0.2s ease;
        }

        .section-bar-header.expanded .section-bar-expand {
          transform: rotate(180deg);
        }

        .section-bar-content {
          border: 1px solid #e2e8f0;
          border-top: none;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          background: white;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .section-bar-content.expanded {
          max-height: none;
        }

        /* Empty State Improvements */
        .quiz-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #718096;
        }

        .quiz-empty i {
          color: #cbd5e0;
          margin-bottom: 1rem;
        }

        .quiz-empty p {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          color: #4a5568;
        }

        /* Button Disabled States */
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn:disabled:hover {
          transform: none;
        }
      `}</style>
    </div>
  );
};

export default QuizSectionBar;

