import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import BreadcrumbTwo from "../../common/breadcrumb/BreadcrumbTwo";
import CourseDetailsArea from "./CourseDetailsArea";

interface CourseDetailsProps {
  single_course: {
    id: number;
    title: string;
    category: string;
    department: string;
    description: string;
    thumb: string;
    subjects: any[];
    subjectCount: number;
    totalLessons: number;
    totalQuizzes: number;
    instructors: any[];
    isLoading: boolean;
    error: string | null;
  };
}

const CourseDetails = ({ single_course }: CourseDetailsProps) => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbTwo title={single_course.title} sub_title="หลักสูตร" />
            <CourseDetailsArea single_course={single_course} />
         </main>
         <FooterOne style={false} style_2={true} />
      </>
   );
};

export default CourseDetails;
