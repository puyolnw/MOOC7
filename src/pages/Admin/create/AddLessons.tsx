import Wrapper from '../../../layouts/Wrapper';
import AdminAddLessons from '../../../dashboard/admin-creditbank/lessons/create';
import SEO from '../../../components/SEO';


const AdminAddlessonspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminAddLessons />
      </Wrapper>
   );
};

export default AdminAddlessonspage;