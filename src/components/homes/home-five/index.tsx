import Banner from "./Banner"

import About from "./About"
import Courses from "./Courses"
import Faq from "./Faq"
import Instructor from "./Instructor"

import Testimonial from "./Testimonial"
import HeaderFive from "../../../layouts/headers/HeaderFive"
import FooterThree from "../../../layouts/footers/FooterThree"

const HomeFive = () => {
   return (
      <>
         <HeaderFive />
         <main className="main-area fix">
            <Banner />
            <About/>
            <Courses />
            <Faq />
            <Instructor />
            <Testimonial />

         </main>
         <FooterThree />
      </>
   )
}

export default HomeFive
