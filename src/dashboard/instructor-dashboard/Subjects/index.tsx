import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import InsCreditbankArea from '../InsCreditbankArea'

const Inscredt = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <InsCreditbankArea />
         </main>
         <FooterOne />
      </>
   )
}

export default Inscredt
