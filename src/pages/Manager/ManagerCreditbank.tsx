import Wrapper from '../../layouts/Wrapper';
import ManagerCreditbank from '../../dashboard/manager-dashboard';
import SEO from '../../components/SEO';

const ManagerCreditbankpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <ManagerCreditbank />
      </Wrapper>
   );
};

export default ManagerCreditbankpage ;