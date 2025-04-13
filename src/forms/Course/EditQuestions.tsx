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
  questions: number;
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

// กำหนด interface สำหรับ props
interface EditQuestionsProps {
  onSubmit?: (questionData: QuestionData) => void;
  onCancel?: () => void;
}

const EditQuestion: React.FC<EditQuestionsProps> = ({ onCancel }) => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [questionData, setQuestionData] = useState<QuestionData>({
    question_id: undefined,
    title: "",
    description: "",
    type: "",
    choices: [],
    score: 0,
    quizzes: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    type: "",
    choices: "",
    score: "",
  });

  const [quizzesOptions, setQuizzesOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!questionId || isNaN(Number(questionId))) {
        const errorMessage = `รหัสคำถามไม่ถูกต้อง (questionId: ${questionId}) ที่ URL: ${window.location.href}. กรุณาใช้ URL รูปแบบ /admin-questions/edit/:questionId`;
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

        console.log(`Fetching question data for questionId: ${questionId}`);
        const questionResponse = await axios.get(
          `${apiUrl}/api/courses/questions/${questionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Question API response:", questionResponse.data);

        const question = questionResponse.data.question;
        if (!question) {
          const errorMessage = questionResponse.data.message || "ไม่พบข้อมูลคำถาม";
          throw new Error(
            `ดึงข้อมูลคำถามล้มเหลว: ${errorMessage} (API response: ${JSON.stringify(questionResponse.data)})`
          );
        }

        const formattedChoices = question.choices?.map((choice: any) => ({
          id: String(choice.id || Date.now() + Math.random()),
          text: choice.text || "",
          isCorrect: choice.is_correct || false,
        })) || [];

        setQuestionData({
          question_id: Number(question.question_id || questionId),
          title: question.title || "",
          description: question.description || "",
          type: question.type || "",
          choices: formattedChoices,
          score: question.score || 0,
          quizzes: question.quizzes?.map((q: any) => String(q.quiz_id || q.id)) || [],
        });

        console.log("Fetching quizzes data...");
        const quizzesResponse = await axios.get(
          `${apiUrl}/api/courses/quizzes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Quizzes API response:", quizzesResponse.data);

        const quizzes = quizzesResponse.data.quizzes;
        if (quizzes && Array.isArray(quizzes)) {
          setQuizzesOptions(
            quizzes.map((q: Quiz) => ({
              value: String(q.id),
              label: `${q.title} (${q.questions} questions)`,
            }))
          );
        } else {
          console.warn(
            "Failed to load quizzes:",
            quizzesResponse.data.message || "ไม่มีข้อมูลแบบทดสอบ",
            "(API response: ",
            JSON.stringify(quizzesResponse.data),
            ")"
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
  }, [questionId, apiUrl, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const questionTypeValue = name === "type" ? (value as QuestionType) : value;

    setQuestionData((prev) => {
      const updatedData: QuestionData = {
        ...prev,
        [name]: name === "score" ? Number(value) : questionTypeValue,
      };

      if (name === "type" && value === "TF") {
        updatedData.type = "TF";
        updatedData.choices = [
          { id: "1", text: "True", isCorrect: false },
          { id: "2", text: "False", isCorrect: false },
        ];
      } else if (name === "type" && value !== "TF") {
        updatedData.type = questionTypeValue as QuestionType;
        updatedData.choices = [] as Choice[];
      }

      return updatedData;
    });

    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleChoiceChange = (index: number, field: "text" | "isCorrect", value: string | boolean) => {
    setQuestionData((prev) => {
      const newChoices = [...prev.choices];
      newChoices[index] = {
        ...newChoices[index],
        [field]: value,
      };

      if ((prev.type === "SC" || prev.type === "TF") && field === "isCorrect" && value === true) {
        newChoices.forEach((choice, i) => {
          if (i !== index) {
            choice.isCorrect = false;
          }
        });
      }

      return {
        ...prev,
        choices: newChoices,
      };
    });
  };

  const addChoice = () => {
    if (questionData.type === "TF") {
      toast.error("ประเภทคำถาม True/False มีตัวเลือกได้แค่ True และ False");
      return;
    }

    setQuestionData((prev) => ({
      ...prev,
      choices: [
        ...prev.choices,
        { id: String(Date.now() + Math.random()), text: "", isCorrect: false },
      ],
    }));
  };

  const removeChoice = (index: number) => {
    if (questionData.type === "TF") {
      toast.error("ไม่สามารถลบตัวเลือกของคำถาม True/False ได้");
      return;
    }

    setQuestionData((prev) => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index),
    }));
  };

  // ปรับ handleQuizzesChange ให้เพิ่ม quiz ทีละอัน
  const handleQuizzesChange = (
    selected: SingleValue<{ value: string; label: string }>
  ) => {
    if (selected) {
      const quizId = selected.value;
      // ตรวจสอบว่า quiz นี้มีอยู่ใน questionData.quizzes หรือยัง
      if (!questionData.quizzes.includes(quizId)) {
        setQuestionData((prev) => ({
          ...prev,
          quizzes: [...prev.quizzes, quizId],
        }));
      } else {
        toast.info("แบบทดสอบนี้ถูกเลือกแล้ว");
      }
    }
  };

  // เพิ่มฟังก์ชันสำหรับลบ quiz
  const removeQuiz = (quizId: string) => {
    setQuestionData((prev) => ({
      ...prev,
      quizzes: prev.quizzes.filter((id) => id !== quizId),
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      description: "",
      type: "",
      choices: "",
      score: "",
    };

    if (!questionData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อคำถาม";
      isValid = false;
    }

    if (!questionData.description?.trim()) {
      newErrors.description = "กรุณาระบุคำอธิบายคำถาม";
      isValid = false;
    }

    if (!questionData.type) {
      newErrors.type = "กรุณาเลือกประเภทคำถาม";
      isValid = false;
    }

    if (questionData.score <= 0) {
      newErrors.score = "คะแนนต้องมากกว่า 0";
      isValid = false;
    }

    if (questionData.type && questionData.type !== "FB") {
      if (questionData.choices.length < 2) {
        newErrors.choices = "ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก";
        isValid = false;
      } else if (!questionData.choices.some((choice) => choice.isCorrect)) {
        newErrors.choices = "ต้องมีตัวเลือกที่ถูกต้องอย่างน้อย 1 ตัวเลือก";
        isValid = false;
      } else if (questionData.choices.some((choice) => !choice.text.trim())) {
        newErrors.choices = "ตัวเลือกทั้งหมดต้องมีข้อความ";
        isValid = false;
      }
    }

    if (questionData.type === "TF") {
      const correctCount = questionData.choices.filter((c) => c.isCorrect).length;
      if (correctCount !== 1) {
        newErrors.choices = "คำถาม True/False ต้องเลือกคำตอบที่ถูกต้อง 1 ตัวเลือก";
        isValid = false;
      }
    }

    if (questionData.type === "SC") {
      const correctCount = questionData.choices.filter((c) => c.isCorrect).length;
      if (correctCount !== 1) {
        newErrors.choices = "คำถาม Single Choice ต้องเลือกคำตอบที่ถูกต้อง 1 ตัวเลือก";
        isValid = false;
      }
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
        questionId: questionData.question_id,
        title: questionData.title,
        description: questionData.description,
        type: questionData.type,
        choices: questionData.choices,
        score: questionData.score,
        quizzes: questionData.quizzes,
      };

      const response = await axios.put(
        `${apiUrl}/api/courses/questions/${questionId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setApiSuccess("แก้ไขคำถามสำเร็จ");
        toast.success("แก้ไขคำถามสำเร็จ");
        setTimeout(() => {
          navigate("/admin-questions");
        }, 1500);
      } else {
        setApiError(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขคำถาม");
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขคำถาม");
      }
    } catch (error: any) {
      console.error("Error updating question:", error);
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
      navigate("/admin-questions");
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
            onClick={() => navigate("/admin-questions")}
          >
            กลับไปยังรายการคำถาม
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
          <h5 className="card-title mb-3">1. ข้อมูลคำถาม</h5>

          <div className="mb-3">
            <label htmlFor="questionId" className="form-label">
              รหัสคำถาม
            </label>
            <input
              type="text"
              className="form-control"
              id="questionId"
              value={questionData.question_id || "กำลังโหลด..."}
              readOnly
              disabled
            />
          </div>

          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              ชื่อคำถาม <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              id="title"
              name="title"
              value={questionData.title}
              onChange={handleInputChange}
              placeholder="ระบุชื่อคำถาม"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              คำอธิบาย <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              id="description"
              name="description"
              value={questionData.description || ""}
              onChange={handleInputChange}
              rows={4}
              placeholder="ระบุคำอธิบายเกี่ยวกับคำถาม"
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="type" className="form-label">
              ประเภทคำถาม <span className="text-danger">*</span>
            </label>
            <select
              className={`form-control ${errors.type ? "is-invalid" : ""}`}
              id="type"
              name="type"
              value={questionData.type}
              onChange={handleInputChange}
            >
              <option value="">เลือกประเภทคำถาม</option>
              <option value="TF">True/False (TF)</option>
              <option value="MC">Multiple Choice (MC)</option>
              <option value="SC">Single Choice (SC)</option>
              <option value="FB">Fill in the Blank (FB)</option>
            </select>
            {errors.type && <div className="invalid-feedback">{errors.type}</div>}
          </div>

          {questionData.type && questionData.type !== "FB" && (
            <div className="mb-3">
              <label className="form-label">ตัวเลือกคำตอบ</label>
              {questionData.choices.length > 0 ? (
                <ul className="list-group">
                  {questionData.choices.map((choice, index) => (
                    <li
                      key={choice.id}
                      className="list-group-item d-flex align-items-center gap-3"
                    >
                      <input
                        type="text"
                        className="form-control"
                        value={choice.text}
                        onChange={(e) =>
                          handleChoiceChange(index, "text", e.target.value)
                        }
                        placeholder={`ตัวเลือก ${index + 1}`}
                        disabled={questionData.type === "TF"}
                      />
                      <div className="form-check">
                        <input
                          type={questionData.type === "MC" ? "checkbox" : "radio"}
                          className="form-check-input"
                          checked={choice.isCorrect}
                          onChange={(e) =>
                            handleChoiceChange(index, "isCorrect", e.target.checked)
                          }
                        />
                        <label className="form-check-label">คำตอบที่ถูกต้อง</label>
                      </div>
                      {questionData.type !== "TF" && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeChoice(index)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">ยังไม่มีตัวเลือก</p>
              )}
              {errors.choices && (
                <div className="text-danger small mt-2">{errors.choices}</div>
              )}
              {questionData.type !== "TF" && (
                <button
                  type="button"
                  className="btn btn-outline-primary mt-2"
                  onClick={addChoice}
                >
                  <i className="fas fa-plus me-2"></i>เพิ่มตัวเลือก
                </button>
              )}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="score" className="form-label">
              คะแนน <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className={`form-control ${errors.score ? "is-invalid" : ""}`}
              id="score"
              name="score"
              value={questionData.score}
              onChange={handleInputChange}
              placeholder="ระบุคะแนน"
              min="1"
            />
            {errors.score && <div className="invalid-feedback">{errors.score}</div>}
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">2. ตั้งค่าเพิ่มเติม</h5>

          <div className="mb-3">
            <label className="form-label">แบบทดสอบที่เกี่ยวข้อง</label>
            {/* เปลี่ยนจาก isMulti เป็น single select */}
            <Select
              options={quizzesOptions}
              onChange={handleQuizzesChange}
              placeholder="เลือกแบบทดสอบที่เกี่ยวข้อง"
              value={null} // ไม่ต้องกำหนด value เพราะเราจะแสดงรายการที่เลือกด้านล่าง
            />
            {/* แสดงรายการ quizzes ที่เลือกแล้ว พร้อมปุ่มลบ */}
            {questionData.quizzes.length > 0 ? (
              <ul className="list-group mt-2">
                {questionData.quizzes.map((quizId) => {
                  const quiz = quizzesOptions.find((option) => option.value === quizId);
                  return (
                    <li
                      key={quizId}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{quiz ? quiz.label : `Quiz ID: ${quizId}`}</span>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeQuiz(quizId)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted mt-2">ยังไม่ได้เลือกแบบทดสอบ</p>
            )}
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
              <i className="fas fa-save me-2"></i>บันทึกคำถาม
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditQuestion;