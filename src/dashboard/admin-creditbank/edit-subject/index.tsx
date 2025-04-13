import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import EditSubjectArea from './EditSubjectArea'

const AdminEditSubject = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <EditSubjectArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminEditSubject
