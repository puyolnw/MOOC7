import React, { useState } from "react";
import { Link } from "react-router-dom";
import './LessonFaq.css';

interface LessonItem {
  id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
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
}

const LessonFaq = ({ onViewChange, lessonData, onSelectLesson }: LessonFaqProps) => {
   const [activeAccordion, setActiveAccordion] = useState<number | null>(1);

   const handleItemClick = (sectionId: number, item: LessonItem) => {
      if (!item.lock) {
        onSelectLesson(sectionId, item.id, item.title, item.type);
      }
   };

   const toggleAccordion = (id: number) => {
      setActiveAccordion(activeAccordion === id ? null : id);
   };

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
                              className={`course-item ${item.completed ? 'completed' : ''}`}
                              onClick={() => handleItemClick(section.id, item)}
                           >
                              <div className="course-item-link">
                                 <span className="item-name">{item.title}</span>
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
