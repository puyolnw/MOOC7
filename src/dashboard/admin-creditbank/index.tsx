import FooterOne from '../../layouts/footers/FooterOne'
import HeaderOne from '../../layouts/headers/HeaderOne'
import AdminIconPanel from '../dashboard-common/AdminIconPanel'
import AdminCreditbankArea from './AdminCreditbankArea'

const AdminCreditbank = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <AdminCreditbankArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminCreditbank
