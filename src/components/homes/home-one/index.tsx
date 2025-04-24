import Banner from "./Banner"
import About from "./About"
import CourseArea from "./CourseArea"

import Instructor from "./Instructor"
import Counter from "./Counter"
import FaqArea from "./FaqArea"

import InstructorTwo from "./InstructorTwo"
import Categories from "./Categories"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BrandOne from "../../common/brands/BrandOne"
import FooterOne from "../../../layouts/footers/FooterOne"

const HomeOne = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <Banner />
            <Categories />
            <BrandOne />
            <About />
            <CourseArea style={false} />
            <Instructor />
            <Counter />
            <FaqArea />
            <InstructorTwo style={false} />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default HomeOne
