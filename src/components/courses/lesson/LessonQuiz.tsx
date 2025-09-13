import { useState, useEffect, useRef } from "react";
import "./LessonQuiz.css";
import axios from "axios";

// เพิ่มการใช้ API URL จาก .env
const API_URL = import.meta.env.VITE_API_URL;

interface LessonQuizProps {
    onComplete: () => void;
    isCompleted?: boolean;
    quizId: number;
    quizData?: any[];
    onNextLesson?: () => void;
    lessonId: number;
    onRefreshProgress?: () => void;
    // ✅ เพิ่ม prop ใหม่สำหรับการไปบทเรียนถัดไป (lesson ถัดไป)
    // ใช้สำหรับแบบทดสอบของแต่ละบท เพื่อไปบทเรียนถัดไป (section ถัดไป)
    onGoToNextLesson?: () => void;
    // ✅ เพิ่ม prop ใหม่สำหรับการไปเนื้อหาล่าสุดที่ดูได้
    onGoToLatestContent?: () => void;
    // ✅ เพิ่ม prop สำหรับเกณฑ์ผ่านแบบทดสอบ
    passingPercentage?: number;
}

// Define different question types
type QuestionType = "SC" | "MC" | "TF" | "FB";

interface QuestionAttachment {
    attachment_id: number;
    file_name: string;
    file_url: string;
    file_size?: number;
}

interface Question {
    question_id: number;
    title: string;
    type: QuestionType;
    score: number;
    attachments?: QuestionAttachment[];
    choices: {
        choice_id: number;
        text: string;
        is_correct: boolean;
    }[];
}

interface Attachment {
    attachment_id: number;
    file_name: string;
    file_url: string;
}

interface Answer {
    question_id: number;
    choice_id?: number;
    choice_ids?: number[]; // ✅ เพิ่มสำหรับ Multiple Choice
    text_answer?: string;
    attachment_ids?: number[];
    is_correct?: boolean;
    score_earned?: number;
    attachments?: Attachment[];
}

interface Attempt {
    attempt_id: number;
    start_time: string;
    end_time: string;
    score: number;
    max_score: number;
    passed: boolean;
    status: string;
    answers: Answer[];
}

interface PassedQuizResult {
    quizId: number;
    quizTitle: string;
    score: number;
    maxScore: number;
    passed: boolean;
    completedAt: string;
}

// เพิ่มฟังก์ชันแปลงข้อมูล question จาก backend ให้ตรงกับ frontend
function mapBackendQuestions(backendQuestions: any[]): Question[] {
    return backendQuestions.map(q => ({
        question_id: q.question_id,
        title: q.question_text || q.title || "",
        type: q.question_type || q.type,
        score: q.points || q.score || 1,
        attachments: q.attachments || [],
        choices: (q.options || q.choices || []).map((c: any) => ({
            choice_id: c.option_id ?? c.choice_id,
            text: c.option_text ?? c.text,
            is_correct: c.is_correct,
        })),
    }));
}

// Helper function to format file sizes
const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Component to render question attachments
const QuestionAttachments = ({ attachments }: { attachments?: QuestionAttachment[] }) => {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="question-attachments mb-3">
            <h6 className="text-primary">
                <i className="fas fa-paperclip me-2"></i>
                เอกสารประกอบโจทย์ ({attachments.length} ไฟล์)
            </h6>
            <div className="list-group">
                {attachments.map((attachment) => (
                    <div key={attachment.attachment_id} className="list-group-item">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-file me-2 text-primary"></i>
                                <div>
                                    <div className="fw-bold">{attachment.file_name}</div>
                                    {attachment.file_size && (
                                        <small className="text-muted">{formatFileSize(attachment.file_size)}</small>
                                    )}
                                </div>
                            </div>
                            <div>
                                <a
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-primary btn-sm me-2"
                                    title="เปิดไฟล์"
                                >
                                    <i className="fas fa-eye me-1"></i>
                                    เปิด
                                </a>
                                <a
                                    href={attachment.file_url}
                                    download={attachment.file_name}
                                    className="btn btn-outline-secondary btn-sm"
                                    title="ดาวน์โหลดไฟล์"
                                >
                                    <i className="fas fa-download me-1"></i>
                                    ดาวน์โหลด
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LessonQuiz = ({
    onComplete,
    isCompleted = false,
    quizId,
    quizData = [],
    onNextLesson,
    lessonId,
    onRefreshProgress,
    // ✅ เพิ่ม prop ใหม่สำหรับการไปบทเรียนถัดไป (lesson ถัดไป)
    // ใช้สำหรับแบบทดสอบของแต่ละบท เพื่อไปบทเรียนถัดไป (section ถัดไป)
    onGoToNextLesson,
    // ✅ เพิ่ม prop ใหม่สำหรับการไปเนื้อหาล่าสุดที่ดูได้
    onGoToLatestContent,
    // ✅ เพิ่ม prop สำหรับเกณฑ์ผ่านแบบทดสอบ
    passingPercentage = 65,
}: LessonQuizProps) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [maxScore, setMaxScore] = useState(0);
    const [isPassed, setIsPassed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isSpecialQuiz, setIsSpecialQuiz] = useState(false);
    const [isAwaitingReview, setIsAwaitingReview] = useState(false);
    const [previousAttempts, setPreviousAttempts] = useState<Attempt[]>([]);
    const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>([]);
    const [hasCompleted, setHasCompleted] = useState(false);
    const [showDetailedResultsState, setShowDetailedResultsState] = useState(false);

    // For single choice questions (SC, TF)
    const [selectedSingleAnswers, setSelectedSingleAnswers] = useState<number[]>([]);

    // For multiple choice questions (MC)
    const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<number[][]>([]);

    // For text questions and Fill in the Blank
    const [textAnswers, setTextAnswers] = useState<string[]>([]);

    // For file uploads (เชื่อมโยงไฟล์กับคำถาม)
    const [files, setFiles] = useState<{ questionIndex: number; question_id: number; file: File }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ เพิ่ม state สำหรับ Special Quiz
    const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);
    const [submittedAnswers, setSubmittedAnswers] = useState<Set<number>>(new Set());

    // ✅ ใช้เกณฑ์การผ่านจาก prop (default 65%)
    const PASSING_PERCENTAGE = passingPercentage;

    // ✅ เพิ่มฟังก์ชัน reset state ทั้งหมด
    const resetAllStates = (preserveAwaitingReview = false) => {
        console.log("🔄 [DEBUG] resetAllStates called - preserveAwaitingReview:", preserveAwaitingReview);
        setCurrentQuestion(0);
        setShowResult(false);
        setScore(0);
        setMaxScore(0);
        setIsPassed(false);
        setLoading(true);
        setQuestions([]);
        setIsSpecialQuiz(false);
        // ✅ เก็บสถานะ awaiting review ไว้ถ้า preserveAwaitingReview = true
        if (!preserveAwaitingReview) {
        setIsAwaitingReview(false);
        }
        setPreviousAttempts([]);
        setUploadedAttachments([]);
        setHasCompleted(false);
        setSelectedSingleAnswers([]);
        setSelectedMultipleAnswers([]);
        setTextAnswers([]);
        setFiles([]);
    };

    // ฟังก์ชันตรวจสอบว่าเป็น Special Quiz หรือไม่ (มี FB)
    const checkIfSpecialQuiz = (questions: Question[]) => {
        const hasFillInBlank = questions.some(q => q.type === "FB");
        setIsSpecialQuiz(hasFillInBlank);
        console.log("🎯 Quiz Type Detection:", {
            total_questions: questions.length,
            fb_questions: questions.filter(q => q.type === "FB").length,
            has_fill_in_blank: hasFillInBlank,
            is_special_quiz: hasFillInBlank
        });
        return hasFillInBlank;
    };

    // ✅ เพิ่มฟังก์ชันสำหรับ Special Quiz
    const startSpecialQuizAttempt = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }

            const response = await axios.post(
                `${API_URL}/api/special-quiz/${quizId}/attempt`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setCurrentAttemptId(response.data.attempt.attempt_id);
                console.log("🎯 Special quiz attempt started:", response.data.attempt.attempt_id);
            }
        } catch (error: any) {
            console.error("Error starting special quiz attempt:", error);
        }
    };

    const submitSingleAnswer = async (questionId: number, textAnswer: string, file?: File) => {
        if (!currentAttemptId) {
            console.error("No active attempt");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }

            const formData = new FormData();
            formData.append('question_id', questionId.toString());
            formData.append('text_answer', textAnswer);
            if (file) {
                formData.append('file', file);
            }

            const response = await axios.post(
                `${API_URL}/api/special-quiz/attempt/${currentAttemptId}/answer`,
                formData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setSubmittedAnswers(prev => new Set([...prev, questionId]));
                console.log("✅ Answer submitted for question:", questionId);
            }
        } catch (error: any) {
            console.error("Error submitting answer:", error);
        }
    };

    const submitSpecialQuiz = async () => {
        if (!currentAttemptId) {
            console.error("❌ [SubmitSpecialQuiz] No active attempt");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("❌ [SubmitSpecialQuiz] No token found");
                return;
            }

            console.log("📤 [SubmitSpecialQuiz] Submitting attempt ID:", currentAttemptId);
            console.log("📤 [SubmitSpecialQuiz] API URL:", `${API_URL}/api/special-quiz/attempt/${currentAttemptId}/submit`);

            const response = await axios.post(
                `${API_URL}/api/special-quiz/attempt/${currentAttemptId}/submit`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            console.log("📤 [SubmitSpecialQuiz] Response:", response.data);

            if (response.data.success) {
                setIsAwaitingReview(true);
                setHasCompleted(true);
                console.log("✅ [SubmitSpecialQuiz] Special quiz submitted successfully");
                console.log("✅ [SubmitSpecialQuiz] Attempt status:", response.data.attempt?.status);
            }
        } catch (error: any) {
            console.error("❌ [SubmitSpecialQuiz] Error submitting special quiz:", error);
            if (axios.isAxiosError(error)) {
                console.error("❌ [SubmitSpecialQuiz] Response status:", error.response?.status);
                console.error("❌ [SubmitSpecialQuiz] Response data:", error.response?.data);
            }
        }
    };

    // เพิ่ม state สำหรับการส่งแบบรายข้อ (ลบออกเพราะไม่ได้ใช้)

    // ป้องกัน onComplete ถูกเรียกซ้ำ
    const safeOnComplete = () => {
        if (!hasCompleted) {
            setHasCompleted(true);
            onComplete();
        }
    };

    // ✅ เพิ่มฟังก์ชัน renderSpecialQuizUI สำหรับ Special Quiz
    const renderSpecialQuizUI = () => {
        if (!isSpecialQuiz) return null;

        const fbQuestions = questions.filter(q => q.type === "FB");
        const objectiveQuestions = questions.filter(q => q.type !== "FB");

        return (
            <div className="special-quiz-ui">
                <div className="alert alert-info mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>แบบทดสอบผสม:</strong> แบบทดสอบนี้มีทั้งคำถามปรนัยและอัตนัย
                </div>
                
                <div className="quiz-breakdown mb-3">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card border-primary">
                                <div className="card-body text-center">
                                    <i className="fas fa-check-circle text-primary fa-2x mb-2"></i>
                                    <h6>คำถามปรนัย</h6>
                                    <p className="mb-1">{objectiveQuestions.length} ข้อ</p>
                                    <small className="text-muted">ตรวจอัตโนมัติ</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-warning">
                                <div className="card-body text-center">
                                    <i className="fas fa-edit text-warning fa-2x mb-2"></i>
                                    <h6>คำถามอัตนัย</h6>
                                    <p className="mb-1">{fbQuestions.length} ข้อ</p>
                                    <small className="text-muted">รอตรวจจากอาจารย์</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="special-quiz-instructions">
                    <h6><i className="fas fa-list-ol me-2"></i>วิธีการทำ:</h6>
                    <ul>
                        <li><strong>คำถามปรนัย:</strong> เลือกคำตอบและได้ผลทันที</li>
                        <li><strong>คำถามอัตนัย:</strong> เขียนคำตอบและแนบไฟล์ (ถ้าต้องการ)</li>
                        <li>ทำให้เสร็จทุกข้อแล้วกด "ส่งคำตอบ"</li>
                        <li>ผลคะแนนสุดท้ายจะแสดงหลังอาจารย์ตรวจคำถามอัตนัยเสร็จ</li>
                    </ul>
                </div>
            </div>
        );
    };

    // เพิ่มฟังก์ชันสำหรับดึงข้อมูลสถานะแบบทดสอบ
    const fetchQuizStatus = async (cancelled = false) => {
        try {
            const response = await axios.get(
                `${API_URL}/api/learn/quiz/${quizId}/status`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (response.data.success && !cancelled) {
                if (response.data.status === "awaiting_review") {
                    setIsAwaitingReview(true);
                    setShowResult(true);
                    safeOnComplete();
                }
            }
        } catch (error) {
            console.error("Error fetching quiz status:", error);
        }
    };

    // เพิ่มฟังก์ชันสำหรับดึงข้อมูลแบบทดสอบที่ผ่านแล้ว
    const fetchPassedQuizResults = async (cancelled = false) => {
        try {
            const response = await axios.get(
                `${API_URL}/api/learn/quiz-results/passed`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (response.data.success && !cancelled) {
                const currentQuizPassed = response.data.results.some(
                    (result: PassedQuizResult) =>
                        result.quizId === quizId && result.passed
                );
                if (currentQuizPassed) {
                    const currentResult = response.data.results.find(
                        (result: PassedQuizResult) => result.quizId === quizId
                    );
                    if (currentResult) {
                        setScore(currentResult.score);
                        setMaxScore(currentResult.maxScore);
                        setIsPassed(true);
                        setShowResult(true);
                        safeOnComplete();
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching passed quiz results:", error);
        }
    };

    // เพิ่มฟังก์ชันสำหรับดึงคะแนน special quiz
    const fetchSpecialQuizScore = async (attemptId: number) => {
        try {
            const response = await axios.get(
                `${API_URL}/api/special-quiz/attempt/${attemptId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (response.data.success && response.data.attempt) {
                return response.data.attempt;
            }
        } catch (error) {
            console.error("Error fetching special quiz score:", error);
        }
        return null;
    };

    // ฟังก์ชันสำหรับตรวจสอบ Special Quiz attempts
    const fetchSpecialQuizAttempts = async (quizId: number) => {
        try {
            console.log(`🔍 [DEBUG] Fetching special quiz attempts for quizId: ${quizId}`);
            const response = await axios.get(
                `${API_URL}/api/special-quiz/attempts/all`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            console.log(`🔍 [DEBUG] Special quiz attempts response:`, response.data);
            
            if (response.data.success && response.data.attempts) {
                const allAttempts = response.data.attempts;
                console.log(`🔍 [DEBUG] Found ${allAttempts.length} total special quiz attempts`);
                
                // Filter เฉพาะ attempts ของ quiz นี้
                const quizAttempts = allAttempts.filter((attempt: any) => 
                    attempt.quiz_id === quizId
                );
                console.log(`🔍 [DEBUG] Filtered to ${quizAttempts.length} attempts for this quiz`);
                
                // หา attempt ล่าสุดที่รอตรวจ (API จะส่งเฉพาะ awaiting_review มาแล้ว)
                const awaitingAttempt = quizAttempts.find((attempt: any) => 
                    attempt.quiz_id === quizId
                );
                
                if (awaitingAttempt) {
                    console.log(`✅ [DEBUG] Found awaiting review attempt:`, awaitingAttempt);
                    setIsAwaitingReview(true);
                    setShowResult(true);
                    safeOnComplete();
                }
                
                // ต้องดึงข้อมูล completed attempts แยก (เพราะ API นี้ให้เฉพาะ awaiting_review)
                console.log(`🔍 [DEBUG] Will check individual attempt details...`);
            } else {
                console.log(`🔍 [DEBUG] No awaiting review attempts found for quiz ${quizId}`);
            }
        } catch (error) {
            console.error("Error fetching special quiz attempts:", error);
        }
    };

    // ย้าย fetchQuizData ออกมานอก useEffect
    const fetchQuizData = async (cancelled = false) => {
        if (quizId <= 0) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            await fetchPassedQuizResults(cancelled);
            await fetchQuizStatus(cancelled);
            if (quizData && quizData.length > 0) {
                const formattedQuestions = mapBackendQuestions(quizData);
                if (!cancelled) {
                    // ✅ ตรวจสอบว่า questions เปลี่ยนจริงหรือไม่ก่อนอัปเดต
                    if (JSON.stringify(formattedQuestions) !== JSON.stringify(questions)) {
                        console.log("🎯 อัปเดต questions ใน LessonQuiz");
                        setQuestions(formattedQuestions);
                        checkIfSpecialQuiz(formattedQuestions);
                    }
                    setLoading(false);
                }
                return;
            }
            const response = await axios.get(
                `${API_URL}/api/courses/quizzes/${quizId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (response.data.success && response.data.quiz && !cancelled) {
                const mappedQuestions = mapBackendQuestions(response.data.quiz.questions);
                // ✅ ตรวจสอบว่า questions เปลี่ยนจริงหรือไม่ก่อนอัปเดต
                if (JSON.stringify(mappedQuestions) !== JSON.stringify(questions)) {
                    console.log("🎯 อัปเดต questions จาก API");
                    setQuestions(mappedQuestions);
                    checkIfSpecialQuiz(mappedQuestions);
                    
                    // ✅ เช็คว่าเป็น special quiz แล้วหา attempts
                    const hasFB = mappedQuestions.some(q => q.type === "FB");
                    console.log(`🔍 [DEBUG] Has FB questions: ${hasFB}, will check special quiz attempts`);
                    if (hasFB) {
                        console.log(`🔍 [DEBUG] This is a Special Quiz, checking for previous attempts...`);
                        fetchSpecialQuizAttempts(quizId);
                    }
                }
                if (response.data.quiz.status === "awaiting_review") {
                    setIsAwaitingReview(true);
                    setShowResult(true);
                }
            }
            // ✅ ใช้ Quiz Status และ Progress API ที่มีอยู่จริง
            try {
                console.log(`🔍 [DEBUG] Fetching quiz data for quizId: ${quizId}`);
                const [statusResponse, progressResponse] = await Promise.all([
                    axios.get(`${API_URL}/api/learn/quiz/${quizId}/status`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }),
                    axios.get(`${API_URL}/api/learn/quiz/${quizId}/progress`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    })
                ]);

                console.log(`🔍 [DEBUG] Status Response:`, statusResponse.data);
                console.log(`🔍 [DEBUG] Progress Response:`, progressResponse.data);

                if (statusResponse.data.success && !cancelled) {
                    console.log(`🔍 [DEBUG] Status check: status="${statusResponse.data.status}", isAwaitingReview=${statusResponse.data.isAwaitingReview}`);
                    if (statusResponse.data.status === "awaiting_review" || statusResponse.data.isAwaitingReview) {
                        console.log(`✅ [DEBUG] Setting awaiting review from status API`);
                            setIsAwaitingReview(true);
                            setShowResult(true);
                            safeOnComplete();
                    }
                }

                if (progressResponse.data.success && progressResponse.data.progress && !cancelled) {
                    const progress = progressResponse.data.progress;
                    console.log(`🔍 [DEBUG] Progress data:`, progress);
                    if (progress.completed || progress.passed) {
                        console.log(`✅ [DEBUG] Setting quiz results: score=${progress.score}, passed=${progress.passed}`);
                        setScore(progress.score || 0);
                        setMaxScore(progress.max_score || 0);
                        setIsPassed(progress.passed || false);
                        setShowResult(true);
                    }
                    if (progress.awaiting_review) {
                        console.log(`✅ [DEBUG] Setting awaiting review from progress API`);
                        setIsAwaitingReview(true);
                        setShowResult(true);
                        safeOnComplete();
                    }
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    console.log("Quiz status/progress APIs not found - continuing without quiz status");
                } else {
                    console.error("Error fetching quiz status/progress:", error);
                }
                setPreviousAttempts([]);
            }
            // ✅ เรียก lesson progress เฉพาะเมื่อมี lessonId (ไม่ใช่ special quiz)
            if (lessonId && lessonId > 0) {
                try {
                    console.log(`🔍 [DEBUG] Fetching lesson progress for lessonId: ${lessonId}`);
            const lessonResponse = await axios.get(
                        `${API_URL}/api/learn/lesson/${lessonId}/progress`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
                    console.log(`🔍 [DEBUG] Lesson Response:`, lessonResponse.data);
            if (lessonResponse.data.success && lessonResponse.data.progress && !cancelled) {
                        console.log(`🔍 [DEBUG] Lesson progress: quiz_awaiting_review=${lessonResponse.data.progress.quiz_awaiting_review}`);
                if (lessonResponse.data.progress.quiz_awaiting_review) {
                            console.log(`✅ [DEBUG] Setting awaiting review from lesson progress API`);
                    setIsAwaitingReview(true);
                    setShowResult(true);
                    safeOnComplete();
                }
            }
                } catch (lessonError) {
                    if (axios.isAxiosError(lessonError) && lessonError.response?.status === 404) {
                        console.log("Lesson progress API not found - skipping lesson progress check");
                    } else {
                        console.error("Error fetching lesson progress:", lessonError);
                    }
                }
            }
            console.log(`🔍 [DEBUG] isSpecialQuiz: ${isSpecialQuiz}, previousAttempts.length: ${previousAttempts.length}`);
            if (isSpecialQuiz && previousAttempts.length > 0) {
                console.log(`🔍 [DEBUG] Previous attempts:`, previousAttempts);
                const latestSpecial = previousAttempts.find(a => a.status === "completed" && a.score != null);
                console.log(`🔍 [DEBUG] Latest special attempt:`, latestSpecial);
                if (latestSpecial) {
                    fetchSpecialQuizScore(latestSpecial.attempt_id).then((specialAttempt) => {
                        console.log(`🔍 [DEBUG] Special attempt data:`, specialAttempt);
                        if (specialAttempt) {
                            setScore(specialAttempt.score);
                            setMaxScore(specialAttempt.max_score);
                            setIsPassed(specialAttempt.passed);
                            setShowResult(true);
                            // ✅ ตรวจสอบสถานะ awaiting_review แทนการตั้งเป็น false เสมอ
                            if (specialAttempt.status === "awaiting_review") {
                                console.log(`✅ [DEBUG] Setting awaiting review from special quiz attempt`);
                                setIsAwaitingReview(true);
                                safeOnComplete();
                            } else {
                                console.log(`🔍 [DEBUG] Special quiz completed, status: ${specialAttempt.status}`);
                            setIsAwaitingReview(false);
                            }
                        }
                    });
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setPreviousAttempts([]);
            } else {
                console.error("Error fetching quiz data:", error);
            }
        } finally {
            if (!cancelled) setLoading(false);
        }
    };

    // ✅ แก้ไข useEffect หลัก - เพิ่มการ reset state เมื่อ quizId เปลี่ยน
    useEffect(() => {
        let cancelled = false;
        console.log("🎯 LessonQuiz useEffect: quizId =", quizId);
        console.log("🔍 [DEBUG] Initial props:", { quizId, lessonId, isCompleted, isSpecialQuiz });
        
        // ✅ Reset เฉพาะ state ที่จำเป็น แทนการใช้ resetAllStates()
        setCurrentQuestion(0);
        setShowResult(false);
        setScore(0);
        setMaxScore(0);
        setIsPassed(false);
        setLoading(true);
        setSelectedSingleAnswers([]);
        setSelectedMultipleAnswers([]);
        setTextAnswers([]);
        setFiles([]);
        setHasCompleted(false);
        console.log("🔄 [DEBUG] States reset for quiz reload");
        
        // รอสักครู่แล้วค่อยโหลดข้อมูลใหม่
        const timer = setTimeout(() => {
            if (!cancelled) {
                fetchQuizData(cancelled);
            }
        }, 100);
        
        if (isCompleted && !hasCompleted) {
            setIsPassed(true);
            setShowResult(true);
            setHasCompleted(true);
        }
        
        return () => { 
            cancelled = true; 
            clearTimeout(timer);
        };
    }, [quizId, isCompleted]); // ✅ เพิ่ม isCompleted เป็น dependency

    // ✅ เพิ่ม useEffect สำหรับ reset state เมื่อ quizData เปลี่ยน
    useEffect(() => {
        if (quizData && quizData.length > 0) {
            // Reset state เมื่อ quizData เปลี่ยน
            setCurrentQuestion(0);
            setShowResult(false);
            setScore(0);
            setMaxScore(0);
            setIsPassed(false);
            setSelectedSingleAnswers([]);
            setSelectedMultipleAnswers([]);
            setTextAnswers([]);
            setFiles([]);
            setHasCompleted(false);
            setCurrentAttemptId(null);
            setSubmittedAnswers(new Set());
            
            // โหลดคำถามใหม่
            const formattedQuestions = mapBackendQuestions(quizData);
            setQuestions(formattedQuestions);
            const isSpecial = checkIfSpecialQuiz(formattedQuestions);
            
            // ✅ เริ่ม Special Quiz attempt ถ้าเป็น Special Quiz
            if (isSpecial && !currentAttemptId) {
                startSpecialQuizAttempt();
            }
            
            setLoading(false);
        }
    }, [quizData]);

    // เพิ่ม useEffect สำหรับ auto refresh
    useEffect(() => {
        if (isSpecialQuiz && isAwaitingReview) {
            const interval = setInterval(() => {
                fetchQuizData();
            }, 10000); // 10 วินาที
            return () => clearInterval(interval);
        }
    }, [isSpecialQuiz, isAwaitingReview]);

    // Handle single choice answer selection (SC, TF)
    const handleSingleAnswerSelect = (answerIndex: number) => {
        const newSelectedAnswers = [...selectedSingleAnswers];
        newSelectedAnswers[currentQuestion] = answerIndex;
        setSelectedSingleAnswers(newSelectedAnswers);
    };

    // Handle multiple choice answer selection (MC)
    const handleMultipleAnswerSelect = (answerIndex: number) => {
        const newSelectedAnswers = [...selectedMultipleAnswers];

        if (!newSelectedAnswers[currentQuestion]) {
            newSelectedAnswers[currentQuestion] = [];
        }

        const currentSelections = newSelectedAnswers[currentQuestion];
        const selectionIndex = currentSelections.indexOf(answerIndex);

        if (selectionIndex === -1) {
            currentSelections.push(answerIndex);
        } else {
            currentSelections.splice(selectionIndex, 1);
        }

        setSelectedMultipleAnswers(newSelectedAnswers);
    };

    // Handle text answer input
    const handleTextAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newTextAnswers = [...textAnswers];
        newTextAnswers[currentQuestion] = e.target.value;
        setTextAnswers(newTextAnswers);
    };

    // Handle file upload (เชื่อมโยงไฟล์กับคำถาม)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map((file) => ({
                questionIndex: currentQuestion,
                question_id: questions[currentQuestion].question_id,
                file,
            }));
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    };

    // Remove uploaded file
    const handleRemoveFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    // ส่งคำตอบไปยัง API (เฉพาะคำถามปรนัย)
    const submitQuizAnswers = async () => {
        try {
            const formData = new FormData();

            // จัดรูปแบบคำตอบตามที่ API คาดหวัง (เฉพาะคำถามปรนัย SC, MC, TF)
            const answers = questions
                .map((question, index) => {
                    // ตรวจสอบว่า question_id มีค่า
                    if (!question.question_id) {
                        console.error("พบคำถามที่ไม่มี question_id:", question);
                                                return null; // ข้ามคำถามนี้
                    }

                    // ⚠️ ข้าม FB questions เพราะจะส่งผ่าน SpecialQuiz API แล้ว
                    if (question.type === "FB") {
                        console.log(`⏭️ Skipping FB question ${question.question_id} - handled by SpecialQuiz API`);
                        return null;
                    }

                    const answer: any = {
                        question_id: question.question_id,
                    };

                    switch (question.type) {
                        case "SC":
                        case "TF":
                            if (selectedSingleAnswers[index] !== undefined) {
                                answer.choice_id = question.choices[selectedSingleAnswers[index]]?.choice_id;
                            }
                            break;

                        case "MC":
                            if (selectedMultipleAnswers[index]?.length > 0) {
                                answer.choice_ids = selectedMultipleAnswers[index].map(
                                    (idx) => question.choices[idx]?.choice_id
                                );
                            }
                            break;

                        default:
                            return null;
                    }

                    return answer;
                })
                .filter((a) => a !== null);

            console.log("📤 Submitting objective answers:", answers);

            // แปลงคำตอบเป็นรูปแบบที่ API ต้องการ
            answers.forEach((answer, index) => {
                formData.append(`answers[${index}][question_id]`, answer.question_id.toString());

                if (answer.choice_id) {
                    formData.append(`answers[${index}][choice_id]`, answer.choice_id.toString());
                }

                if (answer.choice_ids) {
                    answer.choice_ids.forEach((id: number, idx: number) => {
                        formData.append(`answers[${index}][choice_ids][${idx}]`, id.toString());
                    });
                }

                if (answer.text_answer) {
                    formData.append(`answers[${index}][text_answer]`, answer.text_answer);
                }
            });

            // จัดการการอัปโหลดไฟล์
            const allFiles = files.map((f) => f.file);
            allFiles.forEach((file) => {
                formData.append("files", file);
            });

            // จัดการการอัปโหลดไฟล์
            let grouped_files_question_ids: { [key: string]: string[] } = {};

            files.forEach((fileObj) => {
                const questionId = fileObj.question_id.toString();
                const fileName = fileObj.file.name;

                if (!grouped_files_question_ids[questionId]) {
                    grouped_files_question_ids[questionId] = [];
                }

                grouped_files_question_ids[questionId].push(fileName);
            });

            formData.append("files_question_ids", JSON.stringify(grouped_files_question_ids));
            
            // ✅ ไม่ส่ง lesson_id สำหรับแบบทดสอบพิเศษ (pre/post test)
            if (lessonId > 0) {
                formData.append("lesson_id", lessonId.toString());
            }
            
            const startTime = new Date().toISOString();
            const endTime = new Date().toISOString();
            formData.append("startTime", startTime);
            formData.append("endTime", endTime);

            const response = await axios.post(
                `${API_URL}/api/learn/quiz/${quizId}/submit`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // ปรับการตรวจสอบการตอบกลับจาก API
            if (response.data.success) {
                const result = response.data.result;
                setScore(result.totalScore || 0);
                setMaxScore(result.maxScore || 0);
                setIsPassed(result.passed);

                if (result.uploadedFiles && result.uploadedFiles.length > 0) {
                    setUploadedAttachments(
                        result.uploadedFiles.map((file: any) => ({
                            attachment_id: file.attachment_id,
                            file_name: file.file_name,
                            file_url: file.file_url || "",
                        }))
                    );
                }

                // ตรวจสอบว่าต้องรอตรวจหรือไม่
                if (result.awaiting_review || isSpecialQuiz || result.isSpecialQuiz) {
                    setIsAwaitingReview(true);
                    setShowResult(true);
                    
                    // ✅ อัปเดต subject progress แม้จะรอตรวจ (เฉพาะเมื่อมี lesson_id)
                    if (lessonId > 0) {
                        try {
                            const subjectResponse = await axios.get(
                                `${API_URL}/api/learn/lesson/${lessonId}/subject`,
                                {
                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                }
                            );
                            
                            if (subjectResponse.data.success && subjectResponse.data.subject_id) {
                                await axios.post(
                                    `${API_URL}/api/subjects/${subjectResponse.data.subject_id}/update-progress`,
                                    {},
                                    {
                                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                    }
                                );
                            }
                        } catch (error) {
                            console.error("Error updating subject progress:", error);
                        }
                    }
                    
                    safeOnComplete(); // แจ้งว่าส่งแล้ว รอตรวจ
                } else if (result.passed) {
                    // ✅ อัปเดต subject progress เมื่อผ่านแบบทดสอบ (เฉพาะเมื่อมี lesson_id)
                    if (lessonId > 0) {
                        try {
                            const subjectResponse = await axios.get(
                                `${API_URL}/api/learn/lesson/${lessonId}/subject`,
                                {
                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                }
                            );
                            
                            if (subjectResponse.data.success && subjectResponse.data.subject_id) {
                                await axios.post(
                                    `${API_URL}/api/subjects/${subjectResponse.data.subject_id}/update-progress`,
                                    {},
                                    {
                                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                    }
                                );
                            }
                        } catch (error) {
                            console.error("Error updating subject progress:", error);
                        }
                    }
                    
                    safeOnComplete(); // ผ่านแบบทดสอบปกติ
                }

                // เรียก onRefreshProgress ถ้ามี
                if (typeof onRefreshProgress === 'function') {
                    onRefreshProgress();
                }

                return result;
            }

            throw new Error(
                "การส่งแบบทดสอบล้มเหลว: " + (response.data.message || "ไม่ทราบสาเหตุ")
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error submitting quiz:", error.message, error.response?.data);
                alert(
                    `เกิดข้อผิดพลาด: ${error.message} - ${
                        error.response?.data?.message || "กรุณาตรวจสอบ URL หรือ Quiz ID"
                    }`
                );
            } else {
                console.error("Error submitting quiz:", error);
                alert("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่");
            }
            return null;
        }
    };

    const handleNext = async () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // ✅ แก้ไข: รองรับ Mixed Quiz - ส่งแยกกันระหว่างปรนัยและอัตนัย
            if (isSpecialQuiz) {
                console.log("🎯 Processing Mixed Quiz submission...");
                
                // 1. ส่งคำตอบปรนัย (SC, MC, TF) ผ่าน API เดิม
                const objectiveQuestions = questions.filter(q => q.type !== "FB");
                if (objectiveQuestions.length > 0) {
                    console.log("📤 Submitting objective questions...");
                    const objectiveResult = await submitQuizAnswers();
                    if (objectiveResult) {
                        console.log("✅ Objective questions submitted successfully");
                    }
                }
                
                // 2. ส่งคำตอบอัตนัย (FB) ผ่าน SpecialQuiz API
                const fbQuestions = questions.filter(q => q.type === "FB");
                if (fbQuestions.length > 0) {
                    console.log("📝 Submitting subjective questions...");
                    
                    // ส่งคำตอบทีละข้อสำหรับคำถาม FB
                    for (let i = 0; i < questions.length; i++) {
                        const questionData = questions[i];
                        if (questionData.type === "FB") {
                            const textAnswer = textAnswers[i] || "";
                            const file = files.find(f => f.questionIndex === i)?.file;
                            
                            // ตรวจสอบว่าส่งคำตอบข้อนี้แล้วหรือยัง
                            if (!submittedAnswers.has(questionData.question_id)) {
                                console.log(`📝 Submitting FB answer for question ${questionData.question_id}`);
                                await submitSingleAnswer(questionData.question_id, textAnswer, file);
                            }
                        }
                    }
                    
                    // ส่ง Special Quiz เมื่อเสร็จทุกข้อ FB
                    console.log("📤 Submitting Special Quiz...");
                await submitSpecialQuiz();
                }
                
                setShowResult(true);
                setIsAwaitingReview(true);
                safeOnComplete();
            } else {
                // แบบทดสอบปกติ - ใช้ API เดิม สำหรับคำถามปรนัย (SC, MC, TF)
                console.log("🎯 Processing Normal Quiz submission...");
                const result = await submitQuizAnswers();

                if (result) {
                    setScore(result.totalScore || 0);
                    setIsPassed(result.passed);
                    setShowResult(true);

                    if (result.passed) {
                        safeOnComplete();
                        
                        setTimeout(() => {
                            if (onGoToLatestContent) {
                                console.log("🎯 ใช้ onGoToLatestContent - ไปเนื้อหาล่าสุดที่ดูได้");
                                resetAllStates();
                                onGoToLatestContent();
                            } else if (onGoToNextLesson) {
                                console.log("🎯 ใช้ onGoToNextLesson - ไปบทเรียนถัดไป");
                                resetAllStates();
                                onGoToNextLesson();
                            } else if (onNextLesson) {
                                console.log("🎯 ใช้ onNextLesson - ไปเนื้อหาถัดไป");
                                resetAllStates();
                                onNextLesson();
                            }
                        }, 2000);
                    }
                } else {
                    // Fallback scoring
                    let newScore = 0;

                    for (let i = 0; i < questions.length; i++) {
                        const question = questions[i];

                        switch (question.type) {
                            case "SC":
                            case "TF":
                                if (
                                    selectedSingleAnswers[i] !== undefined &&
                                    question.choices[selectedSingleAnswers[i]]?.is_correct
                                ) {
                                    newScore += question.score;
                                }
                                break;

                            case "MC":
                                const selectedChoices = selectedMultipleAnswers[i] || [];
                                const correctChoices = question.choices
                                    .map((choice, idx) => ({ idx, is_correct: choice.is_correct }))
                                    .filter((choice) => choice.is_correct)
                                    .map((choice) => choice.idx);

                                if (
                                    selectedChoices.length === correctChoices.length &&
                                    correctChoices.every((idx) => selectedChoices.includes(idx))
                                ) {
                                    newScore += question.score;
                                }
                                break;

                            case "FB":
                                // FB ไม่ให้คะแนนใน fallback - ต้องรอตรวจ
                                break;
                        }
                    }

                    const maxScore = questions.reduce((sum, q) => sum + q.score, 0);
                    const percentage = (newScore / maxScore) * 100;
                    setMaxScore(maxScore);
                    setScore(newScore);
                    setIsPassed(percentage >= PASSING_PERCENTAGE);
                    setShowResult(true);

                    if (percentage >= PASSING_PERCENTAGE) {
                        safeOnComplete();
                        
                        setTimeout(() => {
                            if (onGoToLatestContent) {
                                console.log("🎯 ใช้ onGoToLatestContent - ไปเนื้อหาล่าสุดที่ดูได้");
                                resetAllStates();
                                onGoToLatestContent();
                            } else if (onGoToNextLesson) {
                                console.log("🎯 ใช้ onGoToNextLesson - ไปบทเรียนถัดไป");
                                resetAllStates();
                                onGoToNextLesson();
                            } else if (onNextLesson) {
                                console.log("🎯 ใช้ onNextLesson - ไปเนื้อหาถัดไป");
                                resetAllStates();
                                onNextLesson();
                            }
                        }, 2000);
                    }
                }
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleFinish = () => {
        if (isPassed || isAwaitingReview) {
            safeOnComplete();
            
            // ✅ แก้ไข: ใช้ onGoToLatestContent เป็นหลัก สำหรับไปเนื้อหาล่าสุดที่ดูได้
            setTimeout(() => {
                if (onGoToLatestContent) {
                    console.log("🎯 ใช้ onGoToLatestContent - ไปเนื้อหาล่าสุดที่ดูได้");
                    resetAllStates();
                    onGoToLatestContent();
                } else if (onGoToNextLesson) {
                    console.log("🎯 ใช้ onGoToNextLesson - ไปบทเรียนถัดไป (lesson ถัดไป)");
                    resetAllStates();
                    onGoToNextLesson();
                } else if (onNextLesson) {
                    // ✅ ใช้ onNextLesson เป็น fallback สำหรับแบบทดสอบพิเศษ
                    console.log("🎯 ใช้ onNextLesson - ไปเนื้อหาถัดไป (fallback)");
                    resetAllStates();
                    onNextLesson();
                } else {
                    // กรณีที่ไม่มีทั้งสอง (เช่น เป็นแบบทดสอบสุดท้าย)
                    console.log("แบบทดสอบเสร็จสิ้น - ไม่มีบทเรียนถัดไป");
                }
            }, 2000); // ✅ เพิ่มเวลาเป็น 2 วินาทีเพื่อให้ผู้ใช้เห็นผลลัพธ์
        } else {
            resetQuiz();
        }
    };

    const resetQuiz = () => {
        // ✅ ใช้ฟังก์ชัน resetAllStates แทนการ reset แยก
        resetAllStates();
        // แต่ไม่ต้อง reset loading และ questions เพราะต้องการให้โหลดคำถามใหม่
        setLoading(false);
        if (quizData && quizData.length > 0) {
            const formattedQuestions = mapBackendQuestions(quizData);
            setQuestions(formattedQuestions);
            checkIfSpecialQuiz(formattedQuestions);
        }
    };

    // ✅ Task 2: ฟังก์ชันแสดงผลละเอียด
    const showDetailedResults = () => {
        setShowDetailedResultsState(true);
    };

    const hideDetailedResults = () => {
        setShowDetailedResultsState(false);
    };

    const isCurrentQuestionAnswered = () => {
        if (questions.length === 0 || currentQuestion >= questions.length) {
            return false;
        }

        const question = questions[currentQuestion];

        switch (question.type) {
            case "SC":
            case "TF":
                return selectedSingleAnswers[currentQuestion] !== undefined;

            case "MC":
                return selectedMultipleAnswers[currentQuestion]?.length > 0;

            case "FB":
                // อนุญาตให้ตอบด้วยข้อความหรือไฟล์อย่างใดอย่างหนึ่ง
                const hasTextAnswer = textAnswers[currentQuestion]?.trim().length > 0;
                const hasFiles = files.filter((f) => f.questionIndex === currentQuestion).length > 0;
                return hasTextAnswer || hasFiles;

            default:
                return false;
        }
    };

    if (loading) {
        return (
            <div className="quiz-container">
                <div className="loading-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-3">กำลังโหลดแบบทดสอบ...</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="quiz-container">
                <div className="alert alert-warning" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    ไม่พบข้อมูลแบบทดสอบ
                </div>
            </div>
        );
    }

    if (isAwaitingReview) {
        // ถ้ามี attempt ล่าสุดและข้อกาไม่ผ่าน ให้แสดง 'ไม่ผ่าน' + ปุ่มทำใหม่
        const latestAttempt = previousAttempts[0];
        if (latestAttempt && latestAttempt.passed === false) {
            return (
                <div className="quiz-container">
                    <div className="result-container">
                        <div className="result card shadow-sm p-4 failed border-danger">
                            <div className="icon-container mb-3">
                                <span className="icon-circle bg-danger-light">
                                    <i className="fas fa-times-circle text-danger fa-3x"></i>
                                </span>
                            </div>
                            <h2 className="mb-4 fw-bold">คุณไม่ผ่านแบบทดสอบนี้</h2>
                            <div className="score-info card mb-4">
                                <div className="card-body">
                                    <div className="score-grid">
                                        <div className="score-item">
                                            <span>คะแนนของคุณ</span>
                                            <span className="score fw-bold">{latestAttempt.score} / {latestAttempt.max_score}</span>
                                        </div>
                                        <div className="score-item">
                                            <span>เกณฑ์ผ่าน</span>
                                            <span className="fw-bold">{PASSING_PERCENTAGE}%</span>
                                        </div>
                                        <div className="score-item">
                                            <span>ประเภทแบบทดสอบ</span>
                                            <span className="badge bg-info">Normal Quiz</span>
                                        </div>
                                        <div className="score-item">
                                            <span>สถานะ</span>
                                            <span className="badge bg-danger">ไม่ผ่าน</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-grid gap-2 col-md-6 mx-auto">
                                <button className="btn btn-primary btn-lg" onClick={resetQuiz}>
                                    <i className="fas fa-redo me-2"></i>
                                    เริ่มทำแบบทดสอบใหม่
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        // กรณีปกติ (รอตรวจจริง) - Redesigned UI
        return (
            <div className="quiz-container">
                <div className="result-container">
                    <div className="awaiting-review-redesign card border-0 shadow-lg">
                        {/* Header Section */}
                        <div 
                            className="card-header text-white text-center py-4 border-0"
                            style={{
                                background: 'linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Background animation */}
                            <div 
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                    animation: 'float 3s ease-in-out infinite'
                                }}
                            />
                            
                            <div className="header-animation mb-3" style={{position: 'relative', zIndex: 2}}>
                                <div 
                                    className="rotating-icon"
                                    style={{
                                        animation: 'pulse 2s ease-in-out infinite'
                                    }}
                                >
                                    <div 
                                        className="d-inline-block"
                                        style={{
                                            padding: '20px',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            borderRadius: '50%',
                                            border: '3px solid rgba(255, 255, 255, 0.3)'
                                        }}
                                    >
                                        <i className="fas fa-clock text-white" style={{fontSize: '3rem'}}></i>
                                    </div>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-2 text-white" style={{position: 'relative', zIndex: 2}}>
                                รอการตรวจจากอาจารย์
                            </h2>
                            <p className="mb-0" style={{color: 'rgba(255, 255, 255, 0.8)', position: 'relative', zIndex: 2}}>
                                แบบทดสอบของคุณส่งเรียบร้อยแล้ว
                            </p>

                            {/* Custom CSS Animations */}
                            <style>{`
                                @keyframes pulse {
                                    0%, 100% { transform: scale(1); }
                                    50% { transform: scale(1.05); }
                                }
                                @keyframes float {
                                    0%, 100% { transform: translateY(0px); }
                                    50% { transform: translateY(-10px); }
                                }
                                @keyframes fadeInUp {
                                    from {
                                        opacity: 0;
                                        transform: translateY(30px);
                                    }
                                    to {
                                        opacity: 1;
                                        transform: translateY(0);
                                    }
                                }
                                .awaiting-review-redesign {
                                    animation: fadeInUp 0.6s ease-out;
                                }
                                .info-card {
                                    transition: all 0.3s ease;
                                    border: 2px solid transparent;
                                }
                                .info-card:hover {
                                    transform: translateY(-5px);
                                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                                    border-color: rgba(var(--bs-primary-rgb), 0.3);
                                }
                                .action-buttons button {
                                    transition: all 0.3s ease;
                                }
                                .action-buttons button:hover {
                                    transform: translateY(-2px);
                                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                                }
                            `}</style>
                        </div>

                        {/* Content Section */}
                        <div className="card-body p-5">
                            <div className="row align-items-center">
                                <div className="col-md-8 mx-auto">
                                    {/* Status Info */}
                                    <div 
                                        className="status-info-box rounded-3 p-4 mb-4"
                                        style={{
                                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                            border: '2px solid #dee2e6',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Progress bar animation */}
                                        <div 
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                height: '4px',
                                                width: '100%',
                                                background: 'linear-gradient(90deg, #ff9500, #ff6b35)',
                                                animation: 'shimmer 2s infinite'
                                            }}
                                        />
                                        
                                        <div className="d-flex align-items-start">
                                            <div className="status-icon me-4">
                                                <div 
                                                    className="icon-wrapper rounded-circle p-3"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)',
                                                        color: 'white',
                                                        boxShadow: '0 4px 15px rgba(255, 149, 0, 0.3)'
                                                    }}
                                                >
                                                    <i className="fas fa-hourglass-half fs-2"></i>
                                                </div>
                                            </div>
                                            <div className="status-content flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 className="fw-bold text-dark mb-0">สถานะการส่งงาน</h5>
                                                    <span 
                                                        className="badge px-3 py-2"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                                                            color: 'white',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        <i className="fas fa-clock me-1"></i>
                                                        รอการตรวจ
                            </span>
                        </div>
                                                <p className="text-muted mb-3 lh-base">
                                {isSpecialQuiz 
                                                        ? "แบบทดสอบนี้มีคำถามประเภท Fill in Blank ที่จำเป็นต้องให้อาจารย์ตรวจสอบด้วยตนเอง เพื่อให้การประเมินผลมีความแม่นยำและเป็นธรรม"
                                                        : "แบบทดสอบนี้จำเป็นต้องให้อาจารย์ตรวจสอบก่อนประกาศผลเพื่อความแม่นยำในการประเมิน"
                                }
                            </p>
                                                <div className="timeline-info">
                                                    <div className="d-flex align-items-center">
                                                        <div 
                                                            className="me-2"
                                                            style={{
                                                                width: '12px',
                                                                height: '12px',
                                                                background: '#28a745',
                                                                borderRadius: '50%',
                                                                animation: 'pulse 2s infinite'
                                                            }}
                                                        />
                                                        <small className="text-success fw-semibold">
                                                            ส่งงานเรียบร้อยเมื่อ {new Date().toLocaleString('th-TH')}
                                                        </small>
                        </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional CSS for shimmer effect */}
                                        <style>{`
                                            @keyframes shimmer {
                                                0% { transform: translateX(-100%); }
                                                100% { transform: translateX(200%); }
                                            }
                                        `}</style>
                                    </div>

                                    {/* Information Cards */}
                                    <div className="row mb-5">
                                        <div className="col-md-6 mb-3">
                                            <div 
                                                className="info-card h-100 p-4 rounded-3 text-center"
                                                style={{
                                                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                                    border: '2px solid #2196f3',
                                                    borderRadius: '15px',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div 
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-50%',
                                                        right: '-50%',
                                                        width: '100px',
                                                        height: '100px',
                                                        background: 'rgba(33, 150, 243, 0.1)',
                                                        borderRadius: '50%'
                                                    }}
                                                />
                                                <div style={{position: 'relative', zIndex: 2}}>
                                                    <div 
                                                        className="mb-3"
                                                        style={{
                                                            display: 'inline-block',
                                                            padding: '15px',
                                                            background: '#2196f3',
                                                            borderRadius: '50%',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        <i className="fas fa-bell fs-3"></i>
                                                    </div>
                                                    <h6 className="fw-bold text-primary mb-2">การแจ้งเตือน</h6>
                                                    <small className="text-dark-50">
                                                        คุณจะได้รับการแจ้งเตือนผ่านระบบ<br />
                                                        เมื่ออาจารย์ตรวจแบบทดสอบเสร็จ
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div 
                                                className="info-card h-100 p-4 rounded-3 text-center"
                                                style={{
                                                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                                                    border: '2px solid #4caf50',
                                                    borderRadius: '15px',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div 
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-50%',
                                                        right: '-50%',
                                                        width: '100px',
                                                        height: '100px',
                                                        background: 'rgba(76, 175, 80, 0.1)',
                                                        borderRadius: '50%'
                                                    }}
                                                />
                                                <div style={{position: 'relative', zIndex: 2}}>
                                                    <div 
                                                        className="mb-3"
                                                        style={{
                                                            display: 'inline-block',
                                                            padding: '15px',
                                                            background: '#4caf50',
                                                            borderRadius: '50%',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        <i className="fas fa-sync-alt fs-3"></i>
                                                    </div>
                                                    <h6 className="fw-bold text-success mb-2">ตรวจสอบผล</h6>
                                                    <small className="text-dark-50">
                                                        กดปุ่มรีเฟรชเพื่อตรวจสอบ<br />
                                                        ผลการตรวจล่าสุดได้ตลอดเวลา
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="action-buttons text-center">
                                        <div className="d-grid gap-3 d-md-flex justify-content-md-center">
                                            <button 
                                                className="btn btn-lg px-5 py-3"
                                                onClick={() => fetchQuizData()}
                                                style={{
                                                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                                    border: 'none',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    fontWeight: '600',
                                                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div 
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: '-100%',
                                                        width: '100%',
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                                        transition: 'left 0.5s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.left = '100%'}
                                                    onMouseLeave={(e) => e.currentTarget.style.left = '-100%'}
                                                />
                                                <span style={{position: 'relative', zIndex: 2}}>
                                                    <i className="fas fa-sync-alt me-2"></i>
                                                    รีเฟรชผลตรวจ
                                                </span>
                                            </button>
                                            <button 
                                                className="btn btn-lg px-5 py-3"
                                                onClick={safeOnComplete}
                                                style={{
                                                    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                                                    border: 'none',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    fontWeight: '600',
                                                    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div 
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: '-100%',
                                                        width: '100%',
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                                        transition: 'left 0.5s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.left = '100%'}
                                                    onMouseLeave={(e) => e.currentTarget.style.left = '-100%'}
                                                />
                                                <span style={{position: 'relative', zIndex: 2}}>
                                <i className="fas fa-arrow-left me-2"></i>
                                                    กลับไปบทเรียน
                                                </span>
                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="card-footer bg-light text-center py-3 border-0">
                            <small className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>
                                หากมีคำถามเพิ่มเติม กรุณาติดต่ออาจารย์ผู้สอน
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Task 2: แสดงผลละเอียด
    if (showDetailedResultsState) {
        const latestAttempt = previousAttempts[0];
        if (!latestAttempt || !latestAttempt.answers) {
            return (
                <div className="quiz-container">
                    <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        ไม่พบข้อมูลคำตอบที่ละเอียด
                    </div>
                    <button className="btn btn-secondary" onClick={hideDetailedResults}>
                        <i className="fas fa-arrow-left me-2"></i>
                        กลับไปยังผลลัพธ์
                    </button>
                </div>
            );
        }

        return (
            <div className="quiz-container">
                <div className="detailed-results-container">
                    <div className="detailed-results-header mb-4">
                        <button className="btn btn-outline-secondary mb-3" onClick={hideDetailedResults}>
                            <i className="fas fa-arrow-left me-2"></i>
                            กลับไปยังผลลัพธ์
                        </button>
                        <h2 className="text-center">
                            <i className="fas fa-chart-bar me-2"></i>
                            ผลคะแนนละเอียด
                        </h2>
                        <div className="text-center text-muted">
                            คะแนนรวม: {latestAttempt.score} / {latestAttempt.max_score} คะแนน
                            ({Math.round((latestAttempt.score / latestAttempt.max_score) * 100)}%)
                        </div>
                    </div>

                    <div className="detailed-questions">
                        {questions.map((question, index) => {
                            const userAnswer = latestAttempt.answers.find(ans => ans.question_id === question.question_id);
                            const isCorrect = userAnswer?.is_correct || false;
                            const scoreEarned = userAnswer?.score_earned || 0;

                            return (
                                <div key={index} className={`detailed-question-card card mb-3 ${isCorrect ? 'border-success' : 'border-danger'}`}>
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            คำถามที่ {index + 1}
                                            <span className={`badge ms-2 ${isCorrect ? 'bg-success' : 'bg-danger'}`}>
                                                {isCorrect ? 'ถูก' : 'ผิด'}
                                            </span>
                                        </h5>
                                        <span className="badge bg-primary">
                                            {scoreEarned} / {question.score} คะแนน
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <div className="question-text mb-3">
                                            <strong>คำถาม:</strong> {question.title}
                                        </div>
                                        
                                        <div className="answer-section">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="user-answer">
                                                        <h6 className="text-primary">
                                                            <i className="fas fa-user me-2"></i>
                                                            คำตอบของคุณ:
                                                        </h6>
                                                        {question.type === "SC" || question.type === "TF" ? (
                                                            <div className="answer-choice">
                                                                {userAnswer?.choice_id && (
                                                                    <span className="badge bg-info">
                                                                        {question.choices.find(c => c.choice_id === userAnswer.choice_id)?.text || 'ไม่พบคำตอบ'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : question.type === "MC" ? (
                                                            <div className="answer-choices">
                                                                {userAnswer?.choice_ids?.map((choiceId: number) => (
                                                                    <span key={choiceId} className="badge bg-info me-1">
                                                                        {question.choices.find(c => c.choice_id === choiceId)?.text || 'ไม่พบคำตอบ'}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : question.type === "FB" ? (
                                                            <div className="text-answer">
                                                                <p className="bg-light p-2 rounded">
                                                                    {userAnswer?.text_answer || 'ไม่มีคำตอบ'}
                                                                </p>
                                                                {userAnswer?.attachments && userAnswer.attachments.length > 0 && (
                                                                    <div className="attachments mt-2">
                                                                        <small className="text-muted">ไฟล์แนบ:</small>
                                                                        {userAnswer.attachments.map((attachment, attIndex) => (
                                                                            <div key={attIndex} className="attachment-item">
                                                                                <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                                                                                    <i className="fas fa-file me-1"></i>
                                                                                    {attachment.file_name}
                                                                                </a>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="correct-answer">
                                                        <h6 className="text-success">
                                                            <i className="fas fa-check-circle me-2"></i>
                                                            คำตอบที่ถูกต้อง:
                                                        </h6>
                                                        {question.type === "SC" || question.type === "TF" ? (
                                                            <div className="correct-choice">
                                                                {question.choices.find(c => c.is_correct) && (
                                                                    <span className="badge bg-success">
                                                                        {question.choices.find(c => c.is_correct)?.text}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : question.type === "MC" ? (
                                                            <div className="correct-choices">
                                                                {question.choices.filter(c => c.is_correct).map(choice => (
                                                                    <span key={choice.choice_id} className="badge bg-success me-1">
                                                                        {choice.text}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : question.type === "FB" ? (
                                                            <div className="correct-text">
                                                                <p className="text-muted">
                                                                    <i className="fas fa-info-circle me-1"></i>
                                                                    คำตอบประเภท Fill in Blank จะถูกตรวจโดยอาจารย์
                                                                </p>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="detailed-results-footer text-center mt-4">
                        <button className="btn btn-primary" onClick={hideDetailedResults}>
                            <i className="fas fa-arrow-left me-2"></i>
                            กลับไปยังผลลัพธ์
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showResult) {
        return (
            <div className="quiz-container">
                <div className="result-container">
                    <div className={`result card shadow-sm p-4 ${isPassed ? "passed border-success" : "failed border-danger"}`}>
                        <div className="icon-container mb-3">
                            <span className={`icon-circle ${isPassed ? "bg-success-light" : "bg-danger-light"}`}>
                                {isPassed ? (
                                    <i className="fas fa-check-circle text-success fa-3x"></i>
                                ) : (
                                    <i className="fas fa-times-circle text-danger fa-3x"></i>
                                )}
                            </span>
                        </div>

                        <h2 className="mb-4 fw-bold">
                            {isPassed ? "🎉 ยินดีด้วย! คุณผ่านแบบทดสอบนี้" : "😞 คุณไม่ผ่านแบบทดสอบนี้"}
                        </h2>

                        {/* ✅ Task 1: เพิ่มข้อมูลเพิ่มเติมเกี่ยวกับผลลัพธ์ */}
                        {isPassed && (
                            <div className="alert alert-success mb-4" role="alert">
                                <i className="fas fa-check-circle me-2"></i>
                                <strong>ยอดเยี่ยม!</strong> คุณได้ผ่านแบบทดสอบนี้เรียบร้อยแล้ว
                                {isSpecialQuiz && " (รอการตรวจสอบจากอาจารย์)"}
                            </div>
                        )}

                        {!isPassed && !isAwaitingReview && (
                            <div className="alert alert-danger mb-4" role="alert">
                                <i className="fas fa-times-circle me-2"></i>
                                <strong>ไม่ผ่าน:</strong> คุณสามารถลองทำแบบทดสอบใหม่ได้
                            </div>
                        )}

                        <div className="score-info card mb-4">
                            <div className="card-body">
                                {score !== null && score !== undefined ? (
                                    <div className="score-grid">
                                        <div className="score-item">
                                            <span>คะแนนของคุณ</span>
                                            <span className="score fw-bold">{score} / {maxScore}</span>
                                        </div>
                                        <div className="score-item">
                                            <span>เกณฑ์ผ่าน</span>
                                            <span className="fw-bold">{PASSING_PERCENTAGE}%</span>
                                        </div>
                                        <div className="score-item">
                                            <span>ประเภทแบบทดสอบ</span>
                                            <span className={`badge ${isSpecialQuiz ? "bg-warning" : "bg-info"}`}>
                                                {isSpecialQuiz ? "Special Quiz" : "Normal Quiz"}
                                            </span>
                                        </div>
                                        <div className="score-item">
                                            <span>สถานะ</span>
                                            <span className={`badge ${isPassed ? "bg-success" : "bg-danger"}`}>
                                                {isPassed ? "ผ่าน" : "ไม่ผ่าน"}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="alert alert-warning mb-0">
                                        คะแนนจะปรากฏหลังอาจารย์ตรวจเสร็จ
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* แสดงข้อมูลเพิ่มเติมสำหรับ Special Quiz */}
                        {isSpecialQuiz && (
                            <div className="special-quiz-info card mb-4">
                                <div className="card-header bg-warning text-dark">
                                    <h6 className="mb-0">
                                        <i className="fas fa-info-circle me-2"></i>
                                        ข้อมูลแบบทดสอบพิเศษ
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <p className="mb-2">
                                        <i className="fas fa-edit me-2"></i>
                                        แบบทดสอบนี้มีคำถามประเภท Fill in Blank ที่ต้องตรวจด้วยตนเอง
                                    </p>
                                    <p className="mb-0">
                                        <i className="fas fa-clock me-2"></i>
                                        คะแนนจะถูกอัปเดตหลังจากอาจารย์ตรวจเสร็จ
                                    </p>
                                </div>
                            </div>
                        )}

                        {previousAttempts.length > 0 && (
                            <div className="previous-attempts card mb-4">
                                <div className="card-header bg-light">
                                    <h5 className="mb-0">
                                        <i className="fas fa-history me-2"></i>
                                        การส่งครั้งก่อนหน้า
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="accordion" id="attemptAccordion">
                                        {previousAttempts.map((attempt, index) => (
                                            <div key={index} className="accordion-item">
                                                <h2 className="accordion-header" id={`heading${index}`}>
                                                    <button
                                                        className="accordion-button collapsed"
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target={`#collapse${index}`}
                                                        aria-expanded="false"
                                                        aria-controls={`collapse${index}`}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center w-100">
                                                            <span>
                                                                <strong>ครั้งที่ {previousAttempts.length - index}</strong>
                                                            </span>
                                                            <div className="d-flex gap-2 me-3">
                                                                <span className={`badge ${attempt.passed ? "bg-success" : "bg-danger"}`}>
                                                                    {attempt.passed ? "ผ่าน" : "ไม่ผ่าน"}
                                                                </span>
                                                                <span className="badge bg-secondary">
                                                                    {attempt.status === "completed" && attempt.score !== null && attempt.score !== undefined
                                                                        ? `${attempt.score} / ${attempt.max_score}`
                                                                        : <span className="badge bg-warning">รอการตรวจ</span>}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </h2>
                                                <div
                                                    id={`collapse${index}`}
                                                    className="accordion-collapse collapse"
                                                    aria-labelledby={`heading${index}`}
                                                    data-bs-parent="#attemptAccordion"
                                                >
                                                    <div className="accordion-body">
                                                        <div className="attempt-details">
                                                            <div className="row mb-2">
                                                                <div className="col-md-6">
                                                                    <p className="mb-1">
                                                                        <i className="far fa-calendar-alt me-2"></i>
                                                                        วันที่ส่ง:
                                                                    </p>
                                                                    <p className="fw-bold">
                                                                        {new Date(attempt.end_time).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <p className="mb-1">
                                                                        <i className="fas fa-chart-pie me-2"></i>
                                                                        คะแนน:
                                                                    </p>
                                                                    <p className="fw-bold">
                                                                        {attempt.score} / {attempt.max_score} (
                                                                        {Math.round((attempt.score / attempt.max_score) * 100)}%)
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {attempt.answers && attempt.answers.some((ans) => ans.attachments && ans.attachments.length > 0) && (
                                                                <div className="attached-files mt-3">
                                                                    <h6 className="mb-3">
                                                                        <i className="fas fa-paperclip me-2"></i>
                                                                        ไฟล์แนบ:
                                                                    </h6>
                                                                    {attempt.answers.map(
                                                                        (answer, ansIndex) =>
                                                                            answer.attachments &&
                                                                            answer.attachments.length > 0 && (
                                                                                <div key={ansIndex} className="answer-attachments mb-3">
                                                                                    <div className="file-header bg-light p-2 rounded">
                                                                                        <span>คำถามที่ {ansIndex + 1}</span>
                                                                                    </div>
                                                                                    <ul className="list-group mt-2">
                                                                                        {answer.attachments.map((attachment) => (
                                                                                            <li
                                                                                                key={attachment.attachment_id}
                                                                                                className="list-group-item d-flex align-items-center"
                                                                                            >
                                                                                                <i className="fas fa-file me-3 text-primary"></i>
                                                                                                <a
                                                                                                    href={attachment.file_url}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="text-decoration-none"
                                                                                                >
                                                                                                    {attachment.file_name}
                                                                                                </a>
                                                                                                <span className="ms-auto">
                                                                                                    <a
                                                                                                        href={attachment.file_url}
                                                                                                        download
                                                                                                        className="btn btn-sm btn-outline-primary"
                                                                                                    >
                                                                                                        <i className="fas fa-download"></i>
                                                                                                    </a>
                                                                                                </span>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="d-grid gap-2 col-md-6 mx-auto">
                            {isPassed ? (
                                <div className="d-flex flex-column gap-2">
                                    {/* ✅ Task 1: เปลี่ยนปุ่มไปยังบทเรียนถัดไปเป็นปุ่มไปยังบทเรียนล่าสุด */}
                                    <button className="btn btn-success btn-lg" onClick={handleFinish}>
                                        <i className="fas fa-play-circle me-2"></i>
                                        {onGoToLatestContent ? "ไปยังบทเรียนล่าสุด" : "เสร็จสิ้นการเรียน"}
                                    </button>
                                    {/* ✅ Task 2: เพิ่มปุ่มดูผลคะแนนทั้งหมด */}
                                    <button className="btn btn-outline-primary" onClick={showDetailedResults}>
                                        <i className="fas fa-chart-bar me-2"></i>
                                        ดูผลคะแนนทั้งหมด
                                    </button>
                                </div>
                            ) : (
                                <button className="btn btn-primary btn-lg" onClick={resetQuiz}>
                                    <i className="fas fa-redo me-2"></i>
                                    เริ่มทำแบบทดสอบใหม่
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <div className="question-counter">
                    คำถามที่ {currentQuestion + 1} จาก {questions.length}
                </div>
                <div className="progress">
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                        }}
                        aria-valuenow={((currentQuestion + 1) / questions.length) * 100}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    ></div>
                </div>
                
                {/* แสดงประเภทแบบทดสอบ */}
                {isSpecialQuiz && (
                    <div className="quiz-type-indicator mt-2">
                        <span className="badge bg-warning">
                            <i className="fas fa-edit me-1"></i>
                            Special Quiz (มี Fill in Blank - รอตรวจ)
                        </span>
                    </div>
                )}
            </div>

            <div className="question-container">
                <div className="question">
                    <h3>{questions[currentQuestion]?.title}</h3>
                    <p className="question-type">
                        {questions[currentQuestion]?.type === "SC" && "(เลือกคำตอบเดียว)"}
                        {questions[currentQuestion]?.type === "MC" && "(เลือกได้หลายคำตอบ)"}
                        {questions[currentQuestion]?.type === "TF" && "(ถูก/ผิด)"}
                        {questions[currentQuestion]?.type === "FB" && (
                            <span className="text-warning">
                                <i className="fas fa-edit me-1"></i>
                                (เติมคำตอบ - ต้องรอตรวจจากอาจารย์)
                            </span>
                        )}
                    </p>
                    <p className="question-score">
                        คะแนน: {questions[currentQuestion]?.score || 1} คะแนน
                    </p>

                    {/* Display question attachments */}
                    <QuestionAttachments attachments={questions[currentQuestion]?.attachments} />
                </div>

                <div className="answers">
                    {/* Single Choice or True/False Questions */}
                    {(questions[currentQuestion]?.type === "SC" || questions[currentQuestion]?.type === "TF") && (
                        <div className="single-choice">
                            {questions[currentQuestion]?.choices.map((choice, index) => (
                                <div
                                    key={index}
                                    className={`answer-option ${
                                        selectedSingleAnswers[currentQuestion] === index ? "selected" : ""
                                    }`}
                                    onClick={() => handleSingleAnswerSelect(index)}
                                >
                                    <div className="option-marker">
                                        {selectedSingleAnswers[currentQuestion] === index ? (
                                            <i className="fas fa-check-circle"></i>
                                        ) : (
                                            <i className="far fa-circle"></i>
                                        )}
                                    </div>
                                    <div className="option-text">{choice.text}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Multiple Choice Questions */}
                    {questions[currentQuestion]?.type === "MC" && (
                        <div className="multiple-choice">
                            {questions[currentQuestion]?.choices.map((choice, index) => (
                                <div
                                    key={index}
                                    className={`answer-option ${
                                        selectedMultipleAnswers[currentQuestion]?.includes(index) ? "selected" : ""
                                    }`}
                                    onClick={() => handleMultipleAnswerSelect(index)}
                                >
                                    <div className="option-marker">
                                        {selectedMultipleAnswers[currentQuestion]?.includes(index) ? (
                                            <i className="fas fa-check-square"></i>
                                        ) : (
                                            <i className="far fa-square"></i>
                                        )}
                                    </div>
                                    <div className="option-text">{choice.text}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Fill in the Blank Questions - Modern Design */}
                    {questions[currentQuestion]?.type === "FB" && (
                        <div className="essay-question-container">
                            {/* Essay Question Header */}
                            <div className="essay-question-header">
                                <div className="essay-question-icon">
                                    <i className="fas fa-edit"></i>
                                </div>
                                <div className="essay-question-info">
                                    <div className="essay-question-type">คำถามแบบอัตนัย</div>
                                    <h3 className="essay-question-title">
                                        {questions[currentQuestion]?.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Essay Instructions */}
                            <div className="essay-instructions">
                                <div className="essay-instructions-title">คำแนะนำ</div>
                                <p className="essay-instructions-text">
                                    คำตอบของคุณจะต้องรอการตรวจจากอาจารย์ กรุณาตอบให้ครบถ้วนและชัดเจน
                                </p>
                            </div>

                            {/* Essay Answer Section */}
                            <div className="essay-answer-section">
                                <textarea
                                    className="essay-textarea"
                                    placeholder="พิมพ์คำตอบของคุณที่นี่... ใช้พื้นที่นี้เพื่อเขียนคำตอบที่ครบถ้วนและชัดเจน"
                                    value={textAnswers[currentQuestion] || ""}
                                    onChange={handleTextAnswerChange}
                                ></textarea>

                                {/* Character Counter */}
                                <div className="essay-character-counter">
                                    <span className="essay-word-count">
                                        {textAnswers[currentQuestion]?.split(/\s+/).filter(word => word.length > 0).length || 0} คำ
                                    </span>
                                    <span className="essay-min-words">ขั้นต่ำ: 50 คำ</span>
                                </div>
                            </div>

                            {/* File Upload Section - Modern Design */}
                            <div className="essay-file-upload">
                                <div className="essay-upload-icon">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                </div>
                                <div className="essay-upload-text">แนบไฟล์เพิ่มเติม</div>
                                <div className="essay-upload-hint">รองรับไฟล์ PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</div>
                                
                                <input
                                    type="file"
                                    className="d-none"
                                    id="essayFileUpload"
                                    onChange={handleFileChange}
                                    multiple
                                    ref={fileInputRef}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                />
                                
                                <button
                                    className="btn btn-primary mt-3"
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 20px',
                                        fontWeight: '500'
                                    }}
                                >
                                    <i className="fas fa-plus me-2"></i>
                                    เลือกไฟล์
                                </button>
                            </div>

                            {/* Show uploaded files - Modern Design */}
                            {(files.filter((f) => f.questionIndex === currentQuestion).length > 0 ||
                                uploadedAttachments.length > 0) && (
                                <div className="essay-file-list">
                                    {files
                                        .filter((f) => f.questionIndex === currentQuestion)
                                        .map((fileObj, index) => (
                                            <div key={index} className="essay-file-item">
                                                <i className="essay-file-icon fas fa-file"></i>
                                                <span className="essay-file-name">{fileObj.file.name}</span>
                                                <span className="essay-file-size">
                                                    {(fileObj.file.size / 1024).toFixed(1)} KB
                                                </span>
                                                <button
                                                    className="essay-file-remove"
                                                    onClick={() => handleRemoveFile(index)}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    {uploadedAttachments.map((attachment, index) => (
                                        <div key={index} className="essay-file-item">
                                            <i className="essay-file-icon fas fa-file"></i>
                                            <a
                                                href={attachment.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="essay-file-name"
                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                            >
                                                {attachment.file_name}
                                            </a>
                                            <span className="essay-file-size">ไฟล์เดิม</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="quiz-footer">
                <button
                    className="btn btn-outline-primary"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                >
                    <i className="fas fa-arrow-left me-2"></i>
                    ข้อก่อนหน้า
                </button>

                <button
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={!isCurrentQuestionAnswered()}
                >
                    {currentQuestion < questions.length - 1 ? (
                        <>
                            ข้อถัดไป
                            <i className="fas fa-arrow-right ms-2"></i>
                        </>
                    ) : (
                        <>
                            {isSpecialQuiz ? (
                                <>
                                    <i className="fas fa-paper-plane me-2"></i>
                                    ส่งคำตอบทั้งหมด
                                    <div className="text-sm mt-1" style={{fontSize: '0.75rem', opacity: 0.8}}>
                                        (อัตนัยรอตรวจ)
                                    </div>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane me-2"></i>
                                    ส่งคำตอบ
                                </>
                            )}
                        </>
                    )}
                </button>
            </div>

            {/* ในหน้ารอตรวจ (isAwaitingReview) */}
            {isAwaitingReview && (
                <button className="btn btn-secondary mt-3" onClick={() => fetchQuizData()}>
                    <i className="fas fa-sync-alt me-2"></i>
                    รีเฟรชผลตรวจ
                </button>
            )}

            {/* ✅ แสดง Special Quiz UI */}
            {renderSpecialQuizUI()}
        </div>
    );
};

export default LessonQuiz;

