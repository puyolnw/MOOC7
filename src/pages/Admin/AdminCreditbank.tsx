import Wrapper from '../../layouts/Wrapper';
import AdminCreditbank from '../../dashboard/admin-creditbank';
import SEO from '../../components/SEO';

const AdminCreditbankpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminCreditbank />
      </Wrapper>
   );
};

export default AdminCreditbankpage ;