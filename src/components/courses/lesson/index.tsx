import { useParams } from "react-router-dom";
import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import LessonArea from "./LessonArea"

const Lesson = () => {
   // รับ courseId จาก URL parameters
   const { courseId } = useParams<{ courseId: string }>();
   
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <LessonArea courseId={parseInt(courseId || "1")} />
         </main>
         <FooterOne style={false} style_2={true} />
      </>
   )
}

export default Lesson
