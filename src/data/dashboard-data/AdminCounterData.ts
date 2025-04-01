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
       icon: "skillgro-book",
       count: 30,
       title: "หลักสูตรที่ลงทะเบียน",
       path: "/admin-dashboard/course",
    },
    {
       id: 2,
       icon: "skillgro-tutorial",
       count: 10,
       title: "หลักสูตรที่กำลังดำเนินอยู่",
       path: "/admin-dashboard/course",
    },
    {
       id: 3,
       icon: "skillgro-diploma-1",
       count: 7,
       title: "หลักสูตรที่สำเร็จแล้ว",
       path: "/admin-dashboard/course",
    },
    {
       id: 4,
       icon: "skillgro-group",
       count: 160,
       title: "ผู้เรียนทั้งหมด",
       path: "/admin-dashboard/course",
    },
    {
       id: 5,
       icon: "skillgro-notepad",
       count: 30,
       title: "หลักสูตรทั้งหมด",
       path: "/admin-dashboard/course",
    },
 
 ];
 
 export default admin_count_data;