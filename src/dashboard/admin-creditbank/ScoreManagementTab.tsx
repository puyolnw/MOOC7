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
    relative_percentage?: number;
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
    relative_percentage?: number;
  };
  order_number: number;
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

  // แปลงจากคะแนนดิบเป็นเปอร์เซ็นต์แบบ relative
  const convertRawToRelativePercentage = (rawData: ScoreStructure): ScoreStructure => {
    const converted = JSON.parse(JSON.stringify(rawData));
    
    converted.big_lessons.forEach((bigLesson: BigLesson) => {
      if (bigLesson.weight_percentage === 0) return;
      
      // คำนวณผลรวมคะแนนดิบในหน่วย
      const totalRawInBigLesson = (bigLesson.quiz?.percentage || 0) + 
        bigLesson.lessons.reduce((sum: number, lesson: Lesson) => 
          sum + lesson.percentage + (lesson.quiz?.percentage || 0), 0
        );
      
      // แปลง quiz ของหน่วยหลัก
      if (bigLesson.quiz && totalRawInBigLesson > 0) {
        bigLesson.quiz.relative_percentage = Math.round((bigLesson.quiz.percentage / totalRawInBigLesson) * 100);
      }
      
      // แปลง lessons
      bigLesson.lessons.forEach((lesson: Lesson) => {
        if (totalRawInBigLesson > 0) {
          // คำนวณสัดส่วนบทเรียน (รวม quiz ของบทเรียนด้วย)
          const lessonTotal = lesson.percentage + (lesson.quiz?.percentage || 0);
          lesson.relative_percentage = Math.round((lessonTotal / totalRawInBigLesson) * 100);
          
          // แปลง quiz ของบทเรียนให้เป็น 100% (เพราะคะแนนจริงมาจาก quiz)
          if (lesson.quiz) {
            lesson.quiz.relative_percentage = 100;
          }
        }
      });
    });
    
    return converted;
  };

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

  // อัปเดตคะแนนดิบจาก relative percentage
  const updateRawScoresFromRelative = (updatedScoreStructure: ScoreStructure) => {
    updatedScoreStructure.big_lessons.forEach(bigLesson => {
      if (bigLesson.weight_percentage === 0) return;
      
      // รวบรวม relative percentages
      const items: Array<{type: 'quiz' | 'lesson', item: any}> = [];
      if (bigLesson.quiz && bigLesson.quiz.relative_percentage !== undefined) {
        items.push({ type: 'quiz', item: bigLesson.quiz });
      }
      
      bigLesson.lessons.forEach(lesson => {
        if (lesson.relative_percentage !== undefined) {
          items.push({ type: 'lesson', item: lesson });
        }
      });
      
      // คำนวณคะแนนดิบ
      const totalRelative = items.reduce((sum, { item }) => sum + (item.relative_percentage || 0), 0);
      
      if (totalRelative > 0) {
        items.forEach(({ type, item }) => {
          const proportion = (item.relative_percentage || 0) / totalRelative;
          const rawScore = bigLesson.weight_percentage * proportion;
          
          if (type === 'quiz') {
            item.percentage = Math.round(rawScore * 100) / 100;
          } else if (type === 'lesson') {
            // วิดีโอ/เอกสารไม่เก็บคะแนน คะแนนทั้งหมดไปที่ quiz
            item.percentage = 0;
            if (item.quiz) {
              item.quiz.percentage = Math.round(rawScore * 100) / 100;
            }
          }
        });
      }
    });
  };

  // Handler functions for relative percentage updates
  const handleRelativeQuizUpdate = (parentId: number, type: 'big_lesson' | 'lesson', newValue: number) => {
    if (!scoreStructure) return;
    
    setScoreStructure(prev => {
      if (!prev) return prev;
      
      const updated = {...prev};
      
      if (type === 'big_lesson') {
        const bigLesson = updated.big_lessons.find(bl => bl.id === parentId);
        if (bigLesson && bigLesson.quiz) {
          bigLesson.quiz.relative_percentage = newValue;
        }
      } else {
        for (const bigLesson of updated.big_lessons) {
          const lesson = bigLesson.lessons.find(l => l.id === parentId);
          if (lesson && lesson.quiz) {
            lesson.quiz.relative_percentage = newValue;
            break;
          }
        }
      }
      
      updateRawScoresFromRelative(updated);
      return updated;
    });
  };

  const handleRelativeLessonUpdate = (lessonId: number, newValue: number) => {
    if (!scoreStructure) return;
    
    setScoreStructure(prev => {
      if (!prev) return prev;
      
      const updated = {...prev};
      
      for (const bigLesson of updated.big_lessons) {
        const lesson = bigLesson.lessons.find(l => l.id === lessonId);
        if (lesson) {
          lesson.relative_percentage = newValue;
          break;
        }
      }
      
      updateRawScoresFromRelative(updated);
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

  // Auto-distribute scores within a big lesson
  const autoDistributeBigLessonScores = (bigLessonId: number, totalScore: number) => {
    setScoreStructure(prev => {
      if (!prev) return prev;
      
      const updatedBigLessons = prev.big_lessons.map(bl => {
        if (bl.id !== bigLessonId) return bl;
        
        // รวบรวมทุก item ในหน่วย
        const items: Array<{type: 'quiz' | 'lesson', item: any}> = [];
        if (bl.quiz) items.push({ type: 'quiz', item: bl.quiz });
        bl.lessons.forEach(lesson => items.push({ type: 'lesson', item: lesson }));
        
        if (items.length === 0) return bl;
        
        // แบ่งคะแนนเท่าๆ กัน
        const scorePerItem = totalScore / items.length;
        
        const updatedBigLesson = { ...bl };
        
        // อัปเดตคะแนน
        if (updatedBigLesson.quiz) {
          updatedBigLesson.quiz = { ...updatedBigLesson.quiz, percentage: Math.round(scorePerItem * 100) / 100 };
        }
        
        updatedBigLesson.lessons = updatedBigLesson.lessons.map(lesson => {
          const updatedLesson = { ...lesson, percentage: 0 }; // วิดีโอ 0 คะแนน
          if (lesson.quiz) {
            updatedLesson.quiz = { ...lesson.quiz, percentage: Math.round(scorePerItem * 100) / 100 };
          }
          return updatedLesson;
        });
        
        return updatedBigLesson;
      });
      
      return { ...prev, big_lessons: updatedBigLessons };
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
    
    // Auto-distribute scores ภายในหน่วย
    autoDistributeBigLessonScores(bigLessonId, newValue);
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
          initializeRelativePercentages(loadedStructure);
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

  // JSON export functions
  const generateScoreDistribution = () => {
    if (!scoreStructure) return null;
    
    const distribution: any = {
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      total_score: 100,
      passing_percentage: passingPercentage,
      items: []
    };

    // Pre-test
    if (scoreStructure.pre_test) {
      distribution.items.push({
        type: 'pre_test',
        title: scoreStructure.pre_test.title,
        displayScore: 0,
        actuallyStores: 0
      });
    }

    // Big lessons
    scoreStructure.big_lessons.forEach((bigLesson, index) => {
      distribution.items.push({
        type: 'big_lesson',
        title: `หน่วยที่ ${index + 1}: ${bigLesson.title}`,
        displayScore: bigLesson.weight_percentage,
        actuallyStores: bigLesson.weight_percentage,
        items: []
      });

      // Big lesson quiz
      if (bigLesson.quiz) {
        (distribution.items[distribution.items.length - 1] as any).items.push({
          type: 'big_lesson_quiz',
          title: `แบบทดสอบหน่วย: ${bigLesson.title}`,
          displayScore: `${((bigLesson.quiz.relative_percentage || 0))}% ของหน่วย`,
          actuallyStores: bigLesson.quiz.percentage
        });
      }

      // Lessons
      bigLesson.lessons.forEach((lesson, lessonIndex) => {
        const lessonItem: any = {
          type: 'lesson',
          title: `บทเรียนที่ ${lessonIndex + 1}: ${lesson.title}`,
          displayScore: `${lesson.relative_percentage || 0}% ของหน่วย`,
          actuallyStores: 0,
          items: []
        };

        if (lesson.quiz) {
          lessonItem.items.push({
            type: 'lesson_quiz',
            title: `แบบทดสอบบทเรียน: ${lesson.title}`,
            displayScore: '100% ของบทเรียน',
            actuallyStores: lesson.quiz.percentage
          });
        }

        (distribution.items[distribution.items.length - 1] as any).items.push(lessonItem);
      });
    });

    // Post-test
    if (scoreStructure.post_test) {
      distribution.items.push({
        type: 'post_test',
        title: scoreStructure.post_test.title,
        displayScore: scoreStructure.post_test.percentage,
        actuallyStores: scoreStructure.post_test.percentage
      });
    }

    return distribution;
  };

  const downloadJSON = () => {
    if (!scoreStructure) return;
    
    const scoreDistribution = generateScoreDistribution();
    const exportData = {
      timestamp: new Date().toISOString(),
      subject: {
        id: subject.subject_id,
        name: subject.subject_name,
        passing_percentage: passingPercentage
      },
      scoreStructure: scoreStructure,
      scoreDistribution: scoreDistribution
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `score-structure-${subject.subject_name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('ดาวน์โหลดไฟล์ JSON สำเร็จ');
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

  // Initialize relative percentages when scoreStructure is loaded
  const initializeRelativePercentages = (structure: ScoreStructure) => {
    structure.big_lessons.forEach(bigLesson => {
      // ปรับ lesson.percentage เป็น 0 (วิดีโอไม่เก็บคะแนน)
      bigLesson.lessons.forEach(lesson => {
        if (lesson.quiz) {
          // ย้ายคะแนนจาก lesson ไปที่ quiz
          lesson.quiz.percentage += lesson.percentage;
          lesson.percentage = 0;
        }
      });
      
      const totalRawInBigLesson = (bigLesson.quiz?.percentage || 0) + 
        bigLesson.lessons.reduce((sum, lesson) => 
          sum + lesson.percentage + (lesson.quiz?.percentage || 0), 0
        );
      
      if (totalRawInBigLesson > 0) {
        // คำนวณ relative percentage สำหรับ quiz ของหน่วย
        if (bigLesson.quiz) {
          bigLesson.quiz.relative_percentage = Math.round((bigLesson.quiz.percentage / totalRawInBigLesson) * 100);
        }
        
        // คำนวณ relative percentage สำหรับ lessons
        bigLesson.lessons.forEach(lesson => {
          const lessonTotal = lesson.percentage + (lesson.quiz?.percentage || 0);
          lesson.relative_percentage = Math.round((lessonTotal / totalRawInBigLesson) * 100);
          
          if (lesson.quiz) {
            lesson.quiz.relative_percentage = 100;
          }
        });
      }
    });
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
  const relativeData = scoreStructure ? convertRawToRelativePercentage(scoreStructure) : null;

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
              <button
                className="score-table-action-btn"
                onClick={() => downloadJSON()}
                disabled={!scoreStructure}
              >
                📥 ดาวน์โหลด JSON
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
          {relativeData?.pre_test && (
            <div className="score-table-score-item score-table-score-item-pretest">
              <div className="score-table-score-item-header">
                <div className="score-table-score-item-icon">🔍</div>
                <div className="score-table-score-item-info">
                  <h3 className="score-table-score-item-title">{relativeData.pre_test.title}</h3>
                  <p className="score-table-score-item-subtitle">แบบทดสอบก่อนเรียน (0 คะแนน)</p>
                  </div>
                <div className="score-table-score-item-badge">ไม่นับคะแนน</div>
              </div>
            </div>
          )}

          {/* Big Lessons */}
          {relativeData?.big_lessons.map((relativeBigLesson, index) => {
            const originalBigLesson = scoreStructure!.big_lessons[index];
            const progress = calculateBigLessonProgress(originalBigLesson);
            const isExpanded = expandedBigLessons.has(originalBigLesson.id);
            const hasContent = relativeBigLesson.quiz || relativeBigLesson.lessons.length > 0;

            return (
              <div key={originalBigLesson.id} className="score-table-score-item score-table-score-item-big-lesson">
                <div 
                  className="score-table-score-item-header score-table-score-item-header-clickable"
                  onClick={(e) => {
                    // ไม่ให้คลิกที่ header ถ้าคลิกที่ input หรือ controls
                    const target = e.target as HTMLElement;
                    if (!target.closest('.score-table-percentage-control') && !target.closest('.score-table-percentage-input-wrapper')) {
                      hasContent && toggleBigLesson(originalBigLesson.id);
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
                    <h3 className="score-table-score-item-title">หน่วยที่ {index + 1}: {relativeBigLesson.title}</h3>
                    <p className="score-table-score-item-subtitle">น้ำหนัก: {originalBigLesson.weight_percentage} คะแนน</p>
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
                          toggleBigLesson(originalBigLesson.id);
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
                        value={originalBigLesson.weight_percentage}
                        onChange={(newValue) => handleBigLessonUpdate(originalBigLesson.id, newValue)}
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
                  totalScore={originalBigLesson.weight_percentage}
                  status={progress.status}
                />
              </div>
              
                {/* Sub Items */}
                {hasContent && isExpanded && (
                  <div className="score-table-score-sub-items">
                    {/* BigLesson Quiz */}
                    {relativeBigLesson.quiz && (
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
                            <h4 className="score-table-score-item-title">แบบทดสอบหน่วย: {relativeBigLesson.title}</h4>
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
                              สัดส่วนในหน่วย
                </div>
                            <PercentageInput 
                              value={relativeBigLesson.quiz.relative_percentage || 0}
                              onChange={(newValue) => handleRelativeQuizUpdate(originalBigLesson.id, 'big_lesson', newValue)}
                            />
              </div>
            </div>
            <ProgressBar 
              usedScore={originalBigLesson.quiz?.percentage || 0}
              totalScore={originalBigLesson.quiz?.percentage || 0}
              status="complete"
            />
          </div>
                    )}

                    {/* Lessons */}
                    {relativeBigLesson.lessons.map((relativeLesson, lessonIndex) => {
                      const originalLesson = originalBigLesson.lessons[lessonIndex];
                      const isLessonExpanded = expandedLessons.has(originalLesson.id);
                      const hasQuiz = !!relativeLesson.quiz;
                      const quizScore = originalLesson.quiz?.percentage || 0;

                      return (
                        <div key={originalLesson.id}>
                          <div className="score-table-score-sub-item score-table-score-sub-item-lesson">
                            <div 
                              className="score-table-score-sub-item-header score-table-score-sub-item-header-clickable"
                              onClick={(e) => {
                                // ไม่ให้คลิกที่ header ถ้าคลิกที่ input หรือ controls
                                const target = e.target as HTMLElement;
                                if (!target.closest('.score-table-percentage-control') && !target.closest('.score-table-percentage-input-wrapper')) {
                                  hasQuiz && toggleLesson(originalLesson.id);
                                }
                              }}
                            >
                              <div className="score-table-score-sub-item-icon">
                                {relativeLesson.has_video ? '🎥' : '📄'}
        </div>
                              <div 
                                className="score-table-score-item-info"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <h4 className="score-table-score-item-title">
                                  บทเรียนที่ {lessonIndex + 1}: {relativeLesson.title}
                                </h4>
                                <p className="score-table-score-item-subtitle">
                                  {relativeLesson.has_video ? 'บทเรียนวิดีโอ' : 'บทเรียนเอกสาร'}
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
                                      toggleLesson(originalLesson.id);
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
                                    สัดส่วนในหน่วย
                                  </div>
                                  <PercentageInput 
                                    value={relativeLesson.relative_percentage || 0}
                                    onChange={(newValue) => handleRelativeLessonUpdate(originalLesson.id, newValue)}
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
                                  <h4 className="score-table-score-item-title">แบบทดสอบบทเรียน: {relativeLesson.title}</h4>
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
                                    สัดส่วนในบทเรียน
                                  </div>
                                  <PercentageInput 
                                    value={relativeLesson.quiz?.relative_percentage || 100}
                                    onChange={(newValue) => handleRelativeQuizUpdate(originalLesson.id, 'lesson', newValue)}
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
          {relativeData?.post_test && (
            <div className="score-table-score-item score-table-score-item-posttest">
              <div className="score-table-score-item-header">
                <div className="score-table-score-item-icon">🏁</div>
                <div 
                  className="score-table-score-item-info"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="score-table-score-item-title">{relativeData.post_test.title}</h3>
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
