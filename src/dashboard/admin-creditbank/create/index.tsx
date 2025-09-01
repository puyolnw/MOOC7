import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../dashboard-common/AdminIconPanel'
import AddCoursearea from './AddCoursearea'

const AdminAddCourse = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <AddCoursearea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminAddCourse
