import React from 'react';
import './LessonLoading.css';

const LessonLoading: React.FC = () => {
  return (
    <div className="lesson-loading-container">
      <div className="lesson-loading-backdrop">
        <div className="lesson-loading-content">
          {/* Main loading spinner */}
          <div className="lesson-loading-spinner">
            <div className="lesson-spinner-ring"></div>
            <div className="lesson-spinner-ring"></div>
            <div className="lesson-spinner-ring"></div>
            <div className="lesson-spinner-center">
              <i className="fas fa-graduation-cap"></i>
            </div>
          </div>
          
          {/* Loading text */}
          <div className="lesson-loading-text">
            <h3>กำลังเตรียมบทเรียน...</h3>
            <p>โปรดรอสักครู่ เราจะพาคุณเข้าสู่การเรียนรู้ที่น่าตื่นเต้น</p>
          </div>
          
          {/* Progress dots */}
          <div className="lesson-loading-dots">
            <div className="dot dot-1"></div>
            <div className="dot dot-2"></div>
            <div className="dot dot-3"></div>
            <div className="dot dot-4"></div>
          </div>
          
          {/* Loading features */}
          <div className="lesson-loading-features">
            <div className="feature-item">
              <i className="fas fa-video feature-icon"></i>
              <span>กำลังโหลดวิดีโอ</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-file-alt feature-icon"></i>
              <span>เตรียมเนื้อหา</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-quiz feature-icon"></i>
              <span>โหลดแบบทดสอบ</span>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="lesson-loading-decoration">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
          <div className="floating-shape shape-5"></div>
        </div>
      </div>
    </div>
  );
};

export default LessonLoading;
