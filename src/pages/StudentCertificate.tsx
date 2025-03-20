import Wrapper from '../layouts/Wrapper';
import StudentCertificateArea from '../dashboard/student-dashboard/student-certificate/index';
import SEO from '../components/SEO';

const StudentCertificate = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'SkillGro Student Certificate'} />
         <StudentCertificateArea />
      </Wrapper>
   );
};

export default StudentCertificate;