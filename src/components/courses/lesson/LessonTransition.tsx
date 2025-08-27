import React from 'react';
import './LessonTransition.css';

interface LessonTransitionProps {
  isVisible: boolean;
  message?: string;
}

const LessonTransition: React.FC<LessonTransitionProps> = ({ 
  isVisible, 
  message = "กำลังเปลี่ยนบทเรียน..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="lesson-transition-overlay">
      <div className="lesson-transition-content">
        {/* Mini spinner */}
        <div className="lesson-transition-spinner">
          <div className="transition-ring"></div>
          <div className="transition-center">
            <i className="fas fa-book-open"></i>
          </div>
        </div>
        
        {/* Message */}
        <div className="lesson-transition-message">
          <p>{message}</p>
        </div>
        
        {/* Progress dots */}
        <div className="lesson-transition-dots">
          <div className="transition-dot dot-1"></div>
          <div className="transition-dot dot-2"></div>
          <div className="transition-dot dot-3"></div>
        </div>
      </div>
    </div>
  );
};

export default LessonTransition;
