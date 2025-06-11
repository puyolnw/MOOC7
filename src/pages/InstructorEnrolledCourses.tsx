import Wrapper from '../layouts/Wrapper';
import InstructorEnrollCourseMain from '../dashboard/instructor-dashboard/instructor-subjects';
import SEO from '../components/SEO';

const InstructorEnrollCourse = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'SkillGro Instructor Enroll Course'} />
         <InstructorEnrollCourseMain />
      </Wrapper>
   );
};

export default InstructorEnrollCourse;