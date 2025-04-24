import Banner from "./Banner"
import About from "./About"
import Cta from "./Cta"
import Categories from "./Categories"

import Course from "./Course"
import Testimonial from "./Testimonial"
import HeaderEight from "../../../layouts/headers/HeaderEight"
import FooterOne from "../../../layouts/footers/FooterOne"

const HomeEight = () => {
   return (
      <>
         <HeaderEight />
         <main className="main-area fix">
            <Banner />
            <Course />
            <About />
            <Cta />
            <Categories />
            <Testimonial />


         </main>
         <FooterOne style={false} style_2={true} />
      </>
   )
}

export default HomeEight
