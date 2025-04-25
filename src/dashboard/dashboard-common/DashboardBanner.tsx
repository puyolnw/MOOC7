import { Link } from "react-router-dom"
import BtnArrow from "../../svg/BtnArrow"
import { useEffect, useState } from "react"

const DashboardBanner = ({ style }: any) => {
   const [user, setUser] = useState<any>(null)

   useEffect(() => {
      // Get user data from localStorage where it's typically stored after login
      const userData = localStorage.getItem('user')
      if (userData) {
         try {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
         } catch (error) {
            console.error("Error parsing user data:", error)
         }
      }
   }, [])

   // Get user's full name or fallback to default
   const getUserName = () => {
      if (user) {
         // Check if first_name and last_name exist in user data
         if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`
         } 
         // If name exists (from login response)
         else if (user.name) {
            return user.name
         }
         // Fallback to email or username if available
         else if (user.email) {
            return user.email
         } else if (user.username) {
            return user.username
         }
      }
      // Default fallback based on style prop
      return style ? "Emily Hannah" : "Joddde"
   }

   return (
      <div className="dashboard__top-wrap">
         <div className="dashboard__top-bg" style={{ backgroundImage: `url(/assets/img/bg/instructor_dashboard_bg.jpg)` }}></div>
         <div className="dashboard__instructor-info">
            <div className="dashboard__instructor-info-left">
               <div className="thumb">
                  {style ? <img src="/assets/img/courses/details_instructors02.jpg" alt="" /> :
                     <img src="/assets/img/courses/details_instructors01.jpg" alt="" />}
               </div>
               <div className="content">
                  <h4 className="title">{getUserName()}</h4>

               </div>
            </div>
            <div className="dashboard__instructor-info-right">
               <Link to="/instructor-subjects/create-new" className="btn btn-two arrow-btn">เพิ่มรายวิชาใหม่ <BtnArrow /></Link>
            </div>
         </div>
      </div>
   )
}

export default DashboardBanner
