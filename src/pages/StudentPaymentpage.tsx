import Wrapper from '../layouts/Wrapper';
import StudentPayment from '../dashboard/student-dashboard/student-payment';
import SEO from '../components/SEO';

const StudentPaymentpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'การชำระเงิน - ระบบการเรียนออนไลน์'} />
         <StudentPayment />
      </Wrapper>
   );
};

export default StudentPaymentpage;
