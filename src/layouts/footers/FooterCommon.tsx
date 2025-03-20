import { Link } from "react-router-dom"

const FooterCommon = () => {
   return (
      <>
         <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="footer__widget">
               <div className="logo mb-35">
                  <Link to="/"><img src="/assets/img/logo/logo04.png" alt="img" /></Link>
                  {/* <Link to="/"><img src="/assets/img/logo/secondary_logo.svg" alt="img" /></Link> */}
               </div>
               <div className="footer__content">
                  <p></p>
                  <ul className="list-wrap">
                     <li>มหาวิทยาลัยราชภัฎมหาสารคาม 80 ถนนนครสวรรค์ ต.ตลาด อ.เมือง มหาสารคาม 44000</li>
                     <li>043722118</li>
                  </ul>
               </div>
            </div>
         </div>

         <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <div className="footer__widget">
               <h4 className="footer__widget-title">คลังหน่วยกิต</h4>
               <div className="footer__link">
                  <ul className="list-wrap">
                     <li><Link to="/contact">ติดต่อเรา</Link></li>
                     <li><Link to="/instructor-details">มาเป็นอาจารย์</Link></li>
                     <li><Link to="/blog">บล็อก</Link></li>
                     <li><Link to="/instructor-details">อาจารย์ผู้สอน</Link></li>
                     <li><Link to="/events-details">กิจกรรม</Link></li>
                  </ul>
               </div>
            </div>
         </div>
      </>
   )
}

export default FooterCommon
