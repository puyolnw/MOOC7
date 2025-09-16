import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./InstructorGrading.css";

interface Question {
    question_id: number;
    title: string;
    type: string;
    score?: number;
    max_score?: number;
    points?: number;
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
    upload_time?: string;
    updated_time?: string;
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

// Mock data for instructor grading (using Special Quiz API instead)

// Mock data removed - using Special Quiz API instead
// eslint-disable-next-line @typescript-eslint/no-unused-vars


// Mock data removed - using Special Quiz API instead
// eslint-disable-next-line @typescript-eslint/no-unused-vars


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
    const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [quickGradingData, setQuickGradingData] = useState<{[attemptId: number]: {scores: {[questionId: number]: number}, feedback: {[questionId: number]: string}, questions: Question[]}}>({});
    const [quickGradingSaving, setQuickGradingSaving] = useState<{[attemptId: number]: boolean}>({});

    const apiURL = import.meta.env.VITE_API_URL;

    // ฟังก์ชันดึงข้อมูล Special Quiz attempts จาก API จริง
    const fetchSpecialQuizAttempts = async () => {
        try {
            console.log("🔍 [InstructorGrading] Fetching special quiz attempts...");
            console.log("🔍 [InstructorGrading] API URL:", `${apiURL}/api/special-quiz/attempts/instructor`);
            console.log("🔍 [InstructorGrading] Auth token:", localStorage.getItem("token") ? "Present" : "Missing");
            
            const response = await axios.get(
                `${apiURL}/api/special-quiz/attempts/instructor`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            console.log("🔍 [InstructorGrading] Raw response:", response);
            console.log("🔍 [InstructorGrading] Response data:", response.data);

            if (response.data.success) {
                console.log("✅ [InstructorGrading] Special quiz attempts loaded:", response.data.attempts);
                console.log("📊 [InstructorGrading] Number of attempts:", response.data.attempts?.length || 0);
                return response.data.attempts || [];
            } else {
                console.error("❌ [InstructorGrading] Failed to fetch attempts:", response.data.message);
                throw new Error(response.data.message || "Failed to fetch attempts");
            }
        } catch (error) {
            console.error("❌ [InstructorGrading] Error fetching special quiz attempts:", error);
            if (axios.isAxiosError(error)) {
                console.error("❌ [InstructorGrading] Response status:", error.response?.status);
                console.error("❌ [InstructorGrading] Response data:", error.response?.data);
            }
            throw error;
        }
    };

    // ฟังก์ชันส่งคะแนนไปยัง Special Quiz API
    const submitGradeToAPI = async (attemptId: number, answers: any[]) => {
        try {
            console.log("📤 [InstructorGrading] Submitting grade for attempt:", attemptId, answers);
            const response = await axios.post(
                `${apiURL}/api/special-quiz/attempt/${attemptId}/grade`,
                { answers },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                console.log("✅ [InstructorGrading] Grade submitted successfully:", response.data);
                return response.data;
            } else {
                console.error("❌ [InstructorGrading] Failed to submit grade:", response.data.message);
                throw new Error(response.data.message || "Failed to submit grade");
            }
        } catch (error) {
            console.error("❌ [InstructorGrading] Error submitting grade:", error);
            throw error;
        }
    };

    // ฟังก์ชันหาคำถามจาก question_id
    const findQuestion = (questionId: number): Question | undefined => {
        return questions.find((q) => q.question_id === questionId);
    };

    // ฟังก์ชันหาคะแนนเต็มของคำถาม
    const getQuestionMaxScore = (question: Question): number => {
        return question.score || question.max_score || question.points || 0;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (isPopup && selectedAttemptId) {
                // โหมด Popup: ดึงข้อมูล attempt เฉพาะจาก Special Quiz API
                console.log("🔍 [InstructorGrading] Loading popup mode for attempt:", selectedAttemptId);
                setCurrentAttemptId(selectedAttemptId);
                
                // ดึงข้อมูล attempts จาก Special Quiz API
                const attempts = await fetchSpecialQuizAttempts();
                const attempt = attempts.find((a: any) => a.attempt_id === selectedAttemptId);
                
                if (!attempt || !attempt.answers) {
                    setError("ไม่พบข้อมูลการทำแบบทดสอบ หรือข้อมูลไม่ครบถ้วน");
                    setLoading(false);
                    return;
                }

                console.log("✅ [InstructorGrading] Loaded attempt data:", attempt);

                setAttemptAnswers(attempt.answers);
                setStudentInfo({
                    fullname: `${attempt.first_name} ${attempt.last_name}`,
                    email: attempt.email,
                    attemptDate: new Date(attempt.end_time).toLocaleString(),
                });

                // สร้าง questions จากข้อมูลใน attempt.answers
                const uniqueQuestions: Question[] = [];
                attempt.answers.forEach((answer: any) => {
                    const existingQuestion = uniqueQuestions.find(q => q.question_id === answer.question_id);
                    if (!existingQuestion) {
                        uniqueQuestions.push({
                            question_id: answer.question_id,
                            title: answer.question_title || `คำถามที่ ${answer.question_id}`,
                            type: answer.question_type || "FB",
                            score: answer.question_max_score || 10,
                        });
                    }
                });

                setQuestions(uniqueQuestions);
                setQuizTitle(attempt.quiz_title || `แบบทดสอบ #${attempt.quiz_id}`);

                const initialScores: { [key: number]: number } = {};
                const initialIsCorrect: { [key: number]: boolean } = {};
                const initialFeedback: { [key: number]: string } = {};

                attempt.answers.forEach((answer: any) => {
                    initialScores[answer.question_id] = answer.score_earned || 0;
                    initialIsCorrect[answer.question_id] = answer.is_correct || false;
                    initialFeedback[answer.question_id] = "";
                });

                setScores(initialScores);
                setIsCorrect(initialIsCorrect);
                setFeedback(initialFeedback);

                let total = 0;
                let maxTotal = 0;
                uniqueQuestions.forEach((q: Question) => {
                    const questionScore = getQuestionMaxScore(q);
                    maxTotal += questionScore;
                    if (initialScores[q.question_id] !== undefined) {
                        total += initialScores[q.question_id];
                    }
                });

                setTotalScore(total);
                setTotalMaxScore(maxTotal);
                setCurrentView('grading');
            } else {
                // โหมด Non-Popup: ดึงรายวิชาทั้งหมดที่อาจารย์สอนจาก Special Quiz API
                setInstructorFaculty("คณะวิทยาการคอมพิวเตอร์");

                try {
                    const attempts = await fetchSpecialQuizAttempts();
                    console.log("✅ [InstructorGrading] All attempts loaded:", attempts);

                    if (!attempts || attempts.length === 0) {
                        console.log("ℹ️ [InstructorGrading] No attempts found");
                        setSubjectSummaries([]);
                        setError("ไม่มีงานรอตรวจในขณะนี้ กรุณาตรวจสอบ:\n• นักเรียนได้ส่งแบบทดสอบแบบอัตนัยแล้วหรือยัง\n• รายวิชาที่ได้รับมอบหมายให้สอน\n• การเชื่อมโยงระหว่าง quiz กับ subject");
                        return;
                    }

                    // จัดกลุ่ม attempts ตาม subject
                    const subjectGroups: {[subjectId: number]: any} = {};
                    
                    attempts.forEach((attempt: any) => {
                        const subjectId = attempt.subject_id || 999;
                        const subjectTitle = attempt.subject_title || `รายวิชา #${subjectId}`;
                        const subjectCode = attempt.subject_code || `CODE${subjectId}`;
                        
                        if (!subjectGroups[subjectId]) {
                            subjectGroups[subjectId] = {
                                subject_id: subjectId,
                                subject_title: subjectTitle,
                                subject_code: subjectCode,
                                pending_count: 0,
                                attempts: [],
                                department_name: "วิทยาการคอมพิวเตอร์",
                                faculty: "คณะวิทยาการคอมพิวเตอร์",
                                is_home_faculty: true
                            };
                        }
                        subjectGroups[subjectId].attempts.push(attempt);
                        subjectGroups[subjectId].pending_count++;
                    });

                    const subjects = Object.values(subjectGroups);
                    console.log("📊 [InstructorGrading] Subject summaries:", subjects);
                    console.log("📊 [InstructorGrading] Total subjects with pending work:", subjects.length);
                    
                    // เรียงลำดับตามจำนวนงานรอตรวจ
                    subjects.sort((a: any, b: any) => b.pending_count - a.pending_count);
                    
                    setSubjectSummaries(subjects);
                    
                    // แสดง summary ใน console
                    subjects.forEach((subject: any) => {
                        console.log(`📋 [InstructorGrading] ${subject.subject_code}: ${subject.pending_count} งานรอตรวจ`);
                    });
                    
                } catch (error) {
                    console.error("❌ [InstructorGrading] Error loading subjects:", error);
                    setError("ไม่สามารถโหลดข้อมูลรายวิชาได้: " + (error instanceof Error ? error.message : 'Unknown error'));
                    setSubjectSummaries([]);
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

        const maxScore = getQuestionMaxScore(question);
        const inputScore = isNaN(score) ? 0 : score;
        const validScore = Math.min(Math.max(0, inputScore), maxScore);

        setScores((prev) => {
            const newScores = {
                ...prev,
                [questionId]: validScore,
            };
            
            // คำนวณคะแนนรวมใหม่
            let newTotalScore = 0;
            Object.keys(newScores).forEach(qId => {
                newTotalScore += newScores[parseInt(qId)] || 0;
            });
            setTotalScore(newTotalScore);
            
            return newScores;
        });

        setIsCorrect((prev) => ({
            ...prev,
            [questionId]: validScore === maxScore,
        }));
    };

    // ฟังก์ชันจัดการการเปลี่ยนแปลงความคิดเห็น
    const handleFeedbackChange = (questionId: number, text: string) => {
        setFeedback((prev) => ({
            ...prev,
            [questionId]: text,
        }));
    };

    // ฟังก์ชันบันทึกการให้คะแนน - ใช้ Special Quiz API จริง
    const handleSaveGrading = async () => {
        const attemptIdToUse = selectedAttemptId || currentAttemptId;
        if (!attemptIdToUse) {
            toast.error("ไม่พบ attempt ที่ต้องการให้คะแนน");
            return;
        }
        try {
            setIsSaving(true);

            // เตรียมข้อมูลคะแนนสำหรับส่ง API
            const answersToGrade = attemptAnswers.map(answer => ({
                question_id: answer.question_id,
                score_earned: scores[answer.question_id] || 0,
                is_correct: isCorrect[answer.question_id] || false,
            }));

            console.log("📤 [InstructorGrading] Submitting grades:", {
                attemptId: attemptIdToUse,
                answers: answersToGrade
            });

            // เรียก API ส่งคะแนน
            const result = await submitGradeToAPI(attemptIdToUse, answersToGrade);

            toast.success("✅ บันทึกการให้คะแนนเรียบร้อยแล้ว");
            console.log("✅ [InstructorGrading] Grade submission successful:", result);

            if (onGraded && attemptIdToUse !== null && attemptIdToUse !== undefined) {
                const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
                const passed = result.passed || (totalScore >= Math.ceil(totalMaxScore * 0.65));
                onGraded(attemptIdToUse, passed);
            }

            if (onClose) {
                onClose();
            } else {
                // กลับไปหน้ารายการรายวิชา
                setCurrentView('subjects');
                loadData();
            }
        } catch (error) {
            console.error("❌ [InstructorGrading] Error saving grading:", error);
            const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
            toast.error(`เกิดข้อผิดพลาดในการบันทึกการให้คะแนน: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    // ฟังก์ชันเลือกรายวิชา
    const handleSelectSubject = async (subjectId: number) => {
        setSelectedSubjectId(subjectId);
        setCurrentView('attempts');
        
        // โหลดข้อมูลคำถามสำหรับตรวจด่วน
        const selectedSubject = subjectSummaries.find(s => s.subject_id === subjectId);
        if (selectedSubject) {
            await loadQuickGradingData(selectedSubject.attempts);
        }
    };

    // ฟังก์ชันโหลดข้อมูลสำหรับตรวจด่วน
    const loadQuickGradingData = async (attempts: Attempt[]) => {
        const gradingData: {[attemptId: number]: any} = {};

        for (const attempt of attempts) {
            try {
                // Create questions from attempt data (no longer using mock)
                const quizQuestions: Question[] = [];
                
                const initialScores: {[questionId: number]: number} = {};
                const initialFeedback: {[questionId: number]: string} = {};

                // เตรียมค่าเริ่มต้น
                quizQuestions.forEach((q: Question) => {
                    initialScores[q.question_id] = 0;
                    initialFeedback[q.question_id] = "";
                });

                gradingData[attempt.attempt_id] = {
                    scores: initialScores,
                    feedback: initialFeedback,
                    questions: quizQuestions
                };
            } catch (error) {
                console.error(`Error loading quiz for attempt ${attempt.attempt_id}:`, error);
            }
        }

        setQuickGradingData(gradingData);
    };

    // ฟังก์ชันเปลี่ยนคะแนนในโหมดด่วน
    const handleQuickScoreChange = (attemptId: number, questionId: number, score: number) => {
        const attemptData = quickGradingData[attemptId];
        if (!attemptData) return;

        const question = attemptData.questions.find((q: Question) => q.question_id === questionId);
        if (!question) return;

        const maxScore = getQuestionMaxScore(question);
        const validScore = Math.min(Math.max(0, score || 0), maxScore);

        setQuickGradingData(prev => ({
            ...prev,
            [attemptId]: {
                ...prev[attemptId],
                scores: {
                    ...prev[attemptId].scores,
                    [questionId]: validScore
                }
            }
        }));
    };

    // ฟังก์ชันบันทึกการตรวจด่วน - ใช้ Special Quiz API จริง
    const handleQuickSave = async (attemptId: number) => {
        const attemptData = quickGradingData[attemptId];
        if (!attemptData) return;

        try {
            setQuickGradingSaving(prev => ({ ...prev, [attemptId]: true }));

            // เตรียมข้อมูลคะแนนสำหรับส่ง API
            const answersToGrade = attemptData.questions.map(question => ({
                question_id: question.question_id,
                score_earned: attemptData.scores[question.question_id] || 0,
                is_correct: (attemptData.scores[question.question_id] || 0) > 0,
            }));

            console.log("📤 [InstructorGrading] Quick save for attempt:", attemptId, answersToGrade);

            // เรียก API ส่งคะแนน
            const result = await submitGradeToAPI(attemptId, answersToGrade);

            toast.success("✅ บันทึกการให้คะแนนเรียบร้อยแล้ว");
            console.log("✅ [InstructorGrading] Quick save successful:", result);
            
            // รีเฟรชข้อมูล
            loadData();
        } catch (error) {
            console.error("❌ [InstructorGrading] Error saving quick grading:", error);
            const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
            toast.error(`เกิดข้อผิดพลาดในการบันทึกการให้คะแนน: ${errorMessage}`);
        } finally {
            setQuickGradingSaving(prev => ({ ...prev, [attemptId]: false }));
        }
    };

    // ฟังก์ชันเลือกงานที่จะตรวจ
    const handleSelectAttempt = async (attemptId: number) => {
        try {
            setLoading(true);

            // Find attempt from API data (no longer using mock)
            const attempts = await fetchSpecialQuizAttempts();
            const attempt = attempts.find((a: any) => a.attempt_id === attemptId);
            
            if (!attempt) {
                toast.error("ไม่พบข้อมูลการทำแบบทดสอบ");
                return;
            }

            // Set current attempt ID for saving later
            setCurrentAttemptId(attemptId);
            setAttemptAnswers(attempt.answers);
            setStudentInfo({
                fullname: `${attempt.first_name} ${attempt.last_name}`,
                email: attempt.email,
                attemptDate: new Date(attempt.end_time).toLocaleString(),
            });

            // Create questions from attempt data
            const quizQuestions: Question[] = [];
            setQuestions(quizQuestions);
            setQuizTitle(attempt.quiz_title);

            const initialScores: { [key: number]: number } = {};
            const initialIsCorrect: { [key: number]: boolean } = {};
            const initialFeedback: { [key: number]: string } = {};

                attempt.answers.forEach((answer: any) => {
                initialScores[answer.question_id] = answer.score_earned || 0;
                initialIsCorrect[answer.question_id] = answer.is_correct || false;
                initialFeedback[answer.question_id] = "";
            });

            setScores(initialScores);
            setIsCorrect(initialIsCorrect);
            setFeedback(initialFeedback);

            let total = 0;
            let maxTotal = 0;
            quizQuestions.forEach((q: Question) => {
                const questionScore = getQuestionMaxScore(q);
                maxTotal += questionScore;
                if (initialScores[q.question_id] !== undefined) {
                    total += initialScores[q.question_id];
                }
            });

            setTotalScore(total);
            setTotalMaxScore(maxTotal);
            setCurrentView('grading');
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
                                เกณฑ์ผ่าน: {totalMaxScore > 0 ? Math.ceil(totalMaxScore * 0.65) : 0} คะแนน (
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
                                            คะแนนเต็ม: {getQuestionMaxScore(question)} คะแนน
                                        </span>
                                    </div>
                    <div className="card-body">
                        <div className="question-text mb-3">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6>คำถาม:</h6>
                                    <p className="mb-0">{question.title}</p>
                                </div>
                                <div className="text-end">
                                    <div className="badge bg-secondary">
                                        คำถามที่ {index + 1} จาก {questions.length}
                                    </div>
                                </div>
                            </div>
                        </div>

                                        <div className="answer-text mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="mb-0">คำตอบของผู้เรียน:</h6>
                                                {answer.upload_time && (
                                                    <small className="text-muted">
                                                        <i className="fas fa-clock me-1"></i>
                                                        ส่งเมื่อ: {new Date(answer.upload_time).toLocaleString('th-TH')}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="answer-display-box p-3 border rounded position-relative" 
                                                 style={{
                                                     backgroundColor: '#f8f9fa',
                                                     border: '2px solid #e9ecef',
                                                     minHeight: '80px'
                                                 }}>
                                                {answer.text_answer ? (
                                                    <div>
                                                        <div className="answer-content" style={{
                                                            fontSize: '0.95rem',
                                                            lineHeight: '1.6',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word'
                                                        }}>
                                                            {answer.text_answer}
                                                        </div>
                                                        <div className="answer-info mt-2 pt-2 border-top">
                                                            <small className="text-muted">
                                                                <i className="fas fa-info-circle me-1"></i>
                                                                ความยาว: {answer.text_answer.length} ตัวอักษร
                                                            </small>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-3">
                                                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                                        <span className="text-muted">ไม่มีคำตอบข้อความ</span>
                                                    </div>
                                                )}
                                                
                                                {/* ป้าย "ล่าสุด" สำหรับคำตอบที่ส่งล่าสุด */}
                                                {answer.upload_time && (
                                                    <div className="latest-badge position-absolute top-0 end-0" 
                                                         style={{transform: 'translate(10px, -10px)'}}>
                                                        <span className="badge bg-success">
                                                            <i className="fas fa-star me-1"></i>
                                                            ล่าสุด
                                                        </span>
                                                    </div>
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
                                                            max={getQuestionMaxScore(question)}
                                                            value={scores[answer.question_id] || 0}
                                                            onChange={(e) => {
                                                                const inputValue = e.target.value;
                                                                const score = inputValue === '' ? 0 : parseInt(inputValue, 10);
                                                                handleScoreChange(
                                                                    answer.question_id,
                                                                    score
                                                                );
                                                            }}
                                                        />
                                                        <span className="input-group-text">
                                                            / {getQuestionMaxScore(question)}
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
                                                                        getQuestionMaxScore(question)
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
            <div>
                <div>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
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
                        
                        <div className="btn-group" role="group">
                            <button
                                type="button"
                                className={`btn ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setViewMode('card')}
                            >
                                <i className="fas fa-th-large me-2"></i>
                                แบบตาราง
                            </button>
                            <button
                                type="button"
                                className={`btn ${viewMode === 'table' ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => setViewMode('table')}
                            >
                                <i className="fas fa-table me-2"></i>
                                ตรวจด่วน
                            </button>
                        </div>
                    </div>

                    {selectedSubject && selectedSubject.attempts.length === 0 ? (
                        <div className="alert alert-info">
                            <i className="fas fa-info-circle me-2"></i>
                            ไม่พบงานที่รอตรวจในรายวิชานี้
                        </div>
                    ) : viewMode === 'card' ? (
                        <div className="table-responsive">
                            <table className="table table-hover table-striped">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col" className="text-center" style={{width: '8%'}}>รหัสนักศึกษา</th>
                                        <th scope="col" style={{width: '15%'}}>ชื่อผู้เรียน</th>
                                        <th scope="col" style={{width: '12%'}}>บทเรียน</th>
                                        <th scope="col" style={{width: '15%'}}>วันที่ส่ง</th>
                                        <th scope="col" style={{width: '10%'}}>สถานะ</th>
                                        <th scope="col" style={{width: '10%'}}>คะแนน</th>
                                        <th scope="col" style={{width: '15%'}}>หมายเหตุ</th>
                                        <th scope="col" style={{width: '15%'}}>ปุ่มตรวจ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSubject?.attempts.map((attempt, index) => {
                                        // ตรวจสอบสถานะการตรวจ
                                        const isReviewed = attempt.score !== undefined && attempt.score !== null && attempt.score >= 0;
                                        const statusText = isReviewed ? 'ตรวจแล้ว' : 'รอตรวจ';
                                        const statusBadge = isReviewed ? 'bg-success' : 'bg-warning';
                                        const scoreText = isReviewed ? attempt.score.toString() : '-';
                                        const remarksText = isReviewed ? (attempt.score >= 80 ? 'ดีมาก' : attempt.score >= 70 ? 'ดี' : 'พอใช้') : '-';
                                        const buttonText = isReviewed ? 'แก้ไข' : 'ตรวจ';
                                        const buttonClass = isReviewed ? 'btn-outline-primary' : 'btn-primary';
                                        const buttonIcon = isReviewed ? 'fa-edit' : 'fa-eye';

                                        return (
                                            <tr key={attempt.attempt_id} className={isReviewed ? 'table-success' : ''}>
                                                <td className="text-center fw-bold">
                                                    {attempt.user_id || `653170010${String(index + 1).padStart(3, '0')}`}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar-circle me-2">
                                                            <i className="fas fa-user text-primary"></i>
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold">{attempt.first_name} {attempt.last_name}</div>
                                                            <small className="text-muted">{attempt.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-info text-dark">
                                                        -
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    {new Date(attempt.end_time).toLocaleDateString('th-TH', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge ${statusBadge} text-white`}>
                                                        {statusText}
                                                    </span>
                                                </td>
                                                <td className="text-center fw-bold">
                                                    {scoreText}
                                                </td>
                                                <td className="text-center">
                                                    <span className="text-muted">
                                                        {remarksText}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className={`btn btn-sm ${buttonClass}`}
                                                        onClick={() => {
                                                            if (onOpenGrading) {
                                                                onOpenGrading(attempt.attempt_id);
                                                            } else {
                                                                handleSelectAttempt(attempt.attempt_id);
                                                            }
                                                        }}
                                                        title={isReviewed ? 'คลิกเพื่อแก้ไขคะแนน' : 'คลิกเพื่อตรวจงาน'}
                                                    >
                                                        <i className={`fas ${buttonIcon} me-1`}></i>
                                                        {buttonText}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <div className="row">
                                {selectedSubject?.attempts.map((attempt, index) => {
                                    const attemptData = quickGradingData[attempt.attempt_id];
                                    if (!attemptData) return null;

                                    const totalScore = Object.values(attemptData.scores).reduce((sum: number, score: number) => sum + score, 0);
                                    const maxTotalScore = attemptData.questions.reduce((sum: number, q: Question) => sum + getQuestionMaxScore(q), 0);

                                    return (
                                        <div key={attempt.attempt_id} className="col-12 mb-4">
                                            <div className="card border-danger">
                                                <div className="card-header bg-danger text-white">
                                                    <div className="row align-items-center">
                                                        <div className="col-md-6">
                                                            <h6 className="mb-0">
                                                                #{index + 1} - {attempt.first_name} {attempt.last_name}
                                                            </h6>
                                                            <small>{attempt.email}</small>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <small>แบบทดสอบ: {attempt.quiz_title}</small><br />
                                                            <small>{new Date(attempt.end_time).toLocaleString('th-TH', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}</small>
                                                        </div>
                                                        <div className="col-md-3 text-end">
                                                            <div className="h5 mb-0">
                                                                คะแนน: {totalScore}/{maxTotalScore}
                                                            </div>
                                                            <small>({maxTotalScore > 0 ? Math.round((totalScore/maxTotalScore)*100) : 0}%)</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        {attemptData.questions.map((question: Question, qIndex: number) => {
                                                            const answer = attempt.answers?.find(a => a.question_id === question.question_id);
                                                            const currentScore = attemptData.scores[question.question_id] || 0;
                                                            const maxScore = getQuestionMaxScore(question);

                                                            return (
                                                                <div key={question.question_id} className="col-md-6 col-lg-4 mb-3">
                                                                    <div className="border rounded p-3 h-100">
                                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                                            <strong>คำถามที่ {qIndex + 1}</strong>
                                                                            <span className="badge bg-primary">{maxScore} คะแนน</span>
                                                                        </div>
                                                                        
                                                                        <div className="mb-2">
                                                                            <small className="text-muted">คำถาม:</small>
                                                                            <div className="small fw-bold" style={{fontSize: '0.85rem'}}>
                                                                                {question.title}
                                                                            </div>
                                                                        </div>

                                                                        <div className="mb-2">
                                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                                <small className="text-muted fw-bold">คำตอบ:</small>
                                                                                {answer?.upload_time && (
                                                                                    <small className="text-muted">
                                                                                        <i className="fas fa-clock me-1"></i>
                                                                                        {new Date(answer.upload_time).toLocaleString('th-TH', { 
                                                                                            month: 'short', 
                                                                                            day: 'numeric', 
                                                                                            hour: '2-digit', 
                                                                                            minute: '2-digit' 
                                                                                        })}
                                                                                    </small>
                                                                                )}
                                                                            </div>
                                                                            <div className="answer-preview-box position-relative p-2 border rounded" 
                                                                                 style={{
                                                                                     fontSize: '0.8rem', 
                                                                                     maxHeight: '80px', 
                                                                                     overflow: 'hidden',
                                                                                     backgroundColor: answer?.text_answer ? '#f8f9fa' : '#fff3cd',
                                                                                     border: answer?.text_answer ? '1px solid #dee2e6' : '1px solid #ffeaa7'
                                                                                 }}>
                                                                                {answer?.text_answer ? (
                                                                                    <div>
                                                                                        <div style={{
                                                                                            whiteSpace: 'pre-wrap',
                                                                                            wordBreak: 'break-word',
                                                                                            lineHeight: '1.4'
                                                                                        }}>
                                                                                            {answer.text_answer.length > 150 ? 
                                                                                                answer.text_answer.substring(0, 150) + '...' : 
                                                                                                answer.text_answer
                                                                                            }
                                                                                        </div>
                                                                                        {answer.text_answer.length > 150 && (
                                                                                            <div className="text-end mt-1">
                                                                                                <small className="text-primary">
                                                                                                    <i className="fas fa-expand-alt me-1"></i>
                                                                                                    คลิกเพื่อดูเต็ม
                                                                                                </small>
                                                                                            </div>
                                                                                        )}
                                                                                        <div className="answer-stats position-absolute bottom-0 end-0 p-1">
                                                                                            <span className="badge bg-info" style={{fontSize: '0.6rem'}}>
                                                                                                {answer.text_answer.length} ตัวอักษร
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-center py-1 text-warning">
                                                                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                                                                        ไม่มีคำตอบ
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <div className="input-group input-group-sm">
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control form-control-sm"
                                                                                    min="0"
                                                                                    max={maxScore}
                                                                                    value={currentScore}
                                                                                    onChange={(e) => handleQuickScoreChange(
                                                                                        attempt.attempt_id,
                                                                                        question.question_id,
                                                                                        parseInt(e.target.value) || 0
                                                                                    )}
                                                                                    style={{width: '60px'}}
                                                                                />
                                                                                <span className="input-group-text">/{maxScore}</span>
                                                                            </div>
                                                                            <button
                                                                                className="btn btn-outline-success btn-sm"
                                                                                onClick={() => handleQuickScoreChange(
                                                                                    attempt.attempt_id,
                                                                                    question.question_id,
                                                                                    maxScore
                                                                                )}
                                                                                title="ให้คะแนนเต็ม"
                                                                            >
                                                                                ✓
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="card-footer">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <strong>คะแนนรวม: {totalScore}/{maxTotalScore}</strong>
                                                            <span className="ms-2 text-muted">
                                                                ({maxTotalScore > 0 ? Math.round((totalScore/maxTotalScore)*100) : 0}% - 
                                                                {totalScore >= Math.ceil(maxTotalScore * 0.65) ? 
                                                                    <span className="text-success"> ผ่าน</span> : 
                                                                    <span className="text-danger"> ไม่ผ่าน</span>
                                                                })
                                                            </span>
                                                        </div>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => handleQuickSave(attempt.attempt_id)}
                                                            disabled={quickGradingSaving[attempt.attempt_id]}
                                                        >
                                                            {quickGradingSaving[attempt.attempt_id] ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                    กำลังบันทึก...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-save me-2"></i>
                                                                    บันทึกคะแนน
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // แสดงรายการรายวิชาที่มีงานรอตรวจ (หน้าหลัก)
    return (
        <div>
            <div>
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
                    <div className="table-responsive">
                        <table className="table table-hover table-striped">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col" className="text-center" style={{width: '5%'}}>#</th>
                                    <th scope="col" style={{width: '20%'}}>วิชา</th>
                                    <th scope="col" style={{width: '15%'}}>หลักสูตร</th>
                                    <th scope="col" style={{width: '15%'}}>สาขา/คณะ</th>
                                    <th scope="col" style={{width: '10%'}}>จำนวนผู้เรียน</th>
                                    <th scope="col" style={{width: '12%'}}>งานรอตรวจ</th>
                                    <th scope="col" style={{width: '12%'}}>งานตรวจแล้ว</th>
                                    <th scope="col" style={{width: '11%'}}>ปุ่มตรวจงาน</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjectSummaries.map((subject, index) => {
                                    // หางานที่ตรวจแล้ว (มีคะแนนแล้ว) จาก attempts
                                    const reviewedAttempts = subject.attempts.filter(attempt => 
                                        attempt.score !== undefined && attempt.score !== null && attempt.score >= 0
                                    );
                                    const reviewedCount = reviewedAttempts.length;
                                    
                                    return (
                                        <tr key={subject.subject_id} className={subject.is_home_faculty ? 'table-primary' : ''}>
                                            <td className="text-center fw-bold">{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="subject-icon me-2">
                                                        <i className="fas fa-book text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{subject.subject_title}</div>
                                                        <small className="text-muted">รหัส: {subject.subject_code}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-info text-dark">
                                                    {subject.subject_code.includes('CS') ? 'วิทยาการคอมพิวเตอร์' : 
                                                     subject.subject_code.includes('IT') ? 'เทคโนโลยีสารสนเทศ' : 'หลักสูตรทั่วไป'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <i className={`fas ${subject.is_home_faculty ? 'fa-home text-primary' : 'fa-building text-secondary'} me-2`}></i>
                                                    <span className={subject.is_home_faculty ? 'fw-bold text-primary' : ''}>
                                                        {subject.faculty || 'ไม่ระบุ'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="badge bg-secondary">
                                                    {subject.attempts.length} คน
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {subject.pending_count > 0 ? (
                                                    <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                                                        {subject.pending_count} งาน
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-success text-white">
                                                        ไม่มีงาน
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <span className="badge bg-success text-white">
                                                    {reviewedCount} งาน
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className={`btn btn-sm ${subject.pending_count > 0 ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => handleSelectSubject(subject.subject_id)}
                                                    disabled={subject.pending_count === 0}
                                                    title={subject.pending_count > 0 ? 'คลิกเพื่อตรวจงาน' : 'ไม่มีงานรอตรวจ'}
                                                >
                                                    <i className={`fas ${subject.pending_count > 0 ? 'fa-eye' : 'fa-check'} me-1`}></i>
                                                    {subject.pending_count > 0 ? 'ตรวจงาน' : 'ไม่มีงาน'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorGrading;

