interface DataType {
   id: number;
   page: string;
   thumb: string;
   tag: string;
   review: string;
   title: string;
   author: string;
   price: number;
};

const inner_page_course_data: DataType[] = [
   {
      id: 1,
      page: "inner_1",
      thumb: "/assets/img/courses/course_thumb01.jpg",
      tag: "การพัฒนา",
      review: "(4.8 Reviews)",
      title: "การเรียนรู้ JavaScript ด้วยจินตนาการ",
      author: "David Millar",
      price: 15,
   },
   {
      id: 2,
      page: "inner_1",
      thumb: "/assets/img/courses/course_thumb02.jpg",
      tag: "การออกแบบ",
      review: "(4.5 Reviews)",
      title: "การออกแบบกราฟิกที่สมบูรณ์สำหรับมือใหม่",
      author: "David Millar",
      price: 19,
   },
   {
      id: 3,
      page: "inner_1",
      thumb: "/assets/img/courses/course_thumb03.jpg",
      tag: "การตลาด",
      review: "(4.3 Reviews)",
      title: "การเรียนรู้การตลาดดิจิทัลบน Facebook",
      author: "David Millar",
      price: 24,
   },
   {
      id: 4,
      page: "inner_1",
      thumb: "/assets/img/courses/course_thumb04.jpg",
      tag: "ธุรกิจ",
      review: "(4.8 Reviews)",
      title: "หลักสูตรการฝึกอบรมนักวิเคราะห์การเงินและการลงทุน",
      author: "David Millar",
      price: 12,
   },
   {
      id: 5,
      page: "inner_1",
      thumb: "/assets/img/courses/course_thumb05.jpg",
      tag: "วิทยาศาสตร์ข้อมูล",
      review: "(4.5 Reviews)",
      title: "มาสเตอร์คลาสการวิเคราะห์และการสร้างภาพข้อมูล",
      author: "David Millar",
      price: 27,
   },
];

export default inner_page_course_data