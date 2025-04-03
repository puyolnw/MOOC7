import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import QuestionsArea from './QuestionsArea'

const AdminQuestions = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <QuestionsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminQuestions
