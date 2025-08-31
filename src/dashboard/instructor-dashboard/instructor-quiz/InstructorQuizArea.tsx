import instructor_attempts_data from "../../../data/dashboard-data/InstructorAttemptsData"
import IconPanelLayout from "../../dashboard-common/IconPanelLayout"
import { Link } from "react-router-dom"

const InstructorQuizArea = () => {
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
                      <th>วันที่</th>
                      <th>ชื่อแบบทดสอบ</th>
                      <th>นักเรียน</th>
                      <th>จำนวนคำถาม</th>
                      <th>คะแนนเต็ม</th>
                      <th>คะแนนที่ได้</th>
                      <th>ผลลัพธ์</th>
                      <th>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructor_attempts_data.map((item) => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.title}</td>
                        <td>
                          <Link to="#">{item.name}</Link>
                        </td>
                        <td>{item.qus}</td>
                        <td>{item.tm}</td>
                        <td>{item.ca}</td>
                        <td>
                          <span className={`dashboard__quiz-result ${item.result_class || ''}`}>
                            {item.result}
                          </span>
                        </td>
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

export default InstructorQuizArea
