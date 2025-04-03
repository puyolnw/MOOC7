import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import QuizzesArea from './QuizzesArea'

const AdminQuizzes = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <QuizzesArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminQuizzes
