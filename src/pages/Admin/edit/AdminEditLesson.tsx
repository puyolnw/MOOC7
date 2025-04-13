import Wrapper from '../../../layouts/Wrapper';
import AdminEditLesson from '../../../dashboard/admin-creditbank/edit-lesson'
import SEO from '../../../components/SEO';

const AdminEditLessonpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank AdminEditLesson'} />
         <AdminEditLesson />
      </Wrapper>
   );
};

export default AdminEditLessonpage;