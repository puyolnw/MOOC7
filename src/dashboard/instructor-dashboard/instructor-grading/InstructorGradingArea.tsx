import { useState } from "react"
import DashboardBanner from "../../dashboard-common/DashboardBanner"
import DashboardSidebar from "../../dashboard-common/DashboardSidebar"
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
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <div className="col-lg-9">
              <div className="dashboard__content-wrap">
                <div className="dashboard__content-title">
                  <h4 className="title">ตรวจงานแบบทดสอบพิเศษ</h4>
                </div>
                <InstructorGrading 
                  isPopup={false} 
                  onOpenGrading={handleOpenGrading} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grading Popup */}
      <Gradingpopup 
        isOpen={isGradingPopupOpen} 
        setIsOpen={setIsGradingPopupOpen} 
        attemptId={selectedAttemptId} 
      />
    </section>
  )
}

export default InstructorGradingArea
