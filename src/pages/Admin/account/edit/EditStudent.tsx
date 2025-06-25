import Wrapper from '../../../../layouts/Wrapper';
import AdminEditaccountStudent from '../../../../dashboard/admin-account/student/edit';
import SEO from '../../../../components/SEO';


const AdminEditaccountStudentpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminEditaccountStudent />
      </Wrapper>
   );
};

export default AdminEditaccountStudentpage;