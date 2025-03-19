import { Link } from "react-router-dom";
import InjectableSvg from "../../../hooks/InjectableSvg";
import SvgAnimation from "../../../hooks/SvgAnimation";
import BtnArrow from "../../../svg/BtnArrow";

interface InstructorTwoProps {
   style: boolean;
}
const InstructorTwo = ({ style }: InstructorTwoProps) => {

   const svgIconRef = SvgAnimation('/assets/img/instructor/instructor_shape02.svg');
   const svgIconRef2 = SvgAnimation('/assets/img/instructor/instructor_shape02.svg');

   return (
      <section className={`${style ? "instructor__area-four" : "instructor__area-two"}`}>
         <div className="container">
            <div className="instructor__item-wrap-two">
               <div className="row">
                  <div className="col-xl-6">

                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default InstructorTwo
