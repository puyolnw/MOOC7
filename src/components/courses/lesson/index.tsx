import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import LessonArea from "./LessonArea";

const Lesson = () => {
   const { subjectId } = useParams();
   const [isLoading, setIsLoading] = useState(true);
   const [subjectData, setSubjectData] = useState<any>(null);
   const [progressData, setProgressData] = useState<any>(null);
   const [error, setError] = useState<string | null>(null);
   const apiURL = import.meta.env.VITE_API_URL;

   // โหลดข้อมูลทันทีที่เข้าหน้านี้
   useEffect(() => {
      const fetchData = async () => {
         console.log("Fetching data for subject:", subjectId);
         
         if (!subjectId) {
            setError("ไม่พบรหัสรายวิชา");
            setIsLoading(false);
            return;
         }
         
         setIsLoading(true);
         setError(null);
         
         const token = localStorage.getItem("token");
         const headers = token ? { Authorization: `Bearer ${token}` } : {};
         
         try {
            // ดึงข้อมูลรายวิชาและความก้าวหน้าพร้อมกัน
            const [subjectResponse, progressResponse] = await Promise.all([
               // ดึงข้อมูลรายวิชา - ใช้ API ที่มีอยู่
               axios.get(`${apiURL}/api/courses/subjects/${subjectId}`, { headers }),
               
               // ดึงข้อมูลความก้าวหน้าของวิชา - ใช้ API จาก back_creditbank
               token ? axios.get(`${apiURL}/api/courses/learn/subject/${subjectId}/progress`, { headers }) 
                     : Promise.resolve({ data: { success: false } })
            ]);
            
            // จัดการข้อมูลรายวิชา
            if (subjectResponse.data.success) {
               console.log("Subject data loaded:", subjectResponse.data);
               setSubjectData(subjectResponse.data.subject);
               
               if (!subjectResponse.data.subject) {
                  setError("ไม่พบข้อมูลรายวิชา");
               }
            } else {
               setError(subjectResponse.data.message || "ไม่สามารถโหลดข้อมูลรายวิชาได้");
            }
            
            // จัดการข้อมูลความก้าวหน้า
            if (progressResponse.data.success) {
               console.log("Progress data loaded:", progressResponse.data);
               
               // ดึงข้อมูลความก้าวหน้าของบทเรียนและแบบทดสอบ
               if (token && subjectResponse.data.subject?.lessons) {
                  try {
                     const lessons = subjectResponse.data.subject.lessons;
                     // สร้าง array ของ Promise สำหรับดึงข้อมูลความก้าวหน้าของแต่ละบทเรียน
                     const lessonProgressPromises = lessons.map((lesson: any) => 
                        axios.get(`${apiURL}/api/courses/learn/lesson/${lesson.lesson_id}/progress`, { headers })
                     );
                     
                     // ดึงข้อมูลความก้าวหน้าของบทเรียนทั้งหมดพร้อมกัน
                     const lessonProgressResponses = await Promise.all(lessonProgressPromises);
                     
                     // แปลงผลลัพธ์ให้อยู่ในรูปแบบที่ต้องการ
                     const lessonProgress = lessonProgressResponses.map((response, index) => {
                        const lessonId = lessons[index].lesson_id;
                        return {
                           lesson_id: lessonId,
                           progress: response.data.success ? response.data.progress : 0,
                           completed: response.data.success ? (response.data.progress >= 100) : false
                        };
                     });
                     
                     // ดึงข้อมูลความก้าวหน้าของ quiz ที่เกี่ยวข้อง
                     const quizIds: number[] = [];
                     
                     // เพิ่ม pre-test และ post-test ถ้ามี
                     if (subjectResponse.data.subject.pre_test_id) quizIds.push(subjectResponse.data.subject.pre_test_id);
                     if (subjectResponse.data.subject.post_test_id) quizIds.push(subjectResponse.data.subject.post_test_id);
                     
                     // เพิ่ม quiz ท้ายบทเรียน
                     lessons.forEach((lesson: any) => {
                        if (lesson.quiz_id) quizIds.push(lesson.quiz_id);
                     });
                     
                     // ดึงข้อมูลความก้าวหน้าของ quiz ทั้งหมด
                     const quizProgress = [];
                     
                     if (quizIds.length > 0) {
                        for (const quizId of quizIds) {
                           try {
                              const quizProgressResponse = await axios.get(
                                 `${apiURL}/api/courses/learn/quiz/${quizId}/progress`,
                                 { headers }
                              );
                              
                              if (quizProgressResponse.data.success) {
                                 quizProgress.push({
                                    quiz_id: quizId,
                                    progress: quizProgressResponse.data.progress || 0,
                                    completed: quizProgressResponse.data.completed || false,
                                    passed: quizProgressResponse.data.passed || false
                                 });
                              }
                           } catch (error) {
                              console.error(`Error fetching quiz ${quizId} progress:`, error);
                           }
                        }
                     }
                     
                     // รวมข้อมูลความก้าวหน้าทั้งหมด
                     const completeProgressData = {
                        ...progressResponse.data,
                        lessonProgress,
                        quizProgress
                     };
                     
                     setProgressData(completeProgressData);
                  } catch (progressError) {
                     console.error("Error fetching detailed progress:", progressError);
                     setProgressData(progressResponse.data);
                  }
               } else {
                  setProgressData(progressResponse.data);
               }
            }
         } catch (error: any) {
            console.error("Error fetching data:", error);
            
            if (error.response) {
               console.error("Error response:", error.response.data);
               
               if (error.response.status === 404) {
                  setError("ไม่พบรายวิชาที่ระบุ");
               } else if (error.response.status === 401) {
                  setError("คุณไม่มีสิทธิ์เข้าถึงรายวิชานี้");
               } else {
                  setError(`เกิดข้อผิดพลาด: ${error.response.data.message || "ไม่สามารถโหลดข้อมูลรายวิชาได้"}`);
               }
            } else {
               setError("เกิดข้อผิดพลาดในการโหลดข้อมูลรายวิชา");
            }
         } finally {
            setIsLoading(false);
         }
      };
      
      fetchData();
      
      // ลบการรีเฟรชอัตโนมัติ หรือเพิ่มเวลาให้นานขึ้น (เช่น 5 นาที)
      // const intervalId = setInterval(() => {
      //    console.log("Auto-refreshing data...");
      //    fetchData();
      // }, 300000); // 5 นาที
      
      // return () => {
      //    clearInterval(intervalId);
      // };
      
   }, [subjectId, apiURL]); // ลบ subjectData?.lessons ออกจาก dependency array

   // ฟังก์ชันสำหรับรีเฟรชข้อมูลความก้าวหน้า (ส่งให้ LessonArea ใช้)
   const refreshProgress = async () => {
      if (!subjectId) return null;
      
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      try {
         console.log("Manually refreshing progress data...");
         
         // ใช้ API จาก back_creditbank
         const response = await axios.get(`${apiURL}/api/courses/learn/subject/${subjectId}/progress`, {
            headers: { Authorization: `Bearer ${token}` }
         });
         
         if (response.data.success) {
            console.log("New progress data:", response.data);
            
            // ดึงข้อมูลความก้าวหน้าของบทเรียนและแบบทดสอบเพิ่มเติม
            if (subjectData?.lessons) {
               try {
                  // สร้าง array ของ Promise สำหรับดึงข้อมูลความก้าวหน้าของแต่ละบทเรียน
                  const lessonProgressPromises = subjectData.lessons.map((lesson: any) => 
                     axios.get(`${apiURL}/api/courses/learn/lesson/${lesson.lesson_id}/progress`, {
                        headers: { Authorization: `Bearer ${token}` }
                     })
                  );
                  
                  // ดึงข้อมูลความก้าวหน้าของบทเรียนทั้งหมดพร้อมกัน
                  const lessonProgressResponses = await Promise.all(lessonProgressPromises);
                  
                  // แปลงผลลัพธ์ให้อยู่ในรูปแบบที่ต้องการ
                  const lessonProgress = lessonProgressResponses.map((response, index) => {
                     const lessonId = subjectData.lessons[index].lesson_id;
                     return {
                        lesson_id: lessonId,
                        progress: response.data.success ? response.data.progress : 0,
                        completed: response.data.success ? (response.data.progress >= 100) : false
                     };
                  });
                  
                  // ดึงข้อมูลความก้าวหน้าของ quiz ที่เกี่ยวข้อง
                  const quizIds: number[] = [];
                  
                  // เพิ่ม pre-test และ post-test ถ้ามี
                  if (subjectData.pre_test_id) quizIds.push(subjectData.pre_test_id);
                  if (subjectData.post_test_id) quizIds.push(subjectData.post_test_id);
                  
                  // เพิ่ม quiz ท้ายบทเรียน
                  subjectData.lessons.forEach((lesson: any) => {
                     if (lesson.quiz_id) quizIds.push(lesson.quiz_id);
                  });
                  
                  // ดึงข้อมูลความก้าวหน้าของ quiz ทั้งหมด
                  const quizProgress = [];
                  
                  if (quizIds.length > 0) {
                     for (const quizId of quizIds) {
                        try {
                           const quizProgressResponse = await axios.get(
                              `${apiURL}/api/courses/learn/quiz/${quizId}/progress`,
                              { headers: { Authorization: `Bearer ${token}` } }
                           );
                           
                           if (quizProgressResponse.data.success) {
                              quizProgress.push({
                                 quiz_id: quizId,
                                 progress: quizProgressResponse.data.progress || 0,
                                 completed: quizProgressResponse.data.completed || false,
                                 passed: quizProgressResponse.data.passed || false
                              });
                           }
                        } catch (error) {
                           console.error(`Error fetching quiz ${quizId} progress:`, error);
                        }
                     }
                  }
                  
                                   // รวมข้อมูลความก้าวหน้าทั้งหมด
                                   const completeProgressData = {
                                    ...response.data,
                                    lessonProgress,
                                    quizProgress
                                 };
                                 
                                 setProgressData(completeProgressData);
                                 return completeProgressData;
                              } catch (progressError) {
                                 console.error("Error fetching detailed progress:", progressError);
                                 setProgressData(response.data);
                                 return response.data;
                              }
                           } else {
                              setProgressData(response.data);
                              return response.data;
                           }
                        }
                     } catch (error) {
                        console.error("Error refreshing progress:", error);
                     }
                     return null;
                  };
               
                  return (
                     <>
                        <HeaderOne />
                        <main className="main-area fix">
                           <LessonArea 
                              isLoading={isLoading}
                              subjectData={subjectData}
                              progressData={progressData}
                              error={error}
                              subjectId={subjectId}
                              refreshProgress={refreshProgress}
                           />
                        </main>
                        <FooterOne style={false} style_2={true} />
                     </>
                  )
               }
               
               export default Lesson
               
