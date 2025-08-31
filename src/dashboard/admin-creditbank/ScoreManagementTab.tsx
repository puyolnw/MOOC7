import React, { useState, useEffect } from 'react';
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
    relative_percentage?: number;
  };
  lessons: Lesson[];
  order_number: number;
  created_at?: string;
  updated_at?: string;
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
    relative_percentage?: number;
  };
  order_number: number;
  created_at?: string;
  updated_at?: string;
  relative_percentage?: number;
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
  const [isAutoDistributing, setIsAutoDistributing] = useState(false);
  const [passingPercentage, setPassingPercentage] = useState<number>(subject.passing_percentage || 80);
  const [expandedBigLessons, setExpandedBigLessons] = useState<Set<number>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());

  const apiURL = import.meta.env.VITE_API_URL;

    // Progress Bar Component
  const ProgressBar: React.FC<{
    usedScore: number;
    totalScore: number;
    status: 'complete' | 'incomplete' | 'exceeded';
    type?: 'big-lesson' | 'lesson' | 'quiz';
    segments?: Array<{
      percentage: number;
      color: string;
      label: string;
    }>;
  }> = ({ usedScore, totalScore, status, type = 'big-lesson', segments }) => {
    const percentage = totalScore > 0 ? Math.min((usedScore / totalScore) * 100, 100) : 0;
    
    return (
      <div className="score-progress-container">
        <div className="score-progress-bar">
          {segments ? (
            // แสดงหลายสีตาม segments
            segments.map((segment, index) => (
              <div
                key={index}
                className="score-progress-segment"
                style={{
                  width: `${segment.percentage}%`,
                  background: segment.color,
                  left: `${segments.slice(0, index).reduce((sum, s) => sum + s.percentage, 0)}%`
                }}
                title={`${segment.label}: ${segment.percentage}%`}
              />
            ))
          ) : (
            // แสดงสีเดียวแบบเดิม
            <div 
              className={`score-progress-bar-fill score-progress-bar-${status} score-progress-bar-${type}`}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
               <div className="score-progress-text">
         {Math.round(percentage)}% ({usedScore}/{totalScore}%)
       </div>
      </div>
    );
  };



  // Simple PercentageInput Component
  const PercentageInput: React.FC<{
    value: number;
    onChange: (newValue: number) => void;
    disabled?: boolean;
    placeholder?: string;
    showStatus?: boolean;
    status?: 'complete' | 'incomplete' | 'exceeded';
  }> = ({ value, onChange, disabled = false, placeholder = "0", showStatus = false, status = 'incomplete' }) => {
    const [inputValue, setInputValue] = useState(value.toString());
    const [isFocused, setIsFocused] = useState(false);

    // อัปเดต inputValue เมื่อ value เปลี่ยน (เฉพาะเมื่อไม่ได้ focus)
    useEffect(() => {
      if (!isFocused) {
        setInputValue(value.toString());
      }
    }, [value, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      
      // คำนวณเมื่อ user กดออกจากช่อง
      if (inputValue === '') {
        onChange(0);
      } else {
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          onChange(numValue);
        } else {
          onChange(0);
        }
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'complete': return '✅';
        case 'exceeded': return '❌';
        default: return '⏳';
      }
    };

    return (
      <div 
        className="score-table-percentage-input-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <input
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
        {showStatus && (
          <span 
            className="score-table-percentage-status"
            onClick={(e) => e.stopPropagation()}
          >
            {getStatusText()}
          </span>
        )}
      </div>
    );
  };





  // Handler functions for raw percentage updates (ช่องกรอกค่าเฉยๆ)
  const handleLessonPercentageUpdate = (lessonId: number, newValue: number) => {
    if (!scoreStructure) return;
    
    setScoreStructure(prev => {
      if (!prev) return prev;
      
      const updated = {...prev};
      
      for (const bigLesson of updated.big_lessons) {
        const lesson = bigLesson.lessons.find(l => l.id === lessonId);
        if (lesson) {
          lesson.percentage = newValue;
          // อัปเดตแบบทดสอบบทเรียนเป็น 100% อัตโนมัติ
          if (lesson.quiz) {
            lesson.quiz.percentage = 100;
          }
          break;
        }
      }
      
      return updated;
    });
  };

  const handleLessonQuizPercentageUpdate = (lessonId: number, newValue: number) => {
    if (!scoreStructure) return;
    
    setScoreStructure(prev => {
      if (!prev) return prev;
      
      const updated = {...prev};
      
      for (const bigLesson of updated.big_lessons) {
        const lesson = bigLesson.lessons.find(l => l.id === lessonId);
        if (lesson && lesson.quiz) {
          lesson.quiz.percentage = newValue;
          break;
        }
      }
      
      return updated;
    });
  };

  const handleBigLessonQuizPercentageUpdate = (bigLessonId: number, newValue: number) => {
    if (!scoreStructure) return;
    
    setScoreStructure(prev => {
      if (!prev) return prev;
      
      const updated = {...prev};
      
      const bigLesson = updated.big_lessons.find(bl => bl.id === bigLessonId);
      if (bigLesson && bigLesson.quiz) {
        bigLesson.quiz.percentage = newValue;
      }
      
      return updated;
    });
  };

  // คำนวณเปอร์เซ็นต์แบบ hierarchical ตาม logic ที่ถูกต้อง
  const calculateBigLessonProgress = (bigLesson: BigLesson) => {
    // คำนวณคะแนนที่ใช้ภายในหน่วย (เป็นเปอร์เซ็นต์ของหน่วยนั้น)
    // แบบทดสอบท้ายหน่วย + บทเรียนย่อย (ไม่รวมแบบทดสอบบทเรียน เพราะจะไม่เอาไปบวกกับหน่วย)
    const totalInternalPercentage = (bigLesson.quiz?.percentage || 0) + 
      bigLesson.lessons.reduce((sum, lesson) => 
        sum + lesson.percentage, 0  // รวม lesson.percentage เพราะเป็นสัดส่วนในหน่วย
      );
    
    // คำนวณคะแนนจริงที่ใช้ (แปลงจากเปอร์เซ็นต์เป็นคะแนน)
    const actualUsedScore = (totalInternalPercentage / 100) * bigLesson.weight_percentage;
    
    const remainingScore = bigLesson.weight_percentage - actualUsedScore;
    
    let status: 'complete' | 'incomplete' | 'exceeded' = 'incomplete';
    if (Math.abs(totalInternalPercentage - 100) < 0.01) {
      status = 'complete';
    } else if (totalInternalPercentage > 100) {
      status = 'exceeded';
    }

    return {
      usedPercentage: Math.round(actualUsedScore * 100) / 100,
      remainingPercentage: Math.round(remainingScore * 100) / 100,
      internalPercentage: Math.round(totalInternalPercentage * 100) / 100,
      status,
      progressText: `${Math.round(totalInternalPercentage * 100) / 100}% ของหน่วย (${Math.round(actualUsedScore * 100) / 100}/${bigLesson.weight_percentage} คะแนน)`
    };
  };

  // คำนวณคะแนนดิบของแต่ละส่วน
  const calculateRawScore = (percentage: number, baseScore: number) => {
    return Math.round((percentage / 100) * baseScore * 100) / 100;
  };

  // คำนวณคะแนนดิบของบทเรียน
  const calculateLessonRawScore = (lesson: Lesson, bigLessonWeight: number) => {
    return calculateRawScore(lesson.percentage, bigLessonWeight);
  };

  // คำนวณคะแนนดิบของแบบทดสอบบทเรียน
  const calculateLessonQuizRawScore = (lesson: Lesson, bigLessonWeight: number) => {
    if (!lesson.quiz) return 0;
    return calculateRawScore(lesson.quiz.percentage, calculateLessonRawScore(lesson, bigLessonWeight));
  };

  // คำนวณคะแนนดิบของแบบทดสอบท้ายหน่วย
  const calculateBigLessonQuizRawScore = (bigLesson: BigLesson) => {
    if (!bigLesson.quiz) return 0;
    return calculateRawScore(bigLesson.quiz.percentage, bigLesson.weight_percentage);
  };

  const calculateTotalValidation = () => {
    if (!scoreStructure) return { totalUsed: 0, isValid: false, errors: [] };

    // คำนวณคะแนนรวมจาก big lessons และ post test
    const totalUsed = scoreStructure.big_lessons.reduce((sum, bl) => sum + bl.weight_percentage, 0) +
      (scoreStructure.post_test?.percentage || 0);

    // ตรวจสอบว่าแต่ละ big lesson มีการกระจายคะแนนภายในถูกต้องหรือไม่
    const bigLessonErrors: string[] = [];
    scoreStructure.big_lessons.forEach((bl, index) => {
      const internalTotal = (bl.quiz?.percentage || 0) + 
        bl.lessons.reduce((sum, lesson) => 
          sum + lesson.percentage, 0  // รวม lesson.percentage เพราะเป็นสัดส่วนในหน่วย
        );
      
      if (Math.abs(internalTotal - 100) > 0.01) {
        bigLessonErrors.push(`หน่วยที่ ${index + 1}: ${internalTotal.toFixed(1)}% (ควรเป็น 100%)`);
      }
    });

    const errors = [
      ...(totalUsed > 100 ? [`เกิน 100% (${totalUsed}%)`] : 
          totalUsed < 100 ? [`ไม่ครบ 100% (${totalUsed}%)`] : []),
      ...bigLessonErrors
    ];

    return {
      totalUsed,
      isValid: totalUsed === 100 && bigLessonErrors.length === 0,
      errors
    };
  };

  // Toggle functions - ทำให้ collapse ใช้งานง่ายขึ้น
  const toggleBigLesson = (bigLessonId: number) => {
    setExpandedBigLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bigLessonId)) {
        newSet.delete(bigLessonId);
        // ปิด collapse ของบทเรียนทั้งหมดในหน่วยนี้ด้วย
        setExpandedLessons(prevLessons => {
          const newLessonsSet = new Set(prevLessons);
          const bigLesson = scoreStructure?.big_lessons.find(bl => bl.id === bigLessonId);
          if (bigLesson) {
            bigLesson.lessons.forEach(lesson => {
              newLessonsSet.delete(lesson.id);
            });
          }
          return newLessonsSet;
        });
      } else {
        newSet.add(bigLessonId);
        // เปิด collapse ของบทเรียนทั้งหมดในหน่วยนี้ด้วย
        setExpandedLessons(prevLessons => {
          const newLessonsSet = new Set(prevLessons);
          const bigLesson = scoreStructure?.big_lessons.find(bl => bl.id === bigLessonId);
          if (bigLesson) {
            bigLesson.lessons.forEach(lesson => {
              if (lesson.quiz) {
                newLessonsSet.add(lesson.id);
              }
            });
          }
          return newLessonsSet;
        });
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
        const loadedStructure = response.data.scoreStructure || null;
        if (loadedStructure) {
          // เรียงลำดับข้อมูลตาม id (ง่ายและแน่นอน)
          loadedStructure.big_lessons.sort((a: any, b: any) => a.id - b.id);
          
          // เรียงลำดับ lessons ในแต่ละ big_lesson ตาม id
          loadedStructure.big_lessons.forEach((bigLesson: any) => {
            bigLesson.lessons.sort((a: any, b: any) => a.id - b.id);
          });
        }
        setScoreStructure(loadedStructure);
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
      setIsAutoDistributing(true);
      
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
    } finally {
      setIsAutoDistributing(false);
    }
  };

  // Export JSON function
  const handleExportJSON = () => {
    if (!scoreStructure) {
      toast.error("ไม่พบข้อมูลโครงสร้างคะแนน");
      return;
    }

    const exportData = {
      subject: {
        id: subject.subject_id,
        name: subject.subject_name,
        code: subject.subject_code
      },
      passing_percentage: passingPercentage,
      score_structure: {
        pre_test: scoreStructure.pre_test ? {
          id: scoreStructure.pre_test.id,
          title: scoreStructure.pre_test.title,
          percentage: 0, // ไม่นับคะแนน
          score: 0
        } : null,
        big_lessons: scoreStructure.big_lessons.map((bl, index) => ({
          id: bl.id,
          title: bl.title,
          unit_number: index + 1,
          weight_percentage: bl.weight_percentage,
          score: bl.weight_percentage, // คะแนนจริง
          quiz: bl.quiz ? {
            id: bl.quiz.id,
            title: bl.quiz.title,
            percentage: bl.quiz.percentage,
            score: (bl.quiz.percentage / 100) * bl.weight_percentage
          } : null,
          lessons: bl.lessons.map((lesson, lessonIndex) => ({
            id: lesson.id,
            title: lesson.title,
            lesson_number: lessonIndex + 1,
            percentage: lesson.percentage,
            score: 0, // บทเรียน = 0 คะแนน
            quiz: lesson.quiz ? {
              id: lesson.quiz.id,
              title: lesson.quiz.title,
              percentage: lesson.quiz.percentage,
              score: (lesson.quiz.percentage / 100) * (lesson.percentage / 100) * bl.weight_percentage
            } : null
          }))
        })),
        post_test: scoreStructure.post_test ? {
          id: scoreStructure.post_test.id,
          title: scoreStructure.post_test.title,
          percentage: scoreStructure.post_test.percentage,
          score: scoreStructure.post_test.percentage
        } : null,
        total_score: 100,
        total_used: validation.totalUsed
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `score_structure_${subject.subject_code}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("ส่งออก JSON สำเร็จ");
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
  // ใช้ข้อมูลจาก scoreStructure โดยตรง ไม่มีการคำนวณอัตโนมัติ
  const sortedData = scoreStructure;

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
                 disabled={!scoreStructure || isAutoDistributing}
               >
                 {isAutoDistributing ? '🔄 กำลังแบ่ง...' : '✨ แบ่งอัตโนมัติ'}
               </button>
               <button
               className="score-table-action-btn"
               onClick={handleExportJSON}
               disabled={!scoreStructure}
             >
               📥 ส่งออก JSON
               </button>
               <button
               className="score-table-action-btn score-table-action-btn-primary"
               onClick={handleSaveHierarchicalScores}
               disabled={!scoreStructure || isSaving}
             >
               {isSaving ? '🔄 กำลังบันทึก...' : '💾 บันทึกน้ำหนัก'}
               </button>
             </div>
          </div>
          
        {/* Summary */}
        <div className="score-table-summary">
          <div className="score-table-summary-content">
            <div className="score-table-summary-text">
              📈 สรุปน้ำหนักคะแนนรวม: {validation.totalUsed}% (จากทั้งหมด 100%)
            </div>
            <div className={`score-table-summary-badge ${validation.isValid ? 'score-table-summary-badge-valid' : 'score-table-summary-badge-invalid'}`}>
              {validation.isValid ? '✅ ถูกต้อง' : '❌ ผิดพลาด'}
            </div>
          </div>
          <div className="score-table-summary-progress">
            <div className="score-progress-bar">
              {scoreStructure?.big_lessons.map((bigLesson, index) => (
                <div
                  key={`big-lesson-${bigLesson.id}`}
                  className="score-progress-segment"
                  style={{
                    width: `${bigLesson.weight_percentage}%`,
                    background: 'linear-gradient(90deg, #007bff, #0056b3)',
                    left: `${scoreStructure.big_lessons.slice(0, index).reduce((sum, bl) => sum + bl.weight_percentage, 0)}%`
                  }}
                  title={`หน่วยที่ ${index + 1}: ${bigLesson.title} - ${bigLesson.weight_percentage}%`}
                />
              ))}
       {scoreStructure?.post_test && (
  <div
    className="score-progress-segment"
    style={{
      width: `${scoreStructure.post_test.percentage}%`,
      background: 'linear-gradient(90deg, #9b59b6, #8e44ad)',
      left: `${(scoreStructure.big_lessons ?? []).reduce((sum, bl) => sum + bl.weight_percentage, 0)}%`,
    }}
    title={`แบบทดสอบหลังเรียน: ${scoreStructure.post_test.title} - ${scoreStructure.post_test.percentage}%`}
  />
)}

            </div>
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
          {sortedData?.pre_test && (
            <div className="score-table-score-item score-table-score-item-pretest">
              <div className="score-table-score-item-header">
                <div className="score-table-score-item-icon">🔍</div>
                <div className="score-table-score-item-info">
                  <h3 className="score-table-score-item-title">{sortedData!.pre_test!.title}</h3>
                  <p className="score-table-score-item-subtitle">แบบทดสอบก่อนเรียน (0 คะแนน)</p>
                </div>
                <div className="score-table-score-item-badge">ไม่นับคะแนน</div>
              </div>
            </div>
          )}

          {/* Big Lessons */}
          {sortedData?.big_lessons.map((bigLesson: BigLesson, index: number) => {
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
                    onClick={(e) => {
                      e.stopPropagation();
                      hasContent && toggleBigLesson(bigLesson.id);
                    }}
                    style={{ cursor: hasContent ? 'pointer' : 'default' }}
                  >
                    <h3 className="score-table-score-item-title">หน่วยที่ {index + 1}: {bigLesson.title}</h3>
                    <p className="score-table-score-item-subtitle">น้ำหนัก: {bigLesson.weight_percentage}% ของ 100 คะแนน | แบบทดสอบท้ายหน่วย + บทเรียนย่อยต้องรวม = 100%</p>
                  </div>
                  <div 
                    className="score-table-score-item-controls"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div 
                      className="score-table-percentage-control"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div 
                        className="score-table-percentage-label"
                        onClick={(e) => e.stopPropagation()}
                      >
                        น้ำหนักหน่วย (%)
                      </div>
                      <PercentageInput 
                        value={bigLesson.weight_percentage}
                        onChange={(newValue) => handleBigLessonUpdate(bigLesson.id, newValue)}
                        showStatus={true}
                        status={progress.status}
                      />
                    </div>
                  </div>
                  
                  {/* Add progress bar for big lesson */}
                  <ProgressBar 
                    usedScore={progress.internalPercentage}
                    totalScore={100}
                    status={progress.status}
                    type="big-lesson"
                    segments={[
                      ...(bigLesson.quiz ? [{
                        percentage: bigLesson.quiz.percentage,
                        color: 'linear-gradient(90deg, #e74c3c, #c0392b)',
                        label: 'แบบทดสอบท้ายหน่วย'
                      }] : []),
                      ...bigLesson.lessons.map((lesson, lessonIndex) => {
                        // สร้างสีที่หลากหลายสำหรับแต่ละบทเรียน
                        const colors = [
                          'linear-gradient(90deg, #3498db, #2980b9)', // น้ำเงิน
                          'linear-gradient(90deg, #2ecc71, #27ae60)', // เขียว
                          'linear-gradient(90deg, #f39c12, #e67e22)', // ส้ม
                          'linear-gradient(90deg, #9b59b6, #8e44ad)', // ม่วง
                          'linear-gradient(90deg, #1abc9c, #16a085)', // เขียวมิ้นท์
                          'linear-gradient(90deg, #e67e22, #d35400)', // ส้มเข้ม
                          'linear-gradient(90deg, #34495e, #2c3e50)', // น้ำเงินเข้ม
                          'linear-gradient(90deg, #f1c40f, #f39c12)', // เหลือง
                          'linear-gradient(90deg, #e91e63, #c2185b)', // ชมพู
                          'linear-gradient(90deg, #00bcd4, #0097a7)', // ฟ้า
                          'linear-gradient(90deg, #795548, #5d4037)', // น้ำตาล
                          'linear-gradient(90deg, #607d8b, #455a64)', // เทา
                        ];
                        return {
                          percentage: lesson.percentage,
                          color: colors[lessonIndex % colors.length],
                          label: `บทเรียน: ${lesson.title}`
                        };
                      })
                    ]}
                  />
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
                            <p className="score-table-score-item-subtitle">Quiz ประจำหน่วยการเรียนรู้ | คะแนนดิบ: {calculateBigLessonQuizRawScore(bigLesson)} คะแนน</p>
                          </div>
                          <div 
                            className="score-table-percentage-control"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div 
                              className="score-table-percentage-label"
                              onClick={(e) => e.stopPropagation()}
                            >
                              สัดส่วนในหน่วย (%)
                            </div>
                            <PercentageInput 
                              value={bigLesson.quiz?.percentage || 0}
                              onChange={(newValue) => handleBigLessonQuizPercentageUpdate(bigLesson.id, newValue)}
                            />
                          </div>
                        </div>
                        <ProgressBar 
                          usedScore={bigLesson.quiz?.percentage || 0}
                          totalScore={100}
                          status="complete"
                          type="quiz"
                          segments={[{
                            percentage: bigLesson.quiz?.percentage || 0,
                            color: 'linear-gradient(90deg, #e74c3c, #c0392b)',
                            label: 'แบบทดสอบท้ายหน่วย'
                          }]}
                        />
                      </div>
                    )}

                    {/* Lessons */}
                    {bigLesson.lessons.map((lesson: Lesson, lessonIndex: number) => {
                      const isLessonExpanded = expandedLessons.has(lesson.id);
                      const hasQuiz = !!lesson.quiz;

                      return (
                        <div key={lesson.id}>
                          <div 
                            className="score-table-score-sub-item score-table-score-sub-item-lesson score-table-score-sub-item-clickable"
                            onClick={(e) => {
                              // ไม่ให้คลิกที่ header ถ้าคลิกที่ input หรือ controls
                              const target = e.target as HTMLElement;
                              if (!target.closest('.score-table-percentage-control') && !target.closest('.score-table-percentage-input-wrapper')) {
                                hasQuiz && toggleLesson(lesson.id);
                              }
                            }}
                          >
                            <div className="score-table-score-sub-item-header">
                              <div className="score-table-score-sub-item-icon">
                                {lesson.has_video ? '🎥' : '📄'}
                              </div>
                              <div 
                                className="score-table-score-item-info"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  hasQuiz && toggleLesson(lesson.id);
                                }}
                                style={{ cursor: hasQuiz ? 'pointer' : 'default' }}
                              >
                                <h4 className="score-table-score-item-title">
                                  บทเรียนที่ {lessonIndex + 1}: {lesson.title}
                                </h4>
                                <p className="score-table-score-item-subtitle">
                                  {lesson.has_video ? 'บทเรียนวิดีโอ' : 'บทเรียนเอกสาร'}
                                  {hasQuiz ? ' + แบบทดสอบ' : ' (ไม่มีแบบทดสอบ)'} | คะแนนดิบ: {calculateLessonRawScore(lesson, bigLesson.weight_percentage)} คะแนน
                                  {hasQuiz && ' 📋'}
                                </p>
                              </div>
                              <div 
                                className="score-table-score-item-controls"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div 
                                  className="score-table-percentage-control"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div 
                                    className="score-table-percentage-label"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    สัดส่วนในหน่วย (%)
                                  </div>
                                  <PercentageInput 
                                    value={lesson.percentage || 0}
                                    onChange={(newValue) => handleLessonPercentageUpdate(lesson.id, newValue)}
                                    disabled={!hasQuiz}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <ProgressBar 
                              usedScore={lesson.percentage || 0}
                              totalScore={100}
                              status="complete"
                              type="lesson"
                              segments={[{
                                percentage: lesson.percentage || 0,
                                color: 'linear-gradient(90deg, #3498db, #2980b9)',
                                label: 'บทเรียน'
                              }]}
                            />
                          </div>

                          {/* Lesson Quiz */}
                          {hasQuiz && isLessonExpanded && (
                            <div className="score-table-score-sub-item score-table-score-sub-item-lesson-quiz score-table-score-sub-item-nested">
                              <div className="score-table-score-sub-item-header">
                                <div className="score-table-score-sub-item-icon">📋</div>
                                <div 
                                  className="score-table-score-item-info"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <h4 className="score-table-score-item-title">แบบทดสอบบทเรียน: {lesson.title}</h4>
                                  <p className="score-table-score-item-subtitle">Quiz ประจำบทเรียน | คะแนนดิบ: {calculateLessonQuizRawScore(lesson, bigLesson.weight_percentage)} คะแนน</p>
                                </div>
                                <div 
                                  className="score-table-percentage-control"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div 
                                    className="score-table-percentage-label"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    สัดส่วนในบทเรียน (%) (อัปเดตอัตโนมัติเป็น 100%)
                                  </div>
                                  <PercentageInput 
                                    value={lesson.quiz?.percentage || 0}
                                    onChange={(newValue) => handleLessonQuizPercentageUpdate(lesson.id, newValue)}
                                    disabled={true}
                                  />
                                </div>
                              </div>
                              
                              <ProgressBar 
                                usedScore={lesson.quiz?.percentage || 0}
                                totalScore={100}
                                status="complete"
                                type="quiz"
                                segments={[{
                                  percentage: lesson.quiz?.percentage || 0,
                                  color: 'linear-gradient(90deg, #2ecc71, #27ae60)',
                                  label: 'แบบทดสอบบทเรียน'
                                }]}
                              />
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
          {sortedData?.post_test && (
            <div className="score-table-score-item score-table-score-item-posttest">
              <div className="score-table-score-item-header">
                <div className="score-table-score-item-icon">🏁</div>
                <div 
                  className="score-table-score-item-info"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="score-table-score-item-title">{sortedData!.post_test!.title}</h3>
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
                    น้ำหนักแบบทดสอบ (%)
                  </div>
                  <PercentageInput 
                    value={scoreStructure!.post_test!.percentage}
                    onChange={(newValue) => handlePostTestUpdate(newValue)}
                  />
                </div>
              </div>
              
              <ProgressBar 
                usedScore={scoreStructure!.post_test!.percentage}
                totalScore={100}
                status="complete"
                type="quiz"
                segments={[{
                  percentage: scoreStructure!.post_test!.percentage,
                  color: 'linear-gradient(90deg, #9b59b6, #8e44ad)',
                  label: 'แบบทดสอบหลังเรียน'
                }]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreManagementTab;
