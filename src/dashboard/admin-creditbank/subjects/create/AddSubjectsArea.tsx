import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";

// ข้อมูลรายวิชา
interface SubjectData {
  title: string;
  description: string;
  lessons: SelectedLesson[];
  preTestId: string | null;
  postTestId: string | null;
  instructors: Instructor[];
  allowAllLessons: boolean;
}

// บทเรียนที่เลือก
interface SelectedLesson {
  id: string;
  title: string;
  order: number;
}

// แบบทดสอบ
interface Quiz {
  id: string;
  title: string;
  questions: number;
}

// อาจารย์
interface Instructor {
  id: string;
  name: string;
  position: string;
  avatar: string;
}

// ข้อมูลบทเรียนที่มีอยู่ในระบบ
const availableLessons = [
  { id: "lesson1", title: "แนะนำการใช้งาน React Hooks" },
  { id: "lesson2", title: "การสร้าง Component ใน React" },
  { id: "lesson3", title: "การจัดการ State และ Props" },
  { id: "lesson4", title: "การวิเคราะห์ข้อมูลเบื้องต้นด้วย Python" },
  { id: "lesson5", title: "การใช้งาน Pandas สำหรับจัดการข้อมูล" },
  { id: "lesson6", title: "การสร้างแบบจำลองด้วย Scikit-learn" },
  { id: "lesson7", title: "หลักการตลาดดิจิทัลเบื้องต้น" },
  { id: "lesson8", title: "การวิเคราะห์พฤติกรรมผู้บริโภคออนไลน์" },
  { id: "lesson9", title: "กลยุทธ์การตลาดบนสื่อสังคมออนไลน์" },
  { id: "lesson10", title: "การวางแผนแคมเปญการตลาดดิจิทัล" },
];

// ข้อมูลแบบทดสอบที่มีอยู่ในระบบ
const availableQuizzes = [
  { id: "quiz1", title: "แบบทดสอบ React พื้นฐาน", questions: 10 },
  { id: "quiz2", title: "แบบทดสอบ TypeScript", questions: 8 },
  { id: "quiz3", title: "แบบทดสอบ JavaScript", questions: 15 },
  { id: "quiz4", title: "แบบทดสอบ HTML และ CSS", questions: 12 },
  { id: "quiz5", title: "แบบทดสอบ Node.js", questions: 7 },
  { id: "quiz6", title: "แบบทดสอบการตลาดดิจิทัล", questions: 20 },
  { id: "quiz7", title: "แบบทดสอบการวิเคราะห์ข้อมูล", questions: 15 },
];

// ข้อมูลอาจารย์ที่มีอยู่ในระบบ
const availableInstructors = [
  { id: "inst1", name: "อาจารย์สมชาย ใจดี", position: "อาจารย์ประจำคณะวิทยาการคอมพิวเตอร์", avatar: "/assets/img/instructor/instructor_01.jpg" },
  { id: "inst2", name: "ดร.วิชัย นักวิจัย", position: "รองศาสตราจารย์", avatar: "/assets/img/instructor/instructor_02.jpg" },
  { id: "inst3", name: "รศ.ดร.มานี ธุรกิจ", position: "คณบดีคณะบริหารธุรกิจ", avatar: "/assets/img/instructor/instructor_03.jpg" },
  { id: "inst4", name: "อาจารย์แอนนา สมิท", position: "อาจารย์พิเศษ", avatar: "/assets/img/instructor/instructor_04.jpg" },
  { id: "inst5", name: "อาจารย์ศิลปิน วาดเก่ง", position: "หัวหน้าภาควิชาศิลปะดิจิทัล", avatar: "/assets/img/instructor/instructor_05.jpg" },
  { id: "inst6", name: "ผศ.ดร.บริหาร จัดการ", position: "ผู้ช่วยศาสตราจารย์", avatar: "/assets/img/instructor/instructor_06.jpg" },
];

const AddSubjectsArea: React.FC = () => {
  const navigate = useNavigate();
  
  // สถานะสำหรับข้อมูลรายวิชา
  const [subjectData, setSubjectData] = useState<SubjectData>({
    title: "",
    description: "",
    lessons: [],
    preTestId: null,
    postTestId: null,
    instructors: [],
    allowAllLessons: true
  });
  
  // สถานะสำหรับการตรวจสอบความถูกต้อง
  const [errors, setErrors] = useState({
    title: "",
    lessons: "",
    instructors: ""
  });
  
  // สถานะสำหรับ Modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [quizType, setQuizType] = useState<"pre" | "post">("pre");
  
  // สถานะสำหรับการค้นหา
  const [lessonSearchTerm, setLessonSearchTerm] = useState("");
  const [quizSearchTerm, setQuizSearchTerm] = useState("");
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  
  // กรองบทเรียนตามคำค้นหา
  const filteredLessons = availableLessons.filter(lesson => 
    lesson.title.toLowerCase().includes(lessonSearchTerm.toLowerCase())
  );
  
  // กรองแบบทดสอบตามคำค้นหา
  const filteredQuizzes = availableQuizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(quizSearchTerm.toLowerCase())
  );
  
  // กรองอาจารย์ตามคำค้นหา
  const filteredInstructors = availableInstructors.filter(instructor => 
    instructor.name.toLowerCase().includes(instructorSearchTerm.toLowerCase())
  );
  
  // เปลี่ยนแปลงข้อมูลรายวิชา
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSubjectData({
      ...subjectData,
      [name]: value
    });
    
    // ล้างข้อผิดพลาด
    if (name === "title") {
      setErrors({
        ...errors,
        title: ""
      });
    }
  };
  
  // เปลี่ยนแปลงการตั้งค่า
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSubjectData({
      ...subjectData,
      [name]: checked
    });
  };
  
  // เลือกบทเรียน
  const handleSelectLesson = (lesson: { id: string; title: string }) => {
    // ตรวจสอบว่าบทเรียนนี้ถูกเลือกไปแล้วหรือไม่
    if (subjectData.lessons.some(l => l.id === lesson.id)) {
      return;
    }
    
    // เพิ่มบทเรียนใหม่โดยกำหนด order เป็นลำดับถัดไป
    const newLesson: SelectedLesson = {
      id: lesson.id,
      title: lesson.title,
      order: subjectData.lessons.length + 1
    };
    
    setSubjectData({
      ...subjectData,
      lessons: [...subjectData.lessons, newLesson]
    });
    
    // ล้างข้อผิดพลาด
    setErrors({
      ...errors,
      lessons: ""
    });
    
    // ปิด Modal
    setShowLessonModal(false);
  };
  
  // ลบบทเรียน
  const handleRemoveLesson = (id: string) => {
    // ลบบทเรียน
    const updatedLessons = subjectData.lessons.filter(lesson => lesson.id !== id);
    
    // ปรับลำดับใหม่
    const reorderedLessons = updatedLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));
    
    setSubjectData({
      ...subjectData,
      lessons: reorderedLessons
    });
  };
  
  // เปลี่ยนลำดับบทเรียน
  const handleReorderLesson = (id: string, newOrder: number) => {
    // ตรวจสอบว่า newOrder อยู่ในช่วงที่ถูกต้อง
    if (newOrder < 1 || newOrder > subjectData.lessons.length) {
      return;
    }
    
    // หาบทเรียนที่ต้องการเปลี่ยนลำดับ
    const lessonToMove = subjectData.lessons.find(lesson => lesson.id === id);
    if (!lessonToMove) return;
    
    const oldOrder = lessonToMove.order;
    
    // ปรับลำดับบทเรียนทั้งหมด
    const updatedLessons = subjectData.lessons.map(lesson => {
      if (lesson.id === id) {
        // บทเรียนที่ต้องการเปลี่ยนลำดับ
        return { ...lesson, order: newOrder };
      } else if (oldOrder < newOrder && lesson.order > oldOrder && lesson.order <= newOrder) {
        // บทเรียนที่อยู่ระหว่างลำดับเก่าและลำดับใหม่ (กรณีเลื่อนลง)
        return { ...lesson, order: lesson.order - 1 };
      } else if (oldOrder > newOrder && lesson.order >= newOrder && lesson.order < oldOrder) {
        // บทเรียนที่อยู่ระหว่างลำดับใหม่และลำดับเก่า (กรณีเลื่อนขึ้น)
        return { ...lesson, order: lesson.order + 1 };
      }
      return lesson;
    });
    
    // เรียงลำดับบทเรียนใหม่
    updatedLessons.sort((a, b) => a.order - b.order);
    
    setSubjectData({
      ...subjectData,
      lessons: updatedLessons
    });
  };
  
  // เลือกแบบทดสอบ
  const handleSelectQuiz = (quiz: Quiz) => {
    if (quizType === "pre") {
      setSubjectData({
        ...subjectData,
        preTestId: quiz.id
      });
    } else {
      setSubjectData({
        ...subjectData,
        postTestId: quiz.id
      });
    }
    
    // ปิด Modal
    setShowQuizModal(false);
  };
  
  // ลบแบบทดสอบ
  const handleRemoveQuiz = (type: "pre" | "post") => {
    if (type === "pre") {
      setSubjectData({
        ...subjectData,
        preTestId: null
      });
    } else {
      setSubjectData({
        ...subjectData,
        postTestId: null
      });
    }
  };
  
  // เลือกอาจารย์
  const handleSelectInstructor = (instructor: Instructor) => {
    // ตรวจสอบว่าอาจารย์นี้ถูกเลือกไปแล้วหรือไม่
    if (subjectData.instructors.some(i => i.id === instructor.id)) {
      return;
    }
    
    // ตรวจสอบจำนวนอาจารย์
    if (subjectData.instructors.length >= 4) {
      alert("สามารถเลือกอาจารย์ได้สูงสุด 4 คน");
      return;
    }
    
    setSubjectData({
      ...subjectData,
      instructors: [...subjectData.instructors, instructor]
    });
    
    // ล้างข้อผิดพลาด
    setErrors({
      ...errors,
      instructors: ""
    });
    
    // ปิด Modal
    setShowInstructorModal(false);
  };
  
  // ลบอาจารย์
  const handleRemoveInstructor = (id: string) => {
    setSubjectData({
      ...subjectData,
      instructors: subjectData.instructors.filter(instructor => instructor.id !== id)
    });
  };
  
  // หาแบบทดสอบจาก ID
  const getQuizById = (id: string | null) => {
    if (!id) return null;
    return availableQuizzes.find(quiz => quiz.id === id) || null;
  };
  // ตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      lessons: "",
      instructors: ""
    };
    
    // ตรวจสอบชื่อรายวิชา
    if (subjectData.title.trim() === "") {
      newErrors.title = "กรุณาระบุชื่อรายวิชา";
      isValid = false;
    }
    
    // ตรวจสอบบทเรียน
    if (subjectData.lessons.length === 0) {
      newErrors.lessons = "กรุณาเลือกบทเรียนอย่างน้อย 1 บทเรียน";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // บันทึกข้อมูล
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("บันทึกข้อมูล:", subjectData);
      
      // แสดงข้อความสำเร็จ
      alert("บันทึกข้อมูลสำเร็จ");
      
      // กลับไปยังหน้ารายการรายวิชา
      navigate("/admin-subjects");
    }
  };
  
  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <div className="dashboard__content-area col-lg-9">
              <div className="dashboard__content-main">
                <div className="dashboard__content-header mb-4">
                  <h2 className="title text-muted">เพิ่มรายวิชาใหม่</h2>
                  <p className="desc">สร้างรายวิชาใหม่สำหรับหลักสูตร</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {/* ส่วนที่ 1: ข้อมูลรายวิชา */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                      <h5 className="card-title mb-3">ข้อมูลรายวิชา</h5>
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">ชื่อรายวิชา <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                          id="title"
                          name="title"
                          value={subjectData.title}
                          onChange={handleInputChange}
                          placeholder="ระบุชื่อรายวิชา"
                        />
                        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">รายละเอียดรายวิชา (ไม่บังคับ)</label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          value={subjectData.description}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  {/* ส่วนที่ 2: จัดการเนื้อหารายวิชา */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                      <h5 className="card-title mb-3">จัดการเนื้อหารายวิชา</h5>
                      
                      {/* บทเรียน */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <label className="form-label mb-0">บทเรียนในรายวิชา <span className="text-danger">*</span></label>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowLessonModal(true)}
                          >
                            <i className="fas fa-plus-circle me-2"></i>เพิ่มบทเรียน
                          </button>
                        </div>
                        
                        {errors.lessons && <div className="alert alert-danger">{errors.lessons}</div>}
                        
                        {subjectData.lessons.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                              <thead className="table-light">
                                <tr>
                                  <th style={{ width: "70px" }}>ลำดับ</th>
                                  <th>ชื่อบทเรียน</th>
                                  <th style={{ width: "150px" }}>จัดการ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {subjectData.lessons.map((lesson) => (
                                  <tr key={lesson.id}>
                                    <td className="text-center">
                                      <div className="d-flex align-items-center justify-content-center">
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-link p-0 me-1"
                                          onClick={() => handleReorderLesson(lesson.id, lesson.order - 1)}
                                          disabled={lesson.order === 1}
                                        >
                                          <i className="fas fa-arrow-up"></i>
                                        </button>
                                        <span className="mx-2">{lesson.order}</span>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-link p-0 ms-1"
                                          onClick={() => handleReorderLesson(lesson.id, lesson.order + 1)}
                                          disabled={lesson.order === subjectData.lessons.length}
                                        >
                                          <i className="fas fa-arrow-down"></i>
                                        </button>
                                      </div>
                                    </td>
                                    <td>{lesson.title}</td>
                                    <td>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleRemoveLesson(lesson.id)}
                                      >
                                        <i className="fas fa-trash-alt me-1"></i>ลบ
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="alert alert-info">
                            <i className="fas fa-info-circle me-2"></i>
                            ยังไม่มีบทเรียนในรายวิชานี้ กรุณาเพิ่มบทเรียน
                          </div>
                        )}
                        
                        {subjectData.lessons.length > 0 && (
                          <div className="form-check mt-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="allowAllLessons"
                              name="allowAllLessons"
                              checked={subjectData.allowAllLessons}
                              onChange={handleCheckboxChange}
                            />
                            <label className="form-check-label" htmlFor="allowAllLessons">
                              อนุญาตให้ผู้เรียนสามารถเรียนบทเรียนทั้งหมดได้พร้อมกัน (ไม่ต้องเรียนตามลำดับ)
                            </label>
                          </div>
                        )}
                      </div>
                      
                      {/* แบบทดสอบ */}
                      <div className="mb-3">
                        <h6 className="mb-3">แบบทดสอบสำหรับรายวิชา</h6>
                        
                        <div className="row g-3">
                          {/* แบบทดสอบก่อนเรียน */}
                          <div className="col-md-6">
                            <div className="card border h-100">
                              <div className="card-header bg-light">
                                <h6 className="mb-0">แบบทดสอบก่อนเรียน</h6>
                              </div>
                              <div className="card-body">
                                {subjectData.preTestId ? (
                                  <div className="selected-quiz">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <h6 className="mb-1">{getQuizById(subjectData.preTestId)?.title}</h6>
                                        <p className="mb-0 text-muted small">จำนวนคำถาม: {getQuizById(subjectData.preTestId)?.questions} ข้อ</p>
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleRemoveQuiz("pre")}
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-3">
                                    <p className="text-muted mb-3">ยังไม่ได้เลือกแบบทดสอบก่อนเรียน</p>
                                    <button
                                      type="button"
                                      className="btn btn-outline-primary"
                                      onClick={() => {
                                        setQuizType("pre");
                                        setShowQuizModal(true);
                                      }}
                                    >
                                      <i className="fas fa-plus-circle me-2"></i>เลือกแบบทดสอบ
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* แบบทดสอบหลังเรียน */}
                          <div className="col-md-6">
                            <div className="card border h-100">
                              <div className="card-header bg-light">
                                <h6 className="mb-0">แบบทดสอบหลังเรียน</h6>
                              </div>
                              <div className="card-body">
                                {subjectData.postTestId ? (
                                  <div className="selected-quiz">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <h6 className="mb-1">{getQuizById(subjectData.postTestId)?.title}</h6>
                                        <p className="mb-0 text-muted small">จำนวนคำถาม: {getQuizById(subjectData.postTestId)?.questions} ข้อ</p>
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleRemoveQuiz("post")}
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-3">
                                    <p className="text-muted mb-3">ยังไม่ได้เลือกแบบทดสอบหลังเรียน</p>
                                    <button
                                      type="button"
                                      className="btn btn-outline-primary"
                                      onClick={() => {
                                        setQuizType("post");
                                        setShowQuizModal(true);
                                      }}
                                    >
                                      <i className="fas fa-plus-circle me-2"></i>เลือกแบบทดสอบ
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ส่วนที่ 3: ตั้งค่ารายวิชา */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                      <h5 className="card-title mb-3">ตั้งค่ารายวิชา</h5>
                      
                      {/* อาจารย์ผู้สอน */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <label className="form-label mb-0">อาจารย์ผู้สอน (สูงสุด 4 คน)</label>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowInstructorModal(true)}
                            disabled={subjectData.instructors.length >= 4}
                          >
                            <i className="fas fa-plus-circle me-2"></i>เพิ่มอาจารย์
                          </button>
                        </div>
                        
                        {subjectData.instructors.length > 0 ? (
                          <div className="row g-3">
                            {subjectData.instructors.map((instructor) => (
                              <div key={instructor.id} className="col-md-6">
                                <div className="card border">
                                  <div className="card-body p-3">
                                    <div className="d-flex">
                                      <img
                                        src={instructor.avatar}
                                        alt={instructor.name}
                                        className="rounded-circle me-3"
                                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                      />
                                      <div className="flex-grow-1">
                                      <h6 className="mb-1">{instructor.name}</h6>
                                        <p className="text-muted small mb-0">{instructor.position}</p>
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger align-self-start"
                                        onClick={() => handleRemoveInstructor(instructor.id)}
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="alert alert-info">
                            <i className="fas fa-info-circle me-2"></i>
                            ยังไม่ได้เลือกอาจารย์ผู้สอน
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* ปุ่มบันทึกและยกเลิก */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Link to="/admin-subjects" className="btn btn-outline-secondary">
                      ยกเลิก
                    </Link>
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save me-2"></i>บันทึกรายวิชา
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal เลือกบทเรียน */}
      {showLessonModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เลือกบทเรียน</h5>
                <button type="button" className="btn-close" onClick={() => setShowLessonModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาบทเรียน..."
                    value={lessonSearchTerm}
                    onChange={(e) => setLessonSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="lesson-list">
                  {filteredLessons.length > 0 ? (
                    <div className="list-group">
                      {filteredLessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          type="button"
                          className={`list-group-item list-group-item-action ${
                            subjectData.lessons.some(l => l.id === lesson.id) ? 'disabled' : ''
                          }`}
                          onClick={() => handleSelectLesson(lesson)}
                          disabled={subjectData.lessons.some(l => l.id === lesson.id)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{lesson.title}</h6>
                            {subjectData.lessons.some(l => l.id === lesson.id) && (
                              <span className="badge bg-success rounded-pill">เลือกแล้ว</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่พบบทเรียนที่ตรงกับคำค้นหา</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLessonModal(false)}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal เลือกแบบทดสอบ */}
      {showQuizModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  เลือกแบบทดสอบ{quizType === "pre" ? "ก่อนเรียน" : "หลังเรียน"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowQuizModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาแบบทดสอบ..."
                    value={quizSearchTerm}
                    onChange={(e) => setQuizSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="quiz-list">
                  {filteredQuizzes.length > 0 ? (
                    <div className="list-group">
                      {filteredQuizzes.map((quiz) => (
                        <button
                          key={quiz.id}
                          type="button"
                          className="list-group-item list-group-item-action"
                          onClick={() => handleSelectQuiz(quiz)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-1">{quiz.title}</h6>
                            <span className="badge bg-primary rounded-pill">{quiz.questions} คำถาม</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่พบแบบทดสอบที่ตรงกับคำค้นหา</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuizModal(false)}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal เลือกอาจารย์ */}
      {showInstructorModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เลือกอาจารย์ผู้สอน</h5>
                <button type="button" className="btn-close" onClick={() => setShowInstructorModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาอาจารย์..."
                    value={instructorSearchTerm}
                    onChange={(e) => setInstructorSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="instructor-list">
                  {filteredInstructors.length > 0 ? (
                    <div className="row g-3">
                      {filteredInstructors.map((instructor) => (
                        <div key={instructor.id} className="col-md-6">
                          <div 
                            className={`card border ${
                              subjectData.instructors.some(i => i.id === instructor.id) ? 'border-success' : ''
                            }`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSelectInstructor(instructor)}
                          >
                            <div className="card-body p-3">
                              <div className="d-flex">
                                <img
                                  src={instructor.avatar}
                                  alt={instructor.name}
                                  className="rounded-circle me-3"
                                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                />
                                <div>
                                  <h6 className="mb-1">{instructor.name}</h6>
                                  <p className="text-muted small mb-0">{instructor.position}</p>
                                  {subjectData.instructors.some(i => i.id === instructor.id) && (
                                    <span className="badge bg-success mt-2">เลือกแล้ว</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่พบอาจารย์ที่ตรงกับคำค้นหา</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInstructorModal(false)}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AddSubjectsArea;


