import Wrapper from '../layouts/Wrapper';
import StudentDashboardMain from '../dashboard/student-dashboard/student-dashboard';
import SEO from '../components/SEO';

const StudentDashboard = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Student Dashboard'} />
         <StudentDashboardMain />
      </Wrapper>
   );
};

export default StudentDashboard;