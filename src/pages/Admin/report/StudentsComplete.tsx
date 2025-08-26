import Wrapper from '../../../layouts/Wrapper';
import AdminStudentsReportComplete from '../../../dashboard/admin-reports/students-complete';
import SEO from '../../../components/SEO';


const AdminStudentsReportCompletepage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank AdminStudentsReportComplete'} />
         <AdminStudentsReportComplete />
      </Wrapper>
   );
};

export default AdminStudentsReportCompletepage;