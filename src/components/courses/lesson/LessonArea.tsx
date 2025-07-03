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
            quiz?: {
                quiz_id: number;
                title: string;
                description: string;
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
    const [completedCount, setCompletedCount] = useState(0);
    console.log("completedCount:", completedCount);
    const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);
    const [currentSubjectTitle, setCurrentSubjectTitle] = useState<string>("");
    const [currentLessonData, setCurrentLessonData] = useState<any>(null);
    const [currentQuizData, setCurrentQuizData] = useState<any>(null);
    const [youtubeId, setYoutubeId] = useState<string>("");
    const [lessonData, setLessonData] = useState<SectionData[]>([]);
    const [courseData, setCourseData] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

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
                        const sectionItems: LessonItem[] = [];
                        sectionItems.push({
                            id: 0,
                            lesson_id: lesson.lesson_id,
                            title: `${lessonIndex + 1}.1 เนื้อหาวิดีโอ`,
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
                    });

                    setLessonData(sections);
                    await updateLessonCompletionStatus(sections);

                    if (sections.length > 0 && sections[0].items.length > 0) {
                        const firstSection = sections[0];
                        const firstItem = firstSection.items[0];
                        setCurrentLessonId(`${firstSection.id}-${firstItem.id}`);
                        setCurrentLesson(firstItem.title);
                        setCurrentView(firstItem.type);
                        setCurrentLessonData({
                            ...firstItem,
                            quiz_id: firstSection.quiz_id,
                        });

                        if (firstItem.video_url) {
                            const videoId = extractYoutubeId(firstItem.video_url);
                            if (videoId) setYoutubeId(videoId);
                        }

                        if (firstSection.quiz_id) {
                            const firstLesson = subject.lessons[0];
                            if (firstLesson.quiz) {
                                setCurrentQuizData(firstLesson.quiz);
                            }
                        }
                    }
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

    useEffect(() => {
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
                const { progressPercentage, completedLessons } = response.data;
                setProgress(progressPercentage || 0);
                setCompletedCount(completedLessons || 0);
            }
        } catch (error) {
            console.error("Error fetching subject progress:", error);
        }
    };
    useEffect(() => {
        fetchSubjectProgress();
    }, [currentSubjectId]);

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
                                const nextItem = section.items.find(
                                    (i) => i.id === item.id + 1 && i.type === "quiz"
                                );
                                if (nextItem) {
                                    nextItem.lock = !item.completed;
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
                                    lock: false
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
    
        setCompletedCount((prev) => prev + 1);
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
                        if (lesson && lesson.quiz) {
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
                            if (lesson && lesson.quiz) {
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
            lesson_id: itemId, // ใช้ quiz_id เป็น lesson_id สำหรับแบบทดสอบพิเศษ
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
            if (item.lock) {
                alert("คุณต้องเรียนบทเรียนก่อนหน้าให้เสร็จก่อน");
                return;
            }

            setCurrentLessonId(`${sectionId}-${itemId}`);
            setCurrentLesson(title);
            setCurrentView(type);
            setCurrentSubjectId(section.subject_id);

            setCurrentLessonData({
                ...item,
                quiz_id: type === "quiz" ? item.quiz_id : section.quiz_id,
            });


            if (type === "video" && item.video_url) {
                const videoId = extractYoutubeId(item.video_url);
                if (videoId) setYoutubeId(videoId);
            }

            if (courseData && type === "quiz" && item.quiz_id) {
                const lesson = courseData.subjects[0].lessons.find(
                    (l) => l.lesson_id === sectionId
                );
                if (lesson && lesson.quiz) {
                    setCurrentQuizData(lesson.quiz);
                }
            }
        }
    }
};

    // ฟังก์ชัน refresh progress/lesson/subject
    const refreshProgress = async () => {
        await fetchCourseData();
        await fetchSubjectProgress();
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
                                 subjectId={currentSubjectId || undefined} // เพิ่มบรรทัดนี้
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
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LessonArea;