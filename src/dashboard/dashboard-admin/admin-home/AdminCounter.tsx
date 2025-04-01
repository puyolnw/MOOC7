import Count from "../../../components/common/Count";
import admin_count_data from "../../../data/dashboard-data/AdminCounterData";
import { Link } from "react-router-dom"

const AdminCounter = () => {
    return (
       <>
          {admin_count_data.map((item) => (
             <div key={item.id} className="col-lg-4 col-md-4 col-sm-6">
                <Link to={item.path}>
                   <div className="dashboard__counter-item">
                      <div className="icon">
                         <i className={item.icon}></i>
                      </div>
                      <div className="content">
                         <span className="count"><Count number={item.count} /></span>
                         <p style={{marginTop:"5px"}}>{item.title}</p>
                      </div>
                   </div>
                </Link>
             </div>
          ))}
       </>
    )
 }
 
 export default AdminCounter;
