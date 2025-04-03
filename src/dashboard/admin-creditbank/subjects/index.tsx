import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import SubjectsArea from './SubjectsArea'

const AdminSubjects = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <SubjectsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminSubjects
