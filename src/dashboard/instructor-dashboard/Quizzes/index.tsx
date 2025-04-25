import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import InstQuizzesArea from './InstQuizzesArea'

const InstQuizzes = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <InstQuizzesArea />
         </main>
         <FooterOne />
      </>
   )
}

export default InstQuizzes
