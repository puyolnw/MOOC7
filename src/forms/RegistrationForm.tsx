import { toast } from 'react-toastify';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useState, useEffect } from 'react';
import BtnArrow from '../svg/BtnArrow';
import '../../public/assets/css/option.css';

const apiURL = import.meta.env.VITE_API_URL;

interface FormData {
   username: string;
   first_name: string;
   last_name: string;
   email: string;
   password: string;
   cpassword: string;
   student_code: number;
   department_id: string;
   education_level: string;
   academic_year: number;
   phone: string;
   address: string;
}

interface Department {
   department_id: number;
   department_name: string;
   faculty: string;
   created_at: string;
   description: string | null;
}

const schema = yup
   .object({
      username: yup
         .string()
         .required('กรุณากรอกชื่อผู้ใช้')
         .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'),
      first_name: yup.string().required('กรุณากรอกชื่อจริง'),
      last_name: yup.string().required('กรุณากรอกนามสกุล'),
      email: yup.string().required('กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
      password: yup
         .string()
         .required('กรุณากรอกรหัสผ่าน')
         .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
      cpassword: yup
         .string()
         .required('กรุณายืนยันรหัสผ่าน')
         .oneOf([yup.ref('password')], 'รหัสผ่านไม่ตรงกัน'),
      student_code: yup.number().required('กรุณากรอกรหัสนักศึกษา'),
      department_id: yup.string().required('กรุณาเลือกภาควิชา'),
      education_level: yup.string().required('กรุณาเลือกระดับการศึกษา'),
      academic_year: yup
         .number()
         .required('กรุณาเลือกชั้นปีการศึกษา')
         .min(1, 'ชั้นปีต้องมากกว่า 0')
         .max(4, 'ชั้นปีต้องไม่เกิน 4'),
      phone: yup.string().required('กรุณากรอกเบอร์โทรศัพท์'),
      address: yup.string().required('กรุณากรอกที่อยู่'),
   })
   .required();

const tab_title: string[] = ["นักศึกษา", "นักเรียน"];

// เพิ่ม mock data สำหรับ school_name dropdown
const schoolNames = [
   'โรงเรียน1',
   'โรงเรียน2',
];

const studyPrograms = [
   'วิทย์-คณิต',
   'ศิลป์-ภาษา',
   'ศิลป์-คำนวณ',
   'ศิลป์-สังคม',
];

const RegistrationForm = () => {
   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<FormData>({
      resolver: yupResolver(schema),
   });

   const [departments, setDepartments] = useState<Department[]>([]);
   const [tabIndex, setTabIndex] = useState<number>(0); // 0 = นักศึกษา, 1 = นักเรียน
   const [schoolFields, setSchoolFields] = useState({
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      student_code: '',
      school_name: '',
      study_program: '',
      study_program_other: '',
      education_level: '',
      grade_level: '',
      password: '',
      cpassword: '',
      address: '',
   });

   useEffect(() => {
      const fetchDepartments = async () => {
         try {
            const response = await axios.get(`${apiURL}/api/auth/departments`);
            if (response.data.success) {
               setDepartments(response.data.departments);
            }
         } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลภาควิชา:', error);
         }
      };

      fetchDepartments();
   }, []);

   const onSubmit = async (data: FormData) => {
      try {
         const payload = {
            username: data.username,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password: data.password,
            role_id: 1,
            student_code: data.student_code,
            department_id: data.department_id,
            education_level: data.education_level,
            academic_year: data.academic_year,
         };

         const response = await axios.post(`${apiURL}/api/auth/register`, payload);

         if (response.data.success) {
            toast.success(response.data.message || 'สมัครสมาชิกสำเร็จ', {
               position: 'top-center',
               theme: 'light',
               onClose: () => {
                  window.location.href = '/login';
               }
            });
            reset();
         } else {
            // ตรวจสอบข้อความ error เพื่อแสดงคำเตือนที่เฉพาะเจาะจง
            if (response.data.message === 'อีเมลนี้มีในระบบแล้ว') {
               toast.error('อีเมลนี้ได้มีการลงทะเบียนในระบบแล้ว กรุณาใช้อีเมลอื่น', {
                  position: 'top-center',
                  theme: 'light',
               });
            } else if (response.data.message === 'รหัสนักศึกษานี้มีในระบบแล้ว') {
               toast.error('รหัสนักศึกษานี้ได้มีการลงทะเบียนในระบบแล้ว', {
                  position: 'top-center',
                  theme: 'light',
               });
            } else if (response.data.message === 'ชื่อผู้ใช้นี้มีในระบบแล้ว') {
               toast.error('ชื่อผู้ใช้นี้ได้มีการลงทะเบียนในระบบแล้ว กรุณาใช้ชื่อผู้ใช้อื่น', {
                  position: 'top-center',
                  theme: 'light',
               });
            } else {
               toast.error(response.data.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก', {
                  position: 'top-center',
                  theme: 'light',
               });
            }
         }
      } catch (error) {
         console.error('เกิดข้อผิดพลาดในการสมัครสมาชิก:', error);
         if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data.message;
            if (errorMessage === 'อีเมลนี้มีในระบบแล้ว') {
               toast.error('อีเมลนี้มีในระบบแล้ว กรุณาใช้อีเมลอื่น', {
                  position: 'top-center',
                  theme: 'light',
               });
            } else if (errorMessage === 'รหัสนักศึกษานี้มีในระบบแล้ว') {
               toast.error('รหัสนักศึกษานี้มีในระบบแล้ว กรุณาใช้รหัสอื่น', {
                  position: 'top-center',
                  theme: 'light',
               });
            } else if (errorMessage === 'ชื่อผู้ใช้นี้มีในระบบแล้ว') {
               toast.error('ชื่อผู้ใช้นี้ได้มีการลงทะเบียนในระบบแล้ว กรุณาใช้ชื่อผู้ใช้อื่น', {
                  position: 'top-center',
                  theme: 'light',
               });
            } else {
               toast.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', {
                  position: 'top-center',
                  theme: 'light',
               });
            }
         } else {
            toast.error('เกิดข้อผิดพลาดที่ไม่คาดคิด', {
               position: 'top-center',
               theme: 'light',
            });
         }
      }
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="account__form">
         {/* Tab UI */}
         <div style={{ display: 'flex', gap: '1rem', marginBottom: 24 }}>
            {tab_title.map((title, idx) => (
               <button
                  type="button"
                  key={title}
                  onClick={() => setTabIndex(idx)}
                  style={{
                     padding: '8px 24px',
                     border: 'none',
                     borderBottom: tabIndex === idx ? '3px solid #007bff' : '1px solid #ccc',
                     background: 'none',
                     color: tabIndex === idx ? '#007bff' : '#333',
                     fontWeight: tabIndex === idx ? 'bold' : 'normal',
                     cursor: 'pointer',
                     outline: 'none',
                     fontSize: 18,
                  }}
               >
                  {title}
               </button>
            ))}
         </div>

         {/* ฟิลด์สำหรับนักศึกษา */}
         {tabIndex === 0 && (
            <>
               <div className="form-grp">
                  <label htmlFor="username">ชื่อผู้ใช้</label>
                  <input
                     type="text"
                     {...register('username')}
                     id="username"
                     placeholder="ชื่อผู้ใช้"
                  />
                  <p className="form_error">{errors.username?.message}</p>
               </div>

               <div className="row gutter-20">
                  <div className="col-md-6">
                     <div className="form-grp">
                        <label htmlFor="first-name">ชื่อจริง</label>
                        <input
                           type="text"
                           {...register('first_name')}
                           id="first-name"
                           placeholder="ชื่อจริง"
                        />
                        <p className="form_error">{errors.first_name?.message}</p>
                     </div>
                  </div>
                  <div className="col-md-6">
                     <div className="form-grp">
                        <label htmlFor="last-name">นามสกุล</label>
                        <input
                           type="text"
                           {...register('last_name')}
                           id="last-name"
                           placeholder="นามสกุล"
                        />
                        <p className="form_error">{errors.last_name?.message}</p>
                     </div>
                  </div>
               </div>

               <div className="form-grp">
                  <label htmlFor="email">อีเมล</label>
                  <input
                     type="email"
                     {...register('email')}
                     id="email"
                     placeholder="อีเมล"
                  />
                  <p className="form_error">{errors.email?.message}</p>
               </div>

               <div className="form-grp">
                  <label htmlFor="phone">เบอร์โทรศัพท์</label>
                  <input
                     type="text"
                     {...register('phone')}
                     id="phone"
                     placeholder="เบอร์โทรศัพท์"
                  />
                  <p className="form_error">{errors.phone?.message}</p>
               </div>

               <div className="form-grp">
                  <label htmlFor="student-code">รหัสนักศึกษา</label>
                  <input
                     type="text"
                     {...register('student_code')}
                     id="student-code"
                     placeholder="รหัสนักศึกษา"
                  />
                  <p className="form_error">{errors.student_code?.message}</p>
               </div>

               <div className="form-grp">
                  <label htmlFor="department-id">ภาควิชา <span className="text-danger">*</span></label>
                  <select
                     {...register('department_id')}
                     id="department-id"
                     className="input-like-select"
                  >
                     <option value="">เลือกภาควิชา</option>
                     {departments.map((dept) => (
                        <option key={dept.department_id} value={dept.department_id}>
                           {dept.department_name}
                        </option>
                     ))}
                  </select>
                  <p className="form_error">{errors.department_id?.message}</p>
               </div>

               <div className="form-grp">
                  <label htmlFor="education-level">ระดับการศึกษา <span className="text-danger">*</span></label>
                  <select
                     {...register('education_level')}
                     id="education-level"
                     className="input-like-select"
                  >
                     <option value="">เลือกระดับการศึกษา</option>
                     <option value="ปริญญาตรี">ปริญญาตรี</option>
                     <option value="ปริญญาโท">ปริญญาโท</option>
                     <option value="ปริญญาเอก">ปริญญาเอก</option>
                  </select>
                  <p className="form_error">{errors.education_level?.message}</p>
               </div>

               <div className="form-grp">
                  <label htmlFor="password">รหัสผ่าน</label>
                  <input
                     type="password"
                     {...register('password')}
                     id="password"
                     placeholder="รหัสผ่าน"
                  />
                  <p className="form_error">{errors.password?.message}</p>
               </div>

               <div className="form-grp">
                  <label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label>
                  <input
                     type="password"
                     {...register('cpassword')}
                     id="confirm-password"
                     placeholder="ยืนยันรหัสผ่าน"
                  />
                  <p className="form_error">{errors.cpassword?.message}</p>
               </div>
            </>
         )}

         {/* ฟิลด์ mockup สำหรับนักเรียนมัธยม */}
         {tabIndex === 1 && (
            <>
               <div className="form-grp">
                  <label htmlFor="username">ชื่อผู้ใช้</label>
                  <input
                     type="text"
                     id="username"
                     value={schoolFields.username}
                     onChange={e => setSchoolFields(f => ({ ...f, username: e.target.value }))}
                     placeholder="ชื่อผู้ใช้"
                  />
               </div>
               <div className="row gutter-20">
                  <div className="col-md-6">
                     <div className="form-grp">
                        <label htmlFor="first-name">ชื่อจริง</label>
                        <input
                           type="text"
                           id="first-name"
                           value={schoolFields.first_name}
                           onChange={e => setSchoolFields(f => ({ ...f, first_name: e.target.value }))}
                           placeholder="ชื่อจริง"
                        />
                     </div>
                  </div>
                  <div className="col-md-6">
                     <div className="form-grp">
                        <label htmlFor="last-name">นามสกุล</label>
                        <input
                           type="text"
                           id="last-name"
                           value={schoolFields.last_name}
                           onChange={e => setSchoolFields(f => ({ ...f, last_name: e.target.value }))}
                           placeholder="นามสกุล"
                        />
                     </div>
                  </div>
               </div>
               <div className="form-grp">
                  <label htmlFor="email">อีเมล</label>
                  <input
                     type="email"
                     id="email"
                     value={schoolFields.email}
                     onChange={e => setSchoolFields(f => ({ ...f, email: e.target.value }))}
                     placeholder="อีเมล"
                  />
               </div>
               <div className="form-grp">
                  <label htmlFor="student-code">รหัสนักเรียน</label>
                  <input
                     type="text"
                     id="student-code"
                     value={schoolFields.student_code}
                     onChange={e => setSchoolFields(f => ({ ...f, student_code: e.target.value }))}
                     placeholder="รหัสนักเรียน"
                  />
               </div>
               <div className="form-grp">
                  <label htmlFor="school-name">ชื่อโรงเรียน</label>
                  <select
                     id="school-name"
                     value={schoolFields.school_name}
                     onChange={e => setSchoolFields(f => ({ ...f, school_name: e.target.value }))}
                     className="input-like-select"
                  >
                     <option value="">เลือกโรงเรียน</option>
                     {schoolNames.map((name) => (
                        <option key={name} value={name}>{name}</option>
                     ))}
                  </select>
               </div>
               <div className="form-grp">
                  <label htmlFor="study-program">แผนการเรียน</label>
                  <select
                     id="study-program"
                     value={schoolFields.study_program}
                     onChange={e => setSchoolFields(f => ({ ...f, study_program: e.target.value }))}
                     className="input-like-select"
                  >
                     <option value="">เลือกแผนการเรียน</option>
                     {studyPrograms.map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                     ))}
                     <option value="อื่น ๆ">อื่น ๆ (กรอกเอง)</option>
                  </select>
                  {schoolFields.study_program === 'อื่น ๆ' && (
                     <input
                        type="text"
                        style={{ marginTop: 8 }}
                        placeholder="กรอกแผนการเรียน"
                        value={schoolFields.study_program_other}
                        onChange={e => setSchoolFields(f => ({ ...f, study_program_other: e.target.value }))}
                     />
                  )}
               </div>
               <div className="form-grp">
                  <label htmlFor="education-level">ระดับการศึกษา</label>
                  <select
                     id="education-level"
                     value={schoolFields.education_level}
                     onChange={e => setSchoolFields(f => ({ ...f, education_level: e.target.value }))}
                     className="input-like-select"
                  >
                     <option value="">เลือกระดับการศึกษา</option>
                     <option value="มัธยมต้น">มัธยมต้น</option>
                     <option value="มัธยมปลาย">มัธยมปลาย</option>
                  </select>
               </div>
               <div className="form-grp">
                  <label htmlFor="grade-level">ชั้นปี</label>
                  <select
                     id="grade-level"
                     value={schoolFields.grade_level}
                     onChange={e => setSchoolFields(f => ({ ...f, grade_level: e.target.value }))}
                     className="input-like-select"
                  >
                     <option value="">เลือกชั้นปี</option>
                     <option value="ม.1">ม.1</option>
                     <option value="ม.2">ม.2</option>
                     <option value="ม.3">ม.3</option>
                     <option value="ม.4">ม.4</option>
                     <option value="ม.5">ม.5</option>
                     <option value="ม.6">ม.6</option>
                  </select>
               </div>
               <div className="form-grp">
                  <label htmlFor="password">รหัสผ่าน</label>
                  <input
                     type="password"
                     id="password"
                     value={schoolFields.password}
                     onChange={e => setSchoolFields(f => ({ ...f, password: e.target.value }))}
                     placeholder="รหัสผ่าน"
                  />
               </div>
               <div className="form-grp">
                  <label htmlFor="password">รหัสผ่าน</label>
                  <input
                     type="cpassword"
                     id="cpassword"
                     value={schoolFields.cpassword}
                     onChange={e => setSchoolFields(f => ({ ...f, password: e.target.value }))}
                     placeholder="ยืนยันรหัสผ่าน"
                  />
               </div>
               <div className="form-grp">
                  <label htmlFor="address">ที่อยู่</label>
                  <input
                     type="text"
                     id="address"
                     value={schoolFields.address}
                     onChange={e => setSchoolFields(f => ({ ...f, address: e.target.value }))}
                     placeholder="ที่อยู่"
                  />
               </div>
            </>
         )}

         <button type="submit" className="btn btn-two arrow-btn" disabled={tabIndex === 1}>
            ลงทะเบียน
            <BtnArrow />
         </button>
      </form>
   );
};

export default RegistrationForm;