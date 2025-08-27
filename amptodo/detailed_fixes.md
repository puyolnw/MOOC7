# การแก้ไขรายละเอียดแต่ละปัญหา - Code Changes

## ปัญหาที่ 1: ไม่สามารถกดถัดไปยังบทเรียนต่อไปโดยตรงได้

### ไฟล์: `MOOC7/src/components/courses/lesson/LessonArea.tsx`

**แก้ไข handleNextLesson function (บรรทัด 2537-2802):**

```typescript
const handleNextLesson = useCallback(() => {
    console.log("🎯 handleNextLesson triggered");
    
    if (!lessonData || lessonData.length === 0) {
        console.log("❌ No lesson data available");
        return;
    }

    // หา section และ item ปัจจุบัน
    const currentSectionIndex = lessonData.findIndex(section =>
        section.items.some(item => `${section.id}-${section.items.indexOf(item)}` === currentLessonId)
    );

    if (currentSectionIndex === -1) {
        console.log("❌ Current section not found");
        return;
    }

    const currentSection = lessonData[currentSectionIndex];
    const currentItemIndex = currentSection.items.findIndex(item =>
        `${currentSection.id}-${currentSection.items.indexOf(item)}` === currentLessonId
    );

    console.log(`📍 Current position: Section ${currentSectionIndex}, Item ${currentItemIndex}`);

    // หาบทเรียนถัดไปในส่วนเดียวกัน
    if (currentItemIndex + 1 < currentSection.items.length) {
        const nextItem = currentSection.items[currentItemIndex + 1];
        if (!nextItem.lock) {
            navigateToLesson(currentSection, nextItem, currentItemIndex + 1);
            return;
        }
    }

    // หาบทเรียนถัดไปในส่วนถัดไป
    if (currentSectionIndex + 1 < lessonData.length) {
        const nextSection = lessonData[currentSectionIndex + 1];
        const firstUnlockedItem = nextSection.items.find(item => !item.lock);
        
        if (firstUnlockedItem) {
            const nextItemIndex = nextSection.items.indexOf(firstUnlockedItem);
            navigateToLesson(nextSection, firstUnlockedItem, nextItemIndex);
            return;
        }
    }

    console.log("✅ No more lessons available");
}, [lessonData, currentLessonId]);

// Helper function สำหรับการนำทาง
const navigateToLesson = (section: any, item: any, itemIndex: number) => {
    const lessonId = `${section.id}-${itemIndex}`;
    
    setCurrentLessonId(lessonId);
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
    
    // อัปเดต sidebar
    intendedAccordionState.current = section.id;
    console.log(`🎯 Navigating to: ${item.title} in section ${section.id}`);
};
```

### ไฟล์: `MOOC7/src/components/courses/lesson/LessonVideo.tsx`

**เพิ่มปุ่ม "ถัดไป" หลังดูวิดีโอเสร็จ:**

```typescript
// เพิ่ม UI สำหรับปุ่มถัดไป (หลังบรรทัด 755)
{showCompletionModal && (
    <div className="lesson-completion-modal">
        <div className="modal-content">
            <h4>🎉 ดูวิดีโอเสร็จแล้ว!</h4>
            <p>คุณได้ดูวิดีโอบทเรียนนี้ครบถ้วนแล้ว</p>
            <div className="modal-actions">
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setShowCompletionModal(false);
                        if (onGoToNextLesson) {
                            onGoToNextLesson();
                        }
                    }}
                >
                    ไปบทเรียนถัดไป
                </button>
                <button 
                    className="btn btn-secondary"
                    onClick={() => setShowCompletionModal(false)}
                >
                    ปิด
                </button>
            </div>
        </div>
    </div>
)}
```

---

## ปัญหาที่ 2: ไม่สามารถส่งคำตอบแบบที่มีไฟล์ได้

### ไฟล์: `MOOC7/src/components/courses/lesson/LessonQuiz.tsx`

**แก้ไข submitQuizAnswers function (บรรทัด 558-766):**

```typescript
const submitQuizAnswers = async () => {
    try {
        setLoading(true);
        const formData = new FormData();

        // จัดรูปแบบคำตอบ
        const answers = questions
            .map((question, index) => {
                if (!question.question_id) {
                    console.error("พบคำถามที่ไม่มี question_id:", question);
                    return null;
                }

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
                    default:
                        return null;
                }

                return answer;
            })
            .filter((a) => a !== null);

        // แปลงคำตอบเป็นรูปแบบที่ API ต้องการ
        answers.forEach((answer, index) => {
            formData.append(`answers[${index}][question_id]`, answer.question_id.toString());

            if (answer.choice_id) {
                formData.append(`answers[${index}][choice_id]`, answer.choice_id.toString());
            }

            if (answer.choice_ids) {
                answer.choice_ids.forEach((id: number, idx: number) => {
                    formData.append(`answers[${index}][choice_ids][${idx}]`, id.toString());
                });
            }

            if (answer.text_answer) {
                formData.append(`answers[${index}][text_answer]`, answer.text_answer);
            }
        });

        // จัดการการอัปโหลดไฟล์
        const allFiles = files.map((f) => f.file);
        allFiles.forEach((file) => {
            formData.append("files", file);
        });

        // สร้าง mapping ของไฟล์กับคำถาม
        let grouped_files_question_ids: { [key: string]: string[] } = {};
        files.forEach((fileObj) => {
            const questionId = fileObj.question_id.toString();
            const fileName = fileObj.file.name;

            if (!grouped_files_question_ids[questionId]) {
                grouped_files_question_ids[questionId] = [];
            }
            grouped_files_question_ids[questionId].push(fileName);
        });

        formData.append("files_question_ids", JSON.stringify(grouped_files_question_ids));
        
        // ส่ง lesson_id สำหรับแบบทดสอบปกติ
        if (lessonId > 0) {
            formData.append("lesson_id", lessonId.toString());
        }
        
        const startTime = new Date().toISOString();
        formData.append("start_time", startTime);

        console.log("🚀 Submitting quiz with files...");
        console.log("Files count:", allFiles.length);
        console.log("Files mapping:", grouped_files_question_ids);

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
            
            // ✅ ตรวจสอบว่ามีไฟล์หรือคำตอบอัตนัยหรือไม่
            const hasFileUploads = files.length > 0;
            const hasEssayQuestions = questions.some(q => q.type === "FB");
            
            if (hasFileUploads || hasEssayQuestions) {
                // ✅ ตั้งสถานะรอตรวจ
                setIsAwaitingReview(true);
                setShowResult(true);
                console.log("✅ Quiz submitted - Awaiting Review");
            } else {
                // ผลลัพธ์ทันที
                setScore(result.score || 0);
                setMaxScore(result.maxScore || 0);
                setIsPassed(result.passed || false);
                setShowResult(true);
                console.log("✅ Quiz submitted - Immediate Result");
            }

            // เรียก onRefreshProgress เพื่ออัปเดต sidebar
            if (onRefreshProgress) {
                setTimeout(() => {
                    onRefreshProgress();
                }, 1000);
            }

        } else {
            throw new Error(response.data.message || "เกิดข้อผิดพลาดในการส่งคำตอบ");
        }

    } catch (error: any) {
        console.error("Error submitting quiz:", error);
        alert(error.message || "เกิดข้อผิดพลาดในการส่งคำตอบ");
    } finally {
        setLoading(false);
    }
};
```

### ไฟล์: `back_creditbank/routes/Courses/Learning.js`

**แก้ไข quiz submission API (บรรทัด 188-786):**

```javascript
router.post(
  "/quiz/:quizId/submit",
  authenticate,
  upload.array("files", 10),
  async (req, res) => {
    const { quizId } = req.params;
    let { answers } = req.body;
    const files = req.files;
    const userId = req.user.id;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // แปลง answers เป็น JSON ถ้ามาในรูปแบบ string
      if (typeof answers === "string") {
        try {
          answers = JSON.parse(answers);
        } catch (e) {
          throw new Error("รูปแบบ answers ไม่ถูกต้อง: JSON parse ล้มเหลว");
        }
      } else if (req.body["answers[0][question_id]"]) {
        // กรณีที่ข้อมูลมาในรูปแบบ FormData แบบ array
        answers = [];
        let i = 0;
        while (req.body[`answers[${i}][question_id]`]) {
          const answer = {
            question_id: parseInt(req.body[`answers[${i}][question_id]`]),
          };

          if (req.body[`answers[${i}][choice_id]`]) {
            answer.choice_id = parseInt(req.body[`answers[${i}][choice_id]`]);
          }

          if (req.body[`answers[${i}][text_answer]`]) {
            answer.text_answer = req.body[`answers[${i}][text_answer]`];
          }

          if (req.body[`answers[${i}][choice_ids][0]`]) {
            answer.choice_ids = [];
            let j = 0;
            while (req.body[`answers[${i}][choice_ids][${j}]`]) {
              answer.choice_ids.push(parseInt(req.body[`answers[${i}][choice_ids][${j}]`]));
              j++;
            }
          }

          answers.push(answer);
          i++;
        }
      }

      if (!Array.isArray(answers)) {
        throw new Error("รูปแบบ answers ไม่ถูกต้อง");
      }

      // ตรวจสอบว่ามีไฟล์หรือคำตอบอัตนัยหรือไม่
      const hasFileUploads = files && files.length > 0;
      const hasEssayQuestions = answers.some(answer => answer.text_answer);
      const needsManualReview = hasFileUploads || hasEssayQuestions;

      console.log("🔍 Quiz submission analysis:");
      console.log("Files count:", files ? files.length : 0);
      console.log("Has essay questions:", hasEssayQuestions);
      console.log("Needs manual review:", needsManualReview);

      // สร้าง attempt
      const attemptResult = await client.query(
        `INSERT INTO quiz_attempts (user_id, quiz_id, start_time, status)
         VALUES ($1, $2, NOW(), $3) RETURNING attempt_id`,
        [userId, quizId, needsManualReview ? 'submitted' : 'completed']
      );

      const attemptId = attemptResult.rows[0].attempt_id;
      let totalScore = 0;
      let maxScore = 0;
      let uploadedFiles = [];

      // ประมวลผลคำตอบ
      for (const answer of answers) {
        const questionResult = await client.query(
          "SELECT question_id, type, score FROM questions WHERE question_id = $1",
          [answer.question_id]
        );

        if (questionResult.rows.length === 0) continue;

        const question = questionResult.rows[0];
        maxScore += question.score;

        const answerResult = await client.query(
          `INSERT INTO quiz_attempt_answers (
            attempt_id, question_id, choice_id, text_answer, is_correct, score_earned
          ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING answer_id`,
          [
            attemptId,
            answer.question_id,
            answer.choice_id || null,
            answer.text_answer || null,
            needsManualReview ? null : false, // null สำหรับรอตรวจ
            needsManualReview ? null : 0     // null สำหรับรอตรวจ
          ]
        );

        const answerId = answerResult.rows[0].answer_id;

        // จัดการไฟล์แนบ
        if (files && files.length > 0) {
          const filesQuestionIds = req.body.files_question_ids ? 
            JSON.parse(req.body.files_question_ids) : {};

          for (const file of files) {
            // ตรวจสอบว่าไฟล์นี้เป็นของคำถามใด
            const questionId = answer.question_id.toString();
            const questionFiles = filesQuestionIds[questionId];
            
            if (questionFiles && questionFiles.includes(file.originalname)) {
              try {
                const uploadResult = await uploadToGoogleDrive(file);
                const fileUrl = uploadResult.webViewLink;
                const fileId = uploadResult.fileId;

                const attachmentResult = await client.query(
                  `INSERT INTO quiz_attachments (
                    quiz_id, user_id, file_url, file_type, file_size, 
                    file_id, file_name, file_path, answer_id
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                  RETURNING attachment_id, file_name, file_url`,
                  [
                    quizId, userId, fileUrl, file.mimetype, file.size,
                    fileId, file.originalname, file.path || `/uploads/${file.filename}`,
                    answerId
                  ]
                );

                uploadedFiles.push({
                  attachment_id: attachmentResult.rows[0].attachment_id,
                  file_name: attachmentResult.rows[0].file_name,
                  file_url: attachmentResult.rows[0].file_url
                });

              } catch (uploadError) {
                console.error("Error uploading file:", uploadError);
              }
            }
          }
        }
      }

      // อัปเดต lesson progress
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

        console.log(`✅ Updated lesson progress: lesson_id=${lessonId}, awaiting_review=${needsManualReview}`);
      }

      // อัปเดต attempt
      await client.query(
        `UPDATE quiz_attempts 
         SET end_time = NOW(), score = $1, max_score = $2, passed = $3, status = $4
         WHERE attempt_id = $5`,
        [
          needsManualReview ? null : totalScore,
          maxScore,
          needsManualReview ? null : (totalScore >= maxScore * 0.8),
          needsManualReview ? 'awaiting_review' : 'completed',
          attemptId
        ]
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        attempt_id: attemptId,
        score: needsManualReview ? null : totalScore,
        maxScore: maxScore,
        passed: needsManualReview ? null : (totalScore >= maxScore * 0.8),
        awaiting_review: needsManualReview,
        uploaded_files: uploadedFiles,
        message: needsManualReview ? 
          "ส่งคำตอบแล้ว รอการตรวจสอบจากอาจารย์" : 
          "ส่งคำตอบเรียบร้อยแล้ว"
      });

    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error submitting quiz:", error);
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

## ปัญหาที่ 3: ห้ามให้มีแบบทดสอบที่มีทั้งปรนัยและอัตนัยรวมกัน

### ไฟล์: `MOOC7/src/forms/Course/Quizzes/AddQuizzes.tsx`

**แก้ไข validation function (บรรทัด 1123-1150):**

```typescript
const validateForm = (): boolean => {
    const newErrors = {
        title: "",
        choices: "",
        correctAnswers: "",
        questionTypes: "" // เพิ่ม error สำหรับ question types
    };
    let isValid = true;

    if (!questionData.title.trim()) {
        newErrors.title = "กรุณาระบุชื่อคำถาม";
        isValid = false;
    }

    // ✅ เพิ่ม validation สำหรับการผสมประเภทคำถาม
    if (questionData.type !== "FB") {
        const correctAnswers = questionData.choices.filter(c => c.isCorrect);
        
        if (questionData.type === "MC" && correctAnswers.length < 2) {
            newErrors.correctAnswers = "ข้อสอบหลายตัวเลือกต้องมีคำตอบที่ถูกต้องอย่างน้อย 2 ข้อ";
            isValid = false;
        } else if ((questionData.type === "SC" || questionData.type === "TF") && correctAnswers.length !== 1) {
            newErrors.correctAnswers = "ต้องเลือกคำตอบที่ถูกต้องเพียง 1 ข้อ";
            isValid = false;
        }
    }

    setErrors(newErrors);
    return isValid;
};

// ✅ เพิ่ม function สำหรับตรวจสอบประเภทคำถามใน quiz
const validateQuizQuestionTypes = (existingQuestions: any[], newQuestionType: string): boolean => {
    if (existingQuestions.length === 0) return true;

    const objectiveTypes = ["SC", "TF", "MC"];
    const subjectiveTypes = ["FB"];

    const hasObjective = existingQuestions.some(q => objectiveTypes.includes(q.type));
    const hasSubjective = existingQuestions.some(q => subjectiveTypes.includes(q.type));

    const newIsObjective = objectiveTypes.includes(newQuestionType);
    const newIsSubjective = subjectiveTypes.includes(newQuestionType);

    // ห้ามผสมระหว่างปรนัยและอัตนัย
    if ((hasObjective && newIsSubjective) || (hasSubjective && newIsObjective)) {
        return false;
    }

    return true;
};
```

### ไฟล์: `back_creditbank/routes/Courses/Questions.js`

**เพิ่ม validation ใน API:**

```javascript
// เพิ่ม validation function
async function validateQuizQuestionTypes(quizId, newQuestionType, client) {
    const existingQuestions = await client.query(`
        SELECT q.type 
        FROM questions q 
        JOIN quiz_questions qq ON q.question_id = qq.question_id 
        WHERE qq.quiz_id = $1
    `, [quizId]);

    if (existingQuestions.rows.length === 0) return true;

    const objectiveTypes = ["SC", "TF", "MC"];
    const subjectiveTypes = ["FB"];

    const hasObjective = existingQuestions.rows.some(q => objectiveTypes.includes(q.type));
    const hasSubjective = existingQuestions.rows.some(q => subjectiveTypes.includes(q.type));

    const newIsObjective = objectiveTypes.includes(newQuestionType);
    const newIsSubjective = subjectiveTypes.includes(newQuestionType);

    // ห้ามผสมระหว่างปรนัยและอัตนัย
    if ((hasObjective && newIsSubjective) || (hasSubjective && newIsObjective)) {
        return false;
    }

    return true;
}

// แก้ไข POST route สำหรับเพิ่มคำถาม
router.post('/', authenticate, restrictTo(2, 3, 4), upload.array('attachments', 10), async (req, res) => {
    // ... existing code ...

    // ✅ เพิ่ม validation สำหรับ quiz types
    if (quizzes && quizzes.length > 0) {
        for (const quizId of quizzes) {
            const isValidType = await validateQuizQuestionTypes(quizId, type, client);
            if (!isValidType) {
                return res.status(400).json({
                    success: false,
                    message: "ไม่สามารถเพิ่มคำถามประเภทนี้ได้ เนื่องจากแบบทดสอบมีคำถามประเภทอื่นอยู่แล้ว (ไม่สามารถผสมปรนัยและอัตนัยในแบบทดสอบเดียวกันได้)"
                });
            }
        }
    }

    // ... rest of the existing code ...
});
```

---

## ปัญหาที่ 4: บางข้อสอบขึ้นก่อนเรียน หรือคลิปแสดงเสร็จแล้วทั้งที่ยังไม่เคยดู

### ไฟล์: `back_creditbank/routes/Courses/Learning.js`

**แก้ไข video progress API (บรรทัด 55-133):**

```javascript
router.post("/lesson/:lessonId/video-progress", authenticate, async (req, res) => {
    const { lessonId } = req.params;
    const { completed } = req.body;
    const userId = req.user.id;

    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");
        
        // ✅ รับเฉพาะ completed status และต้องเป็น true เท่านั้น
        const isCompleted = Boolean(completed) && completed === true;
        
        console.log(`\n🎥 ========================================`);
        console.log(`🎥 VIDEO PROGRESS SUBMISSION`);
        console.log(`🎥 Lesson ID: ${lessonId}`);
        console.log(`🎥 User ID: ${userId}`);
        console.log(`🎥 Completed: ${isCompleted}`);
        console.log(`🎥 ========================================`);
        
        // ✅ เช็คว่า lesson progress มีอยู่แล้วหรือไม่
        const existingProgress = await client.query(`
            SELECT video_completed, overall_completed 
            FROM lesson_progress 
            WHERE user_id = $1 AND lesson_id = $2
        `, [userId, lessonId]);

        if (existingProgress.rows.length > 0) {
            const current = existingProgress.rows[0];
            
            // ✅ อัปเดตเฉพาะเมื่อส่ง completed = true และยังไม่เคยจบ
            if (isCompleted && !current.video_completed) {
                await client.query(`
                    UPDATE lesson_progress 
                    SET 
                        video_completed = true,
                        overall_completed = CASE 
                            WHEN quiz_completed = true THEN true
                            ELSE overall_completed
                        END,
                        updated_at = NOW()
                    WHERE user_id = $1 AND lesson_id = $2
                `, [userId, lessonId]);
                
                console.log(`✅ Updated video progress to completed`);
            } else if (!isCompleted) {
                // ไม่อัปเดตถ้าส่ง completed = false
                console.log(`ℹ️ Ignoring non-completion update`);
            }
        } else if (isCompleted) {
            // ✅ สร้างใหม่เฉพาะเมื่อส่ง completed = true
            await client.query(`
                INSERT INTO lesson_progress (
                    user_id, lesson_id, video_completed, overall_completed, 
                    created_at, updated_at
                )
                VALUES ($1, $2, true, false, NOW(), NOW())
            `, [userId, lessonId]);
            
            console.log(`✅ Created new video progress record`);
        }
        
        await client.query("COMMIT");
        
        res.json({
            success: true,
            message: isCompleted ? "บันทึกความคืบหน้าสำเร็จ" : "ไม่มีการเปลี่ยนแปลง"
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error saving video progress:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการบันทึกความคืบหน้า"
        });
    } finally {
        client.release();
    }
});

// ✅ เพิ่ม GET endpoint สำหรับดึง progress ที่ถูกต้อง
router.get("/lesson/:lessonId/video-progress", authenticate, async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;

    try {
        const result = await pool.query(`
            SELECT video_completed, quiz_completed, overall_completed
            FROM lesson_progress 
            WHERE user_id = $1 AND lesson_id = $2
        `, [userId, lessonId]);

        if (result.rows.length > 0) {
            res.json({
                success: true,
                progress: result.rows[0]
            });
        } else {
            // ✅ ถ้าไม่มีข้อมูล ให้ return progress เป็น false ทั้งหมด
            res.json({
                success: true,
                progress: {
                    video_completed: false,
                    quiz_completed: false,
                    overall_completed: false
                }
            });
        }
    } catch (error) {
        console.error("Error fetching video progress:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการดึงความคืบหน้า"
        });
    }
});
```

### ไฟล์: `MOOC7/src/components/courses/lesson/LessonArea.tsx`

**แก้ไข updateLessonCompletionStatus function (บรรทัด 1402-1486):**

```typescript
const updateLessonCompletionStatus = async (data: SectionData[]) => {
    try {
        let hasChanges = false;
        const updatedLessonData = [...data];

        // สร้าง array ของ promises เพื่อเรียก API พร้อมกัน
        const videoProgressPromises: Promise<{ sectionIndex: number; itemIndex: number; progress: any }>[] = [];

        updatedLessonData.forEach((section, sectionIndex) => {
            section.items.forEach((item, itemIndex) => {
                if (item.type === "video") {
                    const promise = axios.get(
                        `${API_URL}/api/learn/lesson/${item.lesson_id}/video-progress`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    ).then(response => ({
                        sectionIndex,
                        itemIndex,
                        progress: response.data.success ? response.data.progress : null
                    })).catch(error => {
                        console.error(`Error fetching progress for lesson ${item.lesson_id}:`, error);
                        // ✅ Return default false values แทนการ return null
                        return { 
                            sectionIndex, 
                            itemIndex, 
                            progress: {
                                video_completed: false,
                                quiz_completed: false,
                                overall_completed: false
                            }
                        };
                    });
                    
                    videoProgressPromises.push(promise);
                }
            });
        });

        // รอให้ทุก API call เสร็จ
        const progressResults = await Promise.allSettled(videoProgressPromises);

        // อัปเดต state ตามผลลัพธ์
        progressResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const { sectionIndex, itemIndex, progress } = result.value;
                const item = updatedLessonData[sectionIndex].items[itemIndex];
                
                // ✅ ใช้ความระมัดระวังในการอัปเดต completed status
                const shouldBeCompleted = progress && progress.video_completed === true;
                
                if (item.completed !== shouldBeCompleted) {
                    console.log(`🔄 Updating lesson ${item.lesson_id}: ${item.completed} -> ${shouldBeCompleted}`);
                    updatedLessonData[sectionIndex].items[itemIndex] = {
                        ...item,
                        completed: shouldBeCompleted
                    };
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            console.log("📊 Lesson completion status updated");
            setLessonData(updatedLessonData);
        }

    } catch (error) {
        console.error("Error updating lesson completion status:", error);
    }
};
```

---

## ปัญหาที่ 5: เมื่อเรียนเสร็จไม่ขึ้นให้ชำระเงิน

### ไฟล์: `MOOC7/src/components/courses/lesson/LessonArea.tsx`

**แก้ไข updatePaymentStatus function (บรรทัด 1295-1318):**

```typescript
const updatePaymentStatus = useCallback(async () => {
    if (!currentSubjectId || completionStatusSent) return;

    try {
        console.log(`🎯 Checking payment status update: progress=${progress}%`);
        
        // ✅ ตรวจสอบว่าเรียนจบแล้วหรือไม่ (ใช้ >= 100 แทน === 100)
        if (progress >= 100) {
            console.log(`✅ Subject completed! Updating payment status for subject ${currentSubjectId}`);
            
            // อัปเดตสถานะใน enrollments
            const response = await axios.post(
                `${API_URL}/api/learn/subject/${currentSubjectId}/update-completion`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            
            if (response.data.success) {
                console.log("✅ Payment status updated successfully");
                setCompletionStatusSent(true);
                
                // ✅ แจ้งเตือนผู้ใช้
                setTimeout(() => {
                    alert("🎉 คุณได้เรียนจบรายวิชานี้แล้ว! สามารถไปชำระเงินได้ที่หน้า Dashboard");
                }, 1000);
            }
        }
    } catch (error) {
        console.error("Error updating payment status:", error);
    }
}, [currentSubjectId, progress, API_URL, completionStatusSent]);

// ✅ เพิ่ม useEffect เพื่อเช็ค payment status เมื่อ progress เปลี่ยน
useEffect(() => {
    if (progress >= 100 && !completionStatusSent) {
        updatePaymentStatus();
    }
}, [progress, updatePaymentStatus]);
```

### ไฟล์: `back_creditbank/routes/Courses/Learning.js`

**เพิ่ม API endpoint สำหรับอัปเดต completion status:**

```javascript
// ✅ เพิ่ม endpoint สำหรับอัปเดต subject completion
router.post("/subject/:subjectId/update-completion", authenticate, async (req, res) => {
    const { subjectId } = req.params;
    const userId = req.user.id;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // ตรวจสอบว่าผู้ใช้ลงทะเบียนรายวิชานี้หรือไม่
        const enrollmentCheck = await client.query(`
            SELECT enrollment_id, progress_percentage 
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
        
        // ตรวจสอบว่าเรียนจบจริงหรือไม่ (progress >= 100)
        if (enrollment.progress_percentage >= 100) {
            // อัปเดตสถานะเป็น completed
            await client.query(`
                UPDATE enrollments 
                SET 
                    status = 'completed',
                    completion_date = COALESCE(completion_date, NOW()),
                    updated_at = NOW()
                WHERE user_id = $1 AND subject_id = $2
            `, [userId, subjectId]);

            console.log(`✅ Subject ${subjectId} marked as completed for user ${userId}`);

            await client.query("COMMIT");

            res.json({
                success: true,
                message: "อัปเดตสถานะการเรียนจบสำเร็จ"
            });
        } else {
            res.json({
                success: false,
                message: `ยังเรียนไม่จบ (ความคืบหน้า: ${enrollment.progress_percentage}%)`
            });
        }

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error updating completion status:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ"
        });
    } finally {
        client.release();
    }
});
```

---

## ปัญหาที่ 7: ไม่สามารถสมัครแอคเค้าของนักเรียนใน admin ได้

### ไฟล์: `MOOC7/src/forms/Account/AddStudents.tsx`

**แก้ไข handleSubmit function (บรรทัด 351-461):**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            setApiError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
            setIsSubmitting(false);
            return;
        }

        // ✅ ตรวจสอบ education_level ก่อนส่ง
        if (!studentData.educationLevel) {
            setApiError("กรุณาเลือกประเภทการศึกษา");
            setIsSubmitting(false);
            return;
        }

        const baseFormData = {
            username: studentData.username,
            first_name: studentData.firstName,
            last_name: studentData.lastName,
            email: studentData.email,
            password: studentData.password,
            role_id: userType === 0 ? 1 : 1, // นักศึกษา/นักเรียน
            student_code: studentData.studentCode,
            education_level: studentData.educationLevel, // ✅ ต้องมีค่า
        };

        const formData = userType === 0 
            ? {
                // ข้อมูลสำหรับนักศึกษา
                ...baseFormData,
                department_id: parseInt(studentData.department),
                academic_year: parseInt(studentData.academicYear),
                gpa: studentData.gpa ? parseFloat(studentData.gpa) : undefined,
                phone: studentData.phone || undefined,
            }
            : {
                // ข้อมูลสำหรับนักเรียน
                ...baseFormData,
                school_name: studentData.schoolName,
                study_program: studentData.studyProgram === 'อื่น ๆ' ? studentData.studyProgramOther : studentData.studyProgram,
                grade_level: studentData.gradeLevel,
                address: studentData.address,
                gpa: studentData.gpa ? parseFloat(studentData.gpa) : undefined,
                phone: studentData.phone || undefined,
            };

        console.log("📤 Sending registration data:", formData);

        // ส่งข้อมูลไปยัง API
        const response = await axios.post(`${apiURL}/api/auth/register`, formData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.data.success) {
            setApiSuccess("เพิ่มผู้ใช้สำเร็จ");
            
            // แสดง success message
            Swal.fire({
                icon: "success",
                title: "สำเร็จ!",
                text: "เพิ่มข้อมูลผู้ใช้สำเร็จ",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                if (onSubmit) {
                    onSubmit(response.data);
                } else {
                    navigate("/admin-account/students");
                }
            });

            // รีเซ็ตฟอร์ม
            setStudentData({
                firstName: "",
                lastName: "",
                email: "",
                username: "",
                password: "",
                confirmPassword: "",
                studentCode: "",
                department: "",
                educationLevel: "", // ✅ รีเซ็ต
                academicYear: "",
                gpa: "",
                phone: "",
                schoolName: "",
                studyProgram: "",
                studyProgramOther: "",
                gradeLevel: "",
                address: "",
            });

        } else {
            setApiError(response.data.message || "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้");
        }

    } catch (error: any) {
        console.error("Error adding student:", error);
        setApiError(
            error.response?.data?.message || 
            "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้"
        );
    } finally {
        setIsSubmitting(false);
    }
};
```

### ไฟล์: `back_creditbank/routes/register.js`

**แก้ไข validation logic (บรรทัด 44-68):**

```javascript
// ✅ ปรับปรุง validation logic สำหรับ education_level
if (role_id === 1) {
    // ตรวจสอบว่ามี education_level หรือไม่
    if (!education_level) {
        await client.query('ROLLBACK');
        return res.status(400).json({
            success: false,
            message: "กรุณาระบุประเภทการศึกษา"
        });
    }

    // ✅ เฉพาะนักศึกษา (ปริญญาตรี/โท/เอก) ต้องมี academic_year, department_id, student_code
    if (
        (education_level === "ปริญญาตรี" || education_level === "ปริญญาโท" || education_level === "ปริญญาเอก") &&
        (!academic_year || !department_id || !student_code)
    ) {
        await client.query('ROLLBACK');
        return res.status(400).json({
            success: false,
            message: "กรุณาระบุ academic_year, department_id และ student_code สำหรับนักศึกษา"
        });
    }

    // ✅ เฉพาะนักเรียนมัธยม (มัธยมต้น/ปลาย) ต้องมี school_name, grade_level, student_code
    if (
        (education_level === "มัธยมต้น" || education_level === "มัธยมปลาย") &&
        (!school_name || !grade_level || !student_code)
    ) {
        await client.query('ROLLBACK');
        return res.status(400).json({
            success: false,
            message: "กรุณาระบุ school_name, grade_level และ student_code สำหรับนักเรียนมัธยม"
        });
    }
}

// ✅ ตรวจสอบ academic_year ว่าถูกต้อง (1-4) สำหรับนักศึกษาเท่านั้น
if (role_id === 1 && 
    (education_level === "ปริญญาตรี" || education_level === "ปริญญาโท" || education_level === "ปริญญาเอก") &&
    academic_year && (academic_year < 1 || academic_year > 4)) {
    await client.query('ROLLBACK');
    return res.status(400).json({ 
        success: false, 
        message: "ชั้นปีการศึกษาต้องอยู่ระหว่าง 1-4" 
    });
}
```

---

## สรุปการแก้ไข

การแก้ไขเหล่านี้จะช่วยแก้ปัญหาทั้ง 8 ข้อที่ระบุไว้:

1. **Navigation**: ปรับปรุงการนำทางระหว่างบทเรียน
2. **File Submission**: แก้ไขการส่งไฟล์และการแสดงสถานะรอตรวจ
3. **Mixed Quiz Types**: ห้ามการผสมประเภทคำถามในแบบทดสอบเดียวกัน
4. **Progress Tracking**: แก้ไขการติดตาม progress ที่ผิดพลาด
5. **Payment Status**: ปรับปรุงการแสดงสถานะชำระเงิน
6. **Subject Addition**: แก้ไขการเพิ่มรายวิชาในหลักสูตร
7. **Student Registration**: แก้ไข validation ในการสมัครนักเรียน
8. **Admin Functions**: ปรับปรุงฟังก์ชันการจัดการใน admin panel

แต่ละการแก้ไขต้องทำพร้อมกันทั้ง frontend และ backend เพื่อให้ระบบทำงานได้อย่างสมบูรณ์
