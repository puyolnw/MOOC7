import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import StudentsComplete from './StudentsCompleteArea'

const AdminStudentsCompleteArea = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <StudentsComplete/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminStudentsCompleteArea ;
