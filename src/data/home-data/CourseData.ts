interface DataType {
   id: number;
   page: string;
   course_details: {
      id: number;
      thumb: string;
      tag: string;
      review: string;
      title: string;
      author?: string;
      price: number;
      lesson?: string;
      minute?: string;
   }[]
};

const course_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      course_details: [
         {
            id: 1,
            thumb: "/assets/img/courses/course_thumb01.jpg",
            tag: "การพัฒนา",
            review: "(4.8 Reviews)",
            title: "สาขาวิชาเทคโนโลยีชีวภาพ",
            author: "รองศาสตราจารย์ ดร.ปิยรัตน์ นามเสนา",
            price: 15,
         },
         {
            id: 2,
            thumb: "/assets/img/courses/course_thumb03.jpg",
            tag: "ออกแบบ",
            review: "(4.5 Reviews)",
            title: "สาธารณสุขชุมชน",
            author: "อาจารย์สุรัตนา เหล่าไชย",
            price: 19,
         },
         {
            id: 3,
            thumb: "/assets/img/courses/course_thumb02.jpg",
            tag: "สถิติประยุกต์",
            review: "(4.3 Reviews)",
            title: "สถิติประยุกต์",
            author: "อาจารย์ ดร.ปรมาภรณ์ แสงภารา",
            price: 24,
         },
         {
            id: 4,
            thumb: "/assets/img/courses/course_thumb04.jpg",
            tag: "ชีววิทยา",
            review: "(4.8 Reviews)",
            title: "หลักสูตรอบรมนักวิเคราะห์การเงินและการลงทุน",
            author: "รองศาสตราจารย์ ดร.วิลาวัลย์ บุณย์ศุภา",
            price: 12,
         },
         // {
         //    id: 5,
         //    thumb: "/assets/img/courses/course_thumb05.jpg",
         //    tag: "วิทยาศาสตร์ข้อมูล",
         //    review: "(4.5 Reviews)",
         //    title: "หลักสูตร Masterclass สำหรับการวิเคราะห์และแสดงภาพข้อมูล",
         //    author: "David Millar",
         //    price: 27,
         // },
         // {
         //    id: 6,
         //    thumb: "/assets/img/courses/course_thumb06.jpg",
         //    tag: "คณิตศาสตร์",
         //    review: "(4.7 Reviews)",
         //    title: "หลักสูตรหลักสูตรการฝึกฝนพื้นฐานคณิตศาสตร์",
         //    author: "David Millar",
         //    price: 10,
         // },
         // {
         //    id: 7,
         //    thumb: "/assets/img/courses/course_thumb04.jpg",
         //    tag: "ธุรกิจ",
         //    review: "(4.8 Reviews)",
         //    title: "หลักสูตรการฝึกอบรมนักวิเคราะห์การเงินและการลงทุน",
         //    author: "David Millar",
         //    price: 12,
         // },
      ]
   },
   // {
   //    id: 2,
   //    page: "home_1",
   //    course_details: [
   //       {
   //          id: 1,
   //          thumb: "/assets/img/courses/course_thumb04.jpg",
   //          tag: "ธุรกิจ",
   //          review: "(4.8 Reviews)",
   //          title: "หลักสูตรอบรมนักวิเคราะห์การเงินและการลงทุน",
   //          author: "David Millar",
   //          price: 12,
   //       },
   //       {
   //          id: 2,
   //          thumb: "/assets/img/courses/course_thumb05.jpg",
   //          tag: "วิทยาศาสตร์ข้อมูล",
   //          review: "(4.5 Reviews)",
   //          title: "หลักสูตร Masterclass สำหรับการวิเคราะห์และแสดงภาพข้อมูล",
   //          author: "David Millar",
   //          price: 27,
   //       },
   //       {
   //          id: 3,
   //          thumb: "/assets/img/courses/course_thumb06.jpg",
   //          tag: "คณิตศาสตร์",
   //          review: "(4.7 Reviews)",
   //          title: "หลักสูตรการฝึกฝนพื้นฐานคณิตศาสตร์",
   //          author: "David Millar",
   //          price: 10,
   //       },
   //       {
   //          id: 4,
   //          thumb: "/assets/img/courses/course_thumb01.jpg",
   //          tag: "การพัฒนา",
   //          review: "(4.8 Reviews)",
   //          title: "การเรียนรู้ JavaScript ด้วยจินตนาการ",
   //          author: "David Millar",
   //          price: 15,
   //       },
   //       {
   //          id: 5,
   //          thumb: "/assets/img/courses/course_thumb02.jpg",
   //          tag: "ออกแบบ",
   //          review: "(4.5 Reviews)",
   //          title: "การออกแบบกราฟิกที่สมบูรณ์สำหรับมือใหม่",
   //          author: "David Millar",
   //          price: 19,
   //       },
   //       {
   //          id: 6,
   //          thumb: "/assets/img/courses/course_thumb03.jpg",
   //          tag: "การตลาด",
   //          review: "(4.3 Reviews)",
   //          title: "การเรียนรู้การตลาดดิจิทัลบน Facebook",
   //          author: "David Millar",
   //          price: 24,
   //       },
   //       {
   //          id: 7,
   //          thumb: "/assets/img/courses/course_thumb04.jpg",
   //          tag: "ธุรกิจ",
   //          review: "(4.8 Reviews)",
   //          title: "หลักสูตรอบรมนักวิเคราะห์การเงินและการลงทุน",
   //          author: "David Millar",
   //          price: 12,
   //       },
   //    ]
   // },
   // {
   //    id: 3,
   //    page: "home_1",
   //    course_details: [
   //       {
   //          id: 1,
   //          thumb: "/assets/img/courses/course_thumb01.jpg",
   //          tag: "การพัฒนา",
   //          review: "(4.8 Reviews)",
   //          title: "การเรียนรู้ JavaScript ด้วยจินตนาการ",
   //          author: "David Millar",
   //          price: 15,
   //       },
   //       {
   //          id: 2,
   //          thumb: "/assets/img/courses/course_thumb02.jpg",
   //          tag: "ออกแบบ",
   //          review: "(4.5 Reviews)",
   //          title: "การออกแบบกราฟิกที่สมบูรณ์สำหรับมือใหม่",
   //          author: "David Millar",
   //          price: 19,
   //       },
   //       {
   //          id: 3,
   //          thumb: "/assets/img/courses/course_thumb03.jpg",
   //          tag: "การตลาด",
   //          review: "(4.3 Reviews)",
   //          title: "การเรียนรู้การตลาดดิจิทัลบน Facebook",
   //          author: "David Millar",
   //          price: 24,
   //       },
   //       {
   //          id: 4,
   //          thumb: "/assets/img/courses/course_thumb04.jpg",
   //          tag: "ธุรกิจ",
   //          review: "(4.8 Reviews)",
   //          title: "หลักสูตรอบรมนักวิเคราะห์การเงินและการลงทุน",
   //          author: "David Millar",
   //          price: 12,
   //       },
   //       {
   //          id: 5,
   //          thumb: "/assets/img/courses/course_thumb05.jpg",
   //          tag: "วิทยาศาสตร์ข้อมูล",
   //          review: "(4.5 Reviews)",
   //          title: "หลักสูตร Masterclass สำหรับการวิเคราะห์และแสดงภาพข้อมูล",
   //          author: "David Millar",
   //          price: 27,
   //       },
   //       {
   //          id: 6,
   //          thumb: "/assets/img/courses/course_thumb06.jpg",
   //          tag: "คณิตศาสตร์",
   //          review: "(4.7 Reviews)",
   //          title: "หลักสูตรการฝึกฝนพื้นฐานคณิตศาสตร์",
   //          author: "David Millar",
   //          price: 10,
   //       },
   //       {
   //          id: 7,
   //          thumb: "/assets/img/courses/course_thumb04.jpg",
   //          tag: "ธุรกิจ",
   //          review: "(4.8 Reviews)",
   //          title: "หลักสูตรอบรมนักวิเคราะห์การเงินและการลงทุน",
   //          author: "David Millar",
   //          price: 12,
   //       },
   //    ]
   // },
   // {
   //    id: 4,
   //    page: "home_1",
   //    course_details: [
   //       {
   //          id: 1,
   //          thumb: "/assets/img/courses/course_thumb04.jpg",
   //          tag: "ธุรกิจ",
   //          review: "(4.8 Reviews)",
   //          title: "หลักสูตรอบรมนักวิเคราะห์การเงินและการลงทุน",
   //          author: "David Millar",
   //          price: 12,
   //       },
   //       {
   //          id: 2,
   //          thumb: "/assets/img/courses/course_thumb05.jpg",
   //          tag: "วิทยาศาสตร์ข้อมูล",
   //          review: "(4.5 Reviews)",
   //          title: "หลักสูตร Masterclass สำหรับการวิเคราะห์และแสดงภาพข้อมูล",
   //          author: "David Millar",
   //          price: 27,
   //       },
   //       {
   //          id: 3,
   //          thumb: "/assets/img/courses/course_thumb06.jpg",
   //          tag: "คณิตศาสตร์",
   //          review: "(4.7 Reviews)",
   //          title: "หลักสูตรการฝึกฝนพื้นฐานคณิตศาสตร์",
   //          author: "David Millar",
   //          price: 10,
   //       },
   //       {
   //          id: 4,
   //          thumb: "/assets/img/courses/course_thumb01.jpg",
   //          tag: "การพัฒนา",
   //          review: "(4.8 Reviews)",
   //          title: "การเรียนรู้ JavaScript ด้วยจินตนาการ",
   //          author: "David Millar",
   //          price: 15,
   //       },
   //       {
   //          id: 5,
   //          thumb: "/assets/img/courses/course_thumb02.jpg",
   //          tag: "ออกแบบ",
   //          review: "(4.5 Reviews)",
   //          title: "การออกแบบกราฟิกที่สมบูรณ์สำหรับมือใหม่",
   //          author: "David Millar",
   //          price: 19,
   //       },
   //       {
   //          id: 6,
   //          thumb: "/assets/img/courses/course_thumb03.jpg",
   //          tag: "การตลาด",
   //          review: "(4.3 Reviews)",
   //          title: "การเรียนรู้การตลาดดิจิทัลบน Facebook",
   //          author: "David Millar",
   //          price: 24,
   //       },
   //       {
   //          id: 7,
   //          thumb: "/assets/img/courses/course_thumb04.jpg",
   //          tag: "ธุรกิจ",
   //          review: "(4.8 Reviews)",
   //          title: "หลักสูตรอบรมนักวิเคราะห์การเงินและการลงทุน",
   //          author: "David Millar",
   //          price: 12,
   //       },
   //    ]
   // },

   // // home_8

   // {
   //    id: 1,
   //    page: "home_8",
   //    course_details: [
   //       {
   //          id: 1,
   //          thumb: "/assets/img/courses/h8_course_thumb01.jpg",
   //          tag: "Chinese",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 75,
   //          lesson: "05",
   //          minute: "34",
   //       },
   //       {
   //          id: 2,
   //          thumb: "/assets/img/courses/h8_course_thumb02.jpg",
   //          tag: "Dessert",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 22,
   //          lesson: "05",
   //          minute: "20",
   //       },
   //       {
   //          id: 3,
   //          thumb: "/assets/img/courses/h8_course_thumb03.jpg",
   //          tag: "Pizza",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 19,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 4,
   //          thumb: "/assets/img/courses/h8_course_thumb04.jpg",
   //          tag: "Italian",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 79,
   //          lesson: "05",
   //          minute: "304",
   //       },
   //       {
   //          id: 5,
   //          thumb: "/assets/img/courses/h8_course_thumb05.jpg",
   //          tag: "Pizza",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 49,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 6,
   //          thumb: "/assets/img/courses/h8_course_thumb06.jpg",
   //          tag: "Chinese",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 25,
   //          lesson: "05",
   //          minute: "44",
   //       },
   //       {
   //          id: 7,
   //          thumb: "/assets/img/courses/h8_course_thumb07.jpg",
   //          tag: "Dessert",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 59,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 8,
   //          thumb: "/assets/img/courses/h8_course_thumb02.jpg",
   //          tag: "Italian",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 15,
   //          lesson: "05",
   //          minute: "22",
   //       },
   //    ]
   // },
   // {
   //    id: 2,
   //    page: "home_8",
   //    course_details: [
   //       {
   //          id: 1,
   //          thumb: "/assets/img/courses/h8_course_thumb05.jpg",
   //          tag: "Pizza",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 49,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 2,
   //          thumb: "/assets/img/courses/h8_course_thumb06.jpg",
   //          tag: "Chinese",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 25,
   //          lesson: "05",
   //          minute: "44",
   //       },
   //       {
   //          id: 3,
   //          thumb: "/assets/img/courses/h8_course_thumb07.jpg",
   //          tag: "Dessert",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 59,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 4,
   //          thumb: "/assets/img/courses/h8_course_thumb01.jpg",
   //          tag: "Italian",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 15,
   //          lesson: "05",
   //          minute: "22",
   //       },
   //       {
   //          id: 5,
   //          thumb: "/assets/img/courses/h8_course_thumb01.jpg",
   //          tag: "Chinese",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 75,
   //          lesson: "05",
   //          minute: "34",
   //       },
   //       {
   //          id: 6,
   //          thumb: "/assets/img/courses/h8_course_thumb02.jpg",
   //          tag: "Dessert",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 22,
   //          lesson: "05",
   //          minute: "20",
   //       },
   //       {
   //          id: 7,
   //          thumb: "/assets/img/courses/h8_course_thumb03.jpg",
   //          tag: "Pizza",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 19,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 8,
   //          thumb: "/assets/img/courses/h8_course_thumb04.jpg",
   //          tag: "Italian",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 79,
   //          lesson: "05",
   //          minute: "304",
   //       },
   //    ]
   // },
   // {
   //    id: 3,
   //    page: "home_8",
   //    course_details: [
   //       {
   //          id: 1,
   //          thumb: "/assets/img/courses/h8_course_thumb01.jpg",
   //          tag: "Chinese",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 75,
   //          lesson: "05",
   //          minute: "34",
   //       },
   //       {
   //          id: 2,
   //          thumb: "/assets/img/courses/h8_course_thumb02.jpg",
   //          tag: "Dessert",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 22,
   //          lesson: "05",
   //          minute: "20",
   //       },
   //       {
   //          id: 3,
   //          thumb: "/assets/img/courses/h8_course_thumb03.jpg",
   //          tag: "Pizza",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 19,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 4,
   //          thumb: "/assets/img/courses/h8_course_thumb04.jpg",
   //          tag: "Italian",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 79,
   //          lesson: "05",
   //          minute: "304",
   //       },
   //       {
   //          id: 5,
   //          thumb: "/assets/img/courses/h8_course_thumb05.jpg",
   //          tag: "Pizza",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 49,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 6,
   //          thumb: "/assets/img/courses/h8_course_thumb06.jpg",
   //          tag: "Chinese",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 25,
   //          lesson: "05",
   //          minute: "44",
   //       },
   //       {
   //          id: 7,
   //          thumb: "/assets/img/courses/h8_course_thumb07.jpg",
   //          tag: "Dessert",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 59,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 8,
   //          thumb: "/assets/img/courses/h8_course_thumb01.jpg",
   //          tag: "Italian",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 15,
   //          lesson: "05",
   //          minute: "22",
   //       },
   //    ]
   // },
   // {
   //    id: 4,
   //    page: "home_8",
   //    course_details: [
   //       {
   //          id: 1,
   //          thumb: "/assets/img/courses/h8_course_thumb05.jpg",
   //          tag: "Pizza",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 49,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 2,
   //          thumb: "/assets/img/courses/h8_course_thumb06.jpg",
   //          tag: "Chinese",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 25,
   //          lesson: "05",
   //          minute: "44",
   //       },
   //       {
   //          id: 3,
   //          thumb: "/assets/img/courses/h8_course_thumb07.jpg",
   //          tag: "Dessert",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 59,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 4,
   //          thumb: "/assets/img/courses/h8_course_thumb01.jpg",
   //          tag: "Italian",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 15,
   //          lesson: "05",
   //          minute: "22",
   //       },
   //       {
   //          id: 5,
   //          thumb: "/assets/img/courses/h8_course_thumb01.jpg",
   //          tag: "Chinese",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 75,
   //          lesson: "05",
   //          minute: "34",
   //       },
   //       {
   //          id: 6,
   //          thumb: "/assets/img/courses/h8_course_thumb02.jpg",
   //          tag: "Dessert",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 22,
   //          lesson: "05",
   //          minute: "20",
   //       },
   //       {
   //          id: 7,
   //          thumb: "/assets/img/courses/h8_course_thumb03.jpg",
   //          tag: "Pizza",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 19,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 8,
   //          thumb: "/assets/img/courses/h8_course_thumb04.jpg",
   //          tag: "Italian",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 79,
   //          lesson: "05",
   //          minute: "304",
   //       },
   //    ]
   // },
   // {
   //    id: 5,
   //    page: "home_8",
   //    course_details: [
   //       {
   //          id: 1,
   //          thumb: "/assets/img/courses/h8_course_thumb01.jpg",
   //          tag: "Italian",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 15,
   //          lesson: "05",
   //          minute: "22",
   //       },
   //       {
   //          id: 2,
   //          thumb: "/assets/img/courses/h8_course_thumb01.jpg",
   //          tag: "Chinese",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 75,
   //          lesson: "05",
   //          minute: "34",
   //       },
   //       {
   //          id: 3,
   //          thumb: "/assets/img/courses/h8_course_thumb02.jpg",
   //          tag: "Dessert",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 22,
   //          lesson: "05",
   //          minute: "20",
   //       },
   //       {
   //          id: 4,
   //          thumb: "/assets/img/courses/h8_course_thumb05.jpg",
   //          tag: "Pizza",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 49,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 5,
   //          thumb: "/assets/img/courses/h8_course_thumb06.jpg",
   //          tag: "Chinese",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 25,
   //          lesson: "05",
   //          minute: "44",
   //       },
   //       {
   //          id: 6,
   //          thumb: "/assets/img/courses/h8_course_thumb07.jpg",
   //          tag: "Dessert",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 59,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 7,
   //          thumb: "/assets/img/courses/h8_course_thumb03.jpg",
   //          tag: "Pizza",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 19,
   //          lesson: "05",
   //          minute: "30",
   //       },
   //       {
   //          id: 8,
   //          thumb: "/assets/img/courses/h8_course_thumb04.jpg",
   //          tag: "Italian",
   //          review: "(4.8 Reviews)",
   //          title: "It Statistics วิทยาศาสตร์ข้อมูล And ธุรกิจ Analysis",
   //          price: 79,
   //          lesson: "05",
   //          minute: "304",
   //       },
   //    ]
   // },
];

export default course_data;