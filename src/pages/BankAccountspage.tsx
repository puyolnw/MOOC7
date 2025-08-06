import Wrapper from '../layouts/Wrapper';
import BankAccounts from '../dashboard/admin-creditbank/bank-accounts';
import SEO from '../components/SEO';

const BankAccountspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'จัดการบัญชีธนาคาร - Admin Dashboard'} />
         <BankAccounts />
      </Wrapper>
   );
};

export default BankAccountspage;
