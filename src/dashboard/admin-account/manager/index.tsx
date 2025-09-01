import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../dashboard-common/AdminIconPanel'
import AdminAccountManagersArea from './AdminAccountManagersArea'

const AdminAccountManagers = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <AdminAccountManagersArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminAccountManagers
