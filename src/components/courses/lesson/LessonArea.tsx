import { useState } from "react";
import { Link } from "react-router-dom";
import LessonVideo from "./LessonVideo";
import LessonFiles from "./LessonFiles";
import LessonQuestions from "./LessonQuestions";

interface LessonAreaProps {
  subject: any;
  currentLesson: any;
  lessonProgress: any;
  onChangeLesson: (lesson: any) => void;
  onLessonComplete: () => void;
}

const LessonArea = ({ 
  subject, 
  currentLesson, 
  lessonProgress,
  onChangeLesson,
  onLessonComplete
}: LessonAreaProps) => {
  const [activeTab, setActiveTab] = useState<string>("content");
  
  // ฟังก์ชันสำหรับดึง YouTube ID จาก URL
  const getYoutubeId = (url: string): string => {
    if (!url) return "";
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : "";
  };

  return (
    <section className="lesson-area section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="lesson-content">
              {/* วิดีโอบทเรียน */}
              <LessonVideo 
                onComplete={onLessonComplete}
                currentLesson={currentLesson.title}
                lessonId={currentLesson.lesson_id}
                youtubeId={getYoutubeId(currentLesson.video_url)}
                initialPosition={lessonProgress?.last_position_seconds || 0}
              />
              
              {/* แท็บเนื้อหา, ไฟล์, คำถาม */}
              <div className="lesson-tabs mt-4">
                <ul className="nav nav-tabs" id="lessonTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button 
                      className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
                      onClick={() => setActiveTab('content')}
                    >
                      <i className="fas fa-book-open me-2"></i>
                      เนื้อหาบทเรียน
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      className={`nav-link ${activeTab === 'files' ? 'active' : ''}`}
                      onClick={() => setActiveTab('files')}
                    >
                      <i className="fas fa-file-download me-2"></i>
                      ไฟล์ประกอบ
                      {currentLesson.file_count > 0 && (
                        <span className="badge bg-primary ms-2">{currentLesson.file_count}</span>
                      )}
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      className={`nav-link ${activeTab === 'questions' ? 'active' : ''}`}
                      onClick={() => setActiveTab('questions')}
                    >
                      <i className="fas fa-question-circle me-2"></i>
                      คำถาม-คำตอบ
                    </button>
                  </li>
                </ul>
                
                <div className="tab-content p-3 border border-top-0 rounded-bottom" id="lessonTabContent">
                  {activeTab === 'content' && (
                    <div className="lesson-description">
                      <h4 className="mb-3">{currentLesson.title}</h4>
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.description || '<p>ไม่มีเนื้อหาบทเรียน</p>' }} />
                      
                      {/* แสดงสถานะการเรียน */}
                      {lessonProgress?.completed ? (
                        <div className="alert alert-success mt-3">
                          <i className="fas fa-check-circle me-2"></i>
                          คุณได้เรียนบทเรียนนี้จบแล้ว
                          {lessonProgress.completion_date && (
                            <span className="ms-2">
                              เมื่อ {new Date(lessonProgress.completion_date).toLocaleString('th-TH')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="alert alert-info mt-3">
                          <i className="fas fa-info-circle me-2"></i>
                          เรียนบทเรียนนี้ให้จบเพื่อปลดล็อคบทเรียนถัดไป
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'files' && (
                    <LessonFiles lessonId={currentLesson.lesson_id} />
                  )}
                  
                  {activeTab === 'questions' && (
                    <LessonQuestions lessonId={currentLesson.lesson_id} />
                  )}
                </div>
              </div>
              
              {/* ปุ่มนำทาง */}
              <div className="lesson-navigation mt-4 d-flex justify-content-between">
                {/* ปุ่มบทเรียนก่อนหน้า */}
                {subject.lessons.findIndex(l => l.lesson_id === currentLesson.lesson_id) > 0 && (
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => {
                      const currentIndex = subject.lessons.findIndex(l => l.lesson_id === currentLesson.lesson_id);
                      if (currentIndex > 0) {
                        onChangeLesson(subject.lessons[currentIndex - 1]);
                      }
                    }}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    บทเรียนก่อนหน้า
                  </button>
                )}
                
                {/* ปุ่มบทเรียนถัดไป */}
                {subject.lessons.findIndex(l => l.lesson_id === currentLesson.lesson_id) < subject.lessons.length - 1 && (
                  <button 
                    className="btn btn-primary ms-auto"
                    onClick={() => {
                      const currentIndex = subject.lessons.findIndex(l => l.lesson_id === currentLesson.lesson_id);
                      if (currentIndex < subject.lessons.length - 1) {
                        onChangeLesson(subject.lessons[currentIndex + 1]);
                      }
                    }}
                    disabled={!subject.allow_all_lessons && !lessonProgress?.completed}
                  >
                    บทเรียนถัดไป
                    <i className="fas fa-arrow-right ms-2"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="lesson-sidebar">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">รายการบทเรียน</h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {subject.lessons.map((lesson) => (
                      <button
                        key={lesson.lesson_id}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                          currentLesson.lesson_id === lesson.lesson_id ? 'active' : ''
                        }`}
                        onClick={() => onChangeLesson(lesson)}
                        disabled={!subject.allow_all_lessons && !lesson.can_preview && !isLessonUnlocked(subject, lesson)}
                      >
                        <div>
                          <div className="d-flex align-items-center">
                            {currentLesson.lesson_id === lesson.lesson_id ? (
                              <i className="fas fa-play-circle me-2"></i>
                            ) : isLessonCompleted(lesson.lesson_id) ? (
                              <i className="fas fa-check-circle me-2 text-success"></i>
                            ) : (
                              <i className="far fa-circle me-2"></i>
                            )}
                            <span>{lesson.title}</span>
                          </div>
                          <small className="text-muted d-block mt-1">
                            {lesson.duration || '00:00'}
                          </small>
                        </div>
                        {!subject.allow_all_lessons && !lesson.can_preview && !isLessonUnlocked(subject, lesson) && (
                          <span className="badge bg-secondary">
                            <i className="fas fa-lock"></i>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* แสดงข้อมูลแบบทดสอบ (ถ้ามี) */}
              {(subject.preTest || subject.postTest) && (
                <div className="card mt-4">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">แบบทดสอบ</h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="list-group list-group-flush">
                      {subject.preTest && (
                        <Link 
                          to={`/quiz/${subject.preTest.quiz_id}`} 
                          className="list-group-item list-group-item-action"
                        >
                          <div className="d-flex align-items-center">
                            <i className="fas fa-clipboard-list me-2 text-primary"></i>
                            <div>
                              <span>แบบทดสอบก่อนเรียน</span>
                              <small className="text-muted d-block">
                                {subject.preTest.question_count} คำถาม
                              </small>
                            </div>
                          </div>
                        </Link>
                      )}
                      
                      {subject.postTest && (
                        <Link 
                          to={`/quiz/${subject.postTest.quiz_id}`} 
                          className={`list-group-item list-group-item-action ${
                            !isAllLessonsCompleted() ? 'disabled' : ''
                          }`}
                        >
                          <div className="d-flex align-items-center">
                            <i className="fas fa-clipboard-check me-2 text-success"></i>
                            <div>
                              <span>แบบทดสอบหลังเรียน</span>
                              <small className="text-muted d-block">
                                {subject.postTest.question_count} คำถาม
                              </small>
                            </div>
                          </div>
                          {!isAllLessonsCompleted() && (
                            <span className="badge bg-secondary">
                              <i className="fas fa-lock"></i>
                            </span>
                          )}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* แสดงความก้าวหน้าของรายวิชา */}
              <div className="card mt-4">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">ความก้าวหน้า</h5>
                </div>
                <div className="card-body">
                  <div className="progress mb-3" style={{ height: '20px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: `${calculateSubjectProgress()}%` }}
                      aria-valuenow={calculateSubjectProgress()} 
                      aria-valuemin={0} 
                      aria-valuemax={100}
                    >
                      {calculateSubjectProgress()}%
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>บทเรียนที่เรียนจบแล้ว:</span>
                    <span>{getCompletedLessonsCount()} / {subject.lessons.length}</span>
                  </div>
                </div>
              </div>
              
              {/* ปุ่มกลับไปหน้ารายวิชา */}
              <div className="mt-4">
                <Link to={`/subject-details/${subject.subject_id}`} className="btn btn-outline-secondary w-100">
                  <i className="fas fa-arrow-left me-2"></i>
                  กลับไปหน้ารายวิชา
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
  // ฟังก์ชันตรวจสอบว่าบทเรียนนี้ถูกปลดล็อคหรือยัง
  function isLessonUnlocked(subject: any, lesson: any): boolean {
    // ถ้าอนุญาตให้เรียนทุกบทเรียนได้ ให้ปลดล็อคทั้งหมด
    if (subject.allow_all_lessons) return true;
    
    // ถ้าเป็นบทเรียนแรก ให้ปลดล็อค
    if (lesson.order_number === 1) return true;
    
    // ตรวจสอบว่าบทเรียนก่อนหน้าเรียนจบแล้วหรือยัง
    const previousLessons = subject.lessons.filter(
      (l: any) => l.order_number < lesson.order_number
    );
    
    // ถ้าไม่มีบทเรียนก่อนหน้า ให้ปลดล็อค
    if (previousLessons.length === 0) return true;
    
    // ตรวจสอบว่าบทเรียนก่อนหน้าทั้งหมดเรียนจบแล้ว
    return previousLessons.every((l: any) => isLessonCompleted(l.lesson_id));
  }
  
  // ฟังก์ชันตรวจสอบว่าบทเรียนนี้เรียนจบแล้วหรือยัง
  function isLessonCompleted(lessonId: number): boolean {
    // ถ้าเป็นบทเรียนปัจจุบันและมีความก้าวหน้า
    if (currentLesson.lesson_id === lessonId && lessonProgress?.completed) {
      return true;
    }
    
    // ตรวจสอบจากข้อมูลความก้าวหน้าที่เก็บไว้ในหน้านี้
    // (ในกรณีจริงควรดึงข้อมูลจาก API หรือ state ที่เก็บความก้าวหน้าของทุกบทเรียน)
    
    // สมมติว่ามีฟังก์ชันหรือข้อมูลที่เก็บความก้าวหน้าของทุกบทเรียน
    // ในที่นี้จะใช้วิธีง่ายๆ โดยสมมติว่าบทเรียนที่มี order_number น้อยกว่าบทเรียนปัจจุบันเรียนจบแล้ว
    const currentLessonOrder = subject.lessons.find(
      (l: any) => l.lesson_id === currentLesson.lesson_id
    )?.order_number || 0;
    
    const targetLessonOrder = subject.lessons.find(
      (l: any) => l.lesson_id === lessonId
    )?.order_number || 0;
    
    return targetLessonOrder < currentLessonOrder;
  }
  
  // ฟังก์ชันตรวจสอบว่าเรียนจบทุกบทเรียนแล้วหรือยัง
  function isAllLessonsCompleted(): boolean {
    return subject.lessons.every((lesson: any) => isLessonCompleted(lesson.lesson_id));
  }
  
  // ฟังก์ชันคำนวณความก้าวหน้าของรายวิชา
  function calculateSubjectProgress(): number {
    const completedCount = getCompletedLessonsCount();
    return Math.round((completedCount / subject.lessons.length) * 100);
  }
  
  // ฟังก์ชันนับจำนวนบทเรียนที่เรียนจบแล้ว
  function getCompletedLessonsCount(): number {
    return subject.lessons.filter((lesson: any) => isLessonCompleted(lesson.lesson_id)).length;
  }
};

export default LessonArea;
