import InjectableSvg from "../../../hooks/InjectableSvg";
import SvgAnimation from "../../../hooks/SvgAnimation";
import CommonTestimonial from "../../common/CommonTestimonial";

const Testimonial = () => {

   const svgIconRef = SvgAnimation('/assets/img/others/h7_testimonial_img_shape.svg');

   return (
      <section className="testimonial__area-five section-pb-120">
         <div className="container">
            <div className="row align-items-center justify-content-center">
               <div className="col-xl-6 col-lg-6 col-md-8">
                  <div className="testimonial__img-three testimonial__img-four tg-svg" ref={svgIconRef}>
                     <img src="/assets/img/others/h7_testimonial_img.png" alt="img" />
                     <div className="banner__review" data-aos="fade-right" data-aos-delay="400">
                        <div className="icon">
                           <InjectableSvg src="/assets/img/icons/star.svg" alt="" className="injectable" />
                        </div>
                        <h6 className="title">4.9/5 <span>Real Reviews</span></h6>
                     </div>
                     <div className="testimonial__img-icon">
                        <InjectableSvg src="/assets/img/icons/quote02.svg" alt="" className="injectable" />
                     </div>
                     <span className="svg-icon"></span>
                  </div>
               </div>
               <div className="col-xl-6 col-lg-6">
                  <div className="testimonial__content-three testimonial__content-four">
                     <div className="section__title mb-25">
                        <span className="sub-title">Testimonials</span>
                        <h2 className="title bold">What’s our client Say <br /> เกี่ยวกับเรา</h2>
                     </div>
                     <CommonTestimonial />
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Testimonial
