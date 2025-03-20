interface MenuItem {
    id: number;
    title: string;
    link: string;
    menu_class?: string;
    home_sub_menu?: {
        menu_details: {
            link: string;
            title: string;
            badge?: string;
            badge_class?: string;
        }[];
    }[];
    sub_menus?: {
        link: string;
        title: string;
        dropdown?: boolean;
        mega_menus?: {
            link: string;
            title: string;
        }[];
    }[];
};

const menu_data: MenuItem[] = [

    {
        id: 1,
        title: "หน้าแรก",
        link: "/",
    },
    {
        id: 2,
        title: "หลักสูตร",
        link: "/courses",
        sub_menus: [
            {
                link: "/courses",
                title: "คณะวิทยาการจัดการ",
                dropdown: true,
                mega_menus: [
                    {
                        link: "/courses",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/courses",
                title: "คณะเทคโนโลยีสารสนเทศ",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/courses",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/courses",
                title: "คณะวิศวกรรมศาสตร์",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/courses",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/courses",
                title: "คณะเทคโนโลยีการเกษตร",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/courses",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/courses",
                title: "คณะมนุษยศาสตร์และสังคมศาสตร์",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/courses",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/courses",
                title: "คณะรัฐศาสตร์และรัฐประศาสนศาสตร์",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/courses",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/courses",
                title: "คณะวิทยาศาสตร์และเทคโนโลยี",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/courses",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/courses",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/courses",
                title: "สหกิจศึกษา",
            },
        ],
    },
    {
        id: 3,
        title: "เกี่ยวกับเรา",
        link: "/about-us",
    },
];
export default menu_data;
