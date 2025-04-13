import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import EditQuestionArea from './EditQuestionArea'

const AdminEditQuestion = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <EditQuestionArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminEditQuestion
