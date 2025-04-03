import Wrapper from '../../../layouts/Wrapper';
import AdminAddSubjects from '../../../dashboard/admin-creditbank/subjects/create';
import SEO from '../../../components/SEO';


const AdminAddSubjectspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminAddSubjects />
      </Wrapper>
   );
};

export default AdminAddSubjectspage;