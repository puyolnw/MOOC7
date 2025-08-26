import DashboardBreadcrumb from '../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../layouts/footers/FooterOne'
import HeaderOne from '../../layouts/headers/HeaderOne'
import ManagerCreditbankArea from './ManagerCreditbankArea'

const ManagerCreditbank = () => {
   return (
      <>    
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <ManagerCreditbankArea />
         </main>
          
         <FooterOne />
      </>
   )
}

export default ManagerCreditbank
