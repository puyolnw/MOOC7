import React, { useState } from "react";
import { Link } from "react-router-dom";
import './LessonFaq.css';

interface LessonFaqProps {
   onViewChange: (view: 'video' | 'quiz') => void;
}

interface DataType {
   id: number;
   title: string;
   show?: string;
   collapsed?: string;
   count: string;
   faq_details: {
      class_name?: string;
      lock: boolean;
      title: string;
      duration: string;
      completed?: boolean;
      type?: 'video' | 'quiz';
   }[]
}

const faq_data: DataType[] = [
   {
      id: 1,
      title: "แบบทดสอบก่อนเรียน",
      count: "100%",
      faq_details: [
         {
            class_name: "open-item",
            lock: false,
            title: "เริ่มทำแบบทดสอบก่อนเรียน",
            duration: "100%",
            completed: true,
            type: 'quiz'
         }
      ]
   },
   {
      id: 2,
      title: "เขียนโปรแกรมด้วย React ตอนที่ 1",
      count: "100%",
      faq_details: [
         {
            class_name: "open-item",
            lock: false,
            title: "1.1 เนื้อหาหลัก",
            duration: "100%",
            completed: true,
            type: 'video'
         },
         {
            class_name: "open-item",
            lock: false,
            title: "1.2 แบบฝึกหัดท้ายบท",
            duration: "100%",
            completed: true,
            type: 'quiz'
         }
      ]
   },
   {
      id: 3,
      title: "เขียนโปรแกรมด้วย React ตอนที่ 2",
      count: "0%",
      faq_details: [
         {
            class_name: "open-item",
            lock: false,
            title: "2.1 เนื้อหาหลัก",
            duration: "0%",
            completed: false,
            type: 'video'
         },
         {
            class_name: "open-item",
            lock: false,
            title: "2.2 แบบฝึกหัดท้ายบท",
            duration: "0%",
            completed: false,
            type: 'quiz'
         }
      ]
   },
   {
      id: 4,
      title: "เขียนโปรแกรมด้วย React ตอนที่ 3",
      count: "0%",
      faq_details: [
         {
            class_name: "open-item",
            lock: false,
            title: "3.1 เนื้อหาหลัก",
            duration: "0%",
            completed: false,
            type: 'video'
         },
         {
            class_name: "open-item",
            lock: false,
            title: "3.2 แบบฝึกหัดท้ายบท",
            duration: "0%",
            completed: false,
            type: 'quiz'
         }
      ]
   },
   {
      id: 5,
      title: "เขียนโปรแกรมด้วย React ตอนที่ 4",
      count: "0%",
      faq_details: [
         {
            class_name: "open-item",
            lock: false,
            title: "4.1 เนื้อหาหลัก",
            duration: "0%",
            completed: false,
            type: 'video'
         },
         {
            class_name: "open-item",
            lock: false,
            title: "4.2 แบบฝึกหัดท้ายบท",
            duration: "0%",
            completed: false,
            type: 'quiz'
         }
      ]
   },
   {
      id: 6,
      title: "แบบทดสอบหลังเรียน",
      count: "0%",
      faq_details: [
         {
            class_name: "open-item",
            lock: false,
            title: "เริ่มทำแบบทดสอบหลังเรียน",
            duration: "0%",
            completed: false,
            type: 'quiz'
         }
      ]
   }
];
const LessonFaq = ({ onViewChange }: LessonFaqProps) => {
   const [activeAccordion, setActiveAccordion] = useState<number | null>(1);

   const handleItemClick = (type: 'video' | 'quiz') => {
      onViewChange(type);
   };

   const toggleAccordion = (id: number) => {
      setActiveAccordion(activeAccordion === id ? null : id);
   };

   return (
      <div className="accordion" id="accordionExample">
         {faq_data.map((item) => (
            <div key={item.id} className="accordion-item">
               <h2 className="accordion-header">
                  <button 
                     className={`accordion-button ${activeAccordion === item.id ? '' : 'collapsed'}`}
                     type="button"
                     onClick={() => toggleAccordion(item.id)}
                  >
                     {item.title}
                     <span className="lesson-count">{item.count}</span>
                  </button>
               </h2>
               <div 
                  id={`collapseOne${item.id}`} 
                  className={`accordion-collapse collapse ${activeAccordion === item.id ? 'show' : ''}`}
               >
                  <div className="accordion-body">
                     <ul className="list-wrap">
                        {item.faq_details.map((list, i) => (
                           <li
                              key={i}
                              className={`course-item ${list.completed ? 'completed' : ''}`}
                              onClick={() => !list.lock && handleItemClick(list.type || 'video')}
                           >
                              <div className="course-item-link">
                                 <span className="item-name">{list.title}</span>
                                 <span className="item-meta duration">{list.duration}</span>
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