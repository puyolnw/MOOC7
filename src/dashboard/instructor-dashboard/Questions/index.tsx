import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import InstQuestionsArea from './InstQuestionsArea'

const InsQuestions = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <InstQuestionsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default InsQuestions
