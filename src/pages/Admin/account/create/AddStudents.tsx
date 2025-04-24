import Wrapper from '../../../../layouts/Wrapper';
import AdminCreateAccountStudents from '../../../../dashboard/admin-account/student/create';
import SEO from '../../../../components/SEO';


const CreateAccountStudentspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminCreateAccountStudents />
      </Wrapper>
   );
};

export default CreateAccountStudentspage;