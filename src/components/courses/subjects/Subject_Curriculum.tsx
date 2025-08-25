import { useState, useEffect } from "react";
import axios from "axios";

interface BigLessonItem {
  id: number;
  title: string;
  order_number?: number;
  weight_percentage: number;
  quiz?: {
    id: number;
    title: string;
    weight_percentage: number;
    progress?: {
      completed?: boolean;
    };
  };
  lessons: {
    id: number;
    title: string;
    order_number?: number;
    total_weight_in_biglesson: number;
    video_completed?: boolean;
    quiz?: {
      id: number;
      title: string;
      weight_percentage: number;
      progress?: {
        completed?: boolean;
      };
    };
  }[];
}

interface HierarchicalData {
  subject_id: number;
  subject_title: string;
  pre_test?: {
    quiz_id: number;
    title: string;
    weight_percentage: number;
    progress?: {
      completed?: boolean;
    };
  };
  post_test?: {
    quiz_id: number;
    title: string;
    weight_percentage: number;
    progress?: {
      completed?: boolean;
    };
  };
  big_lessons: BigLessonItem[];
}

interface CurriculumProps {
  subjectId: number;
}

const Curriculum = ({ subjectId }: CurriculumProps) => {
  const [hierarchicalData, setHierarchicalData] = useState<HierarchicalData | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchHierarchicalData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError("กรุณาเข้าสู่ระบบก่อน");
          return;
        }

        const response = await axios.get(
          `${apiURL}/api/learn/subject/${subjectId}/scores-hierarchical`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          setHierarchicalData(response.data.scoreStructure);
        } else {
          setError("ไม่สามารถดึงข้อมูลโครงสร้างบทเรียนได้");
        }
      } catch (error) {
        console.error("Error fetching hierarchical data:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHierarchicalData();
  }, [subjectId, apiURL]);

  const getProgressStatus = (completed: boolean | undefined) => {
    if (completed === true) return "เสร็จสิ้น";
    if (completed === false) return "ยังไม่เสร็จ";
    return "ยังไม่เริ่ม";
  };

  const getProgressColor = (completed: boolean | undefined) => {
    if (completed === true) return "text-success";
    if (completed === false) return "text-warning";
    return "text-muted";
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
        <p className="mt-3">กำลังโหลดโครงสร้างบทเรียน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (!hierarchicalData) {
    return (
      <div className="alert alert-info">
        <i className="fas fa-info-circle me-2"></i>
        ไม่พบข้อมูลโครงสร้างบทเรียน
      </div>
    );
  }

  return (
    <div className="curriculum-container">
      <div className="curriculum-header mb-4">
        <h4 className="mb-3">โครงสร้างบทเรียน</h4>
        <div className="progress-overview p-3 bg-light rounded">
          <div className="row">
            <div className="col-md-6">
              <h6>บทเรียนในรายวิชา</h6>
              <p className="mb-1">
                {hierarchicalData.big_lessons?.length || 0} / {hierarchicalData.big_lessons?.length || 0} บทเรียนหลัก
              </p>
            </div>
            <div className="col-md-6">
              <h6>ความคืบหน้าของคุณ</h6>
              <p className="mb-1">
                {hierarchicalData.big_lessons?.filter(bl => 
                  bl.lessons?.every(lesson => lesson.video_completed)
                ).length || 0}% เสร็จสิ้น
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-test Section */}
      {hierarchicalData.pre_test && (
        <div className="curriculum-section mb-4">
          <div className="section-header p-3 bg-primary text-white rounded">
            <h5 className="mb-0">
              <i className="fas fa-clipboard-check me-2"></i>
              ทดสอบก่อนเรียน
              <span className="badge bg-light text-primary ms-2">
                {hierarchicalData.pre_test.weight_percentage}%
              </span>
            </h5>
          </div>
          <div className="section-content p-3 border rounded">
            <div className="d-flex justify-content-between align-items-center">
              <span>{hierarchicalData.pre_test.title}</span>
              <span className={`badge ${getProgressColor(hierarchicalData.pre_test.progress?.completed)}`}>
                {getProgressStatus(hierarchicalData.pre_test.progress?.completed)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Big Lessons Sections */}
      {hierarchicalData.big_lessons?.map((bigLesson, index) => (
        <div key={bigLesson.id} className="curriculum-section mb-4">
          <div 
            className="section-header p-3 bg-secondary text-white rounded cursor-pointer"
            onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-book me-2"></i>
                บทเรียนหลัก {bigLesson.order_number}: {bigLesson.title}
                <span className="badge bg-light text-secondary ms-2">
                  {bigLesson.weight_percentage}%
                </span>
              </h5>
              <i className={`fas fa-chevron-${activeAccordion === index ? 'up' : 'down'}`}></i>
            </div>
          </div>
          
          {activeAccordion === index && (
            <div className="section-content p-3 border rounded">
              {/* Big Lesson Quiz */}
              {bigLesson.quiz && (
                <div className="lesson-item mb-3 p-2 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      <i className="fas fa-question-circle me-2"></i>
                      แบบทดสอบบทเรียนหลัก
                      <span className="badge bg-info ms-2">
                        {bigLesson.quiz.weight_percentage}%
                      </span>
                    </span>
                    <span className={`badge ${getProgressColor(bigLesson.quiz.progress?.completed)}`}>
                      {getProgressStatus(bigLesson.quiz.progress?.completed)}
                    </span>
                  </div>
                </div>
              )}

              {/* Sub Lessons */}
              {bigLesson.lessons?.map((lesson) => (
                <div key={lesson.id} className="lesson-item mb-3 p-2 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>
                      <i className="fas fa-play-circle me-2"></i>
                      บทเรียนย่อย {lesson.order_number}: {lesson.title}
                      <span className="badge bg-success ms-2">
                        {lesson.total_weight_in_biglesson}%
                      </span>
                    </span>
                    <span className={`badge ${getProgressColor(lesson.video_completed)}`}>
                      {getProgressStatus(lesson.video_completed)}
                    </span>
                  </div>
                  
                  {/* Lesson Quiz */}
                  {lesson.quiz && (
                    <div className="sub-lesson-item ms-4 p-2 bg-white rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <i className="fas fa-question-circle me-2"></i>
                          แบบทดสอบบทเรียนย่อย
                          <span className="badge bg-warning ms-2">
                            {lesson.quiz.weight_percentage}%
                          </span>
                        </span>
                        <span className={`badge ${getProgressColor(lesson.quiz.progress?.completed)}`}>
                          {getProgressStatus(lesson.quiz.progress?.completed)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Post-test Section */}
      {hierarchicalData.post_test && (
        <div className="curriculum-section mb-4">
          <div className="section-header p-3 bg-success text-white rounded">
            <h5 className="mb-0">
              <i className="fas fa-clipboard-list me-2"></i>
              ทดสอบหลังเรียน
              <span className="badge bg-light text-success ms-2">
                {hierarchicalData.post_test.weight_percentage}%
              </span>
            </h5>
          </div>
          <div className="section-content p-3 border rounded">
            <div className="d-flex justify-content-between align-items-center">
              <span>{hierarchicalData.post_test.title}</span>
              <span className={`badge ${getProgressColor(hierarchicalData.post_test.progress?.completed)}`}>
                {getProgressStatus(hierarchicalData.post_test.progress?.completed)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Curriculum;
