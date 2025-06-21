import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select, { SingleValue } from "react-select";

// ประเภทของคำถาม
type QuestionType = "TF" | "MC" | "SC" | "FB" | "";

// ตัวเลือกคำตอบ
interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

// ข้อมูลแบบทดสอบ
interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit: {
    enabled: boolean;
    value: number;
    unit: string;
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
  status: "active" | "inactive" | "draft";
  type: string; // เพิ่ม type ตามตาราง
  questions: Array<{
    id?: string;
    isExisting: boolean;
    title?: string;
    type?: QuestionType;
    score?: number;
  }>;
  lessons: string[];
  questionCount: number;
}

// ข้อมูลคำถาม
interface QuestionData {
  question_id?: number;
  title: string;
  description: string;
  type: QuestionType;
  choices: Choice[];
  score: number;
  quizzes: string[];
}

// ข้อมูลบทเรียน
interface Lesson {
  lesson_id: string;
  title: string;
  duration: number;
}

// กำหนด interface สำหรับ props
interface EditQuizProps {
  onSubmit?: (quiz: Quiz) => void;
  onCancel?: () => void;
}

const EditQuiz: React.FC<EditQuizProps> = ({ onCancel }) => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [quiz, setQuiz] = useState<Quiz>({
    id: "",
    title: "",
    description: "",
    timeLimit: { enabled: false, value: 60, unit: "minutes" }, // Default ตามตาราง
    passingScore: { enabled: false, value: 0 }, // Default ตามตาราง
    attempts: { limited: false, unlimited: true, value: 1 }, // Default ตามตาราง
    status: "draft",
    type: "MIX", // Default ตามที่ระบุในคำถามก่อนหน้า
    questions: [],
    lessons: [],
    questionCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    passingScore: "",
    attempts: "",
  });

  const [allQuestions, setAllQuestions] = useState<
    { value: string; label: string }[]
  >([]);
  const [allLessons, setAllLessons] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!quizId || isNaN(Number(quizId))) {
        const errorMessage = `รหัสแบบทดสอบไม่ถูกต้อง (quizId: ${quizId}) ที่ URL: ${window.location.href}. กรุณาใช้ URL รูปแบบ /admin-quizzes/edit/:quizId`;
        setApiError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      try {
        setIsLoading(true);
        setApiError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        }

        // ดึงข้อมูลแบบทดสอบ
        const quizResponse = await axios.get(
          `${apiUrl}/api/courses/quizzes/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        const quizData = quizResponse.data.quiz;
        if (!quizData) {
          const errorMessage = quizResponse.data.message || "ไม่พบข้อมูลแบบทดสอบ";
          throw new Error(
            `ดึงข้อมูลแบบทดสอบล้มเหลว: ${errorMessage} (API response: ${JSON.stringify(quizResponse.data)})`
          );
        }

        // ดึงรายการคำถามทั้งหมด
        const questionsResponse = await axios.get(
          `${apiUrl}/api/courses/questions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const questions: QuestionData[] = questionsResponse.data.questions;
        if (!questions || !Array.isArray(questions)) {
          console.warn(
            "Failed to load questions:",
            questionsResponse.data.message || "ไม่มีข้อมูลคำถาม",
            "(API response: ",
            JSON.stringify(questionsResponse.data),
            ")"
          );
        }

        // ดึงรายการบทเรียนทั้งหมด
        const lessonsResponse = await axios.get(
          `${apiUrl}/api/courses/lessons`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        const lessons: Lesson[] = lessonsResponse.data.lessons;
        if (!lessons || !Array.isArray(lessons)) {
          console.warn(
            "Failed to load lessons:",
            lessonsResponse.data.message || "ไม่มีข้อมูลบทเรียน",
            "(API response: ",
            JSON.stringify(lessonsResponse.data),
            ")"
          );
        }

        // ตั้งค่า quiz state ให้สอดคล้องกับตาราง
        setQuiz({
          id: String(quizData.quiz_id || quizId),
          title: quizData.title || "",
          description: quizData.description || "",
          timeLimit: {
            enabled: quizData.time_limit_enabled ?? false,
            value: quizData.time_limit_value ?? 60,
            unit: quizData.time_limit_unit ?? "minutes",
          },
          passingScore: {
            enabled: quizData.passing_score_enabled ?? false,
            value: quizData.passing_score_value ?? 0,
          },
          attempts: {
            limited: quizData.attempts_limited ?? false,
            unlimited: quizData.attempts_unlimited ?? true,
            value: quizData.attempts_value ?? 1,
          },
          status: quizData.status || "draft",
          type: quizData.type || "MIX", // เพิ่ม type
          questions: quizData.questions
            ? quizData.questions.map((q: any) => ({
              id: String(q.question_id),
              isExisting: true,
            }))
            : [],
          lessons: quizData.lessons
            ? quizData.lessons.map((l: any) => String(l.lesson_id))
            : [],
          questionCount: quizData.questions ? quizData.questions.length : 0,
        });

        // ตั้งค่า allQuestions สำหรับ dropdown
        if (questions) {
          setAllQuestions(
            questions.map((q) => ({
              value: String(q.question_id),
              label: `${q.title} (Type: ${q.type}, Score: ${q.score})`,
            }))
          );
        }

        // ตั้งค่า allLessons สำหรับ dropdown
        if (lessons) {
          setAllLessons(
            lessons.map((l) => ({
              value: String(l.lesson_id),
              label: `${l.title} (Duration: ${l.duration} นาที)`,
            }))
          );
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        const errorMessage = error.message || "ไม่สามารถโหลดข้อมูลได้";
        setApiError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [quizId, apiUrl, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith("timeLimit.")) {
      const field = name.split(".")[1];
      setQuiz((prev) => ({
        ...prev,
        timeLimit: {
          ...prev.timeLimit,
          [field]: field === "enabled" ? checked : field === "value" ? Number(value) : value,
        },
      }));
    } else if (name.startsWith("passingScore.")) {
      const field = name.split(".")[1];
      setQuiz((prev) => ({
        ...prev,
        passingScore: {
          ...prev.passingScore,
          [field]: field === "enabled" ? checked : Number(value),
        },
      }));
    } else if (name.startsWith("attempts.")) {
      const field = name.split(".")[1];
      setQuiz((prev) => ({
        ...prev,
        attempts: {
          ...prev.attempts,
          [field]:
            field === "limited" || field === "unlimited"
              ? checked
              : Number(value),
          ...(field === "limited" && checked ? { unlimited: false } : {}),
          ...(field === "unlimited" && checked ? { limited: false } : {}),
        },
      }));
    } else {
      setQuiz((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAddQuestion = (
    selected: SingleValue<{ value: string; label: string }>
  ) => {
    if (selected) {
      const questionId = selected.value;
      if (!quiz.questions.some((q) => q.id === questionId)) {
        setQuiz((prev) => ({
          ...prev,
          questions: [...prev.questions, { id: questionId, isExisting: true }],
          questionCount: prev.questionCount + 1,
        }));
      } else {
        toast.info("คำถามนี้อยู่ในแบบทดสอบแล้ว");
      }
    }
  };

  const removeQuestion = (questionId: string) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
      questionCount: prev.questionCount - 1,
    }));
  };

  const handleLessonsChange = (
    selected: { value: string; label: string } | null
  ) => {
    setQuiz((prev) => ({
      ...prev,
      lessons: selected ? [selected.value] : [],
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      passingScore: "",
      attempts: "",
    };

    // ตรวจสอบ quiz.title อย่างปลอดภัย
    if (!quiz.title || typeof quiz.title !== "string" || !quiz.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อแบบทดสอบ";
      isValid = false;
    }

    if (quiz.passingScore.enabled && quiz.passingScore.value <= 0) {
      newErrors.passingScore = "คะแนนผ่านต้องมากกว่า 0";
      isValid = false;
    }

    if (quiz.attempts.limited && quiz.attempts.value <= 0) {
      newErrors.attempts = "จำนวนครั้งที่อนุญาตต้องมากกว่า 0";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    try {
      setIsSubmitting(true);
      setApiError(null);
      setApiSuccess(null);
  
      const token = localStorage.getItem("token");
      if (!token) {
        setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        setIsSubmitting(false);
        return;
      }
  
      const payload = {
        title: quiz.title.trim().substring(0, 50), // ตัดช่องว่างและจำกัดความยาว
        description: quiz.description || "",
        timeLimit: {
          enabled: quiz.timeLimit.enabled,
          value: quiz.timeLimit.enabled ? quiz.timeLimit.value : 60,
          unit: quiz.timeLimit.enabled ? quiz.timeLimit.unit.toLowerCase() : "minutes",
        },
        passingScore: {
          enabled: quiz.passingScore.enabled,
          value: quiz.passingScore.enabled ? Math.min(quiz.passingScore.value, 100) : 0,
        },
        attempts: {
          limited: quiz.attempts.limited,
          unlimited: quiz.attempts.unlimited,
          value: quiz.attempts.limited ? quiz.attempts.value : 0,
        },
        status: quiz.status.toLowerCase(),
        questions: quiz.questions, // ส่ง array ของคำถาม
        lessons: quiz.lessons, // ส่ง array ของ lesson IDs
      };
  
  
      const response = await axios.put(
        `${apiUrl}/api/courses/quizzes/${quiz.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
      if (response.status === 200) {
        setApiSuccess("แก้ไขแบบทดสอบสำเร็จ");
        toast.success("แก้ไขแบบทดสอบสำเร็จ");
        setTimeout(() => {
          navigate("/admin-quizzes");
        }, 1500);
      } else {
        setApiError(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขแบบทดสอบ");
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขแบบทดสอบ");
      }
    } catch (error: any) {
      console.error("Error updating quiz:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin-quizzes");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (apiError && !isSubmitting && !apiSuccess) {
    return (
      <div className="alert alert-danger mb-4 max-w-3xl mx-auto p-4">
        <i className="fas fa-exclamation-circle me-2"></i>
        {apiError}
        <div className="mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/admin-quizzes")}
          >
            กลับไปยังรายการแบบทดสอบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
      {apiSuccess && (
        <div className="alert alert-success mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
        </div>
      )}

      {apiError && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
        </div>
      )}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">1. ข้อมูลแบบทดสอบ</h5>

          <div className="mb-3">
            <label htmlFor="quizId" className="form-label">
              รหัสแบบทดสอบ
            </label>
            <input
              type="text"
              className="form-control"
              id="quizId"
              value={quiz.id || "กำลังโหลด..."}
              readOnly
              disabled
            />
          </div>

          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              ชื่อแบบทดสอบ <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              id="title"
              name="title"
              value={quiz.title}
              onChange={handleInputChange}
              placeholder="ระบุชื่อแบบทดสอบ"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              คำอธิบาย
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={quiz.description || ""}
              onChange={handleInputChange}
              rows={3}
              placeholder="ระบุคำอธิบายแบบทดสอบ"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">ประเภทแบบทดสอบ</label>
            <select
              className="form-control"
              name="type"
              value={quiz.type}
              onChange={handleInputChange}
            >
              <option value="MIX">รวมทั้งหมด</option>
              <option value="TF">ถูก/ผิด</option>
              <option value="MC">แบบปรนัย</option>
              <option value="SC">คำตอบสั้น</option>
              <option value="FB">แบบเติมคำ</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">สถานะ</label>
            <select
              className="form-control"
              name="status"
              value={quiz.status}
              onChange={handleInputChange}
            >
              <option value="active">เปิดใช้งาน</option>
              <option value="inactive">ปิดใช้งาน</option>
              <option value="draft">ฉบับร่าง</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">2. การตั้งค่า</h5>

          <div className="mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="timeLimitEnabled"
                name="timeLimit.enabled"
                checked={quiz.timeLimit.enabled}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="timeLimitEnabled">
                เปิดใช้งานจำกัดเวลา
              </label>
            </div>
            {quiz.timeLimit.enabled && (
              <div className="mt-2">
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="timeLimitValue" className="form-label">
                      จำกัดเวลา
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="timeLimitValue"
                      name="timeLimit.value"
                      value={quiz.timeLimit.value}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="timeLimitUnit" className="form-label">
                      หน่วย
                    </label>
                    <select
                      className="form-control"
                      id="timeLimitUnit"
                      name="timeLimit.unit"
                      value={quiz.timeLimit.unit}
                      onChange={handleInputChange}
                    >
                      <option value="minutes">นาที</option>
                      <option value="hours">ชั่วโมง</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="passingScoreEnabled"
                name="passingScore.enabled"
                checked={quiz.passingScore.enabled}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="passingScoreEnabled">
                เปิดใช้งานคะแนนผ่าน
              </label>
            </div>
            {quiz.passingScore.enabled && (
              <div className="mt-2">
                <label htmlFor="passingScoreValue" className="form-label">
                  คะแนนผ่าน
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.passingScore ? "is-invalid" : ""}`}
                  id="passingScoreValue"
                  name="passingScore.value"
                  value={quiz.passingScore.value}
                  onChange={handleInputChange}
                  min="0"
                />
                {errors.passingScore && (
                  <div className="invalid-feedback">{errors.passingScore}</div>
                )}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">จำนวนครั้งที่อนุญาตให้ทำ</label>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="attemptsUnlimited"
                name="attempts.unlimited"
                checked={quiz.attempts.unlimited}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="attemptsUnlimited">
                ไม่จำกัด
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="attemptsLimited"
                name="attempts.limited"
                checked={quiz.attempts.limited}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="attemptsLimited">
                จำกัดจำนวนครั้ง
              </label>
            </div>
            {quiz.attempts.limited && (
              <div className="mt-2">
                <label htmlFor="attemptsValue" className="form-label">
                  จำนวนครั้ง
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.attempts ? "is-invalid" : ""}`}
                  id="attemptsValue"
                  name="attempts.value"
                  value={quiz.attempts.value}
                  onChange={handleInputChange}
                  min="0"
                />
                {errors.attempts && (
                  <div className="invalid-feedback">{errors.attempts}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">3. คำถามในแบบทดสอบ</h5>

          <div className="mb-3">
            <label className="form-label">เพิ่มคำถาม</label>
            <Select
              options={allQuestions}
              onChange={handleAddQuestion}
              placeholder="เลือกคำถามเพื่อเพิ่มในแบบทดสอบ"
              value={null}
            />
            {quiz.questions.length > 0 ? (
              <ul className="list-group mt-2">
                {quiz.questions.map((question) => {
                  const q = allQuestions.find((q) => q.value === question.id);
                  return (
                    <li
                      key={question.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{q ? q.label : `Question ID: ${question.id}`}</span>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeQuestion(question.id!)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted mt-2">ยังไม่มีคำถามในแบบทดสอบนี้</p>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">จำนวนคำถาม</label>
            <input
              type="number"
              className="form-control"
              value={quiz.questionCount}
              readOnly
              disabled
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">4. บทเรียนที่เกี่ยวข้อง</h5>

          <div className="mb-3">
            <label className="form-label">เลือกบทเรียน</label>
            <Select
              isClearable
              options={allLessons}
              value={allLessons.find((option) => quiz.lessons.includes(option.value)) || null}
              onChange={handleLessonsChange}
              placeholder="เลือกบทเรียนที่เกี่ยวข้อง"
            />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <i className="fas fa-times me-2"></i>ยกเลิก
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
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
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditQuiz;