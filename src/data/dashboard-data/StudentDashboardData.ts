interface DataType {
   id: number;
   thumb: string;
   title: string;
   tag: string;
   avatar_thumb: string;
   avatar_name: string;
   review: string;
   skill: number;
   book: string;
   time: string;
   progress: number;
   mortarboard: string;
}[]

const student_dashboard_data: DataType[] = [
   {
      id: 1,
      thumb: "/assets/img/courses/course_thumb02.jpg",
      title: "สถิติประยุกต์",
      tag: "สถิตประยุกต์",
      avatar_thumb: "/assets/img/courses/course_author02.png",
      avatar_name: "ดร.ปรมาภรณ์ แสงภารา",
      review: "(4.5 Reviews)",
      skill: 88,
      book: "05",
      time: "11h 20m",
      mortarboard: "22",
      progress: 88,
   },
   // {
   //    id: 2,
   //    thumb: "/assets/img/courses/course_thumb02.jpg",
   //    title: "การออกแบบกราฟิกที่สมบูรณ์แบบสำหรับผู้เริ่มต้น",
   //    tag: "การออกแบบ",
   //    avatar_thumb: "/assets/img/courses/course_author002.png",
   //    avatar_name: "Wilson",
   //    review: "(4.5 Reviews)",
   //    skill: 70,
   //    book: "60",
   //    time: "70h 45m",
   //    mortarboard: "202",
   //    progress: 70,
   // },
   // {
   //    id: 3,
   //    thumb: "/assets/img/courses/course_thumb03.jpg",
   //    title: "การเรียนรู้ JavaScript ด้วยจินตนาการ",
   //    tag: "วิทยาศาสตร์ข้อมูล",
   //    avatar_thumb: "/assets/img/courses/course_author003.png",
   //    avatar_name: "Warren",
   //    review: "(4.5 Reviews)",
   //    skill: 95,
   //    book: "08",
   //    time: "18h 20m",
   //    mortarboard: "66",
   //    progress: 95,
   // },
];

export default student_dashboard_data;