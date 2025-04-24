import { Link } from "react-router-dom"

const FooterOne = ({ style, style_2 }: any) => {
   return (
      <footer className={`footer__area ${style_2 ? "footer__area-five" : style ? "footer__area-two" : ""}`}>


         <div className={`footer__bottom ${style_2 ? "footer__bottom-four" : ""}`}>
            <div className="container">
               <div className="row align-items-center">
                  <div className="col-md-7">
                     <div className="copy-right-text">
                        <p>© 2010-2024 skillgro.com. All rights reserved.</p>
                     </div>
                  </div>
                  <div className="col-md-5">
                     <div className="footer__bottom-menu">
                        <ul className="list-wrap">
                           <li><Link to="/contact">เงื่อนไขการใช้งาน</Link></li>
                           <li><Link to="/contact">นโยบายความเป็นส่วนตัว</Link></li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </footer>
   )
}

export default FooterOne
