import { useState } from "react";
import Overview from "../course-details/Overview";
import Reviews from "../course-details/Reviews";
import Instructors from "../course-details/Instructors";

const tab_title: string[] = ["ข้อมูลทั่วไป", "ผู้สอน", "ความคิดเห็น"];

interface LessonNavTavProps {
  description?: string;
  instructors?: any[];
}

const LessonNavTav = ({ description = "", instructors = [] }: LessonNavTavProps) => {
   const [activeTab, setActiveTab] = useState(0);

   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   return (
      <div className="courses__details-content lesson__details-content">
         <ul className="nav nav-tabs" id="myTab" role="tablist">
            {tab_title.map((tab, index) => (
               <li key={index} onClick={() => handleTabClick(index)} className="nav-item" role="presentation">
                  <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
               </li>
            ))}
         </ul>
         <div className="tab-content" id="myTabContent">
            <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`} id="overview-tab-pane" role="tabpanel" aria-labelledby="overview-tab">
               <Overview description={description} />
            </div>
            <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`} id="overview-tab-pane" role="tabpanel" aria-labelledby="overview-tab">
               <Instructors instructors={instructors} />
            </div>
            <div className={`tab-pane fade ${activeTab === 2 ? 'show active' : ''}`} id="overview-tab-pane" role="tabpanel" aria-labelledby="overview-tab">
               <Reviews />
            </div>
         </div>
      </div>
   )
}

export default LessonNavTav
