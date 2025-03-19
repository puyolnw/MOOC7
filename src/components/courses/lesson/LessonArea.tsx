import { useState } from "react";
import LessonFaq from "./LessonFaq";
import LessonNavTav from "./LessonNavTav";
import LessonVideo from "./LessonVideo";
import LessonQuiz from "./LessonQuiz";
import "./LessonArea.css";

const LessonArea = () => {
   const [currentView, setCurrentView] = useState<'video' | 'quiz'>('video');
   const [progress, setProgress] = useState<number>(40); // ตัวอย่างความคืบหน้า 50%
   const [currentLesson, setCurrentLesson] = useState<string>("1.1 เนื้อหาหลัก");

   const calculateTotalProgress = () => {
      return progress; // ใช้ตัวแปร progress
   };

   const handleLessonComplete = () => {
      setProgress((prev) => Math.min(prev + 10, 100)); // เพิ่มความคืบหน้า
   };

   return (
      <section className="lesson__area section-pb-120">
         <div className="container-fluid">
            <div className="row gx-4"> {/* เพิ่มระยะห่างระหว่าง sidebar และ main content */}
               {/* Sidebar */}
               <div className="col-xl-3 col-lg-4 lesson__sidebar">
                  <div className="lesson__content">
                     <h2 className="title">เนื้อหาบทเรียน</h2>
                     <LessonFaq onViewChange={setCurrentView} />
                     <div className="lesson__progress">
                        <h4>ความคืบหน้า</h4>
                        <div className="progress-bar-wrapper">
                           <div className="progress-bar" style={{ width: `${calculateTotalProgress()}%` }}></div>
                        </div>
                        <p className="progress-text">{calculateTotalProgress().toFixed(2)}%</p>
                     </div>
                  </div>
               </div>
               {/* Main Content */}
               <div className="col-xl-9 col-lg-8 lesson__main">
                  <div className="lesson__video-wrap">
                     {currentView === 'quiz' ? (
                        <LessonQuiz />
                     ) : (
                        <LessonVideo
                           onComplete={handleLessonComplete}
                           currentLesson={currentLesson}
                        />
                     )}
                  </div>
                  <div className="lesson__nav-tab fixed-nav-tab">
                     <LessonNavTav />
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default LessonArea;