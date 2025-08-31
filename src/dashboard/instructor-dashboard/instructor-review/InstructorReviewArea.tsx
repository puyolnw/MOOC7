"use client"
import { useState } from "react"
import IconPanelLayout from "../../dashboard-common/IconPanelLayout"
import { tab_title } from "../../../data/dashboard-data/InstructorReviewData"
import InstructorReviewTab from "./InstructorReviewTab"

const InstructorReviewArea = () => {

  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <IconPanelLayout>
      <div className="dashboard__content-wrap">
        <div className="dashboard__content-title">
          <h4 className="title">Reviews</h4>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="dashboard__nav-wrap">
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                {tab_title.map((tab: string, index: number) => (
                  <li key={index} onClick={() => handleTabClick(index)} className="nav-item" role="presentation">
                    <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="tab-content" id="myTabContent">
              <InstructorReviewTab activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>
    </IconPanelLayout>
  )
}

export default InstructorReviewArea
