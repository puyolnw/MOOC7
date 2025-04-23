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

const useMenuData = () => {
    const [menuData, setMenuData] = useState<MenuItem[]>([]);
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchDepartments = async () => {
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
                            link: "/courses",
                            title: faculty,
                            dropdown: true,
                            mega_menus: depts.map(dept => ({
                                link: `/courses?dept=${dept.department_id}`,
                                title: dept.department_name
                            }))
                        }))
                    };

                    setMenuData([
                        {
                            id: 1,
                            title: "หน้าแรก",
                            link: "/",
                        },
                        courseMenu,
                        {
                            id: 3,
                            title: "เกี่ยวกับเรา",
                            link: "/about-us",
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };

        fetchDepartments();
    }, [apiURL]);

    return menuData;
};

export default useMenuData;
