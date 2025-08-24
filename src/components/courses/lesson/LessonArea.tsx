import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import LessonFaq from "./LessonFaq";
import LessonNavTav from "./LessonNavTav";
import LessonVideo from "./LessonVideo";
import LessonQuiz from "./LessonQuiz";
import ScoreProgressBar from "./ScoreProgressBar";
import "./LessonArea.css";

// เพิ่มการใช้ API URL จาก .env
const API_URL = import.meta.env.VITE_API_URL;

// ปรับปรุง interface ให้ตรงกับข้อมูลจาก API
interface LessonItem {
    id: number;
    lesson_id: number;
    title: string;
    lock: boolean;
    completed: boolean;
    type: "video" | "quiz";
    quizType: string,
    duration: string;
    video_url?: string;
    quiz_id?: number;
    quiz?: {
        progress?: {
            passed?: boolean;
            completed?: boolean;
            awaiting_review?: boolean;
        };
        score?: number;
        max_score?: number;
        actual_score?: number;
        type?: string;
        quiz_details?: {
            max_score: number;
            total_questions: number;
            questions_breakdown: {
                question_id: number;
                score: number;
            }[];
        };
    };
    status?: "passed" | "failed" | "awaiting_review";
}

interface SectionData {
    id: number;
    subject_id: number;
    title: string;
    count: string;
    items: LessonItem[];
    quiz_id?: number;
}

interface CourseData {
    course_id: number;
    title: string;
    description: string;
    instructors: Array<{
        instructor_id: number;
        name: string;
        position: string;
        avatar?: string;
        bio?: string;
    }>;
    subjects: {
        subject_id: number;
        title: string;
        description: string;
        lessons: {
            lesson_id: number;
            title: string;
            description: string;
            video_url: string;
            duration: number;
            quiz_id?: number | null;
            is_big_lesson?: boolean;
            big_lesson_id?: number;
            sub_lessons?: {
                lesson_id: number;
                title: string;
                description: string;
                video_url: string;
                duration: number;
                quiz_id?: number | null;
                order_number: number;
                progress?: {
                    video_completed: boolean;
                    quiz_completed: boolean;
                    overall_completed: boolean;
                };
                quiz?: {
                    quiz_id: number;
                    title: string;
                    description: string;
                    type: string;
                    progress?: {
                        completed: boolean;
                        passed: boolean;
                        awaiting_review: boolean;
                    };
                    questions: any[];
                };
            }[];
            progress?: {
                video_completed: boolean;
                quiz_completed: boolean;
                overall_completed: boolean;
            };
            quiz?: {
                quiz_id: number;
                title: string;
                description: string;
                type: string;
                progress?: {
                    completed: boolean;
                    passed: boolean;
                    awaiting_review: boolean;
                };
                questions: any[];
            };
        }[];
    }[];
}

interface LessonAreaProps {
    courseId: number;
    subjectId: number;
}

const LessonArea = ({ courseId, subjectId }: LessonAreaProps) => {
    const [currentView, setCurrentView] = useState<"video" | "quiz">("video");
    const [progress, setProgress] = useState<number>(0);
    const [currentLesson, setCurrentLesson] = useState<string>("");
    const [currentLessonId, setCurrentLessonId] = useState<string>("");
    const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);
    const [currentSubjectTitle, setCurrentSubjectTitle] = useState<string>("");
    const [currentLessonData, setCurrentLessonData] = useState<any>(null);
    const [currentQuizData, setCurrentQuizData] = useState<any>(null);
    const [youtubeId, setYoutubeId] = useState<string>("");
    const [lessonData, setLessonData] = useState<SectionData[]>([]);
    const [courseData, setCourseData] = useState<CourseData | null>(null);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [subjectQuizzes, setSubjectQuizzes] = useState<any[]>([]);
    const [initialLessonSet, setInitialLessonSet] = useState<boolean>(false);
    // เพิ่ม state สำหรับควบคุม activeAccordion ใน sidebar
    const [sidebarActiveAccordion, setSidebarActiveAccordion] = useState<number | null>(null);
    // เพิ่ม state สำหรับเก็บข้อมูลคะแนนจาก Score Management
    const [scoreItems, setScoreItems] = useState<any[]>([]);

    // ฟังก์ชันคำนวณคะแนนต่างๆ สำหรับ Real Score System
    const calculateCurrentScore = useCallback((): number => {
        // ใช้ข้อมูลจาก scoreItems (เหมือนหน้าเฉลี่ย)
        if (scoreItems.length === 0) return 0;
        
        let totalScore = 0;
        
        // คำนวณคะแนนที่ได้จาก quiz ที่ผ่านแล้ว
        scoreItems.forEach(item => {
            if (item.type === 'quiz' && item.progress?.passed) {
                totalScore += item.user_score || 0; // คะแนนที่ผู้ใช้ได้
            }
        });

        return totalScore;
    }, [scoreItems]);

    const calculateMaxScore = useCallback((): number => {
        // ใช้ข้อมูลจาก scoreItems (เหมือนหน้าเฉลี่ย)
        if (scoreItems.length === 0) return 0;
        
        let maxScore = 0;
        
        // คำนวณคะแนนเต็มจาก actual_score ของแต่ละ quiz
        scoreItems.forEach(item => {
            if (item.type === 'quiz' && item.actual_score > 0) {
                maxScore += item.actual_score; // คะแนนที่กำหนดไว้
            }
        });

        return maxScore;
    }, [scoreItems]);

    const calculatePassingScore = useCallback((): number => {
        const maxScore = calculateMaxScore();
        // ใช้เกณฑ์ผ่าน default 80% (สามารถดึงจาก API ได้ในอนาคต)
        const passingPercentage = 80;
        return Math.ceil(maxScore * (passingPercentage / 100));
    }, [calculateMaxScore]);

    // ฟังก์ชันดึงข้อมูลคะแนนจาก Score Management API
    const fetchScoreItems = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !currentSubjectId) return;

            const response = await axios.get(
                `${API_URL}/api/subjects/${currentSubjectId}/scores`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setScoreItems(response.data.scoreItems || []);
                console.log('📊 Score Items loaded:', response.data.scoreItems);
            }
        } catch (error) {
            console.error('Error fetching score items:', error);
        }
    }, [currentSubjectId]);
    // ✅ Task 5: ลบ paymentStatus state
    // const [paymentStatus, setPaymentStatus] = useState<any>(null);

    // ฟังก์ชันสกัด YouTube ID จาก URL (ใช้ useCallback เพื่อป้องกัน re-creation)
    const extractYoutubeId = useCallback((url?: string): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    }, []);

    // โหลดข้อมูลหลักสูตรทั้งหมดเมื่อโหลดหน้า (ใช้ useCallback เพื่อป้องกัน re-creation)
    const fetchCourseData = useCallback(async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/learn/course/${courseId}/full-content`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.data.success && response.data.course) {
                setCourseData(response.data.course);
                const sections: SectionData[] = [];
                const subject = response.data.course.subjects.find(
                    (s: any) => s.subject_id === subjectId
                );

                if (!subject) {
                    console.error(
                        `ไม่พบรายวิชารหัส ${subjectId} ในหลักสูตรรหัส ${courseId}`
                    );
                    setLoading(false);
                    return;
                }

                setCurrentSubjectTitle(subject.title);
                setCurrentSubjectId(subject.subject_id);

                if (subject.lessons && subject.lessons.length > 0) {
                    subject.lessons.forEach((lesson: any, lessonIndex: number) => {
                        // ตรวจสอบว่าเป็น Big Lesson หรือไม่
                        if (lesson.is_big_lesson) {
                            // Big Lesson - แสดง Sub Lessons
                            const sectionItems: LessonItem[] = [];
                            
                            // เพิ่ม Sub Lessons
                            if (lesson.sub_lessons && lesson.sub_lessons.length > 0) {
                                lesson.sub_lessons.forEach((subLesson: any, subIndex: number) => {
                                    // เพิ่มวิดีโอ Sub Lesson
                                    sectionItems.push({
                                        id: subIndex * 2,
                                        lesson_id: subLesson.lesson_id,
                                        title: `${lessonIndex + 1}.${subIndex + 1} 📹 ${subLesson.title}`,
                                        lock: false,
                                        completed: subLesson.progress?.video_completed || false,
                                        type: "video",
                                        quizType: "none",
                                        duration: subLesson.progress?.video_completed ? "100%" : "0%",
                                        video_url: subLesson.video_url,
                                        quiz_id: subLesson.quiz ? subLesson.quiz.quiz_id : undefined,
                                        status: subLesson.progress?.video_completed ? "passed" : "failed",
                                    });

                                    // เพิ่มแบบทดสอบ Sub Lesson (ถ้ามี)
                                    if (subLesson.quiz) {
                                        let quizStatus: "passed" | "failed" | "awaiting_review" = "failed";
                                        if (subLesson.quiz.progress?.passed) {
                                            quizStatus = "passed";
                                        } else if (subLesson.quiz.progress?.completed && !subLesson.quiz.progress?.passed) {
                                            quizStatus = "failed";
                                        } else if (subLesson.quiz.progress?.awaiting_review || (subLesson.quiz.type === "special_fill_in_blank" && subLesson.quiz.progress?.completed && !subLesson.quiz.progress?.passed)) {
                                            quizStatus = "awaiting_review";
                                        }
                                        sectionItems.push({
                                            id: subIndex * 2 + 1,
                                            lesson_id: subLesson.lesson_id,
                                            title: `${lessonIndex + 1}.${subIndex + 1}.2 แบบทดสอบท้ายบท`,
                                            lock: !subLesson.progress?.video_completed, // ล็อคถ้า video ยังไม่เสร็จ
                                            completed:
                                                subLesson.quiz.progress?.passed ||
                                                subLesson.quiz.progress?.awaiting_review ||
                                                false,
                                            type: "quiz",
                                            quizType: subLesson.quiz.type,
                                            duration: subLesson.quiz.progress?.passed
                                                ? "100%"
                                                : subLesson.quiz.progress?.awaiting_review
                                                ? "50%"
                                                : "0%",
                                            quiz_id: subLesson.quiz.quiz_id,
                                            status: quizStatus,
                                        });
                                    }
                                });
                            }

                            // เพิ่ม Big Lesson Quiz (ถ้ามี)
                            if (lesson.quiz) {
                                let quizStatus: "passed" | "failed" | "awaiting_review" = "failed";
                                if (lesson.quiz.progress?.passed) {
                                    quizStatus = "passed";
                                } else if (lesson.quiz.progress?.completed && !lesson.quiz.progress?.passed) {
                                    quizStatus = "failed";
                                } else if (lesson.quiz.progress?.awaiting_review || (lesson.quiz.type === "special_fill_in_blank" && lesson.quiz.progress?.completed && !lesson.quiz.progress?.passed)) {
                                    quizStatus = "awaiting_review";
                                }
                                sectionItems.push({
                                    id: sectionItems.length,
                                    lesson_id: lesson.lesson_id,
                                    title: `${lessonIndex + 1}.X แบบทดสอบท้ายบทใหญ่`,
                                    lock: !sectionItems.every(item => item.completed), // ล็อคถ้ายังมี item ที่ไม่เสร็จ
                                    completed:
                                        lesson.quiz.progress?.passed ||
                                        lesson.quiz.progress?.awaiting_review ||
                                        false,
                                    type: "quiz",
                                    quizType: lesson.quiz.type,
                                    duration: lesson.quiz.progress?.passed
                                        ? "100%"
                                        : lesson.quiz.progress?.awaiting_review
                                        ? "50%"
                                        : "0%",
                                    quiz_id: lesson.quiz.quiz_id,
                                    status: quizStatus,
                                });
                            }

                            let count = "";
                            if (lesson.quiz?.progress?.awaiting_review) {
                                count = "รอตรวจ";
                            } else {
                                const allCompleted = sectionItems.every(item => item.completed);
                                count = allCompleted ? "ผ่าน" : "ไม่ผ่าน";
                            }

                            sections.push({
                                id: lesson.lesson_id,
                                subject_id: subject.subject_id,
                                title: `บทที่ ${lessonIndex + 1}: ${lesson.title}`,
                                count: count,
                                items: sectionItems,
                                quiz_id: lesson.quiz ? lesson.quiz.quiz_id : undefined,
                            });
                        } else {
                            // ระบบเดิม - Lesson ปกติ
                            const sectionItems: LessonItem[] = [];
                            sectionItems.push({
                                id: 0,
                                lesson_id: lesson.lesson_id,
                                title: `${lessonIndex + 1}.1 📹 ${lesson.title}`,
                                lock: false,
                                completed: lesson.progress?.video_completed || false,
                                type: "video",
                                quizType: "none",
                                duration: lesson.progress?.video_completed ? "100%" : "0%",
                                video_url: lesson.video_url,
                                quiz_id: lesson.quiz ? lesson.quiz.quiz_id : undefined,
                                status: lesson.progress?.video_completed ? "passed" : "failed",
                            });

                            if (lesson.quiz) {
                                let quizStatus: "passed" | "failed" | "awaiting_review" = "failed";
                                if (lesson.quiz.progress?.passed) {
                                    quizStatus = "passed";
                                } else if (lesson.quiz.progress?.completed && !lesson.quiz.progress?.passed) {
                                    quizStatus = "failed";
                                } else if (lesson.quiz.progress?.awaiting_review || (lesson.quiz.type === "special_fill_in_blank" && lesson.quiz.progress?.completed && !lesson.quiz.progress?.passed)) {
                                    quizStatus = "awaiting_review";
                                }
                                sectionItems.push({
                                    id: 1,
                                    lesson_id: lesson.lesson_id,
                                    title: `${lessonIndex + 1}.2 แบบทดสอบท้ายบท`,
                                    lock: !lesson.progress?.video_completed, // ล็อคถ้า video ยังไม่เสร็จ
                                    completed:
                                        lesson.quiz.progress?.passed ||
                                        lesson.quiz.progress?.awaiting_review ||
                                        false,
                                    type: "quiz",
                                    quizType: lesson.quiz.type,
                                    duration: lesson.quiz.progress?.passed
                                        ? "100%"
                                        : lesson.quiz.progress?.awaiting_review
                                        ? "50%"
                                        : "0%",
                                    quiz_id: lesson.quiz.quiz_id,
                                    status: quizStatus,
                                });
                            }

                            let count = "";
                            if (lesson.quiz?.progress?.awaiting_review) {
                                count = "รอตรวจ";
                            } else {
                                if (lesson.progress?.overall_completed) {
                                    count = "ผ่าน";
                                } else {
                                    count = "ไม่ผ่าน";
                                }
                            }

                            sections.push({
                                id: lesson.lesson_id,
                                subject_id: subject.subject_id,
                                title: `บทที่ ${lessonIndex + 1}: ${lesson.title}`,
                                count: count,
                                items: sectionItems,
                                quiz_id: lesson.quiz ? lesson.quiz.quiz_id : undefined,
                            });
                        }
                    });

                                        setLessonData(sections);
                    await updateLessonCompletionStatus(sections);

                    // ตรวจสอบว่ามีแบบทดสอบก่อนเรียนหรือไม่ และตั้งค่าเป็นบทเรียนแรก
                    // ให้รอให้ LessonFaq โหลดข้อมูลแบบทดสอบก่อน แล้วค่อยตั้งค่าบทเรียนแรก
                    // โดยจะตั้งค่าใน useEffect ที่จะทำงานหลังจาก subjectQuizzes โหลดเสร็จ
                } else {
                    console.log("ไม่พบบทเรียนในวิชานี้");
                }
            } else {
                console.error("ไม่สามารถโหลดข้อมูลหลักสูตรได้");
            }
        } catch (error) {
            console.error("Error fetching course data:", error);
        }
    }, [courseId, API_URL]);

    // โหลดข้อมูลแบบทดสอบก่อน/หลังเรียน (ใช้ useCallback เพื่อป้องกัน re-creation)
    const fetchSubjectQuizzes = useCallback(async () => {
        if (!currentSubjectId) return;

        console.log("📚 เริ่มโหลดข้อมูลแบบทดสอบสำหรับ subjectId:", currentSubjectId);

        try {
            const response = await axios.get(
                `${API_URL}/api/learn/subject/${currentSubjectId}/quizzes`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.data.success) {
                const quizzes: any[] = [];
                // --- ดึงข้อมูล big pre/post test ---
                let bigPreTestCompleted = false;
                if (response.data.pre_test) {
                    const bigPreTest = response.data.pre_test;
                    bigPreTestCompleted = bigPreTest.progress?.passed || false;
                    console.log("📝 พบแบบทดสอบก่อนเรียน:", bigPreTest.title, "Status:", bigPreTest.progress?.status);
                    quizzes.push({
                        quiz_id: bigPreTest.quiz_id,
                        title: bigPreTest.title || "แบบทดสอบก่อนเรียนใหญ่",
                        description: bigPreTest.description,
                        type: "big_pre_test", // แยกจาก pre-test ของแต่ละบทเรียน
                        locked: false,
                        completed: bigPreTest.progress?.completed || false,
                        passed: bigPreTest.progress?.passed || false,
                        status: bigPreTest.progress?.awaiting_review ? "awaiting_review" :
                                bigPreTest.progress?.passed ? "passed" :
                                bigPreTest.progress?.completed ? "failed" : "not_started",
                        score: bigPreTest.progress?.score,
                        max_score: bigPreTest.progress?.max_score,
                    });
                } else {
                    console.log("⚠️ ไม่พบแบบทดสอบก่อนเรียน");
                }
                
                // --- เช็คว่าทุกบทเรียนผ่านหรือยัง ---
                let allLessonsPassed = true;
                let totalItems = 0;
                let completedItems = 0;
                
                if (lessonData.length > 0) {
                    for (const section of lessonData) {
                        // นับทุก item ใน section (ไม่ว่าจะมี quiz หรือไม่)
                        for (const item of section.items) {
                            totalItems++;
                            if (item.completed) completedItems++;
                        }
                    }
                    
                    // ตรวจสอบว่าเรียนผ่านครบ 90% หรือไม่
                    const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                    
                    // ต้องผ่านอย่างน้อย 90% ของทั้งหมด
                    if (overallProgress < 90) {
                        allLessonsPassed = false;
                    }
                    
                    console.log("🔒 Post-test unlock check:", {
                        bigPreTestCompleted: bigPreTestCompleted,
                        overallProgress: `${overallProgress.toFixed(1)}% (${completedItems}/${totalItems})`,
                        allLessonsPassed,
                        totalSections: lessonData.length,
                        debug: {
                            totalSections: lessonData.length,
                            allItems: lessonData.map(section => ({
                                sectionTitle: section.title,
                                items: section.items.map(item => ({
                                    title: item.title,
                                    type: item.type,
                                    completed: item.completed
                                }))
                            }))
                        }
                    });
                }
                
                // --- post test ---
                if (response.data.post_test) {
                    const postTest = response.data.post_test;
                                    // ล็อค posttest ถ้า big pretest ยังไม่ผ่าน หรือ บทเรียนยังไม่ผ่านครบ
                let locked = false;
                if (!bigPreTestCompleted || !allLessonsPassed) {
                    locked = true;
                }
                    
                    console.log("🔒 Post-test locking decision:", {
                        bigPreTestCompleted: bigPreTestCompleted,
                        allLessonsPassed,
                        locked,
                        postTestId: postTest.quiz_id
                    });
                    
                    quizzes.push({
                        quiz_id: postTest.quiz_id,
                        title: postTest.title || "แบบทดสอบหลังเรียน",
                        description: postTest.description,
                        type: "post_test",
                        locked,
                        completed: postTest.progress?.completed || false,
                        passed: postTest.progress?.passed || false,
                        status: postTest.progress?.awaiting_review ? "awaiting_review" :
                                postTest.progress?.passed ? "passed" :
                                postTest.progress?.completed ? "failed" : "not_started",
                        score: postTest.progress?.score,
                        max_score: postTest.progress?.max_score,
                    });
                }
                setSubjectQuizzes(quizzes);
                console.log("✅ โหลดข้อมูลแบบทดสอบเสร็จสิ้น:", quizzes.length, "รายการ");
            }
        } catch (error) {
            console.error("Error fetching subject quizzes:", error);
            setSubjectQuizzes([]);
        }
    }, [currentSubjectId, API_URL, lessonData]);

    // ✅ Task 3: โหลดข้อมูลอาจารย์ประจำหลักสูตร
    const fetchInstructors = useCallback(async () => {
        console.log("🎓 Fetching instructors for courseId:", courseId);
        try {
            const response = await axios.get(
                `${API_URL}/api/courses/${courseId}/instructors`
            );
            
            console.log("🎓 Instructors API response:", response.data);
            
            if (response.data.success) {
                console.log("🎓 Setting instructors:", response.data.instructors);
                setInstructors(response.data.instructors);
            }
        } catch (error) {
            console.error("❌ Error fetching instructors:", error);
            setInstructors([]);
        }
    }, [courseId, API_URL]);

    // ✅ Task 5: ลบ fetchPaymentStatus function
    // const fetchPaymentStatus = useCallback(async () => {
    //     if (!currentSubjectId) return;

    //     try {
    //         const response = await axios.get(
    //             `${API_URL}/api/learn/subject/${currentSubjectId}/payment-status`,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //                 },
    //             }
    //         );

    //         if (response.data.success) {
    //             setPaymentStatus(response.data);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching payment status:", error);
    //         setPaymentStatus(null);
    //     }
    // }, [currentSubjectId, API_URL]);

    // // ✅ Task 2: หาบทเรียนล่าสุดที่ยังไม่ได้เรียน
    // const findNextUncompletedLesson = () => {
    //     // หาบทเรียนแรกที่ยังไม่เสร็จ
    //     for (let sectionIndex = 0; sectionIndex < lessonData.length; sectionIndex++) {
    //         const section = lessonData[sectionIndex];
    //         for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
    //             const item = section.items[itemIndex];
    //             // หาบทเรียนที่ยังไม่เสร็จและไม่ถูกล็อค
    //             if (!item.completed && !item.lock) {
    //                 console.log(`🎯 Found next uncompleted lesson: ${item.title} (${item.type})`);
    //                 return {
    //                     section,
    //                     item,
    //                     sectionIndex,
    //                     itemIndex
    //                 };
    //             }
    //         }
    //     }
        
    //     // ถ้าทุกบทเรียนเสร็จแล้ว ให้ตรวจสอบแบบทดสอบหลังเรียน
    //     const postTest = subjectQuizzes.find(q => q.type === "post_test");
    //     if (postTest && !postTest.completed && !postTest.locked) {
    //         console.log("🎯 All lessons completed, post-test is available");
    //         return {
    //             isPostTest: true,
    //             postTest
    //         };
    //     } else if (postTest && postTest.locked) {
    //         console.log("🔒 Post-test is locked - checking requirements...");
            
    //         // ตรวจสอบว่า pre-test ผ่านหรือยัง
    //         const preTest = subjectQuizzes.find(q => q.type === "pre_test");
    //         if (preTest && !preTest.completed) {
    //             console.log("🔒 Post-test locked: Pre-test not completed");
    //         }
            
    //         // ตรวจสอบ progress ของ video และ quiz
    //         let totalVideoItems = 0;
    //         let completedVideoItems = 0;
    //         let totalQuizItems = 0;
    //         let completedQuizItems = 0;
            
    //         lessonData.forEach(section => {
    //             section.items.forEach(item => {
    //                 if (item.type === "video") {
    //                     totalVideoItems++;
    //                     if (item.completed) completedVideoItems++;
    //                 } else if (item.type === "quiz") {
    //                     totalQuizItems++;
    //                     if (item.completed) completedQuizItems++;
    //                 }
    //             });
    //         });
            
    //         const videoProgress = totalVideoItems > 0 ? (completedVideoItems / totalVideoItems) * 100 : 0;
    //         const quizProgress = totalQuizItems > 0 ? (completedQuizItems / totalQuizItems) * 100 : 0;
            
    //         console.log("🔒 Post-test locked: Progress check", {
    //             videoProgress: `${videoProgress.toFixed(1)}% (${completedVideoItems}/${totalVideoItems})`,
    //             quizProgress: `${quizProgress.toFixed(1)}% (${completedQuizItems}/${totalQuizItems})`,
    //             required: "90% for both video and quiz"
    //         });
    //     }
        
    //     console.log("🎯 All content completed!");
    //     return null; // ทุกอย่างเสร็จหมดแล้ว
    // };

    // ตั้งค่าบทเรียนแรก
    const setInitialLesson = () => {
        if (initialLessonSet) return;

        console.log("🎯 setInitialLesson เริ่มทำงาน");
        console.log("📚 subjectQuizzes:", subjectQuizzes);
        console.log("📖 lessonData:", lessonData);

        // ✅ เพิ่มการป้องกันไม่ให้ setInitialLesson ถูกเรียกซ้ำ
        // เมื่ออยู่ใน big pre-test และกดปุ่ม "บทเรียนถัดไป"
        if (currentLessonId && currentLessonId.startsWith("-1000-")) {
            console.log("🎯 ป้องกันการเรียก setInitialLesson ซ้ำเมื่ออยู่ใน big pre-test");
            return;
        }
        
        // ✅ เพิ่มการป้องกันไม่ให้ setInitialLesson ถูกเรียกซ้ำ
        // เมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน
        if (currentLessonId && currentLessonId.includes("-")) {
            console.log("🎯 ป้องกันการเรียก setInitialLesson ซ้ำเมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน");
            return;
        }

        // ✅ ตั้งค่าแบบทดสอบก่อนเรียนเป็นบทเรียนแรกเสมอ
        const bigPreTest = subjectQuizzes.find(q => q.type === "big_pre_test");
        
        // ✅ เพิ่มการตรวจสอบ flag ว่าได้ออกจาก Big Pre-test แล้วหรือไม่
        const hasLeftBigPreTest = localStorage.getItem('hasLeftBigPreTest') === 'true';
        
        if (bigPreTest && !hasLeftBigPreTest) {
            console.log("🎯 ตั้งค่าแบบทดสอบก่อนเรียนเป็นบทเรียนแรกเสมอ:", bigPreTest.title);
            // ✅ ไม่ต้อง reset YouTube ID ที่นี่
            setCurrentLessonId(`-1000-${bigPreTest.quiz_id}`);
            setCurrentLesson(bigPreTest.title);
            setCurrentView("quiz");
            setCurrentLessonData({
                id: bigPreTest.quiz_id,
                lesson_id: 0,
                title: bigPreTest.title,
                lock: false,
                completed: bigPreTest.completed || false,
                type: "quiz",
                quizType: "special",
                duration: bigPreTest.completed ? "100%" : "0%",
                quiz_id: bigPreTest.quiz_id,
                status: bigPreTest.status || "not_started"
            });
            setCurrentQuizData(null);
            // อัปเดต sidebarActiveAccordion ให้ตรงกับแบบทดสอบก่อนเรียนใหญ่
            setSidebarActiveAccordion(-1000);
        } else if (bigPreTest && hasLeftBigPreTest) {
            console.log("🎯 ข้าม Big Pre-test เพราะได้ออกจากแล้ว - ไปบทเรียนแรกแทน");
            // ข้าม Big Pre-test และไปบทเรียนแรกแทน
        } else {
            // ✅ ถ้าไม่มีแบบทดสอบก่อนเรียน ให้หาบทเรียนแรกที่สามารถเรียนได้ (ไม่ถูกล็อค)
            let foundLesson = false;
            
            for (let sectionIndex = 0; sectionIndex < lessonData.length; sectionIndex++) {
                const section = lessonData[sectionIndex];
                for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
                    const item = section.items[itemIndex];
                    // หาบทเรียนแรกที่ไม่ถูกล็อค (ไม่ต้องตรวจสอบ completed)
                    if (!item.lock) {
                        console.log(`🎯 ตั้งค่าบทเรียนแรกที่สามารถเรียนได้: ${item.title}`);
                        
                        // ✅ ไม่ต้อง reset YouTube ID ที่นี่
                        setCurrentLessonId(`${section.id}-${item.id}`);
                        setCurrentLesson(item.title);
                        setCurrentView(item.type);
                        setCurrentLessonData({
                            ...item,
                            quiz_id: item.type === "quiz" ? item.quiz_id : section.quiz_id,
                            big_lesson_id: section.id,
                        });

                        // ✅ ตั้งค่า YouTube ID ให้ถูกต้องสำหรับวิดีโอทันที
                        if (item.type === "video" && item.video_url) {
                            const videoId = extractYoutubeId(item.video_url);
                            if (videoId) {
                                setYoutubeId(videoId);
                                console.log("🎥 ตั้งค่า YouTube ID สำหรับวิดีโอ:", videoId);
                            } else {
                                console.log("⚠️ ไม่สามารถสกัด YouTube ID จาก URL:", item.video_url);
                            }
                        }

                        if (item.type === "quiz" && courseData) {
                            const lesson = courseData.subjects[0]?.lessons.find(
                                (l) => l.lesson_id === section.id
                            );
                            
                            if (lesson && lesson.is_big_lesson) {
                                const subLesson = lesson.sub_lessons?.find(
                                    (sl: any) => sl.lesson_id === section.id
                                );
                                if (subLesson && subLesson.quiz) {
                                    setCurrentQuizData(subLesson.quiz);
                                } else if (lesson.quiz && lesson.quiz.quiz_id === item.quiz_id) {
                                    setCurrentQuizData(lesson.quiz);
                                }
                            } else if (lesson && lesson.quiz) {
                                setCurrentQuizData(lesson.quiz);
                            }
                        }
                        
                        // อัปเดต sidebarActiveAccordion ให้ตรงกับ section ที่เลือก
                        setSidebarActiveAccordion(section.id);
                        
                        foundLesson = true;
                        break;
                    }
                }
                if (foundLesson) break;
            }
            
            // ถ้าไม่พบบทเรียนที่สามารถเรียนได้ ให้ตรวจสอบแบบทดสอบหลังเรียน
            if (!foundLesson) {
                const postTest = subjectQuizzes.find(q => q.type === "post_test");
                if (postTest && !postTest.locked) {
                    console.log("🎯 ตั้งค่าแบบทดสอบหลังเรียนเป็นบทเรียนแรก");
                    
                    // ✅ ไม่ต้อง reset YouTube ID ที่นี่
                    setCurrentLessonId(`-2000-${postTest.quiz_id}`);
                    setCurrentLesson(postTest.title);
                    setCurrentView("quiz");
                    setCurrentLessonData({
                        id: postTest.quiz_id,
                        lesson_id: 0,
                        title: postTest.title,
                        lock: false,
                        completed: postTest.completed || false,
                        type: "quiz",
                        quizType: "special",
                        duration: postTest.completed ? "100%" : "0%",
                        quiz_id: postTest.quiz_id,
                        status: postTest.status || "not_started"
                    });
                    setCurrentQuizData(null);
                    // อัปเดต sidebarActiveAccordion ให้ตรงกับแบบทดสอบหลังเรียน
                    setSidebarActiveAccordion(-2000);
                } else if (lessonData.length > 0 && lessonData[0].items.length > 0) {
                    // Fallback: ใช้บทเรียนแรก
                    console.log("🎯 Fallback - ใช้บทเรียนแรก");
                    const firstSection = lessonData[0];
                    const firstItem = firstSection.items[0];
                    // ✅ ไม่ต้อง reset YouTube ID ที่นี่
                    setCurrentLessonId(`${firstSection.id}-${firstItem.id}`);
                    setCurrentLesson(firstItem.title);
                    setCurrentView(firstItem.type);
                    setCurrentLessonData({
                        ...firstItem,
                        quiz_id: firstSection.quiz_id,
                        big_lesson_id: firstSection.id,
                    });

                    // ✅ ตั้งค่า YouTube ID ให้ถูกต้องสำหรับวิดีโอทันที
                    if (firstItem.type === "video" && firstItem.video_url) {
                        const videoId = extractYoutubeId(firstItem.video_url);
                        if (videoId) {
                            setYoutubeId(videoId);
                            console.log("🎥 ตั้งค่า YouTube ID สำหรับ fallback:", videoId);
                        } else {
                            console.log("⚠️ ไม่สามารถสกัด YouTube ID จาก fallback URL:", firstItem.video_url);
                            setYoutubeId(""); // Set to empty if URL is bad
                        }
                    } else if (firstItem.type === "quiz") {
                        setYoutubeId(""); // Explicitly clear youtubeId for quizzes
                    }

                    if (firstSection.quiz_id) {
                        const firstLesson = courseData?.subjects[0]?.lessons[0];
                        if (firstLesson?.quiz) {
                            setCurrentQuizData(firstLesson.quiz);
                        }
                    }
                    
                    // อัปเดต sidebarActiveAccordion ให้ตรงกับ section แรก
                    setSidebarActiveAccordion(firstSection.id);
                }
            }
        }
        
        console.log("✅ setInitialLesson เสร็จสิ้น");
        setInitialLessonSet(true);
    };

    useEffect(() => {
        const initializeData = async () => {
            try {
                console.log("🚀 เริ่มต้น initializeData สำหรับ courseId:", courseId, "subjectId:", subjectId);
                setLoading(true);
                
                // Reset states เมื่อเปลี่ยนวิชา
                setInitialLessonSet(false);
                setSubjectQuizzes([]);
                setCurrentLessonId("");
                setCurrentLesson("");
                setCurrentView("video");
                setCurrentLessonData(null);
                setCurrentQuizData(null);
                // ✅ ไม่ต้อง reset YouTube ID ที่นี่
                setSidebarActiveAccordion(null);
                // ✅ Reset progress และ status states
                setProgress(0);
                
                // ✅ ล้าง flag เมื่อเปลี่ยนวิชา
                localStorage.removeItem('hasLeftBigPreTest');
                
                console.log("🔄 Reset states เสร็จสิ้น");
                
                // โหลดข้อมูลใหม่
                await Promise.all([
                    fetchCourseData(),
                    fetchInstructors()
                ]);
                
                console.log("✅ โหลดข้อมูลเสร็จสิ้น");
                
            } catch (error) {
                console.error("Error initializing data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        initializeData();
    }, [courseId, subjectId, fetchCourseData, fetchInstructors]);

    // โหลดความคืบหน้าของวิชาเมื่อมีการเปลี่ยนวิชา (ใช้ useCallback เพื่อป้องกัน re-creation)
    const fetchSubjectProgress = useCallback(async () => {
        if (!currentSubjectId) return;

        try {
            const response = await axios.get(
                `${API_URL}/api/learn/subject/${currentSubjectId}/progress`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.data.success) {
                const { progressPercentage } = response.data;
                setProgress(progressPercentage || 0);
            }
        } catch (error) {
            console.error("Error fetching subject progress:", error);
        }
    }, [currentSubjectId, API_URL]);
    useEffect(() => {
        fetchSubjectProgress();
    }, [currentSubjectId]);

    // โหลดข้อมูลแบบทดสอบเมื่อ subjectId เปลี่ยน
    useEffect(() => {
        if (currentSubjectId) {
            console.log("🔄 เริ่มโหลดข้อมูลแบบทดสอบเมื่อ subjectId เปลี่ยน:", currentSubjectId);
            Promise.allSettled([
                fetchSubjectQuizzes()
                // ✅ Task 5: ลบการเรียก fetchPaymentStatus
                // fetchPaymentStatus()
            ]).then(results => {
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        console.error(`Error in subject data loading ${index}:`, result.reason);
                    }
                });
                console.log("✅ การโหลดข้อมูลแบบทดสอบเสร็จสิ้น");
            });
        }
    }, [currentSubjectId]);

    // ปรับสูตร progress bar ให้นับ pre/post test และทั้ง video/quiz
    useEffect(() => {
        // ต้องรอให้ subjectQuizzes และ lessonData โหลดเสร็จ
        if (!lessonData || lessonData.length === 0) return;
        
        let calculatedProgress = 0;
        const bigPreTest = subjectQuizzes.find(q => q.type === "big_pre_test");
        const postTest = subjectQuizzes.find(q => q.type === "post_test");
        
        // คำนวณ progress ของ big pre-test และ post-test (10% + 10% = 20%)
        if (bigPreTest && bigPreTest.completed) calculatedProgress += 10;
        if (postTest && postTest.completed) calculatedProgress += 10;
        
        // คำนวณ progress ของทุก item ในบทเรียน (80%)
        let totalItems = 0;
        let completedItems = 0;
        
        lessonData.forEach(section => {
            // นับทุก item ใน section (ไม่ว่าจะมี quiz หรือไม่)
            section.items.forEach(item => {
                totalItems++;
                if (item.completed) completedItems++;
            });
        });
        
        // คำนวณ progress ของบทเรียนทั้งหมด
        const lessonProgress = totalItems > 0 ? (completedItems / totalItems) * 80 : 0; // 80% สำหรับบทเรียนทั้งหมด
        
        const newProgress = calculatedProgress + lessonProgress;
        
        // ป้องกันการ update progress ที่ไม่จำเป็น
        if (Math.abs(newProgress - progress) > 0.1) {
            console.log("📊 Progress calculation:", {
                bigPreTest: bigPreTest?.completed ? 10 : 0,
                postTest: postTest?.completed ? 10 : 0,
                lessonProgress: `${completedItems}/${totalItems} = ${lessonProgress.toFixed(1)}%`,
                totalProgress: newProgress.toFixed(1) + "%"
            });
            
            setProgress(newProgress);
        }
    }, [lessonData, subjectQuizzes, progress]);

    // ตั้งค่าบทเรียนแรกเมื่อข้อมูลพร้อม
    useEffect(() => {
        if (!loading && lessonData.length > 0 && !initialLessonSet) {
            // ✅ เพิ่มการป้องกันไม่ให้ setInitialLesson ถูกเรียกซ้ำ
            // เมื่ออยู่ใน big pre-test และกดปุ่ม "บทเรียนถัดไป"
            if (currentLessonId && currentLessonId.startsWith("-1000-")) {
                console.log("🎯 ป้องกันการเรียก setInitialLesson ซ้ำเมื่ออยู่ใน big pre-test (useEffect 1)");
                return;
            }
            
            // ✅ เพิ่มการป้องกันไม่ให้ setInitialLesson ถูกเรียกซ้ำ
            // เมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน
            if (currentLessonId && currentLessonId.includes("-")) {
                console.log("🎯 ป้องกันการเรียก setInitialLesson ซ้ำเมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน");
                return;
            }
            
            // ถ้าไม่มีข้อมูลแบบทดสอบเลย ให้ตั้งค่าบทเรียนแรก
            if (subjectQuizzes.length === 0) {
                setInitialLesson();
            }
        }
    }, [loading, lessonData, subjectQuizzes, initialLessonSet]);

    // useEffect สำหรับดึงข้อมูลคะแนน
    useEffect(() => {
        if (currentSubjectId) {
            fetchScoreItems();
        }
    }, [currentSubjectId, fetchScoreItems]);



    // ✅ เพิ่ม useEffect สำหรับ reset state เมื่อ currentLessonId เปลี่ยน
    useEffect(() => {
        // Reset state เมื่อเปลี่ยนบทเรียน
        if (currentLessonId) {
            console.log("🔄 Reset state เมื่อเปลี่ยนบทเรียน:", currentLessonId);
            
            // ✅ เพิ่มการป้องกันการ reset state ซ้ำเมื่ออยู่ใน big pre-test
            if (currentLessonId.startsWith("-1000-")) {
                console.log("🎯 ป้องกันการ reset state เมื่ออยู่ใน big pre-test");
                return;
            }
            
            // ✅ เพิ่มการป้องกันการ reset state ซ้ำเมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน
            if (initialLessonSet && currentLessonId.includes("-")) {
                console.log("🎯 ป้องกันการ reset state เมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน");
                return;
            }
            
            // ✅ เพิ่มการป้องกันการ reset state ซ้ำเมื่อ currentLessonId เป็นค่าว่าง
            if (currentLessonId === "") {
                console.log("🎯 ป้องกันการ reset state เมื่อ currentLessonId เป็นค่าว่าง");
                return;
            }
            
            // ไม่ต้อง reset YouTube ID ที่นี่ เพราะจะถูกตั้งค่าใหม่ใน handleSelectLesson
            // Reset progress เมื่อเปลี่ยนบทเรียน
            setProgress(0);
        }
    }, [currentLessonId, initialLessonSet]);

    // ✅ เพิ่ม useEffect สำหรับ reset state เมื่อ currentLessonData เปลี่ยน
    useEffect(() => {
        // Reset state เมื่อเปลี่ยนข้อมูลบทเรียน
        if (currentLessonData) {
            console.log("🔄 Reset state เมื่อเปลี่ยนข้อมูลบทเรียน:", currentLessonData.title, "Type:", currentLessonData.type);
            
            // ✅ เพิ่มการป้องกันการ reset state ซ้ำเมื่ออยู่ใน big pre-test
            if (currentLessonId && currentLessonId.startsWith("-1000-")) {
                console.log("🎯 ป้องกันการ reset state เมื่ออยู่ใน big pre-test (currentLessonData)");
                return;
            }
            
            // ✅ เพิ่มการป้องกันการ reset state ซ้ำเมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน
            if (initialLessonSet && currentLessonId && currentLessonId.includes("-")) {
                console.log("🎯 ป้องกันการ reset state เมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน (currentLessonData)");
                return;
            }
            
            // ไม่ต้อง reset YouTube ID ที่นี่ เพราะจะถูกตั้งค่าใหม่ใน handleSelectLesson
            // Reset progress เมื่อเปลี่ยนข้อมูลบทเรียน
            setProgress(0);
        }
    }, [currentLessonData, currentLessonId, initialLessonSet]);

    // ✅ เพิ่ม useEffect สำหรับ reset state เมื่อ currentQuizData เปลี่ยน
    useEffect(() => {
        // Reset state เมื่อเปลี่ยนข้อมูลแบบทดสอบ
        if (currentQuizData) {
            console.log("🔄 Reset state เมื่อเปลี่ยนข้อมูลแบบทดสอบ");
            
            // ✅ เพิ่มการป้องกันการ reset state ซ้ำเมื่ออยู่ใน big pre-test
            if (currentLessonId && currentLessonId.startsWith("-1000-")) {
                console.log("🎯 ป้องกันการ reset state เมื่ออยู่ใน big pre-test (currentQuizData)");
                return;
            }
            
            // ✅ เพิ่มการป้องกันการ reset state ซ้ำเมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน
            if (initialLessonSet && currentLessonId && currentLessonId.includes("-")) {
                console.log("🎯 ป้องกันการ reset state เมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน (currentQuizData)");
                return;
            }
            
            // ไม่ต้อง reset YouTube ID ที่นี่ เพราะจะถูกตั้งค่าใหม่ใน handleSelectLesson
            // Reset progress เมื่อเปลี่ยนข้อมูลแบบทดสอบ
            setProgress(0);
        }
    }, [currentQuizData, currentLessonId, initialLessonSet]);





    // ตั้งค่าบทเรียนแรกเมื่อข้อมูลแบบทดสอบโหลดเสร็จ
    useEffect(() => {
        if (!loading && lessonData.length > 0 && subjectQuizzes.length > 0 && !initialLessonSet) {
            // ✅ เพิ่มการป้องกันไม่ให้ setInitialLesson ถูกเรียกซ้ำ
            // เมื่ออยู่ใน big pre-test และกดปุ่ม "บทเรียนถัดไป"
            if (currentLessonId && currentLessonId.startsWith("-1000-")) {
                console.log("🎯 ป้องกันการเรียก setInitialLesson ซ้ำเมื่ออยู่ใน big pre-test (useEffect 2)");
                return;
            }
            
            // ✅ เพิ่มการป้องกันไม่ให้ setInitialLesson ถูกเรียกซ้ำ
            // เมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน
            if (currentLessonId && currentLessonId.includes("-")) {
                console.log("🎯 ป้องกันการเรียก setInitialLesson ซ้ำเมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน (useEffect 2)");
                return;
            }
            
            console.log("🎯 ข้อมูลพร้อมแล้ว เริ่มตั้งค่าบทเรียนแรก");
            setInitialLesson();
        }
    }, [subjectQuizzes, loading, lessonData, initialLessonSet]);

    // ✅ เพิ่ม useEffect สำหรับตั้งค่าบทเรียนแรกเมื่อข้อมูลพร้อม (fallback)
    useEffect(() => {
        if (!loading && lessonData.length > 0 && !initialLessonSet) {
            // ✅ เพิ่มการป้องกันไม่ให้ setInitialLesson ถูกเรียกซ้ำ
            // เมื่ออยู่ใน big pre-test และกดปุ่ม "บทเรียนถัดไป"
            if (currentLessonId && currentLessonId.startsWith("-1000-")) {
                console.log("🎯 ป้องกันการเรียก setInitialLesson ซ้ำเมื่ออยู่ใน big pre-test (useEffect 3)");
                return;
            }
            
            // ✅ เพิ่มการป้องกันไม่ให้ setInitialLesson ถูกเรียกซ้ำ
            // เมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน
            if (currentLessonId && currentLessonId.includes("-")) {
                console.log("🎯 ป้องกันการเรียก setInitialLesson ซ้ำเมื่ออยู่ในระหว่างการเปลี่ยนบทเรียน (useEffect 3)");
                return;
            }
            
            // ถ้าไม่มีข้อมูลแบบทดสอบเลย ให้ตั้งค่าบทเรียนแรก
            if (subjectQuizzes.length === 0) {
                console.log("🎯 ไม่มีข้อมูลแบบทดสอบ ใช้ fallback");
                setInitialLesson();
            }
        }
    }, [loading, lessonData, subjectQuizzes, initialLessonSet]);

    // อัปเดตสถานะการเรียนจบของแต่ละบทเรียน
    const updateLessonCompletionStatus = async (data: SectionData[]) => {
        try {
            let hasChanges = false;
            const updatedLessonData = [...data];

            // สร้าง array ของ promises เพื่อเรียก API พร้อมกัน
            const videoProgressPromises: Promise<{ sectionIndex: number; itemIndex: number; progress: any }>[] = [];

            updatedLessonData.forEach((section, sectionIndex) => {
                section.items.forEach((item, itemIndex) => {
                    if (item.type === "video") {
                        const promise = axios.get(
                            `${API_URL}/api/learn/lesson/${item.lesson_id}/video-progress`,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                            }
                        ).then(response => ({
                            sectionIndex,
                            itemIndex,
                            progress: response.data.success ? response.data.progress : null
                        })).catch(error => {
                            console.error(`Error fetching progress for lesson ${item.lesson_id}:`, error);
                            return { sectionIndex, itemIndex, progress: null };
                        });
                        
                        videoProgressPromises.push(promise);
                    }
                });
            });

            // รอให้ทุก API call เสร็จ
            const progressResults = await Promise.allSettled(videoProgressPromises);

            // อัปเดต state ตามผลลัพธ์
            progressResults.forEach((result) => {
                if (result.status === 'fulfilled' && result.value.progress) {
                    const { sectionIndex, itemIndex, progress } = result.value;
                    const item = updatedLessonData[sectionIndex].items[itemIndex];
                    const newCompleted = progress.video_completed;
                    
                    if (item.completed !== newCompleted) {
                        item.completed = newCompleted;
                        item.duration = newCompleted ? "100%" : "0%";
                        item.status = newCompleted ? "passed" : "failed";
                        hasChanges = true;
                        
                        // ปลดล็อค quiz ถัดไปใน section เดียวกัน
                        const nextItem = updatedLessonData[sectionIndex].items.find(
                            (i) => i.id === item.id + 1 && i.type === "quiz"
                        );
                        if (nextItem) {
                            nextItem.lock = false;
                            console.log(`🔓 Unlocked quiz: ${nextItem.title} after video completion`);
                        }
                    }
                }
            });

            // อัปเดต section count
            updatedLessonData.forEach((section) => {
                const allCompleted = section.items.every((item) => item.completed);
                const checkAwating = section.items.some((item) => item.status === "awaiting_review");
                const newCount = checkAwating ? "รอตรวจ" : allCompleted ? "ผ่าน" : "ไม่ผ่าน";
                
                if (section.count !== newCount) {
                    section.count = newCount;
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                setLessonData(updatedLessonData);
            }
        } catch (error) {
            console.error("Error in updateLessonCompletionStatus:", error);
        }
    };

    // ฟังก์ชันเมื่อบทเรียนเสร็จสิ้น
    const handleLessonComplete = async () => {
        const [sectionId, itemId] = currentLessonId.split("-").map(Number);
    
        // อัปเดต state ท้องถิ่นก่อน (optimistic update)
        setLessonData((prevLessonData) => {
            const updatedData = prevLessonData.map((section) => {
                if (section.id === sectionId) {
                    const updatedItems = section.items.map((item, index) => {
                        if (item.id === itemId) {
                            const updatedItem = {
                                ...item,
                                completed: true,
                                duration: "100%",
                                status: item.quizType === "special_fill_in_blank" && item.status !== "passed" ? "awaiting_review" : "passed"
                            };
                            
                            // ปลดล็อค item ถัดไปเฉพาะเมื่อ video เสร็จแล้ว
                            if (item.type === "video" && index + 1 < section.items.length) {
                                const nextItem = section.items[index + 1];
                                // ปลดล็อคเฉพาะ quiz ที่อยู่ถัดไป
                                if (nextItem.type === "quiz") {
                                    section.items[index + 1] = {
                                        ...nextItem,
                                        lock: false
                                    };
                                    console.log(`🔓 Unlocked quiz: ${nextItem.title} after video completion`);
                                }
                            }
                            return updatedItem as LessonItem;
                        }
                        return item;
                    });
    
                    const allCompleted = updatedItems.every((item) => item.completed);
                    const checkAwating = updatedItems.some((item) => item.status === "awaiting_review");
    
                    return {
                        ...section,
                        items: updatedItems,
                        count: checkAwating ? "รอตรวจ" : allCompleted ? "ผ่าน" : section.count,
                    };
                }
                return section;
            });

            return updatedData;
        });

        // รอให้ state update เสร็จแล้วค่อย refresh ข้อมูลจาก API
        try {
            await fetchSubjectProgress();
            
            // Refresh ข้อมูลแบบทดสอบและบทเรียนโดยไม่ reset sidebar
            await refreshLessonDataWithoutReset();
            
            console.log("✅ Lesson completed successfully - staying on current lesson");
        } catch (error) {
            console.error("Error refreshing progress:", error);
        }
    };

    // ฟังก์ชันค้นหาและตั้งค่าบทเรียนถัดไป (ใช้ useCallback เพื่อป้องกัน re-creation)
    const findAndSetNextLesson = useCallback((
        currentSectionId: number,
        currentItemId: number,
        updatedData: SectionData[]
    ) => {
        console.log("🔍 Finding next lesson:", { currentSectionId, currentItemId, updatedData });
        
        let foundNext = false;

        // ✅ แก้ไข: ตรวจสอบว่ากำลังอยู่ใน big pre-test หรือไม่
        if (currentSectionId === -1000) {
            console.log("🎯 กำลังอยู่ใน big pre-test - ไปบทเรียนแรกที่สามารถเรียนได้");
            
            // ✅ เพิ่มการป้องกันการ reset state ซ้ำ
            // ตั้งค่า flag เพื่อป้องกันการเรียก setInitialLesson ซ้ำ
            setInitialLessonSet(true);
            
            // ✅ เพิ่มการป้องกันไม่ให้กลับไป Big Pre-test อีก
            // โดยการตั้งค่า flag ว่าได้ออกจาก Big Pre-test แล้ว
            localStorage.setItem('hasLeftBigPreTest', 'true');
            
            // หาบทเรียนแรกที่สามารถเรียนได้ (ไม่ถูกล็อค)
            for (let s = 0; s < updatedData.length; s++) {
                const section = updatedData[s];
                for (let i = 0; i < section.items.length; i++) {
                    const item = section.items[i];
                    if (!item.lock) {
                        console.log(`🎯 ไปบทเรียนแรกที่สามารถเรียนได้: ${item.title}`);
                        
                        // ✅ ตั้งค่า state ทันทีโดยไม่ใช้ setTimeout
                        setCurrentLessonId(`${section.id}-${i}`);
                        setCurrentLesson(item.title);
                        setCurrentView(item.type);
                        setCurrentLessonData({
                            ...item,
                            quiz_id: item.type === "quiz" ? item.quiz_id : section.quiz_id,
                            big_lesson_id: section.id,
                        });

                        // ตั้งค่า YouTube ID สำหรับวิดีโอ
                        if (item.type === "video" && item.video_url) {
                            const videoId = extractYoutubeId(item.video_url);
                            if (videoId) {
                                setYoutubeId(videoId);
                                console.log("🎥 ตั้งค่า YouTube ID สำหรับวิดีโอ:", videoId);
                            } else {
                                console.log("⚠️ ไม่สามารถสกัด YouTube ID จาก URL:", item.video_url);
                                setYoutubeId("");
                            }
                        } else if (item.type === "quiz") {
                            setYoutubeId(""); // Clear YouTube ID สำหรับ quiz
                        }
                        
                        // ตั้งค่า Quiz Data สำหรับแบบทดสอบ
                        if (item.type === "quiz") {
                            setCurrentQuizDataFromLesson(item, section);
                        }
                        
                        // ✅ อัปเดต sidebarActiveAccordion ให้ตรงกับ section ที่เลือก
                        // และป้องกันการกลับไป Big Pre-test อีก
                        setSidebarActiveAccordion(section.id);
                        
                        foundNext = true;
                        break;
                    }
                }
                if (foundNext) break;
            }
            
            // ✅ ถ้าไม่พบบทเรียนที่สามารถเรียนได้ ให้ไป post-test แทน
            if (!foundNext) {
                console.log("🔍 ไม่พบบทเรียนที่สามารถเรียนได้ - ไป post-test แทน");
                const postTest = subjectQuizzes.find(q => q.type === "post_test");
                if (postTest && !postTest.locked) {
                    setCurrentLessonId(`-2000-${postTest.quiz_id}`);
                    setCurrentLesson(postTest.title);
                    setCurrentView("quiz");
                    setYoutubeId("");
                    setCurrentLessonData({
                        id: postTest.quiz_id,
                        lesson_id: 0,
                        title: postTest.title,
                        lock: false,
                        completed: postTest.completed || false,
                        type: "quiz",
                        quizType: "special",
                        duration: postTest.completed ? "100%" : "0%",
                        quiz_id: postTest.quiz_id,
                        status: postTest.status || "not_started"
                    });
                    setCurrentQuizData(null);
                    setSidebarActiveAccordion(-2000);
                    foundNext = true;
                }
            }
            
            return foundNext;
        }

        // ✅ ตรวจสอบว่าบทเรียนปัจจุบันมีแบบทดสอบหรือไม่
        const currentSection = updatedData.find((s) => s.id === currentSectionId);
        const currentItem = currentSection?.items[currentItemId];
        
        if (currentItem && currentItem.type === "video") {
            // ✅ ถ้าบทเรียนปัจจุบันเป็น video ให้ตรวจสอบว่ามีแบบทดสอบหรือไม่
            if (currentItem.quiz_id) {
                console.log("🎯 บทเรียนปัจจุบันมีแบบทดสอบ - ไปทำแบบทดสอบก่อน");
                setCurrentQuizDataFromLesson(currentItem, currentSection);
                setCurrentView("quiz");
                setYoutubeId(""); // Clear YouTube ID สำหรับ quiz
                return true;
            }
        }
        
        // ✅ ถ้าไม่มีแบบทดสอบหรือเป็นแบบทดสอบแล้ว ให้ไปบทเรียนถัดไป
        
        // 1. ค้นหาใน section เดียวกันก่อน (ถ้ามี item ถัดไป)
        if (currentSection && currentItemId + 1 < currentSection.items.length) {
            const nextItem = currentSection.items[currentItemId + 1];
            console.log(`🔍 Checking next item in same section:`, nextItem.title, "Lock:", nextItem.lock, "Complete:", nextItem.completed);
            
            if (!nextItem.lock) {
                if (nextItem.type === "video" && nextItem.video_url) {
                    const videoId = extractYoutubeId(nextItem.video_url);
                    if (videoId) {
                        setCurrentLessonId(`${currentSectionId}-${currentItemId + 1}`);
                        setCurrentLessonData(nextItem);
                        setCurrentView("video");
                        setYoutubeId(videoId);
                        console.log("🎥 ไป item ถัดไปใน section เดียวกัน (video):", nextItem.title);
                        foundNext = true;
                    }
                } else if (nextItem.type === "quiz") {
                    setCurrentLessonId(`${currentSectionId}-${currentItemId + 1}`);
                    setCurrentQuizDataFromLesson(nextItem, currentSection);
                    setCurrentView("quiz");
                    setYoutubeId(""); // Clear YouTube ID สำหรับ quiz
                    console.log("📝 ไป item ถัดไปใน section เดียวกัน (quiz):", nextItem.title);
                    foundNext = true;
                }
            }
        }
        
        // 2. ถ้าไม่มี item ถัดไปใน section เดียวกัน ให้ไป section ถัดไป
        if (!foundNext) {
            console.log("🔍 ไม่มี item ถัดไปใน section เดียวกัน - ไป section ถัดไป");
            
            for (let s = 0; s < updatedData.length; s++) {
                const section = updatedData[s];
                
                // ข้าม section ปัจจุบัน
                if (section.id === currentSectionId) {
                    continue;
                }
                
                // ค้นหา item แรกใน section นี้
                for (let i = 0; i < section.items.length; i++) {
                    const item = section.items[i];
                    console.log(`🔍 Checking section ${section.id}, item ${i}:`, item.title, "Lock:", item.lock, "Complete:", item.completed);
                    
                    if (!item.lock) {
                        if (item.type === "video" && item.video_url) {
                            const videoId = extractYoutubeId(item.video_url);
                            if (videoId) {
                                setCurrentLessonId(`${section.id}-${i}`);
                                setCurrentLessonData(item);
                                setCurrentView("video");
                                setYoutubeId(videoId);
                                console.log("🎥 ไปบทเรียนถัดไป (video):", item.title);
                                foundNext = true;
                                break;
                            }
                        } else if (item.type === "quiz") {
                            setCurrentLessonId(`${section.id}-${i}`);
                            setCurrentQuizDataFromLesson(item, section);
                            setCurrentView("quiz");
                            setYoutubeId(""); // Clear YouTube ID สำหรับ quiz
                            console.log("📝 ไปบทเรียนถัดไป (quiz):", item.title);
                            foundNext = true;
                            break;
                        }
                    }
                }
                
                if (foundNext) break;
            }
        }
        
        // 3. ถ้าไม่พบบทเรียนถัดไป (เป็น lesson สุดท้าย) ให้ไป posttest ใหญ่
        if (!foundNext) {
            console.log("🔍 ไม่พบบทเรียนถัดไป - ไป posttest ใหญ่ของ biglesson");
            
            // ตรวจสอบว่ามีแบบทดสอบหลังเรียนหรือไม่
            const postTest = subjectQuizzes.find(q => q.type === "post_test");
            if (postTest && !postTest.locked) {
                console.log("✅ Found post-test as next content:", postTest.title);
                
                setCurrentLessonId(`-2000-${postTest.quiz_id}`);
                setCurrentLesson(postTest.title);
                setCurrentView("quiz");
                setYoutubeId(""); // Reset YouTube ID สำหรับแบบทดสอบ
                
                setCurrentLessonData({
                    id: postTest.quiz_id,
                    lesson_id: 0,
                    title: postTest.title,
                    lock: false,
                    completed: postTest.completed || false,
                    type: "quiz",
                    quizType: "special",
                    duration: postTest.completed ? "100%" : "0%",
                    quiz_id: postTest.quiz_id,
                    status: postTest.status || "not_started"
                });
                setCurrentQuizData(null);
                
                // อัปเดต sidebarActiveAccordion ให้ตรงกับแบบทดสอบหลังเรียน
                setSidebarActiveAccordion(-2000);
                
                foundNext = true;
            }
        }

        if (!foundNext) {
            console.log("🎉 Course completed! No more lessons or quizzes available.");
            // แสดงข้อความว่าจบหลักสูตรแล้ว
            alert("ยินดีด้วย! คุณได้เรียนจบหลักสูตรนี้แล้ว 🎉");
        }
        
        return foundNext;
    }, [courseData, extractYoutubeId, subjectQuizzes]);

    // ✅ เพิ่มฟังก์ชันใหม่สำหรับการไปบทเรียนถัดไป (lesson ถัดไป) โดยเฉพาะสำหรับแบบทดสอบของแต่ละบท
    const goToNextLesson = useCallback(() => {
        console.log("🚀 goToNextLesson called - going to next lesson (section) instead of next item");
        
        if (!currentLessonId || !lessonData) {
            console.error("❌ Missing currentLessonId or lessonData");
            return;
        }
        
        const [sectionId, itemId] = currentLessonId.split("-").map(Number);
        console.log("🔍 Going to next lesson from section:", sectionId, "item:", itemId);
        
        try {
            // ✅ เพิ่มการป้องกันไม่ให้ setInitialLesson ถูกเรียกซ้ำ
            // เมื่ออยู่ใน big pre-test และกดปุ่ม "บทเรียนถัดไป"
            if (sectionId === -1000) {
                console.log("🎯 ป้องกันการเรียก setInitialLesson ซ้ำเมื่ออยู่ใน big pre-test");
                // ตั้งค่า flag เพื่อป้องกันการ reset state
                setInitialLessonSet(true);
                
                // ✅ เพิ่มการป้องกันไม่ให้กลับไป Big Pre-test อีก
                // โดยการตั้งค่า currentLessonId เป็น null ชั่วคราว
                setCurrentLessonId("");
            }
            
            // ✅ เพิ่มการป้องกันไม่ให้กลับไป Big Pre-test อีก
            // โดยการตรวจสอบ flag ใน localStorage
            const hasLeftBigPreTest = localStorage.getItem('hasLeftBigPreTest') === 'true';
            if (hasLeftBigPreTest && sectionId === -1000) {
                console.log("🎯 ป้องกันการกลับไป Big Pre-test อีก - ไปบทเรียนถัดไปแทน");
                // ไปบทเรียนถัดไปแทนการกลับไป Big Pre-test
                const nextSection = lessonData.find(s => s.id !== -1000);
                if (nextSection) {
                    const firstItem = nextSection.items.find(item => !item.lock);
                    if (firstItem) {
                        setCurrentLessonId(`${nextSection.id}-${firstItem.id}`);
                        setCurrentLesson(firstItem.title);
                        setCurrentView(firstItem.type);
                        setCurrentLessonData({
                            ...firstItem,
                            quiz_id: firstItem.type === "quiz" ? firstItem.quiz_id : nextSection.quiz_id,
                            big_lesson_id: nextSection.id,
                        });
                        setSidebarActiveAccordion(nextSection.id);
                        return;
                    }
                }
            }
            
            findAndSetNextLesson(sectionId, itemId, lessonData);
            console.log("✅ Next lesson navigation completed");
        } catch (error) {
            console.error("❌ Error in goToNextLesson:", error);
        }
    }, [currentLessonId, lessonData, findAndSetNextLesson]);

    // ฟังก์ชันช่วยตั้งค่า Quiz Data
    const setCurrentQuizDataFromLesson = (item: LessonItem, section: SectionData) => {
        if (!courseData) return;
        
        try {
            const lesson = courseData.subjects[0].lessons.find(
                (l) => l.lesson_id === section.id
            );
            
            if (lesson && lesson.is_big_lesson) {
                // Big Lesson - ค้นหาใน Sub Lessons
                const subLesson = lesson.sub_lessons?.find(
                    (sl: any) => sl.lesson_id === item.lesson_id
                );
                
                if (subLesson && subLesson.quiz) {
                    setCurrentQuizData(subLesson.quiz);
                    console.log("📝 Set quiz data from sub lesson:", subLesson.quiz.title);
                } else if (lesson.quiz && lesson.quiz.quiz_id === item.quiz_id) {
                    // Big Lesson Quiz
                    setCurrentQuizData(lesson.quiz);
                    console.log("📝 Set quiz data from big lesson:", lesson.quiz.title);
                }
            } else if (lesson && lesson.quiz) {
                // Lesson ปกติ
                setCurrentQuizData(lesson.quiz);
                console.log("📝 Set quiz data from regular lesson:", lesson.quiz.title);
            }
        } catch (error) {
            console.error("Error setting quiz data:", error);
        }
    };

    // ตรวจสอบว่าบทเรียนปัจจุบันเรียนจบแล้วหรือไม่ (ใช้ useMemo เพื่อหลีกเลี่ยงการคำนวณซ้ำ)
    const getCurrentLessonCompleted = useMemo(() => {
        if (!currentLessonId) return false;
        
        const [sectionId, itemId] = currentLessonId.split("-").map(Number);
        const section = lessonData.find((s) => s.id === sectionId);
        if (section) {
            const item = section.items.find((i) => i.id === itemId);
            return item?.completed || false;
        }
        return false;
    }, [currentLessonId, lessonData]);

       // ฟังก์ชันเมื่อเลือกบทเรียน (ใช้ useCallback เพื่อป้องกัน re-creation)
const handleSelectLesson = useCallback((
    sectionId: number,
    itemId: number,
    title: string,
    type: "video" | "quiz"
) => {
    // ✅ Reset state เมื่อเลือกบทเรียนใหม่
    setCurrentView(type);
    
    // ตรวจสอบว่าเป็นแบบทดสอบพิเศษ (pre/post test) หรือไม่
    if (sectionId < 0) {
        // จัดการแบบทดสอบก่อน/หลังเรียน
        setCurrentLessonId(`${sectionId}-${itemId}`);
        setCurrentLesson(title);
        
        // ✅ Reset YouTube ID สำหรับแบบทดสอบพิเศษ
        setYoutubeId("");
        
        // สร้าง fake lesson data สำหรับแบบทดสอบพิเศษ
        const specialQuizData = {
            id: itemId,
            lesson_id: 0,
            title: title,
            lock: false,
            completed: false,
            type: type,
            quizType: "special",
            duration: "0%",
            quiz_id: itemId,
            status: "not_started" as const
        };
        
        setCurrentLessonData(specialQuizData);
        setCurrentQuizData(null);
        return;
    }

    // จัดการแบบทดสอบ/วิดีโอปกติ
    const section = lessonData.find((s) => s.id === sectionId);
    if (section) {
        const item = section.items.find((i) => i.id === itemId);
        if (item) {
            // ตรวจสอบการล็อค
            if (item.lock) {
                if (item.type === "quiz") {
                    // หา video ที่เกี่ยวข้อง
                    const relatedVideo = section.items.find(i => i.type === "video" && !i.completed);
                    if (relatedVideo) {
                        alert(`กรุณาเรียนวิดีโอบทเรียน "${relatedVideo.title}" ให้เสร็จก่อนทำแบบทดสอบ`);
                    } else {
                        alert("กรุณาเรียนบทก่อนหน้าให้เสร็จก่อนทำแบบทดสอบท้ายบท");
                    }
                } else {
                    alert("บทเรียนนี้ยังไม่พร้อมให้เรียน กรุณาเรียนบทก่อนหน้าให้เสร็จก่อน");
                }
                return;
            }

            setCurrentLessonId(`${sectionId}-${itemId}`);
            setCurrentLesson(item.title);
            setCurrentSubjectId(section.subject_id);
            
            // อัปเดต sidebarActiveAccordion ให้ตรงกับแบบทดสอบที่เลือก
            setSidebarActiveAccordion(sectionId);

            setCurrentLessonData({
                ...item,
                quiz_id: type === "quiz" ? item.quiz_id : section.quiz_id,
                big_lesson_id: section.id,
            });

            // ✅ ตั้งค่า YouTube ID ทันทีเมื่อเลือกบทเรียนวิดีโอ
            if (type === "video" && item.video_url) {
                const videoId = extractYoutubeId(item.video_url);
                if (videoId) {
                    setYoutubeId(videoId);
                    console.log("🎥 ตั้งค่า YouTube ID เมื่อเลือกบทเรียน:", videoId);
                } else {
                    console.log("⚠️ ไม่สามารถสกัด YouTube ID จาก URL:", item.video_url);
                    setYoutubeId("");
                }
            } else if (type === "quiz") {
                // ✅ Reset YouTube ID เมื่อเลือกแบบทดสอบ
                setYoutubeId("");
            }

            if (courseData && type === "quiz" && item.quiz_id) {
                const lesson = courseData.subjects[0].lessons.find(
                    (l) => l.lesson_id === sectionId
                );
                
                if (lesson && lesson.is_big_lesson) {
                    const subLesson = lesson.sub_lessons?.find(
                        (sl) => sl.lesson_id === sectionId
                    );
                    if (subLesson && subLesson.quiz) {
                        setCurrentQuizData(subLesson.quiz);
                    } else if (lesson.quiz && lesson.quiz.quiz_id === item.quiz_id) {
                        setCurrentQuizData(lesson.quiz);
                    }
                } else if (lesson && lesson.quiz) {
                    setCurrentQuizData(lesson.quiz);
                }
            }
        }
    }
}, [lessonData, courseData, extractYoutubeId]);

// Memoized navigation callback สำหรับ onNextLesson
    // ✅ Task 6: ฟังก์ชันไปบทก่อนหน้า
    const handlePreviousLesson = useCallback(() => {
        if (!currentLessonId) return;

        const [currentSectionId, currentItemId] = currentLessonId.split("-").map(Number);
        let foundPrevious = false;

        // ✅ ไม่ต้อง reset YouTube ID ที่นี่

        // หาบทเรียนก่อนหน้า
        for (let sectionIndex = lessonData.length - 1; sectionIndex >= 0; sectionIndex--) {
            const section = lessonData[sectionIndex];
            
            for (let itemIndex = section.items.length - 1; itemIndex >= 0; itemIndex--) {
                const item = section.items[itemIndex];
                
                // ถ้าเจอบทปัจจุบัน ให้หาบทก่อนหน้า
                if (section.id === currentSectionId && item.id === currentItemId) {
                    // หาบทก่อนหน้าที่ไม่ถูกล็อค
                    for (let prevSectionIndex = sectionIndex; prevSectionIndex >= 0; prevSectionIndex--) {
                        const prevSection = lessonData[prevSectionIndex];
                        const startItemIndex = prevSectionIndex === sectionIndex ? itemIndex - 1 : prevSection.items.length - 1;
                        
                        for (let prevItemIndex = startItemIndex; prevItemIndex >= 0; prevItemIndex--) {
                            const prevItem = prevSection.items[prevItemIndex];
                            
                            // ตรวจสอบว่าไม่ถูกล็อค
                            if (!prevItem.lock) {
                                setCurrentLessonId(`${prevSection.id}-${prevItem.id}`);
                                setCurrentLesson(prevItem.title);
                                setCurrentView(prevItem.type);
                                
                                // อัปเดต sidebarActiveAccordion ให้ตรงกับ section ที่เลือก
                                setSidebarActiveAccordion(prevSection.id);
                                
                                // ✅ ตั้งค่า YouTube ID ทันทีเมื่อเปลี่ยนบทเรียน
                                if (prevItem.type === "video" && prevItem.video_url) {
                                    const videoId = extractYoutubeId(prevItem.video_url);
                                    if (videoId) {
                                        setYoutubeId(videoId);
                                        console.log("🎥 ตั้งค่า YouTube ID สำหรับบทก่อนหน้า:", videoId);
                                    } else {
                                        console.log("⚠️ ไม่สามารถสกัด YouTube ID สำหรับบทก่อนหน้า");
                                        setYoutubeId("");
                                    }
                                } else if (prevItem.type === "quiz") {
                                    // ✅ Reset YouTube ID เมื่อเปลี่ยนเป็นแบบทดสอบ
                                    setYoutubeId("");
                                }
                                
                                foundPrevious = true;
                                break;
                            }
                        }
                        
                        if (foundPrevious) break;
                    }
                    
                    if (!foundPrevious) {
                        alert("นี่คือบทเรียนแรกแล้ว");
                    }
                    return;
                }
            }
        }
    }, [currentLessonId, lessonData, courseData, extractYoutubeId]);

const handleNextLesson = useCallback(() => {
        console.log("🚀 handleNextLesson called with currentLessonId:", currentLessonId);
        
        if (!currentLessonId || !lessonData) {
            console.error("❌ Missing currentLessonId or lessonData");
            return;
        }
        
        const [sectionId, itemId] = currentLessonId.split("-").map(Number);
        console.log("🔍 Parsed sectionId:", sectionId, "itemId:", itemId);
        
        // ✅ ไม่ต้อง reset YouTube ID ที่นี่
        
        try {
            findAndSetNextLesson(sectionId, itemId, lessonData);
            console.log("✅ Next lesson navigation completed");
        } catch (error) {
            console.error("❌ Error in handleNextLesson:", error);
        }
        
    }, [currentLessonId, lessonData, findAndSetNextLesson]);

    // ✅ Task 5: ลบ handleUploadSlip function ทั้งหมด
    // const handleUploadSlip = async (file: File) => {
    //     if (!currentSubjectId) return;

    //     try {
    //         const formData = new FormData();
    //         formData.append('slip', file);

    //         const response = await axios.post(
    //             `${API_URL}/api/learn/subject/${currentSubjectId}/upload-slip`,
    //             formData,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //                     'Content-Type': 'multipart/form-data',
    //                 },
    //             }
    //         );

    //         if (response.data.success) {
    //             alert("อัปโหลดสลิปสำเร็จ รอ admin อนุมัติ");
    //             await fetchPaymentStatus(); // รีเฟรชสถานะ
    //         }
    //     } catch (error: any) {
    //         console.error("Error uploading slip:", error);
    //         alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลดสลิป");
    //     }
    // };

    // ฟังก์ชัน refresh ข้อมูลบทเรียนโดยไม่ reset sidebar (สำหรับใช้ใน handleLessonComplete)
    const refreshLessonDataWithoutReset = useCallback(async () => {
        try {
            // เก็บค่า sidebarActiveAccordion ปัจจุบันไว้
            const currentActiveAccordion = sidebarActiveAccordion;
            
            // Refresh ข้อมูลแบบทดสอบและบทเรียน
            await Promise.allSettled([
                // Refresh ข้อมูลแบบทดสอบ (pre-test, post-test) ก่อน
                (async () => {
                    try {
                        if (currentSubjectId) {
                            const response = await axios.get(
                                `${API_URL}/api/learn/subject/${currentSubjectId}/quizzes`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                    },
                                }
                            );

                            if (response.data.success) {
                                const quizzes: any[] = [];
                                // --- ดึงข้อมูล big pre/post test ---
                                let bigPreTestCompleted = false;
                                if (response.data.pre_test) {
                                    const bigPreTest = response.data.pre_test;
                                    bigPreTestCompleted = bigPreTest.progress?.passed || false;
                                    quizzes.push({
                                        quiz_id: bigPreTest.quiz_id,
                                        title: bigPreTest.title || "แบบทดสอบก่อนเรียนใหญ่",
                                        description: bigPreTest.description,
                                        type: "big_pre_test", // แยกจาก pre-test ของแต่ละบทเรียน
                                        locked: false,
                                        completed: bigPreTest.progress?.completed || false,
                                        passed: bigPreTest.progress?.passed || false,
                                        status: bigPreTest.progress?.awaiting_review ? "awaiting_review" :
                                                bigPreTest.progress?.passed ? "passed" :
                                                bigPreTest.progress?.completed ? "failed" : "not_started",
                                        score: bigPreTest.progress?.score,
                                        max_score: bigPreTest.progress?.max_score,
                                    });
                                }
                                
                                // --- เช็คว่าทุกบทเรียนผ่านหรือยัง ---
                                let allLessonsPassed = true;
                                let totalItems = 0;
                                let completedItems = 0;
                                
                                if (lessonData.length > 0) {
                                    for (const section of lessonData) {
                                        // นับทุก item ใน section (ไม่ว่าจะมี quiz หรือไม่)
                                        for (const item of section.items) {
                                            totalItems++;
                                            if (item.completed) completedItems++;
                                        }
                                    }
                                    
                                    // ตรวจสอบว่าเรียนผ่านครบ 90% หรือไม่
                                    const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                                    
                                    // ต้องผ่านอย่างน้อย 90% ของทั้งหมด
                                    if (overallProgress < 90) {
                                        allLessonsPassed = false;
                                    }
                                }
                                
                                // --- post test ---
                                if (response.data.post_test) {
                                    const postTest = response.data.post_test;
                                    // ล็อค posttest ถ้า big pretest ยังไม่ผ่าน หรือ บทเรียนยังไม่ผ่านครบ
                                    let locked = false;
                                    if (!bigPreTestCompleted || !allLessonsPassed) {
                                        locked = true;
                                    }
                                    
                                    quizzes.push({
                                        quiz_id: postTest.quiz_id,
                                        title: postTest.title || "แบบทดสอบหลังเรียน",
                                        description: postTest.description,
                                        type: "post_test",
                                        locked,
                                        completed: postTest.progress?.completed || false,
                                        passed: postTest.progress?.passed || false,
                                        status: postTest.progress?.awaiting_review ? "awaiting_review" :
                                                postTest.progress?.passed ? "passed" :
                                                postTest.progress?.completed ? "failed" : "not_started",
                                        score: postTest.progress?.score,
                                        max_score: postTest.progress?.max_score,
                                    });
                                }
                                setSubjectQuizzes(quizzes);
                                console.log("🔄 Refreshed subject quizzes:", quizzes);
                            }
                        }
                    } catch (error) {
                        console.error("Error refreshing subject quizzes:", error);
                    }
                })(),
                
                // Refresh lesson data โดยไม่ reset sidebar
                (async () => {
                    try {
                        const response = await axios.get(
                            `${API_URL}/api/learn/course/${courseId}/full-content`,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                            }
                        );

                        if (response.data.success && response.data.course) {
                            const subject = response.data.course.subjects.find(
                                (s: any) => s.subject_id === subjectId
                            );

                            if (subject && subject.lessons && subject.lessons.length > 0) {
                                const sections: SectionData[] = [];
                                
                                subject.lessons.forEach((lesson: any, lessonIndex: number) => {
                                    // ใช้ logic เดียวกับ fetchCourseData แต่ไม่ reset states อื่นๆ
                                    if (lesson.is_big_lesson) {
                                        // Big Lesson logic...
                                        const sectionItems: LessonItem[] = [];
                                        
                                        if (lesson.sub_lessons && lesson.sub_lessons.length > 0) {
                                            lesson.sub_lessons.forEach((subLesson: any, subIndex: number) => {
                                                // เพิ่มวิดีโอ Sub Lesson
                                                sectionItems.push({
                                                    id: subIndex * 2,
                                                    lesson_id: subLesson.lesson_id,
                                                    title: `${lessonIndex + 1}.${subIndex + 1} 📹 ${subLesson.title}`,
                                                    lock: false,
                                                    completed: subLesson.progress?.video_completed || false,
                                                    type: "video",
                                                    quizType: "none",
                                                    duration: subLesson.progress?.video_completed ? "100%" : "0%",
                                                    video_url: subLesson.video_url,
                                                    quiz_id: subLesson.quiz ? subLesson.quiz.quiz_id : undefined,
                                                    status: subLesson.progress?.video_completed ? "passed" : "failed",
                                                });

                                                // เพิ่มแบบทดสอบ Sub Lesson (ถ้ามี)
                                                if (subLesson.quiz) {
                                                    let quizStatus: "passed" | "failed" | "awaiting_review" = "failed";
                                                    if (subLesson.quiz.progress?.passed) {
                                                        quizStatus = "passed";
                                                    } else if (subLesson.quiz.progress?.completed && !subLesson.quiz.progress?.passed) {
                                                        quizStatus = "failed";
                                                    } else if (subLesson.quiz.progress?.awaiting_review || (subLesson.quiz.type === "special_fill_in_blank" && subLesson.quiz.progress?.completed && !subLesson.quiz.progress?.passed)) {
                                                        quizStatus = "awaiting_review";
                                                    }
                                                    sectionItems.push({
                                                        id: subIndex * 2 + 1,
                                                        lesson_id: subLesson.lesson_id,
                                                        title: `${lessonIndex + 1}.${subIndex + 1}.2 แบบทดสอบท้ายบท`,
                                                        lock: !subLesson.progress?.video_completed,
                                                        completed:
                                                            subLesson.quiz.progress?.passed ||
                                                            subLesson.quiz.progress?.awaiting_review ||
                                                            false,
                                                        type: "quiz",
                                                        quizType: subLesson.quiz.type,
                                                        duration: subLesson.quiz.progress?.passed
                                                            ? "100%"
                                                            : subLesson.quiz.progress?.awaiting_review
                                                            ? "50%"
                                                            : "0%",
                                                        quiz_id: subLesson.quiz.quiz_id,
                                                        status: quizStatus,
                                                    });
                                                }
                                            });
                                        }

                                        // เพิ่ม Big Lesson Quiz (ถ้ามี)
                                        if (lesson.quiz) {
                                            let quizStatus: "passed" | "failed" | "awaiting_review" = "failed";
                                            if (lesson.quiz.progress?.passed) {
                                                quizStatus = "passed";
                                            } else if (lesson.quiz.progress?.completed && !lesson.quiz.progress?.passed) {
                                                quizStatus = "failed";
                                            } else if (lesson.quiz.progress?.awaiting_review || (lesson.quiz.type === "special_fill_in_blank" && lesson.quiz.progress?.completed && !lesson.quiz.progress?.passed)) {
                                                quizStatus = "awaiting_review";
                                            }
                                            sectionItems.push({
                                                id: sectionItems.length,
                                                lesson_id: lesson.lesson_id,
                                                title: `${lessonIndex + 1}.X แบบทดสอบท้ายบทใหญ่`,
                                                lock: !sectionItems.every(item => item.completed),
                                                completed:
                                                    lesson.quiz.progress?.passed ||
                                                    lesson.quiz.progress?.awaiting_review ||
                                                    false,
                                                type: "quiz",
                                                quizType: lesson.quiz.type,
                                                duration: lesson.quiz.progress?.passed
                                                    ? "100%"
                                                    : lesson.quiz.progress?.awaiting_review
                                                    ? "50%"
                                                    : "0%",
                                                quiz_id: lesson.quiz.quiz_id,
                                                status: quizStatus,
                                            });
                                        }

                                        let count = "";
                                        if (lesson.quiz?.progress?.awaiting_review) {
                                            count = "รอตรวจ";
                                        } else {
                                            const allCompleted = sectionItems.every(item => item.completed);
                                            count = allCompleted ? "ผ่าน" : "ไม่ผ่าน";
                                        }

                                        sections.push({
                                            id: lesson.lesson_id,
                                            subject_id: subject.subject_id,
                                            title: `บทที่ ${lessonIndex + 1}: ${lesson.title}`,
                                            count: count,
                                            items: sectionItems,
                                            quiz_id: lesson.quiz ? lesson.quiz.quiz_id : undefined,
                                        });
                                    } else {
                                        // ระบบเดิม - Lesson ปกติ
                                        const sectionItems: LessonItem[] = [];
                                        sectionItems.push({
                                            id: 0,
                                            lesson_id: lesson.lesson_id,
                                            title: `${lessonIndex + 1}.1 📹 ${lesson.title}`,
                                            lock: false,
                                            completed: lesson.progress?.video_completed || false,
                                            type: "video",
                                            quizType: "none",
                                            duration: lesson.progress?.video_completed ? "100%" : "0%",
                                            video_url: lesson.video_url,
                                            quiz_id: lesson.quiz ? lesson.quiz.quiz_id : undefined,
                                            status: lesson.progress?.video_completed ? "passed" : "failed",
                                        });

                                        if (lesson.quiz) {
                                            let quizStatus: "passed" | "failed" | "awaiting_review" = "failed";
                                            if (lesson.quiz.progress?.passed) {
                                                quizStatus = "passed";
                                            } else if (lesson.quiz.progress?.completed && !lesson.quiz.progress?.passed) {
                                                quizStatus = "failed";
                                            } else if (lesson.quiz.progress?.awaiting_review || (lesson.quiz.type === "special_fill_in_blank" && lesson.quiz.progress?.completed && !lesson.quiz.progress?.passed)) {
                                                quizStatus = "awaiting_review";
                                            }
                                            sectionItems.push({
                                                id: 1,
                                                lesson_id: lesson.lesson_id,
                                                title: `${lessonIndex + 1}.2 แบบทดสอบท้ายบท`,
                                                lock: !lesson.progress?.video_completed,
                                                completed:
                                                    lesson.quiz.progress?.passed ||
                                                    lesson.quiz.progress?.awaiting_review ||
                                                    false,
                                                type: "quiz",
                                                quizType: lesson.quiz.type,
                                                duration: lesson.quiz.progress?.passed
                                                    ? "100%"
                                                    : lesson.quiz.progress?.awaiting_review
                                                    ? "50%"
                                                    : "0%",
                                                quiz_id: lesson.quiz.quiz_id,
                                                status: quizStatus,
                                            });
                                        }

                                        let count = "";
                                        if (lesson.quiz?.progress?.awaiting_review) {
                                            count = "รอตรวจ";
                                        } else {
                                            if (lesson.progress?.overall_completed) {
                                                count = "ผ่าน";
                                            } else {
                                                count = "ไม่ผ่าน";
                                            }
                                        }

                                        sections.push({
                                            id: lesson.lesson_id,
                                            subject_id: subject.subject_id,
                                            title: `บทที่ ${lessonIndex + 1}: ${lesson.title}`,
                                            count: count,
                                            items: sectionItems,
                                            quiz_id: lesson.quiz ? lesson.quiz.quiz_id : undefined,
                                        });
                                    }
                                });
                                
                                setLessonData(sections);
                                await updateLessonCompletionStatus(sections);
                                console.log("🔄 Refreshed lesson data:", sections);
                            }
                        }
                    } catch (error) {
                        console.error("Error refreshing lesson data:", error);
                    }
                })()
            ]);
            
            // คืนค่า sidebarActiveAccordion กลับมา
            setTimeout(() => {
                setSidebarActiveAccordion(currentActiveAccordion);
                console.log("🔄 Restored sidebarActiveAccordion:", currentActiveAccordion);
            }, 100);
            
        } catch (error) {
            console.error("Error in refreshLessonDataWithoutReset:", error);
        }
    }, [sidebarActiveAccordion, currentSubjectId, lessonData, courseId, subjectId, API_URL]);

    // ฟังก์ชัน refresh progress/lesson/subject (ใช้ useCallback เพื่อป้องกัน re-creation)  
    const refreshProgress = useCallback(async () => {
        try {
            setLoading(true);
            
            // ใช้ Promise.allSettled เพื่อให้ทุก API call ทำงานพร้อมกัน
            const results = await Promise.allSettled([
                fetchCourseData(),
                fetchSubjectProgress(), 
                // ✅ Task 5: ลบการเรียก fetchPaymentStatus
                // fetchPaymentStatus(),
                fetchSubjectQuizzes(),
                fetchInstructors()
            ]);
            
            // ตรวจสอบ error และ log ออกมา
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Error in refreshProgress function ${index}:`, result.reason);
                }
            });
            
        } catch (error) {
            console.error("Error in refreshProgress:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchCourseData, fetchSubjectProgress, fetchSubjectQuizzes, fetchInstructors]); // ✅ Task 5: ลบ fetchPaymentStatus dependency

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <section className="lesson__area section-pb-120">
            <div className="container-fluid">
                <div className="row gx-4">
                    {/* Sidebar Skeleton */}
                    <div className="col-xl-3 col-lg-4 lesson__sidebar">
                        <div className="lesson__content">
                            <div className="skeleton-title" style={{height: '24px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '20px'}}></div>
                            <div className="skeleton-list">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} style={{height: '40px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '10px'}}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Main Content Skeleton */}
                    <div className="col-xl-9 col-lg-8 lesson__main">
                        <div className="lesson__video-wrap">
                            <div style={{height: '400px', backgroundColor: '#e0e0e0', borderRadius: '8px', marginBottom: '20px'}}></div>
                            <div style={{height: '200px', backgroundColor: '#f0f0f0', borderRadius: '8px'}}></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

    if (loading) {
        return <LoadingSkeleton />;
    }



    return (
        <section className="lesson__area section-pb-120" style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            padding: '40px 0'
        }}>
            <div className="container-fluid">
                <div className="row gx-4">
                    <div className="col-xl-3 col-lg-4 lesson__sidebar">
                        <div className="lesson__content" style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '20px',
                            padding: '30px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            height: 'fit-content',
                            position: 'sticky',
                            top: '20px'
                        }}>
                            <h2 className="title" style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                marginBottom: '25px',
                                textAlign: 'center'
                            }}>
                                📚 วิชา: {currentSubjectTitle || ""}
                            </h2>
                            <LessonFaq
                                onViewChange={setCurrentView}
                                lessonData={lessonData}
                                onSelectLesson={handleSelectLesson}
                                subjectId={currentSubjectId || undefined}
                                subjectQuizzes={subjectQuizzes}
                                currentLessonId={currentLessonId}
                                activeAccordion={sidebarActiveAccordion}
                                onAccordionChange={setSidebarActiveAccordion}
                            />
                            <ScoreProgressBar
                                currentScore={calculateCurrentScore()}
                                maxScore={calculateMaxScore()}
                                passingScore={calculatePassingScore()}
                                progressPercentage={progress}
                                subjectTitle={currentSubjectTitle}
                            />
                       
                        </div>
                    </div>
                    <div className="col-xl-9 col-lg-8 lesson__main">
                    <div className="lesson__video-wrap" style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                             borderRadius: '20px',
                             padding: '30px',
                             boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                             backdropFilter: 'blur(10px)',
                             border: '1px solid rgba(255, 255, 255, 0.2)'
                         }}>
                             {/* ✅ Modern Navigation Controls */}
                            <div className="lesson-navigation-controls mb-4" style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                padding: '20px',
                                borderRadius: '15px',
                                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255, 255, 255, 0.18)'
                            }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <button 
                                        className="btn btn-light btn-navigation"
                                        onClick={handlePreviousLesson}
                                        disabled={loading}
                                        style={{
                                            borderRadius: '12px',
                                            padding: '12px 20px',
                                            fontWeight: '500',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            border: 'none',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                                        }}
                                    >
                                        <i className="fas fa-chevron-left me-2" style={{color: '#667eea'}}></i>
                                        <span style={{color: '#333'}}>บทก่อนหน้า</span>
                                    </button>
                                    
                                    <div className="lesson-info text-center" style={{flex: 1, margin: '0 20px'}}>
                                        {currentLessonData && (
                                            <div style={{
                                                background: 'rgba(255, 255, 255, 0.15)',
                                                padding: '12px 20px',
                                                borderRadius: '25px',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)'
                                            }}>
                                                <div style={{color: 'white', fontWeight: '600', fontSize: '16px'}}>
                                                    <i className={`fas ${currentView === 'video' ? 'fa-play-circle' : 'fa-question-circle'} me-2`} 
                                                       style={{color: '#ffd700'}}></i>
                                                    {currentLesson}
                                                </div>
                                                <small style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px'}}>
                                                    {currentView === 'video' ? 'วิดีโอบทเรียน' : 'แบบทดสอบ'}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        className="btn btn-warning btn-navigation"
                                        onClick={handleNextLesson}
                                        disabled={loading}
                                        style={{
                                            borderRadius: '12px',
                                            padding: '12px 20px',
                                            fontWeight: '500',
                                            background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                                            border: 'none',
                                            color: '#333',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)';
                                        }}
                                    >
                                        <span>บทถัดไป</span>
                                        <i className="fas fa-chevron-right ms-2"></i>
                                    </button>
                                </div>
                            </div>
                            
                            {currentView === "quiz" ? (
                                <LessonQuiz
                                    onComplete={handleLessonComplete}
                                    isCompleted={getCurrentLessonCompleted}
                                    quizId={currentLessonData?.quiz_id || 0}
                                    quizData={currentQuizData?.questions || []}
                                    onNextLesson={handleNextLesson}
                                    lessonId={currentLessonData?.lesson_id || 0}
                                    onRefreshProgress={refreshProgress}
                                    // ✅ เพิ่ม: ส่ง onGoToNextLesson สำหรับแบบทดสอบของแต่ละบท
                                    onGoToNextLesson={goToNextLesson}
                                />
                            ) : (
                                <LessonVideo
                                    onComplete={handleLessonComplete}
                                    currentLesson={currentLesson}
                                    youtubeId={youtubeId}
                                    lessonId={currentLessonData?.lesson_id || 0}
                                    onNextLesson={handleNextLesson}
                                    // ✅ เพิ่ม: ส่ง onGoToNextLesson สำหรับวิดีโอบทเรียน
                                    onGoToNextLesson={goToNextLesson}
                                />
                            )}
                        </div>
                        <div className="lesson__nav-tab fixed-nav-tab" style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                             borderRadius: '20px',
                             padding: '25px',
                             marginTop: '25px',
                             boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                             backdropFilter: 'blur(10px)',
                             border: '1px solid rgba(255, 255, 255, 0.2)'
                         }}>
                             <LessonNavTav
                                description={courseData?.description || ""}
                                instructors={instructors}
                                currentLessonId={currentLessonData?.lesson_id}
                                currentBigLessonId={currentLessonData?.big_lesson_id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LessonArea;