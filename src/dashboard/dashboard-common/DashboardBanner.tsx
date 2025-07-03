
import { useEffect, useState } from "react"
import axios from "axios"

const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

const DashboardBanner = ({ style }: any) => {
   const [user, setUser] = useState<any>(null)
   const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

   useEffect(() => {
      // Get user data from localStorage where it's typically stored after login
      const userData = localStorage.getItem('user')
      if (userData) {
         try {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
            
            // Fetch instructor data to get avatar_file_id
            fetchInstructorData(parsedUser)
         } catch (error) {
            console.error("Error parsing user data:", error)
         }
      }
   }, [])

   const fetchInstructorData = async (userData: any) => {
      try {
         const token = localStorage.getItem("token")
         if (!token) return

         const userId = userData.user_id || userData.id
         if (!userId) return

         const response = await axios.get(`${apiUrl}/api/accounts/instructors/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
         })
         
         const instructorData = response.data.instructor
         setUser(instructorData)
         
         // Fetch avatar if instructor has avatar_file_id
         if (instructorData.avatar_file_id) {
            fetchAvatar(instructorData.avatar_file_id)
         }
      } catch (error) {
         console.error("Error fetching instructor data:", error)
      }
   }

   const fetchAvatar = async (fileId: string) => {
      try {
         const avatarUrl = `${apiUrl}/api/accounts/instructors/avatar/${fileId}`
         setAvatarUrl(avatarUrl)
      } catch (error) {
         console.error("Error setting avatar URL:", error)
         // Fallback to default image if avatar fetch fails
         setAvatarUrl(null)
      }
   }

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

   // Get avatar image source
   const getAvatarSrc = () => {
      if (avatarUrl) {
         return avatarUrl
      }
      // Fallback to default images based on style
      return style ? "/assets/img/courses/details_instructors02.jpg" : "/assets/img/courses/details_instructors01.jpg"
   }

   return (
      <div className="dashboard__top-wrap">
         <div className="dashboard__top-bg" style={{ backgroundImage: `url(/assets/img/bg/bg1.png)` }}></div>
         <div className="dashboard__instructor-info">
            <div className="dashboard__instructor-info-left">
               <div className="thumb">
                  <img
                     src={getAvatarSrc()}
                     alt="User Avatar"
                     style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid #ddd",
                        background: "#fff",
                        aspectRatio: "1 / 1"
                     }}
                  />
               </div>
               <div className="content">
                  <h4 className="title">{getUserName()}</h4>

               </div>
            </div>

         </div>
      </div>
   )
}

export default DashboardBanner
