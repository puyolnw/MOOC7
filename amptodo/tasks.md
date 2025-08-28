# 🚨 การวิเคราะห์และแก้ไขปัญหาระบบ Learning Management

## 📋 สรุปปัญหาที่พบในระบบ

### 🔍 ปัญหาหลักที่พบ

1. **Frontend API Calls ผิดพลาด**
   - การเรียก API ไม่ตรงกับ backend endpoints
   - ไม่มีการจัดการ error states อย่างเหมาะสม
   - การส่งข้อมูลไม่ตรงกับ schema ที่ backend ต้องการ

2. **Database Schema Issues**
   - ตาราง `big_lessons` และ `special_quiz` ไม่สอดคล้องกับ frontend
   - Foreign key constraints ผิดพลาด
   - Indexes ไม่เหมาะสมสำหรับ performance

3. **API Endpoints ไม่ครบถ้วน**
   - ขาด API สำหรับ hierarchical score structure
   - ขาด API สำหรับ special quiz management
   - ขาด API สำหรับ big lessons progress

## 🛠️ งานที่ต้องแก้ไข

### ✅ Phase 1: แก้ไข Database Schema (เสร็จสิ้น)
- ✅ เพิ่มคอลัมน์ที่จำเป็นทั้งหมด
- ✅ เพิ่ม Foreign Key Constraints
- ✅ เพิ่ม Indexes สำหรับ Performance
- ✅ อัปเดตข้อมูลที่มีอยู่
- ✅ เพิ่ม Comments และ Documentation
- ✅ สร้าง Views สำหรับความสะดวก

### ✅ Phase 2: แก้ไข Backend API (เสร็จสิ้น)
- ✅ เพิ่ม API endpoint `/api/subjects/:subjectId/scores-hierarchical` ใน `ScoreManagement.js`
- ✅ เพิ่ม API endpoints สำหรับ Special Quiz ใน `SpecialQuiz.js`:
  - ✅ `POST /:quizId/attempt` - เริ่ม Special Quiz attempt
  - ✅ `POST /attempt/:attemptId/answer` - ส่งคำตอบทีละข้อพร้อมไฟล์
  - ✅ `POST /attempt/:attemptId/submit` - ส่ง Special Quiz

### 🔄 Phase 3: แก้ไข Frontend Components (กำลังดำเนินการ)
- ✅ เพิ่มฟังก์ชัน `fetchScoreItems` และ `calculateCurrentScore` ใน `LessonArea.tsx`
- ✅ เพิ่ม state และฟังก์ชันสำหรับ Special Quiz ใน `LessonQuiz.tsx`:
  - ✅ `currentAttemptId`, `submittedAnswers` state
  - ✅ `startSpecialQuizAttempt`, `submitSingleAnswer`, `submitSpecialQuiz` functions
  - ✅ แก้ไข `handleNext` เพื่อรองรับ Special Quiz
  - ✅ เพิ่ม `renderSpecialQuizUI` function

#### 1.1 ตรวจสอบและแก้ไขตาราง `big_lessons`
```sql
-- ตรวจสอบโครงสร้างปัจจุบัน
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'big_lessons';

-- เพิ่มคอลัมน์ที่ขาดหายไป (ถ้ามี)
ALTER TABLE big_lessons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE big_lessons ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;

-- เพิ่ม index สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_big_lessons_subject_id ON big_lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_big_lessons_order ON big_lessons(subject_id, order_number);
```

#### 1.2 ตรวจสอบและแก้ไขตาราง `lessons`
```sql
-- ตรวจสอบโครงสร้างปัจจุบัน
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'lessons';

-- เพิ่มคอลัมน์ที่ขาดหายไป (ถ้ามี)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_in_biglesson INTEGER DEFAULT 0;

-- เพิ่ม index
CREATE INDEX IF NOT EXISTS idx_lessons_big_lesson_id ON lessons(big_lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON lessons(subject_id);
```

#### 1.3 ตรวจสอบและแก้ไขตาราง `quizzes`
```sql
-- ตรวจสอบโครงสร้างปัจจุบัน
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'quizzes';

-- เพิ่มคอลัมน์ที่ขาดหายไป (ถ้ามี)
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS big_lesson_id INTEGER;

-- เพิ่ม foreign key constraint
ALTER TABLE quizzes 
ADD CONSTRAINT fk_quizzes_big_lesson_id 
FOREIGN KEY (big_lesson_id) REFERENCES big_lessons(big_lesson_id) ON DELETE SET NULL;

-- เพิ่ม index
CREATE INDEX IF NOT EXISTS idx_quizzes_big_lesson_id ON quizzes(big_lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_type ON quizzes(type);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject_id ON quizzes(subject_id);
```

#### 1.4 ตรวจสอบและแก้ไขตาราง `quiz_progress`
```sql
-- ตรวจสอบโครงสร้างปัจจุบัน
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'quiz_progress';

-- เพิ่มคอลัมน์ที่ขาดหายไป (ถ้ามี)
ALTER TABLE quiz_progress ADD COLUMN IF NOT EXISTS weight_earned DECIMAL(5,2) DEFAULT 0;
ALTER TABLE quiz_progress ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;

-- เพิ่ม index
CREATE INDEX IF NOT EXISTS idx_quiz_progress_awaiting_review ON quiz_progress(awaiting_review);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_user_quiz ON quiz_progress(user_id, quiz_id);
```

### Phase 2: แก้ไข Backend API

#### 2.1 สร้าง API สำหรับ Hierarchical Score Structure
```javascript
// routes/Courses/ScoreManagement.js
router.get("/subject/:subjectId/scores-hierarchical", authenticate, async (req, res) => {
  const { subjectId } = req.params;
  const userId = req.user.id;
  
  try {
    // ดึงข้อมูล big lessons และ progress
    const bigLessonsResult = await client.query(`
      SELECT 
        bl.big_lesson_id,
        bl.title,
        bl.weight_percentage,
        bl.order_number,
        bl.quiz_weight_percentage,
        bl.lessons_total_weight,
        q.quiz_id,
        q.title as quiz_title,
        q.weight_percentage as quiz_weight,
        qp.completed as quiz_completed,
        qp.passed as quiz_passed,
        qp.awaiting_review as quiz_awaiting_review,
        qp.score as quiz_score,
        qp.passing_score as quiz_max_score
      FROM big_lessons bl
      LEFT JOIN quizzes q ON bl.quiz_id = q.quiz_id
      LEFT JOIN quiz_progress qp ON q.quiz_id = qp.quiz_id AND qp.user_id = $1
      WHERE bl.subject_id = $2
      ORDER BY bl.order_number, q.quiz_id
    `, [userId, subjectId]);

    // ดึงข้อมูล lessons และ progress
    const lessonsResult = await client.query(`
      SELECT 
        l.lesson_id,
        l.title,
        l.big_lesson_id,
        l.total_weight_in_biglesson,
        l.order_number,
        l.video_weight_percentage,
        l.quiz_weight_percentage,
        lp.video_completed,
        lp.quiz_completed,
        lp.overall_completed,
        q.quiz_id as lesson_quiz_id,
        qp.completed as lesson_quiz_completed,
        qp.passed as lesson_quiz_passed,
        qp.awaiting_review as lesson_quiz_awaiting_review,
        qp.score as lesson_quiz_score,
        qp.passing_score as lesson_quiz_max_score
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.lesson_id = lp.lesson_id AND lp.user_id = $1
      LEFT JOIN quizzes q ON l.quiz_id = q.quiz_id
      LEFT JOIN quiz_progress qp ON q.quiz_id = qp.quiz_id AND qp.user_id = $1
      WHERE l.big_lesson_id IN (
        SELECT big_lesson_id FROM big_lessons WHERE subject_id = $2
      )
      ORDER BY l.big_lesson_id, l.order_number
    `, [userId, subjectId]);

    // จัดกลุ่มข้อมูล
    const scoreStructure = {
      big_lessons: [],
      post_test: null
    };

    // จัดกลุ่ม big lessons
    const bigLessonsMap = new Map();
    for (const row of bigLessonsResult.rows) {
      if (!bigLessonsMap.has(row.big_lesson_id)) {
        bigLessonsMap.set(row.big_lesson_id, {
          id: row.big_lesson_id,
          title: row.title,
          weight_percentage: parseFloat(row.weight_percentage || 0),
          order_number: row.order_number,
          quiz_weight_percentage: parseFloat(row.quiz_weight_percentage || 0),
          lessons_total_weight: parseFloat(row.lessons_total_weight || 0),
          quiz: null,
          lessons: []
        });
      }

      if (row.quiz_id) {
        bigLessonsMap.get(row.big_lesson_id).quiz = {
          quiz_id: row.quiz_id,
          title: row.quiz_title,
          weight_percentage: parseFloat(row.quiz_weight || 0),
          progress: {
            completed: row.quiz_completed || false,
            passed: row.quiz_passed || false,
            awaiting_review: row.quiz_awaiting_review || false,
            score: row.quiz_score,
            max_score: row.quiz_max_score
          }
        };
      }
    }

    // จัดกลุ่ม lessons
    for (const row of lessonsResult.rows) {
      const bigLesson = bigLessonsMap.get(row.big_lesson_id);
      if (bigLesson) {
        bigLesson.lessons.push({
          id: row.lesson_id,
          title: row.title,
          total_weight_in_biglesson: parseFloat(row.total_weight_in_biglesson || 0),
          order_number: row.order_number,
          video_weight_percentage: parseFloat(row.video_weight_percentage || 0),
          quiz_weight_percentage: parseFloat(row.quiz_weight_percentage || 0),
          video_completed: row.video_completed || false,
          quiz: row.lesson_quiz_id ? {
            quiz_id: row.lesson_quiz_id,
            progress: {
              completed: row.lesson_quiz_completed || false,
              passed: row.lesson_quiz_passed || false,
              awaiting_review: row.lesson_quiz_awaiting_review || false,
              score: row.lesson_quiz_score,
              max_score: row.lesson_quiz_max_score
            }
          } : null
        });
      }
    }

    scoreStructure.big_lessons = Array.from(bigLessonsMap.values())
      .sort((a, b) => a.order_number - b.order_number);

    // ดึงข้อมูล post-test
    const postTestResult = await client.query(`
      SELECT 
        q.quiz_id,
        q.title,
        q.weight_percentage,
        qp.completed,
        qp.passed,
        qp.awaiting_review,
        qp.score,
        qp.passing_score
      FROM quizzes q
      LEFT JOIN quiz_progress qp ON q.quiz_id = qp.quiz_id AND qp.user_id = $1
      WHERE q.subject_id = $2 AND q.quiz_type = 'post_lesson' AND q.type = 'post_test'
    `, [userId, subjectId]);

    if (postTestResult.rows.length > 0) {
      const postTest = postTestResult.rows[0];
      scoreStructure.post_test = {
        quiz_id: postTest.quiz_id,
        title: postTest.title,
        weight_percentage: parseFloat(postTest.weight_percentage || 0),
        progress: {
          completed: postTest.completed || false,
          passed: postTest.passed || false,
          awaiting_review: postTest.awaiting_review || false,
          score: postTest.score,
          max_score: postTest.passing_score
        }
      };
    }

    // ดึงข้อมูล subject
    const subjectResult = await client.query(`
      SELECT passing_percentage, auto_distribute_score
      FROM subjects WHERE subject_id = $1
    `, [subjectId]);

    res.json({
      success: true,
      scoreStructure,
      subject: {
        passing_percentage: subjectResult.rows[0]?.passing_percentage || 80,
        auto_distribute_score: subjectResult.rows[0]?.auto_distribute_score || false
      }
    });

  } catch (error) {
    console.error("Error fetching hierarchical scores:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

#### 2.2 แก้ไข API สำหรับ Special Quiz
```javascript
// routes/Courses/SpecialQuiz.js
router.post("/:quizId/attempt", authenticate, async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.id;
  
  try {
    // ตรวจสอบว่าเป็น special quiz
    const quizResult = await client.query(
      "SELECT quiz_id, type FROM quizzes WHERE quiz_id = $1",
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบแบบทดสอบ"
      });
    }

    if (quizResult.rows[0].type !== 'special_fill_in_blank') {
      return res.status(400).json({
        success: false,
        message: "ไม่ใช่แบบทดสอบอัตนัย"
      });
    }

    // สร้าง attempt ใหม่
    const attemptResult = await client.query(`
      INSERT INTO quiz_attempts (user_id, quiz_id, start_time, status)
      VALUES ($1, $2, NOW(), 'in_progress')
      RETURNING attempt_id
    `, [userId, quizId]);

    res.json({
      success: true,
      attempt: {
        attempt_id: attemptResult.rows[0].attempt_id
      }
    });

  } catch (error) {
    console.error("Error creating attempt:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post("/attempt/:attemptId/answer", authenticate, upload.array('files', 5), async (req, res) => {
  const { attemptId } = req.params;
  const { question_id, text_answer } = req.body;
  const userId = req.user.id;
  
  try {
    // ตรวจสอบว่าเป็น attempt ของผู้ใช้
    const attemptResult = await client.query(
      "SELECT quiz_id FROM quiz_attempts WHERE attempt_id = $1 AND user_id = $2",
      [attemptId, userId]
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ attempt"
      });
    }

    // บันทึกคำตอบ
    const answerResult = await client.query(`
      INSERT INTO quiz_attempt_answers (attempt_id, question_id, text_answer, has_attachments)
      VALUES ($1, $2, $3, $4)
      RETURNING answer_id
    `, [attemptId, question_id, text_answer, req.files && req.files.length > 0]);

    // บันทึกไฟล์แนบ (ถ้ามี)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await client.query(`
          INSERT INTO quiz_attachments (
            quiz_id, user_id, answer_id, file_name, file_path, file_url, 
            file_type, file_size, file_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          attemptResult.rows[0].quiz_id,
          userId,
          answerResult.rows[0].answer_id,
          file.originalname,
          file.path,
          `/uploads/quiz_attachments/${file.filename}`,
          file.mimetype,
          file.size,
          file.filename
        ]);
      }
    }

    res.json({
      success: true,
      message: "บันทึกคำตอบสำเร็จ"
    });

  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post("/attempt/:attemptId/submit", authenticate, async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user.id;
  
  try {
    // อัปเดตสถานะเป็น awaiting_review
    await client.query(`
      UPDATE quiz_attempts 
      SET status = 'awaiting_review', end_time = NOW()
      WHERE attempt_id = $1 AND user_id = $2
    `, [attemptId, userId]);

    // อัปเดต quiz_progress
    const attemptResult = await client.query(
      "SELECT quiz_id FROM quiz_attempts WHERE attempt_id = $1",
      [attemptId]
    );

    await client.query(`
      INSERT INTO quiz_progress (user_id, quiz_id, completed, awaiting_review)
      VALUES ($1, $2, true, true)
      ON CONFLICT (user_id, quiz_id) DO UPDATE
      SET completed = true, awaiting_review = true, updated_at = NOW()
    `, [userId, attemptResult.rows[0].quiz_id]);

    res.json({
      success: true,
      message: "ส่งแบบทดสอบสำเร็จ"
    });

  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

### Phase 3: แก้ไข Frontend Components

#### 3.1 แก้ไข LessonArea.tsx
```typescript
// แก้ไขการเรียก API สำหรับ hierarchical scores
const fetchScoreItems = useCallback(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token || !currentSubjectId) {
      return;
    }

    const response = await axios.get(
      `${API_URL}/api/learn/subject/${currentSubjectId}/scores-hierarchical`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success && response.data.scoreStructure) {
      setScoreStructure(response.data.scoreStructure);
      setSubjectPassingPercentage(Number(response.data.subject?.passing_percentage) || 80);
      setAutoDistributeScore(response.data.subject?.auto_distribute_score || false);
    }
  } catch (error: any) {
    console.error('❌ Error fetching hierarchical score items:', error);
  }
}, [currentSubjectId]);

// แก้ไขการคำนวณคะแนน
const calculateCurrentScore = useCallback((): number => {
  if (!scoreStructure || !scoreStructure.big_lessons) {
    return 0;
  }
  
  let totalScore = 0;
  
  // คำนวณคะแนนจาก Big Lessons
  scoreStructure.big_lessons.forEach((bigLesson: any) => {
    // คำนวณคะแนนจาก Quiz ใน BigLesson
    if (bigLesson.quiz && bigLesson.quiz.progress?.passed) {
      totalScore += parseFloat(bigLesson.quiz.weight_percentage) || 0;
    }
    
    // คำนวณคะแนนจาก Lessons ใน BigLesson
    if (bigLesson.lessons) {
      bigLesson.lessons.forEach((lesson: any) => {
        // คำนวณคะแนนจาก Video completion (Lesson)
        if (lesson.video_completed === true) {
          const videoWeight = (parseFloat(lesson.total_weight_in_biglesson) || 0) * 
                             (parseFloat(lesson.video_weight_percentage) || 0) / 100;
          totalScore += videoWeight;
        }
        
        // คำนวณคะแนนจาก Lesson Quiz
        if (lesson.quiz && lesson.quiz.progress?.passed) {
          const quizWeight = (parseFloat(lesson.total_weight_in_biglesson) || 0) * 
                            (parseFloat(lesson.quiz_weight_percentage) || 0) / 100;
          totalScore += quizWeight;
        }
      });
    }
  });
  
  // คำนวณคะแนนจาก Post-test
  if (scoreStructure.post_test && scoreStructure.post_test.progress?.passed) {
    totalScore += parseFloat(scoreStructure.post_test.weight_percentage) || 0;
  }

  return Math.round(totalScore * 100) / 100;
}, [scoreStructure]);
```

#### 3.2 แก้ไข LessonQuiz.tsx สำหรับ Special Quiz
```typescript
// เพิ่มการจัดการ special quiz
const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);
const [submittedAnswers, setSubmittedAnswers] = useState<Set<number>>(new Set());

// ตรวจสอบว่าเป็น special quiz
const isSpecialQuiz = quizData?.type === 'special_fill_in_blank';

// ฟังก์ชันเริ่ม attempt
const startSpecialQuizAttempt = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/api/special-quiz/${quizId}/attempt`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );
    
    if (response.data.success) {
      setCurrentAttemptId(response.data.attempt.attempt_id);
    }
  } catch (error) {
    console.error("Error starting attempt:", error);
  }
};

// ฟังก์ชันส่งคำตอบแบบรายข้อ
const submitSingleAnswer = async (questionId: number, textAnswer: string, files?: File[]) => {
  if (!currentAttemptId) {
    await startSpecialQuizAttempt();
    return;
  }

  try {
    const formData = new FormData();
    formData.append('question_id', questionId.toString());
    formData.append('text_answer', textAnswer);
    
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    await axios.post(
      `${API_URL}/api/special-quiz/attempt/${currentAttemptId}/answer`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    setSubmittedAnswers(prev => new Set([...prev, questionId]));
    
  } catch (error) {
    console.error("Error submitting answer:", error);
  }
};

// ฟังก์ชันส่งแบบทดสอบทั้งหมด
const submitSpecialQuiz = async () => {
  if (!currentAttemptId) return;

  try {
    await axios.post(
      `${API_URL}/api/special-quiz/attempt/${currentAttemptId}/submit`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );

    setIsAwaitingReview(true);
    safeOnComplete();
    
  } catch (error) {
    console.error("Error submitting quiz:", error);
  }
};
```

### Phase 4: แก้ไข Database Migrations

#### 4.1 สร้าง Migration Script
```sql
-- migration_001_add_hierarchical_support.sql

-- เพิ่มคอลัมน์สำหรับ big lessons
ALTER TABLE big_lessons 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;

-- เพิ่มคอลัมน์สำหรับ lessons
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS order_in_biglesson INTEGER DEFAULT 0;

-- เพิ่มคอลัมน์สำหรับ quizzes
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS big_lesson_id INTEGER;

-- เพิ่ม foreign key constraint
ALTER TABLE quizzes 
ADD CONSTRAINT fk_quizzes_big_lesson_id 
FOREIGN KEY (big_lesson_id) REFERENCES big_lessons(big_lesson_id) ON DELETE SET NULL;

-- เพิ่มคอลัมน์สำหรับ quiz_progress
ALTER TABLE quiz_progress 
ADD COLUMN IF NOT EXISTS weight_earned DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;

-- เพิ่ม indexes สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_big_lessons_subject_id ON big_lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_big_lessons_order ON big_lessons(subject_id, order_number);
CREATE INDEX IF NOT EXISTS idx_lessons_big_lesson_id ON lessons(big_lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_big_lesson_id ON quizzes(big_lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_type ON quizzes(type);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject_id ON quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_awaiting_review ON quiz_progress(awaiting_review);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_user_quiz ON quiz_progress(user_id, quiz_id);

-- อัปเดตข้อมูลที่มีอยู่
UPDATE big_lessons SET weight_percentage = 100 WHERE weight_percentage = 0;
UPDATE lessons SET total_weight_in_biglesson = 50 WHERE total_weight_in_biglesson = 0;
UPDATE quizzes SET weight_percentage = 50 WHERE weight_percentage = 0;
```

### Phase 5: ทดสอบระบบ

#### 5.1 ทดสอบ Database Schema
```sql
-- ทดสอบการสร้าง big lesson
INSERT INTO big_lessons (subject_id, title, weight_percentage, order_number) 
VALUES (1, 'บทที่ 1: แนะนำระบบ', 30, 1);

-- ทดสอบการสร้าง lesson ใน big lesson
INSERT INTO lessons (big_lesson_id, title, total_weight_in_biglesson, order_number) 
VALUES (1, '1.1 รู้จักระบบ', 15, 1);

-- ทดสอบการสร้าง quiz ใน big lesson
INSERT INTO quizzes (big_lesson_id, title, type, weight_percentage, is_big_lesson_quiz) 
VALUES (1, 'แบบทดสอบท้ายบทใหญ่', 'special_fill_in_blank', 15, true);
```

#### 5.2 ทดสอบ API Endpoints
```bash
# ทดสอบ hierarchical scores API
curl -X GET "http://localhost:3000/api/learn/subject/1/scores-hierarchical" \
  -H "Authorization: Bearer YOUR_TOKEN"

# ทดสอบ special quiz attempt
curl -X POST "http://localhost:3000/api/special-quiz/1/attempt" \
  -H "Authorization: Bearer YOUR_TOKEN"

# ทดสอบส่งคำตอบ
curl -X POST "http://localhost:3000/api/special-quiz/attempt/1/answer" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "question_id=1" \
  -F "text_answer=คำตอบของฉัน"
```

## 🎯 ผลลัพธ์ที่คาดหวัง

หลังจากการแก้ไข ระบบจะสามารถ:

1. **จัดการ Big Lessons ได้อย่างถูกต้อง**
   - สร้างและจัดการ big lessons
   - จัดลำดับ lessons ใน big lesson
   - คำนวณคะแนนแบบ hierarchical

2. **จัดการ Special Quiz ได้อย่างถูกต้อง**
   - สร้างแบบทดสอบอัตนัย
   - ส่งคำตอบแบบรายข้อ
   - อัปโหลดไฟล์แนบ
   - แสดงสถานะ "รอตรวจ"

3. **แสดง Progress ได้อย่างถูกต้อง**
   - แสดงคะแนนแบบ hierarchical
   - แสดงความคืบหน้าของแต่ละ big lesson
   - แสดงสถานะของแต่ละ lesson และ quiz

4. **จัดการ Database ได้อย่างมีประสิทธิภาพ**
   - Foreign key constraints ถูกต้อง
   - Indexes เหมาะสมสำหรับ performance
   - Data integrity ดี

## 📅 Timeline การทำงาน

- ✅ **Week 1**: แก้ไข Database Schema และ Migrations (เสร็จสิ้น)
- ✅ **Week 2**: แก้ไข Backend API (เสร็จสิ้น)
- 🔄 **Week 3**: แก้ไข Frontend Components (กำลังดำเนินการ)
- ⏳ **Week 4**: ทดสอบและปรับปรุงระบบ (รอดำเนินการ)

## 🎯 สรุปความคืบหน้า

### ✅ งานที่เสร็จสิ้นแล้ว:
1. **Database Schema** - เพิ่มคอลัมน์, constraints, indexes, views ทั้งหมด
2. **Backend API** - เพิ่ม hierarchical score API และ Special Quiz APIs
3. **Frontend Components** - เพิ่มฟังก์ชันหลักสำหรับ Special Quiz และ hierarchical scores

### 🔄 งานที่กำลังดำเนินการ:
1. **Frontend Testing** - ทดสอบการทำงานของ Special Quiz
2. **UI/UX Improvements** - ปรับปรุง interface สำหรับ Special Quiz

### ⏳ งานที่เหลือ:
1. **System Testing** - ทดสอบระบบทั้งหมด
2. **Documentation** - อัปเดตเอกสารการใช้งาน
3. **Performance Optimization** - ปรับปรุงประสิทธิภาพ

## 🗄️ คำสั่ง SQL ที่จำเป็นทั้งหมด (เรียงลำดับไม่ให้เกิด Error)

### Step 1: เพิ่มคอลัมน์ที่ขาดหายไป

```sql
-- 1. เพิ่มคอลัมน์ใน big_lessons
ALTER TABLE big_lessons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE big_lessons ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;

-- 2. เพิ่มคอลัมน์ใน lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_in_biglesson INTEGER DEFAULT 0;

-- 3. เพิ่มคอลัมน์ใน quizzes
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS big_lesson_id INTEGER;

-- 4. เพิ่มคอลัมน์ใน quiz_progress
ALTER TABLE quiz_progress ADD COLUMN IF NOT EXISTS weight_earned DECIMAL(5,2) DEFAULT 0;
ALTER TABLE quiz_progress ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;

-- 5. เพิ่มคอลัมน์ใน lesson_progress (ถ้าขาด)
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS quiz_awaiting_review BOOLEAN DEFAULT FALSE;
```

### Step 2: เพิ่ม Foreign Key Constraints

```sql
-- 1. เพิ่ม foreign key สำหรับ quizzes -> big_lessons
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_quizzes_big_lesson_id'
    ) THEN
        ALTER TABLE quizzes 
        ADD CONSTRAINT fk_quizzes_big_lesson_id 
        FOREIGN KEY (big_lesson_id) REFERENCES big_lessons(big_lesson_id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. เพิ่ม foreign key สำหรับ lessons -> big_lessons (ถ้ายังไม่มี)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_lessons_big_lesson_id'
    ) THEN
        ALTER TABLE lessons 
        ADD CONSTRAINT fk_lessons_big_lesson_id 
        FOREIGN KEY (big_lesson_id) REFERENCES big_lessons(big_lesson_id) ON DELETE SET NULL;
    END IF;
END $$;
```

### Step 3: เพิ่ม Indexes สำหรับ Performance

```sql
-- 1. Indexes สำหรับ big_lessons
CREATE INDEX IF NOT EXISTS idx_big_lessons_subject_id ON big_lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_big_lessons_order ON big_lessons(subject_id, order_number);
CREATE INDEX IF NOT EXISTS idx_big_lessons_active ON big_lessons(is_active) WHERE is_active = TRUE;

-- 2. Indexes สำหรับ lessons
CREATE INDEX IF NOT EXISTS idx_lessons_big_lesson_id ON lessons(big_lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(big_lesson_id, order_number);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status) WHERE status = 'active';

-- 3. Indexes สำหรับ quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_big_lesson_id ON quizzes(big_lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_type ON quizzes(type);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject_id ON quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_quiz_type ON quizzes(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status) WHERE status = 'active';

-- 4. Indexes สำหรับ quiz_progress
CREATE INDEX IF NOT EXISTS idx_quiz_progress_awaiting_review ON quiz_progress(awaiting_review) WHERE awaiting_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_quiz_progress_user_quiz ON quiz_progress(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_completed ON quiz_progress(completed) WHERE completed = TRUE;
CREATE INDEX IF NOT EXISTS idx_quiz_progress_passed ON quiz_progress(passed) WHERE passed = TRUE;

-- 5. Indexes สำหรับ lesson_progress
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_video_completed ON lesson_progress(video_completed) WHERE video_completed = TRUE;
CREATE INDEX IF NOT EXISTS idx_lesson_progress_quiz_completed ON lesson_progress(quiz_completed) WHERE quiz_completed = TRUE;
CREATE INDEX IF NOT EXISTS idx_lesson_progress_overall_completed ON lesson_progress(overall_completed) WHERE overall_completed = TRUE;
CREATE INDEX IF NOT EXISTS idx_lesson_progress_quiz_awaiting_review ON lesson_progress(quiz_awaiting_review) WHERE quiz_awaiting_review = TRUE;

-- 6. Indexes สำหรับ quiz_attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_awaiting_review ON quiz_attempts(status) WHERE status = 'awaiting_review';

-- 7. Indexes สำหรับ quiz_attempt_answers
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt ON quiz_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_question ON quiz_attempt_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_has_attachments ON quiz_attempt_answers(has_attachments) WHERE has_attachments = TRUE;

-- 8. Indexes สำหรับ quiz_attachments
CREATE INDEX IF NOT EXISTS idx_quiz_attachments_answer ON quiz_attachments(answer_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attachments_quiz_user ON quiz_attachments(quiz_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attachments_file_type ON quiz_attachments(file_type);
```

### Step 4: อัปเดตข้อมูลที่มีอยู่

```sql
-- 1. อัปเดต big_lessons ที่ไม่มี weight_percentage
UPDATE big_lessons 
SET weight_percentage = 100 
WHERE weight_percentage = 0 OR weight_percentage IS NULL;

-- 2. อัปเดต lessons ที่ไม่มี total_weight_in_biglesson
UPDATE lessons 
SET total_weight_in_biglesson = 50 
WHERE total_weight_in_biglesson = 0 OR total_weight_in_biglesson IS NULL;

-- 3. อัปเดต quizzes ที่ไม่มี weight_percentage
UPDATE quizzes 
SET weight_percentage = 50 
WHERE weight_percentage = 0 OR weight_percentage IS NULL;

-- 4. อัปเดต subjects ที่ไม่มี passing_percentage
UPDATE subjects 
SET passing_percentage = 80 
WHERE passing_percentage = 0 OR passing_percentage IS NULL;

-- 5. อัปเดต subjects ที่ไม่มี auto_distribute_score
UPDATE subjects 
SET auto_distribute_score = FALSE 
WHERE auto_distribute_score IS NULL;
```

### Step 5: เพิ่ม Constraints และ Validations

```sql
-- 1. เพิ่ม check constraint สำหรับ weight_percentage ใน big_lessons
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_big_lesson_weight_percentage_range'
    ) THEN
        ALTER TABLE big_lessons 
        ADD CONSTRAINT check_big_lesson_weight_percentage_range 
        CHECK (weight_percentage >= 0 AND weight_percentage <= 100);
    END IF;
END $$;

-- 2. เพิ่ม check constraint สำหรับ total_weight_in_biglesson ใน lessons
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_lesson_total_weight_range'
    ) THEN
        ALTER TABLE lessons 
        ADD CONSTRAINT check_lesson_total_weight_range 
        CHECK (total_weight_in_biglesson >= 0 AND total_weight_in_biglesson <= 100);
    END IF;
END $$;

-- 3. เพิ่ม check constraint สำหรับ weight_earned ใน quiz_progress
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_quiz_progress_weight_earned_range'
    ) THEN
        ALTER TABLE quiz_progress 
        ADD CONSTRAINT check_quiz_progress_weight_earned_range 
        CHECK (weight_earned >= 0 AND weight_earned <= 100);
    END IF;
END $$;
```

### Step 6: เพิ่ม Comments และ Documentation

```sql
-- 1. เพิ่ม comments สำหรับคอลัมน์ใหม่
COMMENT ON COLUMN big_lessons.is_active IS 'สถานะการใช้งานของ big lesson';
COMMENT ON COLUMN big_lessons.is_big_lesson_quiz IS 'ระบุว่าเป็น quiz ของ big lesson หรือไม่';

COMMENT ON COLUMN lessons.order_in_biglesson IS 'ลำดับของ lesson ใน big lesson';

COMMENT ON COLUMN quizzes.is_big_lesson_quiz IS 'ระบุว่าเป็น quiz ของ big lesson หรือไม่';
COMMENT ON COLUMN quizzes.big_lesson_id IS 'อ้างอิงไปยัง big lesson';

COMMENT ON COLUMN quiz_progress.weight_earned IS 'คะแนนที่ได้จาก quiz (0-100)';
COMMENT ON COLUMN quiz_progress.is_big_lesson_quiz IS 'ระบุว่าเป็น quiz ของ big lesson หรือไม่';
```

### Step 7: ตรวจสอบและ Cleanup

```sql
-- 1. ตรวจสอบ foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('big_lessons', 'lessons', 'quizzes', 'quiz_progress');

-- 2. ตรวจสอบ indexes ที่สร้าง
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('big_lessons', 'lessons', 'quizzes', 'quiz_progress', 'lesson_progress', 'quiz_attempts', 'quiz_attempt_answers', 'quiz_attachments')
ORDER BY tablename, indexname;

-- 3. ตรวจสอบข้อมูลที่อัปเดต
SELECT 'big_lessons' as table_name, COUNT(*) as total_rows, 
       COUNT(CASE WHEN weight_percentage > 0 THEN 1 END) as with_weight
FROM big_lessons
UNION ALL
SELECT 'lessons' as table_name, COUNT(*) as total_rows,
       COUNT(CASE WHEN total_weight_in_biglesson > 0 THEN 1 END) as with_weight
FROM lessons
UNION ALL
SELECT 'quizzes' as table_name, COUNT(*) as total_rows,
       COUNT(CASE WHEN weight_percentage > 0 THEN 1 END) as with_weight
FROM quizzes
UNION ALL
SELECT 'subjects' as table_name, COUNT(*) as total_rows,
       COUNT(CASE WHEN passing_percentage > 0 THEN 1 END) as with_passing
FROM subjects;
```

### Step 8: สร้าง Views สำหรับความสะดวก

```sql
-- 1. View สำหรับ hierarchical score structure
CREATE OR REPLACE VIEW hierarchical_score_structure AS
SELECT 
    s.subject_id,
    s.title as subject_title,
    s.passing_percentage,
    s.auto_distribute_score,
    bl.big_lesson_id,
    bl.title as big_lesson_title,
    bl.weight_percentage as big_lesson_weight,
    bl.order_number as big_lesson_order,
    bl.quiz_weight_percentage,
    bl.lessons_total_weight,
    l.lesson_id,
    l.title as lesson_title,
    l.total_weight_in_biglesson,
    l.order_number as lesson_order,
    l.video_weight_percentage,
    l.quiz_weight_percentage,
    q.quiz_id,
    q.title as quiz_title,
    q.weight_percentage as quiz_weight,
    q.quiz_type,
    q.type as quiz_type_detail
FROM subjects s
LEFT JOIN big_lessons bl ON s.subject_id = bl.subject_id
LEFT JOIN lessons l ON bl.big_lesson_id = l.big_lesson_id
LEFT JOIN quizzes q ON (l.quiz_id = q.quiz_id OR bl.quiz_id = q.quiz_id)
WHERE s.status = 'active'
ORDER BY s.subject_id, bl.order_number, l.order_number;

-- 2. View สำหรับ quiz progress summary
CREATE OR REPLACE VIEW quiz_progress_summary AS
SELECT 
    qp.user_id,
    qp.quiz_id,
    q.title as quiz_title,
    q.type as quiz_type,
    q.quiz_type as quiz_category,
    qp.completed,
    qp.passed,
    qp.awaiting_review,
    qp.score,
    qp.passing_score,
    qp.weight_earned,
    qp.is_big_lesson_quiz,
    qp.created_at,
    qp.updated_at
FROM quiz_progress qp
JOIN quizzes q ON qp.quiz_id = q.quiz_id
WHERE q.status = 'active';

-- 3. View สำหรับ lesson progress summary
CREATE OR REPLACE VIEW lesson_progress_summary AS
SELECT 
    lp.user_id,
    lp.lesson_id,
    l.title as lesson_title,
    l.big_lesson_id,
    bl.title as big_lesson_title,
    lp.video_completed,
    lp.quiz_completed,
    lp.overall_completed,
    lp.quiz_awaiting_review,
    lp.created_at,
    lp.updated_at
FROM lesson_progress lp
JOIN lessons l ON lp.lesson_id = l.lesson_id
LEFT JOIN big_lessons bl ON l.big_lesson_id = bl.big_lesson_id
WHERE l.status = 'active';
```

### คำสั่งทั้งหมดในไฟล์เดียว (พร้อมใช้งาน)

```sql
-- =====================================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- สำหรับระบบ Learning Management
-- =====================================================

-- Step 1: เพิ่มคอลัมน์ที่ขาดหายไป
ALTER TABLE big_lessons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE big_lessons ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_in_biglesson INTEGER DEFAULT 0;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS big_lesson_id INTEGER;
ALTER TABLE quiz_progress ADD COLUMN IF NOT EXISTS weight_earned DECIMAL(5,2) DEFAULT 0;
ALTER TABLE quiz_progress ADD COLUMN IF NOT EXISTS is_big_lesson_quiz BOOLEAN DEFAULT FALSE;
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS quiz_awaiting_review BOOLEAN DEFAULT FALSE;

-- Step 2: เพิ่ม Foreign Key Constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_quizzes_big_lesson_id') THEN
        ALTER TABLE quizzes ADD CONSTRAINT fk_quizzes_big_lesson_id FOREIGN KEY (big_lesson_id) REFERENCES big_lessons(big_lesson_id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_lessons_big_lesson_id') THEN
        ALTER TABLE lessons ADD CONSTRAINT fk_lessons_big_lesson_id FOREIGN KEY (big_lesson_id) REFERENCES big_lessons(big_lesson_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 3: เพิ่ม Indexes
CREATE INDEX IF NOT EXISTS idx_big_lessons_subject_id ON big_lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_big_lessons_order ON big_lessons(subject_id, order_number);
CREATE INDEX IF NOT EXISTS idx_big_lessons_active ON big_lessons(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_lessons_big_lesson_id ON lessons(big_lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(big_lesson_id, order_number);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_quizzes_big_lesson_id ON quizzes(big_lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_type ON quizzes(type);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject_id ON quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_quiz_type ON quizzes(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_quiz_progress_awaiting_review ON quiz_progress(awaiting_review) WHERE awaiting_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_quiz_progress_user_quiz ON quiz_progress(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_completed ON quiz_progress(completed) WHERE completed = TRUE;
CREATE INDEX IF NOT EXISTS idx_quiz_progress_passed ON quiz_progress(passed) WHERE passed = TRUE;
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_video_completed ON lesson_progress(video_completed) WHERE video_completed = TRUE;
CREATE INDEX IF NOT EXISTS idx_lesson_progress_quiz_completed ON lesson_progress(quiz_completed) WHERE quiz_completed = TRUE;
CREATE INDEX IF NOT EXISTS idx_lesson_progress_overall_completed ON lesson_progress(overall_completed) WHERE overall_completed = TRUE;
CREATE INDEX IF NOT EXISTS idx_lesson_progress_quiz_awaiting_review ON lesson_progress(quiz_awaiting_review) WHERE quiz_awaiting_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_awaiting_review ON quiz_attempts(status) WHERE status = 'awaiting_review';
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt ON quiz_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_question ON quiz_attempt_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_has_attachments ON quiz_attempt_answers(has_attachments) WHERE has_attachments = TRUE;
CREATE INDEX IF NOT EXISTS idx_quiz_attachments_answer ON quiz_attachments(answer_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attachments_quiz_user ON quiz_attachments(quiz_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attachments_file_type ON quiz_attachments(file_type);

-- Step 4: อัปเดตข้อมูล
UPDATE big_lessons SET weight_percentage = 100 WHERE weight_percentage = 0 OR weight_percentage IS NULL;
UPDATE lessons SET total_weight_in_biglesson = 50 WHERE total_weight_in_biglesson = 0 OR total_weight_in_biglesson IS NULL;
UPDATE quizzes SET weight_percentage = 50 WHERE weight_percentage = 0 OR weight_percentage IS NULL;
UPDATE subjects SET passing_percentage = 80 WHERE passing_percentage = 0 OR passing_percentage IS NULL;
UPDATE subjects SET auto_distribute_score = FALSE WHERE auto_distribute_score IS NULL;

-- Step 5: เพิ่ม Comments
COMMENT ON COLUMN big_lessons.is_active IS 'สถานะการใช้งานของ big lesson';
COMMENT ON COLUMN big_lessons.is_big_lesson_quiz IS 'ระบุว่าเป็น quiz ของ big lesson หรือไม่';
COMMENT ON COLUMN lessons.order_in_biglesson IS 'ลำดับของ lesson ใน big lesson';
COMMENT ON COLUMN quizzes.is_big_lesson_quiz IS 'ระบุว่าเป็น quiz ของ big lesson หรือไม่';
COMMENT ON COLUMN quizzes.big_lesson_id IS 'อ้างอิงไปยัง big lesson';
COMMENT ON COLUMN quiz_progress.weight_earned IS 'คะแนนที่ได้จาก quiz (0-100)';
COMMENT ON COLUMN quiz_progress.is_big_lesson_quiz IS 'ระบุว่าเป็น quiz ของ big lesson หรือไม่';

-- Step 6: สร้าง Views
CREATE OR REPLACE VIEW hierarchical_score_structure AS
SELECT 
    s.subject_id, s.title as subject_title, s.passing_percentage, s.auto_distribute_score,
    bl.big_lesson_id, bl.title as big_lesson_title, bl.weight_percentage as big_lesson_weight,
    bl.order_number as big_lesson_order, bl.quiz_weight_percentage, bl.lessons_total_weight,
    l.lesson_id, l.title as lesson_title, l.total_weight_in_biglesson, l.order_number as lesson_order,
    l.video_weight_percentage, l.quiz_weight_percentage,
    q.quiz_id, q.title as quiz_title, q.weight_percentage as quiz_weight, q.quiz_type, q.type as quiz_type_detail
FROM subjects s
LEFT JOIN big_lessons bl ON s.subject_id = bl.subject_id
LEFT JOIN lessons l ON bl.big_lesson_id = l.big_lesson_id
LEFT JOIN quizzes q ON (l.quiz_id = q.quiz_id OR bl.quiz_id = q.quiz_id)
WHERE s.status = 'active'
ORDER BY s.subject_id, bl.order_number, l.order_number;

CREATE OR REPLACE VIEW quiz_progress_summary AS
SELECT 
    qp.user_id, qp.quiz_id, q.title as quiz_title, q.type as quiz_type, q.quiz_type as quiz_category,
    qp.completed, qp.passed, qp.awaiting_review, qp.score, qp.passing_score, qp.weight_earned,
    qp.is_big_lesson_quiz, qp.created_at, qp.updated_at
FROM quiz_progress qp
JOIN quizzes q ON qp.quiz_id = q.quiz_id
WHERE q.status = 'active';

CREATE OR REPLACE VIEW lesson_progress_summary AS
SELECT 
    lp.user_id, lp.lesson_id, l.title as lesson_title, l.big_lesson_id, bl.title as big_lesson_title,
    lp.video_completed, lp.quiz_completed, lp.overall_completed, lp.quiz_awaiting_review,
    lp.created_at, lp.updated_at
FROM lesson_progress lp
JOIN lessons l ON lp.lesson_id = l.lesson_id
LEFT JOIN big_lessons bl ON l.big_lesson_id = bl.big_lesson_id
WHERE l.status = 'active';

-- Step 7: ตรวจสอบผลลัพธ์
SELECT 'Migration completed successfully!' as status;
```
