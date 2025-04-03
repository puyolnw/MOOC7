import Wrapper from '../../layouts/Wrapper';
import AdminDashboardMain from '../../dashboard/dashboard-admin/admin-home'
import SEO from '../../components/SEO';

const AdminDashboard = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminDashboardMain />
      </Wrapper>
   );
};

export default AdminDashboard;