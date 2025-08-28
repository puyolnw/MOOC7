# แนวทางแก้ไขปัญหาระบบ Credit Bank 2024

## ปัญหาที่ 1: Navigation ระหว่างบทเรียน

### ปัญหาหลัก
- `handleNextLesson` function ซับซ้อนเกินไป
- ไม่มี UI ปุ่ม "ถัดไป" ที่ชัดเจน
- State sync ระหว่าง sidebar และ main content ไม่สอดคล้อง

### การแก้ไข

#### 1. ปรับปรุง `handleNextLesson` ใน `LessonArea.tsx`

```typescript
const handleNextLesson = useCallback(() => {
    if (!lessonData || lessonData.length === 0 || !currentLessonId) {
        console.warn("Cannot navigate: missing data or current lesson");
        return;
    }

    // Parse current position
    const [sectionId, itemIndex] = currentLessonId.split("-").map(Number);
    
    // Find current section
    const currentSectionIndex = lessonData.findIndex(section => section.id === sectionId);
    if (currentSectionIndex === -1) {
        console.warn("Current section not found");
        return;
    }

    const currentSection = lessonData[currentSectionIndex];
    const currentItemIndex = parseInt(itemIndex.toString());

    // Try next item in current section
    if (currentItemIndex + 1 < currentSection.items.length) {
        const nextItem = currentSection.items[currentItemIndex + 1];
        if (!nextItem.lock) {
            navigateToItem(currentSection, nextItem, currentItemIndex + 1);
            return;
        }
    }

    // Try first item in next section
    if (currentSectionIndex + 1 < lessonData.length) {
        const nextSection = lessonData[currentSectionIndex + 1];
        const firstUnlockedItem = nextSection.items.find(item => !item.lock);
        
        if (firstUnlockedItem) {
            const itemIndex = nextSection.items.indexOf(firstUnlockedItem);
            navigateToItem(nextSection, firstUnlockedItem, itemIndex);
            return;
        }
    }

    // No more lessons available
    showCompletionMessage();
}, [lessonData, currentLessonId]);

const navigateToItem = (section: any, item: any, itemIndex: number) => {
    const newLessonId = `${section.id}-${itemIndex}`;
    
    setCurrentLessonId(newLessonId);
    setCurrentLesson(item.title);
    setCurrentLessonData(item);
    
    if (item.type === "video" && item.video_url) {
        const videoId = extractYoutubeId(item.video_url);
        if (videoId) {
            setCurrentView("video");
            setYoutubeId(videoId);
        }
    } else if (item.type === "quiz") {
        setCurrentView("quiz");
    }
    
    // Update sidebar state
    setSidebarActiveAccordion(section.id);
    console.log(`🎯 Navigated to: ${item.title}`);
};

const showCompletionMessage = () => {
    alert("🎉 คุณได้เรียนจบหลักสูตรนี้แล้ว!");
};
```

#### 2. เพิ่ม Next Button UI ใน `LessonVideo.tsx`

```typescript
// เพิ่มหลัง completion modal
{isCompleted && (
    <div className="lesson-controls mt-3 d-flex justify-content-between">
        <button 
            className="btn btn-secondary"
            onClick={() => {/* Previous lesson logic */}}
        >
            <i className="fas fa-chevron-left me-2"></i>
            ก่อนหน้า
        </button>
        
        <button 
            className="btn btn-primary"
            onClick={() => {
                if (onGoToNextLesson) {
                    onGoToNextLesson();
                } else if (hasQuiz) {
                    onGoToQuiz?.();
                }
            }}
        >
            {hasQuiz ? 'ทำแบบทดสอบ' : 'บทเรียนถัดไป'}
            <i className="fas fa-chevron-right ms-2"></i>
        </button>
    </div>
)}
```

#### 3. เพิ่ม Next Button ใน `LessonQuiz.tsx`

```typescript
// ใน result section
{showResult && (
    <div className="quiz-result-actions mt-4">
        <div className="d-flex justify-content-between">
            <button 
                className="btn btn-secondary"
                onClick={resetQuiz}
                disabled={!isPassed && !isAwaitingReview}
            >
                <i className="fas fa-redo me-2"></i>
                ทำใหม่
            </button>
            
            {(isPassed || isAwaitingReview) && (
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        if (onGoToNextLesson) {
                            onGoToNextLesson();
                        }
                    }}
                >
                    บทเรียนถัดไป
                    <i className="fas fa-chevron-right ms-2"></i>
                </button>
            )}
        </div>
    </div>
)}
```

---

## ปัญหาที่ 2: File Submission ไม่ทำงาน

### ปัญหาหลัก
- FormData handling ไม่ถูกต้อง
- File mapping กับคำถามไม่แม่นยำ
- สถานะ "รอตรวจ" ไม่อัปเดต

### การแก้ไข

#### 1. แก้ไข `submitQuizAnswers` ใน `LessonQuiz.tsx`

```typescript
const submitQuizAnswers = async () => {
    try {
        setLoading(true);
        const formData = new FormData();

        // Process answers
        const processedAnswers = questions
            .map((question, index) => {
                if (!question.question_id) return null;

                const answer: any = {
                    question_id: question.question_id,
                };

                switch (question.type) {
                    case "SC":
                    case "TF":
                        if (selectedSingleAnswers[index] !== undefined) {
                            answer.choice_id = question.choices[selectedSingleAnswers[index]]?.choice_id;
                        }
                        break;
                    case "MC":
                        if (selectedMultipleAnswers[index]?.length > 0) {
                            answer.choice_ids = selectedMultipleAnswers[index].map(
                                (idx) => question.choices[idx]?.choice_id
                            );
                        }
                        break;
                    case "FB":
                        if (textAnswers[index]) {
                            answer.text_answer = textAnswers[index];
                        }
                        break;
                }

                return answer;
            })
            .filter(a => a !== null);

        // Add answers to FormData
        formData.append('answers', JSON.stringify(processedAnswers));

        // Add files with proper mapping
        const fileQuestionMap: { [key: number]: string[] } = {};
        
        files.forEach((fileObj, index) => {
            const questionId = fileObj.question_id;
            formData.append('files', fileObj.file);
            
            if (!fileQuestionMap[questionId]) {
                fileQuestionMap[questionId] = [];
            }
            fileQuestionMap[questionId].push(fileObj.file.name);
        });

        formData.append('file_question_mapping', JSON.stringify(fileQuestionMap));

        if (lessonId > 0) {
            formData.append('lesson_id', lessonId.toString());
        }

        console.log('📤 Submitting quiz with files:', {
            answersCount: processedAnswers.length,
            filesCount: files.length,
            fileMapping: fileQuestionMap
        });

        const response = await axios.post(
            `${API_URL}/api/learn/quiz/${quizId}/submit`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (response.data.success) {
            const result = response.data;
            
            // Check if needs manual review
            const needsReview = files.length > 0 || 
                              questions.some(q => q.type === "FB") ||
                              result.awaiting_review;
            
            if (needsReview) {
                setIsAwaitingReview(true);
                setShowResult(true);
                console.log("✅ Quiz submitted - Awaiting Review");
                
                // Trigger sidebar refresh
                setTimeout(() => {
                    if (onRefreshProgress) {
                        onRefreshProgress();
                    }
                }, 1000);
            } else {
                setScore(result.totalScore || 0);
                setMaxScore(result.maxScore || 0);
                setIsPassed(result.passed || false);
                setShowResult(true);
                console.log("✅ Quiz submitted - Immediate Result");
            }
        }

    } catch (error: any) {
        console.error("Error submitting quiz:", error);
        alert(`เกิดข้อผิดพลาด: ${error.response?.data?.message || error.message}`);
    } finally {
        setLoading(false);
    }
};
```

#### 2. แก้ไข Backend API ใน `Learning.js`

```javascript
router.post(
  "/quiz/:quizId/submit",
  authenticate,
  upload.array("files", 10),
  async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.id;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Parse form data
      let answers = [];
      let fileQuestionMapping = {};

      if (req.body.answers) {
        answers = JSON.parse(req.body.answers);
      }

      if (req.body.file_question_mapping) {
        fileQuestionMapping = JSON.parse(req.body.file_question_mapping);
      }

      const files = req.files || [];
      
      console.log('📥 Received quiz submission:', {
        quizId,
        userId,
        answersCount: answers.length,
        filesCount: files.length,
        fileMapping: fileQuestionMapping
      });

      // Check if manual review is needed
      const hasFiles = files.length > 0;
      const hasEssayQuestions = answers.some(a => a.text_answer);
      const needsManualReview = hasFiles || hasEssayQuestions;

      // Create attempt
      const attemptResult = await client.query(
        `INSERT INTO quiz_attempts (user_id, quiz_id, start_time, status)
         VALUES ($1, $2, NOW(), $3) RETURNING attempt_id`,
        [userId, quizId, needsManualReview ? 'awaiting_review' : 'completed']
      );

      const attemptId = attemptResult.rows[0].attempt_id;
      let totalScore = 0;
      let maxScore = 0;
      const uploadedFiles = [];

      // Process each answer
      for (const answer of answers) {
        const questionResult = await client.query(
          "SELECT question_id, type, score FROM questions WHERE question_id = $1",
          [answer.question_id]
        );

        if (questionResult.rows.length === 0) continue;

        const question = questionResult.rows[0];
        maxScore += question.score;

        let isCorrect = false;
        let scoreEarned = 0;

        // Calculate score for objective questions only
        if (!needsManualReview) {
          switch (question.type) {
            case "SC":
            case "TF":
              if (answer.choice_id) {
                const correctChoice = await client.query(
                  "SELECT is_correct FROM choices WHERE choice_id = $1",
                  [answer.choice_id]
                );
                isCorrect = correctChoice.rows[0]?.is_correct || false;
                scoreEarned = isCorrect ? question.score : 0;
                totalScore += scoreEarned;
              }
              break;
            case "MC":
              if (answer.choice_ids && answer.choice_ids.length > 0) {
                const correctChoices = await client.query(
                  "SELECT choice_id FROM choices WHERE question_id = $1 AND is_correct = true",
                  [answer.question_id]
                );
                const correctIds = correctChoices.rows.map(r => r.choice_id).sort();
                const userIds = answer.choice_ids.sort();
                
                isCorrect = correctIds.length === userIds.length && 
                           correctIds.every((id, index) => id === userIds[index]);
                scoreEarned = isCorrect ? question.score : 0;
                totalScore += scoreEarned;
              }
              break;
          }
        }

        // Save answer
        const answerResult = await client.query(
          `INSERT INTO quiz_attempt_answers (
            attempt_id, question_id, choice_id, text_answer, is_correct, score_earned
          ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING answer_id`,
          [
            attemptId,
            answer.question_id,
            answer.choice_id || null,
            answer.text_answer || null,
            needsManualReview ? null : isCorrect,
            needsManualReview ? null : scoreEarned
          ]
        );

        const answerId = answerResult.rows[0].answer_id;

        // Handle file uploads for this question
        const questionFiles = fileQuestionMapping[answer.question_id] || [];
        
        for (const file of files) {
          if (questionFiles.includes(file.originalname)) {
            try {
              const uploadResult = await uploadToGoogleDrive(file);
              
              const attachmentResult = await client.query(
                `INSERT INTO quiz_attachments (
                  quiz_id, user_id, file_url, file_type, file_size, 
                  file_id, file_name, file_path, answer_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING attachment_id, file_name, file_url`,
                [
                  quizId, userId, uploadResult.webViewLink, file.mimetype, file.size,
                  uploadResult.fileId, file.originalname, file.path || `/uploads/${file.filename}`,
                  answerId
                ]
              );

              uploadedFiles.push({
                attachment_id: attachmentResult.rows[0].attachment_id,
                file_name: attachmentResult.rows[0].file_name,
                file_url: attachmentResult.rows[0].file_url
              });

            } catch (uploadError) {
              console.error("File upload error:", uploadError);
            }
          }
        }
      }

      // Update lesson progress if applicable
      const lessonId = req.body.lesson_id;
      if (lessonId && lessonId > 0) {
        await client.query(
          `INSERT INTO lesson_progress (
            user_id, lesson_id, quiz_completed, quiz_completion_date, 
            quiz_awaiting_review, created_at, updated_at
          ) VALUES ($1, $2, $3, NOW(), $4, NOW(), NOW())
          ON CONFLICT (user_id, lesson_id) DO UPDATE
          SET 
            quiz_completed = $3,
            quiz_completion_date = CASE WHEN $3 THEN NOW() ELSE lesson_progress.quiz_completion_date END,
            quiz_awaiting_review = $4,
            updated_at = NOW()`,
          [userId, lessonId, !needsManualReview, needsManualReview]
        );
      }

      // Calculate passing
      const passed = needsManualReview ? null : (totalScore >= maxScore * 0.65);

      // Update attempt
      await client.query(
        `UPDATE quiz_attempts 
         SET end_time = NOW(), score = $1, max_score = $2, passed = $3
         WHERE attempt_id = $4`,
        [needsManualReview ? null : totalScore, maxScore, passed, attemptId]
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        attempt_id: attemptId,
        totalScore: needsManualReview ? null : totalScore,
        maxScore: maxScore,
        passed: passed,
        awaiting_review: needsManualReview,
        uploaded_files: uploadedFiles,
        message: needsManualReview ? 
          "ส่งคำตอบแล้ว รอการตรวจสอบจากอาจารย์" : 
          "ส่งคำตอบเรียบร้อยแล้ว"
      });

    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Quiz submission error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการส่งคำตอบ"
      });
    } finally {
      client.release();
    }
  }
);
```

---

## ปัญหาที่ 3: Mixed Quiz Types

### ปัญหาหลัก
- ไม่มี validation ป้องกันการผสมประเภทคำถาม
- การประมวลผลไม่ถูกต้อง

### การแก้ไข

#### 1. เพิ่ม Validation ใน Frontend

```typescript
// ใน AddQuizzes.tsx
const validateQuestionTypes = (existingQuestions: any[], newQuestionType: string): boolean => {
    if (existingQuestions.length === 0) return true;

    const objectiveTypes = ["SC", "TF", "MC"];
    const subjectiveTypes = ["FB"];

    const hasObjective = existingQuestions.some(q => objectiveTypes.includes(q.type));
    const hasSubjective = existingQuestions.some(q => subjectiveTypes.includes(q.type));

    const newIsObjective = objectiveTypes.includes(newQuestionType);
    const newIsSubjective = subjectiveTypes.includes(newQuestionType);

    // ห้ามผสมประเภท
    if ((hasObjective && newIsSubjective) || (hasSubjective && newIsObjective)) {
        return false;
    }

    return true;
};

const handleQuestionAdd = (questionData: any) => {
    if (!validateQuestionTypes(existingQuestions, questionData.type)) {
        alert("ไม่สามารถเพิ่มคำถามประเภทนี้ได้ เนื่องจากแบบทดสอบมีคำถามประเภทอื่นอยู่แล้ว");
        return;
    }
    
    // Proceed with adding question
    addQuestion(questionData);
};
```

#### 2. เพิ่ม Validation ใน Backend

```javascript
// ใน Questions.js
async function validateQuizQuestionTypes(quizId, newQuestionType, client) {
    const existingQuestions = await client.query(`
        SELECT DISTINCT q.type, q.category
        FROM questions q 
        JOIN quiz_questions qq ON q.question_id = qq.question_id 
        WHERE qq.quiz_id = $1
    `, [quizId]);

    if (existingQuestions.rows.length === 0) return { valid: true };

    const hasObjective = existingQuestions.rows.some(q => q.category === 'objective');
    const hasSubjective = existingQuestions.rows.some(q => q.category === 'subjective');

    const newQuestionCategory = ['SC', 'TF', 'MC'].includes(newQuestionType) ? 'objective' : 'subjective';
    const newIsObjective = newQuestionCategory === 'objective';
    const newIsSubjective = newQuestionCategory === 'subjective';

    if ((hasObjective && newIsSubjective) || (hasSubjective && newIsObjective)) {
        return {
            valid: false,
            message: "ไม่สามารถผสมคำถามปรนัยและอัตนัยในแบบทดสอบเดียวกันได้"
        };
    }

    return { valid: true };
}

// ใน POST route
router.post("/", upload.array('attachments', 10), async (req, res) => {
    // ... existing code ...

    // Validate quiz types before creating question
    if (quizzes && quizzes.length > 0) {
        for (const quizId of quizzes) {
            const validation = await validateQuizQuestionTypes(quizId, type, client);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message
                });
            }
        }
    }

    // ... rest of the code ...
});
```

---

## ปัญหาที่ 4: Progress Tracking ผิดพลาด

### การแก้ไข

#### 1. ปรับปรุง Progress Initialization

```typescript
// ใน LessonArea.tsx
const initializeLessonProgress = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/api/learn/subject/${subjectId}/progress`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );

        if (response.data.success) {
            const progressData = response.data.progress;
            
            // ใช้ข้อมูลจาก server เป็นหลัก
            setLessonData(prevData => {
                if (!prevData) return prevData;
                
                return prevData.map(section => ({
                    ...section,
                    items: section.items.map(item => {
                        const itemProgress = progressData.lessons?.find(
                            (p: any) => p.lesson_id === item.lesson_id
                        );
                        
                        return {
                            ...item,
                            completed: itemProgress?.completed || false,
                            lock: shouldLockLesson(item, section, progressData)
                        };
                    })
                }));
            });
        }
    } catch (error) {
        console.error("Error initializing progress:", error);
    }
};

const shouldLockLesson = (item: any, section: any, progressData: any) => {
    // Logic to determine if lesson should be locked
    // Based on prerequisites and previous lesson completion
    
    if (item.type === "video") {
        // Videos should be unlocked in sequence
        const sectionIndex = lessonData?.indexOf(section) || 0;
        const itemIndex = section.items?.indexOf(item) || 0;
        
        if (sectionIndex === 0 && itemIndex === 0) {
            return false; // First lesson is always unlocked
        }
        
        // Check if previous lesson is completed
        // Implementation depends on your business logic
    }
    
    return item.lock; // Default to existing lock status
};
```

#### 2. แก้ไข Video Progress Tracking

```typescript
// ใน LessonVideo.tsx
const saveToServer = async (completed: boolean = false) => {
    try {
        // Only save completion, not intermediate progress
        if (!completed) {
            return true; // Don't save incomplete progress
        }

        const response = await axios.post(
            `${API_URL}/api/learn/lesson/${lessonId}/video-progress`,
            { completed: true },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.success;
    } catch (error) {
        console.error("Error saving to server:", error);
        return false;
    }
};
```

---

## ปัญหาที่ 5: Payment Notification

### การแก้ไข

#### 1. เพิ่มการตรวจสอบ Completion

```typescript
// ใน LessonArea.tsx
const checkSubjectCompletion = useCallback(async () => {
    if (!currentSubjectId || progress < 100) return;

    try {
        const response = await axios.post(
            `${API_URL}/api/learn/subject/${currentSubjectId}/completion-check`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );

        if (response.data.success && response.data.completed) {
            // Show completion notification
            showCompletionNotification();
        }
    } catch (error) {
        console.error("Error checking completion:", error);
    }
}, [currentSubjectId, progress]);

const showCompletionNotification = () => {
    const notification = (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
            <h5 className="alert-heading">🎉 ยินดีด้วย!</h5>
            <p>คุณได้เรียนจบรายวิชานี้แล้ว สามารถไปชำระเงินเพื่อรับใบประกาศณีย์บัตรได้ที่หน้า Dashboard</p>
            <hr />
            <div className="d-flex justify-content-end">
                <button 
                    className="btn btn-success"
                    onClick={() => window.open('/student-dashboard/payment', '_blank')}
                >
                    ไปหน้าชำระเงิน
                </button>
            </div>
        </div>
    );
    
    // Show notification using toast or modal
    toast.success("เรียนจบรายวิชาแล้ว! สามารถไปชำระเงินได้ที่หน้า Dashboard");
};

useEffect(() => {
    if (progress >= 100) {
        checkSubjectCompletion();
    }
}, [progress, checkSubjectCompletion]);
```

#### 2. เพิ่ม Backend API

```javascript
// ใน Learning.js
router.post("/subject/:subjectId/completion-check", authenticate, async (req, res) => {
    const { subjectId } = req.params;
    const userId = req.user.id;
    
    try {
        // Check if subject is completed
        const enrollmentCheck = await pool.query(`
            SELECT enrollment_id, progress_percentage, status, completion_date
            FROM enrollments 
            WHERE user_id = $1 AND subject_id = $2
        `, [userId, subjectId]);

        if (enrollmentCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบการลงทะเบียนรายวิชานี้"
            });
        }

        const enrollment = enrollmentCheck.rows[0];
        const isCompleted = enrollment.progress_percentage >= 100;

        if (isCompleted && enrollment.status !== 'completed') {
            // Update status to completed
            await pool.query(`
                UPDATE enrollments 
                SET 
                    status = 'completed',
                    completion_date = COALESCE(completion_date, NOW()),
                    updated_at = NOW()
                WHERE user_id = $1 AND subject_id = $2
            `, [userId, subjectId]);
        }

        res.json({
            success: true,
            completed: isCompleted,
            enrollment: {
                ...enrollment,
                status: isCompleted ? 'completed' : enrollment.status
            }
        });

    } catch (error) {
        console.error("Error checking completion:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะ"
        });
    }
});
```

---

## ปัญหาที่ 7: Student Registration

### การแก้ไข

#### 1. แก้ไข Frontend Form

```typescript
// ใน AddStudents.tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate education_level
    if (!studentData.educationLevel) {
        setApiError("กรุณาเลือกประเภทการศึกษา");
        return;
    }

    try {
        setIsSubmitting(true);
        setApiError("");

        const token = localStorage.getItem("token");
        if (!token) {
            setApiError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
            return;
        }

        const baseFormData = {
            username: studentData.username,
            first_name: studentData.firstName,
            last_name: studentData.lastName,
            email: studentData.email,
            password: studentData.password,
            role_id: 1, // Student role
            education_level: studentData.educationLevel, // Required field
            student_code: studentData.studentCode,
        };

        const formData = userType === 0 
            ? {
                // University student
                ...baseFormData,
                department_id: parseInt(studentData.department),
                academic_year: parseInt(studentData.academicYear),
                gpa: studentData.gpa ? parseFloat(studentData.gpa) : undefined,
                phone: studentData.phone || undefined,
            }
            : {
                // High school student
                ...baseFormData,
                school_name: studentData.schoolName,
                study_program: studentData.studyProgram === 'อื่น ๆ' 
                    ? studentData.studyProgramOther 
                    : studentData.studyProgram,
                grade_level: studentData.gradeLevel,
                address: studentData.address,
                gpa: studentData.gpa ? parseFloat(studentData.gpa) : undefined,
                phone: studentData.phone || undefined,
            };

        console.log("📤 Submitting registration:", formData);

        const response = await axios.post(`${apiURL}/api/auth/register`, formData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.data.success) {
            toast.success("เพิ่มผู้ใช้สำเร็จ");
            // Reset form or navigate
            resetForm();
        } else {
            setApiError(response.data.message || "เกิดข้อผิดพลาด");
        }

    } catch (error: any) {
        console.error("Registration error:", error);
        const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้";
        setApiError(errorMessage);
        toast.error(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
};
```

#### 2. แก้ไข Backend Validation

```javascript
// ใน register.js
router.post("/register", async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const {
            username, email, password, role_id,
            academic_year, department_id, education_level, student_code,
            first_name, last_name, school_name, study_program,
            grade_level, address, phone, gpa
        } = req.body;

        // Basic validation
        if (!username || !email || !password || !role_id) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอกข้อมูล username, email, password และ role_id ให้ครบถ้วน"
            });
        }

        // Role-specific validation
        if (role_id === 1) { // Student role
            if (!education_level) {
                return res.status(400).json({
                    success: false,
                    message: "กรุณาระบุประเภทการศึกษา"
                });
            }

            if (!student_code) {
                return res.status(400).json({
                    success: false,
                    message: "กรุณาระบุรหัสนักเรียน/นักศึกษา"
                });
            }

            // University student validation
            if (["ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก"].includes(education_level)) {
                if (!academic_year || !department_id) {
                    return res.status(400).json({
                        success: false,
                        message: "กรุณาระบุชั้นปีและภาควิชาสำหรับนักศึกษา"
                    });
                }

                if (academic_year < 1 || academic_year > 4) {
                    return res.status(400).json({
                        success: false,
                        message: "ชั้นปีการศึกษาต้องอยู่ระหว่าง 1-4"
                    });
                }
            }

            // High school student validation
            if (["มัธยมต้น", "มัธยมปลาย"].includes(education_level)) {
                if (!school_name || !grade_level) {
                    return res.status(400).json({
                        success: false,
                        message: "กรุณาระบุชื่อโรงเรียนและระดับชั้นสำหรับนักเรียน"
                    });
                }
            }
        }

        // Check for duplicates
        const [usernameCheck, emailCheck] = await Promise.all([
            client.query("SELECT user_id FROM users WHERE username = $1", [username]),
            client.query("SELECT user_id FROM users WHERE email = $1", [email])
        ]);

        if (usernameCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "ชื่อผู้ใช้นี้มีในระบบแล้ว"
            });
        }

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "อีเมลนี้มีในระบบแล้ว"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const userResult = await client.query(
            `INSERT INTO users (username, email, password, role_id, first_name, last_name, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             RETURNING user_id, username, email, role_id, first_name, last_name, created_at`,
            [username, email, hashedPassword, role_id, first_name, last_name]
        );

        const user = userResult.rows[0];

        // Create student record based on education level
        if (role_id === 1) {
            if (["ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก"].includes(education_level)) {
                // University student
                await client.query(
                    `INSERT INTO students (user_id, student_code, department_id, education_level, academic_year, gpa, phone, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
                    [user.user_id, student_code, department_id, education_level, academic_year, gpa, phone]
                );
            } else {
                // High school student
                await client.query(
                    `INSERT INTO school_students (user_id, student_code, school_name, study_program, grade_level, address, gpa, phone, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
                    [user.user_id, student_code, school_name, study_program, grade_level, address, gpa, phone]
                );
            }
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: "สมัครสมาชิกสำเร็จ",
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role_id: user.role_id
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการสมัครสมาชิก"
        });
    } finally {
        client.release();
    }
});
```

---

## การทดสอบที่แนะนำ

### 1. Manual Testing Checklist

**Navigation (ปัญหาที่ 1):**
- [ ] กดปุ่ม "ถัดไป" ใน video player
- [ ] กดปุ่ม "ถัดไป" หลังทำแบบทดสอบผ่าน
- [ ] ตรวจสอบ sidebar sync
- [ ] ทดสอบกับ locked/unlocked lessons

**File Submission (ปัญหาที่ 2):**
- [ ] อัปโหลดไฟล์ในคำถามอัตนัย
- [ ] ส่งคำตอบที่มีทั้งไฟล์และข้อความ
- [ ] ตรวจสอบสถานะ "รอตรวจ" ใน sidebar
- [ ] ทดสอบกับไฟล์หลายประเภท

**Mixed Quiz Types (ปัญหาที่ 3):**
- [ ] สร้างแบบทดสอบปรนัย และเพิ่มคำถามอัตนัย
- [ ] สร้างแบบทดสอบอัตนัย และเพิ่มคำถามปรนัย
- [ ] ตรวจสอบ error message

**Progress Tracking (ปัญหาที่ 4):**
- [ ] เริ่มเรียนใหม่ควรแสดง progress 0%
- [ ] ดูวิดีโอจนจบควรแสดง completed
- [ ] Refresh หน้าควรแสดงสถานะถูกต้อง

**Student Registration (ปัญหาที่ 7):**
- [ ] สร้างบัญชีนักศึกษา (เลือกประเภทการศึกษา)
- [ ] สร้างบัญชีนักเรียน (เลือกประเภทการศึกษา)
- [ ] ทดสอบกับข้อมูลไม่ครบ

### 2. Automated Testing

```javascript
// Jest test example for form validation
describe('Student Registration', () => {
  test('should require education_level', async () => {
    const formData = {
      username: 'test',
      email: 'test@example.com',
      password: 'password',
      role_id: 1,
      // education_level missing
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(formData);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('ประเภทการศึกษา');
  });
});
```

การแก้ไขเหล่านี้จะช่วยแก้ปัญหาหลักที่พบในระบบ และควรทำการทดสอบอย่างครอบคลุมก่อนนำไปใช้งานจริง

