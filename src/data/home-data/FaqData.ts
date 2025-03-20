interface DataType {
   id: number;
   page: string;
   question: string;
   answer: string;
   showAnswer: boolean;
};

const faq_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      question: "MOOC คืออะไร?",
      answer: "MOOC คือหลักสูตรออนไลน์ที่เปิดให้เรียนฟรีหรือมีค่าใช้จ่ายต่ำ โดยมีเนื้อหาคุณภาพจากมหาวิทยาลัยหรือผู้เชี่ยวชาญในสาขาต่าง ๆ ที่สามารถเรียนได้ทุกที่ทุกเวลา",
      showAnswer:false,
   },
   {
      id: 2,
      page: "home_1",
      question: "ต้องเสียค่าใช้จ่ายหรือไม่?",
      answer: "ส่วนใหญ่ MOOC เปิดให้เรียนฟรี แต่บางหลักสูตรอาจมีค่าใช้จ่ายสำหรับการรับใบประกาศนียบัตร (Certificate) หรือเนื้อหาเพิ่มเติม",
      showAnswer:false,
   },
   {
      id: 3,
      page: "home_1",
      question: "ต้องมีคุณสมบัติอะไรในการสมัครเรียน?",
      answer: "ไม่จำเป็นต้องมีคุณสมบัติพิเศษ หลักสูตร MOOC เปิดให้ทุกคนเรียนได้ ไม่ว่าจะมีพื้นฐานในสาขาวิชานั้นหรือไม่",
      showAnswer:false,
   },
   {
      id: 4,
      page: "home_1",
      question: "จะได้รับใบประกาศนียบัตรหรือไม่?",
      answer: "ผู้เรียนสามารถรับใบประกาศนียบัตรได้หากผ่านเกณฑ์ที่กำหนด เช่น การทำแบบฝึกหัดหรือสอบตามที่หลักสูตรระบุ (แต่บางกรณีอาจต้องชำระเงิน)",
      showAnswer:false,
   },
];

export default faq_data;