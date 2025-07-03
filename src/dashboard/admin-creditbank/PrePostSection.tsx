import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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

// Question Form Component for Essay Questions
const EssayQuestionForm: React.FC<{
  onSubmit: (questionData: any) => void;
  onCancel: () => void;
  testType: 'pre' | 'post';
}> = ({ onSubmit, onCancel, testType }) => {
  const [formData, setFormData] = useState({
    question_text: '',
    score: 1,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question_text.trim()) return;

    onSubmit({
      title: formData.question_text,
      description: formData.description,
      type: 'essay',
      question_type: 'essay',
      question_text: formData.question_text,
      score: formData.score,
      category: 'subjective',
      choices: [],
      shuffleChoices: false,
      showExplanation: false,
      autoGrade: false
    });
  };

  return (
    <div className="essay-question-form">
      <div className="form-header">
        <h4>เพิ่มคำถามอัตนัย - แบบทดสอบ{testType === 'pre' ? 'ก่อนเรียน' : 'หลังเรียน'}</h4>
        <p>สร้างคำถามแบบเรียงความสำหรับการประเมิน</p>
      </div>

      <form onSubmit={handleSubmit} className="question-form">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-question-circle"></i>
            คำถาม <span className="required">*</span>
          </label>
          <textarea
            className="form-control"
            rows={4}
            value={formData.question_text}
            onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
            placeholder="กรุณาใส่คำถามที่ต้องการให้ผู้เรียนตอบ..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-info-circle"></i>
            คำอธิบายเพิ่มเติม
          </label>
          <textarea
            className="form-control"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="คำอธิบายหรือแนวทางการตอบ (ไม่บังคับ)"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-star"></i>
            คะแนนเต็ม
          </label>
          <input
            type="number"
            className="form-control score-input"
            min="1"
            max="100"
            value={formData.score}
            onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) || 1 }))}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            <i className="fas fa-times"></i>
            ยกเลิก
          </button>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-plus"></i>
            เพิ่มคำถาม
          </button>
        </div>
      </form>
    </div>
  );
};

// Test Card Component
const TestCard: React.FC<{
  testType: 'pre' | 'post';
  subject: Subject;
  onQuestionAdd: (testType: 'pre' | 'post', questionData: any) => void;
  onTestDelete: (testType: 'pre' | 'post') => void;
  onTestCreate: (testType: 'pre' | 'post') => void;
  loading: boolean;
}> = ({ testType, subject, onQuestionAdd, onTestDelete, onTestCreate, loading }) => {
  const [expanded, setExpanded] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const test = testType === 'pre' 
    ? (subject.pre_test || subject.preTest) 
    : (subject.post_test || subject.postTest);

  const testTitle = testType === 'pre' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน';
  const testDescription = testType === 'pre' 
    ? 'ทดสอบความรู้พื้นฐานก่อนเริ่มเรียน' 
    : 'ทดสอบความรู้หลังจากเรียนจบ';

  // Fetch questions when expanded
  useEffect(() => {
    if (expanded && test?.quiz_id && questions.length === 0) {
      fetchQuestions();
    }
  }, [expanded, test?.quiz_id]);

  const fetchQuestions = async () => {
    if (!test?.quiz_id) return;
    
    setQuestionsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${apiUrl}/api/courses/quizzes/${test.quiz_id}/questions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data?.success && response.data.questions) {
        const formattedQuestions = response.data.questions.map((q: any) => ({
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
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleQuestionAdd = async (questionData: any) => {
    try {
      await onQuestionAdd(testType, questionData);
      setShowQuestionForm(false);
      // Refresh questions
      await fetchQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const getQuestionTypeText = (type: string): string => {
    switch (type) {
      case 'essay': return 'อัตนัย (เรียงความ)';
      case 'short_answer': return 'อัตนัย (เติมคำ)';
      default: return type;
    }
  };

  if (showQuestionForm) {
    return (
      <div className="test-card-container">
        <div className="test-card expanded">
          <EssayQuestionForm
            testType={testType}
            onSubmit={handleQuestionAdd}
            onCancel={() => setShowQuestionForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="test-card-container">
      <div className={`test-card ${testType}-test ${expanded ? 'expanded' : ''}`}>
        <div 
          className="test-card-header"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={`test-icon ${testType}-icon`}>
            <i className={`fas ${testType === 'pre' ? 'fa-play-circle' : 'fa-stop-circle'}`}></i>
          </div>
          <div className="test-info">
            <h4 className="test-title">{testTitle}</h4>
            <p className="test-subtitle">{testDescription}</p>
            {test && (
              <div className="test-stats">
                <span className="stat-item">
                  <i className="fas fa-question-circle"></i>
                  {questions.length} คำถาม
                </span>
                <span className="stat-item">
                  <i className="fas fa-star"></i>
                  {questions.reduce((total, q) => total + (q.score || 1), 0)} คะแนน
                </span>
              </div>
            )}
          </div>
          <div className="test-status">
            {test ? (
              <span className={`status-badge ${test.status || 'active'}`}>
                {(test.status || 'active') === 'active' ? 'เปิดใช้งาน' : 
                 (test.status || 'active') === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
              </span>
            ) : (
              <span className="status-badge empty">ยังไม่มีแบบทดสอบ</span>
            )}
          </div>
          <div className="expand-icon">
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>

        <div className={`test-card-content ${expanded ? 'expanded' : ''}`}>
          {test ? (
            <div className="test-content">
              <div className="test-details">
                <div className="detail-row">
                  <span className="detail-label">ชื่อแบบทดสอบ:</span>
                  <span className="detail-value">{test.title}</span>
                </div>
                {test.description && (
                  <div className="detail-row">
                    <span className="detail-label">คำอธิบาย:</span>
                    <span className="detail-value">{test.description}</span>
                  </div>
                )}
              </div>

              <div className="test-actions">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => setShowQuestionForm(true)}
                  disabled={loading}
                >
                  <i className="fas fa-plus"></i>
                  เพิ่มคำถาม
                </button>
                <Link
                  to={`/admin-quizzes/edit/${test.quiz_id}`}
                  className="btn btn-secondary btn-sm"
                >
                  <i className="fas fa-edit"></i>
                  แก้ไข
                </Link>
                <button 
                  className="btn btn-info btn-sm"
                  onClick={() => window.open(`/quizzes/preview/${test.quiz_id}`, '_blank')}
                >
                  <i className="fas fa-eye"></i>
                  ดูตัวอย่าง
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => onTestDelete(testType)}
                >
                  <i className="fas fa-trash"></i>
                  ลบ
                </button>
              </div>

              <div className="questions-section">
                <div className="questions-header">
                  <h5>คำถามในแบบทดสอบ</h5>
                </div>
                
                {questionsLoading ? (
                  <div className="loading-state">
                    <div className="spinner-border spinner-border-sm"></div>
                    <span>กำลังโหลดคำถาม...</span>
                  </div>
                ) : questions.length > 0 ? (
                  <div className="questions-list">
                    {questions.map((question, index) => (
                      <div key={question.question_id} className="question-item">
                        <div className="question-number">{index + 1}</div>
                        <div className="question-content">
                          <div className="question-text">{question.question_text}</div>
                          <div className="question-meta">
                            <span className="question-type">
                              {getQuestionTypeText(question.question_type)}
                            </span>
                            <span className="question-score">
                              {question.score || 1} คะแนน
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-questions">
                    <i className="fas fa-question-circle"></i>
                    <p>ยังไม่มีคำถามในแบบทดสอบนี้</p>
                    <button 
                      className="btn btn-primary btn-sm"
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
            <div className="test-empty">
              <div className="empty-icon">
                <i className={`fas ${testType === 'pre' ? 'fa-play-circle' : 'fa-stop-circle'}`}></i>
              </div>
                           <h5>ยังไม่มี{testTitle}</h5>
              <p>สร้าง{testTitle}สำหรับรายวิชานี้</p>
              <button 
                className="btn btn-primary"
                onClick={() => onTestCreate(testType)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    กำลังสร้าง...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    สร้าง{testTitle}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main PrePostSection Component
const PrePostSection: React.FC<PrePostSectionProps> = ({ subject, onSubjectUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createTestForSubject = async (testType: 'pre' | 'post') => {
    setLoading(true);
    setError('');
    
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const testData = {
        title: `แบบทดสอบ${testType === 'pre' ? 'ก่อนเรียน' : 'หลังเรียน'} - ${subject.subject_name}`,
        description: `แบบทดสอบ${testType === 'pre' ? 'ก่อนเรียน' : 'หลังเรียน'}สำหรับรายวิชา ${subject.subject_name}`,
        type: testType,
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

      if (response.data?.success && response.data.quiz) {
        const newQuiz = {
          quiz_id: response.data.quiz.quiz_id,
          title: response.data.quiz.title,
          description: response.data.quiz.description,
          status: response.data.quiz.status,
          passing_score_enabled: false,
          passing_score_value: 0,
          questions: []
        };

        // Update subject with new quiz
        const updatedSubject = {
          ...subject,
          [testType === 'pre' ? 'pre_test' : 'post_test']: newQuiz
        };

        if (onSubjectUpdate) {
          onSubjectUpdate(updatedSubject);
        }

        showNotification(`สร้าง${testType === 'pre' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน'}สำเร็จ`, 'success');
      }
    } catch (error: any) {
      console.error('Error creating test:', error);
      const errorMessage = error.response?.data?.message || 'ไม่สามารถสร้างแบบทดสอบได้';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionAdd = async (testType: 'pre' | 'post', questionData: any) => {
    try {
      const test = testType === 'pre' 
        ? (subject.pre_test || subject.preTest) 
        : (subject.post_test || subject.postTest);

      let targetQuizId = test?.quiz_id;

      // If no test exists, create one first
      if (!targetQuizId) {
        await createTestForSubject(testType);
        // Get the newly created test
        const updatedTest = testType === 'pre' 
          ? (subject.pre_test || subject.preTest) 
          : (subject.post_test || subject.postTest);
        targetQuizId = updatedTest?.quiz_id;
      }

      if (!targetQuizId) {
        throw new Error('ไม่สามารถสร้างแบบทดสอบได้');
      }

      const formattedData = {
        title: questionData.title || questionData.question_text,
        description: questionData.description || '',
        category: 'subjective',
        type: questionData.type || 'essay',
        score: questionData.score || 1,
        choices: [],
        shuffleChoices: false,
        showExplanation: false,
        autoGrade: false,
        quizzes: [targetQuizId]
      };

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
      
      if (response.data?.success) {
        showNotification('เพิ่มคำถามสำเร็จ', 'success');
      }
    } catch (error: any) {
      console.error('Error adding question:', error);
      const errorMessage = error.response?.data?.message || 'ไม่สามารถเพิ่มคำถามได้';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  const handleDeleteTest = async (testType: 'pre' | 'post') => {
    const testName = testType === 'pre' ? 'ก่อนเรียน' : 'หลังเรียน';
    if (!confirm(`คุณต้องการลบแบบทดสอบ${testName}นี้หรือไม่?`)) return;
    
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      const testId = testType === 'pre' 
        ? (subject.pre_test?.quiz_id || subject.preTest?.quiz_id) 
        : (subject.post_test?.quiz_id || subject.postTest?.quiz_id);
      
      if (!testId) return;

      const response = await axios.delete(
        `${apiURL}/api/courses/quizzes/${testId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update subject by removing the deleted test
        const updatedSubject = {
          ...subject,
          [testType === 'pre' ? 'pre_test' : 'post_test']: null
        };

        if (onSubjectUpdate) {
          onSubjectUpdate(updatedSubject);
        }

        showNotification(`ลบแบบทดสอบ${testName}สำเร็จ`, 'success');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      showNotification(`เกิดข้อผิดพลาดในการลบแบบทดสอบ${testName}`, 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  return (
    <div className="prepost-section">
      <div className="section-header">
        <div className="header-content">
          <h3 className="section-title">
            <i className="fas fa-clipboard-list"></i>
            แบบทดสอบก่อนและหลังเรียน
          </h3>
          <p className="section-description">
            จัดการแบบทดสอบก่อนเรียนและหลังเรียนสำหรับรายวิชา {subject.subject_name}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button 
            className="btn btn-sm btn-outline-light ms-2"
            onClick={() => setError('')}
          >
            ปิด
          </button>
        </div>
      )}

      <div className="tests-container">
        <TestCard
          testType="pre"
          subject={subject}
          onQuestionAdd={handleQuestionAdd}
          onTestDelete={handleDeleteTest}
          onTestCreate={createTestForSubject}
          loading={loading}
        />

        <TestCard
          testType="post"
          subject={subject}
          onQuestionAdd={handleQuestionAdd}
          onTestDelete={handleDeleteTest}
          onTestCreate={createTestForSubject}
          loading={loading}
        />
      </div>

      {/* Custom Styles */}
      <style>{`
        .prepost-section {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin: 1rem 0;
        }

        .section-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .header-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .section-title i {
          color: #4299e1;
        }

        .section-description {
          color: #718096;
          font-size: 1rem;
          margin: 0;
          line-height: 1.5;
        }

        .tests-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .test-card-container {
          height: fit-content;
        }

        .test-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .test-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .test-card.expanded {
          transform: none;
        }

        .test-card-header {
          padding: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid #e2e8f0;
          transition: background-color 0.2s ease;
        }

        .test-card-header:hover {
          background-color: #f7fafc;
        }

        .test-card.expanded .test-card-header {
          background-color: #f7fafc;
        }

        .test-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .test-icon.pre-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .test-icon.post-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .test-info {
          flex: 1;
        }

        .test-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 0.25rem 0;
        }

        .test-subtitle {
          color: #718096;
          font-size: 0.875rem;
          margin: 0 0 0.75rem 0;
        }

        .test-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8125rem;
          color: #4a5568;
          font-weight: 500;
        }

        .stat-item i {
          color: #718096;
        }

        .test-status {
          flex-shrink: 0;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .status-badge.active {
          background: #c6f6d5;
          color: #22543d;
        }

        .status-badge.inactive {
          background: #fed7d7;
          color: #742a2a;
        }

        .status-badge.draft {
          background: #feebc8;
          color: #7b341e;
        }

        .status-badge.empty {
          background: #e2e8f0;
          color: #4a5568;
        }

        .expand-icon {
          color: #a0aec0;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .test-card.expanded .expand-icon {
          transform: rotate(180deg);
        }

        .test-card-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .test-card-content.expanded {
          max-height: none;
        }

        .test-content {
          padding: 1.5rem;
        }

        .test-details {
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: flex;
          margin-bottom: 0.75rem;
          align-items: flex-start;
        }

        .detail-label {
          font-weight: 600;
          color: #4a5568;
          min-width: 120px;
          flex-shrink: 0;
        }

        .detail-value {
          color: #2d3748;
          flex: 1;
        }

        .test-actions {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .questions-section {
          border-top: 1px solid #e2e8f0;
          padding-top: 1.5rem;
        }

        .questions-header {
          margin-bottom: 1rem;
        }

        .questions-header h5 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem;
          color: #718096;
        }

        .questions-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .question-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          background: #f7fafc;
          transition: all 0.2s ease;
        }

        .question-item:hover {
          border-color: #cbd5e0;
          background: #edf2f7;
        }

        .question-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #4299e1;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .question-content {
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
          gap: 1rem;
          align-items: center;
        }

        .question-type {
          background: #e6fffa;
          color: #234e52;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .question-score {
          color: #718096;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .no-questions {
          text-align: center;
          padding: 3rem 1rem;
          color: #718096;
        }

        .no-questions i {
          font-size: 3rem;
          color: #cbd5e0;
          margin-bottom: 1rem;
        }

        .no-questions p {
          font-size: 1.125rem;
          margin-bottom: 1.5rem;
          color: #4a5568;
        }

        .test-empty {
          padding: 3rem 1.5rem;
          text-align: center;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f7fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
          color: #a0aec0;
        }

        .test-empty h5 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }

        .test-empty p {
          color: #718096;
          margin-bottom: 2rem;
        }

        /* Essay Question Form Styles */
        .essay-question-form {
          padding: 1.5rem;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .form-header h4 {
          font-size: 1.375rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #718096;
          margin: 0;
        }

        .question-form {
          max-width: 600px;
          margin: 0 auto;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .form-label i {
          color: #4299e1;
        }

        .required {
          color: #e53e3e;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: white;
        }

        .form-control:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .form-control::placeholder {
          color: #a0aec0;
        }

        .score-input {
          max-width: 120px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        /* Button Styles */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn:hover {
          text-decoration: none;
          transform: translateY(-1px);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(66, 153, 225, 0.3);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
          box-shadow: 0 4px 8px rgba(66, 153, 225, 0.4);
        }

        .btn-secondary {
          background: #718096;
          color: white;
        }

        .btn-secondary:hover {
          background: #4a5568;
        }

        .btn-success {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(72, 187, 120, 0.3);
        }

        .btn-success:hover {
          background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
          box-shadow: 0 4px 8px rgba(72, 187, 120, 0.4);
        }

        .btn-info {
          background: linear-gradient(135deg, #4fd1c7 0%, #38b2ac 100%);
          color: white;
        }

        .btn-info:hover {
          background: linear-gradient(135deg, #38b2ac 0%, #319795 100%);
        }

        .btn-danger {
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(245, 101, 101, 0.3);
        }

        .btn-danger:hover {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          box-shadow: 0 4px 8px rgba(245, 101, 101, 0.4);
        }

        /* Alert Styles */
        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .alert-danger {
          background: #fed7d7;
          color: #742a2a;
          border-left: 4px solid #e53e3e;
        }

        .alert-success {
          background: #c6f6d5;
          color: #22543d;
          border-left: 4px solid #38a169;
        }

        /* Notification Styles */
        .notification {
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
        }

        .notification.show {
          transform: translateX(0);
        }

        .notification.success {
          background: #c6f6d5;
          color: #22543d;
          border-left: 4px solid #38a169;
        }

        .notification.error {
          background: #fed7d7;
          color: #742a2a;
          border-left: 4px solid #e53e3e;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .prepost-section {
            padding: 1rem;
          }

          .tests-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .test-card-header {
            padding: 1rem;
          }

          .test-content {
            padding: 1rem;
          }

          .test-actions {
            flex-direction: column;
          }

          .btn {
            justify-content: center;
          }

          .form-actions {
            flex-direction: column;
          }

          .essay-question-form {
            padding: 1rem;
          }

          .question-item {
            flex-direction: column;
            gap: 0.75rem;
          }

          .question-number {
            align-self: flex-start;
          }

          .questions-list {
            max-height: 300px;
          }
        }

        /* Scrollbar Styling */
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

        .questions-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Animation */
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

        .question-item {
          animation: fadeInUp 0.3s ease-out;
        }

        .test-card {
          animation: fadeInUp 0.3s ease-out;
        }

        /* Loading Animation */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinner-border {
          display: inline-block;
            width: 1rem;
          height: 1rem;
          border: 0.125em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }

        .spinner-border-sm {
          width: 0.875rem;
          height: 0.875rem;
          border-width: 0.1em;
        }

        /* Focus States */
        .btn:focus,
        .form-control:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        /* Hover Effects */
        .question-item:hover .question-number {
          background: #3182ce;
          transform: scale(1.05);
        }

        .test-card:hover .test-icon {
          transform: scale(1.05);
        }

        /* Dark Mode Support (Optional) */
        @media (prefers-color-scheme: dark) {
          .prepost-section {
            background: #1a202c;
            color: #e2e8f0;
          }

          .test-card {
            background: #2d3748;
            border-color: #4a5568;
          }

          .test-card-header:hover {
            background-color: #374151;
          }

          .section-title {
            color: #e2e8f0;
          }

          .section-description {
            color: #a0aec0;
          }

          .test-title {
            color: #e2e8f0;
          }

          .test-subtitle {
            color: #a0aec0;
          }

          .detail-label {
            color: #a0aec0;
          }

          .detail-value {
            color: #e2e8f0;
          }

          .question-text {
            color: #e2e8f0;
          }

          .question-item {
            background: #374151;
            border-color: #4a5568;
          }

          .question-item:hover {
            background: #4a5568;
          }

          .form-control {
            background: #374151;
            border-color: #4a5568;
            color: #e2e8f0;
          }

          .form-control::placeholder {
            color: #6b7280;
          }

          .form-label {
            color: #e2e8f0;
          }

          .essay-question-form {
            background: #2d3748;
          }
        }

        /* Print Styles */
        @media print {
          .test-actions,
          .btn,
          .expand-icon {
            display: none !important;
          }

          .test-card {
            box-shadow: none;
            border: 1px solid #000;
          }

          .test-card-content {
            max-height: none !important;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .test-card {
            border: 2px solid #000;
          }

          .btn {
            border: 2px solid currentColor;
          }

          .form-control {
            border: 2px solid #000;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .test-card,
          .question-item,
          .btn,
          .notification,
          .test-card-content,
          .expand-icon {
            transition: none;
            animation: none;
          }

          .test-card:hover,
          .btn:hover {
            transform: none;
          }
        }

        /* Custom Utilities */
        .me-2 {
          margin-right: 0.5rem;
        }

        .ms-2 {
          margin-left: 0.5rem;
        }

        .text-center {
          text-align: center;
        }

        .d-flex {
          display: flex;
        }

        .align-items-center {
          align-items: center;
        }

        .justify-content-center {
          justify-content: center;
        }

        .gap-2 {
          gap: 0.5rem;
        }

        .gap-3 {
          gap: 1rem;
        }

        .w-100 {
          width: 100%;
        }

        .h-100 {
          height: 100%;
        }

        .position-relative {
          position: relative;
        }

        .position-absolute {
          position: absolute;
        }

        .top-0 {
          top: 0;
        }

        .end-0 {
          right: 0;
        }

        .z-index-1 {
          z-index: 1;
        }

        /* Additional Enhancements */
        .test-card.pre-test {
          border-left: 4px solid #667eea;
        }

        .test-card.post-test {
          border-left: 4px solid #f093fb;
        }

        .test-card.expanded {
          border-left-width: 4px;
        }

        .questions-section {
          position: relative;
        }

        .questions-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
        }

        /* Improved Focus Indicators */
        .test-card-header:focus-within {
          outline: 2px solid #4299e1;
          outline-offset: 2px;
        }

        /* Better Error States */
        .form-control.error {
          border-color: #e53e3e;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
        }

        .form-group.error .form-label {
          color: #e53e3e;
        }

        /* Success States */
        .form-control.success {
          border-color: #38a169;
          box-shadow: 0 0 0 3px rgba(56, 161, 105, 0.1);
        }

        /* Loading Overlay */
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        /* Tooltip Styles */
        .tooltip {
          position: relative;
        }

        .tooltip::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #2d3748;
          color: white;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }

        .tooltip:hover::after {
          opacity: 1;
        }

        /* Badge Improvements */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .badge-primary {
          background: #e6fffa;
          color: #234e52;
        }

        .badge-secondary {
          background: #edf2f7;
          color: #4a5568;
        }

        .badge-success {
          background: #c6f6d5;
          color: #22543d;
        }

        .badge-warning {
          background: #feebc8;
          color: #7b341e;
        }

        .badge-danger {
          background: #fed7d7;
          color: #742a2a;
        }

        .badge-info {
          background: #bee3f8;
          color: #2a4365;
        }
      `}</style>
    </div>
  );
};

export default PrePostSection;

