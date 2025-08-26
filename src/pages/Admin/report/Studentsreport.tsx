import Wrapper from '../../../layouts/Wrapper';
import AdminStudentsReport from '../../../dashboard/admin-reports/students-report';
import SEO from '../../../components/SEO';


const AdminStudentsReportpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank AdminStudentsReport'} />
         <AdminStudentsReport />
      </Wrapper>
   );
};

export default AdminStudentsReportpage;