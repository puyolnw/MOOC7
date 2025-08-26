import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddQuestionsforPrePost  from '../../forms/Course/Questions/AddQuestionsforPrePost';
import styles from './PrePostSection.module.css';
import Swal from 'sweetalert2'; // เพิ่ม SweetAlert2 สำหรับ confirm dialog

interface Subject {
  subject_id: number;
  subject_name: string;
  pre_test: Quiz | null;
  post_test: Quiz | null;
  preTest?: Quiz;
  postTest?: Quiz;
}

interface Quiz {
  quiz_id: number;
  title: string;
  description: string;
  status: string;
  passing_score_enabled: boolean;
  passing_score_value: number;
  question_count?: string;
  questions?: QuizQuestion[];
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

interface PrePostSectionProps {
  subject: Subject;
  onSubjectUpdate?: (updatedSubject: Subject) => void;
}

// Combined Test Card Component
const CombinedTestCard: React.FC<{
  subject: Subject;
  onQuestionAdd: (questionData: any) => Promise<void>;
  onQuestionDelete: (questionId: number) => Promise<void>; // ✅ เพิ่ม prop สำหรับลบคำถาม
  onTestCreate: () => Promise<void>;
  loading: boolean;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}> = ({ subject, onQuestionAdd, onQuestionDelete, onTestCreate, loading }) => {
  const [expanded, setExpanded] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null); // ✅ เพิ่ม state สำหรับ loading ปุ่มลบ

  // ใช้ pre_test เป็นหลัก หรือ post_test ถ้าไม่มี pre_test
  const mainTest = subject.pre_test || subject.preTest || subject.post_test || subject.postTest;

  // Fetch questions when expanded
  useEffect(() => {
    if (expanded && mainTest?.quiz_id && questions.length === 0) {
      fetchQuestions();
    }
  }, [expanded, mainTest?.quiz_id]);

  const fetchQuestions = async () => {
    if (!mainTest?.quiz_id) return;
    
    setQuestionsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      console.log('Fetching questions for quiz ID:', mainTest.quiz_id);
      
      const response = await axios.get(
        `${apiUrl}/api/courses/quizzes/${mainTest.quiz_id}/questions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Questions API response:', response.data);
      
      if (response.data?.success && response.data.questions) {
        const formattedQuestions: QuizQuestion[] = response.data.questions.map((q: any) => ({
          question_id: q.question_id,
          question_text: q.title || q.question_text,
          question_type: q.type || q.question_type,
          score: q.score,
          choices: q.choices?.map((c: any) => ({
            choice_id: c.choice_id,
            choice_text: c.text,
            is_correct: c.is_correct
          })) || []
        }));
        
        setQuestions(formattedQuestions);
        console.log('Formatted questions:', formattedQuestions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // ✅ ย้าย handleQuestionAdd ไปใช้ที่ parent component แทน
  const handleQuestionAddWrapper = async (questionData: any) => {
    try {
      await onQuestionAdd(questionData);
      // ✅ รีเฟรชคำถามหลังจากเพิ่มสำเร็จ
      await fetchQuestions();
      setShowQuestionForm(false);
    } catch (error) {
      // Error จะถูกจัดการใน parent component แล้ว
      console.error('Error in question add wrapper:', error);
    }
  };

  // ✅ เพิ่มฟังก์ชันสำหรับลบคำถาม
  const handleQuestionDelete = async (questionId: number, questionTitle: string) => {
    try {
      // แสดง confirmation dialog
      const result = await Swal.fire({
        title: 'ยืนยันการลบคำถาม',
        html: `
          <div class="text-start">
            <p><strong>คำถาม:</strong> ${questionTitle}</p>
            <p class="text-danger"><i class="fas fa-exclamation-triangle"></i> การลบคำถามนี้จะไม่สามารถกู้คืนได้</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'ลบคำถาม',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        setDeletingQuestionId(questionId);
        await onQuestionDelete(questionId);
        // รีเฟรชคำถามหลังจากลบสำเร็จ
        await fetchQuestions();
      }
    } catch (error) {
      console.error('Error in question delete wrapper:', error);
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleCancel = () => {
    setShowQuestionForm(false);
  };

  const getQuestionTypeText = (type: string): string => {
    switch (type) {
      case 'multiple_choice': return 'ปรนัย (หลายตัวเลือก)';
      case 'essay': return 'อัตนัย (เรียงความ)';
      case 'short_answer': return 'อัตนัย (เติมคำ)';
      default: return type;
    }
  };

  const renderQuestionItem = (question: QuizQuestion, index: number) => (
    <div key={question.question_id} className={styles.questionItem}>
      <div className={styles.questionNumber}>{index + 1}</div>
      <div className={styles.questionContent}>
        <div className={styles.questionText}>{question.question_text}</div>
        <div className={styles.questionMeta}>
          <span className={styles.questionType}>
            {getQuestionTypeText(question.question_type)}
          </span>
          <span className={styles.questionScore}>
            {question.score || 1} คะแนน
          </span>
        </div>
        {question.choices && question.choices.length > 0 && (
          <div className={styles.questionChoices}>
            {question.choices.map((choice, choiceIndex) => (
              <div key={choice.choice_id} className={styles.choiceItem}>
                <div className={styles.choiceIndicator}>
                  {choice.is_correct ? (
                    <i className="fas fa-check-circle text-success"></i>
                  ) : (
                    <i className="far fa-circle text-muted"></i>
                  )}
                </div>
                <div className={styles.choiceText}>
                  {String.fromCharCode(65 + choiceIndex)}. {choice.choice_text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ✅ เพิ่มปุ่มลบคำถาม */}
      <div className={styles.questionActions}>
        <button
          className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
          onClick={() => handleQuestionDelete(question.question_id, question.question_text)}
          disabled={deletingQuestionId === question.question_id}
          title="ลบคำถาม"
        >
          {deletingQuestionId === question.question_id ? (
            <div className={`${styles.spinnerBorder} ${styles.spinnerBorderSm}`}></div>
          ) : (
            <i className="fas fa-trash-alt"></i>
          )}
        </button>
      </div>
    </div>
  );

  if (showQuestionForm) {
    return (
      <div className={styles.testCardContainer}>
        <div className={`${styles.testCard} ${styles.expanded}`}>
          <div className={styles.addQuestionFormContainer}>
            <div className={styles.formWrapper}>
              <div className={styles.formHeader}>
                <h5>เพิ่มคำถามสำหรับแบบทดสอบ</h5>
                <button 
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  onClick={handleCancel}
                >
                  <i className="fas fa-times"></i>
                  ยกเลิก
                </button>
              </div>
              <AddQuestionsforPrePost 
                onSubmit={handleQuestionAddWrapper}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.testCardContainer}>
      <div className={`${styles.testCard} ${styles.combinedTest} ${expanded ? styles.expanded : ''}`}>
        <div
          className={styles.testCardHeader}
          onClick={() => setExpanded(!expanded)}
        >
          <div className={styles.testIcon}>
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className={styles.testInfo}>
            <h4 className={styles.testTitle}>แบบทดสอบก่อนเรียน - หลังเรียนประจำรายวิชา</h4>
            <p className={styles.testSubtitle}>
              แบบทดสอบก่อนเรียน - หลังเรียนประจำรายวิชา{subject.subject_name}
            </p>
            <div className={styles.testStats}>
              <span className={styles.statItem}>
                <i className="fas fa-question-circle"></i>
                {questions.length} คำถาม
              </span>
              <span className={styles.statItem}>
                <i className="fas fa-star"></i>
                {questions.reduce((total, q) => total + (q.score || 1), 0)} คะแนน
              </span>
            </div>
          </div>
          <div className={styles.testStatus}>
            <span className={`${styles.statusBadge} ${styles[mainTest?.status || 'empty']}`}>
              {mainTest ?
                (mainTest.status === 'active' ? 'เปิดใช้งาน' :
                 mainTest.status === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง') :
                                'ยังไม่มีแบบทดสอบ'
              }
            </span>
          </div>
          <div className={styles.expandIcon}>
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>

        <div className={`${styles.testCardContent} ${expanded ? styles.expanded : ''}`}>
          <div className={styles.testContent}>
            {mainTest ? (
              <div className={styles.testContentSection}>
                <div className={styles.testActions}>
                  <button
                    className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                    onClick={() => setShowQuestionForm(true)}
                    disabled={loading}
                  >
                    <i className="fas fa-plus"></i>
                    เพิ่มคำถาม
                  </button>
                  
                  {questions.length > 0 && (
                    <button
                      className={`${styles.btn} ${styles.btnInfo} ${styles.btnSm}`}
                      onClick={() => fetchQuestions()}
                      disabled={questionsLoading}
                    >
                      <i className="fas fa-sync-alt"></i>
                      รีเฟรช
                    </button>
                  )}
                </div>

                <div className={styles.questionsSection}>
                  <div className={styles.questionsHeader}>
                    <h5>คำถามในแบบทดสอบ</h5>
                    <div className={styles.questionsCount}>
                      {questions.length} คำถาม
                    </div>
                  </div>
                  
                  {questionsLoading ? (
                    <div className={styles.loadingState}>
                      <div className={`${styles.spinnerBorder} ${styles.spinnerBorderSm}`}></div>
                      <span>กำลังโหลดคำถาม...</span>
                    </div>
                  ) : questions.length > 0 ? (
                    <div className={styles.questionsList}>
                      {questions.map((question, index) =>
                        renderQuestionItem(question, index)
                      )}
                    </div>
                  ) : (
                    <div className={styles.noQuestions}>
                      <i className="fas fa-question-circle"></i>
                      <p>ยังไม่มีคำถามในแบบทดสอบนี้</p>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                        onClick={() => setShowQuestionForm(true)}
                      >
                        <i className="fas fa-plus"></i>
                        เพิ่มคำถามแรก
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.testEmpty}>
                <div className={styles.emptyIcon}>
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <h5>ยังไม่มีแบบทดสอบ</h5>
                <p>สร้างแบบทดสอบสำหรับรายวิชานี้</p>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => onTestCreate()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className={`${styles.spinnerBorder} ${styles.spinnerBorderSm} me-2`}></div>
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
    </div>
  );
};

// Main PrePostSection Component
const PrePostSection: React.FC<PrePostSectionProps> = ({ subject, onSubjectUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createTestForSubject = async () => {
    setLoading(true);
    setError('');
    
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      console.log('Creating combined test for subject:', subject.subject_id);
      
      const testData = {
        title: `แบบทดสอบประจำรายวิชา - ${subject.subject_name}`,
        description: `แบบทดสอบสำหรับรายวิชา ${subject.subject_name}`,
        type: 'combined',
        subject_id: subject.subject_id,
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

      console.log('Test data being sent:', testData);

      const response = await axios.post(
        `${apiURL}/api/courses/quizzes`,
        testData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Create test response:', response.data);

      if (response.data?.success && response.data.quiz) {
        const newQuiz: Quiz = {
          quiz_id: response.data.quiz.quiz_id,
          title: response.data.quiz.title,
          description: response.data.quiz.description,
          status: response.data.quiz.status,
          passing_score_enabled: false,
          passing_score_value: 0,
          questions: []
        };

        const updatedSubject = {
          ...subject,
          pre_test: newQuiz,
          post_test: newQuiz
        };

        if (onSubjectUpdate) {
          onSubjectUpdate(updatedSubject);
        }

        showNotification('สร้างแบบทดสอบสำเร็จ', 'success');
        console.log('Test created successfully!');
      }
    } catch (error: any) {
      console.error('Error creating test:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'ไม่สามารถสร้างแบบทดสอบได้';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionAdd = async (questionData: any) => {
    console.log('=== handleQuestionAdd ===');
    console.log('Question data:', questionData);
    
    try {
      const mainTest = subject.pre_test || subject.preTest || subject.post_test || subject.postTest;
      
      console.log('Main test:', mainTest);
      
      if (!mainTest || !mainTest.quiz_id) {
        setError('ไม่พบแบบทดสอบ กรุณาสร้างแบบทดสอบก่อนเพิ่มคำถาม');
        return;
      }

      const targetQuizId = mainTest.quiz_id;
      console.log('Target quiz ID:', targetQuizId);

      const quizIds = [];
      quizIds.push(targetQuizId);
      
      if (subject.pre_test && subject.post_test &&
          subject.pre_test.quiz_id !== subject.post_test.quiz_id) {
        if (!quizIds.includes(subject.pre_test.quiz_id)) {
          quizIds.push(subject.pre_test.quiz_id);
        }
        if (!quizIds.includes(subject.post_test.quiz_id)) {
          quizIds.push(subject.post_test.quiz_id);
        }
      }

      console.log('Quiz IDs to add question:', quizIds);

      const formattedData = {
        title: questionData.title || questionData.question_text || '',
        description: questionData.description || '',
        category: questionData.category || 'objective',
        type: questionData.type || questionData.question_type || 'multiple_choice',
        score: questionData.score || 1,
        choices: questionData.choices?.map((choice: any) => ({
          text: choice.text || choice.choice_text || '',
          isCorrect: choice.isCorrect || choice.is_correct || false,
          explanation: choice.explanation || ''
        })) || [],
        shuffleChoices: questionData.shuffleChoices || false,
        showExplanation: questionData.showExplanation || false,
        autoGrade: questionData.autoGrade !== false,
        quizzes: quizIds
      };

      console.log('Formatted data for API:', formattedData);

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
      
      console.log('Add question API response:', response.data);
      
      if (response.data?.success) {
        const quizCount = quizIds.length;
        const message = quizCount > 1
          ? `เพิ่มคำถามสำเร็จ (เพิ่มเข้า ${quizCount} แบบทดสอบ)`
          : 'เพิ่มคำถามสำเร็จ';
        
        showNotification(message, 'success');
        console.log(`Question added successfully to ${quizCount} quiz(es)!`);
        setError('');
      } else {
        throw new Error(response.data?.message || 'ไม่สามารถเพิ่มคำถามได้');
      }
    } catch (error: any) {
      console.error('Error adding question:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'ไม่สามารถเพิ่มคำถามได้';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  // ✅ เพิ่มฟังก์ชันสำหรับลบคำถาม
  const handleQuestionDelete = async (questionId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      console.log('Deleting question ID:', questionId);
      
      const response = await axios.delete(
        `${apiUrl}/api/courses/questions/${questionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Delete question API response:', response.data);
      
      if (response.data?.success) {
        showNotification(response.data.message || 'ลบคำถามสำเร็จ', 'success');
        console.log('Question deleted successfully!');
        setError('');
      } else {
        throw new Error(response.data?.message || 'ไม่สามารถลบคำถามได้');
      }
    } catch (error: any) {
      console.error('Error deleting question:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'ไม่สามารถลบคำถามได้';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      document.body.removeChild(existingNotification);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      transform: translateX(400px);
      transition: all 0.3s ease;
      ${type === 'success' ?
        'background: #c6f6d5; color: #22543d; border-left: 4px solid #38a169;' :
        'background: #fed7d7; color: #742a2a; border-left: 4px solid #e53e3e;'
      }
    `;
    
    const content = notification.querySelector('.notification-content');
    if (content) {
      (content as HTMLElement).style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
      `;
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const handleError = (message: string) => {
    setError(message);
  };

  const handleSuccess = (message: string) => {
    showNotification(message, 'success');
    setError('');
  };

  return (
    <div className={styles.prepostSection}>
      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button
            className={`${styles.btn} ${styles.btnSm} ${styles.btnOutlineLight} ms-2`}
            onClick={() => setError('')}
          >
            ปิด
          </button>
        </div>
      )}
      
      <CombinedTestCard
        subject={subject}
                onQuestionAdd={handleQuestionAdd}
        onQuestionDelete={handleQuestionDelete} // ✅ ส่ง prop สำหรับลบคำถาม
        onTestCreate={createTestForSubject}
        loading={loading}
        onError={handleError}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default PrePostSection;

