import Wrapper from '../../../layouts/Wrapper';
import AdminAddCourse from '../../../dashboard/admin-creditbank/create';
import SEO from '../../../components/SEO';


const AdminAddCoursepage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminAddCourse />
      </Wrapper>
   );
};

export default AdminAddCoursepage;