import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AddQuestions from "../AddQuestions";
import QuizInfoSection from "./QuizInfoSection";
import QuestionsSection from "./QuestionsSection";
import LessonsSection from "./LessonsSection";
import SettingsSection from "./SettingsSection";
import SpecialQuizSection from "./SpecialQuizSections";

// Question type
type QuestionType = "TF" | "MC" | "SC" | "FB";
type QuizType = "normal" | "special";

// Question data
interface Question {
  id: string;
  title: string;
  type: QuestionType;
  score: number;
  isExisting?: boolean;
}

// Lesson data
interface Lesson {
  id: string;
  title: string;
  subject: string;
  duration: string;
}

// Quiz data
interface QuizData {
  title: string;
  description: string;
  questions: Question[];
  timeLimit: {
    enabled: boolean;
    value: number;
    unit: "minutes" | "hours" | "days" | "weeks";
  };
  passingScore: {
    enabled: boolean;
    value: number;
  };
  attempts: {
    limited: boolean;
    unlimited: boolean;
    value: number;
  };
  lessons: string[];
  status: string;
  allowFileUpload?: boolean; // For special quiz
}

interface AddQuizzesProps {
  onSubmit?: (quizData: any) => void;
  onCancel?: () => void;
}

const AddQuizzes: React.FC<AddQuizzesProps> = ({ onSubmit, onCancel }) => {
  const generateId = () => `question_${Math.random().toString(36).substr(2, 9)}`;

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [quizType, setQuizType] = useState<QuizType>("normal");

  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [quizData, setQuizData] = useState<QuizData>({
    title: "",
    description: "",
    questions: [],
    timeLimit: {
      enabled: false,
      value: 60,
      unit: "minutes",
    },
    passingScore: {
      enabled: false,
      value: 0,
    },
    attempts: {
      limited: true,
      unlimited: false,
      value: 1,
    },
    lessons: [],
    status: "draft",
    allowFileUpload: false,
  });

  const [errors, setErrors] = useState({
    title: "",
    questions: "",
  });

  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [showExistingQuestions, setShowExistingQuestions] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonSearchTerm, setLessonSearchTerm] = useState("");
  const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExistingQuestions, setSelectedExistingQuestions] = useState<string[]>([]);
  const [fbQuestions, setFbQuestions] = useState<Question[]>([]); // For special quiz
  const [currentQuestionPage, setCurrentQuestionPage] = useState<number>(1);

  const itemsPerPage = 10;

  const filteredExistingQuestions = useMemo(() => {
    return existingQuestions.filter(
      (question) =>
        !quizData.questions.some((q) => q.id === question.id) &&
        question.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [existingQuestions, quizData.questions, searchTerm]);

  // Pagination for questions
  const totalQuestionPages = Math.ceil(filteredExistingQuestions.length / itemsPerPage);
  const paginatedQuestions = useMemo(() => {
    const start = (currentQuestionPage - 1) * itemsPerPage;
    return filteredExistingQuestions.slice(start, start + itemsPerPage);
  }, [filteredExistingQuestions, currentQuestionPage]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          setIsLoading(false);
          return;
        }

        const lessonsResponse = await axios.get(`${apiUrl}/api/courses/lessons`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (lessonsResponse.data && lessonsResponse.data.lessons) {
          const formattedLessons = lessonsResponse.data.lessons.map((lesson: any) => ({
            id: lesson.lesson_id.toString(),
            title: lesson.title,
            subject: lesson.subjects?.length > 0 ? lesson.subjects[0].subject_name : "ไม่ระบุวิชา",
            duration: lesson.duration ? `${lesson.duration} นาที` : "ไม่ระบุระยะเวลา",
          }));
          setAvailableLessons(formattedLessons);
        }

        const questionsResponse = await axios.get(`${apiUrl}/api/courses/questions`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (questionsResponse.data && questionsResponse.data.questions) {
          const formattedQuestions = questionsResponse.data.questions.map((question: any) => ({
            id: question.question_id,
            title: question.title,
            type: question.type as QuestionType,
            score: question.score || 1,
            isExisting: true,
          }));
          setExistingQuestions(formattedQuestions);
          // Filter only MC questions
          const mcOnlyQuestions = formattedQuestions.filter((q: Question) => q.type === "MC");
          setExistingQuestions(mcOnlyQuestions);

          // For special quiz, use FB questions
          const fbOnlyQuestions = formattedQuestions.filter((q: Question) => q.type === "FB");
          setFbQuestions(fbOnlyQuestions);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLessons = availableLessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(lessonSearchTerm.toLowerCase()) ||
      lesson.subject.toLowerCase().includes(lessonSearchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setQuizData({
      ...quizData,
      [name]: value,
    });

    if (name === "title") {
      setErrors({
        ...errors,
        title: "",
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setQuizData({
      ...quizData,
      [name]: checked,
    });
  };

  const handleTimeLimitChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setQuizData({
        ...quizData,
        timeLimit: {
          ...quizData.timeLimit,
          enabled: (e.target as HTMLInputElement).checked,
        },
      });
    } else if (name === "timeLimitValue") {
      setQuizData({
        ...quizData,
        timeLimit: {
          ...quizData.timeLimit,
          value: parseInt(value) || 0,
        },
      });
    } else if (name === "timeLimitUnit") {
      setQuizData({
        ...quizData,
        timeLimit: {
          ...quizData.timeLimit,
          unit: value as "minutes" | "hours" | "days" | "weeks",
        },
      });
    }
  };

  const handlePassingScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setQuizData({
        ...quizData,
        passingScore: {
          ...quizData.passingScore,
          enabled: e.target.checked,
        },
      });
    } else if (name === "passingScoreValue") {
      setQuizData({
        ...quizData,
        passingScore: {
          ...quizData.passingScore,
          value: parseInt(value) || 0,
        },
      });
    }
  };

  const handleAttemptsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (name === "attemptsLimited" && type === "checkbox") {
      setQuizData({
        ...quizData,
        attempts: {
          ...quizData.attempts,
          limited: e.target.checked,
          unlimited: !e.target.checked,
        },
      });
    } else if (name === "attemptsUnlimited" && type === "checkbox") {
      setQuizData({
        ...quizData,
        attempts: {
          ...quizData.attempts,
          unlimited: e.target.checked,
          limited: !e.target.checked,
        },
      });
    } else if (name === "attemptsValue") {
      setQuizData({
        ...quizData,
        attempts: {
          ...quizData.attempts,
          value: parseInt(value) || 1,
        },
      });
    }
  };

  const handleAddNewQuestion = (questionData: any) => {
    if (!questionData) {
      setShowAddQuestionForm(false);
      return;
    }

    if (quizData.questions.length >= 100) {
      toast.warning("ไม่สามารถเพิ่มคำถามได้อีก เนื่องจากมีคำถามครบ 100 ข้อแล้ว");
      return;
    }

    if (!questionData.title || questionData.title.trim() === "") {
      toast.error("กรุณาระบุชื่อคำถาม");
      return;
    }

    const newQuestion: Question = {
      id: generateId(),
      title: questionData.title,
      type: questionData.type,
      score: questionData.score,
      isExisting: false,
    };

    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion],
    });

    setShowAddQuestionForm(false);

    setErrors({
      ...errors,
      questions: "",
    });
  };

  const handleDeleteQuestion = (id: string) => {
    const updatedQuestions = quizData.questions.filter((question) => question.id !== id);

    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    });
  };

  const handleSelectExistingQuestion = (id: string) => {
    if (selectedExistingQuestions.includes(id)) {
      setSelectedExistingQuestions(selectedExistingQuestions.filter((qId) => qId !== id));
    } else {
      setSelectedExistingQuestions([...selectedExistingQuestions, id]);
    }
  };

  const handleAddSelectedQuestions = () => {
    if (quizData.questions.length + selectedExistingQuestions.length > 100) {
      toast.warning(
        `ไม่สามารถเพิ่มคำถามได้ทั้งหมด เนื่องจากจะทำให้มีคำถามเกิน 100 ข้อ\nสามารถเพิ่มได้อีก ${
          100 - quizData.questions.length
        } ข้อ`
      );
      return;
    }

    const questionsToAdd = existingQuestions.filter((q: Question) =>
      selectedExistingQuestions.includes(q.id)
    );

    setQuizData({
      ...quizData,
      questions: [...quizData.questions, ...questionsToAdd],
    });

    setShowExistingQuestions(false);
    setSelectedExistingQuestions([]);
    setCurrentQuestionPage(1);

    setErrors({
      ...errors,
      questions: "",
    });
  };

  const handleToggleLesson = (lessonId: string) => {
    if (quizData.lessons.includes(lessonId)) {
      setQuizData({
        ...quizData,
        lessons: quizData.lessons.filter((id) => id !== lessonId),
      });
    } else {
      setQuizData({
        ...quizData,
        lessons: [...quizData.lessons, lessonId],
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      questions: "",
    };

    if (quizData.title.trim() === "") {
      newErrors.title = "กรุณาระบุชื่อแบบทดสอบ";
      isValid = false;
    }

    if (quizType === "normal" && quizData.questions.length === 0) {
      newErrors.questions = "กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ";
      isValid = false;
    }

    if (quizType === "special" && selectedExistingQuestions.length === 0) {
      newErrors.questions = "กรุณาเลือกคำถามแบบเติมคำตอบอย่างน้อย 1 ข้อ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      setApiError("");
      setApiSuccess("");

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          setIsSubmitting(false);
          return;
        }

        let response;

        if (quizType === "normal") {
          const apiData = {
            title: quizData.title,
            description: quizData.description,
            questions: quizData.questions.map((q) => ({
              id: q.id,
              title: q.title,
              type: q.type,
              score: q.score,
              isExisting: q.isExisting || false,
            })),
            timeLimit: {
              enabled: quizData.timeLimit.enabled,
              value: quizData.timeLimit.value,
              unit: quizData.timeLimit.unit,
            },
            passingScore: {
              enabled: quizData.passingScore.enabled,
              value: quizData.passingScore.value,
            },
            attempts: {
              limited: quizData.attempts.limited,
              unlimited: quizData.attempts.unlimited,
              value: quizData.attempts.value,
            },
            lessons: quizData.lessons,
            status: quizData.status || "draft",
          };

          response = await axios.post(`${apiUrl}/api/courses/quizzes`, apiData, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          const apiData = {
            title: quizData.title,
            description: quizData.description,
            question_ids: selectedExistingQuestions,
            allow_file_upload: quizData.allowFileUpload,
          };

          response = await axios.post(`${apiUrl}/api/special-quiz/`, apiData, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        }

        setApiSuccess(`สร้างแบบทดสอบ${quizType === "special" ? "พิเศษ" : ""}สำเร็จ`);
        toast.success(`สร้างแบบทดสอบ${quizType === "special" ? "พิเศษ" : ""}สำเร็จ`);

        if (onSubmit) {
          onSubmit(response.data.quiz);
        } else {
          setQuizData({
            title: "",
            description: "",
            questions: [],
            timeLimit: {
              enabled: false,
              value: 60,
              unit: "minutes",
            },
            passingScore: {
              enabled: false,
              value: 0,
            },
            attempts: {
              limited: true,
              unlimited: false,
              value: 1,
            },
            lessons: [],
            status: "draft",
            allowFileUpload: false,
          });
          setSelectedExistingQuestions([]);
        }
      } catch (error) {
        console.error("Error submitting quiz:", error);

        if (axios.isAxiosError(error) && error.response) {
          setApiError(
            error.response.data.message ||
              `เกิดข้อผิดพลาดในการสร้างแบบทดสอบ${quizType === "special" ? "พิเศษ" : ""}`
          );
          toast.error(
            error.response.data.message ||
              `เกิดข้อผิดพลาดในการสร้างแบบทดสอบ${quizType === "special" ? "พิเศษ" : ""}`
          );
        } else {
          setApiError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
          toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getQuestionTypeText = (type: QuestionType) => {
    switch (type) {
      case "TF":
        return "ถูก/ผิด";
      case "SC":
        return "ตัวเลือกเดียว";
      case "FB":
        return "เติมคำ";
      default:
        return "";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {apiSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
          <button
            type="button"
            className="btn-close"
            onClick={() => setApiSuccess("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {apiError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
          <button
            type="button"
            className="btn-close"
            onClick={() => setApiError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Quiz type selection */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="mb-3">เลือกประเภทแบบทดสอบ</h5>
          <div className="d-flex gap-3 flex-wrap">
            <button
              type="button"
              className={`btn ${quizType === "normal" ? "btn-primary" : "btn-outline-primary"} px-4 py-3 d-flex align-items-center`}
              onClick={() => setQuizType("normal")}
            >
              <i className="fas fa-tasks fs-5 me-2"></i>
              <span>แบบทดสอบปกติ</span>
              <small className="ms-2">{quizType === "normal" ? "✓ เลือกแล้ว" : ""}</small>
            </button>
            <button
              type="button"
              className={`btn ${quizType === "special" ? "btn-primary" : "btn-outline-primary"} px-4 py-3 d-flex align-items-center`}
              onClick={() => setQuizType("special")}
            >
              <i className="fas fa-file-alt fs-5 me-2"></i>
              <span>แบบทดสอบพิเศษ</span>
              <small className="ms-2">{quizType === "special" ? "✓ เลือกแล้ว" : ""}</small>
            </button>
          </div>
          <div className="mt-3">{/* Optional: Add description or validation */}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <>
          <QuizInfoSection
            quizData={quizData}
            handleInputChange={handleInputChange}
            errors={errors}
          />

          {quizType === "normal" ? (
            <>
              <QuestionsSection
                quizData={quizData}
                errors={errors}
                handleDeleteQuestion={handleDeleteQuestion}
                handleAddNewQuestion={handleAddNewQuestion}
                existingQuestions={existingQuestions}
                showAddQuestionForm={showAddQuestionForm}
                setShowAddQuestionForm={setShowAddQuestionForm}
                showExistingQuestions={showExistingQuestions}
                setShowExistingQuestions={setShowExistingQuestions}
                selectedExistingQuestions={selectedExistingQuestions}
                setSelectedExistingQuestions={setSelectedExistingQuestions}
                handleSelectExistingQuestion={handleSelectExistingQuestion}
                handleAddSelectedQuestions={handleAddSelectedQuestions}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredExistingQuestions={filteredExistingQuestions}
              />

              <LessonsSection
                quizData={quizData}
                availableLessons={availableLessons}
                showLessonModal={showLessonModal}
                setShowLessonModal={setShowLessonModal}
                lessonSearchTerm={lessonSearchTerm}
                setLessonSearchTerm={setLessonSearchTerm}
                filteredLessons={filteredLessons}
                handleToggleLesson={handleToggleLesson}
              />

              <SettingsSection
                quizData={quizData}
                handleTimeLimitChange={handleTimeLimitChange}
                handlePassingScoreChange={handlePassingScoreChange}
                handleAttemptsChange={handleAttemptsChange}
                handleInputChange={handleInputChange}
              />
            </>
          ) : (
            <SpecialQuizSection
              quizData={quizData}
              fbQuestions={fbQuestions}
              selectedExistingQuestions={selectedExistingQuestions}
              setSelectedExistingQuestions={setSelectedExistingQuestions}
              handleCheckboxChange={handleCheckboxChange}
              errors={errors}
            />
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>บันทึกแบบทดสอบ
                  {quizType === "special" ? "พิเศษ" : ""}
                </>
              )}
            </button>
          </div>
        </>
      )}

      {showAddQuestionForm && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white">
                  <i className="fas fa-plus-circle me-2"></i>
                  เพิ่มคำถามใหม่
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddQuestionForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <AddQuestions
                  onSubmit={handleAddNewQuestion}
                  onCancel={() => setShowAddQuestionForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showExistingQuestions && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white">เลือกคำถามที่มีอยู่แล้ว</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowExistingQuestions(false);
                    setSelectedExistingQuestions([]);
                    setCurrentQuestionPage(1);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาคำถาม..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentQuestionPage(1);
                    }}
                  />
                </div>
                {paginatedQuestions.length > 0 ? (
                  <>
                    <div className="list-group list-group-flush mb-3">
                      {paginatedQuestions.map((question) => {
                        const isSelected = selectedExistingQuestions.includes(question.id);
                        return (
                          <div
                            key={question.id}
                            className={`list-group-item d-flex justify-content-between align-items-center ${
                              isSelected ? "bg-light" : ""
                            }`}
                          >
                            <div className="d-flex flex-column">
                              <span className="h6 mb-1">{question.title}</span>
                              <div className="d-flex gap-2 align-items-center">
                                <span className="badge bg-info rounded-pill">
                                  {getQuestionTypeText(question.type)}
                                </span>
                                <span className="text-muted small">คะแนน: {question.score}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                isSelected ? "btn-success disabled" : "btn-outline-primary"
                              }`}
                              onClick={() => handleSelectExistingQuestion(question.id)}
                              disabled={isSelected}
                            >
                              {isSelected ? (
                                <>
                                  <i className="fas fa-check me-1"></i>เลือกแล้ว
                                </>
                              ) : (
                                <>เลือก</>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {totalQuestionPages > 1 && (
                      <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-center">
                          {Array.from({ length: totalQuestionPages }, (_, i) => (
                            <li
                              key={i + 1}
                              className={`page-item ${currentQuestionPage === i + 1 ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentQuestionPage(i + 1)}
                              >
                                {i + 1}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}
                    <div className="text-center text-muted small mt-2">
                      แสดง {paginatedQuestions.length} จากทั้งหมด {filteredExistingQuestions.length}{" "}
                      คำถาม
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">ไม่พบคำถามที่ตรงกับคำค้นหา</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowExistingQuestions(false);
                    setSelectedExistingQuestions([]);
                    setCurrentQuestionPage(1);
                  }}
                >
                  ปิด
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddSelectedQuestions}
                  disabled={selectedExistingQuestions.length === 0}
                >
                  เพิ่มคำถามที่เลือก ({selectedExistingQuestions.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default AddQuizzes;