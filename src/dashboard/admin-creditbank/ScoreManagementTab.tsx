import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Interface for Subject
interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  description: string;
  credits: number;
  cover_image: string | null;
  cover_image_file_id: string | null;
  video_url: string | null;
  status: string;
  lesson_count: number;
  quiz_count: number;
  passing_percentage?: number;
  auto_distribute_score?: boolean;
}

// Interface for Score Items - ระบบคะแนนจริง
interface ScoreItem {
  id: number;
  type: 'quiz' | 'lesson' | 'big_lesson';
  title: string;
  actual_score: number; // คะแนนจริง (เช่น 10, 15, 20 คะแนน)
  weight_percentage?: number; // เก็บจาก database สำหรับ conversion
  is_fixed_weight: boolean;
  quiz_type?: string; // pre_lesson, post_lesson
  level?: 'subject' | 'big_lesson' | 'lesson';
  parent_id?: number | null;
  parent_type?: 'big_lesson' | 'lesson';
  children?: ScoreItem[];
  // เก็บ % สำหรับการแสดงผล (คำนวณอัตโนมัติ)
  calculated_percentage?: number;
  // รายละเอียด Quiz
  quiz_details?: {
    total_questions: number; // จำนวนข้อทั้งหมด
    max_score: number; // คะแนนเต็มของ quiz
    questions_breakdown: {
      question_id: number;
      score: number; // คะแนนต่อข้อ
    }[];
  };
}

interface ScoreManagementTabProps {
  subject: Subject;
}

const ScoreManagementTab: React.FC<ScoreManagementTabProps> = ({ subject }) => {
  const [scoreItems, setScoreItems] = useState<ScoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passingPercentage, setPassingPercentage] = useState<number>(subject.passing_percentage || 80);
  const [totalScore, setTotalScore] = useState<number>(0); // คะแนนรวมทั้งหมด
  const [requiredScore, setRequiredScore] = useState<number>(0); // คะแนนที่ต้องทำได้เพื่อผ่าน
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const apiURL = import.meta.env.VITE_API_URL;

  // Calculate total score and required score
  const calculateScores = () => {
    if (!scoreItems.length) return;
    
    // คำนวณคะแนนรวม (เฉพาะ Quizzes ที่มีคะแนน)
    const quizItems = scoreItems.filter(item => 
      item.type === 'quiz' && item.actual_score > 0
    );
    
    const newTotalScore = quizItems.reduce((sum, item) => 
      sum + (item.actual_score || 0), 0
    );
    
    const newRequiredScore = Math.ceil((newTotalScore * passingPercentage) / 100);
    
    setTotalScore(newTotalScore);
    setRequiredScore(newRequiredScore);
    
    console.log('📊 Score Calculation:', {
      totalQuizzes: quizItems.length,
      totalScore: newTotalScore,
      passingPercentage: passingPercentage,
      requiredScore: newRequiredScore
    });
  };

  // Fetch quiz details from backend
  const fetchQuizDetails = async (quizId: number): Promise<ScoreItem['quiz_details'] | null> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const response = await axios.get(
        `${apiURL}/api/quizzes/${quizId}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      return null;
    }
  };

  // Calculate required questions/score to achieve target
  const calculateRequiredAnswers = (
    targetScore: number, 
    quizDetails: ScoreItem['quiz_details']
  ): { 
    required_score: number; 
    required_questions: number; 
    breakdown: string 
  } => {
    if (!quizDetails || !targetScore) {
      return { required_score: 0, required_questions: 0, breakdown: '' };
    }

    const required_score = targetScore;
    const max_score = quizDetails.max_score;
    
    // คำนวณจำนวนข้อที่ต้องทำถูก (สมมติว่าทำถูกข้อที่มีคะแนนสูงก่อน)
    const questions = [...quizDetails.questions_breakdown].sort((a, b) => b.score - a.score);
    let accumulated_score = 0;
    let required_questions = 0;
    
    for (const question of questions) {
      if (accumulated_score >= required_score) break;
      accumulated_score += question.score;
      required_questions++;
    }

    const breakdown = `ต้องทำถูก ${required_questions}/${quizDetails.total_questions} ข้อ (${required_score}/${max_score} คะแนน)`;
    
    return { required_score, required_questions, breakdown };
  };

  // Toggle expand/collapse for items
  const toggleExpanded = async (itemKey: string) => {
    const newExpanded = new Set(expandedItems);
    
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
      
      // ถ้าเป็น Quiz และกำลังขยาย ให้ดึงข้อมูลรายละเอียด
      const item = scoreItems.find(i => `${i.type}-${i.id}` === itemKey);
      if (item && item.type === 'quiz' && !item.quiz_details) {
        console.log('🔍 Fetching quiz details for:', item.title);
        const details = await fetchQuizDetails(item.id);
        if (details) {
          setScoreItems(prev => 
            prev.map(i => 
              i.id === item.id && i.type === 'quiz' 
                ? { ...i, quiz_details: details }
                : i
            )
          );
        }
      }
    }
    setExpandedItems(newExpanded);
  };

  // Helper function to check if parent Big Lesson is locked
  const isParentBigLessonLocked = (item: ScoreItem, allItems: ScoreItem[]): boolean => {
    if (!item.parent_id || item.level !== 'big_lesson' && item.level !== 'lesson') {
      return false;
    }
    
    const parentBigLesson = allItems.find(parent => 
      parent.type === 'big_lesson' && 
      parent.id === item.parent_id
    );
    
    return parentBigLesson?.is_fixed_weight || false;
  };

  // Get display name based on type
  const getTypeName = (type: string) => {
    switch (type) {
      case 'quiz': return 'ทดสอบ';
      case 'lesson': return 'บทย่อย';
      case 'big_lesson': return 'บทหลัก';
      default: return type;
    }
  };



  // Function to render score items as cards
  const renderScoreItemsCards = () => {
    const cards: JSX.Element[] = [];
    
    // Group items by level and parent
    const subjectLevelItems = scoreItems.filter(item => item.level === 'subject' || !item.level);
    const bigLessonItems = scoreItems.filter(item => item.level === 'big_lesson');
    const lessonItems = scoreItems.filter(item => item.level === 'lesson');
    
    // Render Subject-level quizzes first
    const subjectQuizzes = subjectLevelItems.filter(item => item.type === 'quiz');
    subjectQuizzes.forEach(item => {
      cards.push(renderScoreItemCard(item, 0, false));
    });
    
    // Render Big Lessons and their children
    const bigLessons = subjectLevelItems.filter(item => item.type === 'big_lesson');
    bigLessons.forEach(bigLesson => {
      const bigLessonKey = `big_lesson_${bigLesson.id}`;
      const isExpanded = expandedItems.has(bigLessonKey);
      
      // Find children for this big lesson
      const bigLessonQuiz = bigLessonItems.find(item => 
        item.type === 'quiz' && item.parent_id === bigLesson.id
      );
      const lessons = bigLessonItems.filter(item => 
        item.type === 'lesson' && item.parent_id === bigLesson.id
      );
      
      const hasChildren = !!bigLessonQuiz || lessons.length > 0;
      
      cards.push(renderScoreItemCard(bigLesson, 0, hasChildren, bigLessonKey));
      
      // Show children only if expanded
      if (isExpanded) {
        // Big Lesson Quiz
        if (bigLessonQuiz) {
          cards.push(renderScoreItemCard(bigLessonQuiz, 1, false));
        }
        
        // Lessons in this Big Lesson
        lessons.forEach(lesson => {
          const lessonKey = `lesson_${lesson.id}`;
          const isLessonExpanded = expandedItems.has(lessonKey);
          
          // Find Lesson Quiz
          const lessonQuiz = lessonItems.find(item => 
            item.type === 'quiz' && item.parent_id === lesson.id
          );
          
          const lessonHasChildren = !!lessonQuiz;
          
          cards.push(renderScoreItemCard(lesson, 1, lessonHasChildren, lessonKey));
          
          // Show lesson quiz only if lesson is expanded
          if (isLessonExpanded && lessonQuiz) {
            cards.push(renderScoreItemCard(lessonQuiz, 2, false));
          }
        });
      }
    });
    
    return cards;
  };

  // Function to render individual score item card
  const renderScoreItemCard = (item: ScoreItem, indentLevel: number, hasChildren: boolean = false, itemKey?: string) => {
    const isChild = indentLevel > 0;
    const isExpanded = itemKey ? expandedItems.has(itemKey) : false;
    
    // Determine card styling based on item type and level
    let cardClass = 'score-item-card mb-3';
    if (item.type === 'big_lesson') {
      cardClass += ' big-lesson-card';
    } else if (item.type === 'lesson') {
      cardClass += ' lesson-card';
    } else if (item.type === 'quiz') {
      cardClass += ' quiz-card';
    }
    
    if (isChild) {
      cardClass += ' child-card';
    }
    
    return (
      <div 
        key={`${item.type}-${item.id}-${item.level || 'subject'}`} 
        className={cardClass}
        style={{
          marginLeft: isChild ? `${indentLevel * 2}rem` : '0',
          border: '1px solid #dee2e6',
          borderRadius: '0.5rem'
        }}
      >
        <div className="card-body">
          <div className="row align-items-center">
            {/* Type and Title Column */}
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                {hasChildren && (
                  <button
                    className="btn p-0 me-2 expand-toggle-btn"
                    onClick={() => itemKey && toggleExpanded(itemKey)}
                    title={isExpanded ? 'ยุบรายการ' : 'ขยายรายการ'}
                  >
                    <i className={`fas ${isExpanded ? 'fa-minus-circle' : 'fa-plus-circle'} ${isExpanded ? 'text-danger' : 'text-success'}`}></i>
                  </button>
                )}
                {!hasChildren && isChild && (
                  <span className="me-2 child-indicator">
                    <i className="fas fa-arrow-right text-muted"></i>
                  </span>
                )}
                <span className={`badge badge-sm me-2 ${
                  item.type === 'quiz' ? 'bg-warning text-dark' :
                  item.type === 'lesson' ? 'bg-success' :
                  'bg-info'
                }`}>
                  {getTypeName(item.type)}
                </span>
              </div>
              
              <h6 className="card-title mb-1" title={item.title}>
                {item.title}
              </h6>
              
              {item.quiz_type && (
                <small className="text-muted d-block">
                  {item.quiz_type === 'pre_lesson' ? 'ก่อนเรียน' : 'หลังเรียน'}
                </small>
              )}

            </div>
            
            {/* Score Input Column */}
            <div className="col-md-3">
              <label className="form-label small text-muted">คะแนน</label>
              
              {item.type === 'lesson' && !item.parent_id ? (
                // Lesson ไม่มี Quiz = 0 คะแนน (แสดงผลอ่าน)
                <div className="input-group input-group-sm">
                  <input
                    type="number"
                    className="form-control"
                    value={0}
                    disabled
                    style={{
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      fontSize: '0.875rem',
                    }}
                  />
                  <span className="input-group-text">คะแนน</span>
                  <span className="input-group-text">
                    <i className="fas fa-video text-muted" title="วิดีโอ - ไม่มีคะแนน"></i>
                  </span>
                </div>
              ) : item.type === 'big_lesson' ? (
                // Big Lesson = ผลรวมของ Quiz ภายใน (แสดงผลอ่าน)
                <div className="input-group input-group-sm">
                  <input
                    type="number"
                    className="form-control"
                    value={item.actual_score || 0}
                    disabled
                    style={{
                      backgroundColor: '#e7f3ff',
                      color: '#0066cc',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}
                  />
                  <span className="input-group-text">คะแนน</span>
                  <span className="input-group-text">
                    <i className="fas fa-calculator text-info" title="รวมจาก Quiz ภายใน"></i>
                  </span>
                </div>
              ) : (
                // Quiz = กรอกคะแนนได้
                <div className="input-group input-group-sm">
                  <input
                    type="number"
                    className="form-control"
                    value={item.actual_score || 0}
                    onChange={(e) => handleScoreChange(item.id, Number(e.target.value))}
                    min="0"
                    step="1"
                    style={{
                      backgroundColor: '#fff',
                      color: '#333',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  />
                  <span className="input-group-text">คะแนน</span>
                </div>
              )}
              
              {item.type === 'quiz' && item.actual_score > 0 && (
                <small className="text-success d-block mt-1">
                  <i className="fas fa-percent me-1"></i>
                  = {((item.actual_score / totalScore) * 100).toFixed(1)}% ของวิชา
                </small>
              )}
              
              {/* Quiz Details Breakdown */}
              {item.type === 'quiz' && item.quiz_details && (
                <div className="mt-2 p-2 bg-light rounded quiz-details-box">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted d-block">
                        <i className="fas fa-question-circle me-1 text-info"></i>
                        <strong>จำนวนข้อ:</strong> {item.quiz_details.total_questions} ข้อ
                      </small>
                      <small className="text-muted d-block">
                        <i className="fas fa-trophy me-1 text-warning"></i>
                        <strong>คะแนนเต็ม:</strong> {item.quiz_details.max_score} คะแนน
                      </small>
                    </div>
                    <div className="col-md-6">
                      {item.actual_score > 0 && (() => {
                        const required = calculateRequiredAnswers(item.actual_score, item.quiz_details);
                        return (
                          <small className="text-success d-block">
                            <i className="fas fa-bullseye me-1"></i>
                            <strong>{required.breakdown}</strong>
                          </small>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Questions breakdown */}
                  {item.quiz_details.questions_breakdown.length > 0 && (
                    <div className="mt-2">
                      <small className="text-muted d-block mb-1">
                        <i className="fas fa-list me-1"></i>
                        <strong>รายละเอียดคำถาม:</strong>
                      </small>
                      <div className="questions-breakdown">
                        {item.quiz_details.questions_breakdown.map((q, index) => (
                          <span key={q.question_id} className="badge bg-secondary me-1 mb-1">
                            ข้อ {index + 1}: {q.score} คะแนน
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Loading state for quiz details */}
              {item.type === 'quiz' && !item.quiz_details && isExpanded && (
                <div className="mt-2 p-2 bg-light rounded text-center">
                  <small className="text-muted">
                    <i className="fas fa-spinner fa-spin me-1"></i>
                    กำลังโหลดรายละเอียด Quiz...
                  </small>
                </div>
              )}
            </div>
            
            {/* Lock Toggle Column */}
            <div className="col-md-3">
              <label className="form-label small text-muted">ล็อค</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={item.is_fixed_weight}
                  onChange={() => handleFixedWeightToggle(item.id)}
                  disabled={isParentBigLessonLocked(item, scoreItems) && item.type !== 'big_lesson'}
                />
                <label className="form-check-label">
                  {item.is_fixed_weight ? 'ล็อค' : 'อัตโนมัติ'}
                </label>
              </div>
              {item.type === 'big_lesson' && (
                <small className="d-block text-info">
                  <i className="fas fa-info-circle me-1"></i>
                  รวมคะแนนจาก Quiz ภายใน
                </small>
              )}
              {isParentBigLessonLocked(item, scoreItems) && item.type !== 'big_lesson' && (
                <small className="d-block text-warning">
                  <i className="fas fa-lock me-1"></i>
                  ถูกล็อคโดยบทเรียนหลัก
                </small>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };



  // Fetch score items for the subject
  useEffect(() => {
    fetchScoreItems();
  }, [subject.subject_id]);

  // Calculate scores when items or passing percentage change
  useEffect(() => {
    calculateScores();
  }, [scoreItems, passingPercentage]);

  const fetchScoreItems = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        return;
      }

      const response = await axios.get(
        `${apiURL}/api/subjects/${subject.subject_id}/scores`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setScoreItems(response.data.scoreItems || []);
        // อัปเดตเกณฑ์ผ่านจาก API response
        if (response.data.subject?.passing_percentage !== undefined) {
          setPassingPercentage(response.data.subject.passing_percentage);
        }
      } else {
        setError(response.data.message || "ไม่สามารถโหลดข้อมูลคะแนนได้");
      }
    } catch (err: any) {
      console.error("Error fetching score items:", err);
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลคะแนน");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (itemId: number, newScore: number) => {
    if (newScore < 0) {
      toast.error("คะแนนต้องไม่น้อยกว่า 0");
      return;
    }

    // อัปเดตค่าทันที
    setScoreItems(prev => 
      prev.map(item =>
        item.id === itemId
          ? { ...item, actual_score: newScore }
          : item
      )
    );

    console.log('📝 Score Updated:', { itemId, newScore });
  };

  // ลบ Smart Weight Distribution - ไม่ต้องใช้ในระบบคะแนนจริง

  // ลบฟังก์ชันทั้งหมดที่เกี่ยวข้องกับ Weight Distribution

  const handleFixedWeightToggle = (itemId: number) => {
    setScoreItems(prev => {
      const item = prev.find(i => i.id === itemId);
      if (!item) return prev;
      
      const newFixedState = !item.is_fixed_weight;
      
      // หาก item นี้เป็น Big Lesson และกำลังจะล็อค
      if (item.type === 'big_lesson' && newFixedState) {
        // ล็อค Big Lesson + ล็อคส่วนประกอบภายในทั้งหมด
        return prev.map(i => {
          if (i.id === itemId) {
            return { ...i, is_fixed_weight: newFixedState };
          }
          // ล็อคส่วนประกอบภายใน Big Lesson นี้
          if (i.parent_id === itemId) {
            return { ...i, is_fixed_weight: true };
          }
          return i;
        });
      }
      
      // หาก item นี้เป็น Big Lesson และกำลังจะปลดล็อค
      if (item.type === 'big_lesson' && !newFixedState) {
        // ปลดล็อค Big Lesson + ปลดล็อคส่วนประกอบภายในทั้งหมด
        return prev.map(i => {
          if (i.id === itemId) {
            return { ...i, is_fixed_weight: newFixedState };
          }
          // ปลดล็อคส่วนประกอบภายใน Big Lesson นี้
          if (i.parent_id === itemId) {
            return { ...i, is_fixed_weight: false };
          }
          return i;
        });
      }
      
      // สำหรับ item อื่นๆ
      return prev.map(i =>
        i.id === itemId
          ? { ...i, is_fixed_weight: newFixedState }
          : i
      );
    });
  };

  const handleAutoDistribute = () => {
    const confirmReset = window.confirm(
      "การรีเซ็ตจะล้างคะแนนทั้งหมด (ยกเว้น Quiz ที่ล็อค)\nคุณต้องการดำเนินการต่อหรือไม่?"
    );

    if (!confirmReset) {
      return;
    }

    setScoreItems(prev => 
      prev.map(item => ({
        ...item,
        actual_score: item.is_fixed_weight ? item.actual_score : 0
      }))
    );

    toast.success("รีเซ็ตคะแนนสำเร็จ - กรุณาตั้งคะแนนใหม่");
  };

  // ลบ performFrontendAutoDistribution - ไม่ใช้ในระบบคะแนนจริง

  const handleSaveWeights = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        return;
      }

      // แปลงคะแนนจริงกลับเป็น % สำหรับ Backend API
      const updates = scoreItems.filter(item => item.type === 'quiz').map(item => {
        const percentage = totalScore > 0 ? (item.actual_score / totalScore) * 100 : 0;
        return {
          itemId: item.id,
          itemType: item.type,
          weight: percentage,
          isFixed: item.is_fixed_weight
        };
      });

      console.log('💾 Saving score updates:', { updates, totalScore });
      console.log('🎯 API URL:', `${apiURL}/api/subjects/${subject.subject_id}/scores`);
      console.log('📤 Request payload:', { updates });

      const response = await axios.put(
        `${apiURL}/api/subjects/${subject.subject_id}/scores`,
        { updates },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('📥 Backend response:', response.data);

      if (response.data.success) {
        toast.success("บันทึกน้ำหนักคะแนนสำเร็จ");
        console.log('✅ Save successful, reloading data...');
        // Reload ข้อมูลใหม่หลังบันทึกสำเร็จ
        await fetchScoreItems();
      } else {
        console.error('❌ Save failed:', response.data);
        toast.error(response.data.message || "ไม่สามารถบันทึกน้ำหนักคะแนนได้");
      }
    } catch (err: any) {
      console.error("Error saving weights:", err);
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกน้ำหนักคะแนน");
    }
  };

  const handlePassingPercentageChange = async (newPercentage: number) => {
    if (newPercentage < 0 || newPercentage > 100) {
      toast.error("เกณฑ์ผ่านต้องอยู่ระหว่าง 0-100%");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        return;
      }

      const response = await axios.put(
        `${apiURL}/api/subjects/${subject.subject_id}/passing-criteria`,
        { passing_percentage: newPercentage },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPassingPercentage(newPercentage);
        toast.success("อัปเดตเกณฑ์ผ่านสำเร็จ");
        // Reload ข้อมูลเพื่อยืนยัน
        await fetchScoreItems();
      } else {
        toast.error(response.data.message || "ไม่สามารถอัปเดตเกณฑ์ผ่านได้");
      }
    } catch (err: any) {
      console.error("Error updating passing percentage:", err);
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตเกณฑ์ผ่าน");
    }
  };

  if (isLoading) {
    return (
      <div className="score-management-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
        <p>กำลังโหลดข้อมูลการจัดการคะแนน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="score-management-error">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary" onClick={fetchScoreItems}>
          <i className="fas fa-refresh me-2"></i>
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="score-management-tab">
      <div className="score-management-header">
        <h3>
          <i className="fas fa-percentage me-2"></i>
          จัดการคะแนนรายวิชา
        </h3>
        <p>จัดการน้ำหนักคะแนนและเกณฑ์ผ่านสำหรับ {subject.subject_name}</p>
      </div>

      {/* Passing Criteria Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-bullseye me-2"></i>
            เกณฑ์ผ่าน
          </h5>
        </div>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label htmlFor="passingPercentage" className="form-label">
                เปอร์เซ็นต์ขั้นต่ำที่นักเรียนต้องได้เพื่อผ่าน
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="passingPercentage"
                  className="form-control"
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.01"
                />
                <span className="input-group-text">%</span>
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <button
                className="btn btn-primary"
                onClick={() => handlePassingPercentageChange(passingPercentage)}
              >
                <i className="fas fa-save me-2"></i>
                บันทึกเกณฑ์ผ่าน
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Score Items Management */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="fas fa-weight-hanging me-2"></i>
              จัดการน้ำหนักคะแนน
            </h5>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleAutoDistribute}
                disabled={scoreItems.length === 0}
              >
                <i className="fas fa-undo me-2"></i>
                รีเซ็ตคะแนน
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={handleSaveWeights}
                disabled={totalScore === 0}
              >
                <i className="fas fa-save me-2"></i>
                บันทึกน้ำหนัก
              </button>
            </div>
          </div>
          
          {/* Enhanced Score Summary */}
          <div className="score-summary-modern mb-4">
            <div className="row g-3">
              {/* Total Score Card */}
              <div className="col-lg-4">
                <div className="score-card total-score">
                  <div className="score-icon">
                    <i className="fas fa-calculator"></i>
                  </div>
                  <div className="score-content">
                    <div className="score-label">คะแนนรวม</div>
                    <div className="score-value">{totalScore}</div>
                    <div className="score-unit">คะแนน</div>
                    <div className="score-subtitle">= 100% ของวิชานี้</div>
                  </div>
                </div>
              </div>
              
              {/* Passing Criteria Card */}
              <div className="col-lg-4">
                <div className="score-card passing-criteria">
                  <div className="score-icon">
                    <i className="fas fa-bullseye"></i>
                  </div>
                  <div className="score-content">
                    <div className="score-label">เกณฑ์ผ่าน</div>
                    <div className="score-value">{passingPercentage}%</div>
                    <div className="score-unit">= {requiredScore} คะแนน</div>
                    <div className="score-subtitle">คะแนนขั้นต่ำเพื่อผ่าน</div>
                  </div>
                </div>
              </div>
              
              {/* Status Card */}
              <div className="col-lg-4">
                <div className="score-card status-ready">
                  <div className="score-icon">
                    <i className={`fas ${totalScore > 0 ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                  </div>
                  <div className="score-content">
                    <div className="score-label">สถานะระบบ</div>
                    <div className="score-value">{totalScore > 0 ? 'พร้อมใช้' : 'ยังไม่พร้อม'}</div>
                    <div className="score-unit">{totalScore > 0 ? '✅ ใช้งานได้' : '⚠️ ตั้งคะแนน'}</div>
                    <div className="score-subtitle">{totalScore > 0 ? 'ระบบคำนวณคะแนนปกติ' : 'ต้องกำหนดคะแนนก่อน'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Total Score Progress */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>คะแนนรวม:</span>
              <span className={`fw-bold ${totalScore > 0 ? 'text-success' : 'text-warning'}`}>
                {totalScore} คะแนน
              </span>
            </div>
            <div className="progress">
              <div
                className={`progress-bar ${totalScore > 0 ? 'bg-success' : 'bg-warning'}`}
                role="progressbar"
                style={{ width: totalScore > 0 ? '100%' : '0%' }}
              ></div>
            </div>
            {totalScore === 0 && (
              <small className="text-warning">
                <i className="fas fa-info-circle me-1"></i>
                กรุณาตั้งคะแนนสำหรับ Quiz ต่างๆ
              </small>
            )}
          </div>

          {/* Score Items List */}
          {scoreItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <p className="text-muted">ยังไม่มีรายการคะแนนในวิชานี้</p>
              <p className="text-muted">กรุณาเพิ่มบทเรียนหรือแบบทดสอบก่อน</p>
            </div>
          ) : (
            <div className="score-cards-container">
              {renderScoreItemsCards()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { ScoreManagementTab };
export default ScoreManagementTab;
