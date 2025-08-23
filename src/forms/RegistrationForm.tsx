import { toast } from 'react-toastify';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useState, useEffect} from 'react';
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
   gpa: number;
}

// เพิ่ม interface สำหรับนักเรียนมัธยม
interface SchoolFormData {
   username: string;
   first_name: string;
   last_name: string;
   email: string;
   password: string;
   cpassword: string;
   student_code: string;
   school_name: string;
   study_program: string;
   study_program_other?: string;
   grade_level: string;
   address: string;
   phone: string;
   gpa: string;
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
      gpa: yup
         .number()
         .min(0, 'GPA ต้องไม่ต่ำกว่า 0.00')
         .max(4, 'GPA ต้องไม่เกิน 4.00')
         .required('กรุณากรอก GPA'),
   })
   .required();

// เพิ่ม schema สำหรับนักเรียนมัธยม
const schoolSchema = yup
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
      student_code: yup.string().required('กรุณากรอกรหัสนักเรียน'),
      school_name: yup.string().required('กรุณาเลือกโรงเรียน'),
      study_program: yup.string().required('กรุณาเลือกแผนการเรียน'),
      study_program_other: yup.string().when('study_program', {
         is: 'อื่น ๆ',
         then: (schema) => schema.required('กรุณากรอกแผนการเรียน')
      }),
      grade_level: yup.string().required('กรุณาเลือกระดับชั้น'),
      address: yup.string().required('กรุณากรอกที่อยู่'),
      phone: yup.string().required('กรุณากรอกเบอร์โทรศัพท์'),
      gpa: yup
         .string()
         .required('กรุณากรอก GPA')
         .test('gpa-range', 'GPA ต้องอยู่ระหว่าง 0.00 - 4.00', (value) => {
            if (!value) return false;
            const numValue = parseFloat(value);
            return numValue >= 0 && numValue <= 4;
         }),
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

   // เพิ่ม useForm สำหรับนักเรียนมัธยม
   const {
      register: registerSchool,
      handleSubmit: handleSchoolSubmit,
      reset: resetSchool,
      formState: { errors: schoolErrors },
      watch,
   } = useForm<SchoolFormData>({
      resolver: yupResolver(schoolSchema),
   });

   const [departments, setDepartments] = useState<Department[]>([]);
   const [tabIndex, setTabIndex] = useState<number>(0); // 0 = นักศึกษา, 1 = นักเรียน

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
            phone: data.phone || undefined,
            gpa: data.gpa || undefined,
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

      // เพิ่มฟังก์ชันสำหรับนักเรียนมัธยม
   const onSchoolSubmit = async (data: SchoolFormData) => {
      try {
         const payload = {
            username: data.username,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password: data.password,
            cpassword: data.cpassword,
            role_id: 1,
            student_code: data.student_code,
            school_name: data.school_name,
            study_program: data.study_program === 'อื่น ๆ' ? data.study_program_other : data.study_program,
            grade_level: data.grade_level,
            address: data.address,
            education_level: data.grade_level.startsWith('ม1') || data.grade_level.startsWith('ม2') || data.grade_level.startsWith('ม3') ? 'มัธยมต้น' : 'มัธยมปลาย', // กำหนดตาม grade_level
            phone: data.phone || undefined,
            gpa: data.gpa || undefined,
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
            resetSchool();
         } else {
            toast.error(response.data.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก', {
               position: 'top-center',
               theme: 'light',
            });
         }
      } catch (error) {
         if (axios.isAxiosError(error) && error.response) {
            toast.error(error.response.data.message || 'เกิดข้อผิดพลาด', { position: 'top-center', theme: 'light' });
         } else {
            toast.error('เกิดข้อผิดพลาดที่ไม่คาดคิด', { position: 'top-center', theme: 'light' });
         }
      }
   };

   return (
      <form onSubmit={tabIndex === 1 ? handleSchoolSubmit(onSchoolSubmit) : handleSubmit(onSubmit)} className="account__form">
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
                  <label htmlFor="academic-year">ชั้นปีการศึกษา</label>
                  <select
                     {...register('academic_year', { valueAsNumber: true })}
                     id="academic-year"
                     className="input-like-select"
                  >
                     <option value="">เลือกชั้นปีการศึกษา</option>
                     <option value="1">1</option>
                     <option value="2">2</option>
                     <option value="3">3</option>
                     <option value="4">4</option>
                  </select>
                  <p className="form_error">{errors.academic_year?.message}</p>
               </div>

               <div className="form-grp">
                  <label htmlFor="gpa">GPA</label>
                  <input
                     type="number"
                     step="0.01"
                     min="0"
                     max="4"
                     {...register('gpa', { valueAsNumber: true })}
                     id="gpa"
                     placeholder="0.00 - 4.00"
                  />
                  <p className="form_error">{errors.gpa?.message}</p>
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
                     {...registerSchool('username')}
                     id="username"
                     placeholder="ชื่อผู้ใช้"
                  />
                  <p className="form_error">{schoolErrors.username?.message}</p>
               </div>
               <div className="row gutter-20">
                  <div className="col-md-6">
                     <div className="form-grp">
                        <label htmlFor="first-name">ชื่อจริง</label>
                        <input
                           type="text"
                           {...registerSchool('first_name')}
                           id="first-name"
                           placeholder="ชื่อจริง"
                        />
                        <p className="form_error">{schoolErrors.first_name?.message}</p>
                     </div>
                  </div>
                  <div className="col-md-6">
                     <div className="form-grp">
                        <label htmlFor="last-name">นามสกุล</label>
                        <input
                           type="text"
                           {...registerSchool('last_name')}
                           id="last-name"
                           placeholder="นามสกุล"
                        />
                        <p className="form_error">{schoolErrors.last_name?.message}</p>
                     </div>
                  </div>
               </div>
               <div className="form-grp">
                  <label htmlFor="email">อีเมล</label>
                  <input
                     type="email"
                     {...registerSchool('email')}
                     id="email"
                     placeholder="อีเมล"
                  />
                  <p className="form_error">{schoolErrors.email?.message}</p>
               </div>
               <div className="form-grp">
                  <label htmlFor="student-code">รหัสนักเรียน</label>
                  <input
                     type="text"
                     {...registerSchool('student_code')}
                     id="student-code"
                     placeholder="รหัสนักเรียน"
                  />
                  <p className="form_error">{schoolErrors.student_code?.message}</p>
               </div>
               <div className="form-grp">
                  <label htmlFor="school-name">ชื่อโรงเรียน</label>
                  <select
                     {...registerSchool('school_name')}
                     id="school-name"
                     className="input-like-select"
                  >
                     <option value="">เลือกโรงเรียน</option>
                     {schoolNames.map((name) => (
                        <option key={name} value={name}>{name}</option>
                     ))}
                  </select>
                  <p className="form_error">{schoolErrors.school_name?.message}</p>
               </div>
               <div className="form-grp">
                  <label htmlFor="study-program">แผนการเรียน</label>
                  <select
                     {...registerSchool('study_program')}
                     id="study-program"
                     className="input-like-select"
                  >
                     <option value="">เลือกแผนการเรียน</option>
                     {studyPrograms.map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                     ))}
                     <option value="อื่น ๆ">อื่น ๆ (กรอกเอง)</option>
                  </select>
                  <p className="form_error">{schoolErrors.study_program?.message}</p>
                  {watch('study_program') === 'อื่น ๆ' && (
                     <input
                        type="text"
                        style={{ marginTop: 8 }}
                        placeholder="กรอกแผนการเรียน"
                        {...registerSchool('study_program_other')}
                     />
                  )}
                  {watch('study_program') === 'อื่น ๆ' && schoolErrors.study_program_other && (
                     <p className="form_error">{schoolErrors.study_program_other.message}</p>
                  )}
               </div>

               <div className="form-grp">
                  <label htmlFor="grade-level">ระดับชั้น</label>
                  <select
                     {...registerSchool('grade_level')}
                     id="grade-level"
                     className="input-like-select"
                  >
                     <option value="">เลือกระดับชั้น</option>
                     <option value="ม1">มัธยมศึกษาปีที่ 1</option>
                     <option value="ม2">มัธยมศึกษาปีที่ 2</option>
                     <option value="ม3">มัธยมศึกษาปีที่ 3</option>
                     <option value="ม4">มัธยมศึกษาปีที่ 4</option>
                     <option value="ม5">มัธยมศึกษาปีที่ 5</option>
                     <option value="ม6">มัธยมศึกษาปีที่ 6</option>
                  </select>
                  <p className="form_error">{schoolErrors.grade_level?.message}</p>
               </div>
               <div className="form-grp">
                  <label htmlFor="password">รหัสผ่าน</label>
                  <input
                     type="password"
                     {...registerSchool('password')}
                     id="password"
                     placeholder="รหัสผ่าน"
                  />
                  <p className="form_error">{schoolErrors.password?.message}</p>
               </div>
               <div className="form-grp">
                  <label htmlFor="cpassword">ยืนยันรหัสผ่าน</label>
                  <input
                     type="password"
                     {...registerSchool('cpassword')}
                     id="cpassword"
                     placeholder="ยืนยันรหัสผ่าน"
                  />
                  <p className="form_error">{schoolErrors.cpassword?.message}</p>
               </div>
               <div className="form-grp">
                  <label htmlFor="address">ที่อยู่</label>
                  <input
                     type="text"
                     {...registerSchool('address')}
                     id="address"
                     placeholder="ที่อยู่"
                  />
                  <p className="form_error">{schoolErrors.address?.message}</p>
               </div>

               <div className="form-grp">
                  <label htmlFor="phone">เบอร์โทรศัพท์</label>
                  <input
                     type="text"
                     {...registerSchool('phone')}
                     id="phone"
                     placeholder="เบอร์โทรศัพท์"
                  />
                  <p className="form_error">{schoolErrors.phone?.message}</p>
               </div>

               <div className="form-grp">
                  <label htmlFor="gpa">GPA</label>
                  <input
                     type="number"
                     step="0.01"
                     min="0"
                     max="4"
                     {...registerSchool('gpa')}
                     id="gpa"
                     placeholder="0.00 - 4.00"
                  />
                  <p className="form_error">{schoolErrors.gpa?.message}</p>
               </div>
            </>
         )}

         <button type="submit" className="btn btn-two arrow-btn">
            ลงทะเบียน
            <BtnArrow />
         </button>
      </form>
   );
};

export default RegistrationForm;