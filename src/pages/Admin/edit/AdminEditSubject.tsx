import Wrapper from '../../../layouts/Wrapper';
import AdminEditSubject from '../../../dashboard/admin-creditbank/edit-subject'
import SEO from '../../../components/SEO';

const AdminEditSubjectpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank AdminEditSubject'} />
         <AdminEditSubject />
      </Wrapper>
   );
};

export default AdminEditSubjectpage;