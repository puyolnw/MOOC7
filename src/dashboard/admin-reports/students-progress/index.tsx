import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../dashboard-common/AdminIconPanel'
import StudentreportArea from './StudentsProgressArea'

const AdminStudentreportArea = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <StudentreportArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminStudentreportArea
