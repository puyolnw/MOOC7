import React, { useState } from "react";
import VideoPopup from "../../../modals/VideoPopup";
import { Link } from "react-router-dom";

interface DataType {
   id: number;
   title: string;
   faq_details: {
      class_name?: string;
      lock: boolean;
      title: string;
      duration: string;
   }[];
}

const faq_data: DataType[] = [
   {
      id: 1,
      title: "แบบทดสอบก่อนเรียน",
      faq_details: [
         {
            class_name: "open-item",
            lock: false,
            title: "แบบทดสอบก่อนเรียน",
            duration: "10:00",
         },
      ],
   },
   {
      id: 2,
      title: "บทนำ",
      faq_details: [
         {
            class_name: "open-item",
            lock: false,
            title: "แนะนำหลักสูตร",
            duration: "03:03",
         },
         {
            lock: true,
            title: "สร้างแอป React ง่ายๆ",
            duration: "07:48",
         },
         {
            lock: true,
            title: "ตอบสนองต่อส่วนที่เหลือของเรา",
            duration: "10:48",
         },
      ],
   },
   {
      id: 3,
      title: "บทที่ 2",
      faq_details: [
         {
            lock: true,
            title: "Course Installation",
            duration: "03:03",
         },
         {
            lock: true,
            title: "Create a Simple React App",
            duration: "07:48",
         },
         {
            lock: true,
            title: "React for the Rest of us",
            duration: "10:48",
         },
      ],
   },
   {
      id: 4,
      title: "แบบทดสอบหลังเรียน",
      faq_details: [
         {
            lock: true,
            title: "Course Installation",
            duration: "03:03",
         },
         {
            lock: true,
            title: "Create a Simple React App",
            duration: "07:48",
         },
         {
            lock: true,
            title: "React for the Rest of us",
            duration: "10:48",
         },
      ],
   },
];

const Curriculum = () => {
   const [isVideoOpen, setIsVideoOpen] = useState(false);
   const [openAccordion, setOpenAccordion] = useState<number | null>(null);

   const toggleAccordion = (id: number) => {
      setOpenAccordion((prev) => (prev === id ? null : id));
   };

   return (
      <>
         <div className="courses__curriculum-wrap">
            <h3 className="title">หลักสูตร</h3>
            <p>
               ความเจ็บปวดนั้นก็เจ็บปวดในตัวของมันเอง ความเจ็บปวดที่เกิดขึ้นกับชนชั้นสูงนั้นรุนแรง แต่เกิดขึ้นในลักษณะที่บางครั้งต้องทนทุกข์ทรมานและเจ็บปวดอย่างมาก และบางคนก็ทนทุกข์ทรมานจนหยุดหายใจไป เสียงหัวเราะนั้นไพเราะและมีชีวิตชีวา และผู้เป็นแม่ก็มีความประพฤติดี
            </p>
            <div className="accordion" id="accordionExample">
               {faq_data.map((item) => (
                  <div key={item.id} className="accordion-item">
                     <h2 className="accordion-header" id={`headingOne${item.id}`}>
                        <button
                           className={`accordion-button ${openAccordion === item.id ? "" : "collapsed"}`}
                           type="button"
                           onClick={() => toggleAccordion(item.id)}
                           aria-expanded={openAccordion === item.id}
                           aria-controls={`collapseOne${item.id}`}
                        >
                           {item.title}
                        </button>
                     </h2>
                     <div
                        id={`collapseOne${item.id}`}
                        className={`accordion-collapse collapse ${openAccordion === item.id ? "show" : ""}`}
                        aria-labelledby={`headingOne${item.id}`}
                        data-bs-parent="#accordionExample"
                     >
                        <div className="accordion-body">
                           <ul className="list-wrap">
                              {item.faq_details.map((list, i) => (
                                 <React.Fragment key={i}>
                                    {list.lock ? (
                                       <li className="course-item">
                                          <Link to="#" className="course-item-link">
                                             <span className="item-name">{list.title}</span>
                                             <div className="course-item-meta">
                                                <span className="item-meta duration">{list.duration}</span>
                                                <span className="item-meta course-item-status">
                                                   <img src="/assets/img/icons/lock.svg" alt="icon" />
                                                </span>
                                             </div>
                                          </Link>
                                       </li>
                                    ) : (
                                       <li className="course-item open-item">
                                          <a
                                             onClick={() => setIsVideoOpen(true)}
                                             style={{ cursor: "pointer" }}
                                             className="course-item-link popup-video"
                                          >
                                             <span className="item-name">{list.title}</span>
                                             <div className="course-item-meta">
                                                <span className="item-meta duration">{list.duration}</span>
                                             </div>
                                          </a>
                                       </li>
                                    )}
                                 </React.Fragment>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
         <VideoPopup
            isVideoOpen={isVideoOpen}
            setIsVideoOpen={setIsVideoOpen}
            videoId={"Ml4XCF-JS0k"}
         />
      </>
   );
};

export default Curriculum;