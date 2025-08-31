import { Link } from "react-router-dom"
import IconPanelLayout from "../../dashboard-common/IconPanelLayout"
import instructor_assignment_data from "../../../data/dashboard-data/InstructorAssignmentData"

const InstructorAssignmentArea = () => {
   return (
      <IconPanelLayout>
         <div className="dashboard__content-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">ประวัติการทำแบบทดสอบ</h4>
            </div>
            <div className="row">
               <div className="col-12">
                  <div className="dashboard__review-table">
                     <div className="table-responsive">
                        <table className="table">
                           <thead>
                              <tr>
                                 <th>ชื่อวิชา</th>
                                 <th>ชื่อแบบทดสอบ</th>
                                 <th>คะแนนเต็ม</th>
                                 <th>จำนวนที่ส่ง</th>
                                 <th>การจัดการ</th>
                              </tr>
                           </thead>
                           <tbody>
                              {instructor_assignment_data.map((item) => (
                                 <tr key={item.id}>
                                    <td>
                                       <Link to="#">{item.course}</Link>
                                    </td>
                                    <td>{item.title}</td>
                                    <td>{item.total_mark}</td>
                                    <td>{item.total_submit}</td>
                                    <td>
                                       <div className="dashboard__review-action">
                                          <Link to="#" title="Edit"><i className="skillgro-edit"></i></Link>
                                          <Link to="#" title="Delete"><i className="skillgro-bin"></i></Link>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </IconPanelLayout>
   )
}

export default InstructorAssignmentArea
