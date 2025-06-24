import React, { Dispatch, SetStateAction } from 'react';
import InstructorGrading from './InstructorGrading';

interface GradingPopupProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  attemptId: number | null;
}

const GradingPopup: React.FC<GradingPopupProps> = ({ isOpen, setIsOpen, attemptId }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary">
            <h5 className="modal-title text-white">
              <i className="fas fa-check-circle me-2"></i>
              ตรวจงานแบบทดสอบ
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-0">
            <InstructorGrading 
              isPopup={true} 
              selectedAttemptId={attemptId} 
              onClose={() => setIsOpen(false)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingPopup;
