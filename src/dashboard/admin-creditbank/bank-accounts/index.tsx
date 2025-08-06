import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import BankAccountsArea from './BankAccountsArea'

const BankAccounts = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <BankAccountsArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default BankAccounts;
