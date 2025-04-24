interface DataType {
   id: number;
   icon: string;
   count: number;
   title: string;
   path: string;
};

const admin_count_data: DataType[] = [
   {
      id: 1,
      icon: "fas fa-book-open", // หลักสูตรทั้งหมด
      count: 0,
      title: "หลักสูตรทั้งหมด",
      path: "/admin-creditbank",
   },
   {
      id: 2,
      icon: "fas fa-users", // ผู้ใช้ทั้งหมด (นักเรียน+อาจารย์)
      count: 0,
      title: "ผู้เรียนทั้งหมด",
      path: "/admin-account/students",
   },
   {
      id: 3,
      icon: "fas fa-award", // จำนวนการสำเร็จหลักสูตรทั้งหมด
      count: 7,
      title: "สำเร็จหลักสูตร",
      path: "/admin-dashboard/completions",
   },
   {
      id: 4,
      icon: "fas fa-chalkboard-teacher", // อาจารย์
      count: 0,
      title: "อาจารย์ผู้สอน",
      path: "/admin-account/instructors",
   }
];

export default admin_count_data;
