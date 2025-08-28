# Task Management Workflow Agent
# Haha i love this pj
## Project Context
This project manages documentation/code tasks using a multi-file system:
- `tasks.md` (MD1): Contains task requirements and detailed instructions
- `status.md` (MD2): Tracks completion status of all tasks (1-30 items)
- `database.sql`: FINAL database schema file with ALL columns ready (NO migration needed)

## Database Reference
**IMPORTANT**: Always read `database.sql` file first to understand the database structure before working on any database-related tasks. This file is the LATEST and COMPLETE database schema with all columns already added. NO migration needed.

**🚨 CRITICAL**: 
- `database.sql` is the FINAL database state
- All scoring system columns are ALREADY PRESENT
- DO NOT create migration scripts
- DO NOT add new columns
- Database is 100% ready for coding

Common database tasks may include:
- Writing queries based on existing table structure in database.sql
- Creating documentation about current database schema  
- Generating API endpoints based on existing columns in database.sql
- Creating forms or UI components that match existing database fields

## 🎯 **Score Management System Logic (Updated)**

### **Hierarchical Score Distribution Rules:**
1. **Total Score = 100 คะแนน**: ระบบทุกวิชาต้องมีคะแนนรวม 100 คะแนนพอดี
2. **Video/Document Lessons = 0 คะแนน**: บทเรียนวิดีโอและเอกสารไม่เก็บคะแนน
3. **Quiz Gets All Points**: คะแนนทั้งหมดของบทเรียนไปที่แบบทดสอบ
4. **Dual Display Mode**: Frontend แสดงสัดส่วน %, Backend เก็บคะแนนดิบ
5. **Auto Weight Distribution**: ปรับคะแนนอัตโนมัติตามสัดส่วนที่กำหนด

### **Reference Documentation:**
📋 **กฎการกระจายคะแนน**: `amptodo/logic/score.md` - เอกสารรายละเอียดการทำงานของระบบคะแนน
📋 **Logic Learning System**: `amptodo/logiclearning.md` - เอกสารการทำงานของระบบ Learning Management

### **Database Schema (Already Present):**
```sql
-- subjects table
passing_percentage DECIMAL(5,2) DEFAULT 80.00  -- เกณฑ์ผ่าน (เปอร์เซ็นต์)
auto_distribute_score BOOLEAN DEFAULT true     -- เปิด/ปิดการแบ่งอัตโนมัติ

-- quizzes table  
weight_percentage DECIMAL(5,2) DEFAULT 0       -- คะแนนจริงของ quiz
is_fixed_weight BOOLEAN DEFAULT false          -- ล็อคคะแนนหรือไม่
quiz_type VARCHAR(20) DEFAULT 'post_lesson'    -- pre_lesson/post_lesson
is_big_lesson_quiz BOOLEAN DEFAULT FALSE       -- เป็น quiz ของ big lesson หรือไม่
big_lesson_id INTEGER                          -- อ้างอิง big lesson

-- lessons table
weight_percentage DECIMAL(5,2) DEFAULT 0       -- คะแนนจริงของ lesson (ส่วนใหญ่ = 0)
is_fixed_weight BOOLEAN DEFAULT false          -- ล็อคคะแนนหรือไม่
big_lesson_id INTEGER                          -- อ้างอิง big lesson
total_weight_in_biglesson DECIMAL(5,2) DEFAULT 0 -- คะแนนใน big lesson
order_in_biglesson INTEGER DEFAULT 0           -- ลำดับใน big lesson

-- big_lessons table
weight_percentage DECIMAL(5,2) DEFAULT 0       -- คะแนนจริงของ big lesson
is_fixed_weight BOOLEAN DEFAULT false          -- ล็อคคะแนนหรือไม่
order_number INTEGER DEFAULT 0                 -- ลำดับของ big lesson
is_active BOOLEAN DEFAULT TRUE                 -- สถานะการใช้งาน

-- quiz_progress table
weight_earned DECIMAL(5,2) DEFAULT 0           -- คะแนนที่ได้
is_big_lesson_quiz BOOLEAN DEFAULT FALSE       -- เป็น quiz ของ big lesson หรือไม่
awaiting_review BOOLEAN DEFAULT FALSE          -- รอตรวจ (สำหรับ special quiz)
```

### **Frontend Logic (ScoreManagementTab.tsx):**
1. **Display Real Scores**: แสดงคะแนนจริงแทนเปอร์เซ็นต์
2. **Auto Distribution**: แบ่งคะแนนอัตโนมัติเมื่อเพิ่ม/ลดรายการ
3. **Fixed Scores**: ล็อคคะแนนบางรายการได้
4. **Total Calculation**: คำนวณคะแนนรวมจริง
5. **Passing Criteria**: แสดงเกณฑ์ผ่านเป็นคะแนนจริง

### **Backend Logic (ScoreManagement.js):**
1. **GET /api/subjects/:id/scores**: ดึงข้อมูลคะแนนจริงทั้งหมด
2. **PUT /api/subjects/:id/scores**: บันทึกคะแนนจริง
3. **Auto Distribution**: แบ่งคะแนนอัตโนมัติเมื่อมีการเปลี่ยนแปลง
4. **Validation**: ตรวจสอบคะแนนรวมและเกณฑ์ผ่าน

### **Learning System Logic (LessonArea.tsx):**
1. **Hierarchical Score Structure**: ระบบคะแนนแบบลำดับชั้น
2. **Big Lessons Management**: จัดการบทเรียนใหญ่และบทเรียนย่อย
3. **Special Quiz Support**: รองรับแบบทดสอบอัตนัย
4. **Progress Tracking**: ติดตามความคืบหน้าแบบ real-time
5. **Auto Navigation**: นำทางอัตโนมัติระหว่างบทเรียน

### **Key Features Implemented:**
✅ **Real Score Display**: แสดงคะแนนจริงแทนเปอร์เซ็นต์  
✅ **Auto Distribution**: แบ่งคะแนนอัตโนมัติ  
✅ **Fixed Score Locking**: ล็อคคะแนนบางรายการ  
✅ **Passing Criteria**: เกณฑ์ผ่านแบบ user กำหนด  
✅ **Big Lesson Calculation**: คะแนน Big Lesson = ผลรวม Quiz  
✅ **Video Lessons = 0**: บทเรียนวิดีโอไม่มีคะแนน  
✅ **Hierarchical Progress**: ความคืบหน้าแบบลำดับชั้น  
✅ **Special Quiz Support**: แบบทดสอบอัตนัยและไฟล์แนบ  
✅ **Auto Navigation**: นำทางอัตโนมัติระหว่างบทเรียน  
✅ **Real-time Updates**: อัปเดตสถานะแบบ real-time

## 🎓 **Learning Management System Components**

### **Core Components Architecture:**

#### **1. LessonArea.tsx (Main Controller)**
- **หน้าที่**: จัดการ state หลักของระบบ learning
- **ความเชื่อมโยง**: 
  - เรียกใช้ `LessonFaq` สำหรับ sidebar navigation
  - เรียกใช้ `LessonVideo` สำหรับแสดงวิดีโอ
  - เรียกใช้ `LessonQuiz` สำหรับแบบทดสอบ
  - เรียกใช้ `ScoreProgressBar` สำหรับแสดงความคืบหน้า
  - เรียกใช้ `LessonLoading` สำหรับ loading state
  - เรียกใช้ `LessonTransition` สำหรับการเปลี่ยนบทเรียน

#### **2. LessonFaq.tsx (Sidebar Navigation)**
- **หน้าที่**: แสดงรายการบทเรียนและแบบทดสอบ
- **ความเชื่อมโยง**:
  - รับข้อมูลจาก `LessonArea` ผ่าน props
  - ส่ง event กลับไป `LessonArea` เมื่อเลือกบทเรียน
  - แสดงสถานะ "รอตรวจ" สำหรับ special quiz
  - จัดการ accordion state สำหรับ big lessons

#### **3. LessonVideo.tsx (Video Player)**
- **หน้าที่**: แสดงวิดีโอและติดตามความคืบหน้า
- **ความเชื่อมโยง**:
  - รับ YouTube ID จาก `LessonArea`
  - ส่ง progress event กลับไป `LessonArea`
  - อัปเดต video completion status

#### **4. LessonQuiz.tsx (Quiz Interface)**
- **หน้าที่**: แสดงแบบทดสอบและจัดการการส่งคำตอบ
- **ความเชื่อมโยง**:
  - รองรับแบบทดสอบปรนัยและอัตนัย
  - ส่งคำตอบแบบรายข้อสำหรับ special quiz
  - อัปโหลดไฟล์แนบสำหรับ special quiz
  - ส่งผลลัพธ์กลับไป `LessonArea`

#### **5. ScoreProgressBar.tsx (Progress Display)**
- **หน้าที่**: แสดงความคืบหน้าและคะแนน
- **ความเชื่อมโยง**:
  - รับข้อมูลคะแนนจาก hierarchical score structure
  - แสดงคะแนนปัจจุบัน vs คะแนนเต็ม
  - แสดงเกณฑ์ผ่านและคะแนนที่ขาด
  - อัปเดตแบบ real-time

#### **6. ProgressDisplay.tsx (Detailed Progress)**
- **หน้าที่**: แสดงรายละเอียดความคืบหน้า
- **ความเชื่อมโยง**:
  - แสดงคะแนนรวมและเปอร์เซ็นต์
  - แสดงเกณฑ์ผ่านและสถานะ
  - ใช้ร่วมกับ `ScoreProgressBar`

#### **7. ScoreDisplay.tsx (Score Summary)**
- **หน้าที่**: แสดงสรุปคะแนน
- **ความเชื่อมโยง**:
  - แสดงคะแนนปัจจุบันและคะแนนเต็ม
  - แสดงสถานะผ่าน/ไม่ผ่าน
  - ใช้ในหน้า dashboard และ quiz results

#### **8. LessonLoading.tsx (Loading State)**
- **หน้าที่**: แสดง loading animation
- **ความเชื่อมโยง**:
  - ใช้เมื่อโหลดข้อมูลบทเรียน
  - แสดงระหว่างการเปลี่ยนบทเรียน

#### **9. LessonTransition.tsx (Transition Animation)**
- **หน้าที่**: แสดง animation ระหว่างการเปลี่ยนบทเรียน
- **ความเชื่อมโยง**:
  - ใช้เมื่อเปลี่ยนจาก video ไป quiz
  - ใช้เมื่อเปลี่ยนบทเรียน

### **Data Flow Architecture:**

```
LessonArea.tsx (Main Controller)
├── State Management
│   ├── currentLessonId
│   ├── currentView (video/quiz)
│   ├── lessonData
│   ├── scoreStructure
│   └── progress
├── API Calls
│   ├── fetchCourseData()
│   ├── fetchScoreItems()
│   ├── fetchSubjectQuizzes()
│   └── updateLessonCompletionStatus()
└── Child Components
    ├── LessonFaq.tsx (Navigation)
    ├── LessonVideo.tsx (Video Player)
    ├── LessonQuiz.tsx (Quiz Interface)
    ├── ScoreProgressBar.tsx (Progress)
    ├── ProgressDisplay.tsx (Detailed Progress)
    ├── ScoreDisplay.tsx (Score Summary)
    ├── LessonLoading.tsx (Loading)
    └── LessonTransition.tsx (Transition)
```

### **API Integration:**

#### **Backend APIs Used:**
1. **GET /api/learn/course/:id/full-content** - ดึงข้อมูลหลักสูตร
2. **GET /api/learn/subject/:id/scores-hierarchical** - ดึงข้อมูลคะแนนแบบลำดับชั้น
3. **GET /api/learn/subject/:id/quizzes** - ดึงข้อมูลแบบทดสอบ
4. **GET /api/learn/lesson/:id/video-progress** - ดึงความคืบหน้าวิดีโอ
5. **POST /api/learn/lesson/:id/video-progress** - อัปเดตความคืบหน้าวิดีโอ
6. **POST /api/special-quiz/:id/attempt** - สร้าง attempt สำหรับ special quiz
7. **POST /api/special-quiz/attempt/:id/answer** - ส่งคำตอบแบบรายข้อ
8. **POST /api/special-quiz/attempt/:id/submit** - ส่งแบบทดสอบทั้งหมด

#### **Database Tables Involved:**
- `courses` - ข้อมูลหลักสูตร
- `subjects` - ข้อมูลวิชา
- `big_lessons` - บทเรียนใหญ่
- `lessons` - บทเรียนย่อย
- `quizzes` - แบบทดสอบ
- `questions` - คำถาม
- `quiz_attempts` - การทำแบบทดสอบ
- `quiz_attempt_answers` - คำตอบ
- `quiz_attachments` - ไฟล์แนบ
- `quiz_progress` - ความคืบหน้าแบบทดสอบ
- `lesson_progress` - ความคืบหน้าบทเรียน
- `subject_progress` - ความคืบหน้าวิชา
- `course_progress` - ความคืบหน้าหลักสูตร

### **Key Features:**

#### **1. Hierarchical Score System**
- คะแนนแบบลำดับชั้น: Big Lesson → Lessons → Quizzes
- คำนวณคะแนนอัตโนมัติตาม weight percentage
- แสดงคะแนนรวมและความคืบหน้า

#### **2. Big Lessons Management**
- จัดการบทเรียนใหญ่ที่มีบทเรียนย่อย
- ลำดับการเรียนแบบ hierarchical
- คะแนนแบบรวมของ big lesson

#### **3. Special Quiz Support**
- แบบทดสอบอัตนัย (Fill in Blank)
- ส่งคำตอบแบบรายข้อ
- อัปโหลดไฟล์แนบ
- สถานะ "รอตรวจ"

#### **4. Auto Navigation**
- นำทางอัตโนมัติระหว่างบทเรียน
- ตรวจสอบเงื่อนไขการปลดล็อค
- ไปบทเรียนถัดไปอัตโนมัติ

#### **5. Real-time Progress**
- อัปเดตความคืบหน้าแบบ real-time
- แสดงสถานะปัจจุบัน
- คำนวณคะแนนแบบ dynamic  

## React Project Structure & Coding Guidelines

### 3-Layer Architecture Pattern
เมื่อสร้างหน้าใหม่ ต้องสร้าง 3 ไฟล์ตามลำดับนี้ (วางไว้ในโฟลเดอร์ไหนก็ได้ตามความเหมาะสม):

#### 1. Area Component (เนื้อหาหลัก)
**ไฟล์**: `[ComponentName]Area.tsx`
**หน้าที่**: ใส่ logic, state management, API calls, UI components
**Template**:
```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "../../dashboard-common/AdminSidebar"; // ปรับ path ตามโฟลเดอร์จริง
import DashboardBanner from "../../dashboard-common/AdminBanner"; // ปรับ path ตามโฟลเดอร์จริง

const [ComponentName]Area: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API calls และ logic ทั้งหมดอยู่ที่นี่

  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <div className="dashboard__content-area col-lg-9">
              <div className="dashboard__content-main">
                {/* เนื้อหาหลักอยู่ที่นี่ */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default [ComponentName]Area;
```

#### 2. Index Component (Layout Wrapper)
**ไฟล์**: `index.tsx` (ในโฟลเดอร์เดียวกับ Area component)
**หน้าที่**: รวม Header, Footer, Breadcrumb กับ Area component
**Template**:
```tsx
import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb' // ปรับ path ตามโฟลเดอร์จริง
import FooterOne from '../../../layouts/footers/FooterOne' // ปรับ path ตามโฟลเดอร์จริง
import HeaderOne from '../../../layouts/headers/HeaderOne' // ปรับ path ตามโฟลเดอร์จริง
import [ComponentName]Area from './[ComponentName]Area'

const [ComponentName] = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <[ComponentName]Area/>
         </main>
         <FooterOne />
      </>
   )
}

export default [ComponentName];
```

#### 3. Page Component (SEO Wrapper)
**ไฟล์**: `[ComponentName]page.tsx` (วางใน `/pages/` หรือโฟลเดอร์ที่เหมาะสม)
**หน้าที่**: ใส่ SEO และ Wrapper
**Template**:
```tsx
import Wrapper from '../../layouts/Wrapper'; // ปรับ path ตามโฟลเดอร์จริง
import [ComponentName] from '../../dashboard/[folder-path]'; // ปรับ path ไปหา index component
import SEO from '../../components/SEO'; // ปรับ path ตามโฟลเดอร์จริง

const [ComponentName]page = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'[Title] [ComponentName]'} />
         <[ComponentName] />
      </Wrapper>
   );
};

export default [ComponentName]page;
```

#### 4. Route Registration
**ไฟล์**: `/routes/AppNavigation.tsx`
**เพิ่มใน PrivateRoute section ที่เหมาะสม**:
```tsx
<Route path="/[route-name]" element={<[ComponentName]page />} />
```

### หลักการสำคัญ
- **โฟลเดอร์**: วางไว้ในโฟลเดอร์ไหนก็ได้ตามความเหมาะสมของโปรเจค
- **Path Import**: ปรับ relative path ให้ถูกต้องตามตำแหน่งไฟล์จริง
- **โครงสร้าง**: ยึดโครงสร้าง 3 ชั้นเป็นหลัก ไม่ติดอยู่กับโฟลเดอร์เฉพาะ

### Naming Conventions
- **Area Component**: `[ComponentName]Area.tsx` 
- **Index Component**: `index.tsx`
- **Page Component**: `[ComponentName]page.tsx` 
- **Route Path**: `/[route-name]` (ตั้งชื่อตามความเหมาะสม)

### Required Imports Pattern (ปรับ path ตามโฟลเดอร์จริง)
```tsx
// Area Component ต้องมี:
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "[relative-path]/dashboard-common/AdminSidebar";
import DashboardBanner from "[relative-path]/dashboard-common/AdminBanner";

// Index Component ต้องมี:
import DashboardBreadcrumb from '[relative-path]/components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '[relative-path]/layouts/footers/FooterOne'
import HeaderOne from '[relative-path]/layouts/headers/HeaderOne'

// Page Component ต้องมี:
import Wrapper from '[relative-path]/layouts/Wrapper';
import SEO from '[relative-path]/components/SEO';
```

### Standard Features ที่ต้องมี
1. **Loading State**: `const [isLoading, setIsLoading] = useState(false);`
2. **Error Handling**: `const [error, setError] = useState<string | null>(null);`
3. **API URL**: `const apiURL = import.meta.env.VITE_API_URL;`
4. **Toast Notifications**: ใช้ toast.success(), toast.error()
5. **Responsive Design**: ใช้ Bootstrap classes
6. **TypeScript Interfaces**: สร้าง interface สำหรับข้อมูลที่ใช้

## 🔐 การจัดการ Authentication & Authorization (อัปเดต 2025-01-15)
**สำคัญ**: โปรเจคนี้ **ใช้ authentication และ role-based authorization**

### 🎯 **User Roles ที่ถูกต้อง:**
- **role_id = 1**: student (นักเรียนทั่วไป)
- **role_id = 2**: instructor (ผู้สอน)
- **role_id = 3**: manager (ผู้จัดการหลักสูตร)
- **role_id = 4**: admin (ผู้ดูแลระบบ)

### ✅ **วิธีการที่ถูกต้อง:**
**Backend:**
```js
// ✅ ใช้ authentication + role restriction
router.post('/api/subjects/:id/scores', authenticate, restrictTo(2, 3, 4), async (req, res) => {
  // เฉพาะ instructor, manager, admin เท่านั้น
  const userId = req.user.id;
  const userRole = req.user.role_id;
  
  // ตรวจสอบสิทธิ์เพิ่มเติมสำหรับ instructor
  if (userRole === 2) {
    const hasPermission = await checkSubjectInstructorPermission(userId, req.params.id);
    if (!hasPermission) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์แก้ไขวิชานี้' });
    }
  }
  // manager, admin มีสิทธิ์ทุกวิชา
});

// ✅ API ที่ทุกคนเข้าถึงได้
router.get('/api/subjects/public', async (req, res) => {
  // ไม่ต้อง authenticate สำหรับข้อมูลสาธารณะ
});
```

**Frontend:**
```tsx
// ✅ ส่ง token สำหรับ protected routes
const token = localStorage.getItem("token");
const response = await axios.post(`${apiURL}/api/subjects/${id}/scores`, data, {
  headers: { Authorization: `Bearer ${token}` }
});

// ✅ ไม่ส่ง token สำหรับ public routes
const response = await axios.get(`${apiURL}/api/subjects/public`);
```

### 🔒 **Permission Matrix สำหรับ Scoring System:**
| API Function | Student (1) | Instructor (2) | Manager (3) | Admin (4) |
|--------------|-------------|----------------|-------------|-----------|
| ดู Progress ตัวเอง | ✅ | ✅ | ✅ | ✅ |
| ดู Progress นักเรียน | ❌ | ✅ (วิชาที่สอน) | ✅ (หลักสูตรที่จัดการ) | ✅ (ทุกคน) |
| แก้ไข Weight | ❌ | ✅ (วิชาที่สอน) | ✅ (หลักสูตรที่จัดการ) | ✅ (ทุกวิชา) |
| เปิด/ปิด Auto-distribute | ❌ | ✅ (วิชาที่สอน) | ✅ (หลักสูตรที่จัดการ) | ✅ (ทุกวิชา) |
| แก้ไข Passing % | ❌ | ✅ (วิชาที่สอน) | ✅ (หลักสูตรที่จัดการ) | ✅ (ทุกวิชา) |

### 🛡️ **Security Best Practices:**
- ใช้ `authenticate` middleware สำหรับ protected routes
- ใช้ `restrictTo(roles)` สำหรับ role-based access
- เพิ่ม granular permission checking (เช่น instructor ต้องสอนวิชานั้น)
- Log ทุกการเปลี่ยนแปลงใน audit trail
- Validate input ทั้ง client และ server side

## 📊 **Scoring System Project Guidelines (เพิ่ม 2025-01-15)**

### 🎯 **Project Context: Auto-Distribution Scoring System**
งานนี้เป็นการปรับปรุงระบบคะแนนให้เป็น **Auto-Distribution 100%** พร้อมเกณฑ์ผ่านที่ **User กำหนดเอง**

**Core Features:**
- Auto Weight Distribution (คะแนนแบ่งอัตโนมัติ 100%)
- Custom Passing Criteria (เกณฑ์ผ่านตามวิชา แทนที่ 65%)
- Fixed vs Auto Weights (กำหนดคะแนนตายตัวได้บางรายการ)
- Pre/Post Test Logic (แยก logic แบบทดสอบก่อน/หลังเรียน)

### 🔧 **Technical Requirements:**
- **แก้ไขระบบเดิม** (ไม่สร้างใหม่)
- **Backward Compatible** (ระบบเดิมยังใช้ได้)
- **Feature Flag Approach** (`auto_distribute_score` boolean)
- **Dual-Mode Logic** (เก่า/ใหม่ทำงานพร้อมกัน)

### 🚨 **Critical Issues ที่ต้องระวัง:**
1. **Hard-coded 65%** - ต้องแก้ทุกจุดให้ใช้ `subject.passing_percentage`
2. **User Permissions** - ต้องมี `subject_instructors` checking
3. **Migration Strategy** - จัดการข้อมูลเก่าอย่างปลอดภัย
4. **Audit Trail** - Log ทุกการเปลี่ยนแปลงใน `score_change_logs`
5. **Performance** - เพิ่ม database indexes ที่จำเป็น

### 📋 **Implementation Phases:**
**Phase 1 (Critical)**: Security, Migration, Hard-coded fixes
**Phase 2 (Performance)**: Indexing, Error handling, Validation
**Phase 3 (Enhancement)**: Real-time, Mobile UI, Testing

### 🎯 **Success Criteria:**
- ระบบเดิมยังทำงานได้ 100%
- ฟีเจอร์ใหม่ทำงานได้ถูกต้อง
- Performance ไม่ช้าลง
- มี audit trail ครบถ้วน
- Mobile responsive

## Task Status Categories
**✅ เคลียแล้ว** - Task completed, no action needed
**🔄 รอเทส** - Code changes made, waiting for user testing/approval
**❌ ยังไม่ทำ** - Not started, needs to be worked on

## Workflow Process
1. **Read `database.sql` first** to understand database structure (NO migration needed - columns already exist)
2. **Read `status.md` second** to understand current progress
3. **Skip ✅ เคลียแล้ว tasks** - these are completely done
4. **Skip 🔄 รอเทส tasks** - these are waiting for user feedback
5. **Focus IMMEDIATELY on ❌ ยังไม่ทำ tasks and START CODING**
6. **DO NOT create new tasks.md or status.md** - they already exist and are complete
7. **START WITH ACTUAL IMPLEMENTATION** - backend fixes, frontend components, APIs
8. Execute tasks in numerical order (1, 2, 3...)
9. **IMMEDIATELY update `status.md` after completing each task:**
   - If task involves code changes → mark as **🔄 รอเทส**
   - If task is simple/documentation only → mark as **✅ เคลียแล้ว**
10. **Update Progress Overview section** in `status.md` to reflect new counts

## Important Rules
- **ALWAYS reference database.sql for any database-related tasks (columns already exist)**
- **DO NOT create migration scripts or add database columns**
- **DO NOT recreate tasks.md or status.md files - they exist and are complete**
- **START CODING IMMEDIATELY** - focus on backend fixes and frontend components
- **NEVER modify tasks marked as ✅ เคลียแล้ว**
- **NEVER modify tasks marked as 🔄 รอเทส** (wait for user confirmation)
- Only work on **❌ ยังไม่ทำ** status tasks
- **MUST update `status.md` immediately after completing each task - NO EXCEPTIONS**
- **MUST update Progress Overview counts** (เคลียแล้ว/รอเทส/ยังไม่ทำ) after each task completion
- When marking as **🔄 รอเทส**, add brief note about what was changed
- **Work on tasks ONE BY ONE and update status AFTER EACH TASK**

## File Reading Order
1. `database.sql` (understand data structure - ALL columns exist already)
2. `status.md` (check current progress - only 5 tasks left)
3. `tasks.md` (get detailed instructions for remaining tasks)
4. **START CODING IMMEDIATELY** - no more planning needed
5. Update `status.md` after each completed task

## Status Update Process (REQUIRED AFTER EACH TASK)
**ทุกครั้งที่ทำ task เสร็จ ต้องอัปเดท status.md ทันที โดย:**

1. **อัปเดทสถานะ task ที่เสร็จ:**
```
Task X: 🔄 รอเทส - [brief description of changes made]
Task Y: ✅ เคลียแล้ว - [completion note]
```

2. **อัปเดท Progress Overview:**
```
## Progress Overview
- ✅ เคลียแล้ว: [new count] tasks
- 🔄 รอเทส: [new count] tasks  
- ❌ ยังไม่ทำ: [new count] tasks
```

3. **อัปเดท Last Updated:**
```
Last Updated: [current date and time]
```

4. **เพิ่ม Notes หากจำเป็น:**
- อธิบายการเปลี่ยนแปลงสำคัญ
- ไฟล์ที่แก้ไข
- การตั้งค่าที่เปลี่ยน

**Example after completing Task 1:**
```
1. 🔄 รอเทส - แก้ไขชื่อนักเรียนไม่แสดงใน header (updated HeaderComponent.tsx, fixed user context)

## Progress Overview  
- ✅ เคลียแล้ว: 0 tasks
- 🔄 รอเทส: 1 tasks  
- ❌ ยังไม่ทำ: 16 tasks

## Notes
- Task 1: Fixed header display issue in /components/common/HeaderComponent.tsx
```

## User Interaction
- User will manually change **🔄 รอเทส** to **✅ เคลียแล้ว** after testing
- User may provide feedback to move **🔄 รอเทส** back to **❌ ยังไม่ทำ** if issues found
- Always wait for user confirmation before considering **🔄 รอเทส** tasks as fully complete

## Database-Related Task Guidelines
- Always check table relationships in `database.sql` before writing queries
- Reference exact column names from the schema file (ALL scoring columns already exist)
- Consider foreign key relationships when designing features
- **DO NOT create migration scripts** - database is ready
- **DO NOT add new columns** - everything needed is already there
- Focus on using existing columns: passing_percentage, auto_distribute_score, weight_percentage, etc.