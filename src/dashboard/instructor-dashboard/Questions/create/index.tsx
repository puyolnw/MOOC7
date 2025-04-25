import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import AddQuestionsArea from './AddQuestionsArea'

const InsAddQuestions = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <AddQuestionsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default InsAddQuestions
