import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import AddQuizzesArea from './AddQuizzesArea'

const InsAddQuizzes = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <AddQuizzesArea />
         </main>
         <FooterOne />
      </>
   )
}

export default InsAddQuizzes
