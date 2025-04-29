import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface LessonItem {
  id: number;
  lesson_id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
  video_url?: string;
  quiz_id?: number;
}

interface SectionData {
  id: number;
  subject_id: number;
  title: string;
  count: string;
  items: LessonItem[];
}

interface CurriculumProps {
  lessons: any[];
  subjectId: number;
}

const Curriculum = ({ lessons, subjectId }: CurriculumProps) => {
  const [lessonData, setLessonData] = useState<SectionData[]>([]);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchLessonProgress = async () => {
      try {
        const sections: SectionData[] = [];
        
        for (const lesson of lessons) {
          const progressResponse = await axios.get(
            `${apiURL}/api/learn/lesson/${lesson.lesson_id}/video-progress`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }
          );

          const items: LessonItem[] = [];
          
          // Add video lesson
          items.push({
            id: 0,
            lesson_id: lesson.lesson_id,
            title: `${lesson.order_number}.1 เนื้อหาบทเรียน`,
            lock: false,
            completed: progressResponse.data.progress?.video_completed || false,
            type: 'video',
            duration: progressResponse.data.progress?.video_completed ? "100%" : "0%",
            video_url: lesson.video_url
          });

          // Add quiz if exists
          if (lesson.quiz_id) {
            items.push({
              id: 1,
              lesson_id: lesson.lesson_id,
              title: `${lesson.order_number}.2 แบบทดสอบท้ายบท`,
              lock: !progressResponse.data.progress?.video_completed,
              completed: progressResponse.data.progress?.quiz_completed || false,
              type: 'quiz',
              duration: progressResponse.data.progress?.quiz_completed ? "100%" : "0%",
              quiz_id: lesson.quiz_id
            });
          }

          sections.push({
            id: lesson.lesson_id,
            subject_id: subjectId,
            title: `บทที่ ${lesson.order_number}: ${lesson.title}`,
            count: progressResponse.data.progress?.overall_completed ? "ผ่าน" : "ไม่ผ่าน",
            items
          });
        }

        setLessonData(sections);

        // Fetch overall subject progress
        const subjectResponse = await axios.get(
          `${apiURL}/api/learn/subject/${subjectId}/progress`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        if (subjectResponse.data.success) {
          setProgress(subjectResponse.data.progressPercentage);
          setCompletedCount(subjectResponse.data.completedLessons);
        }

      } catch (error) {
        console.error("Error fetching lesson progress:", error);
      }
    };

    fetchLessonProgress();
  }, [lessons, subjectId]);

  const toggleAccordion = (id: number) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="courses__curriculum-wrap">
      <div className="curriculum-header mb-4">
        <h3 className="title">บทเรียนในรายวิชา</h3>
        <div className="progress-info mt-3">
          <div className="progress" style={{ height: "10px" }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="d-flex justify-content-between mt-2">
            <span>{completedCount} / {lessons.length} บทเรียน</span>
            <span>{Math.round(progress)}% เสร็จสิ้น</span>
          </div>
        </div>
      </div>

      <div className="accordion">
        {lessonData.map((section) => (
          <div key={section.id} className="accordion-item">
            <h2 className="accordion-header">
              <button
                className={`accordion-button ${activeAccordion === section.id ? '' : 'collapsed'}`}
                onClick={() => toggleAccordion(section.id)}
              >
                <span className="section-title">{section.title}</span>
                <span className={`section-status ${section.count === "ผ่าน" ? "status-passed" : "status-not-passed"}`}>
                  {section.count}
                </span>
              </button>
            </h2>
            <div className={`accordion-collapse collapse ${activeAccordion === section.id ? 'show' : ''}`}>
              <div className="accordion-body">
                <ul className="list-wrap">
                  {section.items.map((item) => (
                    <li
                      key={`${section.id}-${item.id}`}
                      className={`course-item ${item.completed ? 'completed' : ''} ${item.lock ? 'locked' : ''}`}
                    >
                      <Link 
                        to={`/lesson/${item.lesson_id}`} 
                        className="course-item-link"
                      >
                        <span className="item-name">
                          {item.lock && <i className="fas fa-lock lock-icon"></i>}
                          {item.title}
                        </span>
                        <span className={`item-status ${item.completed ? "status-passed" : "status-not-passed"}`}>
                          {item.completed ? 'ผ่าน' : 'ไม่ผ่าน'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Curriculum;
