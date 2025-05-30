interface DataType {
   id: number;
   page: string;
   icon?: string;
   icon_2?: string;
   icon_3?: string;
   title: string;
   desc: string;
};

const feature_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      icon: "/assets/img/icons/features_icon01.svg",
      title: "เรียนรู้กับผู้เชี่ยวชาญ",
      desc: "",
   },
   {
      id: 2,
      page: "home_1",
      icon: "/assets/img/icons/features_icon02.svg",
      title: "เรียนรู้ทุกสิ่ง",
      desc: "",
   },
   {
      id: 3,
      page: "home_1",
      icon: "/assets/img/icons/features_icon03.svg",
      title: "รับประกาศนียบัตรออนไลน์",
      desc: "",
   },
   {
      id: 4,
      page: "home_1",
      icon: "/assets/img/icons/features_icon04.svg",
      title: "การตลาดผ่านอีเมล์",
      desc: "",
   },

   // home_2 - แก้ไขเป็นเนื้อหาเกี่ยวกับมหาวิทยาลัย

   {
      id: 1,
      page: "home_2",
      icon_2: "/assets/img/icons/h2_features_icon01.svg",
      title: "คณาจารย์ผู้เชี่ยวชาญ",
      desc: "มหาวิทยาลัยของเรามีคณาจารย์ที่มีความเชี่ยวชาญในสาขาวิชาต่างๆ พร้อมถ่ายทอดความรู้และประสบการณ์ให้กับนักศึกษา",
   },

   {
      id: 2,
      page: "home_2",
      icon_2: "/assets/img/icons/h2_features_icon02.svg",
      title: "หลักสูตรที่ทันสมัย",
      desc: "เรามีหลักสูตรที่ได้รับการออกแบบให้ทันสมัย ตอบโจทย์ความต้องการของตลาดแรงงานและการเปลี่ยนแปลงของโลกในอนาคต",
   },

   {
      id: 3,
      page: "home_2",
      icon_2: "/assets/img/icons/h2_features_icon03.svg",
      title: "การเรียนรู้แบบผสมผสาน",
      desc: "เรามีระบบการเรียนการสอนที่ผสมผสานระหว่างการเรียนในห้องเรียนและการเรียนออนไลน์ เพื่อให้นักศึกษาสามารถเรียนรู้ได้ทุกที่ทุกเวลา",
   },

   // home_3

   {
      id: 1,
      page: "home_3",
      icon_2: "assets/img/icons/h3_features_icon01.svg",
      title: "Scholarship Facility",
      desc: "Eestuidar University we prepare you to launch your.",
   },
   {
      id: 2,
      page: "home_3",
      icon_2: "assets/img/icons/h3_features_icon02.svg",
      title: "Learn From Experts",
      desc: "Eestuidar University we prepare you to launch your.",
   },
   {
      id: 3,
      page: "home_3",
      icon_2: "assets/img/icons/h3_features_icon03.svg",
      title: "Graduation Courses",
      desc: "Eestuidar University we prepare you to launch your.",
   },
   {
      id: 4,
      page: "home_3",
      icon_2: "assets/img/icons/h3_features_icon04.svg",
      title: "Certificate Program",
      desc: "Eestuidar University we prepare you to launch your.",
   },

   // home_4

   {
      id: 1,
      page: "home_4",
      icon: "/assets/img/icons/h4_features_icon01.svg",
      title: "Support & Motivation",
      desc: "We are able to offer every yoga training experienced & best yoga trainer.",
   },
   {
      id: 2,
      page: "home_4",
      icon: "/assets/img/icons/h4_features_icon02.svg",
      title: "Strong Body Life",
      desc: "We are able to offer every yoga training experienced & best yoga trainer.",
   },
   {
      id: 3,
      page: "home_4",
      icon: "/assets/img/icons/h4_features_icon03.svg",
      title: "Increased Flexibility",
      desc: "We are able to offer every yoga training experienced & best yoga trainer.",
   },

   // home-five

   {
      id: 1,
      page: "home_5",
      icon_3: "/assets/img/others/h5_features_item_shape02.svg",
      icon_2: "skillgro-video-tutorial",
      title: "Easy Class",
      desc: "Dear Psum Dolor Amettey Adipis Aecing Eiusmod Incididutt Reore",
   },
   {
      id: 2,
      page: "home_5",
      icon_3: "/assets/img/others/h5_features_item_shape02.svg",
      icon_2: "skillgro-verified",
      title: "Safety & Security",
      desc: "Dear Psum Dolor Amettey Adipis Aecing Eiusmod Incididutt Reore",
   },
   {
      id: 3,
      page: "home_5",
      icon_3: "/assets/img/others/h5_features_item_shape02.svg",
      icon_2: "skillgro-instructor",
      title: "Skilled Teacher",
      desc: "Dear Psum Dolor Amettey Adipis Aecing Eiusmod Incididutt Reore",
   },
   {
      id: 4,
      page: "home_5",
      icon_3: "/assets/img/others/h5_features_item_shape02.svg",
      icon_2: "skillgro-book-1",
      title: "Clean Curriculum",
      desc: "Dear Psum Dolor Amettey Adipis Aecing Eiusmod Incididutt Reore",
   },

   // home_8

   {
      id: 1,
      page: "home_8",
      icon_3: "/assets/img/others/h5_features_item_shape02.svg",
      icon_2: "skillgro-book-1",
      title: "Learn skills with 120k+",
      desc: "video courses.",
   },
   {
      id: 2,
      page: "home_8",
      icon_3: "/assets/img/others/h5_features_item_shape02.svg",
      icon_2: "skillgro-instructor",
      title: "Choose courses",
      desc: "real-world experts.",
   },
   {
      id: 3,
      page: "home_8",
      icon_3: "/assets/img/others/h5_features_item_shape02.svg",
      icon_2: "skillgro-tutorial",
      title: "processional Tutors",
      desc: "video courses.",
   },
   {
      id: 4,
      page: "home_8",
      icon_3: "/assets/img/others/h5_features_item_shape02.svg",
      icon_2: "skillgro-graduated",
      title: "Online Degrees",
      desc: "Study flexibly online",
   },

];

export default feature_data;
