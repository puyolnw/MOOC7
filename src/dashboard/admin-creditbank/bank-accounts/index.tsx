import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../dashboard-common/AdminIconPanel'
import BankAccountsArea from './BankAccountsArea'

const BankAccounts = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <BankAccountsArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default BankAccounts
