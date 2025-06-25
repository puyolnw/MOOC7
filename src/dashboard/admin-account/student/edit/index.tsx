import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import EditAccountStudentArea from './EditAccountStudentArea'

const AdminInstructors = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <EditAccountStudentArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminInstructors ;
