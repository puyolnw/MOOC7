import { useState } from "react"
import IconPanelLayout from "../../dashboard-common/IconPanelLayout"
import InstructorGrading from "./InstructorGrading"
import Gradingpopup from "./Gradingpopup"
import './InstructorGrading.css'

const InstructorGradingArea = () => {
  const [isGradingPopupOpen, setIsGradingPopupOpen] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);

  const handleOpenGrading = (attemptId: number) => {
    setSelectedAttemptId(attemptId);
    setIsGradingPopupOpen(true);
  };

  return (
    <IconPanelLayout>
      <div className="dashboard__content-wrap">
        <div className="dashboard__content-title">
          <h4 className="title">ตรวจงานแบบทดสอบพิเศษ</h4>
        </div>
        <InstructorGrading 
          isPopup={false} 
          onOpenGrading={handleOpenGrading} 
        />
      </div>

      {/* Grading Popup */}
      <Gradingpopup 
        isOpen={isGradingPopupOpen} 
        setIsOpen={setIsGradingPopupOpen} 
        attemptId={selectedAttemptId} 
      />
    </IconPanelLayout>
  )
}

export default InstructorGradingArea
