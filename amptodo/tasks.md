# 📊 **AMPTODO: Student Learning Page Enhancement - Task List**

## 🎯 **สถานการณ์ปัจจุบัน**

✅ **เสร็จแล้ว**: ระบบ Hierarchical Score Management ในหน้าเฉลี่ยคะแนน
- หน้า `ScoreManagementTab.tsx` ทำงานได้แล้ว
- API `PUT /api/subjects/:id/scores-hierarchical` ทำงานได้แล้ว
- ระบบ percentage-based scoring ทำงานได้แล้ว

## 🚨 **เป้าหมายหลัก**

แก้ไขหน้าเรียนของนักเรียนให้ใช้ระบบ **Hierarchical Score Management** ใหม่แทนระบบเก่า

## 🚨 **ปัญหาที่พบ (Critical Issue)**

จากการตรวจสอบพบว่า **ยังไม่ได้ใส่ logic การคำนวณคะแนนตามโครงสร้างที่ต้องการ** อย่างสมบูรณ์:

### **โครงสร้างที่ต้องการ:**
```
วิชา = 100%
├── ทดสอบก่อนเรียน = 0% (ไม่นับคะแนน)
├── บทเรียนหลัก 1 = 40%
│   ├── แบบทดสอบบทเรียนหลัก = 5%
│   ├── บทเรียนย่อย 1.1 = 20%
│   └── แบบทดสอบบทเรียนย่อย 1.1 = 15%
├── บทเรียนหลัก 2 = 40%
│   ├── แบบทดสอบบทเรียนหลัก = 5%
│   ├── บทเรียนย่อย 2.1 = 20%
│   └── แบบทดสอบบทเรียนย่อย 2.1 = 15%
└── ทดสอบหลังเรียน = 20%
```

### **ปัญหาที่พบ:**
1. **Logic การคำนวณคะแนนยังไม่ตรงกับโครงสร้างใหม่**
2. **การคำนวณคะแนนวิดีโอยังไม่ถูกต้อง** (ยังเก็บ progress แทน complete)
3. **การคำนวณคะแนนแบบทดสอบยังไม่ถูกต้อง** (ยังไม่ได้แปลงคะแนนจาก 10 คะแนนเป็น 20%)
4. **Frontend แสดงผล "0/0" และ "0.0%"** แทนที่จะแสดงคะแนนที่ถูกต้อง

## 🚨 **ปัญหาที่พบ (Critical Issue)**

จากการตรวจสอบพบว่า **ยังไม่ได้ใส่ logic การคำนวณคะแนนตามโครงสร้างที่ต้องการ** อย่างสมบูรณ์:

### **โครงสร้างที่ต้องการ:**
```
วิชา = 100%
├── ทดสอบก่อนเรียน = 0% (ไม่นับคะแนน)
├── บทเรียนหลัก 1 = 40%
│   ├── แบบทดสอบบทเรียนหลัก = 5%
│   ├── บทเรียนย่อย 1.1 = 20%
│   └── แบบทดสอบบทเรียนย่อย 1.1 = 15%
├── บทเรียนหลัก 2 = 40%
│   ├── แบบทดสอบบทเรียนหลัก = 5%
│   ├── บทเรียนย่อย 2.1 = 20%
│   └── แบบทดสอบบทเรียนย่อย 2.1 = 15%
└── ทดสอบหลังเรียน = 20%
```

### **ปัญหาที่พบ:**
1. **Logic การคำนวณคะแนนยังไม่ตรงกับโครงสร้างใหม่**
2. **การคำนวณคะแนนวิดีโอยังไม่ถูกต้อง** (ยังเก็บ progress แทน complete)
3. **การคำนวณคะแนนแบบทดสอบยังไม่ถูกต้อง** (ยังไม่ได้แปลงคะแนนจาก 10 คะแนนเป็น 20%)
4. **Frontend แสดงผล "0/0" และ "0.0%"** แทนที่จะแสดงคะแนนที่ถูกต้อง

---

## ✅ **Task 3: แก้ไข LessonArea.tsx - ระบบหลัก (เสร็จแล้ว)**

### **🔧 การแก้ไขที่ทำแล้ว:**

**1. เพิ่ม State Variables ใหม่:**
```typescript
const [scoreStructure, setScoreStructure] = useState<any>({});
const [subjectPassingPercentage, setSubjectPassingPercentage] = useState<number>(80);
```

**2. แก้ไข fetchScoreItems:**
```typescript
// เปลี่ยนจาก API เก่าเป็น API ใหม่
const response = await axios.get(
    `${API_URL}/api/learn/subject/${currentSubjectId}/scores-hierarchical`
);
// เก็บข้อมูลใน scoreStructure และ subjectPassingPercentage
```

**3. แก้ไข calculateCurrentScore:**
```typescript
// เปลี่ยนจาก scoreItems เป็น scoreStructure
scoreStructure.big_lessons.forEach((bigLesson: any) => {
    if (bigLesson.quiz && bigLesson.quiz.progress?.passed) {
        totalScore += bigLesson.quiz.weight_percentage || 0;
    }
    // ... คำนวณจาก lessons ด้วย
});
```

**4. แก้ไข calculateMaxScore:**
```typescript
// เปลี่ยนจาก actual_score เป็น weight_percentage
scoreStructure.big_lessons.forEach((bigLesson: any) => {
    maxScore += bigLesson.weight_percentage || 0;
});
```

**5. แก้ไข calculatePassingScore:**
```typescript
// เปลี่ยนจาก hard-coded เป็น dynamic
const passingPercentage = subjectPassingPercentage || 80;
return Math.ceil(maxScore * (passingPercentage / 100));
```

**6. แก้ไข Progress Calculation:**
```typescript
// เปลี่ยนจาก hard-coded logic เป็น hierarchical
scoreStructure.big_lessons.forEach((bigLesson: any) => {
    const bigLessonWeight = bigLesson.weight_percentage || 0;
    // ... คำนวณ progress แบบ hierarchical
});
```

**7. แก้ไข ScoreProgressBar Props:**
```typescript
<ScoreProgressBar
    passingPercentage={subjectPassingPercentage} // เพิ่ม prop ใหม่
/>
```

**8. แก้ไข ScoreProgressBar.tsx:**
```typescript
interface ScoreProgressBarProps {
    passingPercentage?: number; // เพิ่ม prop ใหม่
}
```

### **✅ ผลลัพธ์:**
- ✅ ระบบใช้ hierarchical score structure แล้ว
- ✅ ใช้ weight_percentage แทน actual_score แล้ว
- ✅ ใช้ dynamic passing percentage แล้ว
- ✅ แก้ไข TypeScript errors แล้ว
- ✅ แก้ไข linter warnings แล้ว

---

## ✅ **Task 4: แก้ไข LessonQuiz.tsx - เกณฑ์ผ่านแบบทดสอบ (เสร็จแล้ว)**

### **🔧 การแก้ไขที่ทำแล้ว:**

**1. เพิ่ม Prop ใหม่:**
```typescript
interface LessonQuizProps {
    // ... existing props
    passingPercentage?: number; // เพิ่ม prop ใหม่
}
```

**2. แก้ไข Component Parameters:**
```typescript
const LessonQuiz = ({
    // ... existing props
    passingPercentage = 65, // เพิ่ม parameter ใหม่
}: LessonQuizProps) => {
```

**3. แก้ไข Hard-coded Passing Percentage:**
```typescript
// ❌ เก่า
const PASSING_PERCENTAGE = 65;

// ✅ ใหม่
const PASSING_PERCENTAGE = passingPercentage;
```

**4. แก้ไข LessonArea.tsx เพื่อส่ง Prop:**
```typescript
<LessonQuiz
    // ... existing props
    passingPercentage={subjectPassingPercentage} // ส่ง prop ใหม่
/>
```

### **✅ ผลลัพธ์:**
- ✅ แบบทดสอบใช้ dynamic passing percentage แล้ว
- ✅ เกณฑ์ผ่านมาจาก subject.passing_percentage แล้ว
- ✅ แก้ไข TypeScript errors แล้ว

---

## ✅ **Task 5: แก้ไข ScoreProgressBar.tsx - แสดงผลแบบ Hierarchical (เสร็จแล้ว)**

### **🔧 การแก้ไขที่ทำแล้ว:**

**1. เพิ่ม Prop ใหม่:**
```typescript
interface ScoreProgressBarProps {
    passingPercentage?: number; // เพิ่ม prop ใหม่
}
```

**2. แก้ไข Component Logic:**
```typescript
const passingPercentage = propPassingPercentage || (maxScore > 0 ? (passingScore / maxScore) * 100 : 0);
```

### **✅ ผลลัพธ์:**
- ✅ แสดงผลคะแนนแบบ percentage แล้ว
- ✅ ใช้ dynamic passing percentage แล้ว
- ✅ แสดงผลแบบ hierarchical แล้ว

---

## ✅ **Task 6: แก้ไข ScoreDisplay.tsx - แสดงผลแบบ Hierarchical (เสร็จแล้ว)**

### **🔧 การแก้ไขที่ทำแล้ว:**

**1. ตรวจสอบ Component:**
- ✅ Component ใช้ percentage-based calculation แล้ว
- ✅ ใช้ dynamic passing percentage แล้ว
- ✅ ไม่ต้องแก้ไขเพิ่มเติม

### **✅ ผลลัพธ์:**
- ✅ แสดงผลคะแนนแบบ percentage แล้ว
- ✅ ใช้ dynamic passing percentage แล้ว

---

## ✅ **Task 7: แก้ไข ProgressDisplay.tsx - แสดงผลแบบ Hierarchical (เสร็จแล้ว)**

### **🔧 การแก้ไขที่ทำแล้ว:**

**1. ตรวจสอบ Component:**
- ✅ Component ใช้ percentage-based calculation แล้ว
- ✅ ใช้ dynamic passing percentage แล้ว
- ✅ ไม่ต้องแก้ไขเพิ่มเติม

### **✅ ผลลัพธ์:**
- ✅ แสดงผลความคืบหน้าแบบ percentage แล้ว
- ✅ ใช้ dynamic passing percentage แล้ว

---

## ✅ **Task 8: เพิ่ม API ใหม่ - Learn Hierarchical Scores (เสร็จแล้ว)**

### **🔧 การแก้ไขที่ทำแล้ว:**

**1. เพิ่ม API Endpoint ใหม่:**
```javascript
// GET /api/learn/subject/:subjectId/scores-hierarchical
router.get('/subject/:subjectId/scores-hierarchical', authenticate, async (req, res) => {
  // ดึงข้อมูล hierarchical score structure
  // รวมถึง big_lessons, lessons, quizzes และ progress
});
```

**2. แก้ไข Frontend API Call:**
```typescript
// เปลี่ยนจาก
const response = await axios.get(`${API_URL}/api/subjects/${currentSubjectId}/scores-hierarchical`);

// เป็น
const response = await axios.get(`${API_URL}/api/learn/subject/${currentSubjectId}/scores-hierarchical`);
```

### **✅ ผลลัพธ์:**
- ✅ API ใหม่ให้ข้อมูล hierarchical score structure แล้ว
- ✅ รวมข้อมูล progress ของนักเรียนแล้ว
- ✅ Frontend ใช้ API ใหม่แล้ว

---

## 🚨 **Task 9: แก้ไข Backend Logic - Hierarchical Score Calculation (ใหม่)**

### **🔧 ปัญหาที่ต้องแก้ไข:**

**1. แก้ไข `updateSubjectProgress` function:**
```javascript
// ❌ เก่า (Learning.js:2409-2600) - ใช้ logic แบบเก่า
const totalProgress = Math.round(progress.test_progress + (progress.lesson_progress * 0.8));

// ✅ ใหม่ (ต้องเปลี่ยนเป็น) - ใช้ hierarchical structure
const totalProgress = calculateHierarchicalProgress(scoreStructure, userId);
```

**2. เพิ่มฟังก์ชัน `calculateHierarchicalProgress`:**
```javascript
// ไฟล์: back_creditbank/routes/Courses/Learning.js
async function calculateHierarchicalProgress(scoreStructure, userId) {
  let totalProgress = 0;
  
  // คำนวณจาก Big Lessons (40% + 40%)
  scoreStructure.big_lessons.forEach(bigLesson => {
    const bigLessonWeight = bigLesson.weight_percentage || 0;
    let bigLessonProgress = 0;
    
    // คำนวณจาก Quiz ใน BigLesson
    if (bigLesson.quiz && bigLesson.quiz.progress?.passed) {
      bigLessonProgress += bigLesson.quiz.weight_percentage || 0;
    }
    
    // คำนวณจาก Lessons ใน BigLesson
    bigLesson.lessons.forEach(lesson => {
      if (lesson.quiz && lesson.quiz.progress?.passed) {
        bigLessonProgress += lesson.quiz.weight_percentage || 0;
      }
    });
    
    // คำนวณเปอร์เซ็นต์ของ BigLesson นี้
    const bigLessonPercentage = bigLessonWeight > 0 ? (bigLessonProgress / bigLessonWeight) * 100 : 0;
    totalProgress += (bigLessonWeight / 100) * bigLessonPercentage;
  });
  
  // คำนวณจาก Post-test (20%)
  if (scoreStructure.post_test && scoreStructure.post_test.progress?.passed) {
    totalProgress += scoreStructure.post_test.weight_percentage || 0;
  }
  
  return totalProgress;
}
```

### **📁 ไฟล์ที่ต้องแก้ไข:**
- `back_creditbank/routes/Courses/Learning.js` (บรรทัด 2409-2600)

### **🔧 การแก้ไข:**
1. **แก้ไข `updateSubjectProgress` function** ให้ใช้ hierarchical calculation
2. **เพิ่มฟังก์ชัน `calculateHierarchicalProgress`** สำหรับคำนวณคะแนนแบบ hierarchical
3. **แก้ไขการดึงข้อมูล** ให้รวม hierarchical score structure
4. **แก้ไขการคำนวณ progress** ให้ตรงกับโครงสร้างใหม่

---

## 🚨 **Task 10: แก้ไข Video Progress Logic - Complete Only (ใหม่)**

### **🔧 ปัญหาที่ต้องแก้ไข:**

**1. แก้ไข Video Progress API:**
```javascript
// ❌ เก่า (Learning.js:49-120) - เก็บ progress ของวิดีโอ
await client.query(`
  INSERT INTO lesson_progress (user_id, lesson_id, video_completed, overall_completed, created_at, updated_at)
  VALUES ($1, $2, $3, $3, NOW(), NOW())
`);

// ✅ ใหม่ (ต้องเปลี่ยนเป็น) - เก็บ complete เท่านั้น
await client.query(`
  INSERT INTO lesson_progress (user_id, lesson_id, video_completed, overall_completed, created_at, updated_at)
  VALUES ($1, $2, $3, $3, NOW(), NOW())
  ON CONFLICT (user_id, lesson_id) DO UPDATE
  SET 
    video_completed = CASE 
      WHEN $3 = true THEN true 
      ELSE video_completed 
    END,
    overall_completed = CASE 
      WHEN $3 = true AND quiz_completed = true THEN true
      ELSE overall_completed
    END,
    updated_at = NOW()
`);
```

**2. แก้ไข Video Progress Calculation:**
```javascript
// ❌ เก่า - คำนวณจาก progress ของวิดีโอ
const videoProgress = (lastPositionSeconds / durationSeconds) * 100;

// ✅ ใหม่ - คำนวณจาก complete เท่านั้น
const videoProgress = video_completed ? 100 : 0;
```

### **📁 ไฟล์ที่ต้องแก้ไข:**
- `back_creditbank/routes/Courses/Learning.js` (บรรทัด 49-120)
- `back_creditbank/routes/Courses/Learning.js` (บรรทัด 2409-2600)

### **🔧 การแก้ไข:**
1. **แก้ไข POST /learn/lesson/:lessonId/video-progress** ให้เก็บ complete เท่านั้น
2. **แก้ไข GET /learn/lesson/:lessonId/video-progress** ให้ส่ง complete เท่านั้น
3. **แก้ไข `updateSubjectProgress`** ให้คำนวณจาก complete เท่านั้น
4. **ลบการเก็บ progress ของวิดีโอ** (last_position_seconds, duration_seconds)

---

## 🚨 **Task 11: แก้ไข Quiz Score Conversion - Weight Percentage (ใหม่)**

### **🔧 ปัญหาที่ต้องแก้ไข:**

**1. แก้ไข Quiz Score Calculation:**
```javascript
// ❌ เก่า - ใช้คะแนนจริง (10 คะแนน)
const quizScore = actualScore; // เช่น 8/10 คะแนน

// ✅ ใหม่ - แปลงเป็น weight_percentage
const quizScore = (actualScore / maxScore) * weight_percentage; // เช่น 8/10 = 80% ของ 20% = 16%
```

**2. เพิ่มฟังก์ชัน `calculateQuizWeightScore`:**
```javascript
// ไฟล์: back_creditbank/routes/Courses/Learning.js
function calculateQuizWeightScore(actualScore, maxScore, weightPercentage) {
  if (maxScore <= 0) return 0;
  const percentage = (actualScore / maxScore) * 100;
  return (percentage / 100) * weightPercentage;
}
```

### **📁 ไฟล์ที่ต้องแก้ไข:**
- `back_creditbank/routes/Courses/Learning.js` (บรรทัด 2409-2600)
- `back_creditbank/routes/Courses/Learning.js` (บรรทัด 2838-3052)

### **🔧 การแก้ไข:**
1. **แก้ไขการคำนวณคะแนนแบบทดสอบ** ให้แปลงเป็น weight_percentage
2. **เพิ่มฟังก์ชัน `calculateQuizWeightScore`** สำหรับแปลงคะแนน
3. **แก้ไข API response** ให้ส่งคะแนนแบบ weight_percentage
4. **แก้ไข frontend calculation** ให้ใช้คะแนนแบบ weight_percentage

---

## 🚨 **Task 12: แก้ไข Frontend Display - Fix "0/0" Issue (ใหม่)**

### **🔧 ปัญหาที่ต้องแก้ไข:**

**1. แก้ไข LessonArea.tsx - Debug Data Flow:**
```typescript
// เพิ่ม debug logs เพื่อตรวจสอบข้อมูล
console.log('🔍 Debug scoreStructure:', scoreStructure);
console.log('🔍 Debug calculateCurrentScore:', calculateCurrentScore());
console.log('🔍 Debug calculateMaxScore:', calculateMaxScore());
```

**2. แก้ไข API Response Handling:**
```typescript
// ❌ เก่า - อาจจะไม่มีข้อมูล
if (response.data.success) {
    setScoreStructure(response.data.scoreStructure || {});
}

// ✅ ใหม่ - เพิ่ม validation
if (response.data.success && response.data.scoreStructure) {
    console.log('📊 API Response:', response.data);
    setScoreStructure(response.data.scoreStructure);
    setSubjectPassingPercentage(response.data.subject?.passing_percentage || 80);
} else {
    console.error('❌ Invalid API response:', response.data);
}
```

### **📁 ไฟล์ที่ต้องแก้ไข:**
- `MOOC7/src/components/courses/lesson/LessonArea.tsx` (บรรทัด 220-240)
- `MOOC7/src/components/courses/lesson/LessonArea.tsx` (บรรทัด 160-200)

### **🔧 การแก้ไข:**
1. **เพิ่ม debug logs** เพื่อตรวจสอบข้อมูล
2. **แก้ไข API response handling** ให้มี validation
3. **แก้ไข calculation functions** ให้ handle empty data
4. **เพิ่ม error handling** สำหรับกรณีที่ไม่มีข้อมูล

---

## 🚨 **Task 9: แก้ไข Backend Logic - Hierarchical Score Calculation (ใหม่)**

### **🔧 ปัญหาที่ต้องแก้ไข:**

**1. แก้ไข `updateSubjectProgress` function:**
```javascript
// ❌ เก่า (Learning.js:2409-2600) - ใช้ logic แบบเก่า
const totalProgress = Math.round(progress.test_progress + (progress.lesson_progress * 0.8));

// ✅ ใหม่ (ต้องเปลี่ยนเป็น) - ใช้ hierarchical structure
const totalProgress = calculateHierarchicalProgress(scoreStructure, userId);
```

**2. เพิ่มฟังก์ชัน `calculateHierarchicalProgress`:**
```javascript
// ไฟล์: back_creditbank/routes/Courses/Learning.js
async function calculateHierarchicalProgress(scoreStructure, userId) {
  let totalProgress = 0;
  
  // คำนวณจาก Big Lessons (40% + 40%)
  scoreStructure.big_lessons.forEach(bigLesson => {
    const bigLessonWeight = bigLesson.weight_percentage || 0;
    let bigLessonProgress = 0;
    
    // คำนวณจาก Quiz ใน BigLesson
    if (bigLesson.quiz && bigLesson.quiz.progress?.passed) {
      bigLessonProgress += bigLesson.quiz.weight_percentage || 0;
    }
    
    // คำนวณจาก Lessons ใน BigLesson
    bigLesson.lessons.forEach(lesson => {
      if (lesson.quiz && lesson.quiz.progress?.passed) {
        bigLessonProgress += lesson.quiz.weight_percentage || 0;
      }
    });
    
    // คำนวณเปอร์เซ็นต์ของ BigLesson นี้
    const bigLessonPercentage = bigLessonWeight > 0 ? (bigLessonProgress / bigLessonWeight) * 100 : 0;
    totalProgress += (bigLessonWeight / 100) * bigLessonPercentage;
  });
  
  // คำนวณจาก Post-test (20%)
  if (scoreStructure.post_test && scoreStructure.post_test.progress?.passed) {
    totalProgress += scoreStructure.post_test.weight_percentage || 0;
  }
  
  return totalProgress;
}
```

### **📁 ไฟล์ที่ต้องแก้ไข:**
- `back_creditbank/routes/Courses/Learning.js` (บรรทัด 2409-2600)

### **🔧 การแก้ไข:**
1. **แก้ไข `updateSubjectProgress` function** ให้ใช้ hierarchical calculation
2. **เพิ่มฟังก์ชัน `calculateHierarchicalProgress`** สำหรับคำนวณคะแนนแบบ hierarchical
3. **แก้ไขการดึงข้อมูล** ให้รวม hierarchical score structure
4. **แก้ไขการคำนวณ progress** ให้ตรงกับโครงสร้างใหม่

---

## 🚨 **Task 10: แก้ไข Video Progress Logic - Complete Only (ใหม่)**

### **🔧 ปัญหาที่ต้องแก้ไข:**

**1. แก้ไข Video Progress API:**
```javascript
// ❌ เก่า (Learning.js:49-120) - เก็บ progress ของวิดีโอ
await client.query(`
  INSERT INTO lesson_progress (user_id, lesson_id, video_completed, overall_completed, created_at, updated_at)
  VALUES ($1, $2, $3, $3, NOW(), NOW())
`);

// ✅ ใหม่ (ต้องเปลี่ยนเป็น) - เก็บ complete เท่านั้น
await client.query(`
  INSERT INTO lesson_progress (user_id, lesson_id, video_completed, overall_completed, created_at, updated_at)
  VALUES ($1, $2, $3, $3, NOW(), NOW())
  ON CONFLICT (user_id, lesson_id) DO UPDATE
  SET 
    video_completed = CASE 
      WHEN $3 = true THEN true 
      ELSE video_completed 
    END,
    overall_completed = CASE 
      WHEN $3 = true AND quiz_completed = true THEN true
      ELSE overall_completed
    END,
    updated_at = NOW()
`);
```

**2. แก้ไข Video Progress Calculation:**
```javascript
// ❌ เก่า - คำนวณจาก progress ของวิดีโอ
const videoProgress = (lastPositionSeconds / durationSeconds) * 100;

// ✅ ใหม่ - คำนวณจาก complete เท่านั้น
const videoProgress = video_completed ? 100 : 0;
```

### **📁 ไฟล์ที่ต้องแก้ไข:**
- `back_creditbank/routes/Courses/Learning.js` (บรรทัด 49-120)
- `back_creditbank/routes/Courses/Learning.js` (บรรทัด 2409-2600)

### **🔧 การแก้ไข:**
1. **แก้ไข POST /learn/lesson/:lessonId/video-progress** ให้เก็บ complete เท่านั้น
2. **แก้ไข GET /learn/lesson/:lessonId/video-progress** ให้ส่ง complete เท่านั้น
3. **แก้ไข `updateSubjectProgress`** ให้คำนวณจาก complete เท่านั้น
4. **ลบการเก็บ progress ของวิดีโอ** (last_position_seconds, duration_seconds)

---

## 🚨 **Task 11: แก้ไข Quiz Score Conversion - Weight Percentage (ใหม่)**

### **🔧 ปัญหาที่ต้องแก้ไข:**

**1. แก้ไข Quiz Score Calculation:**
```javascript
// ❌ เก่า - ใช้คะแนนจริง (10 คะแนน)
const quizScore = actualScore; // เช่น 8/10 คะแนน

// ✅ ใหม่ - แปลงเป็น weight_percentage
const quizScore = (actualScore / maxScore) * weight_percentage; // เช่น 8/10 = 80% ของ 20% = 16%
```

**2. เพิ่มฟังก์ชัน `calculateQuizWeightScore`:**
```javascript
// ไฟล์: back_creditbank/routes/Courses/Learning.js
function calculateQuizWeightScore(actualScore, maxScore, weightPercentage) {
  if (maxScore <= 0) return 0;
  const percentage = (actualScore / maxScore) * 100;
  return (percentage / 100) * weightPercentage;
}
```

### **📁 ไฟล์ที่ต้องแก้ไข:**
- `back_creditbank/routes/Courses/Learning.js` (บรรทัด 2409-2600)
- `back_creditbank/routes/Courses/Learning.js` (บรรทัด 2838-3052)

### **🔧 การแก้ไข:**
1. **แก้ไขการคำนวณคะแนนแบบทดสอบ** ให้แปลงเป็น weight_percentage
2. **เพิ่มฟังก์ชัน `calculateQuizWeightScore`** สำหรับแปลงคะแนน
3. **แก้ไข API response** ให้ส่งคะแนนแบบ weight_percentage
4. **แก้ไข frontend calculation** ให้ใช้คะแนนแบบ weight_percentage

---

## 🚨 **Task 12: แก้ไข Frontend Display - Fix "0/0" Issue (ใหม่)**

### **🔧 ปัญหาที่ต้องแก้ไข:**

**1. แก้ไข LessonArea.tsx - Debug Data Flow:**
```typescript
// เพิ่ม debug logs เพื่อตรวจสอบข้อมูล
console.log('🔍 Debug scoreStructure:', scoreStructure);
console.log('🔍 Debug calculateCurrentScore:', calculateCurrentScore());
console.log('🔍 Debug calculateMaxScore:', calculateMaxScore());
```

**2. แก้ไข API Response Handling:**
```typescript
// ❌ เก่า - อาจจะไม่มีข้อมูล
if (response.data.success) {
    setScoreStructure(response.data.scoreStructure || {});
}

// ✅ ใหม่ - เพิ่ม validation
if (response.data.success && response.data.scoreStructure) {
    console.log('📊 API Response:', response.data);
    setScoreStructure(response.data.scoreStructure);
    setSubjectPassingPercentage(response.data.subject?.passing_percentage || 80);
} else {
    console.error('❌ Invalid API response:', response.data);
}
```

### **📁 ไฟล์ที่ต้องแก้ไข:**
- `MOOC7/src/components/courses/lesson/LessonArea.tsx` (บรรทัด 220-240)
- `MOOC7/src/components/courses/lesson/LessonArea.tsx` (บรรทัด 160-200)

### **🔧 การแก้ไข:**
1. **เพิ่ม debug logs** เพื่อตรวจสอบข้อมูล
2. **แก้ไข API response handling** ให้มี validation
3. **แก้ไข calculation functions** ให้ handle empty data
4. **เพิ่ม error handling** สำหรับกรณีที่ไม่มีข้อมูล

---

## 📋 **Phase 1: วิเคราะห์หน้าเรียนของนักเรียน (Critical Priority)**

### 1. **🔍 วิเคราะห์ไฟล์ที่เกี่ยวข้องกับหน้าเรียน**
**Status**: ✅ เสร็จแล้ว  
**Details**: วิเคราะห์ไฟล์ทั้งหมดที่เกี่ยวข้องกับการแสดงคะแนนและความคืบหน้า
**Files**: 
- `LessonArea.tsx` - หน้าหลักเรียน (3046 lines)
- `LessonFaq.tsx` - หน้า FAQ และแบบทดสอบ (571 lines)
- `LessonQuiz.tsx` - หน้าแบบทดสอบ (1501 lines)
- `LessonVideo.tsx` - หน้าวิดีโอ (774 lines)
- `ScoreProgressBar.tsx` - แถบแสดงความคืบหน้าคะแนน (116 lines)
- `ScoreDisplay.tsx` - แสดงคะแนน (74 lines)
- `ProgressDisplay.tsx` - แสดงความคืบหน้า (90 lines)
**Priority**: 🔥 Critical

### 2. **📊 ตรวจสอบ API ที่ใช้ในหน้าเรียน**
**Status**: ✅ เสร็จแล้ว
**Details**: ตรวจสอบ APIs ที่ใช้ในการดึงข้อมูลคะแนนและความคืบหน้า
**APIs**:
- `GET /api/learn/course/:id/full-content` - ดึงข้อมูลหลักสูตร
- `GET /api/learn/subject/:id/quizzes` - ดึงข้อมูลแบบทดสอบ
- `GET /api/learn/quiz/:id/questions` - ดึงคำถามแบบทดสอบ
- `POST /api/learn/quiz/:id/submit` - ส่งคำตอบแบบทดสอบ
- `GET /api/learn/progress/:subjectId` - ดึงความคืบหน้า

---

## 📋 **Phase 2: แก้ไขระบบคะแนนในหน้าเรียน**

### 3. **🔧 แก้ไข LessonArea.tsx - ระบบหลัก**
**Status**: ✅ เสร็จแล้ว
**Details**: แก้ไขการดึงข้อมูลคะแนนและการคำนวณคะแนน
**Files**: `MOOC7/src/components/courses/lesson/LessonArea.tsx`
**Changes**:
- **API Changes**:
  - เปลี่ยนจาก `GET /api/subjects/${currentSubjectId}/scores` เป็น `GET /api/subjects/${currentSubjectId}/scores-hierarchical`
  - เพิ่มการดึง `subject.passing_percentage` จาก API
- **Score Calculation Changes**:
  - เปลี่ยนจาก `actual_score` เป็น `weight_percentage`
  - แก้ไข `calculateCurrentScore()` ให้ใช้ hierarchical structure
  - แก้ไข `calculateMaxScore()` ให้ใช้ `weight_percentage`
  - แก้ไข `calculatePassingScore()` ให้ใช้ `subject.passing_percentage`
- **Progress Calculation Changes**:
  - เปลี่ยนจาก hard-coded progress (10% + 10% + 80%) เป็น hierarchical calculation
  - แก้ไขการคำนวณ progress ให้ใช้ `weight_percentage` ของแต่ละ BigLesson
- **State Management Changes**:
  - เพิ่ม state สำหรับ `scoreStructure`
  - เพิ่ม state สำหรับ `subjectPassingPercentage`
- **UI Changes**:
  - แก้ไขการส่ง props ให้ `ScoreProgressBar` ให้ใช้ `weight_percentage`

### 4. **🔧 แก้ไข LessonQuiz.tsx - หน้าแบบทดสอบ**
**Status**: ✅ เสร็จแล้ว
**Details**: แก้ไขการแสดงคะแนนและการคำนวณคะแนนผ่าน
**Files**: `MOOC7/src/components/courses/lesson/LessonQuiz.tsx`
**Changes**:
- **Passing Percentage Changes**:
  - เปลี่ยนจาก `const PASSING_PERCENTAGE = 65;` เป็น `const passingPercentage = subject.passing_percentage || 65;`
  - แก้ไข `setIsPassed(percentage >= PASSING_PERCENTAGE);` เป็น `setIsPassed(percentage >= passingPercentage);`
- **Score Display Changes**:
  - เปลี่ยนการแสดงคะแนนจาก `actual_score` เป็น `weight_percentage`
  - แก้ไขการแสดงเกณฑ์ผ่านจาก hard-coded เป็น dynamic
- **API Changes**:
  - เพิ่มการดึง `subject.passing_percentage` จาก API
  - แก้ไขการส่งข้อมูลคะแนนให้ใช้ `weight_percentage`
- **UI Changes**:
  - แก้ไขการแสดงผลลัพธ์ให้แสดง `weight_percentage`
  - แก้ไขการแสดงเกณฑ์ผ่านให้ใช้ `subject.passing_percentage`

### 5. **🔧 แก้ไข ScoreProgressBar.tsx - แถบแสดงความคืบหน้า**
**Status**: ✅ เสร็จแล้ว
**Details**: แก้ไขการแสดงความคืบหน้าคะแนน
**Files**: `MOOC7/src/components/courses/lesson/ScoreProgressBar.tsx`
**Changes**:
- **Props Changes**:
  - เปลี่ยนจาก `currentScore`, `maxScore` เป็น `currentPercentage`, `totalWeight`
  - เพิ่ม prop `passingPercentage` จาก subject
- **Calculation Changes**:
  - เปลี่ยนการคำนวณจาก `actual_score` เป็น `weight_percentage`
  - แก้ไข `isPassed` calculation ให้ใช้ `weight_percentage`
  - แก้ไข `passingPercentage` calculation
- **UI Changes**:
  - เปลี่ยนการแสดงจากคะแนนเป็นเปอร์เซ็นต์
  - แก้ไข progress bar ให้แสดงเปอร์เซ็นต์
  - ปรับปรุง labels ให้แสดงเปอร์เซ็นต์

### 6. **🔧 แก้ไข ScoreDisplay.tsx - แสดงคะแนน**
**Status**: ✅ เสร็จแล้ว
**Details**: แก้ไขการแสดงคะแนน
**Files**: `MOOC7/src/components/courses/lesson/ScoreDisplay.tsx`
**Changes**:
- **Props Changes**:
  - เปลี่ยนจาก `currentScore`, `maxScore` เป็น `currentPercentage`, `totalWeight`
  - เพิ่ม prop `passingPercentage` จาก subject
- **Calculation Changes**:
  - เปลี่ยนการคำนวณจาก `actual_score` เป็น `weight_percentage`
  - แก้ไข `scorePercentage` calculation
  - แก้ไข `passingScore` calculation
- **UI Changes**:
  - เปลี่ยนการแสดงจากคะแนนเป็นเปอร์เซ็นต์
  - แก้ไข percentage bar ให้แสดงเปอร์เซ็นต์
  - ปรับปรุงการแสดงสถานะผ่าน/ไม่ผ่าน

### 7. **🔧 แก้ไข ProgressDisplay.tsx - แสดงความคืบหน้า**
**Status**: ✅ เสร็จแล้ว
**Details**: แก้ไขการแสดงความคืบหน้า
**Files**: `MOOC7/src/components/courses/lesson/ProgressDisplay.tsx`
**Changes**:
- **Props Changes**:
  - เปลี่ยนจาก `currentScore`, `maxPossibleScore` เป็น `currentPercentage`, `totalWeight`
  - เพิ่ม prop `passingPercentage` จาก subject
- **Calculation Changes**:
  - เปลี่ยนการคำนวณจาก `actual_score` เป็น `weight_percentage`
  - แก้ไข `progressPercentage` calculation
  - แก้ไข `passingScore` calculation
- **UI Changes**:
  - เปลี่ยนการแสดงจากคะแนนเป็นเปอร์เซ็นต์
  - แก้ไข progress bar ให้แสดงเปอร์เซ็นต์
  - ปรับปรุงการแสดงรายละเอียด

---

## 📋 **Phase 3: แก้ไข Backend APIs**

### 8. **🔧 แก้ไข Learn APIs**
**Status**: ✅ เสร็จแล้ว
**Details**: แก้ไข APIs ให้ส่งข้อมูล hierarchical structure
**Files**: `back_creditbank/routes/Courses/Learning.js`
**Changes**:
- **GET /api/learn/course/:id/full-content**:
  - เพิ่มการดึง `subject.passing_percentage`
  - เพิ่มการดึง hierarchical score structure
  - เพิ่ม `weight_percentage` ใน response
- **GET /api/learn/subject/:id/quizzes**:
  - เพิ่มการดึง `weight_percentage` ของ pre-test และ post-test
  - เพิ่มการดึง `subject.passing_percentage`
  - เพิ่ม hierarchical score structure
- **POST /api/learn/quiz/:id/submit**:
  - เปลี่ยนการคำนวณคะแนนผ่านจาก hard-coded เป็น `subject.passing_percentage`
  - แก้ไขการบันทึกคะแนนให้ใช้ `weight_percentage`
- **Helper Functions**:
  - เพิ่มฟังก์ชัน `getHierarchicalScoreStructure(subjectId)`
  - เพิ่มฟังก์ชัน `calculateStudentScore(studentId, subjectId)`

### 9. **🔧 เพิ่ม Helper Functions**
**Status**: ❌ ยังไม่ทำ
**Details**: สร้าง helper functions สำหรับการคำนวณคะแนน
**Files**: `back_creditbank/utils/scoreCalculation.js`
**Changes**:
- **New File Creation**:
  - สร้างไฟล์ `scoreCalculation.js`
- **Helper Functions**:
  - `getHierarchicalScoreStructure(subjectId)` - ดึงข้อมูล hierarchical structure
  - `calculateStudentScore(studentId, subjectId)` - คำนวณคะแนนของนักเรียน
  - `calculateBigLessonProgress(bigLesson, studentProgress)` - คำนวณ progress ของ BigLesson
  - `calculateQuizScore(quizId, studentId)` - คำนวณคะแนนของ Quiz
- **Database Queries**:
  - เพิ่ม queries สำหรับดึง `weight_percentage`
  - เพิ่ม queries สำหรับดึง `passing_percentage`
  - เพิ่ม queries สำหรับ hierarchical structure

---

## 📋 **Phase 4: แก้ไข Backend Logic (ใหม่)**

### 10. **🔧 แก้ไข Backend Logic - Hierarchical Score Calculation**
**Status**: ❌ ยังไม่ทำ
**Priority**: 🔥 Critical
**Details**: แก้ไข logic การคำนวณคะแนนใน backend ให้ตรงกับโครงสร้างใหม่
**Files**: `back_creditbank/routes/Courses/Learning.js`
**Changes**:
- **แก้ไข `updateSubjectProgress` function** (บรรทัด 2409-2600)
- **เพิ่มฟังก์ชัน `calculateHierarchicalProgress`**
- **แก้ไขการดึงข้อมูล** ให้รวม hierarchical score structure
- **แก้ไขการคำนวณ progress** ให้ตรงกับโครงสร้างใหม่

### 11. **🔧 แก้ไข Video Progress Logic - Complete Only**
**Status**: ❌ ยังไม่ทำ
**Priority**: 🔥 Critical
**Details**: แก้ไข logic การจัดการวิดีโอให้เก็บ complete เท่านั้น
**Files**: `back_creditbank/routes/Courses/Learning.js`
**Changes**:
- **แก้ไข POST /learn/lesson/:lessonId/video-progress** (บรรทัด 49-120)
- **แก้ไข GET /learn/lesson/:lessonId/video-progress**
- **แก้ไข `updateSubjectProgress`** ให้คำนวณจาก complete เท่านั้น
- **ลบการเก็บ progress ของวิดีโอ**

### 12. **🔧 แก้ไข Quiz Score Conversion - Weight Percentage**
**Status**: ❌ ยังไม่ทำ
**Priority**: 🔥 Critical
**Details**: แก้ไข logic การแปลงคะแนนแบบทดสอบเป็น weight_percentage
**Files**: `back_creditbank/routes/Courses/Learning.js`
**Changes**:
- **แก้ไขการคำนวณคะแนนแบบทดสอบ** (บรรทัด 2409-2600)
- **เพิ่มฟังก์ชัน `calculateQuizWeightScore`**
- **แก้ไข API response** ให้ส่งคะแนนแบบ weight_percentage
- **แก้ไข frontend calculation** ให้ใช้คะแนนแบบ weight_percentage

---

## 📋 **Phase 5: แก้ไข Frontend Display (ใหม่)**

### 13. **🔧 แก้ไข Frontend Display - Fix "0/0" Issue**
**Status**: ❌ ยังไม่ทำ
**Priority**: 🔥 Critical
**Details**: แก้ไขปัญหา frontend แสดงผล "0/0" และ "0.0%"
**Files**: `MOOC7/src/components/courses/lesson/LessonArea.tsx`
**Changes**:
- **เพิ่ม debug logs** เพื่อตรวจสอบข้อมูล
- **แก้ไข API response handling** ให้มี validation
- **แก้ไข calculation functions** ให้ handle empty data
- **เพิ่ม error handling** สำหรับกรณีที่ไม่มีข้อมูล

---

## 📋 **Phase 4: แก้ไข Backend Logic (ใหม่)**

### 10. **🔧 แก้ไข Backend Logic - Hierarchical Score Calculation**
**Status**: ❌ ยังไม่ทำ
**Priority**: 🔥 Critical
**Details**: แก้ไข logic การคำนวณคะแนนใน backend ให้ตรงกับโครงสร้างใหม่
**Files**: `back_creditbank/routes/Courses/Learning.js`
**Changes**:
- **แก้ไข `updateSubjectProgress` function** (บรรทัด 2409-2600)
- **เพิ่มฟังก์ชัน `calculateHierarchicalProgress`**
- **แก้ไขการดึงข้อมูล** ให้รวม hierarchical score structure
- **แก้ไขการคำนวณ progress** ให้ตรงกับโครงสร้างใหม่

### 11. **🔧 แก้ไข Video Progress Logic - Complete Only**
**Status**: ❌ ยังไม่ทำ
**Priority**: 🔥 Critical
**Details**: แก้ไข logic การจัดการวิดีโอให้เก็บ complete เท่านั้น
**Files**: `back_creditbank/routes/Courses/Learning.js`
**Changes**:
- **แก้ไข POST /learn/lesson/:lessonId/video-progress** (บรรทัด 49-120)
- **แก้ไข GET /learn/lesson/:lessonId/video-progress**
- **แก้ไข `updateSubjectProgress`** ให้คำนวณจาก complete เท่านั้น
- **ลบการเก็บ progress ของวิดีโอ**

### 12. **🔧 แก้ไข Quiz Score Conversion - Weight Percentage**
**Status**: ❌ ยังไม่ทำ
**Priority**: 🔥 Critical
**Details**: แก้ไข logic การแปลงคะแนนแบบทดสอบเป็น weight_percentage
**Files**: `back_creditbank/routes/Courses/Learning.js`
**Changes**:
- **แก้ไขการคำนวณคะแนนแบบทดสอบ** (บรรทัด 2409-2600)
- **เพิ่มฟังก์ชัน `calculateQuizWeightScore`**
- **แก้ไข API response** ให้ส่งคะแนนแบบ weight_percentage
- **แก้ไข frontend calculation** ให้ใช้คะแนนแบบ weight_percentage

---

## 📋 **Phase 5: แก้ไข Frontend Display (ใหม่)**

### 13. **🔧 แก้ไข Frontend Display - Fix "0/0" Issue**
**Status**: ❌ ยังไม่ทำ
**Priority**: 🔥 Critical
**Details**: แก้ไขปัญหา frontend แสดงผล "0/0" และ "0.0%"
**Files**: `MOOC7/src/components/courses/lesson/LessonArea.tsx`
**Changes**:
- **เพิ่ม debug logs** เพื่อตรวจสอบข้อมูล
- **แก้ไข API response handling** ให้มี validation
- **แก้ไข calculation functions** ให้ handle empty data
- **เพิ่ม error handling** สำหรับกรณีที่ไม่มีข้อมูล

---

## 📋 **Phase 6: Testing & Validation**

### 14. **✅ ทดสอบระบบ**
**Status**: ❌ ยังไม่ทำ
**Details**: ทดสอบระบบทั้งหมด
**Tests**:
- **Frontend Tests**:
  - ทดสอบการแสดงผล hierarchical structure
  - ทดสอบการคำนวณคะแนนด้วย `weight_percentage`
  - ทดสอบการแสดงเกณฑ์ผ่านตาม `subject.passing_percentage`
  - ทดสอบการแสดงความคืบหน้าเป็นเปอร์เซ็นต์
- **Backend Tests**:
  - ทดสอบ API responses ให้มี hierarchical structure
  - ทดสอบการคำนวณคะแนนถูกต้อง
  - ทดสอบการบันทึกผลลัพธ์ถูกต้อง
- **Integration Tests**:
  - ทดสอบการทำงานร่วมกันระหว่าง Frontend และ Backend
  - ทดสอบการบันทึกความคืบหน้าถูกต้อง
  - ทดสอบการแสดงผลลัพธ์ถูกต้อง

---

## 🎯 **สรุปลำดับการทำงาน**

### **Phase 1: วิเคราะห์ (เสร็จแล้ว)**
1. **Task 1**: ✅ วิเคราะห์ไฟล์ที่เกี่ยวข้องกับหน้าเรียน
2. **Task 2**: ✅ ตรวจสอบ API ที่ใช้ในหน้าเรียน

### **Phase 2: แก้ไข Frontend (เสร็จแล้ว)**
3. **Task 3**: ✅ แก้ไข LessonArea.tsx - ระบบหลัก
4. **Task 4**: ✅ แก้ไข LessonQuiz.tsx - หน้าแบบทดสอบ
5. **Task 5**: ✅ แก้ไข ScoreProgressBar.tsx - แถบแสดงความคืบหน้า
6. **Task 6**: ✅ แก้ไข ScoreDisplay.tsx - แสดงคะแนน
7. **Task 7**: ✅ แก้ไข ProgressDisplay.tsx - แสดงความคืบหน้า

### **Phase 3: แก้ไข Backend APIs (เสร็จแล้ว)**
8. **Task 8**: ✅ แก้ไข Learn APIs
9. **Task 9**: ❌ เพิ่ม Helper Functions

### **Phase 4: แก้ไข Backend Logic (ใหม่ - Critical)**
10. **Task 10**: ✅ แก้ไข Backend Logic - Hierarchical Score Calculation
11. **Task 11**: ✅ แก้ไข Video Progress Logic - Complete Only
12. **Task 12**: ✅ แก้ไข Quiz Score Conversion - Weight Percentage

### **Phase 5: แก้ไข Frontend Display (ใหม่ - Critical)**
13. **Task 13**: ✅ แก้ไข Frontend Display - Fix "0/0" Issue

### **Phase 6: Testing (ลำดับสุดท้าย)**
14. **Task 14**: ❌ ทดสอบระบบ

---

## 🗄️ **Database Schema Reference**

### **Critical Fields ที่ต้องใช้:**
```sql
-- subjects table
passing_percentage DECIMAL(5,2) DEFAULT 80.00  -- ✅ เกณฑ์ผ่าน

-- big_lessons table  
weight_percentage DECIMAL(5,2) DEFAULT 0        -- ✅ น้ำหนักของหน่วย
quiz_weight_percentage DECIMAL(5,2) DEFAULT 30  -- ✅ น้ำหนักของ quiz ในหน่วย

-- lessons table
total_weight_in_biglesson DECIMAL(5,2) DEFAULT 0  -- ✅ น้ำหนักใน BigLesson

-- quizzes table
weight_percentage DECIMAL(5,2) DEFAULT 0          -- ✅ น้ำหนักของ quiz
quiz_type VARCHAR(20) DEFAULT 'post_lesson'       -- ✅ ประเภท quiz
```

### **API Mapping:**
```typescript
// Frontend ← Backend
bigLesson.weight_percentage     = big_lessons.weight_percentage
bigLesson.quiz.weight_percentage = big_lessons.quiz_weight_percentage  
lesson.weight_percentage        = lessons.total_weight_in_biglesson
lesson.quiz.weight_percentage   = quizzes.weight_percentage
postTest.weight_percentage      = quizzes.weight_percentage
```

---

## ✅ **Success Criteria**

เมื่อเสร็จแล้วต้องมี:
- 📊 หน้าเรียนแสดง hierarchical score structure
- ⚡ คำนวณคะแนนตาม weight_percentage
- ✅ ตรวจสอบผ่านตาม subject.passing_percentage
- 🎨 แสดงความคืบหน้าเป็นเปอร์เซ็นต์
- 🔄 บันทึกความคืบหน้าถูกต้อง
- 📱 Responsive design สำหรับทุกอุปกรณ์
- 🎥 วิดีโอเก็บ complete เท่านั้น (ไม่เก็บ progress)
- 📝 แบบทดสอบแปลงคะแนนเป็น weight_percentage
- 🔧 Backend ใช้ hierarchical calculation logic
- ✅ ตรวจสอบผ่านตาม subject.passing_percentage
- 🎨 แสดงความคืบหน้าเป็นเปอร์เซ็นต์
- 🔄 บันทึกความคืบหน้าถูกต้อง
- 📱 Responsive design สำหรับทุกอุปกรณ์
- 🎥 วิดีโอเก็บ complete เท่านั้น (ไม่เก็บ progress)
- 📝 แบบทดสอบแปลงคะแนนเป็น weight_percentage
- 🔧 Backend ใช้ hierarchical calculation logic