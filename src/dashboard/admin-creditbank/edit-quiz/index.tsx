import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import EditQuizzesArea from './EditQuizArea'

const AdminEditQuiz = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <EditQuizzesArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminEditQuiz
