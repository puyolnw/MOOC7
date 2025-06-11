import DashboardBanner from "../../../dashboard-common/DashboardBanner"
import DashboardSidebar from "../../../dashboard-common/DashboardSidebar"
import InstructorSubjectContent from "./Instructor-SubjectContent"

const InstructorSubjectArea = () => {

  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <InstructorSubjectContent />
          </div>
        </div>
      </div>
    </section>
  )
}

export default InstructorSubjectArea
