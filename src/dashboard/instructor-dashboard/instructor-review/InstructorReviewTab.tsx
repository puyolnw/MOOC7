import React from 'react';

interface InstructorReviewTabProps {
  activeTab: number;
}

const InstructorReviewTab: React.FC<InstructorReviewTabProps> = ({ activeTab }) => {
  return (
    <div className={`tab-pane fade ${activeTab === 0 ? "show active" : ""}`} id="itemOne-tab-pane" role="tabpanel" aria-labelledby="itemOne-tab">
      <div className="dashboard__review-table">
        <p>Review content will be displayed here based on active tab: {activeTab}</p>
      </div>
    </div>
  );
};

export default InstructorReviewTab;
