import { useState, useEffect } from "react";
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
    const [loading, setLoading] = useState<boolean>(true);
    const [subjectQuizzes, setSubjectQuizzes] = useState<any[]>([]);
    const [initialLessonSet, setInitialLessonSet] = useState<boolean>(false);
    const [paymentStatus, setPaymentStatus] = useState<any>(null);       

    // ฟังก์ชันสกัด YouTube ID จาก URL
    const extractYoutubeId = (url?: string): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    // โหลดข้อมูลหลักสูตรทั้งหมดเมื่อโหลดหน้า
    const fetchCourseData = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    // โหลดข้อมูลแบบทดสอบก่อน/หลังเรียน
    const fetchSubjectQuizzes = async () => {
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
                
                // แบบทดสอบก่อนเรียน
                if (response.data.pre_test) {
                    const preTest = response.data.pre_test;
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

                // แบบทดสอบหลังเรียน
                if (response.data.post_test) {
                    const postTest = response.data.post_test;
                    quizzes.push({
                        quiz_id: postTest.quiz_id,
                        title: postTest.title || "แบบทดสอบหลังเรียน",
                        description: postTest.description,
                        type: "post_test",
                        locked: postTest.locked || false, // ใช้ locked จาก backend
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
    };

    // โหลดสถานะการชำระเงิน
    const fetchPaymentStatus = async () => {
        if (!currentSubjectId) return;

        try {
            const response = await axios.get(
                `${API_URL}/api/learn/subject/${currentSubjectId}/payment-status`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.data.success) {
                setPaymentStatus(response.data);
            }
        } catch (error) {
            console.error("Error fetching payment status:", error);
            setPaymentStatus(null);
        }
    };

    // ตั้งค่าบทเรียนแรก
    const setInitialLesson = () => {
        if (initialLessonSet) return;

        // ตรวจสอบว่ามีแบบทดสอบก่อนเรียนหรือไม่
        const preTest = subjectQuizzes.find(q => q.type === "pre_test");
        
        if (preTest) {
            // ตั้งค่าแบบทดสอบก่อนเรียนเป็นบทเรียนแรก
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
        } else if (lessonData.length > 0 && lessonData[0].items.length > 0) {
            // ถ้าไม่มีแบบทดสอบก่อนเรียน ให้ตั้งค่าบทเรียนแรก
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
        
        setInitialLessonSet(true);
    };

    useEffect(() => {
        setInitialLessonSet(false); // Reset เมื่อเปลี่ยนวิชา
        setSubjectQuizzes([]); // Reset ข้อมูลแบบทดสอบ
        setCurrentLessonId(""); // Reset บทเรียนปัจจุบัน
        setCurrentLesson(""); // Reset ชื่อบทเรียน
        setCurrentView("video"); // Reset view
        setCurrentLessonData(null); // Reset ข้อมูลบทเรียน
        setCurrentQuizData(null); // Reset ข้อมูลแบบทดสอบ
        setYoutubeId(""); // Reset YouTube ID
        fetchCourseData();
    }, [courseId, subjectId]);

    // โหลดความคืบหน้าของวิชาเมื่อมีการเปลี่ยนวิชา
    const fetchSubjectProgress = async () => {
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
    };
    useEffect(() => {
        fetchSubjectProgress();
    }, [currentSubjectId]);

    // โหลดข้อมูลแบบทดสอบเมื่อ subjectId เปลี่ยน
    useEffect(() => {
        if (currentSubjectId) {
            fetchSubjectQuizzes();
            fetchPaymentStatus();
        }
    }, [currentSubjectId]);



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
        let hasChanges = false;
        const updatedLessonData = [...data];

        for (const section of updatedLessonData) {
            for (const item of section.items) {
                if (item.type === "video") {
                    try {
                        const response = await axios.get(
                            `${API_URL}/api/learn/lesson/${item.lesson_id}/video-progress`,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                            }
                        );

                        if (response.data.success && response.data.progress) {
                            const newCompleted = response.data.progress.video_completed;
                            if (item.completed !== newCompleted) {
                                item.completed = newCompleted;
                                hasChanges = true;
                                // ปลดล็อคทุกอย่าง ไม่ต้องล็อคแบบทดสอบท้ายบท
                                const nextItem = section.items.find(
                                    (i) => i.id === item.id + 1 && i.type === "quiz"
                                );
                                if (nextItem) {
                                    nextItem.lock = false; // ปลดล็อคทุกอย่าง
                                }
                            }
                        }
                    } catch (error) {
                        console.error(
                            `Error fetching progress for lesson ${item.lesson_id}:`,
                            error
                        );
                    }
                }
            }
            const allCompleted = section.items.every((item) => item.completed);
            const checkAwating = section.items.some((item) => item.status === "awaiting_review") ? true : false;
            const newCount = checkAwating ? "รอตรวจ" : allCompleted ? "ผ่าน" : "ไม่ผ่าน"
            if (section.count !== newCount) {
                section.count = newCount;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            setLessonData(updatedLessonData);
        }
    };

    // ฟังก์ชันเมื่อบทเรียนเสร็จสิ้น
    const handleLessonComplete = () => {

        const [sectionId, itemId] = currentLessonId.split("-").map(Number);
    
        setLessonData((prevLessonData) => {
            const updatedData = prevLessonData.map((section) => {
                if (section.id === sectionId) {
                    // อัปเดต items ก่อน
                    const updatedItems = section.items.map((item, index) => {
                        // อัปเดต item ปัจจุบันที่ตรงกับ itemId
                        if (item.id === itemId) {
                            const updatedItem = {
                                ...item,
                                completed: true,
                                duration: "100%",
                                status: item.quizType === "special_fill_in_blank" && item.status !== "passed" ? "awaiting_review" : "passed"
                            };
                            
                            // ตรวจสอบว่ามี index ถัดไปหรือไม่
                            if (index + 1 < section.items.length) {
                                // อัปเดต item ถัดไป
                                const nextItem = section.items[index + 1];
                                section.items[index + 1] = {
                                    ...nextItem,
                                    lock: false // ปลดล็อคทุกอย่าง
                                };
                            }
                            return updatedItem as LessonItem;
                        }
                        // ถ้า item ปัจจุบันไม่ใช่ itemId และไม่ได้ถูกอัปเดตจากขั้นตอนก่อนหน้า
                        return item;
                    });
    
                    // ตรวจสอบว่า items ทั้งหมด completed หรือไม่
                    const allCompleted = updatedItems.every((item) => item.completed);

                    const checkAwating = updatedItems.some((item) => item.status === "awaiting_review") ? true : false;
    
                    return {
                        ...section,
                        items: updatedItems,
                        count: checkAwating ? "รอตรวจ" : allCompleted ? "ผ่าน" : section.count, // อัปเดต count ถ้า allCompleted เป็น true
                    };
                }
                return section;
            });
            
            fetchSubjectProgress();

            return updatedData;
        });

        fetchSubjectProgress()
    };

    // ฟังก์ชันค้นหาและตั้งค่าบทเรียนถัดไป
    const findAndSetNextLesson = (
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
    };

    // ตรวจสอบว่าบทเรียนปัจจุบันเรียนจบแล้วหรือไม่
    const getCurrentLessonCompleted = () => {
        const [sectionId, itemId] = currentLessonId.split("-").map(Number);
        const section = lessonData.find((s) => s.id === sectionId);
        if (section) {
            const item = section.items.find((i) => i.id === itemId);
            return item?.completed || false;
        }
        return false;
    };

   // ฟังก์ชันเมื่อเลือกบทเรียน
const handleSelectLesson = (
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
            lesson_id: 0, // ไม่ใช้ lesson_id สำหรับแบบทดสอบพิเศษ
            title: title,
            lock: false,
            completed: false, // จะต้องเช็คจาก API จริง
            type: type,
            quizType: "special", // กำหนดเป็น special เพื่อแยกจากปกติ
            duration: "0%",
            quiz_id: itemId, // quiz_id จริง
            status: "not_started" as const
        };
        
        setCurrentLessonData(specialQuizData);
        
        // สำหรับแบบทดสอบพิเศษ ไม่ต้องหา quiz data จาก courseData
        // เพราะจะโหลดจาก API ใน LessonQuiz component
        setCurrentQuizData(null);
        
        return;
    }

    // จัดการแบบทดสอบ/วิดีโอปกติ (โค้ดเดิม)
    const section = lessonData.find((s) => s.id === sectionId);
    if (section) {
        const item = section.items.find((i) => i.id === itemId);
        if (item) {
            // ปลดล็อคทุกอย่าง ยกเว้นแบบทดสอบท้ายบท
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
                big_lesson_id: section.id, // เพิ่ม big_lesson_id
            });


            if (type === "video" && item.video_url) {
                const videoId = extractYoutubeId(item.video_url);
                if (videoId) setYoutubeId(videoId);
            }

            if (courseData && type === "quiz" && item.quiz_id) {
                const lesson = courseData.subjects[0].lessons.find(
                    (l) => l.lesson_id === sectionId
                );
                
                // ตรวจสอบว่าเป็น Big Lesson หรือไม่
                if (lesson && lesson.is_big_lesson) {
                    // ค้นหาใน Sub Lessons
                    const subLesson = lesson.sub_lessons?.find(
                        (sl) => sl.lesson_id === sectionId
                    );
                    if (subLesson && subLesson.quiz) {
                        setCurrentQuizData(subLesson.quiz);
                    } else if (lesson.quiz && lesson.quiz.quiz_id === item.quiz_id) {
                        // Big Lesson Quiz
                        setCurrentQuizData(lesson.quiz);
                    }
                } else if (lesson && lesson.quiz) {
                    // Lesson ปกติ
                    setCurrentQuizData(lesson.quiz);
                }
            }
        }
    }
};

    // ฟังก์ชันอัพโหลด slip
    const handleUploadSlip = async (file: File) => {
        if (!currentSubjectId) return;

        try {
            const formData = new FormData();
            formData.append('slip', file);

            const response = await axios.post(
                `${API_URL}/api/learn/subject/${currentSubjectId}/upload-slip`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                alert("อัปโหลดสลิปสำเร็จ รอ admin อนุมัติ");
                await fetchPaymentStatus(); // รีเฟรชสถานะ
            }
        } catch (error: any) {
            console.error("Error uploading slip:", error);
            alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลดสลิป");
        }
    };

    // ฟังก์ชัน refresh progress/lesson/subject
    const refreshProgress = async () => {
        await fetchCourseData();
        await fetchSubjectProgress();
        await fetchPaymentStatus();
    };

    if (loading) {
        return (
            <section className="lesson__area section-pb-120">
                <div className="container-fluid">
                    <div className="lesson-loading-container">
                        <div className="lesson-loading-content">
                            <div className="spinner-container">
                                <div className="spinner-border-lg"></div>
                            </div>
                            <h3 className="loading-title">กำลังโหลดบทเรียน</h3>
                            <p className="loading-text">
                                กรุณารอสักครู่ ระบบกำลังเตรียมเนื้อหาบทเรียนให้คุณ...
                            </p>
                            <div className="loading-progress">
                                <div className="loading-bar">
                                    <div className="loading-bar-progress"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="lesson__area section-pb-120">
            <div className="container-fluid">
                <div className="row gx-4">
                    <div className="col-xl-3 col-lg-4 lesson__sidebar">
                        <div className="lesson__content">
                            <h2 className="title">
                                วิชา: {currentSubjectTitle || ""}
                            </h2>
                            <LessonFaq
                                onViewChange={setCurrentView}
                                lessonData={lessonData}
                                onSelectLesson={handleSelectLesson}
                                subjectId={currentSubjectId || undefined}
                                subjectQuizzes={subjectQuizzes}
                                paymentStatus={paymentStatus}
                                onUploadSlip={handleUploadSlip}
                            />
                            <div className="lesson__progress">
                                <h4>ความคืบหน้า</h4>
                                <div className="progress-container">
                                    <div className="progress-bar-wrapper">
                                        <div
                                            className="progress-bar"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="progress-percentage">
                                        {progress.toFixed(0)}%
                                    </div>
                                </div>
                                <div className="progress-status">
                                    <span className="status-text">สถานะ: </span>
                                    <span className="status-value">
                                        {progress < 100 ? "กำลังเรียน" : "เรียนจบแล้ว"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-9 col-lg-8 lesson__main">
                        <div className="lesson__video-wrap">
                            {currentView === "quiz" ? (
                                <LessonQuiz
                                    onComplete={handleLessonComplete}
                                    isCompleted={getCurrentLessonCompleted()}
                                    quizId={currentLessonData?.quiz_id || 0}
                                    quizData={currentQuizData?.questions || []}
                                    onNextLesson={findAndSetNextLesson.bind(
                                        null,
                                        parseInt(currentLessonId.split("-")[0]),
                                        parseInt(currentLessonId.split("-")[1]),
                                        lessonData
                                    )}
                                    lessonId={currentLessonData?.lesson_id || 0}
                                    onRefreshProgress={refreshProgress}
                                />
                            ) : (
                                <LessonVideo
                                    onComplete={handleLessonComplete}
                                    currentLesson={currentLesson}
                                    youtubeId={youtubeId}
                                    lessonId={currentLessonData?.lesson_id || 0}
                                    onNextLesson={findAndSetNextLesson.bind(
                                        null,
                                        parseInt(currentLessonId.split("-")[0]),
                                        parseInt(currentLessonId.split("-")[1]),
                                        lessonData
                                    )}
                                />
                            )}
                        </div>
                        <div className="lesson__nav-tab fixed-nav-tab">
                            <LessonNavTav
                                description={courseData?.description || ""}
                                instructors={courseData?.instructors || []}
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