import ContactForm from "../../../forms/ContactForm"
import InjectableSvg from "../../../hooks/InjectableSvg"

const ContactArea = () => {
   return (
      <section className="contact-area section-py-120">
         <div className="container">
            <div className="row">
               <div className="col-lg-4">
                  <div className="contact-info-wrap">
                     <ul className="list-wrap">
                        <li>
                           <div className="icon">
                              <InjectableSvg src="assets/img/icons/map.svg" alt="img" className="injectable" />
                           </div>
                           <div className="content">
                              <h4 className="title">ที่อยู่</h4>
                              <p>มหาวิทยาลัยราชภัฎมหาสารคาม 80 ถนนนครสวรรค์ <br /> มหาสารคาม, ต.ตลาด อ.เมือง </p>
                           </div>
                        </li>
                        <li>
                           <div className="icon">
                              <InjectableSvg src="assets/img/icons/contact_phone.svg" alt="img" className="injectable" />
                           </div>
                           <div className="content">
                              <h4 className="title">เบอร์โทรศัพท์</h4>
                              <a href="tel:0123456789">+66 043722118</a>
                           </div>
                        </li>
                        <li>
                           <div className="icon">
                              <InjectableSvg src="assets/img/icons/emial.svg" alt="img" className="injectable" />
                           </div>
                           <div className="content">
                              <h4 className="title">ที่อยู่อีเมล</h4>
                              <a href="mailto:info@gmail.com">info@gmail.com</a>
                           </div>
                        </li>
                     </ul>
                  </div>
               </div>

               <div className="col-lg-8">
                  <div className="contact-form-wrap">
                     <h4 className="title">ส่งข้อความถึงเรา</h4>
                     <p>ที่อยู่อีเมลของคุณจะไม่ถูกเผยแพร่ ช่องที่ต้องกรอกมีเครื่องหมาย *</p>
                     <ContactForm />
                     <p className="ajax-response mb-0"></p>
                  </div>
               </div>
            </div>
            <div className="contact-map">
               <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2709.1936006742667!2d103.27083221920152!3d16.200978310400988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3122a6ae121c1c2f%3A0x626cae9fcd86bf3d!2z4Lih4Lir4Liy4Lin4Li04LiX4Lii4Liy4Lil4Lix4Lii4Lij4Liy4LiK4Lig4Lix4LiP4Lih4Lir4Liy4Liq4Liy4Lij4LiE4Liy4Lih!5e0!3m2!1sth!2sth!4v1742505416240!5m2!1sth!2sth" style={{ border: '0' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
         </div>
      </section>
   )
}

export default ContactArea
