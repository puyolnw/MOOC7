const Overview = () => {
   return (
      <div className="courses__overview-wrap">
         <h3 className="title">คำอธิบายรายวิชา</h3>
         <p>หลักสูตรนี้จะให้ความเข้าใจเชิงลึกเกี่ยวกับ React.js ซึ่งเป็นไลบรารี JavaScript ยอดนิยมสำหรับการพัฒนา UI แบบโต้ตอบ ผู้เรียนจะได้เรียนรู้แนวคิดหลักของ React ตั้งแต่พื้นฐานไปจนถึงแนวทางการพัฒนาแอปพลิเคชันที่ซับซ้อน รวมถึงการจัดการสถานะและการทำงานร่วมกับ API</p>
         
         <h3 className="title">คุณจะได้เรียนรู้อะไรในหลักสูตรนี้?</h3>
         <p>หลักสูตรนี้จะครอบคลุมแนวคิดสำคัญของ React รวมถึงการสร้างคอมโพเนนต์ การใช้ React Hooks และการจัดการสถานะด้วย Context API และ Redux ตลอดจนแนวทางปฏิบัติที่ดีที่สุดในการพัฒนาแอปพลิเคชันเว็บ</p>
         
         <ul className="about__info-list list-wrap">
            <li className="about__info-list-item">
               <i className="flaticon-angle-right"></i>
               <p className="content">การทำงานกับคอมโพเนนต์และโครงสร้างของ React</p>
            </li>
            <li className="about__info-list-item">
               <i className="flaticon-angle-right"></i>
               <p className="content">การใช้ React Hooks เช่น useState และ useEffect</p>
            </li>
            <li className="about__info-list-item">
               <i className="flaticon-angle-right"></i>
               <p className="content">แนวทางการจัดการสถานะ เช่น Context API และ Redux</p>
            </li>
            <li className="about__info-list-item">
               <i className="flaticon-angle-right"></i>
               <p className="content">การทำงานร่วมกับ API และการดึงข้อมูลแบบ asynchronous</p>
            </li>
         </ul>
         
         <p className="last-info">หลังจากจบหลักสูตรนี้ ผู้เรียนจะมีความเข้าใจเกี่ยวกับแนวทางการพัฒนาเว็บแอปพลิเคชันที่ทันสมัยด้วย React.js และสามารถนำไปประยุกต์ใช้กับโปรเจกต์จริงได้อย่างมีประสิทธิภาพ</p>
      </div>
   )
}

export default Overview;
