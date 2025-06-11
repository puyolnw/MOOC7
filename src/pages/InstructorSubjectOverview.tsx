import Wrapper from '../layouts/Wrapper';
import InstructorSubjectOverview from '../dashboard/instructor-dashboard/instructor-subjects/subject';
import SEO from '../components/SEO';

const InstructorSubjectOverviewPage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'SkillGro Instructor Enroll Course'} />
         <InstructorSubjectOverview />
      </Wrapper>
   );
};

export default InstructorSubjectOverviewPage;