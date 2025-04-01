
const AdminBanner = ({ style }: any) => {
   return (
      <div className="dashboard__top-wrap">
         <div className="dashboard__top-bg" style={{ backgroundImage: `url(/assets/img/bg/bg1.png)` }}></div>
         <div className="dashboard__instructor-info">
            <div className="dashboard__instructor-info-left">
               <div className="thumb">
                  {style ? <img src="/assets/img/courses/details_instructors02.jpg" alt="" /> :
                     <img src="/assets/img/courses/details_instructors01.jpg" alt="" />}
               </div>
               <div className="content">
                  <h4 className="title">{style ? "Emily Hannah" : "Admin"}</h4>
                  <div className="review__wrap review__wrap-two">

                  </div>
               </div>
            </div>
            <div className="dashboard__instructor-info-right">
            </div>
         </div>
      </div>
   )
}

export default AdminBanner
