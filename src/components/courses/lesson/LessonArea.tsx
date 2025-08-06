import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import LessonFaq from "./LessonFaq";
import LessonNavTav from "./LessonNavTav";
import LessonVideo from "./LessonVideo";
import LessonQuiz from "./LessonQuiz";
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
                                            lock: false, // ปลดล็อคแบบทดสอบท้ายบท
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
                                    lock: false,
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
                                    lock: false, // ปลดล็อคแบบทดสอบท้ายบท
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
                // --- ดึงข้อมูล pre/post test ---
                let preTestCompleted = false;
                if (response.data.pre_test) {
                    const preTest = response.data.pre_test;
                    preTestCompleted = preTest.progress?.passed || false;
                    quizzes.push({
                        quiz_id: preTest.quiz_id,
                        title: preTest.title || "แบบทดสอบก่อนเรียน",
                        description: preTest.description,
                        type: "pre_test",
                        locked: false,
                        completed: preTest.progress?.completed || false,
                        passed: preTest.progress?.passed || false,
                        status: preTest.progress?.awaiting_review ? "awaiting_review" :
                                preTest.progress?.passed ? "passed" :
                                preTest.progress?.completed ? "failed" : "not_started",
                        score: preTest.progress?.score,
                        max_score: preTest.progress?.max_score,
                    });
                }
                // --- เช็คว่าทุกบทเรียนผ่านหรือยัง ---
                let allLessonsPassed = true;
                if (lessonData.length > 0) {
                    for (const section of lessonData) {
                        for (const item of section.items) {
                            if (item.type === "quiz" && !item.completed) {
                                allLessonsPassed = false;
                                break;
                            }
                        }
                        if (!allLessonsPassed) break;
                    }
                }
                // --- post test ---
                if (response.data.post_test) {
                    const postTest = response.data.post_test;
                    // ล็อค posttest ถ้า pretest ยังไม่ผ่าน หรือ บทเรียนยังไม่ผ่านครบ
                    let locked = false;
                    if (!preTestCompleted || !allLessonsPassed) {
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

    // ✅ Task 2: หาบทเรียนล่าสุดที่ยังไม่ได้เรียน
    const findNextUncompletedLesson = () => {
        // หาบทเรียนแรกที่ยังไม่เสร็จ
        for (let sectionIndex = 0; sectionIndex < lessonData.length; sectionIndex++) {
            const section = lessonData[sectionIndex];
            for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
                const item = section.items[itemIndex];
                // หาบทเรียนที่ยังไม่เสร็จและไม่ถูกล็อค
                if (!item.completed && !item.lock) {
                    return {
                        section,
                        item,
                        sectionIndex,
                        itemIndex
                    };
                }
            }
        }
        
        // ถ้าทุกบทเรียนเสร็จแล้ว ให้ตรวจสอบแบบทดสอบหลังเรียน
        const postTest = subjectQuizzes.find(q => q.type === "post_test");
        if (postTest && !postTest.completed && !postTest.locked) {
            return {
                isPostTest: true,
                postTest
            };
        }
        
        return null; // ทุกอย่างเสร็จหมดแล้ว
    };

    // ตั้งค่าบทเรียนแรก
    const setInitialLesson = () => {
        if (initialLessonSet) return;

        // ตรวจสอบว่ามีแบบทดสอบก่อนเรียนหรือไม่
        const preTest = subjectQuizzes.find(q => q.type === "pre_test");
        
        // ถ้ามีแบบทดสอบก่อนเรียนและยังไม่ได้ทำ
        if (preTest && !preTest.completed) {
            console.log("🎯 Task 2: ตั้งค่าแบบทดสอบก่อนเรียนเป็นบทเรียนแรก");
            setCurrentLessonId(`-1000-${preTest.quiz_id}`);
            setCurrentLesson(preTest.title);
            setCurrentView("quiz");
            setCurrentLessonData({
                id: preTest.quiz_id,
                lesson_id: 0,
                title: preTest.title,
                lock: false,
                completed: preTest.completed || false,
                type: "quiz",
                quizType: "special",
                duration: preTest.completed ? "100%" : "0%",
                quiz_id: preTest.quiz_id,
                status: preTest.status || "not_started"
            });
            setCurrentQuizData(null);
        } else {
            // ✅ Task 2: หาบทเรียนล่าสุดที่ยังไม่ได้เรียน
            const nextLesson = findNextUncompletedLesson();
            
            if (nextLesson && !nextLesson.isPostTest && nextLesson.section && nextLesson.item) {
                const { section, item } = nextLesson;
                console.log(`🎯 Task 2: ตั้งค่าบทเรียนที่ยังไม่เสร็จ: ${item.title}`);
                
                setCurrentLessonId(`${section.id}-${item.id}`);
                setCurrentLesson(item.title);
                setCurrentView(item.type);
                setCurrentLessonData({
                    ...item,
                    quiz_id: item.type === "quiz" ? item.quiz_id : section.quiz_id,
                    big_lesson_id: section.id,
                });

                if (item.type === "video" && item.video_url) {
                    const videoId = extractYoutubeId(item.video_url);
                    if (videoId) setYoutubeId(videoId);
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
            } else if (nextLesson && nextLesson.isPostTest) {
                // แสดงแบบทดสอบหลังเรียน
                const { postTest } = nextLesson;
                console.log("🎯 Task 2: ตั้งค่าแบบทดสอบหลังเรียนเป็นบทเรียนต่อไป");
                
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
            } else if (lessonData.length > 0 && lessonData[0].items.length > 0) {
                // Fallback: ใช้บทเรียนแรกถ้าไม่พบบทเรียนที่ยังไม่เสร็จ
                console.log("🎯 Task 2: Fallback - ใช้บทเรียนแรก");
                const firstSection = lessonData[0];
                const firstItem = firstSection.items[0];
                setCurrentLessonId(`${firstSection.id}-${firstItem.id}`);
                setCurrentLesson(firstItem.title);
                setCurrentView(firstItem.type);
                setCurrentLessonData({
                    ...firstItem,
                    quiz_id: firstSection.quiz_id,
                    big_lesson_id: firstSection.id,
                });

                if (firstItem.video_url) {
                    const videoId = extractYoutubeId(firstItem.video_url);
                    if (videoId) setYoutubeId(videoId);
                }

                if (firstSection.quiz_id) {
                    const firstLesson = courseData?.subjects[0]?.lessons[0];
                    if (firstLesson?.quiz) {
                        setCurrentQuizData(firstLesson.quiz);
                    }
                }
            }
        }
        
        setInitialLessonSet(true);
    };

    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);
                
                // Reset states เมื่อเปลี่ยนวิชา
                setInitialLessonSet(false);
                setSubjectQuizzes([]);
                setCurrentLessonId("");
                setCurrentLesson("");
                setCurrentView("video");
                setCurrentLessonData(null);
                setCurrentQuizData(null);
                setYoutubeId("");
                
                // โหลดข้อมูลใหม่
                await Promise.all([
                    fetchCourseData(),
                    fetchInstructors()
                ]);
                
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
            });
        }
    }, [currentSubjectId]);

    // ปรับสูตร progress bar ให้นับ pre/post test และทั้ง video/quiz
    useEffect(() => {
        // ต้องรอให้ subjectQuizzes และ lessonData โหลดเสร็จ
        if (!lessonData || lessonData.length === 0) return;
        let progress = 0;
        const preTest = subjectQuizzes.find(q => q.type === "pre_test");
        const postTest = subjectQuizzes.find(q => q.type === "post_test");
        if (preTest && preTest.completed) progress += 20;
        if (postTest && postTest.completed) progress += 20;
        // นับทั้ง video และ quiz
        let totalItems = 0;
        let completedItems = 0;
        lessonData.forEach(section => {
            section.items.forEach(item => {
                if (item.type === "quiz" || item.type === "video") {
                    totalItems++;
                    if (item.completed) completedItems++;
                }
            });
        });
        if (totalItems > 0) {
            progress += (completedItems / totalItems) * 60;
        }
        setProgress(progress);
    }, [lessonData, subjectQuizzes]);

    // ตั้งค่าบทเรียนแรกเมื่อข้อมูลพร้อม
    useEffect(() => {
        if (!loading && lessonData.length > 0 && !initialLessonSet) {
            // ถ้าไม่มีข้อมูลแบบทดสอบเลย ให้ตั้งค่าบทเรียนแรก
            if (subjectQuizzes.length === 0) {
                setInitialLesson();
            }
        }
    }, [loading, lessonData, subjectQuizzes, initialLessonSet]);

    // ตั้งค่าบทเรียนแรกเมื่อข้อมูลแบบทดสอบโหลดเสร็จ
    useEffect(() => {
        if (!loading && lessonData.length > 0 && subjectQuizzes.length > 0 && !initialLessonSet) {
            setInitialLesson();
        }
    }, [subjectQuizzes, loading, lessonData, initialLessonSet]);

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
                        
                        // ปลดล็อค quiz ถัดไป
                        const nextItem = updatedLessonData[sectionIndex].items.find(
                            (i) => i.id === item.id + 1 && i.type === "quiz"
                        );
                        if (nextItem) {
                            nextItem.lock = false;
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
                            
                            // ปลดล็อค item ถัดไป
                            if (index + 1 < section.items.length) {
                                const nextItem = section.items[index + 1];
                                section.items[index + 1] = {
                                    ...nextItem,
                                    lock: false
                                };
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
            await fetchCourseData(); // refresh ข้อมูลทั้งหมดเพื่อให้แน่ใจว่าข้อมูลตรงกับ server
            
            // ✅ Task 2: หลังจากทำบทเรียนเสร็จ ให้หาบทเรียนถัดไปอัตโนมัติ
            setTimeout(() => {
                const nextLesson = findNextUncompletedLesson();
                if (nextLesson && !nextLesson.isPostTest && nextLesson.section && nextLesson.item) {
                    const { section, item } = nextLesson;
                    console.log(`🎯 Task 2: อัตโนมัติไปยังบทเรียนถัดไป: ${item.title}`);
                    
                    setCurrentLessonId(`${section.id}-${item.id}`);
                    setCurrentLesson(item.title);
                    setCurrentView(item.type);
                    setCurrentLessonData({
                        ...item,
                        quiz_id: item.type === "quiz" ? item.quiz_id : section.quiz_id,
                        big_lesson_id: section.id,
                    });

                    if (item.type === "video" && item.video_url) {
                        const videoId = extractYoutubeId(item.video_url);
                        if (videoId) setYoutubeId(videoId);
                    }
                } else if (nextLesson && nextLesson.isPostTest && nextLesson.postTest) {
                    // ไปยังแบบทดสอบหลังเรียน
                    const { postTest } = nextLesson;
                    console.log("🎯 Task 2: อัตโนมัติไปยังแบบทดสอบหลังเรียน");
                    
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
                }
            }, 500); // รอให้ state update เสร็จก่อน
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
        let foundNext = false;

        const currentSection = updatedData.find((s) => s.id === currentSectionId);
        if (currentSection) {
            for (let i = 0; i < currentSection.items.length; i++) {
                if (
                    i > currentItemId &&
                    !currentSection.items[i].lock &&
                    !currentSection.items[i].completed
                ) {
                    setCurrentLessonId(`${currentSectionId}-${i}`);
                    setCurrentLesson(currentSection.items[i].title);
                    setCurrentView(currentSection.items[i].type);
                                            setCurrentLessonData({
                            ...currentSection.items[i],
                            quiz_id:
                                currentSection.items[i].type === "quiz"
                                    ? currentSection.items[i].quiz_id
                                    : currentSection.quiz_id,
                            big_lesson_id: currentSection.id, // เพิ่ม big_lesson_id
                        });

                    if (
                        currentSection.items[i].type === "video" &&
                        currentSection.items[i].video_url &&
                        typeof currentSection.items[i].video_url === "string"
                    ) {
                        const videoId = extractYoutubeId(currentSection.items[i].video_url);
                        if (videoId) setYoutubeId(videoId);
                                            } else if (
                            currentSection.items[i].type === "quiz" &&
                            courseData
                        ) {
                            const lesson = courseData.subjects[0].lessons.find(
                                (l) => l.lesson_id === currentSectionId
                            );
                            
                            // ตรวจสอบว่าเป็น Big Lesson หรือไม่
                            if (lesson && lesson.is_big_lesson) {
                                // ค้นหาใน Sub Lessons
                                const subLesson = lesson.sub_lessons?.find(
                                    (sl: any) => sl.lesson_id === currentSectionId
                                );
                                if (subLesson && subLesson.quiz) {
                                    setCurrentQuizData(subLesson.quiz);
                                } else if (lesson.quiz && lesson.quiz.quiz_id === currentSection.items[i].quiz_id) {
                                    // Big Lesson Quiz
                                    setCurrentQuizData(lesson.quiz);
                                }
                            } else if (lesson && lesson.quiz) {
                                // Lesson ปกติ
                                setCurrentQuizData(lesson.quiz);
                            }
                        }

                    foundNext = true;
                    break;
                }
            }
        }

        if (!foundNext) {
            for (let s = 0; s < updatedData.length; s++) {
                const section = updatedData[s];
                if (section.id === currentSectionId || section.count === "ผ่าน") continue;

                for (let i = 0; i < section.items.length; i++) {
                    if (!section.items[i].lock && !section.items[i].completed) {
                        setCurrentLessonId(`${section.id}-${i}`);
                        setCurrentLesson(section.items[i].title);
                        setCurrentView(section.items[i].type);
                        setCurrentLessonData({
                            ...section.items[i],
                            quiz_id:
                                section.items[i].type === "quiz"
                                    ? section.items[i].quiz_id
                                    : section.quiz_id,
                            big_lesson_id: section.id, // เพิ่ม big_lesson_id
                        });

                        if (
                            section.items[i].type === "video" &&
                            section.items[i].video_url
                        ) {
                            const videoId = extractYoutubeId(section.items[i].video_url);
                            if (videoId) setYoutubeId(videoId);
                        } else if (
                            section.items[i].type === "quiz" &&
                            courseData
                        ) {
                            const lesson = courseData.subjects[0].lessons.find(
                                (l) => l.lesson_id === section.id
                            );
                            
                            // ตรวจสอบว่าเป็น Big Lesson หรือไม่
                            if (lesson && lesson.is_big_lesson) {
                                // ค้นหาใน Sub Lessons
                                const subLesson = lesson.sub_lessons?.find(
                                    (sl: any) => sl.lesson_id === section.id
                                );
                                if (subLesson && subLesson.quiz) {
                                    setCurrentQuizData(subLesson.quiz);
                                } else if (lesson.quiz && lesson.quiz.quiz_id === section.items[i].quiz_id) {
                                    // Big Lesson Quiz
                                    setCurrentQuizData(lesson.quiz);
                                }
                            } else if (lesson && lesson.quiz) {
                                // Lesson ปกติ
                                setCurrentQuizData(lesson.quiz);
                            }
                        }

                        foundNext = true;
                        break;
                    }
                }

                if (foundNext) break;
            }
        }

        if (!foundNext) {
            alert("คุณได้เรียนจบทุกบทเรียนในวิชานี้แล้ว!");
        }
    }, [courseData, extractYoutubeId]);

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
    // ตรวจสอบว่าเป็นแบบทดสอบพิเศษ (pre/post test) หรือไม่
    if (sectionId < 0) {
        // จัดการแบบทดสอบก่อน/หลังเรียน
        setCurrentLessonId(`${sectionId}-${itemId}`);
        setCurrentLesson(title);
        setCurrentView(type);
        
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
            if (item.lock && item.type === "quiz" && item.title.includes("แบบทดสอบท้ายบท")) {
                alert("กรุณาเรียนบทก่อนหน้าให้เสร็จก่อนทำแบบทดสอบท้ายบท");
                return;
            }

            setCurrentLessonId(`${sectionId}-${itemId}`);
            setCurrentLesson(title);
            setCurrentView(type);
            setCurrentSubjectId(section.subject_id);

            setCurrentLessonData({
                ...item,
                quiz_id: type === "quiz" ? item.quiz_id : section.quiz_id,
                big_lesson_id: section.id,
            });

            if (type === "video" && item.video_url) {
                const videoId = extractYoutubeId(item.video_url);
                if (videoId) setYoutubeId(videoId);
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
                                
                                if (prevItem.type === "video") {
                                    const extractedId = extractYoutubeId(courseData?.subjects[0]?.lessons?.find(l => l.lesson_id === prevItem.lesson_id)?.video_url);
                                    setYoutubeId(extractedId || "");
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
        const [sectionId, itemId] = currentLessonId.split("-").map(Number);
        findAndSetNextLesson(sectionId, itemId, lessonData);
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
                            />
                            <div className="lesson__progress" style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                padding: '20px',
                                borderRadius: '15px',
                                marginTop: '25px',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)'
                            }}>
                                <h4 style={{
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    marginBottom: '15px',
                                    textAlign: 'center'
                                }}>📊 ความคืบหน้า</h4>
                                <div className="progress-container" style={{marginBottom: '15px'}}>
                                    <div className="progress-bar-wrapper" style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '20px',
                                        height: '12px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <div
                                            className="progress-bar"
                                            style={{ 
                                                width: `${progress}%`,
                                                background: 'linear-gradient(90deg, #ffd700, #ffed4e)',
                                                height: '100%',
                                                borderRadius: '20px',
                                                transition: 'width 0.6s ease-out',
                                                boxShadow: '0 2px 10px rgba(255, 215, 0, 0.4)'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="progress-percentage" style={{
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '1.2rem',
                                        textAlign: 'center',
                                        marginTop: '10px'
                                    }}>
                                        {progress.toFixed(0)}%
                                    </div>
                                </div>
                                <div className="progress-status" style={{
                                    textAlign: 'center',
                                    padding: '10px',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    borderRadius: '10px'
                                }}>
                                    <span className="status-text" style={{color: 'rgba(255, 255, 255, 0.8)'}}>สถานะ: </span>
                                    <span className="status-value" style={{
                                        color: progress < 100 ? '#ffd700' : '#4ade80',
                                        fontWeight: '600'
                                    }}>
                                        {progress < 100 ? "🎯 กำลังเรียน" : "🎉 เรียนจบแล้ว"}
                                    </span>
                                </div>
                            </div>
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
                                />
                            ) : (
                                <LessonVideo
                                    onComplete={handleLessonComplete}
                                    currentLesson={currentLesson}
                                    youtubeId={youtubeId}
                                    lessonId={currentLessonData?.lesson_id || 0}
                                    onNextLesson={handleNextLesson}
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