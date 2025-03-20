const Overview = () => {
   return (
      <div className="courses__overview-wrap">
         <h3 className="title">คำอธิบายรายวิชา</h3>
         <p>รายวิชานี้มุ่งเน้นการศึกษาหลักการและแนวคิดพื้นฐานทางสถิติที่สามารถนำไปประยุกต์ใช้ในงานวิจัยและการแก้ปัญหาในชีวิตจริง เริ่มต้นจากการทำความเข้าใจประเภทของข้อมูล การเก็บรวบรวมข้อมูล การนำเสนอข้อมูลในรูปแบบต่าง ๆ และการวิเคราะห์ข้อมูลเบื้องต้น เช่น การวัดแนวโน้มเข้าสู่ส่วนกลางและการวัดการกระจายของข้อมูล</p>
         
         <h3 className="title">คุณจะได้เรียนรู้อะไรในหลักสูตรนี้?</h3>
         <p>ทำความเข้าใจแนวคิดพื้นฐานของสถิติ เช่น ประเภทของข้อมูล การเก็บรวบรวมข้อมูล และการนำเสนอข้อมูลในรูปแบบกราฟและตาราง
         เรียนรู้การวัดค่ากลาง (ค่าเฉลี่ย, มัธยฐาน, ฐานนิยม) และการวัดการกระจาย (พิสัย, ส่วนเบี่ยงเบนมาตรฐาน, ความแปรปรวน)</p>
         
         <ul className="about__info-list list-wrap">
            <li className="about__info-list-item">
               <i className="flaticon-angle-right"></i>
               <p className="content">การวิเคราะห์ข้อมูลเบื้องต้น</p>
            </li>
            <li className="about__info-list-item">
               <i className="flaticon-angle-right"></i>
               <p className="content">การแจกแจงความน่าจะเป็น (Probability Distributions)</p>
            </li>
            <li className="about__info-list-item">
               <i className="flaticon-angle-right"></i>
               <p className="content">การสุ่มตัวอย่างและการแจกแจงตัวอย่าง (Sampling and Sampling Distributions)</p>
            </li>
            <li className="about__info-list-item">
               <i className="flaticon-angle-right"></i>
               <p className="content">การประมาณค่า (Estimation)</p>
            </li>
         </ul>
         
         <p className="last-info">หลังจากจบหลักสูตรนี้ ผู้เรียนจะมีความรู้และทักษะในการ วิเคราะห์ข้อมูลเชิงสถิติ เพื่อแก้ปัญหาและสนับสนุนการตัดสินใจในงานวิชาการ งานวิจัย หรือการทำงานในภาคธุรกิจและอุตสาหกรรม โดยสามารถใช้เครื่องมือและเทคนิคต่าง ๆ อย่างมีประสิทธิภาพและเหมาะสมกับสถานการณ์</p>
      </div>
   )
}

export default Overview;
