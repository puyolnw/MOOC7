import { Link } from "react-router-dom"

interface Instructor {
  instructor_id: number;
  name: string;
  position: string;
  avatar?: string;
  bio?: string;
}

interface InstructorsProps {
  instructors: Instructor[];
}

const Instructors = ({ instructors }: InstructorsProps) => {
  return (
    <div className="instructors-section p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="bg-primary-100 p-2 rounded-full">
          <i className="fas fa-chalkboard-teacher text-primary-600"></i>
        </span>
        ผู้สอนในหลักสูตร
      </h2>

      {instructors && instructors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor) => (
            <div
              key={instructor.instructor_id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={instructor.avatar || "/assets/img/courses/course_instructors.png"}
                    alt={instructor.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                  />
                  <span className="absolute bottom-0 right-0 bg-green-500 p-1.5 rounded-full">
                    <i className="fas fa-check text-white text-xs"></i>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800">{instructor.name}</h3>
                <p className="text-primary-600 font-medium mt-1">{instructor.position}</p>

                <div className="flex items-center mt-2 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-sm"></i>
                  ))}
                  <span className="ml-2 text-gray-600 text-sm">(4.8)</span>
                </div>

                <p className="text-gray-600 text-center mt-4 line-clamp-3">
                  {instructor.bio || "ไม่มีข้อมูลประวัติผู้สอน"}
                </p>

                <div className="flex gap-4 mt-6">
                  {[
                    { icon: 'facebook-f', color: 'hover:bg-blue-600' },
                    { icon: 'twitter', color: 'hover:bg-sky-500' },
                    { icon: 'instagram', color: 'hover:bg-pink-600' }
                  ].map((social, index) => (
                    <Link
                      key={index}
                      to="#"
                      className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 ${social.color} hover:text-white transition-colors`}
                    >
                      <i className={`fab fa-${social.icon}`}></i>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-center gap-2">
          <i className="fas fa-info-circle"></i>
          <p>ยังไม่มีข้อมูลผู้สอนในหลักสูตรนี้</p>
        </div>
      )}
    </div>
  )
}

export default Instructors
