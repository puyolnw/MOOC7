import Wrapper from '../../layouts/Wrapper';
import AdminLessons from '../../dashboard/admin-creditbank/lessons';
import SEO from '../../components/SEO';


const AdminLessonsbankpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminLessons />
      </Wrapper>
   );
};

export default AdminLessonsbankpage;