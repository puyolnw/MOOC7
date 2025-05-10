import { useState, useEffect } from "react";
import './LessonFaq.css';

interface LessonItem {
  id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
  status?: 'passed' | 'failed' | 'awaiting_review'; // เพิ่มฟิลด์ status
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

const LessonFaq = ({ lessonData, onSelectLesson }: LessonFaqProps) => {
   const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

   const handleItemClick = (sectionId: number, item: LessonItem) => {
      if (!item.lock) {
        onSelectLesson(sectionId, item.id, item.title, item.type);
      }
   };

   const toggleAccordion = (id: number) => {
      setActiveAccordion(activeAccordion === id ? null : id);
   };

   // เมื่อโหลดหน้า ให้เปิดแอคคอร์เดียนที่มีบทเรียนปัจจุบัน (บทแรกที่ยังไม่เสร็จ)
   useEffect(() => {
     for (const section of lessonData) {
       for (const item of section.items) {
         if (!item.completed) {
           setActiveAccordion(section.id);
           return;
         }
       }
     }
   }, [lessonData]); // เพิ่ม dependency เป็น lessonData

   // ในส่วนของการแสดงผลผ
// แก้ไข interface LessonItem เพื่อเพิ่มฟิลด์ status
interface LessonItem {
  id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
  status?: 'passed' | 'failed' | 'awaiting_review'; // เพิ่มฟิลด์ status
}

// แก้ไขส่วนที่แสดงสถานะของแบบทดสอบ
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
            <span className="section-title">{section.title}</span>
            <span className={`section-status ${
              section.count === "ผ่าน" ? "status-passed" : 
              section.count === "รอตรวจ" ? "status-awaiting" : "status-not-passed"
            }`}>
              {section.count}
            </span>
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
                  onClick={() => handleItemClick(section.id, item)}
                >
                  <div className="course-item-link">
                    <span className="item-name">
                      {item.lock && <i className="fas fa-lock lock-icon"></i>}
                      {item.title}
                    </span>
                    <span className={`item-status ${
                      item.status === 'passed' ? "status-passed" : 
                      item.status === 'awaiting_review' ? "status-awaiting" : "status-not-passed"
                    }`}>
                      {item.status === 'passed' ? 'ผ่าน' : 
                       item.status === 'awaiting_review' ? 'รอตรวจ' : 'ไม่ผ่าน'}
                    </span>
                  </div>
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
