import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import BreadcrumbTwo from "../../common/breadcrumb/BreadcrumbTwo";
import CourseDetailsArea from "./CourseDetailsArea";

const CourseDetails = () => {

   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbTwo title="เขียนโปรแกรมด้วย React" sub_title="หลักสูตร" />
            <CourseDetailsArea />
         </main>
         <FooterOne style={false} style_2={true} />
      </>
   );
};

export default CourseDetails;
