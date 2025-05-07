import React, { Dispatch, SetStateAction } from 'react';
import InstructorGrading from './InstructorGrading';
import './GradingPopup.css';

interface GradingPopupProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  attemptId: number | null;
}

const GradingPopup: React.FC<GradingPopupProps> = ({ isOpen, setIsOpen, attemptId }) => {
  if (!isOpen) return null;

  return (
    <div className="grading-popup-overlay">
      <div className="grading-popup-container">
        <div className="grading-popup-header">
          <h3>ตรวจงานแบบทดสอบ</h3>
          <button 
            className="grading-popup-close" 
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="grading-popup-content">
          <InstructorGrading 
            isPopup={true} 
            selectedAttemptId={attemptId} 
            onClose={() => setIsOpen(false)} 
          />
        </div>
      </div>
    </div>
  );
};

export default GradingPopup;
