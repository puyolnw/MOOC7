import Wrapper from '../../layouts/Wrapper';
import ManagerStudentsReport from '../../dashboard/manager-dashboard/report';
import SEO from '../../components/SEO';


const ManagerStudentsReportpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank AdminStudentsReport'} />
         <ManagerStudentsReport />
      </Wrapper>
   );
};

export default ManagerStudentsReportpage;