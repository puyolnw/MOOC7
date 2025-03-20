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
                link: "/#",
                title: "คณะวิทยาการจัดการ",
                dropdown: true,
                mega_menus: [
                    {
                        link: "/#",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/#",
                title: "คณะเทคโนโลยีสารสนเทศ",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/#",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/#",
                title: "คณะวิศวกรรมศาสตร์",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/#",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/#",
                title: "คณะเทคโนโลยีการเกษตร",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/#",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/#",
                title: "คณะมนุษยศาสตร์และสังคมศาสตร์",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/#",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/#",
                title: "คณะรัฐศาสตร์และรัฐประศาสนศาสตร์",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/#",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/#",
                title: "คณะวิทยาศาสตร์และเทคโนโลยี",
                dropdown: true,
                mega_menus: [ 
                    {
                        link: "/#",
                        title: "สาขาวิชา1",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา2",
                    },
                    {
                        link: "/#",
                        title: "สาขาวิชา3",
                    },
                ],
            },
            {
                link: "/#",
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
