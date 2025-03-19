interface DataType {
   id: number;
   icon: string;
   count: number;
   title: string;
};

const dashboard_count_data: DataType[] = [
   {
      id: 1,
      icon: "skillgro-book",
      count: 30,
      title: "หลักสูตรที่ลงทะเบียน",
   },
   {
      id: 2,
      icon: "skillgro-tutorial",
      count: 10,
      title: "หลักสูตรที่กำลังดำเนินอยู่",
   },
   {
      id: 3,
      icon: "skillgro-diploma-1",
      count: 7,
      title: " หลักสูตรที่สำเร็จแล้ว",
   },
   {
      id: 4,
      icon: "skillgro-group",
      count: 160,
      title: "นักเรียนทั้งหมด",
   },
   {
      id: 5,
      icon: "skillgro-notepad",
      count: 30,
      title: "หลักสูตรทั้งหมด",
   },

];

export default dashboard_count_data;