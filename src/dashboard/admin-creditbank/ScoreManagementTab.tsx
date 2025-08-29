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
  }> = ({ usedScore, totalScore, status }) => {
    const percentage = totalScore > 0 ? Math.min((usedScore / totalScore) * 100, 100) : 0;
    
    return (
      <div className="score-progress-container">
        <div className="score-progress-bar">
          <div 
            className={`score-progress-bar-fill score-progress-bar-${status}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="score-progress-text">
          {Math.round(percentage)}% ({usedScore}/{totalScore} คะแนน)
        </div>
      </div>
    );
  };



  // Simple PercentageInput Component - ช่องกรอกตัวเลขธรรมดา
  const PercentageInput: React.FC<{
    value: number;
    onChange: (newValue: number) => void;
    disabled?: boolean;
    placeholder?: string;
  }> = ({ value, onChange, disabled = false, placeholder = "0" }) => {
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
      setInputValue(newValue); // อัปเดตแค่ inputValue ไม่เรียก onChange
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
          // ถ้าไม่ใช่ตัวเลข ให้ส่ง 0
          onChange(0);
        }
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur(); // เรียก handleBlur
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

  // คำนวณเปอร์เซ็นต์แบบ hierarchical
  const calculateBigLessonProgress = (bigLesson: BigLesson) => {
    const usedPercentage = (bigLesson.quiz?.percentage || 0) + 
      bigLesson.lessons.reduce((sum, lesson) => 
        sum + lesson.percentage + (lesson.quiz?.percentage || 0), 0
      );
    
    const remainingPercentage = bigLesson.weight_percentage - usedPercentage;
    
    let status: 'complete' | 'incomplete' | 'exceeded' = 'incomplete';
    if (Math.abs(usedPercentage - bigLesson.weight_percentage) < 0.01) {
      status = 'complete';
    } else if (usedPercentage > bigLesson.weight_percentage) {
      status = 'exceeded';
    }

    return {
      usedPercentage: Math.round(usedPercentage * 100) / 100,
      remainingPercentage: Math.round(remainingPercentage * 100) / 100,
      status,
      progressText: `ใช้ไป ${Math.round(usedPercentage * 100) / 100} คะแนน / เหลือ ${Math.round(remainingPercentage * 100) / 100} คะแนน`
    };
  };

  const calculateTotalValidation = () => {
    if (!scoreStructure) return { totalUsed: 0, isValid: false, errors: [] };

    const totalUsed = scoreStructure.big_lessons.reduce((sum, bl) => sum + bl.weight_percentage, 0) +
      (scoreStructure.post_test?.percentage || 0);

    return {
      totalUsed,
      isValid: totalUsed === 100,
      errors: totalUsed > 100 ? [`เกิน 100 คะแนน (${totalUsed} คะแนน)`] : 
              totalUsed < 100 ? [`ไม่ครบ 100 คะแนน (${totalUsed} คะแนน)`] : []
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

  // Frontend-only auto-distribute function
  const calculateFrontendAutoDistribute = () => {
    if (!scoreStructure) return null;

    const newStructure = JSON.parse(JSON.stringify(scoreStructure)); // Deep clone
    
    const messages: string[] = [];

    // 1. นับ BigLessons ที่ไม่ได้ล็อค และ Post-test ที่ไม่ได้ล็อค
    const autoBigLessons = newStructure.big_lessons.filter((bl: BigLesson) => !bl.is_fixed_weight);
    const autoBigLessonsCount = autoBigLessons.length;
    const hasPostTest = newStructure.post_test && !newStructure.post_test.is_fixed_weight;
    const totalItems = autoBigLessonsCount + (hasPostTest ? 1 : 0);

    if (totalItems === 0) {
      return {
        success: false,
        message: "ไม่มีรายการที่สามารถปรับได้ (ทั้งหมดถูกล็อค)",
        structure: null
      };
    }

    // 2. แบ่งน้ำหนัก BigLessons และ Post-test (100% เท่าๆ กัน)
    const weightPerItem = 100.0 / totalItems;
    
    // ปัดเศษให้รายการสุดท้ายรับส่วนที่เหลือ เพื่อให้รวมเป็น 100% พอดี
    let remainingWeight = 100.0;
    
    autoBigLessons.forEach((bl: BigLesson, index: number) => {
      if (index === autoBigLessons.length - 1 && !hasPostTest) {
        // รายการสุดท้าย (ถ้าไม่มี Post-test)
        bl.weight_percentage = Math.round(remainingWeight * 100) / 100;
      } else {
        bl.weight_percentage = Math.round(weightPerItem * 100) / 100;
        remainingWeight -= bl.weight_percentage;
      }
    });

    // อัปเดต Post-test ถ้ามีและไม่ได้ล็อค
    if (hasPostTest && newStructure.post_test) {
      newStructure.post_test.percentage = Math.round(remainingWeight * 100) / 100;
    }

    messages.push(`แบ่งน้ำหนัก: ${weightPerItem.toFixed(1)}% ต่อรายการ (${totalItems} รายการ)`);
    if (autoBigLessonsCount > 0) {
      messages.push(`- BigLessons: ${autoBigLessonsCount} หน่วย`);
    }
    if (hasPostTest) {
      messages.push(`- Post-test: 1 รายการ`);
    }

    // 3. แบ่งน้ำหนักภายในแต่ละ BigLesson
    newStructure.big_lessons.forEach((bl: BigLesson) => {
      // นับจำนวน items ที่สามารถปรับได้ในแต่ละ BigLesson
      const items: Array<{type: 'big_lesson_quiz' | 'lesson_quiz', item: any}> = [];
      
      // เพิ่ม BigLesson Quiz (แบบทดสอบหน่วย) ถ้ามีและไม่ได้ล็อค
      if (bl.quiz && !bl.quiz.is_fixed_weight) {
        items.push({ type: 'big_lesson_quiz', item: bl.quiz });
      }
      
      // เพิ่ม Lesson Quizzes (แบบทดสอบบทเรียน) ที่ไม่ได้ล็อค
      bl.lessons.forEach((lesson: Lesson) => {
        if (lesson.quiz && !lesson.quiz.is_fixed_weight) {
          items.push({ type: 'lesson_quiz', item: lesson.quiz });
        }
      });
      
      const totalItems = items.length;
      
      if (totalItems > 0) {
        // แบ่งน้ำหนักเท่าๆ กันให้ทุก item
        const weightPerItem = bl.weight_percentage / totalItems;
        
        items.forEach(({ item }) => {
          item.percentage = weightPerItem;
        });

        const bigLessonQuizCount = items.filter(i => i.type === 'big_lesson_quiz').length;
        const lessonQuizCount = items.filter(i => i.type === 'lesson_quiz').length;
        
        let detailText = `${totalItems} รายการ`;
        if (bigLessonQuizCount > 0) {
          detailText += `: ${bigLessonQuizCount} แบบทดสอบหน่วย`;
        }
        if (lessonQuizCount > 0) {
          detailText += ` + ${lessonQuizCount} แบบทดสอบบทเรียน`;
        }

        messages.push(`BigLesson "${bl.title}": แบ่งน้ำหนักภายใน (${detailText})`);
      }
    });

    // 4. คำนวณ total_used และ total_remaining
    let totalUsed = 0;
    newStructure.big_lessons.forEach((bl: BigLesson) => {
      totalUsed += bl.weight_percentage;
      if (bl.quiz) {
        totalUsed += bl.quiz.percentage;
      }
      bl.lessons.forEach((lesson: Lesson) => {
        totalUsed += lesson.percentage;
        if (lesson.quiz) {
          totalUsed += lesson.quiz.percentage;
        }
      });
    });

    // รวม Post-test ในการคำนวณ total_used
    if (newStructure.post_test) {
      totalUsed += newStructure.post_test.percentage;
    }

    newStructure.total_used = totalUsed;
    newStructure.total_remaining = 100 - totalUsed;
    newStructure.is_valid = Math.abs(newStructure.total_remaining) < 0.01;

    return {
      success: true,
      message: "คำนวณการกระจายน้ำหนักอัตโนมัติสำเร็จ",
      structure: newStructure,
      details: messages
    };
  };

  const handleFrontendAutoDistribute = () => {
    if (!scoreStructure) {
      toast.error("ไม่พบข้อมูลโครงสร้างคะแนน");
      return;
    }

    const confirmReset = window.confirm(
      "การแบ่งน้ำหนักอัตโนมัติจะปรับเปอร์เซ็นต์ให้เท่ากันทุกหน่วย\nคุณต้องการดูตัวอย่างก่อนหรือไม่?"
    );

    if (!confirmReset) return;

    const result = calculateFrontendAutoDistribute();
    
    if (!result || !result.success) {
      toast.error(result?.message || "ไม่สามารถคำนวณการกระจายน้ำหนักได้");
      return;
    }

    // แสดงผลลัพธ์ใน modal หรือ alert
    const details = result.details?.join('\n') || '';
    const previewMessage = `🎯 ผลการคำนวณการกระจายน้ำหนักอัตโนมัติ:\n\n${details}\n\nน้ำหนักที่ใช้: ${result.structure.total_used.toFixed(1)}%\nน้ำหนักที่เหลือ: ${result.structure.total_remaining.toFixed(1)}%\n\nคุณต้องการบันทึกการเปลี่ยนแปลงนี้หรือไม่?`;

    const shouldSave = window.confirm(previewMessage);
    
    if (shouldSave) {
      // บันทึกโดยใช้ API
      saveAutoDistributeResult(result.structure);
    } else {
      toast.info("ยกเลิกการบันทึก - การเปลี่ยนแปลงจะไม่ถูกบันทึก");
    }
  };

  const saveAutoDistributeResult = async (newStructure: ScoreStructure) => {
    try {
      setIsAutoDistributing(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        return;
      }

      // ส่งข้อมูลใหม่ไปบันทึก
      const payload = {
        updates: {
          big_lessons: newStructure.big_lessons.map(bl => ({
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
          post_test: newStructure.post_test ? {
            id: newStructure.post_test.id,
            percentage: newStructure.post_test.percentage,
            is_fixed_weight: newStructure.post_test.is_fixed_weight
          } : null
        }
      };

      const response = await axios.put(
        `${apiURL}/api/subjects/${subject.subject_id}/scores-hierarchical`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("🎉 บันทึกการกระจายน้ำหนักอัตโนมัติสำเร็จ");
        await fetchScoreStructure(); // โหลดข้อมูลใหม่
      } else {
        toast.error(response.data.message || "ไม่สามารถบันทึกการกระจายน้ำหนักได้");
      }
    } catch (error: any) {
      console.error('❌ Error saving auto-distribute result:', error);
      toast.error("❌ เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsAutoDistributing(false);
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
                onClick={handleFrontendAutoDistribute}
                disabled={!scoreStructure || isAutoDistributing}
                title="คำนวณการกระจายน้ำหนักบน Frontend และแสดงตัวอย่างก่อนบันทึก"
              >
                🎯 แบ่งอัตโนมัติ (Frontend)
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
              📈 สรุปน้ำหนักคะแนนรวม: {validation.totalUsed} คะแนน (จากทั้งหมด 100 คะแนน)
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
                     onClick={(e) => e.stopPropagation()}
                   >
                                          <h3 className="score-table-score-item-title">หน่วยที่ {index + 1}: {bigLesson.title}</h3>
                     <p className="score-table-score-item-subtitle">น้ำหนัก: {bigLesson.weight_percentage} คะแนน</p>
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
                         น้ำหนักหน่วย (คะแนน)
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
                 
                 {/* Add progress bar for big lesson */}
                 <ProgressBar 
                   usedScore={progress.usedPercentage}
                   totalScore={bigLesson.weight_percentage}
                   status={progress.status}
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
                                คะแนน
                  </div>
                              <PercentageInput 
                                value={bigLesson.quiz?.percentage || 0}
                                onChange={(newValue) => handleBigLessonQuizPercentageUpdate(bigLesson.id, newValue)}
                              />
                </div>
              </div>
              <ProgressBar 
                usedScore={bigLesson.quiz?.percentage || 0}
                totalScore={bigLesson.quiz?.percentage || 0}
                status="complete"
              />
            </div>
                      )}

                                         {/* Lessons */}
                     {bigLesson.lessons.map((lesson: Lesson, lessonIndex: number) => {
                       const isLessonExpanded = expandedLessons.has(lesson.id);
                       const hasQuiz = !!lesson.quiz;
                       const quizScore = lesson.quiz?.percentage || 0;

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
                                      คะแนน
                                    </div>
                                    <PercentageInput 
                                      value={lesson.percentage || 0}
                                      onChange={(newValue) => handleLessonPercentageUpdate(lesson.id, newValue)}
                                    />
                                  </div>
                               </div>
                             </div>
                             
                             <ProgressBar 
                               usedScore={quizScore}
                               totalScore={quizScore}
                               status="complete"
                             />
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
                                      คะแนน
                                    </div>
                                    <PercentageInput 
                                      value={lesson.quiz?.percentage || 0}
                                      onChange={(newValue) => handleLessonQuizPercentageUpdate(lesson.id, newValue)}
                                    />
                                  </div>
                               </div>
                               
                               <ProgressBar 
                                 usedScore={quizScore}
                                 totalScore={quizScore}
                                 status="complete"
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
                    น้ำหนักแบบทดสอบ (คะแนน)
                  </div>
                  <PercentageInput 
                    value={scoreStructure!.post_test!.percentage}
                    onChange={(newValue) => handlePostTestUpdate(newValue)}
                  />
                </div>
              </div>
              
              <ProgressBar 
                usedScore={scoreStructure!.post_test!.percentage}
                totalScore={scoreStructure!.post_test!.percentage}
                status="complete"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreManagementTab;
