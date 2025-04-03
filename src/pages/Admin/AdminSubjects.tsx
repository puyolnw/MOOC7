import Wrapper from '../../layouts/Wrapper';
import AdminSubjects from '../../dashboard/admin-creditbank/subjects';
import SEO from '../../components/SEO';


const AdminSubjectspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminSubjects />
      </Wrapper>
   );
};

export default AdminSubjectspage;