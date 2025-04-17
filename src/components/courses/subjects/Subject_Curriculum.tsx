import { useState } from "react";
import VideoPopup from "../../../modals/VideoPopup";
import { Link } from "react-router-dom";

interface Lesson {
  lesson_id: number;
  title: string;
  order_number: number;
  video_url?: string;
  can_preview: boolean;
  file_count: number;
}

interface CurriculumProps {
  lessons: Lesson[];
}

const Curriculum = ({ lessons }: CurriculumProps) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState("Ml4XCF-JS0k");
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const toggleAccordion = (id: number) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // ฟังก์ชันสำหรับดึง YouTube video ID จาก URL
  const getYoutubeVideoId = (url?: string) => {
    if (!url) return "Ml4XCF-JS0k";
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11)
      ? match[2]
      : "Ml4XCF-JS0k";
  };

  // เรียงลำดับบทเรียนตาม order_number
  const sortedLessons = [...lessons].sort((a, b) => a.order_number - b.order_number);

  const handlePlayVideo = (videoUrl?: string) => {
    if (videoUrl) {
      setCurrentVideoId(getYoutubeVideoId(videoUrl));
      setIsVideoOpen(true);
    }
  };

  return (
    <>
      <div className="courses__curriculum-wrap">
        <h3 className="title">บทเรียนในรายวิชา</h3>
        <p>รายวิชานี้ประกอบด้วยบทเรียนทั้งหมด {lessons.length} บทเรียน ซึ่งแต่ละบทเรียนจะมีเนื้อหาและแบบทดสอบที่ออกแบบมาเพื่อให้ผู้เรียนได้รับความรู้และทักษะอย่างครบถ้วน</p>
        
        {sortedLessons.length > 0 ? (
          <div className="accordion" id="accordionExample">
            {sortedLessons.map((lesson, index) => (
              <div key={lesson.lesson_id} className="accordion-item">
                <h2 className="accordion-header" id={`heading${lesson.lesson_id}`}>
                  <button
                    className={`accordion-button ${openAccordion === lesson.lesson_id ? "" : "collapsed"}`}
                    type="button"
                    onClick={() => toggleAccordion(lesson.lesson_id)}
                    aria-expanded={openAccordion === lesson.lesson_id}
                    aria-controls={`collapse${lesson.lesson_id}`}
                  >
                    บทที่ {index + 1}: {lesson.title}
                  </button>
                </h2>
                <div
                  id={`collapse${lesson.lesson_id}`}
                  className={`accordion-collapse collapse ${openAccordion === lesson.lesson_id ? "show" : ""}`}
                  aria-labelledby={`heading${lesson.lesson_id}`}
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <ul className="list-wrap">
                      <li className={`course-item ${lesson.can_preview ? "open-item" : ""}`}>
                        {lesson.can_preview ? (
                          <a 
                            onClick={() => handlePlayVideo(lesson.video_url)} 
                            style={{ cursor: "pointer" }} 
                            className="course-item-link"
                          >
                            <span className="item-name">ดูตัวอย่างบทเรียน</span>
                            <div className="course-item-meta">
                              <span className="item-meta duration">
                                {lesson.video_url && <i className="fas fa-play-circle"></i>}
                              </span>
                            </div>
                          </a>
                        ) : (
                          <Link to={`/lesson/${lesson.lesson_id}`} className="course-item-link">
                            <span className="item-name">เข้าสู่บทเรียน</span>
                            <div className="course-item-meta">
                              <span className="item-meta duration">
                                {lesson.video_url && <i className="fas fa-play-circle"></i>}
                              </span>
                              <span className="item-meta course-item-status">
                                <img src="/assets/img/icons/lock.svg" alt="icon" />
                              </span>
                            </div>
                          </Link>
                        )}
                      </li>
                      {lesson.file_count > 0 && (
                        <li className="course-item">
                          <div className="course-item-info">
                            <span className="item-name">
                              <i className="fas fa-file-alt me-2"></i>
                              เอกสารประกอบการเรียน: {lesson.file_count} ไฟล์
                            </span>
                          </div>
                        </li>
                      )}
                      <li className="course-item">
                        <Link to={`/lesson/${lesson.lesson_id}`} className="course-item-link">
                          <span className="item-name">รายละเอียดบทเรียน</span>
                          <div className="course-item-meta">
                            <i className="fas fa-arrow-right"></i>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            ยังไม่มีบทเรียนในรายวิชานี้
          </div>
        )}
      </div>
      <VideoPopup
        isVideoOpen={isVideoOpen}
        setIsVideoOpen={setIsVideoOpen}
        videoId={currentVideoId}
      />
    </>
  );
};

export default Curriculum;
