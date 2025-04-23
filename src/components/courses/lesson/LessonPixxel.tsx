import axios from "axios";

interface LessonItem {
  id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: "video" | "quiz";
  duration: string;
  lessonId?: number;
  quizId?: number;
}

interface SectionData {
  id: number;
  title: string;
  count: string;
  items: LessonItem[];
}

// ฟังก์ชันสำหรับดึงข้อมูลความก้าวหน้าของผู้ใช้
export const fetchUserProgress = async (
  subjectId: string | undefined,
  apiURL: string,
  setCourseCompleted?: (completed: boolean) => void
) => {
  try {
    if (!subjectId) return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await axios.get(
      `${apiURL}/api/courses/subjects/${subjectId}/progress`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      console.log("Progress data fetched successfully:", response.data);

      if (response.data.progress?.progress_percentage === 100 && setCourseCompleted) {
        setCourseCompleted(true);
      }

      return response.data;
    }
  } catch (error) {
    console.error("Error fetching user progress:", error);
  }
  return null;
};

// ฟังก์ชันสำหรับประมวลผลแบบทดสอบก่อนเรียน
const processPreTest = (subjectData: any, progressInfo: any = null) => {
  if (!subjectData.preTest && !subjectData.pre_test_id) {
    return null;
  }

  const preTestData = subjectData.preTest || {
    quiz_id: subjectData.pre_test_id,
  };

  let preTestCompleted = subjectData.pre_test_completed || false;
  let preTestProgress = "0%";

  if (progressInfo?.quizProgress) {
    const preTestProgressData = progressInfo.quizProgress.find(
      (p: any) => p.quiz_id === preTestData.quiz_id
    );

    if (preTestProgressData) {
      preTestCompleted = preTestProgressData.completed || preTestCompleted;
      preTestProgress = preTestCompleted
        ? "100%"
        : preTestProgressData.progress
        ? `${preTestProgressData.progress}%`
        : "0%";
    }
  }

  return {
    id: 1,
    title: "แบบทดสอบก่อนเรียน",
    count: preTestCompleted ? "100%" : "0%",
    items: [
      {
        id: 0,
        title: "เริ่มทำแบบทดสอบก่อนเรียน",
        lock: false,
        completed: preTestCompleted,
        type: "quiz" as const,
        duration: preTestProgress,
        quizId: preTestData.quiz_id,
      },
    ],
  };
};

// ฟังก์ชันสำหรับประมวลผลบทเรียน
const processLessons = (subjectData: any, progressInfo: any = null) => {
  if (!subjectData.lessons || subjectData.lessons.length === 0) {
    return [];
  }

  // เรียงลำดับบทเรียนตาม chapter และ order_number
  const sortedLessons = [...subjectData.lessons].sort((a, b) => {
    if (a.chapter !== b.chapter) {
      return (a.chapter || 1) - (b.chapter || 1);
    }
    if (a.order_number !== undefined && b.order_number !== undefined) {
      return a.order_number - b.order_number;
    }
    return a.lesson_id - b.lesson_id;
  });

  console.log("Sorted lessons:", sortedLessons);

  const preTestCompleted =
    !subjectData.pre_test_id ||
    subjectData.pre_test_completed ||
    (progressInfo?.quizProgress?.some(
      (p: any) => p.quiz_id === subjectData.pre_test_id && p.completed
    ));

  // จัดกลุ่มบทเรียนตาม chapter
  const chapterMap = new Map<number, any[]>();

  sortedLessons.forEach((lesson, index) => {
    const chapterNumber = index + 1; // บทเรียนที่ 1, 2, 3, ...
    chapterMap.set(chapterNumber, [lesson]);
  });

  console.log("Chapter map:", Array.from(chapterMap.entries()));

  // เรียงลำดับ chapter
  const sortedChapters = Array.from(chapterMap.keys()).sort((a, b) => a - b);

  console.log("Sorted chapters:", sortedChapters);

  const sections: SectionData[] = [];

  // สร้างเซ็กชันสำหรับแต่ละ chapter
  for (let chapterIndex = 0; chapterIndex < sortedChapters.length; chapterIndex++) {
    const chapterNumber = sortedChapters[chapterIndex];
    const chapterLessons = chapterMap.get(chapterNumber) || [];

    console.log(`Processing chapter ${chapterNumber} with ${chapterLessons.length} lessons`);

    // กำหนด ID และชื่อเซ็กชัน
    const sectionId = 2 + chapterIndex;
    const sectionTitle = `บทที่ ${chapterNumber}`;

    // ตรวจสอบว่า chapter ก่อนหน้าเรียนจบแล้วหรือไม่
    const previousChaptersCompleted =
      chapterIndex === 0 ||
      sortedChapters.slice(0, chapterIndex).every((prevChapter) => {
        const prevChapterLessons = chapterMap.get(prevChapter) || [];
        return prevChapterLessons.every((lesson) => {
          const lessonProgressData = progressInfo?.lessonProgress?.find(
            (p: any) => p.lesson_id === lesson.lesson_id
          );
          console.log(
            `Lesson ${lesson.lesson_id} progress:`,
            lessonProgressData ? JSON.stringify(lessonProgressData) : "none"
          );
          console.log(`Lesson ${lesson.lesson_id} has quiz:`, lesson.quiz_id);
          return lessonProgressData?.completed || lesson.completed;
        });
      });

    // chapter ถูกล็อคถ้าแบบทดสอบก่อนเรียนยังไม่เสร็จหรือ chapter ก่อนหน้ายังไม่เสร็จ
    const chapterLocked = !preTestCompleted || !previousChaptersCompleted;

    // สร้างรายการสำหรับ chapter นี้
    const chapterItems: LessonItem[] = [];

    // สร้างรายการสำหรับแต่ละบทเรียนใน chapter
    chapterLessons.forEach((lesson, lessonIndex) => {
      console.log(`Processing lesson ${lessonIndex} in chapter ${chapterNumber}:`, lesson);

      // ตรวจสอบว่าบทเรียนก่อนหน้าใน chapter นี้เรียนจบแล้วหรือไม่
      const previousLessonsInChapterCompleted =
        lessonIndex === 0 ||
        chapterLessons.slice(0, lessonIndex).every((l) => {
          const lessonProgressData = progressInfo?.lessonProgress?.find(
            (p: any) => p.lesson_id === l.lesson_id
          );
          return lessonProgressData?.completed || l.completed;
        });

      // บทเรียนถูกล็อคถ้า chapter ถูกล็อคหรือบทเรียนก่อนหน้ายังไม่เสร็จ
      const lessonLocked = chapterLocked || (lessonIndex > 0 && !previousLessonsInChapterCompleted);

      // กำหนดชื่อบทเรียน
      const lessonTitle = `เนื้อหา ${chapterNumber}.${lessonIndex + 1} ${lesson.title}`;

      // ตรวจสอบสถานะการเรียนจบของบทเรียน
      let lessonCompleted = lesson.completed || false;
      let lessonProgress = lesson.progress || 0;

      const lessonProgressData = progressInfo?.lessonProgress?.find(
        (p: any) => p.lesson_id === lesson.lesson_id
      );
      if (lessonProgressData) {
        lessonCompleted = lessonProgressData.completed || lessonCompleted;
        lessonProgress = lessonProgressData.progress || lessonProgress;
      }

      console.log(`Lesson ${lesson.lesson_id} progress:`, lessonProgressData);
      console.log(`Lesson ${lesson.lesson_id} has quiz:`, lesson.quiz_id);

      // เพิ่มรายการบทเรียน
      chapterItems.push({
        id: lessonIndex * 2,
        title: lessonTitle,
        lock: lessonLocked,
        completed: lessonCompleted,
        type: "video",
        duration: lessonCompleted ? "100%" : `${lessonProgress}%`,
        lessonId: lesson.lesson_id,
      });

      // เพิ่มแบบทดสอบท้ายบทเรียน (ถ้ามี)
      processLessonQuiz(
        lesson,
        chapterNumber,
        lessonIndex,
        lessonLocked,
        lessonCompleted,
        progressInfo,
        chapterItems
      );
    });

    // คำนวณความก้าวหน้าของ chapter
    const totalItems = chapterItems.length;
    const completedItems = chapterItems.filter((item) => item.completed).length;
    const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // เพิ่มเซ็กชันสำหรับ chapter นี้
    sections.push({
      id: sectionId,
      title: sectionTitle,
      count: `${Math.round(sectionProgress)}%`,
      items: chapterItems,
    });
  }

  return sections;
};

// ฟังก์ชันสำหรับประมวลผลแบบทดสอบท้ายบทเรียน
const processLessonQuiz = (
  lesson: any,
  chapterNumber: number,
  lessonIndex: number,
  lessonLocked: boolean,
  lessonCompleted: boolean,
  progressInfo: any,
  chapterItems: LessonItem[]
) => {
  // แก้ไขการตรวจสอบให้ใช้ quiz_id หรือ quiz object โดยตรง ไม่ต้องสนใจ has_quiz
  if (lesson.quiz_id || lesson.quiz) {
    console.log(`Lesson ${lesson.lesson_id} has quiz:`, lesson.quiz || lesson.quiz_id);

    const quizData = lesson.quiz || { quiz_id: lesson.quiz_id };
    const quizTitle = `แบบทดสอบท้ายบท ${chapterNumber}.${lessonIndex + 1} ${lesson.title}`;

    let quizCompleted = lesson.quiz_completed || false;
    let quizPassed = false;
    let quizStatus = "ยังไม่ได้ทำ";

    if (progressInfo?.quizProgress) {
      const quizProgressData = progressInfo.quizProgress.find(
        (p: any) => p.quiz_id === (quizData.quiz_id || lesson.quiz_id)
      );

      if (quizProgressData) {
        quizCompleted = quizProgressData.completed || quizCompleted;
        quizPassed = quizProgressData.passed || false;
        quizStatus = quizProgressData.status || (quizCompleted ? (quizPassed ? "ผ่าน" : "ไม่ผ่าน") : "ยังไม่ได้ทำ");
      }
    }

    chapterItems.push({
      id: lessonIndex * 2 + 1,
      title: quizTitle,
      lock: lessonLocked || !lessonCompleted,
      completed: quizCompleted && quizPassed, // เปลี่ยนเงื่อนไขให้ต้องผ่านด้วย
      type: "quiz",
      duration: quizStatus, // เปลี่ยนจาก percentage เป็น status
      quizId: quizData.quiz_id || lesson.quiz_id,
    });
  } else {
    // เพิ่มการตรวจสอบ quiz จาก quizProgress ที่อาจเกี่ยวข้องกับบทเรียนนี้
    if (progressInfo?.quizProgress) {
      // ตรวจสอบว่ามี quiz ที่เกี่ยวข้องกับบทเรียนนี้หรือไม่
      const relatedQuiz = progressInfo.quizProgress.find(
        (q: any) => q.lesson_id === lesson.lesson_id
      );

      if (relatedQuiz) {
        console.log(`Found related quiz for lesson ${lesson.lesson_id}:`, relatedQuiz);

        const quizTitle = `แบบทดสอบท้ายบท ${chapterNumber}.${lessonIndex + 1} ${lesson.title}`;

        chapterItems.push({
          id: lessonIndex * 2 + 1,
          title: quizTitle,
          lock: lessonLocked || !lessonCompleted,
          completed: relatedQuiz.completed || false,
          type: "quiz",
          duration: relatedQuiz.completed
            ? "100%"
            : relatedQuiz.progress
            ? `${relatedQuiz.progress}%`
            : "0%",
          quizId: relatedQuiz.quiz_id,
        });
      }
    }
  }
};

// ฟังก์ชันสำหรับประมวลผลแบบทดสอบหลังเรียน
const processPostTest = (subjectData: any, progressInfo: any = null) => {
  if (!subjectData.postTest && !subjectData.post_test_id) {
    return null;
  }

  const allLessonsCompleted =
    subjectData.lessons &&
    subjectData.lessons.every((lesson: any) => {
      const lessonProgressData = progressInfo?.lessonProgress?.find(
        (p: any) => p.lesson_id === lesson.lesson_id
      );
      return lessonProgressData?.completed || lesson.completed;
    });

  const postTestData = subjectData.postTest || {
    quiz_id: subjectData.post_test_id,
  };

  let postTestCompleted = subjectData.post_test_completed || false;
  let postTestProgress = "0%";

  if (progressInfo?.quizProgress) {
    const postTestProgressData = progressInfo.quizProgress.find(
      (p: any) => p.quiz_id === postTestData.quiz_id
    );

    if (postTestProgressData) {
      postTestCompleted = postTestProgressData.completed || postTestCompleted;
      postTestProgress = postTestCompleted
        ? "100%"
        : postTestProgressData.progress
        ? `${postTestProgressData.progress}%`
        : "0%";
    }
  }

  return {
    id: 9999,
    title: "แบบทดสอบหลังเรียน",
    count: postTestCompleted ? "100%" : "0%",
    items: [
      {
        id: 0,
        title: "เริ่มทำแบบทดสอบหลังเรียน",
        lock: !allLessonsCompleted,
        completed: postTestCompleted,
        type: "quiz" as const,
        duration: postTestProgress,
        quizId: postTestData.quiz_id,
      },
    ],
  };
};

// ฟังก์ชันสำหรับประมวลผลข้อมูลรายวิชา
export const processSubjectData = (subjectData: any, progressInfo: any = null) => {
  if (!subjectData) return [];

  console.log("Processing subject data:", subjectData);
  console.log("With progress info:", progressInfo);

  try {
    const sections: SectionData[] = [];

    // แบบทดสอบก่อนเรียน
    const preTestSection = processPreTest(subjectData, progressInfo);
    if (preTestSection) {
      sections.push(preTestSection);
    }

    // บทเรียน
    const lessonSections = processLessons(subjectData, progressInfo);
    sections.push(...lessonSections);

    // แบบทดสอบหลังเรียน
    const postTestSection = processPostTest(subjectData, progressInfo);
    if (postTestSection) {
      sections.push(postTestSection);
    }

    console.log("Processed sections:", sections);
    return sections;
  } catch (error) {
    console.error("Error processing subject data:", error);
    return [];
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลบทเรียน
export const fetchLessonData = async (
  lessonId: number,
  apiURL: string,
  currentLessonId: string,
  lessonData: SectionData[],
  setCurrentLessonData: (data: any) => void,
  setCurrentQuizData: (data: any) => void,
  setYoutubeId: (id: string) => void,
  setLessonData: (data: SectionData[]) => void
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ดึงข้อมูลบทเรียนพร้อมความก้าวหน้า
    const response = await axios.get(`${apiURL}/api/courses/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success) {
      console.log("Lesson data with progress fetched:", response.data.lesson);

      // ตั้งค่าข้อมูลบทเรียนพร้อมความก้าวหน้า
      setCurrentLessonData(response.data.lesson);

      // ตรวจสอบและจัดการกับแบบทดสอบท้ายบท
      if (response.data.lesson && (response.data.lesson.quiz_id || response.data.lesson.quiz)) {
        console.log("Lesson has quiz:", response.data.lesson.quiz || response.data.lesson.quiz_id);
        const quizData = response.data.lesson.quiz || { quiz_id: response.data.lesson.quiz_id };
        setCurrentQuizData(quizData);
      }

      // ดึง YouTube ID จาก URL
      const youtubeUrl = response.data.lesson.video_url;
      if (youtubeUrl) {
        const youtubeRegex =
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = youtubeUrl.match(youtubeRegex);

        if (match && match[1]) {
          console.log("YouTube ID extracted:", match[1]);
          setYoutubeId(match[1]);
        } else {
          console.error("Could not extract YouTube ID from URL:", youtubeUrl);
          setYoutubeId("BboMpayJomw");
        }
      } else {
        console.warn("No video URL found in lesson data");
        setYoutubeId("BboMpayJomw");
      }

      // อัพเดตสถานะความก้าวหน้าในข้อมูลบทเรียน
      if (response.data.lesson.progress) {
        const [sectionId, itemId] = currentLessonId.split("-").map(Number);
        const updatedLessonData = [...lessonData];
        const sectionIndex = updatedLessonData.findIndex((s) => s.id === sectionId);

        if (sectionIndex !== -1) {
          const itemIndex = updatedLessonData[sectionIndex].items.findIndex(
            (i) => i.id === itemId
          );

          if (itemIndex !== -1) {
            // อัพเดตสถานะความก้าวหน้าของบทเรียนนี้
            updatedLessonData[sectionIndex].items[itemIndex] = {
              ...updatedLessonData[sectionIndex].items[itemIndex],
              completed:
                response.data.lesson.progress.completed ||
                updatedLessonData[sectionIndex].items[itemIndex].completed,
              duration: response.data.lesson.progress.completed
                ? "100%"
                : `${response.data.lesson.progress.progress || 0}%`,
            };

            // ถ้าบทเรียนนี้เรียนจบแล้ว ให้ปลดล็อคบทเรียนถัดไป
            if (response.data.lesson.progress.completed) {
              // ตรวจสอบว่ามีแบบทดสอบท้ายบทหรือไม่
              const hasQuiz = response.data.lesson.quiz_id || response.data.lesson.quiz;

              // ถ้ามีแบบทดสอบท้ายบท ให้ปลดล็อคแบบทดสอบนั้น
              if (
                hasQuiz &&
                itemIndex + 1 < updatedLessonData[sectionIndex].items.length &&
                updatedLessonData[sectionIndex].items[itemIndex + 1].type === "quiz"
              ) {
                updatedLessonData[sectionIndex].items[itemIndex + 1] = {
                  ...updatedLessonData[sectionIndex].items[itemIndex + 1],
                  lock: false,
                };
              }
              // ถ้าไม่มีแบบทดสอบท้ายบท หรือเป็นรายการสุดท้ายในเซ็กชัน ให้ปลดล็อคบทเรียนในเซ็กชันถัดไป
              else if (
                itemIndex === updatedLessonData[sectionIndex].items.length - 1 ||
                (hasQuiz && itemIndex + 2 === updatedLessonData[sectionIndex].items.length)
              ) {
                const nextSectionIndex = sectionIndex + 1;
                if (
                  nextSectionIndex < updatedLessonData.length &&
                  updatedLessonData[nextSectionIndex].id !== 9999 &&
                  updatedLessonData[nextSectionIndex].items.length > 0
                ) {
                  updatedLessonData[nextSectionIndex].items[0] = {
                    ...updatedLessonData[nextSectionIndex].items[0],
                    lock: false,
                  };
                }
              }
            }

            // อัพเดตความก้าวหน้าของเซ็กชัน
            const totalItems = updatedLessonData[sectionIndex].items.length;
            const completedItems = updatedLessonData[sectionIndex].items.filter(
              (item) => item.completed
            ).length;
            const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

            updatedLessonData[sectionIndex] = {
              ...updatedLessonData[sectionIndex],
              count: `${Math.round(sectionProgress)}%`,
            };

            setLessonData(updatedLessonData);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching lesson data:", error);
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลแบบทดสอบ
export const fetchQuizData = async (
  quizId: number,
  apiURL: string,
  currentLessonId: string,
  lessonData: SectionData[],
  setCurrentQuizData: (data: any) => void,
  setLessonData: (data: SectionData[]) => void,
  fetchUserProgress: () => Promise<any>,
  setProgressData: (data: any) => void
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const apiEndpoint = `${apiURL}/api/courses/quizzes/${quizId}`;

    const response = await axios.get(apiEndpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.quiz) {
      setCurrentQuizData(response.data.quiz);
    } else if (response.data.success && response.data.data) {
      setCurrentQuizData(response.data.data);
    } else {
      console.error("Quiz data format not recognized");
    }

    // ตรวจสอบว่ามีข้อมูลความก้าวหน้าในการตอบกลับหรือไม่
    if (response.data.progress) {
      const [sectionId, itemId] = currentLessonId.split("-").map(Number);
      const updatedLessonData = [...lessonData];
      const sectionIndex = updatedLessonData.findIndex((s) => s.id === sectionId);

      if (sectionIndex !== -1) {
        const itemIndex = updatedLessonData[sectionIndex].items.findIndex(
          (i) => i.id === itemId
        );

        if (itemIndex !== -1) {
          updatedLessonData[sectionIndex].items[itemIndex] = {
            ...updatedLessonData[sectionIndex].items[itemIndex],
            completed:
              response.data.progress.completed ||
              updatedLessonData[sectionIndex].items[itemIndex].completed,
            duration: response.data.progress.completed
              ? "100%"
              : `${response.data.progress.progress || 0}%`,
          };

          // ถ้าเป็นแบบทดสอบก่อนเรียน และทำเสร็จแล้ว ให้ปลดล็อคบทเรียนแรก
          if (sectionId === 1 && response.data.progress.completed) {
            const firstLessonSectionIndex = updatedLessonData.findIndex(
              (s) => s.id > 1 && s.id < 9999
            );
            if (
              firstLessonSectionIndex !== -1 &&
              updatedLessonData[firstLessonSectionIndex].items.length > 0
            ) {
              updatedLessonData[firstLessonSectionIndex].items[0] = {
                ...updatedLessonData[firstLessonSectionIndex].items[0],
                lock: false,
              };
            }
          }
          // ถ้าเป็นแบบทดสอบท้ายบทเรียน และทำเสร็จแล้ว
          else if (sectionId !== 1 && sectionId !== 9999 && response.data.progress.completed) {
            // ถ้าเป็นแบบทดสอบสุดท้ายในเซ็กชัน ให้ปลดล็อคบทเรียนในเซ็กชันถัดไป
            if (itemIndex === updatedLessonData[sectionIndex].items.length - 1) {
              const nextSectionIndex = sectionIndex + 1;
              if (
                nextSectionIndex < updatedLessonData.length &&
                updatedLessonData[nextSectionIndex].id !== 9999 &&
                updatedLessonData[nextSectionIndex].items.length > 0
              ) {
                updatedLessonData[nextSectionIndex].items[0] = {
                  ...updatedLessonData[nextSectionIndex].items[0],
                  lock: false,
                };
              }
            }
            // ถ้าไม่ใช่แบบทดสอบสุดท้าย ให้ปลดล็อคบทเรียนถัดไปในเซ็กชันเดียวกัน
            else if (itemIndex + 1 < updatedLessonData[sectionIndex].items.length) {
              updatedLessonData[sectionIndex].items[itemIndex + 1] = {
                ...updatedLessonData[sectionIndex].items[itemIndex + 1],
                lock: false,
              };
            }
          }

          // ตรวจสอบว่าบทเรียนทั้งหมดเรียนจบแล้วหรือไม่ เพื่อปลดล็อคแบบทดสอบหลังเรียน
          if (response.data.progress.completed) {
            const allLessonsCompleted = updatedLessonData
              .filter((section) => section.id !== 1 && section.id !== 9999)
              .every((section) => section.items.every((item) => item.completed));

            if (allLessonsCompleted) {
              const postTestSectionIndex = updatedLessonData.findIndex(
                (s) => s.id === 9999
              );
              if (
                postTestSectionIndex !== -1 &&
                updatedLessonData[postTestSectionIndex].items.length > 0
              ) {
                updatedLessonData[postTestSectionIndex].items[0] = {
                  ...updatedLessonData[postTestSectionIndex].items[0],
                  lock: false,
                };
              }
            }
          }

          const totalItems = updatedLessonData[sectionIndex].items.length;
          const completedItems = updatedLessonData[sectionIndex].items.filter(
            (item) => item.completed
          ).length;
          const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

          updatedLessonData[sectionIndex] = {
            ...updatedLessonData[sectionIndex],
            count: `${Math.round(sectionProgress)}%`,
          };

          setLessonData(updatedLessonData);
        }
      }

      if (response.data.progress.completed) {
        fetchUserProgress().then((data) => {
          setProgressData(data);
        });
      }
    } else {
      // ถ้าไม่มีข้อมูลความก้าวหน้าในการตอบกลับ ให้ดึงข้อมูลความก้าวหน้าแยก
      try {
        const progressResponse = await axios.get(
          `${apiURL}/api/courses/quizzes/${quizId}/progress`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (progressResponse.data.success && progressResponse.data.progress) {
          const [sectionId, itemId] = currentLessonId.split("-").map(Number);
          const updatedLessonData = [...lessonData];
          const sectionIndex = updatedLessonData.findIndex((s) => s.id === sectionId);

          if (sectionIndex !== -1) {
            const itemIndex = updatedLessonData[sectionIndex].items.findIndex(
              (i) => i.id === itemId
            );

            if (itemIndex !== -1) {
              updatedLessonData[sectionIndex].items[itemIndex] = {
                ...updatedLessonData[sectionIndex].items[itemIndex],
                completed:
                  progressResponse.data.progress.completed ||
                  updatedLessonData[sectionIndex].items[itemIndex].completed,
                duration: progressResponse.data.progress.completed
                  ? "100%"
                  : `${progressResponse.data.progress.progress || 0}%`,
              };
              // ถ้าเป็นแบบทดสอบก่อนเรียน และทำเสร็จแล้ว ให้ปลดล็อคบทเรียนแรก
              if (sectionId === 1 && progressResponse.data.progress.completed) {
                const firstLessonSectionIndex = updatedLessonData.findIndex(
                  (s) => s.id > 1 && s.id < 9999
                );
                if (
                  firstLessonSectionIndex !== -1 &&
                  updatedLessonData[firstLessonSectionIndex].items.length > 0
                ) {
                  updatedLessonData[firstLessonSectionIndex].items[0] = {
                    ...updatedLessonData[firstLessonSectionIndex].items[0],
                    lock: false,
                  };
                }
              }

              const totalItems = updatedLessonData[sectionIndex].items.length;
              const completedItems = updatedLessonData[sectionIndex].items.filter(
                (item) => item.completed
              ).length;
              const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

              updatedLessonData[sectionIndex] = {
                ...updatedLessonData[sectionIndex],
                count: `${Math.round(sectionProgress)}%`,
              };

              setLessonData(updatedLessonData);
            }
          }

          if (progressResponse.data.progress.completed) {
            fetchUserProgress().then((data) => {
              setProgressData(data);
            });
          }
        }
      } catch (progressError) {
        console.error("Error fetching quiz progress:", progressError);
      }
    }
  } catch (error) {
    console.error("Error fetching quiz data:", error);
  }
};

// ฟังก์ชันสำหรับตรวจสอบว่าบทเรียนทั้งหมดเรียนจบแล้วหรือไม่
export const checkAllLessonsCompleted = (lessonData: SectionData[]) => {
  if (!lessonData || lessonData.length === 0) return false;

  return lessonData
    .filter((section) => section.id !== 1 && section.id !== 9999) // ไม่รวมแบบทดสอบก่อนเรียนและหลังเรียน
    .every((section) => section.items.every((item) => item.completed));
};

// ฟังก์ชันสำหรับหาบทเรียนถัดไปที่ควรเรียน
export const findNextLesson = (lessonData: SectionData[]) => {
  if (!lessonData || lessonData.length === 0) return null;

  // หาบทเรียนแรกที่ยังไม่เรียนจบและไม่ถูกล็อค
  for (const section of lessonData) {
    for (const item of section.items) {
      if (!item.completed && !item.lock) {
        return {
          sectionId: section.id,
          itemId: item.id,
          title: item.title,
          type: item.type,
          lessonId: item.lessonId,
          quizId: item.quizId,
        };
      }
    }
  }

  // ถ้าไม่พบบทเรียนที่ยังไม่เรียนจบ ให้ส่งคืนบทเรียนแรกที่ไม่ถูกล็อค
  for (const section of lessonData) {
    for (const item of section.items) {
      if (!item.lock) {
        return {
          sectionId: section.id,
          itemId: item.id,
          title: item.title,
          type: item.type,
          lessonId: item.lessonId,
          quizId: item.quizId,
        };
      }
    }
  }

  return null;
};

// ฟังก์ชันสำหรับคำนวณความก้าวหน้าทั้งหมด
export const calculateTotalProgress = (lessonData: SectionData[], progressData: any) => {
  if (progressData?.progress?.progress_percentage !== undefined) {
    return progressData.progress.progress_percentage;
  }

  let totalItems = 0;
  let completedItems = 0;

  lessonData.forEach((section) => {
    section.items.forEach((item) => {
      totalItems++;
      if (item.completed) {
        completedItems++;
      }
    });
  });

  return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
};

// ฟังก์ชันสำหรับอัปเดตความก้าวหน้าของเซ็กชัน
export const updateSectionProgress = (lessonData: SectionData[]) => {
  return lessonData.map((section) => {
    const totalItems = section.items.length;
    const completedItems = section.items.filter((item) => item.completed).length;
    const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return {
      ...section,
      count: `${Math.round(sectionProgress)}%`,
    };
  });
};

// ฟังก์ชันสำหรับตรวจสอบว่ามีแบบทดสอบท้ายบทหรือไม่
export const hasQuizAfterLesson = (lessonData: any) => {
  return lessonData && (lessonData.quiz_id || lessonData.quiz);
};

// ฟังก์ชันสำหรับหาแบบทดสอบท้ายบทของบทเรียน
export const findQuizForLesson = (lessonData: SectionData[], sectionId: number, itemId: number) => {
  const section = lessonData.find((s) => s.id === sectionId);
  if (!section) return null;

  const itemIndex = section.items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) return null;

  // ตรวจสอบว่ารายการถัดไปเป็น quiz หรือไม่
  if (itemIndex + 1 < section.items.length && section.items[itemIndex + 1].type === "quiz") {
    return section.items[itemIndex + 1];
  }

  return null;
};

// ฟังก์ชันสำหรับหาบทเรียนถัดไปหลังจากทำแบบทดสอบเสร็จ
export const findNextLessonAfterQuiz = (
  lessonData: SectionData[],
  sectionId: number,
  itemId: number
) => {
  const section = lessonData.find((s) => s.id === sectionId);
  if (!section) return null;

  const itemIndex = section.items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) return null;

  // ถ้ามีรายการถัดไปในเซ็กชันเดียวกัน
  if (itemIndex + 1 < section.items.length) {
    return {
      sectionId: section.id,
      itemId: section.items[itemIndex + 1].id,
      title: section.items[itemIndex + 1].title,
      type: section.items[itemIndex + 1].type,
      lessonId: section.items[itemIndex + 1].lessonId,
      quizId: section.items[itemIndex + 1].quizId,
    };
  }

  // ถ้าไม่มีรายการถัดไปในเซ็กชันเดียวกัน ให้หาเซ็กชันถัดไป
  const sectionIndex = lessonData.findIndex((s) => s.id === sectionId);
  if (sectionIndex !== -1 && sectionIndex + 1 < lessonData.length) {
    const nextSection = lessonData[sectionIndex + 1];
    if (nextSection.items.length > 0) {
      return {
        sectionId: nextSection.id,
        itemId: nextSection.items[0].id,
        title: nextSection.items[0].title,
        type: nextSection.items[0].type,
        lessonId: nextSection.items[0].lessonId,
        quizId: nextSection.items[0].quizId,
      };
    }
  }

  return null;
};

// ฟังก์ชันสำหรับตรวจสอบว่าเรียนจบรายวิชาแล้วหรือไม่
export const isSubjectCompleted = (progressData: any) => {
  return progressData?.progress?.progress_percentage === 100;
};