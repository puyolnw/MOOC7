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

    },
    {
        id: 3,
        title: "เกี่ยวกับเรา",
        link: "/about-us",
    },
];
export default menu_data;
