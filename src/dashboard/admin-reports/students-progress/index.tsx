import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import StudentreportArea from './StudentsProgressArea'

const AdminStudentreportArea = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <StudentreportArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminStudentreportArea ;
