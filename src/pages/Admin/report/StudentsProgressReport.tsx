import Wrapper from '../../../layouts/Wrapper';
import AdminStudentsReportProgress from '../../../dashboard/admin-reports/students-progress';
import SEO from '../../../components/SEO';


const AdminStudentsReportProgresspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank AdminStudentsReport'} />
         <AdminStudentsReportProgress />
      </Wrapper>
   );
};

export default AdminStudentsReportProgresspage;