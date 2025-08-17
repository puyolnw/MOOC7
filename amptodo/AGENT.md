# Task Management Workflow Agent
# Haha i love this pj
## Project Context
This project manages documentation/code tasks using a multi-file system:
- `tasks.md` (MD1): Contains task requirements and detailed instructions
- `status.md` (MD2): Tracks completion status of all tasks (1-30 items)
- `database.sql`: Database schema file containing table structures (headers only, no data)

## Database Reference
**IMPORTANT**: Always read `database.sql` file first to understand the database structure before working on any database-related tasks. This file contains table definitions, column names, and relationships but NO actual data.

Common database tasks may include:
- Writing queries based on table structure
- Creating documentation about database schema  
- Generating API endpoints based on table columns
- Creating forms or UI components that match database fields

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

## 🚨 การจัดการ Authentication (ไม่ต้องใช้)
**สำคัญ**: ตั้งแต่วันที่ 2025-08-06 เป็นต้นไป **ไม่ต้องใช้ authentication** ในการสร้าง API endpoints และ frontend ใหม่

### ❌ สิ่งที่ไม่ต้องทำอีกต่อไป:
- ไม่ต้องใส่ `authenticate` middleware ใน backend routes
- ไม่ต้องใส่ `restrictTo(role_id)` middleware 
- ไม่ต้องส่ง `Authorization: Bearer ${token}` header ใน frontend
- ไม่ต้อง `localStorage.getItem('token')` 
- ไม่ต้องตรวจสอบ user role หรือ permissions

### ✅ วิธีการใหม่:
**Backend:**
```js
// ✅ ถูกต้อง - เปิดให้ทุกคนใช้
router.get('/api/example', async (req, res) => {
});

// ❌ ผิด - ไม่ต้องใช้แล้ว
router.get('/api/example', authenticate, restrictTo(1), async (req, res) => {
  const userId = req.user.id;
  // ... logic
});
```

**Frontend:**
```tsx
// ✅ ถูกต้อง - ไม่ต้องส่ง token
const response = await axios.get(`${apiURL}/api/example`);

// ❌ ผิด - ไม่ต้องส่ง Authorization header แล้ว
const token = localStorage.getItem("token");
const response = await axios.get(`${apiURL}/api/example`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Task Status Categories
**✅ เคลียแล้ว** - Task completed, no action needed
**🔄 รอเทส** - Code changes made, waiting for user testing/approval
**❌ ยังไม่ทำ** - Not started, needs to be worked on

## Workflow Process
1. **Read `database.sql` first** to understand database structure
2. **Read `status.md` second** to understand current progress
3. **Skip ✅ เคลียแล้ว tasks** - these are completely done
4. **Skip 🔄 รอเทส tasks** - these are waiting for user feedback
5. **Focus only on ❌ ยังไม่ทำ tasks**
6. Reference `tasks.md` for detailed instructions on pending tasks
7. Execute tasks in numerical order (1, 2, 3...)
8. **IMMEDIATELY update `status.md` after completing each task:**
   - If task involves code changes → mark as **🔄 รอเทส**
   - If task is simple/documentation only → mark as **✅ เคลียแล้ว**
9. **Update Progress Overview section** in `status.md` to reflect new counts
10. **Continue to next task** and repeat the process

## Important Rules
- **ALWAYS reference database.sql for any database-related tasks**
- **NEVER modify tasks marked as ✅ เคลียแล้ว**
- **NEVER modify tasks marked as 🔄 รอเทส** (wait for user confirmation)
- Only work on **❌ ยังไม่ทำ** status tasks
- **MUST update `status.md` immediately after completing each task - NO EXCEPTIONS**
- **MUST update Progress Overview counts** (เคลียแล้ว/รอเทส/ยังไม่ทำ) after each task completion
- When marking as **🔄 รอเทส**, add brief note about what was changed
- **Work on tasks ONE BY ONE and update status AFTER EACH TASK**

## File Reading Order
1. `database.sql` (understand data structure)
2. `status.md` (check current progress)
3. `tasks.md` (get detailed instructions)
4. Execute work
5. Update `status.md`

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
- Reference exact column names from the schema file
- Consider foreign key relationships when designing features
- Ask user about data types or constraints if unclear from schema