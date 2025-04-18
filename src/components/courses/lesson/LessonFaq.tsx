import { useState } from "react";
import './LessonFaq.css';

interface LessonItem {
  id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
  lessonId?: number;
  quizId?: number;
}

interface SectionData {
  id: number;
  title: string;
  count: string;
  items: LessonItem[];
}

interface LessonFaqProps {
  onViewChange: (view: 'video' | 'quiz') => void;
  lessonData: SectionData[];
  onSelectLesson: (sectionId: number, itemId: number, title: string, type: 'video' | 'quiz') => void;
  currentLessonId?: string;
}

const LessonFaq = ({ lessonData, onSelectLesson, currentLessonId }: LessonFaqProps) => {
   const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

   // เมื่อโหลดครั้งแรก ให้เปิดบทที่กำลังเรียนอยู่
   useState(() => {
     if (currentLessonId) {
       const [sectionId] = currentLessonId.split('-').map(Number);
       setActiveAccordion(sectionId);
     } else if (lessonData.length > 0) {
       // ถ้าไม่มีบทเรียนที่กำลังเรียน ให้เปิดบทแรก
       setActiveAccordion(lessonData[0].id);
     }
   });

   const handleItemClick = (sectionId: number, item: LessonItem) => {
      if (!item.lock) {
        onSelectLesson(sectionId, item.id, item.title, item.type);
      }
   };

   const toggleAccordion = (id: number) => {
      setActiveAccordion(activeAccordion === id ? null : id);
   };

   // ในส่วนของการแสดงผลใน LessonFaq component
return (
   <div className="accordion" id="accordionExample">
     {lessonData.map((section) => (
       <div key={section.id} className="accordion-item">
         <h2 className="accordion-header">
           <button 
             className={`accordion-button ${activeAccordion === section.id ? '' : 'collapsed'}`}
             type="button"
             onClick={() => toggleAccordion(section.id)}
           >
             {section.title}
             <span className="lesson-count">{section.count}</span>
           </button>
         </h2>
         <div 
           id={`collapseOne${section.id}`} 
           className={`accordion-collapse collapse ${activeAccordion === section.id ? 'show' : ''}`}
         >
           <div className="accordion-body">
             <ul className="list-wrap">
               {section.items.map((item) => (
                 <li
                   key={item.id}
                   className={`course-item ${item.completed ? 'completed' : ''} ${item.lock ? 'locked' : ''}`}
                   onClick={() => !item.lock && handleItemClick(section.id, item)}
                 >
                   <div className="course-item-link">
                     <span className="item-name">
                       {item.lock && <i className="fas fa-lock me-2"></i>}
                       {item.title}
                     </span>
                     <span className="item-meta duration">{item.duration}</span>
                   </div>
                   {!item.completed && item.duration !== "0%" && (
                     <div className="item-progress-mini">
                       <div 
                         className="item-progress-bar" 
                         style={{ width: item.duration }}
                       ></div>
                     </div>
                   )}
                 </li>
               ))}
             </ul>
           </div>
         </div>
       </div>
     ))}
   </div>
 );
 
};

export default LessonFaq;
