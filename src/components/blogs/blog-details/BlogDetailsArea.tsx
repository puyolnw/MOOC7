import BlogAuthor from "./BlogAuthor"
import BlogPostComment from "./BlogPostComment"
import BlogSidebar from "../blog-common/BlogSidebar"
import { Link } from "react-router-dom"
import BlogForm from "../../../forms/BlogForm"

const BlogDetailsArea = () => {
   return (
      <section className="blog-details-area section-py-120">
         <div className="container">
            <div className="row">
               <div className="col-xl-9 col-lg-8">
                  <div className="blog__details-wrapper">
                     <div className="blog__details-thumb">
                        <img src="/assets/img/blog/blog_details.jpg" alt="img" />
                     </div>
                     <div className="blog__details-content">
                        <div className="blog__post-meta">
                           <ul className="list-wrap">
                              <li><i className="flaticon-calendar"></i> 20 July, 2024</li>
                              <li><i className="flaticon-user-1"></i> by <Link to="#">Admin</Link></li>
                              <li><i className="flaticon-clock"></i> 5 Min Read</li>
                              <li><i className="far fa-comment-alt"></i> 05 Comments</li>
                           </ul>
                        </div>
                        <h3 className="title">วิธีการตระหนักรู้ในตนเองอย่างเหลือเชื่อใน 20 นาที</h3>
                        <p>Maximus ligula eleifend id nisl ซึ่งบางครั้ง แต่คุณไม่ควรดื่มน้ำสกปรกเสมอไป เมื่อและเว้นแต่ประตู malesuada risus nonrra dolo areay Vestibulum ante ipsum primis in faucibus orci luctus et altrices posuere cabilia curae in tristique libero, quis ultrices diamraesent varius diam dui. คลาสที่เหมาะสมคือ taciti sociosqu ad litora torquent per conubia nostra. สูงสุด ligula eleifend.</p>
                        <p>Maximus ligula eleifend id nisl ซึ่งบางครั้ง แต่คุณไม่ควรดื่มน้ำสกปรกเสมอไป เมื่อและเว้นแต่ประตู malesuada risus nonrra dolo areay Vestibulum ante ipsum primis in faucibus orci luctus et altrices posuere cabilia curae in tristique libero, quis ultrices diamraesent varius diam dui. คลาสที่เหมาะสมคือ taciti sociosqu ad litora torquent per conubia nostra. สูงสุด ligula eleifend.</p>
                        <blockquote>
                           <p>“ urabitur varius eros rutrum consequat Mauris areathe sollicitudin enim condimentum luctus enim justo non molestie nisl ”</p>
                        </blockquote>
                        <p>Maximus ligula eleifend id nisl ซึ่งบางครั้ง แต่คุณไม่ควรดื่มน้ำสกปรกเสมอไป เมื่อและเว้นแต่ประตู malesuada risus nonrra dolo areay Vestibulum ante ipsum primis in faucibus orci luctus et altrices posuere cubilia curae.</p>
                        <div className="blog__details-content-inner">
                           <h4 className="inner-title">ฉันจะได้เรียนรู้อะไรจากหลักสูตรนี้?</h4>
                           <p>Maximus ligula eleifend id nisl ซึ่งบางครั้ง แต่คุณไม่ควรดื่มน้ำสกปรกเสมอไป ราวกับว่าเป็นประตู รอยยิ้มอันชั่วร้ายไม่อาจทนต่อความเจ็บปวดได้ สิ่งแรกที่พวกเขาทำคือการแสดงความเจ็บปวดและความทุกข์ทรมานออกมา</p>
                           <ul className="about__info-list list-wrap">
                              <li className="about__info-list-item">
                                 <i className="flaticon-angle-right"></i>
                                 <p className="content">ทำงานกับสีและการไล่ระดับสีและตาราง</p>
                              </li>
                              <li className="about__info-list-item">
                                 <i className="flaticon-angle-right"></i>
                                 <p className="content">ทางลัดที่มีประโยชน์ทั้งหมด</p>
                              </li>
                              <li className="about__info-list-item">
                                 <i className="flaticon-angle-right"></i>
                                 <p className="content">สามารถจัดทำใบปลิว โบรชัวร์ โฆษณาได้</p>
                              </li>
                              <li className="about__info-list-item">
                                 <i className="flaticon-angle-right"></i>
                                 <p className="content">วิธีการทำงานกับรูปภาพและข้อความ</p>
                              </li>
                           </ul>
                        </div>
                        <p>Maximus ligula eleifend id nisl ซึ่งบางครั้ง แต่คุณไม่ควรดื่มน้ำสกปรกเสมอไป เมื่อและเว้นแต่ประตู malesuada risus nonrra dolo areay Vestibulum ante ipsum primis in faucibus orci luctus et altrices posuere cabilia curae in tristique libero, quis ultrices diamraesent varius diam dui. คลาสที่เหมาะสมคือ taciti sociosqu ad litora torquent per conubia ustra. ลีกสูงสุดของสิ่งมีชีวิตคือ nisl quis interdum. แต่คุณไม่ควรดื่มน้ำสกปรกเสมอไป และนอกจากประตูแล้ว เสียงหัวเราะอันชั่วร้ายก็ไม่ใช่ประตูทางเข้าก่อนเป็นอันดับแรก</p>
                        <div className="blog__details-bottom">
                           <div className="row align-items-center">
                              <div className="col-xl-6 col-md-7">
                                 <div className="tg-post-tag">
                                    <h5 className="tag-title">Tags :</h5>
                                    <ul className="list-wrap p-0 mb-0">
                                       <li><Link to="#">การทำความสะอาดอาบน้ำ</Link></li>
                                       <li><Link to="#">การทำความสะอาด</Link></li>
                                    </ul>
                                 </div>
                              </div>
                              <div className="col-xl-6 col-md-5">
                                 <div className="tg-post-social justify-content-start justify-content-md-end">
                                    <h5 className="social-title">Share :</h5>
                                    <ul className="list-wrap p-0 mb-0">
                                       <li><Link to="#"><i className="fab fa-facebook-f"></i></Link></li>
                                       <li><Link to="#"><i className="fab fa-twitter"></i></Link></li>
                                       <li><Link to="#"><i className="fab fa-linkedin-in"></i></Link></li>
                                       <li><Link to="#"><i className="fab fa-pinterest-p"></i></Link></li>
                                    </ul>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <BlogAuthor />
                  <div className="blog-post-comment">
                     <BlogPostComment />
                     <BlogForm />
                  </div>
               </div>
               <BlogSidebar style_1={false} />
            </div>
         </div>
      </section>
   )
}

export default BlogDetailsArea
