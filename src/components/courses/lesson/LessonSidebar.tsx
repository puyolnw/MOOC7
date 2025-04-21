import React from "react";
import LessonFaq from "./LessonFaq";
import "./LessonArea.css";

interface SectionData {
  id: number;
  title: string;
  count: string;
  items: LessonItem[];
}

interface LessonItem {
  id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
  lessonId?: number;
  quizId?: number;
}

interface LessonSidebarProps {
  subjectTitle: string;
  lessonData: SectionData[];
  onSelectLesson: (sectionId: number, itemId: number, title: string, type: 'video' | 'quiz') => void;
  currentLessonId: string;
  onViewChange: (view: 'video' | 'quiz') => void;
  progressData: any;
  progress: number;
}

const LessonSidebar: React.FC<LessonSidebarProps> = ({
  subjectTitle,
  lessonData,
  onSelectLesson,
  currentLessonId,
  onViewChange,
  progressData,
  progress
}) => {
  // ใช้ค่าจาก progressData ถ้ามี หรือใช้ค่า progress ที่ส่งมา
  const progressPercentage = progressData?.progress?.progress_percentage !== undefined 
    ? progressData.progress.progress_percentage 
    : progress;
  
  // แปลงเป็นจำนวนเต็มและจำกัดค่าระหว่าง 0-100
  const displayProgress = Math.min(100, Math.max(0, Math.round(progressPercentage || 0)));
  
  return (
    <div className="col-xl-3 col-lg-4 lesson__sidebar">
      <div className="lesson__content">
        <h2 className="title">เนื้อหาบทเรียน : {subjectTitle}</h2>
        <LessonFaq
          onViewChange={onViewChange}
          lessonData={lessonData}
          onSelectLesson={onSelectLesson}
          currentLessonId={currentLessonId}
        />
        <div className="lesson__progress">
          <h4>ความคืบหน้า</h4>
          <div className="progress-container">
            <div className="progress-bar-wrapper">
              <div className="progress-bar" style={{ width: `${displayProgress}%` }}></div>
            </div>
            <div className="progress-percentage">{displayProgress}%</div>
          </div>
          <div className="progress-status">
            <span className="status-text">สถานะ: </span>
            <span className="status-value">
              {displayProgress < 100 ? 'กำลังเรียน' : 'เรียนจบแล้ว'}
            </span>
          </div>
          {progressData?.progress && (
            <div className="progress-details mt-2">
              <div className="small text-muted">
                บทเรียนที่เรียนจบแล้ว: {progressData.progress.completed_lessons || 0}/{progressData.progress.total_lessons || 0}
              </div>
              {progressData.progress.total_quizzes > 0 && (
                <div className="small text-muted">
                                    แบบทดสอบที่ผ่านแล้ว: {progressData.progress.completed_quizzes || 0}/{progressData.progress.total_quizzes || 0}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonSidebar;
