import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import PrivateRoute from '../hooks/PrivateRoute';
import AdminCreditbankpage from '../pages/Admin/AdminCreditbank';
import AdminLessonsbankpage from '../pages/Admin/AdminLessons';
import AdminQuestionspage from '../pages/Admin/AdminQuestions';
import AdminQuizzespage from '../pages/Admin/AdminQuizzes';
import AdminSubjectspage from '../pages/Admin/AdminSubjects';
import AdminAddquestionpage from '../pages/Admin/create/AddQuestions';
import AdminAddQuizzespage from '../pages/Admin/create/AddQuizzes';
import AdminAddlessonspage from '../pages/Admin/create/AddLessons';
import AdminAddSubjectspage from '../pages/Admin/create/AddSubjects';
import AdminAddCoursepage from '../pages/Admin/create/AddCoures';

import AdminEditCorusepage from '../pages/Admin/edit/AdminEditCoruse'
import AdminEditlessonspage from '../pages/Admin/edit/AdminEditLesson';
import AdminEditQuizzespage from '../pages/Admin/edit/AdminEditQuiz';
import AdminEditquestionpage from '../pages/Admin/edit/AdminEditQuestion';
import AdminEditSubjectspage from '../pages/Admin/edit/AdminEditSubject';

import AdminAccountInstructorspage from '../pages/Admin/account/AccountInstructors';
import CreateAccountInstructorspage from '../pages/Admin/account/create/AddInstructors';
import EditAccountInstructorspage from '../pages/Admin/account/edit/EditInstructors';
import AdminStudentpage from '../pages/Admin/account/AccountStudent';
import CreateAccountStudentspage from '../pages/Admin/account/create/AddStudents';

import SubjectDetailsPage from '../pages/SubjectDetails';
import Home from '../pages/Home';
import HomeTwo from '../pages/HomeTwo';
import HomeEight from '../pages/HomeEight';
import HomeSeven from '../pages/HomeSeven';
import HomeSix from '../pages/HomeSix';
import HomeFive from '../pages/HomeFive';
import HomeFour from '../pages/HomeFour';
import HomeThree from '../pages/HomeThree';
import Course from '../pages/Course';
import Lesson from '../pages/Lesson';
import CourseDetails from '../pages/CourseDetails';
import About from '../pages/About';
import Instructor from '../pages/Instructor';
import InstructorDetails from '../pages/InstructorDetails';
import Event from '../pages/Event';
import EventDetails from '../pages/EventDetails';
import Shop from '../pages/Shop';
import ShopDetails from '../pages/ShopDetails';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import CheckOut from '../pages/CheckOut';
import Blog from '../pages/Blog';
import BlogTwo from '../pages/BlogTwo';
import BlogThree from '../pages/BlogThree';
import BlogDetails from '../pages/BlogDetails';
import Login from '../pages/Login';
import Registration from '../pages/Registration';
import Contact from '../pages/Contact';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import InstructorDashboard from '../pages/InstructorDashboard';
import InstructorProfile from '../pages/InstructorProfile';
import InstructorEnrollCourse from '../pages/InstructorEnrolledCourses';
import InstructorWishlist from '../pages/InstructorWishlist';
import InstructorReview from '../pages/InstructorReview';
import InstructorQuiz from '../pages/InstructorQuiz';
import InstructorHistory from '../pages/InstructorHistory';
import InstructorCourses from '../pages/InstructorCourses';
import InstructorAnnouncement from '../pages/InstructorAnnouncement';
import InstructorAssignment from '../pages/InstructorAssignment';
import InstructorSetting from '../pages/InstructorSetting';
import InstructorAttempt from '../pages/InstructorAttempt';
import StudentDashboard from '../pages/StudentDashboard';
import StudentProfile from '../pages/StudentProfile';
import StudentEnrollCourse from '../pages/StudentEnrolledCourses';
import StudentWishlist from '../pages/StudentWishlist';
import StudentReview from '../pages/StudentReview';
import StudentAttempt from '../pages/StudentAttempt';
import StudentHistory from '../pages/StudentHistory';
import StudentSetting from '../pages/StudentSetting';
import NotFound from '../pages/NotFound';

import StudentCertificate from '../pages/StudentCertificate';

import InsLessonspage from '../pages/Instructor/InsLessons';
import InsQuestionspage from '../pages/Instructor/InsQuestions';
import InsQuizzespage from '../pages/Instructor/InsQuizzes';
import InsSubjectspage from '../pages/Instructor/InsSubjects';

import InsAddquestionpage from '../pages/Instructor/create/AddQuestions';
import InsAddlessonspage from '../pages/Instructor/create/AddLessons';
import InsAddQuizzespage from '../pages/Instructor/create/AddQuizzes';
import InsAddSubjectspage from '../pages/Instructor/create/AddSubjects';

import Personelpage from '../pages/Personel';
{/* ลองเพิ่ม */}
// import AddQuestions from '../forms/Course/AddQuestions';



const AppNavigation = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home-two" element={<HomeTwo />} />
        <Route path="/home-three" element={<HomeThree />} />
        <Route path="/home-four" element={<HomeFour />} />
        <Route path="/home-five" element={<HomeFive />} />
        <Route path="/home-six" element={<HomeSix />} />
        <Route path="/home-seven" element={<HomeSeven />} />
        <Route path="/home-eight" element={<HomeEight />} />
        <Route path="/courses" element={<Course />} />
        <Route path="/course-details/:id" element={<CourseDetails />} />
        <Route path="/course-learning/:courseId/:subjectId" element={<Lesson />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/instructors" element={<Instructor />} />
        <Route path="/instructor-details" element={<InstructorDetails />} />
        <Route path="/events" element={<Event />} />
        <Route path="/events-details" element={<EventDetails />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop-details" element={<ShopDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/check-out" element={<CheckOut />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog-2" element={<BlogTwo />} />
        <Route path="/blog-3" element={<BlogThree />} />
        <Route path="/blog-details" element={<BlogDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/subject-details/:courseId/:id" element={<SubjectDetailsPage />} />
        <Route path="/personnel" element={<Personelpage/>} />





        <Route element={<PrivateRoute allowedRoles={["admin","instructor"]} />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-creditbank" element={<AdminCreditbankpage/>} />
        <Route path="/admin-subjects" element={<AdminSubjectspage/>} />
        <Route path="/admin-lessons" element={<AdminLessonsbankpage/>} />
        <Route path="/admin-questions" element={<AdminQuestionspage/>} />
        <Route path="/admin-quizzes" element={<AdminQuizzespage/>} />

        <Route path="/admin-questions/create-new" element={<AdminAddquestionpage/>} />
        <Route path="/admin-quizzes/create-new" element={<AdminAddQuizzespage />} />
        <Route path="/admin-lessons/create-new" element={<AdminAddlessonspage />} />
        <Route path="/admin-subjects/create-new" element={<AdminAddSubjectspage />} />
        <Route path="/admin-creditbank/create-new" element={< AdminAddCoursepage />} />

        <Route path="/admin-creditbank/edit-course/:courseId" element={<AdminEditCorusepage />} />
        <Route path="/admin-lessons/edit-lessons/:lessonId" element={<AdminEditlessonspage />} />
        <Route path="/admin-quizzes/edit-quiz/:quizId" element={<AdminEditQuizzespage />} />
        <Route path="/admin-questions/edit-question/:questionId" element={<AdminEditquestionpage />} />
        <Route path="/admin-subjects/edit-subject/:subjectId" element={<AdminEditSubjectspage />} />

        <Route path="/admin-account/instructors" element={<AdminAccountInstructorspage/>} />
        <Route path="/admin-account/students" element={<AdminStudentpage/>} />

        <Route path="/admin-account/instructors/create-new" element={< CreateAccountInstructorspage />} />
        <Route path="/admin-account/instructors/edit-instructor/:id" element={< EditAccountInstructorspage />} />
        <Route path="/admin-account/students/create-new" element={< CreateAccountStudentspage />} />

        </Route>

        <Route element={<PrivateRoute allowedRoles={["instructor"]} />}>
        <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor-profile" element={<InstructorProfile />} />
        <Route path="/instructor-enrolled-courses" element={<InstructorEnrollCourse />} />
        <Route path="/instructor-wishlist" element={<InstructorWishlist />} />
        <Route path="/instructor-review" element={<InstructorReview />} />
        <Route path="/instructor-attempts" element={<InstructorAttempt />} />
        <Route path="/instructor-history" element={<InstructorHistory />} />
        <Route path="/instructor-courses" element={<InstructorCourses />} />
        <Route path="/instructor-announcement" element={<InstructorAnnouncement />} />
        <Route path="/instructor-quiz" element={<InstructorQuiz />} />
        <Route path="/instructor-assignment" element={<InstructorAssignment />} />
        <Route path="/instructor-setting" element={<InstructorSetting />} />
        <Route path="/instructor-subjects" element={<InsSubjectspage />} />
        <Route path="/instructor-quizzes" element={<InsQuizzespage/>} />
        <Route path="/instructor-questions" element={<InsQuestionspage />} />
        <Route path="/instructor-lessons" element={<InsLessonspage />} />
        <Route path="/instructor-questions/create-new" element={<InsAddquestionpage/>} />
        <Route path="/instructor-quizzes/create-new" element={<InsAddQuizzespage />} />
        <Route path="/instructor-lessons/create-new" element={<InsAddlessonspage />} />
        <Route path="/instructor-subjects/create-new" element={<InsAddSubjectspage />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={["student"]} />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student-enrolled-courses" element={<StudentEnrollCourse />} />
        <Route path="/student-wishlist" element={<StudentWishlist />} />
        <Route path="/student-review" element={<StudentReview />} />
        <Route path="/student-attempts" element={<StudentAttempt />} />
        <Route path="/student-history" element={<StudentHistory />} />
        <Route path="/student-setting" element={<StudentSetting />} />
        <Route path="/student-certificate" element={<StudentCertificate />} />
        </Route>
        {/* <Route path="/blog-details/:id" element={<DynamicBlogDeatils />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppNavigation;
