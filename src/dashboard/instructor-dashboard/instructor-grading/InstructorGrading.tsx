import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./InstructorGrading.css";

interface Question {
    question_id: number;
    title: string;
    type: string;
    score: number;
}

interface Attachment {
    attachment_id: number;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
}

interface Answer {
    answer_id: number;
    question_id: number;
    text_answer: string;
    is_correct: boolean;
    score_earned: number;
    question_title: string;
    question_type: string;
    question_max_score: number;
    attachments: Attachment[];
}

interface Attempt {
    attempt_id: number;
    user_id: number;
    quiz_id: number;
    quiz_title: string;
    subject_id: number;
    subject_title: string;
    subject_code: string;
    status: string;
    score: number;
    max_score: number;
    passed: boolean;
    created_at: string;
    end_time: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    answers: Answer[];
}

interface SubjectSummary {
    subject_id: number;
    subject_title: string;
    subject_code: string;
    pending_count: number;
    attempts: Attempt[];
    department_name?: string;
    faculty?: string;
    is_home_faculty?: boolean;
}

interface InstructorGradingProps {
    isPopup?: boolean;
    selectedAttemptId?: number | null;
    onClose?: () => void;
    onGraded?: (attemptId: number, passed: boolean) => void;
    onOpenGrading?: (attemptId: number) => void;
}

const InstructorGrading: React.FC<InstructorGradingProps> = ({
    isPopup = false,
    selectedAttemptId,
    onClose,
    onGraded,
    onOpenGrading,
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [attemptAnswers, setAttemptAnswers] = useState<Answer[]>([]);

    const [subjectSummaries, setSubjectSummaries] = useState<SubjectSummary[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [scores, setScores] = useState<{ [key: number]: number }>({});
    const [isCorrect, setIsCorrect] = useState<{ [key: number]: boolean }>({});
    const [feedback, setFeedback] = useState<{ [key: number]: string }>({});
    const [studentInfo, setStudentInfo] = useState<{
        fullname: string;
        email: string;
        attemptDate: string;
    } | null>(null);
    const [totalScore, setTotalScore] = useState<number>(0);
    const [totalMaxScore, setTotalMaxScore] = useState<number>(0);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [quizTitle, setQuizTitle] = useState<string>("");
    const [currentView, setCurrentView] = useState<'subjects' | 'attempts' | 'grading'>('subjects');
    const [instructorFaculty, setInstructorFaculty] = useState<string | null>(null);

    const apiURL = import.meta.env.VITE_API_URL;

    // ฟังก์ชันหาคำถามจาก question_id
    const findQuestion = (questionId: number): Question | undefined => {
        return questions.find((q) => q.question_id === questionId);
    };



    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("กรุณาเข้าสู่ระบบ");
                setLoading(false);
                return;
            }

            if (isPopup && selectedAttemptId) {
                // โหมด Popup: ดึงข้อมูล attempt เฉพาะ
                const response = await axios.get(
                    `${apiURL}/api/special-quiz/attempt/${selectedAttemptId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    const attempt: Attempt = response.data.attempt;

                    if (!attempt || !attempt.answers) {
                        setError("ข้อมูลการทำแบบทดสอบไม่ถูกต้อง");
                        setLoading(false);
                        return;
                    }

                    setAttemptAnswers(attempt.answers);
                    setStudentInfo({
                        fullname: `${attempt.first_name} ${attempt.last_name}`,
                        email: attempt.email,
                        attemptDate: new Date(attempt.end_time).toLocaleString(),
                    });

                    // ดึงข้อมูลแบบทดสอบ
                    const quizResponse = await axios.get(
                        `${apiURL}/api/special-quiz/quiz/${attempt.quiz_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (quizResponse.data.success) {
                        setQuestions(quizResponse.data.quiz.questions);
                        setQuizTitle(quizResponse.data.quiz.title);

                        const initialScores: { [key: number]: number } = {};
                        const initialIsCorrect: { [key: number]: boolean } = {};
                        const initialFeedback: { [key: number]: string } = {};

                        attempt.answers.forEach((answer) => {
                            initialScores[answer.question_id] = answer.score_earned || 0;
                            initialIsCorrect[answer.question_id] = answer.is_correct || false;
                            initialFeedback[answer.question_id] = "";
                        });

                        setScores(initialScores);
                        setIsCorrect(initialIsCorrect);
                        setFeedback(initialFeedback);

                        let total = 0;
                        let maxTotal = 0;
                        quizResponse.data.quiz.questions.forEach((q: Question) => {
                            maxTotal += q.score;
                            if (initialScores[q.question_id] !== undefined) {
                                total += initialScores[q.question_id];
                            }
                        });

                        setTotalScore(total);
                        setTotalMaxScore(maxTotal);
                        setCurrentView('grading');
                    } else {
                        setError("ไม่สามารถโหลดข้อมูลแบบทดสอบได้");
                    }
                } else {
                    setError("ไม่สามารถโหลดข้อมูลการทำแบบทดสอบได้");
                }
            } else {
                // โหมด Non-Popup: ดึงรายวิชาทั้งหมดที่อาจารย์สอน
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                // ดึงรายวิชาทั้งหมดที่อาจารย์สอน
                const subjectsResponse = await axios.get(
                    `${apiURL}/api/courses/subjects/instructors/cou`,
                    config
                );

                if (subjectsResponse.data.success) {
                    const allSubjects = subjectsResponse.data.courses || [];

                    // ดึงข้อมูลอาจารย์และคณะที่สังกัด
                    const userDataStr = localStorage.getItem('userData');
                    let instructorDepartmentFaculty = null;
                    
                    if (userDataStr) {
                        const userData = JSON.parse(userDataStr);
                        if (userData.user_id) {
                            try {
                                const instructorResponse = await axios.get(
                                    `${apiURL}/api/accounts/instructors/user/${userData.user_id}`,
                                    config
                                );
                                if (instructorResponse.data.success) {
                                    // ดึงข้อมูลคณะของอาจารย์จาก department
                                    const departmentId = instructorResponse.data.instructor.department;
                                    if (departmentId) {
                                        const departmentResponse = await axios.get(
                                            `${apiURL}/api/auth/departments`,
                                            config
                                        );
                                        if (departmentResponse.data.success) {
                                            const department = departmentResponse.data.departments.find(
                                                (dept: any) => dept.department_id === departmentId
                                            );
                                            if (department) {
                                                instructorDepartmentFaculty = department.faculty;
                                                setInstructorFaculty(department.faculty);
                                            }
                                        }
                                    }
                                }
                            } catch (error) {
                                console.log("Could not fetch instructor department info:", error);
                            }
                        }
                    }

                    // ดึงข้อมูลงานที่รอตรวจทั้งหมด
                    const attemptsResponse = await axios.get(
                        `${apiURL}/api/special-quiz/attempts/all`,
                        config
                    );

                    const pendingAttempts = attemptsResponse.data.success ? attemptsResponse.data.attempts || [] : [];

                    // ดึงข้อมูลคณะของแต่ละรายวิชา
                    const departmentsResponse = await axios.get(
                        `${apiURL}/api/auth/departments`,
                        config
                    );
                    
                    const departments = departmentsResponse.data.success ? departmentsResponse.data.departments : [];

                    // สร้าง SubjectSummary จากรายวิชาทั้งหมด พร้อมข้อมูลคณะ
                    const subjectSummaries: SubjectSummary[] = allSubjects.map((subject: any) => {
                        // หางานที่รอตรวจสำหรับรายวิชานี้
                        const subjectAttempts = pendingAttempts.filter((attempt: Attempt) =>
                            attempt.subject_id === subject.subject_id
                        );

                        // หาคณะของรายวิชานี้
                        const subjectDepartment = departments.find((dept: any) => dept.department_id === subject.department_id);
                        const subjectFaculty = subjectDepartment?.faculty || null;
                        const isHomeFaculty = instructorDepartmentFaculty && subjectFaculty === instructorDepartmentFaculty;

                        return {
                            subject_id: subject.subject_id,
                            subject_title: subject.subject_name,
                            subject_code: subject.subject_code,
                            pending_count: subjectAttempts.length,
                            attempts: subjectAttempts,
                            department_name: subjectDepartment?.department_name,
                            faculty: subjectFaculty,
                            is_home_faculty: isHomeFaculty
                        };
                    });

                    // เรียงลำดับ: คณะเดียวกันก่อน แล้วเรียงตามจำนวนงานรอตรวจ
                    subjectSummaries.sort((a, b) => {
                        // คณะเดียวกันอยู่ข้างบน
                        if (a.is_home_faculty && !b.is_home_faculty) return -1;
                        if (!a.is_home_faculty && b.is_home_faculty) return 1;
                        // ถ้าคณะเดียวกัน เรียงตามจำนวนงานรอตรวจ
                        return b.pending_count - a.pending_count;
                    });

                    setSubjectSummaries(subjectSummaries);
                } else {
                    setError("ไม่สามารถโหลดรายการรายวิชาได้");
                }
            }
        } catch (error) {
            console.error("Error loading data:", error);
            setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    // โหลดข้อมูล
    useEffect(() => {
        loadData();
    }, [apiURL, isPopup, selectedAttemptId]);

    // ฟังก์ชันจัดการการเปลี่ยนแปลงคะแนน
    const handleScoreChange = (questionId: number, score: number) => {
        const question = findQuestion(questionId);
        if (!question) return;

        const maxScore = question.score;
        const validScore = Math.min(Math.max(0, score), maxScore);

        setScores((prev) => ({
            ...prev,
            [questionId]: validScore,
        }));

        setIsCorrect((prev) => ({
            ...prev,
            [questionId]: validScore === maxScore,
        }));

        let newTotalScore = 0;
        for (const qId in scores) {
            if (parseInt(qId) !== questionId) {
                newTotalScore += scores[parseInt(qId)] || 0;
            }
        }
        newTotalScore += validScore;
        setTotalScore(newTotalScore);
    };

    // ฟังก์ชันจัดการการเปลี่ยนแปลงความคิดเห็น
    const handleFeedbackChange = (questionId: number, text: string) => {
        setFeedback((prev) => ({
            ...prev,
            [questionId]: text,
        }));
    };

    // ฟังก์ชันบันทึกการให้คะแนน
    const handleSaveGrading = async () => {
        if (!selectedAttemptId) {
            toast.error("ไม่พบ attempt ที่ต้องการให้คะแนน");
            return;
        }
        try {
            setIsSaving(true);

            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("กรุณาเข้าสู่ระบบ");
                return;
            }

            const answersToSubmit = attemptAnswers.map((answer) => ({
                question_id: answer.question_id,
                score_earned: scores[answer.question_id] || 0,
                is_correct: isCorrect[answer.question_id] || false,
                feedback: feedback[answer.question_id] || "",
            }));

            const response = await axios.post(
                `${apiURL}/api/special-quiz/attempt/${selectedAttemptId}/grade`,
                { answers: answersToSubmit },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                toast.success("บันทึกการให้คะแนนเรียบร้อยแล้ว");

                if (onGraded && selectedAttemptId !== null && selectedAttemptId !== undefined) {
                    const passed = response.data.attempt.passed;
                    onGraded(selectedAttemptId, passed);
                }

                // === Trigger refresh progress for student ===
                // ใช้ selectedSubjectId (state) แทน
                if (selectedSubjectId) {
                    try {
                        await axios.get(`${apiURL}/api/learn/subject/${selectedSubjectId}/progress`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                    } catch (e) { /* ignore */ }
                }

                if (onClose) {
                    onClose();
                } else {
                    // กลับไปหน้ารายการรายวิชา
                    setCurrentView('subjects');
                    loadData();
                }
            } else {
                toast.error(response.data.message || "ไม่สามารถบันทึกการให้คะแนนได้");
            }
        } catch (error) {
            console.error("Error saving grading:", error);
            toast.error("เกิดข้อผิดพลาดในการบันทึกการให้คะแนน");
        } finally {
            setIsSaving(false);
        }
    };

    // ฟังก์ชันเลือกรายวิชา
    const handleSelectSubject = (subjectId: number) => {
        setSelectedSubjectId(subjectId);
        setCurrentView('attempts');
    };

    // ฟังก์ชันเลือกงานที่จะตรวจ
    const handleSelectAttempt = async (attemptId: number) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${apiURL}/api/special-quiz/attempt/${attemptId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                const attempt: Attempt = response.data.attempt;

                setAttemptAnswers(attempt.answers);
                setStudentInfo({
                    fullname: `${attempt.first_name} ${attempt.last_name}`,
                    email: attempt.email,
                    attemptDate: new Date(attempt.end_time).toLocaleString(),
                });

                // ดึงข้อมูลแบบทดสอบ
                const quizResponse = await axios.get(
                    `${apiURL}/api/special-quiz/quiz/${attempt.quiz_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (quizResponse.data.success) {
                    setQuestions(quizResponse.data.quiz.questions);
                    setQuizTitle(quizResponse.data.quiz.title);

                    const initialScores: { [key: number]: number } = {};
                    const initialIsCorrect: { [key: number]: boolean } = {};
                    const initialFeedback: { [key: number]: string } = {};

                    attempt.answers.forEach((answer) => {
                        initialScores[answer.question_id] = answer.score_earned || 0;
                        initialIsCorrect[answer.question_id] = answer.is_correct || false;
                        initialFeedback[answer.question_id] = "";
                    });

                    setScores(initialScores);
                    setIsCorrect(initialIsCorrect);
                    setFeedback(initialFeedback);

                    let total = 0;
                    let maxTotal = 0;
                    quizResponse.data.quiz.questions.forEach((q: Question) => {
                        maxTotal += q.score;
                        if (initialScores[q.question_id] !== undefined) {
                            total += initialScores[q.question_id];
                        }
                    });

                    setTotalScore(total);
                    setTotalMaxScore(maxTotal);
                    setCurrentView('grading');
                }
            }
        } catch (error) {
            console.error("Error loading attempt:", error);
            toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันกลับไปหน้าก่อนหน้า
    const handleBack = () => {
        if (currentView === 'grading') {
            setCurrentView('attempts');
        } else if (currentView === 'attempts') {
            setCurrentView('subjects');
            setSelectedSubjectId(null);
        }
    };

    // แสดงหน้าโหลด
    if (loading) {
        return (
            <div className={`grading-container ${isPopup ? "popup-mode" : ""}`}>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-3">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`grading-container ${isPopup ? "popup-mode" : ""}`}>
                <div className="text-center py-5">
                    <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                    {isPopup && (
                        <button
                            className="btn btn-outline-secondary mt-3"
                            onClick={onClose}
                        >
                            ปิด
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // แสดงหน้าตรวจงาน (เหมือนเดิม)
    if (currentView === 'grading') {
        return (
            <div className={`grading-container ${isPopup ? "popup-mode" : ""}`}>
                {isPopup && (
                    <div className="popup-header">
                        <h4>ตรวจแบบทดสอบ: {quizTitle}</h4>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                )}

                {!isPopup && (
                    <div className="d-flex align-items-center mb-4">
                        <button
                            className="btn btn-outline-secondary me-3"
                            onClick={handleBack}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            กลับ
                        </button>
                        <h4 className="mb-0">ตรวจแบบทดสอบ: {quizTitle}</h4>
                    </div>
                )}

                <div className="grading-content">
                    {studentInfo && (
                        <div className="student-info card mb-4">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h5 className="card-title">ข้อมูลผู้เรียน</h5>
                                        <p className="mb-1">
                                            <strong>ชื่อ:</strong> {studentInfo.fullname}
                                        </p>
                                        <p className="mb-1">
                                            <strong>อีเมล:</strong> {studentInfo.email}
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <h5 className="card-title">ข้อมูลการทำแบบทดสอบ</h5>
                                        <p className="mb-1">
                                            <strong>วันที่ส่ง:</strong> {studentInfo.attemptDate}
                                        </p>
                                        <p className="mb-1">
                                            <strong>สถานะ:</strong>
                                            <span className="badge bg-warning ms-2">รอการตรวจ</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="score-summary card mb-4">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    คะแนนรวม: {totalScore} / {totalMaxScore}
                                </h5>
                                <div className="progress w-50">
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{
                                            width: `${totalMaxScore > 0
                                                    ? (totalScore / totalMaxScore) * 100
                                                    : 0
                                                }%`,
                                        }}
                                        aria-valuenow={totalScore}
                                        aria-valuemin={0}
                                        aria-valuemax={totalMaxScore}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-muted mt-2 mb-0">
                                เกณฑ์ผ่าน: {Math.ceil(totalMaxScore * 0.65)} คะแนน (
                                {totalMaxScore > 0
                                    ? Math.ceil((totalScore / totalMaxScore) * 100)
                                    : 0}
                                %)
                            </p>
                        </div>
                    </div>

                    <div className="questions-container">
                        {attemptAnswers.map((answer, index) => {
                            const question = findQuestion(answer.question_id);
                            if (!question) return null;

                            return (
                                <div
                                    key={answer.question_id}
                                    className="question-item card mb-4"
                                >
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">คำถามที่ {index + 1}</h5>
                                        <span className="badge bg-primary">
                                            คะแนนเต็ม: {question.score} คะแนน
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <div className="question-text mb-3">
                                            <h6>คำถาม:</h6>
                                            <p>{question.title}</p>
                                        </div>

                                        <div className="answer-text mb-3">
                                            <h6>คำตอบของผู้เรียน:</h6>
                                            <div className="p-3 bg-light rounded">
                                                {answer.text_answer ? (
                                                    <p className="mb-0">{answer.text_answer}</p>
                                                ) : (
                                                    <p className="text-muted mb-0">ไม่มีคำตอบข้อความ</p>
                                                )}
                                            </div>
                                        </div>

                                        {answer.attachments && answer.attachments.length > 0 && (
                                            <div className="attachments mb-3">
                                                <h6>ไฟล์แนบ:</h6>
                                                <ul className="list-group">
                                                    {answer.attachments.map((attachment) => (
                                                        <li
                                                            key={attachment.attachment_id}
                                                            className="list-group-item d-flex justify-content-between align-items-center"
                                                        >
                                                            <span>
                                                                <i className="fas fa-file me-2 text-white"></i>
                                                                {attachment.file_name}
                                                            </span>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <a
                                                                    href={`${apiURL}${attachment.file_url}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm btn-outline-light d-flex align-items-center text-white"
                                                                >
                                                                    <i className="fas fa-eye me-1 text-white"></i>
                                                                    ดู
                                                                </a>
                                                                <a
                                                                    href={`${apiURL}${attachment.file_url}`}
                                                                    download
                                                                    className="btn btn-sm btn-outline-light d-flex align-items-center text-white"
                                                                >
                                                                    <i className="fas fa-download me-1 text-white"></i>
                                                                    ดาวน์โหลด
                                                                </a>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="grading-section">
                                            <h6>การให้คะแนน:</h6>
                                            <div className="row align-items-center mb-3">
                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <span className="input-group-text">คะแนน</span>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            min="0"
                                                            max={question.score}
                                                            value={scores[answer.question_id] || 0}
                                                            onChange={(e) =>
                                                                handleScoreChange(
                                                                    answer.question_id,
                                                                    parseInt(e.target.value)
                                                                )
                                                            }
                                                        />
                                                        <span className="input-group-text">
                                                            / {question.score}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`correct-${answer.question_id}`}
                                                            checked={isCorrect[answer.question_id] || false}
                                                            onChange={(e) => {
                                                                setIsCorrect((prev) => ({
                                                                    ...prev,
                                                                    [answer.question_id]: e.target.checked,
                                                                }));
                                                                if (e.target.checked) {
                                                                    handleScoreChange(
                                                                        answer.question_id,
                                                                        question.score
                                                                    );
                                                                } else {
                                                                    handleScoreChange(answer.question_id, 0);
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`correct-${answer.question_id}`}
                                                        >
                                                            ตอบถูกต้อง (ให้คะแนนเต็ม)
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="feedback-section">
                                                <label
                                                    htmlFor={`feedback-${answer.question_id}`}
                                                    className="form-label"
                                                >
                                                    ความคิดเห็น/ข้อเสนอแนะ:
                                                </label>
                                                <textarea
                                                    id={`feedback-${answer.question_id}`}
                                                    className="form-control"
                                                    rows={3}
                                                    value={feedback[answer.question_id] || ""}
                                                    onChange={(e) =>
                                                        handleFeedbackChange(
                                                            answer.question_id,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="ให้ข้อเสนอแนะเพิ่มเติม (ถ้ามี)"
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grading-actions d-flex justify-content-between">
                        {!isPopup && (
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleBack}
                                disabled={isSaving}
                            >
                                <i className="fas fa-arrow-left me-2"></i>
                                กลับ
                            </button>
                        )}
                        {isPopup && (
                            <button
                                className="btn btn-outline-secondary"
                                onClick={onClose}
                                disabled={isSaving}
                            >
                                ยกเลิก
                            </button>
                        )}
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveGrading}
                            disabled={isSaving}
                        >
                            {isSaving ? (
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
                                    <i className="fas fa-save me-2"></i>
                                    บันทึกการให้คะแนน
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // แสดงรายการงานที่รอตรวจของรายวิชาที่เลือก
    if (currentView === 'attempts') {
        const selectedSubject = subjectSummaries.find(s => s.subject_id === selectedSubjectId);

        return (
            <div className="grading-container">
                <div className="grading-content">
                    <div className="d-flex align-items-center mb-4">
                        <button
                            className="btn btn-outline-secondary me-3"
                            onClick={handleBack}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            กลับ
                        </button>
                        <div>
                            <h4 className="mb-0">งานที่รอตรวจ</h4>
                            <p className="text-muted mb-0">
                                {selectedSubject?.subject_code} - {selectedSubject?.subject_title}
                            </p>
                        </div>
                    </div>

                    {selectedSubject && selectedSubject.attempts.length === 0 ? (
                        <div className="alert alert-info">
                            <i className="fas fa-info-circle me-2"></i>
                            ไม่พบงานที่รอตรวจในรายวิชานี้
                        </div>
                    ) : (
                        <div className="row">
                            {selectedSubject?.attempts.map((attempt) => (
                                <div key={attempt.attempt_id} className="col-md-6 col-lg-4 mb-4">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="avatar-circle me-3">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                                <div>
                                                    <h6 className="card-title mb-1">
                                                        {attempt.first_name} {attempt.last_name}
                                                    </h6>
                                                    <small className="text-muted">{attempt.email}</small>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <p className="card-text mb-2">
                                                    <strong>แบบทดสอบ:</strong> {attempt.quiz_title}
                                                </p>
                                                <p className="card-text mb-2">
                                                    <strong>วันที่ส่ง:</strong><br />
                                                    <small>{new Date(attempt.end_time).toLocaleString('th-TH')}</small>
                                                </p>
                                                <div className="d-flex align-items-center">
                                                    <span className="badge bg-warning me-2">
                                                        <i className="fas fa-clock me-1"></i>
                                                        รอการตรวจ
                                                    </span>
                                                    <small className="text-muted">
                                                        {attempt.answers?.length || 0} คำตอบ
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer bg-transparent">
                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={() => {
                                                    if (onOpenGrading) {
                                                        onOpenGrading(attempt.attempt_id);
                                                    } else {
                                                        handleSelectAttempt(attempt.attempt_id);
                                                    }
                                                }}
                                            >
                                                <i className="fas fa-edit me-2"></i>
                                                ตรวจแบบทดสอบ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // แสดงรายการรายวิชาที่มีงานรอตรวจ (หน้าหลัก)
    return (
        <div className="grading-container">
            <div className="grading-content">
                <div className="d-flex justify-content-between align-items-center mb-4 p-4 bg-primary rounded">
                    <div>
                        <h4 className="text-white mb-1">การตรวจแบบทดสอบ</h4>
                        <p className="text-white-50 mb-0">รายวิชาทั้งหมดที่ท่านสอน</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-light text-dark px-3 py-2">
                            <i className="fas fa-book me-2"></i>
                            รายวิชาทั้งหมด: {subjectSummaries.length} 
                            {instructorFaculty && <small className="ms-1">({instructorFaculty})</small>}
                        </span>
                        <span className="badge bg-warning text-dark px-3 py-2">
                            <i className="fas fa-tasks me-2"></i>
                            งานรอตรวจ: {subjectSummaries.reduce((total, subject) => total + subject.pending_count, 0)}
                        </span>
                    </div>
                </div>

                {subjectSummaries.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="mb-4">
                            <i className="fas fa-book fa-4x text-muted"></i>
                        </div>
                        <h5 className="text-muted">ไม่มีรายวิชา</h5>
                        <p className="text-muted">ยังไม่มีรายวิชาที่ท่านสอนในระบบ</p>
                    </div>
                ) : (
                    <div className="row">
                        {subjectSummaries.map((subject) => (
                            <div key={subject.subject_id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="subject-icon">
                                                <i className="fas fa-book fa-2x text-primary"></i>
                                            </div>
                                            <span className={`badge ${subject.pending_count > 0 ? 'bg-warning text-dark' : 'bg-success text-white'}`}>
                                                {subject.pending_count > 0 ? `${subject.pending_count} งาน` : 'ไม่มีงาน'}
                                            </span>
                                        </div>

                                        <h5 className="card-title mb-2 text-dark">{subject.subject_title}</h5>
                                        <p className="card-text text-muted mb-2">
                                            <small>รหัสวิชา: {subject.subject_code}</small>
                                        </p>
                                        {subject.faculty && (
                                            <p className="card-text mb-3">
                                                <small className={`${subject.is_home_faculty ? 'text-primary fw-bold' : 'text-secondary'}`}>
                                                    <i className={`fas ${subject.is_home_faculty ? 'fa-home' : 'fa-building'} me-1`}></i>
                                                    {subject.faculty}
                                                </small>
                                            </p>
                                        )}

                                        <div className="mb-3">
                                            <div className="d-flex align-items-center">
                                                <i className={`fas ${subject.pending_count > 0 ? 'fa-exclamation-triangle text-warning' : 'fa-check-circle text-success'} me-2`}></i>
                                                <small className="text-muted">
                                                    {subject.pending_count > 0
                                                        ? `มีงานรอตรวจ ${subject.pending_count} งาน`
                                                        : 'ไม่มีงานรอตรวจ'}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-transparent">
                                        <button
                                            className={`btn w-100 ${subject.pending_count > 0 ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => handleSelectSubject(subject.subject_id)}
                                            disabled={subject.pending_count === 0}
                                        >
                                            <i className={`fas ${subject.pending_count > 0 ? 'fa-eye' : 'fa-check'} me-2`}></i>
                                            {subject.pending_count > 0 ? 'ดูงานที่รอตรวจ' : 'ไม่มีงานรอตรวจ'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorGrading;

