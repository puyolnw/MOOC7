import React from "react";

interface LessonProgressProps {
  progressData: any;
  progress: number;
}

const LessonProgress: React.FC<LessonProgressProps> = ({ progressData, progress }) => {
  return (
    <div className="lesson__progress">
      <h4>ความคืบหน้า</h4>
      <div className="progress-container">
        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: `${progressData?.progress?.progress_percentage || progress}%` }}></div>
        </div>
        <div className="progress-percentage">{(progressData?.progress?.progress_percentage || progress).toFixed(0)}%</div>
      </div>
      <div className="progress-status">
        <span className="status-text">สถานะ: </span>
        <span className="status-value">
          {(progressData?.progress?.progress_percentage || progress) < 100 ? 'กำลังเรียน' : 'เรียนจบแล้ว'}
        </span>
      </div>
      {progressData?.progress && (
        <div className="progress-details mt-2">
          <div className="small text-muted">
            บทเรียนที่เรียนจบแล้ว: {progressData.progress.completed_lessons || 0}/{progressData.progress.total_lessons || 0}
          </div>
          {progressData.progress.total_quizzes > 0 && (
            <div className="small text-muted">
              แบบทดสอบที่ทำแล้ว: {progressData.progress.completed_quizzes || 0}/{progressData.progress.total_quizzes || 0}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonProgress;
