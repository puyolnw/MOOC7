import { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
    id: number;
    title: string;
    link: string;
    menu_class?: string;
    sub_menus?: {
        link: string;
        title: string;
        dropdown?: boolean;
        mega_menus?: {
            link: string;
            title: string;
        }[];
    }[];
}

interface Department {
    department_id: number;
    department_name: string;
    faculty: string;
    description: string;
}

// Cache สำหรับ menu data เพื่อป้องกันการดึงข้อมูลซ้ำ
let menuDataCache: MenuItem[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 นาที

const useMenuData = () => {
    const [menuData, setMenuData] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchDepartments = async () => {
            // ตรวจสอบ cache ก่อน
            const now = Date.now();
            if (menuDataCache && (now - cacheTimestamp) < CACHE_DURATION) {
                setMenuData(menuDataCache);
                return;
            }

            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${apiURL}/api/courses/subjects/departments/list`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.success) {
                    const departments: Department[] = response.data.departments;
                    
                    const facultyGroups: { [key: string]: Department[] } = departments.reduce((acc: { [key: string]: Department[] }, dept: Department) => {
                        const faculty = dept.faculty || 'อื่นๆ';
                        if (!acc[faculty]) {
                            acc[faculty] = [];
                        }
                        acc[faculty].push(dept);
                        return acc;
                    }, {});

                    const courseMenu: MenuItem = {
                        id: 2,
                        title: "หลักสูตร",
                        link: "/courses",
                        sub_menus: Object.entries(facultyGroups).map(([faculty, depts]) => ({
                            link: `/courses?faculty=${encodeURIComponent(faculty)}`,
                            title: faculty,
                            dropdown: true,
                            mega_menus: depts.map(dept => ({
                                link: `/courses?department=${dept.department_name}`,
                                title: dept.department_name
                            }))
                        }))
                    };

                    const newMenuData = [
                        {
                            id: 1,
                            title: "หน้าแรก",
                            link: "/",
                        },
                        courseMenu,
                        {
                            id: 5,
                            title: "บุคลากร",
                            link: "/personnel",
                        },
                        {
                            id: 3,
                            title: "เกี่ยวกับเรา",
                            link: "/about-us",
                        }
                    ];

                    // อัปเดต cache
                    menuDataCache = newMenuData;
                    cacheTimestamp = now;
                    setMenuData(newMenuData);
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
                // ใช้ cache เก่าถ้ามี
                if (menuDataCache) {
                    setMenuData(menuDataCache);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDepartments();
    }, [apiURL]);

    return { menuData, isLoading };
};

export default useMenuData;
