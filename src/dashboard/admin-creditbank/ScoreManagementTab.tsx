import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ScoreManagement.css';

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

// Interface for Hierarchical Score Structure
interface BigLesson {
  id: number;
  title: string;
  weight_percentage: number;
  is_fixed_weight: boolean;
  quiz?: {
    id: number;
    title: string;
    percentage: number;
    is_fixed_weight: boolean;
  };
  lessons: Lesson[];
  order_number: number;
  used_percentage?: number;
  remaining_percentage?: number;
  status?: 'complete' | 'incomplete' | 'exceeded';
}

interface Lesson {
  id: number;
  title: string;
  percentage: number;
  is_fixed_weight: boolean;
  has_video: boolean;
  quiz?: {
    id: number;
    title: string;
    percentage: number;
    is_fixed_weight: boolean;
  };
  order_number: number;
}

interface ScoreStructure {
  pre_test?: {
    id: number;
    title: string;
  };
  big_lessons: BigLesson[];
  post_test?: {
    id: number;
    title: string;
    percentage: number;
    is_fixed_weight: boolean;
  };
  total_used: number;
  total_remaining: number;
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

interface ScoreManagementTabProps {
  subject: Subject;
}

const ScoreManagementTab: React.FC<ScoreManagementTabProps> = ({ subject }) => {
  const [scoreStructure, setScoreStructure] = useState<ScoreStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [passingPercentage, setPassingPercentage] = useState<number>(subject.passing_percentage || 80);
  const [expandedBigLessons, setExpandedBigLessons] = useState<Set<number>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());

  const apiURL = import.meta.env.VITE_API_URL;

  // Fixed PercentageInput Component - แก้ไขปัญหา input bug
  const PercentageInput: React.FC<{
    value: number;
    onChange: (newValue: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    placeholder?: string;
  }> = ({ value, onChange, min = 0, max = 100, disabled = false, placeholder = "0" }) => {
    const [inputValue, setInputValue] = useState(value.toString());
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Only update inputValue from prop when not focused
    useEffect(() => {
      if (!isFocused) {
        setInputValue(value.toString());
      }
    }, [value, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Allow empty string and valid numbers
      if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
        setInputValue(newValue);
        
        // ไม่เรียก onChange ทันที รอให้กรอกเสร็จก่อน
        // จะเรียก onChange ใน handleBlur แทน
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      validateAndSubmit();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.blur();
      }
    };

    const validateAndSubmit = () => {
      const numValue = parseFloat(inputValue);
      
      if (isNaN(numValue) || numValue < min) {
        setInputValue(min.toString());
        onChange(min);
      } else if (numValue > max) {
        setInputValue(max.toString());
        onChange(max);
    } else {
        // Format the number properly
        const formatted = numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2);
        setInputValue(formatted);
        // เรียก onChange เมื่อ validate เสร็จแล้วเท่านั้น
        onChange(numValue);
      }
    };

    return (
      <div 
        className="score-table-percentage-input-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          className="score-table-percentage-input"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder={placeholder}
          onClick={(e) => e.stopPropagation()}
        />
        <span 
          className="score-table-percentage-suffix"
          onClick={(e) => e.stopPropagation()}
        >
          %
        </span>
      </div>
    );
  };

  // คำนวณเปอร์เซ็นต์แบบ hierarchical
  const calculateBigLessonProgress = (bigLesson: BigLesson) => {
    const usedPercentage = (bigLesson.quiz?.percentage || 0) + 
      bigLesson.lessons.reduce((sum, lesson) => 
        sum + lesson.percentage + (lesson.quiz?.percentage || 0), 0
      );
    
    const remainingPercentage = bigLesson.weight_percentage - usedPercentage;
    
    let status: 'complete' | 'incomplete' | 'exceeded' = 'incomplete';
    if (usedPercentage === bigLesson.weight_percentage) {
      status = 'complete';
    } else if (usedPercentage > bigLesson.weight_percentage) {
      status = 'exceeded';
    }

    return {
      usedPercentage,
      remainingPercentage,
      status,
      progressText: `ใช้ไป ${usedPercentage}% / เหลือ ${remainingPercentage}%`
    };
  };

  const calculateTotalValidation = () => {
    if (!scoreStructure) return { totalUsed: 0, isValid: false, errors: [] };

    const totalUsed = scoreStructure.big_lessons.reduce((sum, bl) => sum + bl.weight_percentage, 0) +
      (scoreStructure.post_test?.percentage || 0);

    return {
      totalUsed,
      isValid: totalUsed === 100,
      errors: totalUsed > 100 ? [`เกิน 100% (${totalUsed}%)`] : 
              totalUsed < 100 ? [`ไม่ครบ 100% (${totalUsed}%)`] : []
    };
  };

  // Toggle functions - ทำให้ collapse ใช้งานง่ายขึ้น
  const toggleBigLesson = (bigLessonId: number) => {
    setExpandedBigLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bigLessonId)) {
        newSet.delete(bigLessonId);
      } else {
        newSet.add(bigLessonId);
      }
      return newSet;
    });
  };

  const toggleLesson = (lessonId: number) => {
    setExpandedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  // Handler functions
  const handleBigLessonUpdate = (bigLessonId: number, newValue: number) => {
    if (!scoreStructure) return;
    
    setScoreStructure(prev => {
      if (!prev) return prev;
      
      const updatedBigLessons = prev.big_lessons.map(bl => 
        bl.id === bigLessonId ? { ...bl, weight_percentage: newValue } : bl
      );
      
      return { ...prev, big_lessons: updatedBigLessons };
    });
  };

  const handleQuizUpdate = (parentId: number, type: 'big_lesson' | 'lesson', newValue: number) => {
    if (!scoreStructure) return;
    
    setScoreStructure(prev => {
      if (!prev) return prev;
      
      if (type === 'big_lesson') {
        const updatedBigLessons = prev.big_lessons.map(bl => 
          bl.id === parentId && bl.quiz ? 
            { ...bl, quiz: { ...bl.quiz, percentage: newValue } } : bl
        );
        return { ...prev, big_lessons: updatedBigLessons };
      } else {
        const updatedBigLessons = prev.big_lessons.map(bl => ({
          ...bl,
          lessons: bl.lessons.map(lesson => 
            lesson.id === parentId && lesson.quiz ?
              { ...lesson, quiz: { ...lesson.quiz, percentage: newValue } } : lesson
          )
        }));
        return { ...prev, big_lessons: updatedBigLessons };
      }
    });
  };

  const handleLessonUpdate = (lessonId: number, newValue: number) => {
    if (!scoreStructure) return;
    
    setScoreStructure(prev => {
      if (!prev) return prev;
      
      const updatedBigLessons = prev.big_lessons.map(bl => ({
        ...bl,
        lessons: bl.lessons.map(lesson => 
          lesson.id === lessonId ? { ...lesson, percentage: newValue } : lesson
        )
      }));
      
      return { ...prev, big_lessons: updatedBigLessons };
    });
  };

  const handlePostTestUpdate = (newValue: number) => {
    if (!scoreStructure || !scoreStructure.post_test) return;
    
    setScoreStructure(prev => {
      if (!prev || !prev.post_test) return prev;
      
      return {
        ...prev,
        post_test: { ...prev.post_test, percentage: newValue }
      };
    });
  };

  // API functions
  const fetchScoreStructure = async () => {
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
        setScoreStructure(response.data.scoreStructure || null);
        if (response.data.subject?.passing_percentage !== undefined) {
          setPassingPercentage(response.data.subject.passing_percentage);
        }
      } else {
        setError(response.data.message || "ไม่สามารถโหลดข้อมูลคะแนนได้");
      }
    } catch (err: any) {
      console.error("Error fetching score structure:", err);
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลคะแนน");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHierarchicalScores = async () => {
    if (!scoreStructure) {
      toast.error("ไม่พบข้อมูลโครงสร้างคะแนนที่จะบันทึก");
      return;
    }

    const validation = calculateTotalValidation();
    if (!validation.isValid) {
      toast.error(`ไม่สามารถบันทึกได้: ${validation.errors.join(', ')}`);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        return;
      }

      setIsSaving(true);

      const payload = {
        updates: {
          big_lessons: scoreStructure.big_lessons.map(bl => ({
            id: bl.id,
            weight_percentage: bl.weight_percentage,
            is_fixed_weight: bl.is_fixed_weight,
            quiz: bl.quiz ? {
              id: bl.quiz.id,
              percentage: bl.quiz.percentage,
              is_fixed_weight: bl.quiz.is_fixed_weight
            } : null,
            lessons: bl.lessons.map(lesson => ({
              id: lesson.id,
              percentage: lesson.percentage,
              is_fixed_weight: lesson.is_fixed_weight,
              quiz: lesson.quiz ? {
                id: lesson.quiz.id,
                percentage: lesson.quiz.percentage,
                is_fixed_weight: lesson.quiz.is_fixed_weight
              } : null
            }))
          })),
          post_test: scoreStructure.post_test ? {
            id: scoreStructure.post_test.id,
            percentage: scoreStructure.post_test.percentage,
            is_fixed_weight: scoreStructure.post_test.is_fixed_weight
          } : null
        }
      };

      console.log("บันทึกข้อมูลคะแนน:", payload);
      console.log("🎯 Sending request to:", `${apiURL}/api/subjects/${subject.subject_id}/scores-hierarchical`);
      console.log("📝 Payload:", JSON.stringify(payload, null, 2));

      const response = await axios.put(
        `${apiURL}/api/subjects/${subject.subject_id}/scores-hierarchical`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("✅ Response received:", response.data);

      if (response.data.success) {
        toast.success("บันทึกข้อมูลคะแนนสำเร็จ");
        await fetchScoreStructure();
      } else {
        console.error("❌ Backend error:", response.data);
        toast.error(response.data.message || "ไม่สามารถบันทึกข้อมูลคะแนนได้");
      }
    } catch (err: any) {
      console.error('❌ Error saving hierarchical scores:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error message:', err.message);
      
      if (err.response?.status === 400) {
        toast.error(`ข้อมูลไม่ถูกต้อง: ${err.response.data?.message || 'กรุณาตรวจสอบข้อมูลที่กรอก'}`);
      } else if (err.response?.status === 403) {
        toast.error('ไม่มีสิทธิ์แก้ไขข้อมูลคะแนนของวิชานี้');
      } else if (err.response?.status === 404) {
        toast.error('ไม่พบวิชาที่ระบุ');
      } else {
        toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลคะแนน");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoDistribute = async () => {
    if (!scoreStructure) {
      toast.error("ไม่พบข้อมูลโครงสร้างคะแนน");
      return;
    }

    const confirmReset = window.confirm(
      "การแบ่งน้ำหนักอัตโนมัติจะปรับเปอร์เซ็นต์ให้เท่ากันทุกหน่วย\nคุณต้องการดำเนินการต่อหรือไม่?"
    );

    if (!confirmReset) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        return;
      }

      console.log("เริ่มแบ่งน้ำหนักอัตโนมัติสำหรับวิชา:", subject.subject_name);
      toast.info("กำลังแบ่งน้ำหนักอัตโนมัติ...");

      const response = await axios.post(
        `${apiURL}/api/subjects/${subject.subject_id}/auto-distribute`,
        { 
          resetBeforeDistribute: true,
          subject_id: subject.subject_id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("ผลลัพธ์ auto-distribute:", response.data);

      if (response.data.success) {
        toast.success("แบ่งน้ำหนักอัตโนมัติสำเร็จ - กระจายเปอร์เซ็นต์เท่าๆ กันให้ทุกหน่วย");
        await fetchScoreStructure();
      } else {
        toast.error(response.data.message || "ไม่สามารถแบ่งน้ำหนักอัตโนมัติได้");
      }
    } catch (error: any) {
      console.error('Error auto-distributing:', error);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการแบ่งน้ำหนักอัตโนมัติ");
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

      console.log("อัปเดตเกณฑ์ผ่าน:", newPercentage, "% สำหรับวิชา:", subject.subject_name);

      const response = await axios.put(
        `${apiURL}/api/subjects/${subject.subject_id}/passing-criteria`,
        { 
          passing_percentage: newPercentage,
          auto_distribute_score: subject.auto_distribute_score || false 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPassingPercentage(newPercentage);
        toast.success(`อัปเดตเกณฑ์ผ่านเป็น ${newPercentage}% สำเร็จ - จะใช้กับแบบทดสอบทั้งหมดในวิชานี้`);
        await fetchScoreStructure();
      } else {
        toast.error(response.data.message || "ไม่สามารถอัปเดตเกณฑ์ผ่านได้");
      }
    } catch (err: any) {
      console.error("Error updating passing percentage:", err);
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตเกณฑ์ผ่าน");
    }
  };

  // useEffect hooks
  useEffect(() => {
    fetchScoreStructure();
  }, [subject.subject_id]);

  useEffect(() => {
    if (scoreStructure) {
      const validation = calculateTotalValidation();
      setScoreStructure(prev => prev ? {
        ...prev,
        total_used: validation.totalUsed,
        total_remaining: 100 - validation.totalUsed,
        is_valid: validation.isValid,
        errors: validation.errors
      } : null);
    }
  }, [scoreStructure?.big_lessons, scoreStructure?.post_test]);

  // Loading state
  if (isLoading) {
    return (
      <div className="score-table">
        <div className="score-table-loading">
          <div className="score-table-loading-spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="score-table">
        <div className="score-table-error">
          <div className="score-table-error-icon">⚠️</div>
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{error}</p>
          <button 
            className="score-table-error-btn"
            onClick={() => fetchScoreStructure()}
          >
          ลองใหม่
        </button>
        </div>
      </div>
    );
  }

  const validation = calculateTotalValidation();

  return (
    <div className="score-table">
      {/* Header */}
      <div className="score-table-header">
        <div className="score-table-header-icon">
          📊
        </div>
        <div className="score-table-header-content">
          <h1>จัดการคะแนนรายวิชา</h1>
          <p>จัดการน้ำหนักคะแนนและเกณฑ์ผ่านสำหรับ <strong>{subject.subject_name}</strong></p>
        </div>
      </div>

      {/* Passing Criteria Section */}
      <div className="score-table-criteria-section">
        <h2>🎯 เกณฑ์การผ่าน</h2>
        <div className="score-table-criteria-form">
          <label>เปอร์เซ็นต์ขั้นต่ำที่นักเรียนต้องได้เพื่อผ่าน</label>
          <div className="score-table-criteria-input-group">
                <input
                  type="number"
              className="score-table-criteria-input"
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.01"
                />
            <span>%</span>
              </div>
              <button
            className="score-table-criteria-btn"
                onClick={() => handlePassingPercentageChange(passingPercentage)}
              >
            💾 บันทึกเกณฑ์ผ่าน
              </button>
        </div>
      </div>

      {/* Score Management Section */}
      <div className="score-table-management-section">
        <div className="score-table-management-header">
          <h2>⚖️ จัดการน้ำหนักคะแนน</h2>
          <div className="score-table-management-actions">
              <button
              className="score-table-action-btn"
                onClick={handleAutoDistribute}
              disabled={!scoreStructure}
              >
              ✨ แบ่งอัตโนมัติ
              </button>
              <button
              className="score-table-action-btn score-table-action-btn-primary"
              onClick={handleSaveHierarchicalScores}
              disabled={!scoreStructure || isSaving}
            >
              {isSaving ? '🔄 กำลังบันทึก...' : '💾 บันทึกน้ำหนัก'}
            </button>
            <button
              className="score-table-action-btn"
              onClick={() => {
                if (scoreStructure) {
                  const allBigLessonIds = new Set(scoreStructure.big_lessons.map(bl => bl.id));
                  setExpandedBigLessons(allBigLessonIds);
                  const allLessonIds = new Set(
                    scoreStructure.big_lessons.flatMap(bl => bl.lessons.map(l => l.id))
                  );
                  setExpandedLessons(allLessonIds);
                }
              }}
            >
              📖 ขยายทั้งหมด
            </button>
            <button
              className="score-table-action-btn"
              onClick={() => {
                setExpandedBigLessons(new Set());
                setExpandedLessons(new Set());
              }}
            >
              📕 ยุบทั้งหมด
              </button>
            </div>
          </div>
          
        {/* Summary */}
        <div className="score-table-summary">
          <div className="score-table-summary-content">
            <div className="score-table-summary-text">
              📈 สรุปน้ำหนักคะแนนรวม: {validation.totalUsed}%
                  </div>
            <div className={`score-table-summary-badge ${validation.isValid ? 'score-table-summary-badge-valid' : 'score-table-summary-badge-invalid'}`}>
              {validation.isValid ? '✅ ถูกต้อง' : '❌ ผิดพลาด'}
                  </div>
                </div>
          <div className="score-table-summary-progress">
            <div 
              className={`score-table-summary-progress-bar ${validation.isValid ? 'score-table-summary-progress-bar-valid' : 'score-table-summary-progress-bar-invalid'}`}
              style={{ width: `${Math.min(validation.totalUsed, 100)}%` }}
            ></div>
          </div>
          {!validation.isValid && (
            <div className="score-table-summary-error">
              ⚠️ {validation.errors.join(', ')}
            </div>
          )}
              </div>
              
        {/* Score Items */}
        <div className="score-table-score-items">
          {/* Pre-test */}
          {scoreStructure?.pre_test && (
            <div className="score-table-score-item score-table-score-item-pretest">
              <div className="score-table-score-item-header">
                <div className="score-table-score-item-icon">🔍</div>
                <div className="score-table-score-item-info">
                  <h3 className="score-table-score-item-title">{scoreStructure.pre_test.title}</h3>
                  <p className="score-table-score-item-subtitle">แบบทดสอบก่อนเรียน</p>
                  </div>
                <div className="score-table-score-item-badge">ไม่นับคะแนน</div>
              </div>
            </div>
          )}

          {/* Big Lessons */}
          {scoreStructure?.big_lessons.map((bigLesson, index) => {
            const progress = calculateBigLessonProgress(bigLesson);
            const isExpanded = expandedBigLessons.has(bigLesson.id);
            const hasContent = bigLesson.quiz || bigLesson.lessons.length > 0;

            return (
              <div key={bigLesson.id} className="score-table-score-item score-table-score-item-big-lesson">
                <div 
                  className="score-table-score-item-header score-table-score-item-header-clickable"
                  onClick={(e) => {
                    // ไม่ให้คลิกที่ header ถ้าคลิกที่ input หรือ controls
                    const target = e.target as HTMLElement;
                    if (!target.closest('.score-table-percentage-control') && !target.closest('.score-table-percentage-input-wrapper')) {
                      hasContent && toggleBigLesson(bigLesson.id);
                    }
                  }}
                >
                  <div 
                    className="score-table-score-item-icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📚
                  </div>
                  <div 
                    className="score-table-score-item-info"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="score-table-score-item-title">หน่วยที่ {index + 1}: {bigLesson.title}</h3>
                    <p className="score-table-score-item-subtitle">{progress.progressText}</p>
                  </div>
                  <div 
                    className="score-table-score-item-controls"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {hasContent && (
                      <div 
                        className="score-table-collapse-indicator"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBigLesson(bigLesson.id);
                        }}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </div>
                    )}
                    <div 
                      className="score-table-percentage-control"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div 
                        className="score-table-percentage-label"
                        onClick={(e) => e.stopPropagation()}
                      >
                        น้ำหนักหน่วย
                      </div>
                      <PercentageInput 
                        value={bigLesson.weight_percentage}
                        onChange={(newValue) => handleBigLessonUpdate(bigLesson.id, newValue)}
                      />
                    </div>
                    <div 
                      className={`score-table-status-indicator score-table-status-indicator-${progress.status}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {progress.status === 'complete' ? '✅ สมบูรณ์' : 
                       progress.status === 'exceeded' ? '❌ เกิน' : '⏳ ไม่ครบ'}
                  </div>
                </div>
              </div>
              
                {/* Sub Items */}
                {hasContent && isExpanded && (
                  <div className="score-table-score-sub-items">
                    {/* BigLesson Quiz */}
                    {bigLesson.quiz && (
                      <div className="score-table-score-sub-item score-table-score-sub-item-quiz">
                        <div className="score-table-score-sub-item-header">
                          <div 
                            className="score-table-score-sub-item-icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            📝
                  </div>
                          <div 
                            className="score-table-score-item-info"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <h4 className="score-table-score-item-title">แบบทดสอบหน่วย: {bigLesson.title}</h4>
                            <p className="score-table-score-item-subtitle">Quiz ประจำหน่วยการเรียนรู้</p>
                  </div>
                          <div 
                            className="score-table-percentage-control"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div 
                              className="score-table-percentage-label"
                              onClick={(e) => e.stopPropagation()}
                            >
                              น้ำหนักแบบทดสอบ
                </div>
                            <PercentageInput 
                              value={bigLesson.quiz.percentage}
                              onChange={(newValue) => handleQuizUpdate(bigLesson.id, 'big_lesson', newValue)}
                            />
              </div>
            </div>
          </div>
                    )}

                    {/* Lessons */}
                    {bigLesson.lessons.map((lesson, lessonIndex) => {
                      const isLessonExpanded = expandedLessons.has(lesson.id);
                      const hasQuiz = !!lesson.quiz;

                      return (
                        <div key={lesson.id}>
                          <div className="score-table-score-sub-item score-table-score-sub-item-lesson">
                            <div 
                              className="score-table-score-sub-item-header score-table-score-sub-item-header-clickable"
                              onClick={(e) => {
                                // ไม่ให้คลิกที่ header ถ้าคลิกที่ input หรือ controls
                                const target = e.target as HTMLElement;
                                if (!target.closest('.score-table-percentage-control') && !target.closest('.score-table-percentage-input-wrapper')) {
                                  hasQuiz && toggleLesson(lesson.id);
                                }
                              }}
                            >
                              <div className="score-table-score-sub-item-icon">
                                {lesson.has_video ? '🎥' : '📄'}
        </div>
                              <div 
                                className="score-table-score-item-info"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <h4 className="score-table-score-item-title">
                                  บทเรียนที่ {lessonIndex + 1}: {lesson.title}
                                </h4>
                                <p className="score-table-score-item-subtitle">
                                  {lesson.has_video ? 'บทเรียนวิดีโอ' : 'บทเรียนเอกสาร'}
                                  {hasQuiz && ' + แบบทดสอบ'}
                                </p>
            </div>
                              <div 
                                className="score-table-score-item-controls"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {hasQuiz && (
                                  <div 
                                    className="score-table-collapse-indicator"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleLesson(lesson.id);
                                    }}
                                  >
                                    {isLessonExpanded ? '▼' : '▶'}
            </div>
                                )}
                                <div 
                                  className="score-table-percentage-control"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div 
                                    className="score-table-percentage-label"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    น้ำหนักบทเรียน
                                  </div>
                                  <PercentageInput 
                                    value={lesson.percentage}
                                    onChange={(newValue) => handleLessonUpdate(lesson.id, newValue)}
                                  />
                                </div>
                              </div>
                            </div>
          </div>

                          {/* Lesson Quiz */}
                          {hasQuiz && isLessonExpanded && (
                            <div className="score-table-score-sub-item score-table-score-sub-item-quiz score-table-score-sub-item-nested">
                              <div className="score-table-score-sub-item-header">
                                <div className="score-table-score-sub-item-icon">📋</div>
                                <div 
                                  className="score-table-score-item-info"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <h4 className="score-table-score-item-title">แบบทดสอบบทเรียน: {lesson.title}</h4>
                                  <p className="score-table-score-item-subtitle">Quiz ประจำบทเรียน</p>
            </div>
                                <div 
                                  className="score-table-percentage-control"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div 
                                    className="score-table-percentage-label"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    น้ำหนักแบบทดสอบ
                                  </div>
                                  <PercentageInput 
                                    value={lesson.quiz?.percentage || 0}
                                    onChange={(newValue) => handleQuizUpdate(lesson.id, 'lesson', newValue)}
                                  />
                                </div>
                              </div>
            </div>
          )}
        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Post-test */}
          {scoreStructure?.post_test && (
            <div className="score-table-score-item score-table-score-item-posttest">
              <div className="score-table-score-item-header">
                <div className="score-table-score-item-icon">🏁</div>
                <div 
                  className="score-table-score-item-info"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="score-table-score-item-title">{scoreStructure.post_test.title}</h3>
                  <p className="score-table-score-item-subtitle">แบบทดสอบหลังเรียน</p>
                </div>
                <div 
                  className="score-table-percentage-control"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div 
                    className="score-table-percentage-label"
                    onClick={(e) => e.stopPropagation()}
                  >
                    น้ำหนักแบบทดสอบ
                  </div>
                  <PercentageInput 
                    value={scoreStructure.post_test.percentage}
                    onChange={(newValue) => handlePostTestUpdate(newValue)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreManagementTab;
