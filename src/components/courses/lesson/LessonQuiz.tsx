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
}

// Define different question types
type QuestionType = "SC" | "MC" | "TF" | "FB";

interface Question {
    question_id: number;
    title: string;
    type: QuestionType;
    score: number;
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
        choices: (q.options || q.choices || []).map((c: any) => ({
            choice_id: c.option_id ?? c.choice_id,
            text: c.option_text ?? c.text,
            is_correct: c.is_correct,
        })),
    }));
}

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

    // For single choice questions (SC, TF)
    const [selectedSingleAnswers, setSelectedSingleAnswers] = useState<number[]>([]);

    // For multiple choice questions (MC)
    const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<number[][]>([]);

    // For text questions and Fill in the Blank
    const [textAnswers, setTextAnswers] = useState<string[]>([]);

    // For file uploads (เชื่อมโยงไฟล์กับคำถาม)
    const [files, setFiles] = useState<{ questionIndex: number; question_id: number; file: File }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // กำหนดเกณฑ์การผ่าน (65%)
    const PASSING_PERCENTAGE = 65;

    // ✅ เพิ่มฟังก์ชัน reset state ทั้งหมด
    const resetAllStates = () => {
        setCurrentQuestion(0);
        setShowResult(false);
        setScore(0);
        setMaxScore(0);
        setIsPassed(false);
        setLoading(true);
        setQuestions([]);
        setIsSpecialQuiz(false);
        setIsAwaitingReview(false);
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
        return hasFillInBlank;
    };

    // ป้องกัน onComplete ถูกเรียกซ้ำ
    const safeOnComplete = () => {
        if (!hasCompleted) {
            setHasCompleted(true);
            onComplete();
        }
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
                }
                if (response.data.quiz.status === "awaiting_review") {
                    setIsAwaitingReview(true);
                    setShowResult(true);
                }
            }
            try {
                const attemptsResponse = await axios.get(
                    `${API_URL}/api/courses/quizzes/${quizId}/attempts`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                if (attemptsResponse.data.success && attemptsResponse.data.attempts && !cancelled) {
                    setPreviousAttempts(attemptsResponse.data.attempts);
                    const latestAttempt = attemptsResponse.data.attempts[0];
                    if (latestAttempt) {
                        setScore(latestAttempt.score);
                        setMaxScore(latestAttempt.max_score);
                        setIsPassed(latestAttempt.passed);
                        if (latestAttempt.status === "awaiting_review") {
                            setIsAwaitingReview(true);
                            setShowResult(true);
                            safeOnComplete();
                        } else {
                            setShowResult(true);
                        }
                        if (latestAttempt.answers && latestAttempt.answers.some((ans: Answer) => ans.attachments && ans.attachments.length > 0)) {
                            setUploadedAttachments(
                                latestAttempt.answers.flatMap((ans: Answer) => ans.attachments || [])
                            );
                        }
                    }
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setPreviousAttempts([]);
                } else {
                    console.error("Error fetching quiz data:", error);
                }
            }
            const lessonResponse = await axios.get(
                `${API_URL}/api/learn/lesson/${quizId}/progress`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (lessonResponse.data.success && lessonResponse.data.progress && !cancelled) {
                if (lessonResponse.data.progress.quiz_awaiting_review) {
                    setIsAwaitingReview(true);
                    setShowResult(true);
                    safeOnComplete();
                }
            }
            if (isSpecialQuiz && previousAttempts.length > 0) {
                const latestSpecial = previousAttempts.find(a => a.status === "completed" && a.score != null);
                if (latestSpecial) {
                    fetchSpecialQuizScore(latestSpecial.attempt_id).then((specialAttempt) => {
                        if (specialAttempt) {
                            setScore(specialAttempt.score);
                            setMaxScore(specialAttempt.max_score);
                            setIsPassed(specialAttempt.passed);
                            setShowResult(true);
                            setIsAwaitingReview(false);
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
            
            // โหลดคำถามใหม่
            const formattedQuestions = mapBackendQuestions(quizData);
            setQuestions(formattedQuestions);
            checkIfSpecialQuiz(formattedQuestions);
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

    // ส่งคำตอบไปยัง API
    const submitQuizAnswers = async () => {
        try {
            const formData = new FormData();

            // จัดรูปแบบคำตอบตามที่ API คาดหวัง
            const answers = questions
                .map((question, index) => {
                    // ตรวจสอบว่า question_id มีค่า
                    if (!question.question_id) {
                        console.error("พบคำถามที่ไม่มี question_id:", question);
                                                return null; // ข้ามคำถามนี้
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

                        case "FB":
                            if (textAnswers[index]) {
                                answer.text_answer = textAnswers[index];
                            }
                            break;

                        default:
                            return null;
                    }

                    return answer;
                })
                .filter((a) => a !== null);

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

                // ถ้าเป็น Special Quiz (มี FB) ให้รอตรวจเสมอ
                if (isSpecialQuiz || result.isSpecialQuiz) {
                    setIsAwaitingReview(true);
                    
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
            // ส่งคำตอบและแสดงผล
            const result = await submitQuizAnswers();

            if (result) {
                setScore(result.totalScore || 0);
                setIsPassed(result.passed);
                setShowResult(true); // แสดงผลลัพธ์เสมอ

                // ถ้าเป็น Special Quiz (มี FB) ให้รอตรวจเสมอ
                if (isSpecialQuiz || result.isSpecialQuiz) {
                    setIsAwaitingReview(true);
                }
            } else {
                // Fallback scoring - แต่ถ้าเป็น Special Quiz ก็ยังต้องรอตรวจ
                if (isSpecialQuiz) {
                    setIsAwaitingReview(true);
                } else {
                    // คำนวณคะแนนสำหรับแบบทดสอบปกติเท่านั้น
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
                    setShowResult(true); // แสดงผลลัพธ์เสมอ

                    if (percentage >= PASSING_PERCENTAGE) {
                        safeOnComplete();
                        
                        // ✅ แก้ไข: ใช้ onGoToNextLesson เป็นหลัก สำหรับแบบทดสอบของแต่ละบท
                        setTimeout(() => {
                            if (onGoToNextLesson) {
                                console.log("🎯 ใช้ onGoToNextLesson - ไปบทเรียนถัดไป (lesson ถัดไป)");
                                resetAllStates();
                                onGoToNextLesson();
                            } else if (onNextLesson) {
                                // ✅ ใช้ onNextLesson เป็น fallback สำหรับแบบทดสอบพิเศษ
                                console.log("🎯 ใช้ onNextLesson - ไปเนื้อหาถัดไป (fallback)");
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
            
            // ✅ แก้ไข: ใช้ onGoToNextLesson เป็นหลัก สำหรับแบบทดสอบของแต่ละบท
            setTimeout(() => {
                if (onGoToNextLesson) {
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
                                    <div className="score-item d-flex justify-content-between align-items-center mb-2">
                                        <span>คะแนนของคุณ:</span>
                                        <span className="score fw-bold">{latestAttempt.score} / {latestAttempt.max_score}</span>
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
        // กรณีปกติ (รอตรวจจริง)
        return (
            <div className="quiz-container">
                <div className="result-container">
                    <div className="awaiting-review card shadow-sm p-4 text-center">
                        <div className="icon-container mb-3">
                            <span className="icon-circle bg-warning-light">
                                <i className="fas fa-hourglass-half text-warning fa-2x"></i>
                            </span>
                        </div>
                        <h2 className="mb-3 fw-bold">รอการตรวจจากอาจารย์</h2>
                        <div className="message-box bg-light p-3 mb-4 rounded">
                            <p className="mb-2">
                                {isSpecialQuiz 
                                    ? "แบบทดสอบนี้มีคำถามประเภท Fill in Blank ที่ต้องรอการตรวจจากอาจารย์"
                                    : "แบบทดสอบนี้ต้องรอการตรวจจากอาจารย์"
                                }
                            </p>
                            <p className="mb-0">
                                คุณจะได้รับการแจ้งเตือนเมื่ออาจารย์ตรวจแบบทดสอบเสร็จแล้ว
                            </p>
                        </div>
                        <div className="d-grid gap-2 col-md-6 mx-auto">
                            <button className="btn btn-primary btn-lg" onClick={safeOnComplete}>
                                <i className="fas fa-arrow-left me-2"></i>
                                กลับไปยังบทเรียน
                            </button>
                        </div>
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
                                    <div>
                                        <div className="score-item d-flex justify-content-between align-items-center mb-2">
                                            <span>คะแนนของคุณ:</span>
                                            <span className="score fw-bold">{score} / {maxScore}</span>
                                        </div>
                                        <div className="score-item d-flex justify-content-between align-items-center mb-2">
                                            <span>เกณฑ์ผ่าน:</span>
                                            <span className="fw-bold">{PASSING_PERCENTAGE}%</span>
                                        </div>
                                        <div className="score-item d-flex justify-content-between align-items-center mb-2">
                                            <span>ประเภทแบบทดสอบ:</span>
                                            <span className={`badge ${isSpecialQuiz ? "bg-warning" : "bg-info"}`}>
                                                {isSpecialQuiz ? "Special Quiz (มี Fill in Blank)" : "Normal Quiz"}
                                            </span>
                                        </div>
                                        <div className="score-item d-flex justify-content-between align-items-center">
                                            <span>สถานะ:</span>
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
                                    <button className="btn btn-success btn-lg" onClick={handleFinish}>
                                        <i className="fas fa-arrow-right me-2"></i>
                                        {onNextLesson ? "ไปยังบทเรียนถัดไป" : "เสร็จสิ้นการเรียน"}
                                    </button>
                                    {/* ✅ Task 1: เพิ่มปุ่มดูผลคะแนนทั้งหมด */}
                                    <button className="btn btn-outline-primary" onClick={() => {
                                        // สามารถเพิ่ม logic เพื่อไปยังหน้าสรุปผลคะแนนทั้งหมดได้ที่นี่
                                        console.log("ดูผลคะแนนทั้งหมด");
                                    }}>
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

                    {/* Fill in the Blank Questions */}
                    {questions[currentQuestion]?.type === "FB" && (
                        <div className="text-answer">
                            <div className="alert alert-warning mb-3">
                                <i className="fas fa-info-circle me-2"></i>
                                <strong>คำถามประเภท Fill in Blank:</strong> คำตอบของคุณจะต้องรอการตรวจจากอาจารย์
                            </div>
                            
                            <textarea
                                className="form-control"
                                placeholder="พิมพ์คำตอบของคุณที่นี่..."
                                value={textAnswers[currentQuestion] || ""}
                                onChange={handleTextAnswerChange}
                                rows={5}
                            ></textarea>

                            {/* File Upload Section (only for FB questions) */}
                            <div className="file-upload-section mt-3">
                                <p className="mb-2">
                                    <i className="fas fa-paperclip me-2"></i>
                                    แนบไฟล์เพิ่มเติม (ถ้ามี)
                                </p>

                                <div className="input-group mb-3">
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="fileUpload"
                                        onChange={handleFileChange}
                                        multiple
                                        ref={fileInputRef}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        เลือกไฟล์
                                    </button>
                                </div>

                                {/* Show uploaded files */}
                                {(files.filter((f) => f.questionIndex === currentQuestion).length > 0 ||
                                    uploadedAttachments.length > 0) && (
                                    <div className="uploaded-files mt-2">
                                        <p className="mb-2">ไฟล์ที่แนบ:</p>
                                        <ul className="list-group">
                                            {files
                                                .filter((f) => f.questionIndex === currentQuestion)
                                                .map((fileObj, index) => (
                                                    <li
                                                        key={index}
                                                        className="list-group-item d-flex justify-content-between align-items-center"
                                                    >
                                                        <div>
                                                            <i className="fas fa-file me-2"></i>
                                                            {fileObj.file.name} ({(fileObj.file.size / 1024).toFixed(2)} KB)
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleRemoveFile(index)}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </li>
                                                ))}
                                            {uploadedAttachments.map((attachment, index) => (
                                                <li key={index} className="list-group-item">
                                                    <a
                                                        href={attachment.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <i className="fas fa-file me-2"></i>
                                                        {attachment.file_name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <p className="text-muted small mt-2">
                                    <i className="fas fa-info-circle me-1"></i>
                                    สามารถอัปโหลดไฟล์ได้สูงสุด 10 ไฟล์ ขนาดไม่เกิน 50MB ต่อไฟล์ 
                                    (รองรับ .pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png)
                                </p>
                            </div>
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
                                    <i className="fas fa-hourglass-half me-2"></i>
                                    ส่งคำตอบ (รอตรวจ)
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
        </div>
    );
};

export default LessonQuiz;

