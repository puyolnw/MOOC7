import Wrapper from '../../layouts/Wrapper';
import AdminApprove from '../../dashboard/admin-creditbank/approve';
import SEO from '../../components/SEO';

const AdminApprovepage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank AdminApprove'} />
         <AdminApprove />
      </Wrapper>
   );
};

export default AdminApprovepage ;