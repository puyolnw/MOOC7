import Wrapper from '../../layouts/Wrapper';
import AdminManager from '../../dashboard/admin-account/manager';
import SEO from '../../components/SEO';


const AdminManagerpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminManager />
      </Wrapper>
   );
};

export default AdminManagerpage;