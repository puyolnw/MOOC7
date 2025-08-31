import { Link } from "react-router-dom";
import IconPanelLayout from "../../dashboard-common/IconPanelLayout";

interface DataType {
   id: number;
   date: string;
   time: string;
   title: string;
   course: string;
}[];

const announcement_data: DataType[] = [
   {
      id: 1,
      date: "March 16, 2024",
      time: "10.00am",
      title: "Announcement Title",
      course: "Course: Fundamentals 101",
   },
   {
      id: 2,
      date: "March 16, 2024",
      time: "10.00am",
      title: "Announcement Title",
      course: "Course: Fundamentals 101",
   },
   {
      id: 3,
      date: "March 16, 2024",
      time: "10.00am",
      title: "Announcement Title",
      course: "Course: Fundamentals 101",
   },
   {
      id: 4,
      date: "March 16, 2024",
      time: "10.00am",
      title: "Announcement Title",
      course: "Course: Fundamentals 101",
   },
];

const InstructorAnnouncementArea = () => {
   return (
      <IconPanelLayout>
         <div className="dashboard__content-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">Announcements</h4>
            </div>
            <div className="row">
               <div className="col-12">
                  <div className="dashboard__review-table">
                     <table className="table table-borderless">
                        <thead>
                           <tr>
                              <th>Date</th>
                              <th>Announcements</th>
                              <th>&nbsp;</th>
                           </tr>
                        </thead>
                        <tbody>
                           {announcement_data.map((item) => (
                              <tr key={item.id}>
                                 <td>
                                    <p className="color-black">{item.date}</p>
                                    <p>{item.time}</p>
                                 </td>
                                 <td>
                                    <p className="color-black">{item.title}</p>
                                    <p>{item.course}</p>
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
      </IconPanelLayout>
   )
}

export default InstructorAnnouncementArea
