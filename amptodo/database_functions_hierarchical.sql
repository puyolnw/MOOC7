-- ✅ Database Functions สำหรับ Hierarchical Score Management
-- ตาม tasks.md - Task 5: เพิ่ม Database Functions

-- 1. ฟังก์ชัน validate_hierarchical_percentages
CREATE OR REPLACE FUNCTION validate_hierarchical_percentages(p_subject_id INTEGER)
RETURNS JSON AS $$
DECLARE
    validation_result JSON;
    total_percentage DECIMAL(5,2) := 0;
    big_lesson_record RECORD;
    big_lesson_total DECIMAL(5,2);
    quiz_percentage DECIMAL(5,2);
    lessons_total DECIMAL(5,2);
    post_test_percentage DECIMAL(5,2) := 0;
    error_messages TEXT[] := ARRAY[]::TEXT[];
    warning_messages TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- ตรวจสอบ Post-test
    SELECT COALESCE(q.weight_percentage, 0)
    INTO post_test_percentage
    FROM subjects s
    LEFT JOIN quizzes q ON s.post_test_id = q.quiz_id
    WHERE s.subject_id = p_subject_id;
    
    -- ตรวจสอบแต่ละ BigLesson
    FOR big_lesson_record IN
        SELECT 
            bl.big_lesson_id,
            bl.title,
            bl.weight_percentage,
            bl.quiz_weight_percentage,
            bl.lessons_total_weight,
            -- คำนวณผลรวมจริงของ lessons
            COALESCE(SUM(l.total_weight_in_biglesson), 0) as actual_lessons_total,
            -- คำนวณผลรวมจริงของ lesson quizzes
            COALESCE(SUM(lq.weight_percentage), 0) as actual_lesson_quizzes_total
        FROM big_lessons bl
        LEFT JOIN lessons l ON bl.big_lesson_id = l.big_lesson_id AND l.status = 'active'
        LEFT JOIN quizzes lq ON l.quiz_id = lq.quiz_id
        WHERE bl.subject_id = p_subject_id
        GROUP BY bl.big_lesson_id, bl.title, bl.weight_percentage, bl.quiz_weight_percentage, bl.lessons_total_weight
    LOOP
        -- คำนวณผลรวมภายใน BigLesson
        big_lesson_total := COALESCE(big_lesson_record.quiz_weight_percentage, 0) + 
                           COALESCE(big_lesson_record.actual_lessons_total, 0) + 
                           COALESCE(big_lesson_record.actual_lesson_quizzes_total, 0);
        
        -- ตรวจสอบความสอดคล้องภายใน BigLesson
        IF big_lesson_total != big_lesson_record.weight_percentage THEN
            error_messages := array_append(error_messages, 
                FORMAT('BigLesson "%s": ผลรวมภายใน (%.1f%%) ไม่เท่ากับน้ำหนักที่กำหนด (%.1f%%)',
                    big_lesson_record.title, big_lesson_total, big_lesson_record.weight_percentage));
        END IF;
        
        -- เพิ่มน้ำหนัก BigLesson เข้าไปในผลรวมทั้งหมด
        total_percentage := total_percentage + COALESCE(big_lesson_record.weight_percentage, 0);
    END LOOP;
    
    -- เพิ่ม Post-test
    total_percentage := total_percentage + post_test_percentage;
    
    -- ตรวจสอบผลรวมทั้งหมด
    IF total_percentage > 100 THEN
        error_messages := array_append(error_messages, 
            FORMAT('เกิน 100%% (รวม %.1f%%)', total_percentage));
    ELSIF total_percentage < 100 THEN
        error_messages := array_append(error_messages, 
            FORMAT('ไม่ครบ 100%% (รวม %.1f%%)', total_percentage));
    END IF;
    
    -- สร้าง JSON response
    validation_result := json_build_object(
        'totalPercentage', total_percentage,
        'isValid', total_percentage = 100 AND array_length(error_messages, 1) IS NULL,
        'errors', COALESCE(error_messages, ARRAY[]::TEXT[]),
        'warnings', COALESCE(warning_messages, ARRAY[]::TEXT[]),
        'postTestPercentage', post_test_percentage,
        'bigLessonsCount', (SELECT COUNT(*) FROM big_lessons WHERE subject_id = p_subject_id)
    );
    
    RETURN validation_result;
END;
$$ LANGUAGE plpgsql;

-- 2. ฟังก์ชัน auto_distribute_hierarchical_weights
CREATE OR REPLACE FUNCTION auto_distribute_hierarchical_weights(
    p_subject_id INTEGER,
    p_reset_before_distribute BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    result_summary JSON;
    big_lessons_count INTEGER;
    auto_big_lessons_count INTEGER;
    weight_per_big_lesson DECIMAL(5,2);
    big_lesson_record RECORD;
    lessons_count INTEGER;
    weight_per_lesson DECIMAL(5,2);
    lesson_quizzes_count INTEGER;
    weight_per_lesson_quiz DECIMAL(5,2);
    messages TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- 1. รีเซ็ตค่าทั้งหมดก่อนถ้าร้องขอ
    IF p_reset_before_distribute THEN
        -- รีเซ็ต BigLessons
        UPDATE big_lessons 
        SET weight_percentage = 0, 
            quiz_weight_percentage = 0, 
            lessons_total_weight = 0,
            is_fixed_weight = FALSE,
            updated_at = NOW() 
        WHERE subject_id = p_subject_id;
        
        -- รีเซ็ต Lessons
        UPDATE lessons 
        SET total_weight_in_biglesson = 0, 
            is_fixed_weight = FALSE,
            updated_at = NOW() 
        WHERE big_lesson_id IN (
            SELECT big_lesson_id FROM big_lessons WHERE subject_id = p_subject_id
        );
        
        -- รีเซ็ต Quizzes (ยกเว้น Pre/Post test)
        UPDATE quizzes 
        SET weight_percentage = 0, 
            is_fixed_weight = FALSE,
            updated_at = NOW() 
        WHERE subject_id = p_subject_id 
        AND quiz_type NOT IN ('pre_lesson', 'post_lesson')
        AND quiz_id NOT IN (
            SELECT COALESCE(pre_test_id, 0) FROM subjects WHERE subject_id = p_subject_id
            UNION
            SELECT COALESCE(post_test_id, 0) FROM subjects WHERE subject_id = p_subject_id
        );
        
        messages := array_append(messages, 'รีเซ็ตค่าทั้งหมดเรียบร้อยแล้ว');
    END IF;
    
    -- 2. นับ BigLessons ที่ไม่ได้ล็อค
    SELECT COUNT(*) INTO big_lessons_count
    FROM big_lessons 
    WHERE subject_id = p_subject_id;
    
    SELECT COUNT(*) INTO auto_big_lessons_count
    FROM big_lessons 
    WHERE subject_id = p_subject_id AND NOT is_fixed_weight;
    
    -- 3. แบ่งน้ำหนัก BigLessons (สมมติ 100% สำหรับ BigLessons, ไม่มี Post-test)
    IF auto_big_lessons_count > 0 THEN
        weight_per_big_lesson := 100.0 / auto_big_lessons_count;
        
        UPDATE big_lessons 
        SET weight_percentage = weight_per_big_lesson,
            updated_at = NOW()
        WHERE subject_id = p_subject_id AND NOT is_fixed_weight;
        
        messages := array_append(messages, 
            FORMAT('แบ่งน้ำหนัก BigLessons: %.1f%% ต่อหน่วย (%d หน่วย)', 
                weight_per_big_lesson, auto_big_lessons_count));
    END IF;
    
    -- 4. แบ่งน้ำหนักภายในแต่ละ BigLesson
    FOR big_lesson_record IN
        SELECT big_lesson_id, title, weight_percentage
        FROM big_lessons 
        WHERE subject_id = p_subject_id
    LOOP
        -- นับส่วนประกอบภายใน BigLesson
        SELECT COUNT(*) INTO lessons_count
        FROM lessons 
        WHERE big_lesson_id = big_lesson_record.big_lesson_id 
        AND status = 'active' 
        AND NOT is_fixed_weight;
        
        -- นับ Lesson Quizzes
        SELECT COUNT(*) INTO lesson_quizzes_count
        FROM lessons l
        JOIN quizzes q ON l.quiz_id = q.quiz_id
        WHERE l.big_lesson_id = big_lesson_record.big_lesson_id 
        AND l.status = 'active'
        AND NOT q.is_fixed_weight;
        
        -- กำหนดสัดส่วนภายใน BigLesson (สมมติ 30% Quiz, 70% Lessons+LessonQuizzes)
        IF lessons_count > 0 OR lesson_quizzes_count > 0 THEN
            -- BigLesson Quiz = 30% ของ BigLesson
            UPDATE big_lessons 
            SET quiz_weight_percentage = big_lesson_record.weight_percentage * 0.3,
                updated_at = NOW()
            WHERE big_lesson_id = big_lesson_record.big_lesson_id;
            
            -- Lessons + Lesson Quizzes = 70% ของ BigLesson
            IF lessons_count > 0 THEN
                weight_per_lesson := (big_lesson_record.weight_percentage * 0.7) / (lessons_count + lesson_quizzes_count);
                
                -- อัปเดท Lessons
                UPDATE lessons 
                SET total_weight_in_biglesson = weight_per_lesson,
                    updated_at = NOW()
                WHERE big_lesson_id = big_lesson_record.big_lesson_id 
                AND status = 'active' 
                AND NOT is_fixed_weight;
                
                -- อัปเดท Lesson Quizzes
                UPDATE quizzes 
                SET weight_percentage = weight_per_lesson,
                    updated_at = NOW()
                WHERE quiz_id IN (
                    SELECT l.quiz_id 
                    FROM lessons l 
                    WHERE l.big_lesson_id = big_lesson_record.big_lesson_id 
                    AND l.status = 'active'
                    AND l.quiz_id IS NOT NULL
                ) AND NOT is_fixed_weight;
                
                -- อัปเดท lessons_total_weight
                UPDATE big_lessons 
                SET lessons_total_weight = (lessons_count * weight_per_lesson),
                    updated_at = NOW()
                WHERE big_lesson_id = big_lesson_record.big_lesson_id;
            END IF;
            
            messages := array_append(messages, 
                FORMAT('BigLesson "%s": แบ่งน้ำหนักภายใน (Quiz: %.1f%%, Lessons: %d รายการ)', 
                    big_lesson_record.title, big_lesson_record.weight_percentage * 0.3, lessons_count));
        END IF;
    END LOOP;
    
    -- 5. สร้าง JSON response
    result_summary := json_build_object(
        'success', TRUE,
        'message', 'แบ่งน้ำหนักอัตโนมัติสำเร็จ',
        'bigLessonsProcessed', big_lessons_count,
        'autoBigLessonsCount', auto_big_lessons_count,
        'weightPerBigLesson', COALESCE(weight_per_big_lesson, 0),
        'details', messages
    );
    
    RETURN result_summary;
END;
$$ LANGUAGE plpgsql;

-- 3. ฟังก์ชัน get_hierarchical_score_structure
CREATE OR REPLACE FUNCTION get_hierarchical_score_structure(p_subject_id INTEGER)
RETURNS JSON AS $$
DECLARE
    score_structure JSON;
    pre_test_data JSON := NULL;
    post_test_data JSON := NULL;
    big_lessons_data JSON;
    total_used DECIMAL(5,2) := 0;
    validation_result JSON;
BEGIN
    -- ดึง Pre-test
    SELECT json_build_object(
        'id', q.quiz_id,
        'title', q.title
    ) INTO pre_test_data
    FROM subjects s
    JOIN quizzes q ON s.pre_test_id = q.quiz_id
    WHERE s.subject_id = p_subject_id;
    
    -- ดึง Post-test
    SELECT json_build_object(
        'id', q.quiz_id,
        'title', q.title,
        'percentage', COALESCE(q.weight_percentage, 0),
        'is_fixed_weight', COALESCE(q.is_fixed_weight, FALSE)
    ) INTO post_test_data
    FROM subjects s
    JOIN quizzes q ON s.post_test_id = q.quiz_id
    WHERE s.subject_id = p_subject_id;
    
    -- ดึง BigLessons พร้อม Lessons
    SELECT json_agg(
        json_build_object(
            'id', bl.big_lesson_id,
            'title', bl.title,
            'weight_percentage', COALESCE(bl.weight_percentage, 0),
            'is_fixed_weight', COALESCE(bl.is_fixed_weight, FALSE),
            'order_number', bl.order_number,
            'quiz', CASE 
                WHEN bl.quiz_id IS NOT NULL THEN json_build_object(
                    'id', blq.quiz_id,
                    'title', blq.title,
                    'percentage', COALESCE(bl.quiz_weight_percentage, 0),
                    'is_fixed_weight', COALESCE(blq.is_fixed_weight, FALSE)
                )
                ELSE NULL
            END,
            'lessons', COALESCE(lessons_data.lessons, '[]'::json)
        ) ORDER BY bl.order_number
    ) INTO big_lessons_data
    FROM big_lessons bl
    LEFT JOIN quizzes blq ON bl.quiz_id = blq.quiz_id
    LEFT JOIN LATERAL (
        SELECT json_agg(
            json_build_object(
                'id', l.lesson_id,
                'title', l.title,
                'percentage', COALESCE(l.total_weight_in_biglesson, 0),
                'is_fixed_weight', COALESCE(l.is_fixed_weight, FALSE),
                'has_video', l.video_url IS NOT NULL,
                'order_number', l.order_number,
                'quiz', CASE 
                    WHEN l.quiz_id IS NOT NULL THEN json_build_object(
                        'id', lq.quiz_id,
                        'title', lq.title,
                        'percentage', COALESCE(lq.weight_percentage, 0),
                        'is_fixed_weight', COALESCE(lq.is_fixed_weight, FALSE)
                    )
                    ELSE NULL
                END
            ) ORDER BY l.order_number
        ) as lessons
        FROM lessons l
        LEFT JOIN quizzes lq ON l.quiz_id = lq.quiz_id
        WHERE l.big_lesson_id = bl.big_lesson_id AND l.status = 'active'
    ) lessons_data ON TRUE
    WHERE bl.subject_id = p_subject_id;
    
    -- คำนวณ total_used
    SELECT COALESCE(SUM(bl.weight_percentage), 0) + 
           COALESCE((SELECT weight_percentage FROM quizzes q JOIN subjects s ON s.post_test_id = q.quiz_id WHERE s.subject_id = p_subject_id), 0)
    INTO total_used
    FROM big_lessons bl
    WHERE bl.subject_id = p_subject_id;
    
    -- Validate
    validation_result := validate_hierarchical_percentages(p_subject_id);
    
    -- สร้าง JSON structure
    score_structure := json_build_object(
        'pre_test', pre_test_data,
        'big_lessons', COALESCE(big_lessons_data, '[]'::json),
        'post_test', post_test_data,
        'total_used', total_used,
        'total_remaining', 100 - total_used,
        'is_valid', (validation_result->>'isValid')::boolean,
        'errors', validation_result->'errors',
        'warnings', validation_result->'warnings'
    );
    
    RETURN score_structure;
END;
$$ LANGUAGE plpgsql;

-- 4. ฟังก์ชัน update_biglesson_calculated_weights (Trigger Helper)
CREATE OR REPLACE FUNCTION update_biglesson_calculated_weights()
RETURNS TRIGGER AS $$
DECLARE
    calculated_total DECIMAL(5,2);
    quiz_weight DECIMAL(5,2);
    lessons_weight DECIMAL(5,2);
BEGIN
    -- คำนวณน้ำหนักจากส่วนประกอบ
    
    -- Quiz weight
    SELECT COALESCE(quiz_weight_percentage, 0) 
    INTO quiz_weight
    FROM big_lessons 
    WHERE big_lesson_id = COALESCE(NEW.big_lesson_id, OLD.big_lesson_id);
    
    -- Lessons weight
    SELECT COALESCE(SUM(total_weight_in_biglesson), 0) +
           COALESCE(SUM(CASE WHEN quiz_id IS NOT NULL THEN 
               (SELECT weight_percentage FROM quizzes WHERE quiz_id = lessons.quiz_id)
           ELSE 0 END), 0)
    INTO lessons_weight
    FROM lessons 
    WHERE big_lesson_id = COALESCE(NEW.big_lesson_id, OLD.big_lesson_id)
    AND status = 'active';
    
    calculated_total := quiz_weight + lessons_weight;
    
    -- อัปเดท BigLesson weight
    UPDATE big_lessons 
    SET weight_percentage = calculated_total,
        lessons_total_weight = lessons_weight,
        updated_at = NOW()
    WHERE big_lesson_id = COALESCE(NEW.big_lesson_id, OLD.big_lesson_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- สร้าง Triggers
DROP TRIGGER IF EXISTS trigger_update_biglesson_weights_on_lesson_change ON lessons;
CREATE TRIGGER trigger_update_biglesson_weights_on_lesson_change
    AFTER INSERT OR UPDATE OR DELETE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_biglesson_calculated_weights();

DROP TRIGGER IF EXISTS trigger_update_biglesson_weights_on_quiz_change ON quizzes;
CREATE TRIGGER trigger_update_biglesson_weights_on_quiz_change
    AFTER UPDATE OF weight_percentage ON quizzes
    FOR EACH ROW
    WHEN (NEW.quiz_id IN (SELECT quiz_id FROM lessons WHERE quiz_id IS NOT NULL))
    EXECUTE FUNCTION update_biglesson_calculated_weights();

-- คอมเมนต์
COMMENT ON FUNCTION validate_hierarchical_percentages(INTEGER) IS 'ตรวจสอบความถูกต้องของน้ำหนักคะแนนแบบ hierarchical';
COMMENT ON FUNCTION auto_distribute_hierarchical_weights(INTEGER, BOOLEAN) IS 'แบ่งน้ำหนักคะแนนอัตโนมัติแบบ hierarchical';
COMMENT ON FUNCTION get_hierarchical_score_structure(INTEGER) IS 'ดึงโครงสร้างคะแนนแบบ hierarchical สำหรับ Subject';
COMMENT ON FUNCTION update_biglesson_calculated_weights() IS 'อัปเดทน้ำหนัก BigLesson อัตโนมัติเมื่อส่วนประกอบเปลี่ยนแปลง';
