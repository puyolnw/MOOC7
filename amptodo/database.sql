--
-- PostgreSQL database cluster dump
--

-- Started on 2025-08-26 21:12:49

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;

--
-- User Configurations
--








--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 17.0

-- Started on 2025-08-26 21:12:50

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Completed on 2025-08-26 21:12:58

--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 17.0

-- Started on 2025-08-26 21:12:58

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1055 (class 1247 OID 24602)
-- Name: question_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.question_category AS ENUM (
    'objective',
    'subjective'
);


ALTER TYPE public.question_category OWNER TO postgres;

--
-- TOC entry 319 (class 1255 OID 25078)
-- Name: auto_distribute_biglesson_weights(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_distribute_biglesson_weights(p_biglesson_id integer) RETURNS TABLE(lesson_id integer, new_weight numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
    quiz_weight DECIMAL(5,2);
    available_weight DECIMAL(5,2);
    fixed_lessons_weight DECIMAL(5,2);
    auto_lessons_count INTEGER;
    auto_weight DECIMAL(5,2);
BEGIN
    -- ดึง BigLesson Quiz weight
    SELECT COALESCE(quiz_weight_percentage, 30) INTO quiz_weight
    FROM big_lessons WHERE big_lesson_id = p_biglesson_id;
    
    -- คำนวณ weight ที่เหลือสำหรับ lessons
    available_weight := 100 - quiz_weight;
    
    -- คำนวณ weight ของ lessons ที่ fix ไว้แล้ว
    SELECT COALESCE(SUM(total_weight_in_biglesson), 0) INTO fixed_lessons_weight
    FROM lessons 
    WHERE big_lesson_id = p_biglesson_id AND is_fixed_weight = true;
    
    -- นับ lessons ที่ไม่ได้ fix weight
    SELECT COUNT(*) INTO auto_lessons_count
    FROM lessons 
    WHERE big_lesson_id = p_biglesson_id AND is_fixed_weight = false;
    
    -- คำนวณ weight สำหรับ auto lessons
    IF auto_lessons_count > 0 THEN
        auto_weight := (available_weight - fixed_lessons_weight) / auto_lessons_count;
    ELSE
        auto_weight := 0;
    END IF;
    
    -- อัปเดต auto lessons
    UPDATE lessons 
    SET total_weight_in_biglesson = auto_weight 
    WHERE big_lesson_id = p_biglesson_id AND is_fixed_weight = false;
    
    -- อัปเดต BigLesson lessons_total_weight
    UPDATE big_lessons 
    SET lessons_total_weight = available_weight
    WHERE big_lesson_id = p_biglesson_id;
    
    -- ส่งคืนผลลัพธ์
    RETURN QUERY
    SELECT l.lesson_id, l.total_weight_in_biglesson
    FROM lessons l WHERE l.big_lesson_id = p_biglesson_id;
END;
$$;


ALTER FUNCTION public.auto_distribute_biglesson_weights(p_biglesson_id integer) OWNER TO postgres;

--
-- TOC entry 316 (class 1255 OID 25123)
-- Name: auto_distribute_hierarchical_weights(integer, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_distribute_hierarchical_weights(p_subject_id integer, p_reset_before_distribute boolean DEFAULT false) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.auto_distribute_hierarchical_weights(p_subject_id integer, p_reset_before_distribute boolean) OWNER TO postgres;

--
-- TOC entry 317 (class 1255 OID 25054)
-- Name: auto_distribute_subject_weights(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_distribute_subject_weights(p_subject_id integer) RETURNS TABLE(item_id integer, item_type text, new_weight numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_fixed_weight DECIMAL(5,2) := 0;
    auto_items_count INTEGER := 0;
    auto_weight DECIMAL(5,2);
BEGIN
    -- คำนวณน้ำหนักที่กำหนดไว้แล้ว (fixed)
    SELECT COALESCE(SUM(weight_percentage), 0) INTO total_fixed_weight
    FROM (
        SELECT weight_percentage FROM quizzes 
        WHERE subject_id = p_subject_id AND is_fixed_weight = true
        UNION ALL
        SELECT weight_percentage FROM lessons 
        WHERE subject_id = p_subject_id AND is_fixed_weight = true
    ) fixed_items;
    
    -- นับจำนวน items ที่ไม่ได้กำหนดน้ำหนัก (auto)
    SELECT COUNT(*) INTO auto_items_count
    FROM (
        SELECT quiz_id FROM quizzes 
        WHERE subject_id = p_subject_id AND is_fixed_weight = false
        UNION ALL
        SELECT lesson_id FROM lessons 
        WHERE subject_id = p_subject_id AND is_fixed_weight = false
    ) auto_items;
    
    -- คำนวณน้ำหนักสำหรับ auto items
    IF auto_items_count > 0 THEN
        auto_weight := (100 - total_fixed_weight) / auto_items_count;
    ELSE
        auto_weight := 0;
    END IF;
    
    -- อัปเดตน้ำหนักสำหรับ quizzes
    UPDATE quizzes 
    SET weight_percentage = auto_weight 
    WHERE subject_id = p_subject_id AND is_fixed_weight = false;
    
    -- อัปเดตน้ำหนักสำหรับ lessons
    UPDATE lessons 
    SET weight_percentage = auto_weight 
    WHERE subject_id = p_subject_id AND is_fixed_weight = false;
    
    -- ส่งคืนผลลัพธ์
    RETURN QUERY
    SELECT quiz_id::INTEGER, 'quiz'::TEXT, weight_percentage
    FROM quizzes WHERE subject_id = p_subject_id
    UNION ALL
    SELECT lesson_id::INTEGER, 'lesson'::TEXT, weight_percentage
    FROM lessons WHERE subject_id = p_subject_id;
END;
$$;


ALTER FUNCTION public.auto_distribute_subject_weights(p_subject_id integer) OWNER TO postgres;

--
-- TOC entry 318 (class 1255 OID 25077)
-- Name: calculate_biglesson_total_weight(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_biglesson_total_weight(p_biglesson_id integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    quiz_weight DECIMAL(5,2);
    lessons_weight DECIMAL(5,2);
    total_weight DECIMAL(5,2);
BEGIN
    -- ดึง quiz weight
    SELECT COALESCE(quiz_weight_percentage, 0) INTO quiz_weight
    FROM big_lessons WHERE big_lesson_id = p_biglesson_id;
    
    -- คำนวณ lessons weight รวม
    SELECT COALESCE(SUM(total_weight_in_biglesson), 0) INTO lessons_weight
    FROM lessons WHERE big_lesson_id = p_biglesson_id;
    
    total_weight := quiz_weight + lessons_weight;
    
    RETURN total_weight;
END;
$$;


ALTER FUNCTION public.calculate_biglesson_total_weight(p_biglesson_id integer) OWNER TO postgres;

--
-- TOC entry 324 (class 1255 OID 25079)
-- Name: calculate_learning_gain(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_learning_gain(p_user_id integer, p_subject_id integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    pre_score DECIMAL(5,2);
    post_score DECIMAL(5,2);
    gain DECIMAL(5,2);
BEGIN
    -- ดึงคะแนน pre-test และ post-test
    SELECT 
        COALESCE(pre_test_percentage, 0),
        COALESCE(post_test_score, 0)
    INTO pre_score, post_score
    FROM enrollments 
    WHERE user_id = p_user_id AND subject_id = p_subject_id;
    
    gain := post_score - pre_score;
    
    -- อัปเดต learning_gain ใน enrollments
    UPDATE enrollments 
    SET learning_gain = gain
    WHERE user_id = p_user_id AND subject_id = p_subject_id;
    
    RETURN gain;
END;
$$;


ALTER FUNCTION public.calculate_learning_gain(p_user_id integer, p_subject_id integer) OWNER TO postgres;

--
-- TOC entry 334 (class 1255 OID 25055)
-- Name: calculate_student_subject_score(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_student_subject_score(p_user_id integer, p_subject_id integer) RETURNS TABLE(total_score numeric, is_passed boolean)
    LANGUAGE plpgsql
    AS $$
DECLARE
    subject_passing_percentage DECIMAL(5,2);
    calculated_total DECIMAL(5,2) := 0;
    quiz_score DECIMAL(5,2);
    lesson_score DECIMAL(5,2);
BEGIN
    -- ดึงเกณฑ์ผ่านของวิชา
    SELECT passing_percentage INTO subject_passing_percentage
    FROM subjects WHERE subject_id = p_subject_id;
    
    -- คำนวณคะแนนจาก quizzes (เฉพาะ post-test)
    SELECT COALESCE(SUM(
        CASE 
            WHEN qa.passed THEN q.weight_percentage 
            ELSE 0 
        END
    ), 0) INTO quiz_score
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.quiz_id
    WHERE qa.user_id = p_user_id 
    AND q.subject_id = p_subject_id
    AND q.quiz_type = 'post_lesson'
    AND qa.is_pre_test = false;
    
    -- คำนวณคะแนนจาก lessons
    SELECT COALESCE(SUM(
        CASE 
            WHEN lp.overall_completed = true THEN l.weight_percentage 
            ELSE 0 
        END
    ), 0) INTO lesson_score
    FROM lesson_progress lp
    JOIN lessons l ON lp.lesson_id = l.lesson_id
    WHERE lp.user_id = p_user_id 
    AND l.subject_id = p_subject_id;
    
    calculated_total := quiz_score + lesson_score;
    
    RETURN QUERY
    SELECT 
        calculated_total,
        calculated_total >= COALESCE(subject_passing_percentage, 80.00);
END;
$$;


ALTER FUNCTION public.calculate_student_subject_score(p_user_id integer, p_subject_id integer) OWNER TO postgres;

--
-- TOC entry 333 (class 1255 OID 24638)
-- Name: generate_course_code(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_course_code(p_department_id integer) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_year VARCHAR := TO_CHAR(CURRENT_DATE + INTERVAL '543 years', 'YY'); -- พ.ศ. 2 หลักท้าย
    v_dept_code VARCHAR;
    v_fac_code VARCHAR;
    v_seq INT;
    v_seq_name TEXT;
    v_code VARCHAR;
BEGIN
    -- ดึง department_code และ faculty_code
    SELECT LPAD(department_code, 2, '0'), LPAD(faculty_code, 2, '0')
      INTO v_dept_code, v_fac_code
      FROM departments
     WHERE department_id = p_department_id;

    -- ตั้งชื่อ sequence ตามปี+faculty_code (ไม่รวม department_code)
    v_seq_name := 'course_seq_' || v_year || '_' || v_fac_code;

    -- สร้าง sequence ถ้ายังไม่มี
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = v_seq_name) THEN
        EXECUTE 'CREATE SEQUENCE ' || v_seq_name || ' START 1;';
    END IF;

    -- ดึงเลข running
    EXECUTE 'SELECT nextval(''' || v_seq_name || ''')' INTO v_seq;

    -- ประกอบรหัส
    v_code := v_year || v_fac_code || v_dept_code || LPAD(v_seq::TEXT, 2, '0');
    RETURN v_code;
END;
$$;


ALTER FUNCTION public.generate_course_code(p_department_id integer) OWNER TO postgres;

--
-- TOC entry 338 (class 1255 OID 25125)
-- Name: get_hierarchical_score_structure(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_hierarchical_score_structure(p_subject_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.get_hierarchical_score_structure(p_subject_id integer) OWNER TO postgres;

--
-- TOC entry 335 (class 1255 OID 25056)
-- Name: log_subject_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_subject_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.passing_percentage != NEW.passing_percentage OR 
           OLD.auto_distribute_score != NEW.auto_distribute_score THEN
            INSERT INTO score_change_logs (
                subject_id, action, old_values, new_values, reason
            ) VALUES (
                NEW.subject_id,
                'update_subject_settings',
                jsonb_build_object(
                    'passing_percentage', OLD.passing_percentage,
                    'auto_distribute_score', OLD.auto_distribute_score
                ),
                jsonb_build_object(
                    'passing_percentage', NEW.passing_percentage,
                    'auto_distribute_score', NEW.auto_distribute_score
                ),
                'Subject settings updated'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_subject_changes() OWNER TO postgres;

--
-- TOC entry 313 (class 1255 OID 24599)
-- Name: reset_user_code_sequence(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reset_user_code_sequence() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXTRACT(YEAR FROM CURRENT_TIMESTAMP) + 543 > (
    SELECT MAX(EXTRACT(YEAR FROM created_at) + 543)
    FROM public.users
  ) THEN
    PERFORM setval('user_code_sequence', 1, false);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.reset_user_code_sequence() OWNER TO postgres;

--
-- TOC entry 336 (class 1255 OID 25082)
-- Name: trigger_calculate_learning_gain(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_calculate_learning_gain() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- คำนวณ learning gain
    PERFORM calculate_learning_gain(NEW.user_id, NEW.subject_id);
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_calculate_learning_gain() OWNER TO postgres;

--
-- TOC entry 331 (class 1255 OID 25080)
-- Name: trigger_update_biglesson_weight(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_update_biglesson_weight() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- เรียกใช้ auto-distribute function เฉพาะเมื่อมี big_lesson_id
    IF NEW.big_lesson_id IS NOT NULL THEN
        PERFORM auto_distribute_biglesson_weights(NEW.big_lesson_id);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_update_biglesson_weight() OWNER TO postgres;

--
-- TOC entry 339 (class 1255 OID 25126)
-- Name: update_biglesson_calculated_weights(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_biglesson_calculated_weights() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.update_biglesson_calculated_weights() OWNER TO postgres;

--
-- TOC entry 4099 (class 0 OID 0)
-- Dependencies: 339
-- Name: FUNCTION update_biglesson_calculated_weights(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.update_biglesson_calculated_weights() IS 'อัปเดทน้ำหนัก BigLesson อัตโนมัติเมื่อส่วนประกอบเปลี่ยนแปลง';


--
-- TOC entry 315 (class 1255 OID 25120)
-- Name: update_managers_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_managers_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_managers_updated_at() OWNER TO postgres;

--
-- TOC entry 314 (class 1255 OID 24956)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- TOC entry 337 (class 1255 OID 25122)
-- Name: validate_hierarchical_percentages(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_hierarchical_percentages(p_subject_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.validate_hierarchical_percentages(p_subject_id integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 260 (class 1259 OID 16993)
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    admin_id integer NOT NULL,
    user_id integer,
    department_id integer,
    "position" character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 16992)
-- Name: admins_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_admin_id_seq OWNER TO postgres;

--
-- TOC entry 4100 (class 0 OID 0)
-- Dependencies: 259
-- Name: admins_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_admin_id_seq OWNED BY public.admins.admin_id;


--
-- TOC entry 306 (class 1259 OID 24960)
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_accounts (
    account_id integer NOT NULL,
    bank_name character varying(255) NOT NULL,
    account_name character varying(255) NOT NULL,
    account_number character varying(50) NOT NULL,
    bank_code character varying(10),
    branch_name character varying(255),
    account_type character varying(50) DEFAULT 'savings'::character varying,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer
);


ALTER TABLE public.bank_accounts OWNER TO postgres;

--
-- TOC entry 305 (class 1259 OID 24959)
-- Name: bank_accounts_account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_accounts_account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_accounts_account_id_seq OWNER TO postgres;

--
-- TOC entry 4101 (class 0 OID 0)
-- Dependencies: 305
-- Name: bank_accounts_account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_accounts_account_id_seq OWNED BY public.bank_accounts.account_id;


--
-- TOC entry 298 (class 1259 OID 24866)
-- Name: banner_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banner_settings (
    setting_id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    setting_type character varying(50) DEFAULT 'text'::character varying,
    description text,
    updated_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.banner_settings OWNER TO postgres;

--
-- TOC entry 4102 (class 0 OID 0)
-- Dependencies: 298
-- Name: TABLE banner_settings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.banner_settings IS 'Table to store banner configuration settings';


--
-- TOC entry 4103 (class 0 OID 0)
-- Dependencies: 298
-- Name: COLUMN banner_settings.setting_key; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banner_settings.setting_key IS 'Unique key for the setting';


--
-- TOC entry 4104 (class 0 OID 0)
-- Dependencies: 298
-- Name: COLUMN banner_settings.setting_value; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banner_settings.setting_value IS 'Value of the setting';


--
-- TOC entry 4105 (class 0 OID 0)
-- Dependencies: 298
-- Name: COLUMN banner_settings.setting_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banner_settings.setting_type IS 'Type of setting (text, image, number, etc.)';


--
-- TOC entry 4106 (class 0 OID 0)
-- Dependencies: 298
-- Name: COLUMN banner_settings.updated_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banner_settings.updated_by IS 'User who last updated this setting';


--
-- TOC entry 297 (class 1259 OID 24865)
-- Name: banner_settings_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banner_settings_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banner_settings_setting_id_seq OWNER TO postgres;

--
-- TOC entry 4107 (class 0 OID 0)
-- Dependencies: 297
-- Name: banner_settings_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banner_settings_setting_id_seq OWNED BY public.banner_settings.setting_id;


--
-- TOC entry 294 (class 1259 OID 24792)
-- Name: big_lesson_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.big_lesson_attachments (
    attachment_id integer NOT NULL,
    big_lesson_id integer NOT NULL,
    title character varying(255),
    file_name character varying(255) NOT NULL,
    file_url text,
    file_type character varying(100),
    file_size integer,
    file_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.big_lesson_attachments OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 24791)
-- Name: big_lesson_attachments_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.big_lesson_attachments_attachment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.big_lesson_attachments_attachment_id_seq OWNER TO postgres;

--
-- TOC entry 4108 (class 0 OID 0)
-- Dependencies: 293
-- Name: big_lesson_attachments_attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.big_lesson_attachments_attachment_id_seq OWNED BY public.big_lesson_attachments.attachment_id;


--
-- TOC entry 291 (class 1259 OID 24686)
-- Name: big_lesson_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.big_lesson_progress (
    progress_id integer NOT NULL,
    user_id integer NOT NULL,
    big_lesson_id integer NOT NULL,
    completed boolean DEFAULT false,
    completion_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.big_lesson_progress OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 24704)
-- Name: big_lesson_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.big_lesson_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.big_lesson_progress_progress_id_seq OWNER TO postgres;

--
-- TOC entry 4109 (class 0 OID 0)
-- Dependencies: 292
-- Name: big_lesson_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.big_lesson_progress_progress_id_seq OWNED BY public.big_lesson_progress.progress_id;


--
-- TOC entry 289 (class 1259 OID 24658)
-- Name: big_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.big_lessons (
    big_lesson_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    order_number integer DEFAULT 1 NOT NULL,
    quiz_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    subject_id integer,
    weight_percentage numeric(5,2) DEFAULT 0,
    is_fixed_weight boolean DEFAULT false,
    quiz_weight_percentage numeric(5,2) DEFAULT 30.00,
    lessons_total_weight numeric(5,2) DEFAULT 70.00
);


ALTER TABLE public.big_lessons OWNER TO postgres;

--
-- TOC entry 4110 (class 0 OID 0)
-- Dependencies: 289
-- Name: COLUMN big_lessons.lessons_total_weight; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.big_lessons.lessons_total_weight IS 'น้ำหนักรวมของ Lessons ใน BigLesson (0-100%)';


--
-- TOC entry 290 (class 1259 OID 24678)
-- Name: big_lessons_big_lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.big_lessons_big_lesson_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.big_lessons_big_lesson_id_seq OWNER TO postgres;

--
-- TOC entry 4111 (class 0 OID 0)
-- Dependencies: 290
-- Name: big_lessons_big_lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.big_lessons_big_lesson_id_seq OWNED BY public.big_lessons.big_lesson_id;


--
-- TOC entry 220 (class 1259 OID 16474)
-- Name: blacklisted_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blacklisted_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.blacklisted_tokens OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16473)
-- Name: blacklisted_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blacklisted_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blacklisted_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 4112 (class 0 OID 0)
-- Dependencies: 219
-- Name: blacklisted_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blacklisted_tokens_id_seq OWNED BY public.blacklisted_tokens.id;


--
-- TOC entry 224 (class 1259 OID 16498)
-- Name: choices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.choices (
    choice_id integer NOT NULL,
    question_id integer NOT NULL,
    text text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    explanation text
);


ALTER TABLE public.choices OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16497)
-- Name: choices_choice_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.choices_choice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.choices_choice_id_seq OWNER TO postgres;

--
-- TOC entry 4113 (class 0 OID 0)
-- Dependencies: 223
-- Name: choices_choice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.choices_choice_id_seq OWNED BY public.choices.choice_id;


--
-- TOC entry 279 (class 1259 OID 24617)
-- Name: course_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_attachments (
    attachment_id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_type character varying(100) NOT NULL,
    file_size integer NOT NULL,
    file_id character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    upload_at timestamp without time zone DEFAULT now() NOT NULL,
    update_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.course_attachments OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 24616)
-- Name: course_attachments_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_attachments_attachment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_attachments_attachment_id_seq OWNER TO postgres;

--
-- TOC entry 4114 (class 0 OID 0)
-- Dependencies: 278
-- Name: course_attachments_attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_attachments_attachment_id_seq OWNED BY public.course_attachments.attachment_id;


--
-- TOC entry 262 (class 1259 OID 17013)
-- Name: course_enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_enrollments (
    enrollment_id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    enrollment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completion_date timestamp without time zone,
    progress_percentage numeric(5,2) DEFAULT 0,
    status character varying(20) DEFAULT 'in_progress'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT course_enrollments_status_check CHECK (((status)::text = ANY (ARRAY[('in_progress'::character varying)::text, ('completed'::character varying)::text, ('dropped'::character varying)::text])))
);


ALTER TABLE public.course_enrollments OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 17012)
-- Name: course_enrollments_enrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_enrollments_enrollment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_enrollments_enrollment_id_seq OWNER TO postgres;

--
-- TOC entry 4115 (class 0 OID 0)
-- Dependencies: 261
-- Name: course_enrollments_enrollment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_enrollments_enrollment_id_seq OWNED BY public.course_enrollments.enrollment_id;


--
-- TOC entry 272 (class 1259 OID 17249)
-- Name: course_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_progress (
    progress_id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    completion_date timestamp without time zone
);


ALTER TABLE public.course_progress OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 17248)
-- Name: course_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_progress_progress_id_seq OWNER TO postgres;

--
-- TOC entry 4116 (class 0 OID 0)
-- Dependencies: 271
-- Name: course_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_progress_progress_id_seq OWNED BY public.course_progress.progress_id;


--
-- TOC entry 280 (class 1259 OID 24640)
-- Name: course_seq_68; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_seq_68
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_seq_68 OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 24646)
-- Name: course_seq_68_01; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_seq_68_01
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_seq_68_01 OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 24644)
-- Name: course_seq_68_02; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_seq_68_02
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_seq_68_02 OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 24642)
-- Name: course_seq_68_03; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_seq_68_03
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_seq_68_03 OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 24641)
-- Name: course_seq_68_04; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_seq_68_04
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_seq_68_04 OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 24650)
-- Name: course_seq_68_05; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_seq_68_05
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_seq_68_05 OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 24643)
-- Name: course_seq_68_06; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_seq_68_06
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_seq_68_06 OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 24649)
-- Name: course_seq_68_07; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_seq_68_07
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_seq_68_07 OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 24648)
-- Name: course_seq_68_09; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_seq_68_09
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_seq_68_09 OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16751)
-- Name: course_subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_subjects (
    course_id integer NOT NULL,
    subject_id integer NOT NULL,
    order_number integer DEFAULT 0
);


ALTER TABLE public.course_subjects OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16741)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(100),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cover_image_path text,
    status character varying(20) DEFAULT 'active'::character varying,
    video_url character varying(255),
    cover_image_file_id text,
    department_id integer,
    course_code character varying(20),
    study_result text,
    manager_id integer
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16740)
-- Name: courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_course_id_seq OWNER TO postgres;

--
-- TOC entry 4117 (class 0 OID 0)
-- Dependencies: 239
-- Name: courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_course_id_seq OWNED BY public.courses.course_id;


--
-- TOC entry 254 (class 1259 OID 16903)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(255),
    faculty character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    department_code character varying(2),
    faculty_code character varying(2)
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 16902)
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_department_id_seq OWNER TO postgres;

--
-- TOC entry 4118 (class 0 OID 0)
-- Dependencies: 253
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- TOC entry 247 (class 1259 OID 16809)
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    enrollment_id integer NOT NULL,
    user_id integer NOT NULL,
    subject_id integer NOT NULL,
    enrollment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completion_date timestamp without time zone,
    progress_percentage integer DEFAULT 0,
    status character varying(20) DEFAULT 'in_progress'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    pre_test_completed boolean DEFAULT false,
    pre_test_score integer DEFAULT 0,
    post_test_completed boolean DEFAULT false,
    post_test_score integer DEFAULT 0,
    total_percentage numeric(5,2) DEFAULT 0,
    is_passed boolean DEFAULT false,
    pre_test_percentage numeric(5,2) DEFAULT 0,
    learning_gain numeric(5,2) DEFAULT 0,
    CONSTRAINT check_pre_test_percentage_range CHECK (((pre_test_percentage >= (0)::numeric) AND (pre_test_percentage <= (100)::numeric))),
    CONSTRAINT check_total_percentage_range CHECK (((total_percentage >= (0)::numeric) AND (total_percentage <= (100)::numeric))),
    CONSTRAINT enrollments_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'dropped'::character varying])::text[])))
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- TOC entry 4119 (class 0 OID 0)
-- Dependencies: 247
-- Name: COLUMN enrollments.learning_gain; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.enrollments.learning_gain IS 'ความก้าวหน้าจากการเรียน (post_test_score - pre_test_percentage)';


--
-- TOC entry 246 (class 1259 OID 16808)
-- Name: enrollments_enrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.enrollments_enrollment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_enrollment_id_seq OWNER TO postgres;

--
-- TOC entry 4120 (class 0 OID 0)
-- Dependencies: 246
-- Name: enrollments_enrollment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.enrollments_enrollment_id_seq OWNED BY public.enrollments.enrollment_id;


--
-- TOC entry 302 (class 1259 OID 24907)
-- Name: images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.images (
    image_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    file_id character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size bigint,
    category character varying(100) DEFAULT 'general'::character varying,
    tags text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.images OWNER TO postgres;

--
-- TOC entry 4121 (class 0 OID 0)
-- Dependencies: 302
-- Name: COLUMN images.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.images.updated_at IS 'Timestamp when the image metadata was last updated';


--
-- TOC entry 301 (class 1259 OID 24906)
-- Name: images_image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.images_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.images_image_id_seq OWNER TO postgres;

--
-- TOC entry 4122 (class 0 OID 0)
-- Dependencies: 301
-- Name: images_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.images_image_id_seq OWNED BY public.images.image_id;


--
-- TOC entry 243 (class 1259 OID 16767)
-- Name: instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructors (
    instructor_id integer NOT NULL,
    name character varying(255) NOT NULL,
    "position" character varying(100),
    avatar_path text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    status character varying(20) DEFAULT 'active'::character varying,
    description text,
    department integer,
    avatar_file_id text,
    ranking_id integer,
    phone character varying(10)
);


ALTER TABLE public.instructors OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16766)
-- Name: instructors_instructor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.instructors_instructor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.instructors_instructor_id_seq OWNER TO postgres;

--
-- TOC entry 4123 (class 0 OID 0)
-- Dependencies: 242
-- Name: instructors_instructor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.instructors_instructor_id_seq OWNED BY public.instructors.instructor_id;


--
-- TOC entry 268 (class 1259 OID 17201)
-- Name: lesson_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_attachments (
    attachment_id integer NOT NULL,
    lesson_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_type character varying(200),
    upload_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    title character varying(255),
    file_url character varying(255),
    file_size integer,
    file_id text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.lesson_attachments OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 17200)
-- Name: lesson_attachments_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesson_attachments_attachment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_attachments_attachment_id_seq OWNER TO postgres;

--
-- TOC entry 4124 (class 0 OID 0)
-- Dependencies: 267
-- Name: lesson_attachments_attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_attachments_attachment_id_seq OWNED BY public.lesson_attachments.attachment_id;


--
-- TOC entry 231 (class 1259 OID 16619)
-- Name: lesson_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_files (
    file_id integer NOT NULL,
    lesson_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_size integer NOT NULL,
    file_type character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    title character varying(255),
    file_url character varying(255)
);


ALTER TABLE public.lesson_files OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16618)
-- Name: lesson_files_file_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesson_files_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_files_file_id_seq OWNER TO postgres;

--
-- TOC entry 4125 (class 0 OID 0)
-- Dependencies: 230
-- Name: lesson_files_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_files_file_id_seq OWNED BY public.lesson_files.file_id;


--
-- TOC entry 235 (class 1259 OID 16685)
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_progress (
    progress_id integer NOT NULL,
    user_id integer NOT NULL,
    lesson_id integer NOT NULL,
    completed boolean DEFAULT false,
    completion_date timestamp without time zone,
    duration_seconds numeric DEFAULT 0,
    last_position_seconds numeric DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    video_completed boolean DEFAULT false,
    video_completion_date timestamp without time zone,
    quiz_completed boolean DEFAULT false,
    quiz_completion_date timestamp without time zone,
    overall_completed boolean DEFAULT false,
    overall_completion_date timestamp without time zone,
    quiz_awaiting_review boolean DEFAULT false
);


ALTER TABLE public.lesson_progress OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16684)
-- Name: lesson_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesson_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_progress_progress_id_seq OWNER TO postgres;

--
-- TOC entry 4126 (class 0 OID 0)
-- Dependencies: 234
-- Name: lesson_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_progress_progress_id_seq OWNED BY public.lesson_progress.progress_id;


--
-- TOC entry 237 (class 1259 OID 16709)
-- Name: lesson_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_sections (
    section_id integer NOT NULL,
    title character varying(255) NOT NULL,
    subject_id integer,
    order_number integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lesson_sections OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16708)
-- Name: lesson_sections_section_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesson_sections_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_sections_section_id_seq OWNER TO postgres;

--
-- TOC entry 4127 (class 0 OID 0)
-- Dependencies: 236
-- Name: lesson_sections_section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_sections_section_id_seq OWNED BY public.lesson_sections.section_id;


--
-- TOC entry 256 (class 1259 OID 16941)
-- Name: lesson_videos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_videos (
    video_id integer NOT NULL,
    lesson_id integer NOT NULL,
    video_url character varying(255) NOT NULL,
    duration integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lesson_videos OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 16940)
-- Name: lesson_videos_video_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesson_videos_video_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_videos_video_id_seq OWNER TO postgres;

--
-- TOC entry 4128 (class 0 OID 0)
-- Dependencies: 255
-- Name: lesson_videos_video_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_videos_video_id_seq OWNED BY public.lesson_videos.video_id;


--
-- TOC entry 229 (class 1259 OID 16601)
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    lesson_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    video_url character varying(255),
    can_preview boolean DEFAULT false,
    has_quiz boolean DEFAULT false,
    quiz_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    duration integer,
    created_by integer,
    video_file_id character varying(255),
    status character varying(20) DEFAULT 'active'::character varying,
    big_lesson_id integer,
    order_number integer DEFAULT 1 NOT NULL,
    weight_percentage numeric(5,2) DEFAULT 0,
    is_fixed_weight boolean DEFAULT false,
    subject_id integer,
    video_weight_percentage numeric(5,2) DEFAULT 50.00,
    quiz_weight_percentage numeric(5,2) DEFAULT 50.00,
    total_weight_in_biglesson numeric(5,2) DEFAULT 0,
    CONSTRAINT check_lesson_weight_percentage_range CHECK (((weight_percentage >= (0)::numeric) AND (weight_percentage <= (100)::numeric)))
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- TOC entry 4129 (class 0 OID 0)
-- Dependencies: 229
-- Name: COLUMN lessons.total_weight_in_biglesson; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.lessons.total_weight_in_biglesson IS 'น้ำหนักของ Lesson ใน BigLesson (0-100%)';


--
-- TOC entry 228 (class 1259 OID 16600)
-- Name: lessons_lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessons_lesson_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_lesson_id_seq OWNER TO postgres;

--
-- TOC entry 4130 (class 0 OID 0)
-- Dependencies: 228
-- Name: lessons_lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_lesson_id_seq OWNED BY public.lessons.lesson_id;


--
-- TOC entry 312 (class 1259 OID 25089)
-- Name: managers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.managers (
    manager_id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    "position" character varying(255),
    department integer,
    description text,
    phone character varying(20),
    avatar_path text,
    avatar_file_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.managers OWNER TO postgres;

--
-- TOC entry 311 (class 1259 OID 25088)
-- Name: managers_manager_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.managers_manager_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.managers_manager_id_seq OWNER TO postgres;

--
-- TOC entry 4131 (class 0 OID 0)
-- Dependencies: 311
-- Name: managers_manager_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.managers_manager_id_seq OWNED BY public.managers.manager_id;


--
-- TOC entry 300 (class 1259 OID 24887)
-- Name: page_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_settings (
    setting_id integer NOT NULL,
    page_name character varying(50) NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    setting_type character varying(50) DEFAULT 'text'::character varying,
    description text,
    updated_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.page_settings OWNER TO postgres;

--
-- TOC entry 4132 (class 0 OID 0)
-- Dependencies: 300
-- Name: COLUMN page_settings.setting_value; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.page_settings.setting_value IS 'Value of the setting';


--
-- TOC entry 299 (class 1259 OID 24886)
-- Name: page_settings_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.page_settings_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.page_settings_setting_id_seq OWNER TO postgres;

--
-- TOC entry 4133 (class 0 OID 0)
-- Dependencies: 299
-- Name: page_settings_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.page_settings_setting_id_seq OWNED BY public.page_settings.setting_id;


--
-- TOC entry 308 (class 1259 OID 24992)
-- Name: question_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_attachments (
    attachment_id integer NOT NULL,
    question_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    file_url text NOT NULL,
    file_size bigint,
    mime_type character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.question_attachments OWNER TO postgres;

--
-- TOC entry 4134 (class 0 OID 0)
-- Dependencies: 308
-- Name: COLUMN question_attachments.mime_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.question_attachments.mime_type IS 'MIME type of the file';


--
-- TOC entry 307 (class 1259 OID 24991)
-- Name: question_attachments_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_attachments_attachment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_attachments_attachment_id_seq OWNER TO postgres;

--
-- TOC entry 4135 (class 0 OID 0)
-- Dependencies: 307
-- Name: question_attachments_attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_attachments_attachment_id_seq OWNED BY public.question_attachments.attachment_id;


--
-- TOC entry 222 (class 1259 OID 16484)
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    question_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type character varying(10) NOT NULL,
    score integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    question_text text,
    category public.question_category DEFAULT 'objective'::public.question_category NOT NULL,
    shuffle_choices boolean DEFAULT false,
    show_explanation boolean DEFAULT false,
    accepted_answers jsonb,
    max_words integer,
    rubric jsonb,
    auto_grade boolean DEFAULT true,
    CONSTRAINT questions_type_check CHECK (((type)::text = ANY ((ARRAY['TF'::character varying, 'MC'::character varying, 'SC'::character varying, 'FB'::character varying])::text[])))
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16483)
-- Name: questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_question_id_seq OWNER TO postgres;

--
-- TOC entry 4136 (class 0 OID 0)
-- Dependencies: 221
-- Name: questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_question_id_seq OWNED BY public.questions.question_id;


--
-- TOC entry 274 (class 1259 OID 17288)
-- Name: quiz_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_attachments (
    attachment_id integer NOT NULL,
    quiz_id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255),
    file_url text NOT NULL,
    file_type character varying(100) NOT NULL,
    file_size integer NOT NULL,
    file_id character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    answer_id integer
);


ALTER TABLE public.quiz_attachments OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 17287)
-- Name: quiz_attachments_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_attachments_attachment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_attachments_attachment_id_seq OWNER TO postgres;

--
-- TOC entry 4137 (class 0 OID 0)
-- Dependencies: 273
-- Name: quiz_attachments_attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_attachments_attachment_id_seq OWNED BY public.quiz_attachments.attachment_id;


--
-- TOC entry 251 (class 1259 OID 16860)
-- Name: quiz_attempt_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_attempt_answers (
    answer_id integer NOT NULL,
    attempt_id integer NOT NULL,
    question_id integer NOT NULL,
    choice_id integer,
    text_answer text,
    is_correct boolean DEFAULT false,
    score_earned integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    has_attachments boolean DEFAULT false
);


ALTER TABLE public.quiz_attempt_answers OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 16859)
-- Name: quiz_attempt_answers_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_attempt_answers_answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_attempt_answers_answer_id_seq OWNER TO postgres;

--
-- TOC entry 4138 (class 0 OID 0)
-- Dependencies: 250
-- Name: quiz_attempt_answers_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_attempt_answers_answer_id_seq OWNED BY public.quiz_attempt_answers.answer_id;


--
-- TOC entry 249 (class 1259 OID 16835)
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_attempts (
    attempt_id integer NOT NULL,
    user_id integer NOT NULL,
    quiz_id integer NOT NULL,
    start_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    end_time timestamp without time zone,
    score integer DEFAULT 0,
    max_score integer DEFAULT 0,
    passed boolean DEFAULT false,
    status character varying(20) DEFAULT 'in_progress'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_pre_test boolean DEFAULT false,
    affects_grade boolean DEFAULT true,
    CONSTRAINT quiz_attempts_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'awaiting_review'::character varying])::text[])))
);


ALTER TABLE public.quiz_attempts OWNER TO postgres;

--
-- TOC entry 4139 (class 0 OID 0)
-- Dependencies: 249
-- Name: COLUMN quiz_attempts.affects_grade; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.quiz_attempts.affects_grade IS 'ระบุว่า attempt นี้นับคะแนนหรือไม่ (false สำหรับ pre-test)';


--
-- TOC entry 248 (class 1259 OID 16834)
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_attempts_attempt_id_seq OWNER TO postgres;

--
-- TOC entry 4140 (class 0 OID 0)
-- Dependencies: 248
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_attempts_attempt_id_seq OWNED BY public.quiz_attempts.attempt_id;


--
-- TOC entry 252 (class 1259 OID 16887)
-- Name: quiz_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_lessons (
    quiz_id integer NOT NULL,
    lesson_id integer NOT NULL
);


ALTER TABLE public.quiz_lessons OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 17063)
-- Name: quiz_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_progress (
    progress_id integer NOT NULL,
    user_id integer NOT NULL,
    quiz_id integer NOT NULL,
    completed boolean DEFAULT false,
    completion_date timestamp without time zone,
    score integer DEFAULT 0,
    passing_score integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    passed boolean DEFAULT false,
    awaiting_review boolean DEFAULT false
);


ALTER TABLE public.quiz_progress OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 17062)
-- Name: quiz_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_progress_progress_id_seq OWNER TO postgres;

--
-- TOC entry 4141 (class 0 OID 0)
-- Dependencies: 265
-- Name: quiz_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_progress_progress_id_seq OWNED BY public.quiz_progress.progress_id;


--
-- TOC entry 227 (class 1259 OID 16584)
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_questions (
    quiz_id integer NOT NULL,
    question_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quiz_questions OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16564)
-- Name: quizzes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quizzes (
    quiz_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    time_limit_enabled boolean DEFAULT false,
    time_limit_value integer DEFAULT 60,
    time_limit_unit character varying(10) DEFAULT 'minutes'::character varying,
    passing_score_enabled boolean DEFAULT false,
    passing_score_value integer DEFAULT 0,
    attempts_limited boolean DEFAULT true,
    attempts_unlimited boolean DEFAULT false,
    attempts_value integer DEFAULT 1,
    status character varying(10) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    type character varying(50),
    created_by character varying(255) DEFAULT 'Admin'::character varying NOT NULL,
    weight_percentage numeric(5,2) DEFAULT 0,
    is_fixed_weight boolean DEFAULT false,
    quiz_type character varying(20) DEFAULT 'post_lesson'::character varying,
    subject_id integer,
    CONSTRAINT check_quiz_weight_percentage_range CHECK (((weight_percentage >= (0)::numeric) AND (weight_percentage <= (100)::numeric))),
    CONSTRAINT quizzes_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'draft'::character varying])::text[])))
);


ALTER TABLE public.quizzes OWNER TO postgres;

--
-- TOC entry 4142 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN quizzes.quiz_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.quizzes.quiz_type IS 'ประเภทแบบทดสอบ: pre_lesson, post_lesson';


--
-- TOC entry 225 (class 1259 OID 16563)
-- Name: quizzes_quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quizzes_quiz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quizzes_quiz_id_seq OWNER TO postgres;

--
-- TOC entry 4143 (class 0 OID 0)
-- Dependencies: 225
-- Name: quizzes_quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quizzes_quiz_id_seq OWNED BY public.quizzes.quiz_id;


--
-- TOC entry 276 (class 1259 OID 17318)
-- Name: rankings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rankings (
    ranking_id integer NOT NULL,
    ranking_name character varying(50) NOT NULL
);


ALTER TABLE public.rankings OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 17317)
-- Name: rankings_ranking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rankings_ranking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rankings_ranking_id_seq OWNER TO postgres;

--
-- TOC entry 4144 (class 0 OID 0)
-- Dependencies: 275
-- Name: rankings_ranking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rankings_ranking_id_seq OWNED BY public.rankings.ranking_id;


--
-- TOC entry 216 (class 1259 OID 16445)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16444)
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_role_id_seq OWNER TO postgres;

--
-- TOC entry 4145 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- TOC entry 296 (class 1259 OID 24813)
-- Name: school_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school_students (
    school_student_id integer NOT NULL,
    user_id integer,
    student_code character varying(20) NOT NULL,
    school_name character varying(150),
    study_program character varying(50),
    grade_level character varying(10),
    address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phone character varying(20),
    gpa numeric(3,2),
    CONSTRAINT school_students_gpa_check CHECK (((gpa >= 0.00) AND (gpa <= 4.00)))
);


ALTER TABLE public.school_students OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 24812)
-- Name: school_students_school_student_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.school_students_school_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.school_students_school_student_id_seq OWNER TO postgres;

--
-- TOC entry 4146 (class 0 OID 0)
-- Dependencies: 295
-- Name: school_students_school_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.school_students_school_student_id_seq OWNED BY public.school_students.school_student_id;


--
-- TOC entry 310 (class 1259 OID 25033)
-- Name: score_change_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.score_change_logs (
    log_id integer NOT NULL,
    subject_id integer,
    user_id integer,
    action character varying(50) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.score_change_logs OWNER TO postgres;

--
-- TOC entry 4147 (class 0 OID 0)
-- Dependencies: 310
-- Name: TABLE score_change_logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.score_change_logs IS 'Log การเปลี่ยนแปลงคะแนนและการตั้งค่าต่างๆ สำหรับ audit trail';


--
-- TOC entry 309 (class 1259 OID 25032)
-- Name: score_change_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.score_change_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.score_change_logs_log_id_seq OWNER TO postgres;

--
-- TOC entry 4148 (class 0 OID 0)
-- Dependencies: 309
-- Name: score_change_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.score_change_logs_log_id_seq OWNED BY public.score_change_logs.log_id;


--
-- TOC entry 238 (class 1259 OID 16723)
-- Name: section_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section_lessons (
    section_id integer NOT NULL,
    lesson_id integer NOT NULL,
    order_number integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.section_lessons OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 16974)
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    student_id integer NOT NULL,
    user_id integer,
    student_code character varying(20),
    department_id integer,
    education_level character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    academic_year integer,
    gpa numeric(3,2),
    phone character varying(20),
    CONSTRAINT students_gpa_check CHECK (((gpa >= 0.00) AND (gpa <= 4.00)))
);


ALTER TABLE public.students OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 16973)
-- Name: students_student_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_student_id_seq OWNER TO postgres;

--
-- TOC entry 4149 (class 0 OID 0)
-- Dependencies: 257
-- Name: students_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_student_id_seq OWNED BY public.students.student_id;


--
-- TOC entry 244 (class 1259 OID 16777)
-- Name: subject_instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_instructors (
    subject_id integer NOT NULL,
    instructor_id integer NOT NULL
);


ALTER TABLE public.subject_instructors OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16792)
-- Name: subject_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_lessons (
    subject_id integer NOT NULL,
    lesson_id integer NOT NULL,
    order_number integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.subject_lessons OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 24927)
-- Name: subject_payment_slips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_payment_slips (
    id integer NOT NULL,
    subject_id integer NOT NULL,
    user_id integer NOT NULL,
    slip_url text NOT NULL,
    file_id text,
    file_name text NOT NULL,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    approved boolean DEFAULT false,
    approved_at timestamp with time zone,
    approved_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    rejected_at timestamp with time zone,
    rejected_by integer,
    rejection_reason text
);


ALTER TABLE public.subject_payment_slips OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 24926)
-- Name: subject_payment_slips_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subject_payment_slips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subject_payment_slips_id_seq OWNER TO postgres;

--
-- TOC entry 4150 (class 0 OID 0)
-- Dependencies: 303
-- Name: subject_payment_slips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subject_payment_slips_id_seq OWNED BY public.subject_payment_slips.id;


--
-- TOC entry 264 (class 1259 OID 17026)
-- Name: subject_prerequisites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_prerequisites (
    id integer NOT NULL,
    subject_id integer NOT NULL,
    prerequisite_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subject_prerequisites OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 17025)
-- Name: subject_prerequisites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subject_prerequisites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subject_prerequisites_id_seq OWNER TO postgres;

--
-- TOC entry 4151 (class 0 OID 0)
-- Dependencies: 263
-- Name: subject_prerequisites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subject_prerequisites_id_seq OWNED BY public.subject_prerequisites.id;


--
-- TOC entry 233 (class 1259 OID 16645)
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    subject_id integer NOT NULL,
    code character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    credits integer DEFAULT 3 NOT NULL,
    department integer,
    cover_image text,
    allow_all_lessons boolean DEFAULT true,
    pre_test_id integer,
    post_test_id integer,
    status character varying(10) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    video_url character varying(255),
    cover_image_file_id text,
    passing_percentage numeric(5,2) DEFAULT 80.00,
    auto_distribute_score boolean DEFAULT false,
    CONSTRAINT check_passing_percentage_range CHECK (((passing_percentage >= (0)::numeric) AND (passing_percentage <= (100)::numeric))),
    CONSTRAINT subjects_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'draft'::character varying])::text[])))
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- TOC entry 4152 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN subjects.auto_distribute_score; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.subjects.auto_distribute_score IS 'เปิดใช้งานระบบแบ่งคะแนนอัตโนมัติหรือไม่';


--
-- TOC entry 232 (class 1259 OID 16644)
-- Name: subjects_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjects_subject_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_subject_id_seq OWNER TO postgres;

--
-- TOC entry 4153 (class 0 OID 0)
-- Dependencies: 232
-- Name: subjects_subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjects_subject_id_seq OWNED BY public.subjects.subject_id;


--
-- TOC entry 277 (class 1259 OID 24596)
-- Name: user_code_sequence; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_code_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_code_sequence OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16457)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role_id integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    username character varying(50),
    first_name character varying(50),
    last_name character varying(50),
    name character varying(255),
    user_code character varying(8)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16456)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 4154 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 270 (class 1259 OID 17234)
-- Name: video_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.video_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    lesson_id integer NOT NULL,
    watched_seconds double precision DEFAULT 0,
    video_duration double precision DEFAULT 0,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.video_progress OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 17233)
-- Name: video_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.video_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.video_progress_id_seq OWNER TO postgres;

--
-- TOC entry 4155 (class 0 OID 0)
-- Dependencies: 269
-- Name: video_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.video_progress_id_seq OWNED BY public.video_progress.id;


--
-- TOC entry 3622 (class 2604 OID 16996)
-- Name: admins admin_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN admin_id SET DEFAULT nextval('public.admins_admin_id_seq'::regclass);


--
-- TOC entry 3694 (class 2604 OID 24963)
-- Name: bank_accounts account_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN account_id SET DEFAULT nextval('public.bank_accounts_account_id_seq'::regclass);


--
-- TOC entry 3677 (class 2604 OID 24869)
-- Name: banner_settings setting_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banner_settings ALTER COLUMN setting_id SET DEFAULT nextval('public.banner_settings_setting_id_seq'::regclass);


--
-- TOC entry 3671 (class 2604 OID 24795)
-- Name: big_lesson_attachments attachment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lesson_attachments ALTER COLUMN attachment_id SET DEFAULT nextval('public.big_lesson_attachments_attachment_id_seq'::regclass);


--
-- TOC entry 3667 (class 2604 OID 24705)
-- Name: big_lesson_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lesson_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.big_lesson_progress_progress_id_seq'::regclass);


--
-- TOC entry 3659 (class 2604 OID 24679)
-- Name: big_lessons big_lesson_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lessons ALTER COLUMN big_lesson_id SET DEFAULT nextval('public.big_lessons_big_lesson_id_seq'::regclass);


--
-- TOC entry 3506 (class 2604 OID 16477)
-- Name: blacklisted_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens ALTER COLUMN id SET DEFAULT nextval('public.blacklisted_tokens_id_seq'::regclass);


--
-- TOC entry 3516 (class 2604 OID 16501)
-- Name: choices choice_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.choices ALTER COLUMN choice_id SET DEFAULT nextval('public.choices_choice_id_seq'::regclass);


--
-- TOC entry 3656 (class 2604 OID 24620)
-- Name: course_attachments attachment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_attachments ALTER COLUMN attachment_id SET DEFAULT nextval('public.course_attachments_attachment_id_seq'::regclass);


--
-- TOC entry 3625 (class 2604 OID 17016)
-- Name: course_enrollments enrollment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_enrollments ALTER COLUMN enrollment_id SET DEFAULT nextval('public.course_enrollments_enrollment_id_seq'::regclass);


--
-- TOC entry 3649 (class 2604 OID 17252)
-- Name: course_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.course_progress_progress_id_seq'::regclass);


--
-- TOC entry 3574 (class 2604 OID 16744)
-- Name: courses course_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN course_id SET DEFAULT nextval('public.courses_course_id_seq'::regclass);


--
-- TOC entry 3613 (class 2604 OID 16906)
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- TOC entry 3584 (class 2604 OID 16812)
-- Name: enrollments enrollment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN enrollment_id SET DEFAULT nextval('public.enrollments_enrollment_id_seq'::regclass);


--
-- TOC entry 3685 (class 2604 OID 24910)
-- Name: images image_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images ALTER COLUMN image_id SET DEFAULT nextval('public.images_image_id_seq'::regclass);


--
-- TOC entry 3579 (class 2604 OID 16770)
-- Name: instructors instructor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors ALTER COLUMN instructor_id SET DEFAULT nextval('public.instructors_instructor_id_seq'::regclass);


--
-- TOC entry 3641 (class 2604 OID 17204)
-- Name: lesson_attachments attachment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_attachments ALTER COLUMN attachment_id SET DEFAULT nextval('public.lesson_attachments_attachment_id_seq'::regclass);


--
-- TOC entry 3549 (class 2604 OID 16622)
-- Name: lesson_files file_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_files ALTER COLUMN file_id SET DEFAULT nextval('public.lesson_files_file_id_seq'::regclass);


--
-- TOC entry 3559 (class 2604 OID 16688)
-- Name: lesson_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.lesson_progress_progress_id_seq'::regclass);


--
-- TOC entry 3569 (class 2604 OID 16712)
-- Name: lesson_sections section_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_sections ALTER COLUMN section_id SET DEFAULT nextval('public.lesson_sections_section_id_seq'::regclass);


--
-- TOC entry 3615 (class 2604 OID 16944)
-- Name: lesson_videos video_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_videos ALTER COLUMN video_id SET DEFAULT nextval('public.lesson_videos_video_id_seq'::regclass);


--
-- TOC entry 3537 (class 2604 OID 16604)
-- Name: lessons lesson_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN lesson_id SET DEFAULT nextval('public.lessons_lesson_id_seq'::regclass);


--
-- TOC entry 3706 (class 2604 OID 25092)
-- Name: managers manager_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.managers ALTER COLUMN manager_id SET DEFAULT nextval('public.managers_manager_id_seq'::regclass);


--
-- TOC entry 3681 (class 2604 OID 24890)
-- Name: page_settings setting_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_settings ALTER COLUMN setting_id SET DEFAULT nextval('public.page_settings_setting_id_seq'::regclass);


--
-- TOC entry 3700 (class 2604 OID 24995)
-- Name: question_attachments attachment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_attachments ALTER COLUMN attachment_id SET DEFAULT nextval('public.question_attachments_attachment_id_seq'::regclass);


--
-- TOC entry 3508 (class 2604 OID 16487)
-- Name: questions question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN question_id SET DEFAULT nextval('public.questions_question_id_seq'::regclass);


--
-- TOC entry 3653 (class 2604 OID 17291)
-- Name: quiz_attachments attachment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attachments ALTER COLUMN attachment_id SET DEFAULT nextval('public.quiz_attachments_attachment_id_seq'::regclass);


--
-- TOC entry 3608 (class 2604 OID 16863)
-- Name: quiz_attempt_answers answer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers ALTER COLUMN answer_id SET DEFAULT nextval('public.quiz_attempt_answers_answer_id_seq'::regclass);


--
-- TOC entry 3598 (class 2604 OID 16838)
-- Name: quiz_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.quiz_attempts_attempt_id_seq'::regclass);


--
-- TOC entry 3633 (class 2604 OID 17066)
-- Name: quiz_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.quiz_progress_progress_id_seq'::regclass);


--
-- TOC entry 3520 (class 2604 OID 16567)
-- Name: quizzes quiz_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN quiz_id SET DEFAULT nextval('public.quizzes_quiz_id_seq'::regclass);


--
-- TOC entry 3655 (class 2604 OID 17321)
-- Name: rankings ranking_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rankings ALTER COLUMN ranking_id SET DEFAULT nextval('public.rankings_ranking_id_seq'::regclass);


--
-- TOC entry 3499 (class 2604 OID 16448)
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- TOC entry 3674 (class 2604 OID 24816)
-- Name: school_students school_student_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_students ALTER COLUMN school_student_id SET DEFAULT nextval('public.school_students_school_student_id_seq'::regclass);


--
-- TOC entry 3703 (class 2604 OID 25036)
-- Name: score_change_logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_change_logs ALTER COLUMN log_id SET DEFAULT nextval('public.score_change_logs_log_id_seq'::regclass);


--
-- TOC entry 3619 (class 2604 OID 16977)
-- Name: students student_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN student_id SET DEFAULT nextval('public.students_student_id_seq'::regclass);


--
-- TOC entry 3689 (class 2604 OID 24930)
-- Name: subject_payment_slips id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_payment_slips ALTER COLUMN id SET DEFAULT nextval('public.subject_payment_slips_id_seq'::regclass);


--
-- TOC entry 3631 (class 2604 OID 17029)
-- Name: subject_prerequisites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites ALTER COLUMN id SET DEFAULT nextval('public.subject_prerequisites_id_seq'::regclass);


--
-- TOC entry 3551 (class 2604 OID 16648)
-- Name: subjects subject_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN subject_id SET DEFAULT nextval('public.subjects_subject_id_seq'::regclass);


--
-- TOC entry 3501 (class 2604 OID 16460)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 3645 (class 2604 OID 17237)
-- Name: video_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_progress ALTER COLUMN id SET DEFAULT nextval('public.video_progress_id_seq'::regclass);


--
-- TOC entry 3798 (class 2606 OID 17000)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 3857 (class 2606 OID 24974)
-- Name: bank_accounts bank_accounts_account_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_account_number_key UNIQUE (account_number);


--
-- TOC entry 3859 (class 2606 OID 24972)
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (account_id);


--
-- TOC entry 3836 (class 2606 OID 24876)
-- Name: banner_settings banner_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banner_settings
    ADD CONSTRAINT banner_settings_pkey PRIMARY KEY (setting_id);


--
-- TOC entry 3838 (class 2606 OID 24878)
-- Name: banner_settings banner_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banner_settings
    ADD CONSTRAINT banner_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 3830 (class 2606 OID 24801)
-- Name: big_lesson_attachments big_lesson_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lesson_attachments
    ADD CONSTRAINT big_lesson_attachments_pkey PRIMARY KEY (attachment_id);


--
-- TOC entry 3828 (class 2606 OID 24693)
-- Name: big_lesson_progress big_lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lesson_progress
    ADD CONSTRAINT big_lesson_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 3826 (class 2606 OID 24667)
-- Name: big_lessons big_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lessons
    ADD CONSTRAINT big_lessons_pkey PRIMARY KEY (big_lesson_id);


--
-- TOC entry 3734 (class 2606 OID 16482)
-- Name: blacklisted_tokens blacklisted_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens
    ADD CONSTRAINT blacklisted_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 16508)
-- Name: choices choices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.choices
    ADD CONSTRAINT choices_pkey PRIMARY KEY (choice_id);


--
-- TOC entry 3824 (class 2606 OID 24626)
-- Name: course_attachments course_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_attachments
    ADD CONSTRAINT course_attachments_pkey PRIMARY KEY (attachment_id);


--
-- TOC entry 3800 (class 2606 OID 17024)
-- Name: course_enrollments course_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (enrollment_id);


--
-- TOC entry 3816 (class 2606 OID 17257)
-- Name: course_progress course_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_progress
    ADD CONSTRAINT course_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 3818 (class 2606 OID 17259)
-- Name: course_progress course_progress_user_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_progress
    ADD CONSTRAINT course_progress_user_id_course_id_key UNIQUE (user_id, course_id);


--
-- TOC entry 3768 (class 2606 OID 16755)
-- Name: course_subjects course_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_pkey PRIMARY KEY (course_id, subject_id);


--
-- TOC entry 3763 (class 2606 OID 24598)
-- Name: courses courses_course_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_course_code_key UNIQUE (course_code);


--
-- TOC entry 3765 (class 2606 OID 16750)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);


--
-- TOC entry 3791 (class 2606 OID 16911)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- TOC entry 3776 (class 2606 OID 16820)
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (enrollment_id);


--
-- TOC entry 3778 (class 2606 OID 16822)
-- Name: enrollments enrollments_user_id_subject_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_subject_id_key UNIQUE (user_id, subject_id);


--
-- TOC entry 3848 (class 2606 OID 24919)
-- Name: images images_file_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_file_id_key UNIQUE (file_id);


--
-- TOC entry 3850 (class 2606 OID 24917)
-- Name: images images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (image_id);


--
-- TOC entry 3770 (class 2606 OID 16776)
-- Name: instructors instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_pkey PRIMARY KEY (instructor_id);


--
-- TOC entry 3810 (class 2606 OID 17209)
-- Name: lesson_attachments lesson_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_attachments
    ADD CONSTRAINT lesson_attachments_pkey PRIMARY KEY (attachment_id);


--
-- TOC entry 3750 (class 2606 OID 16627)
-- Name: lesson_files lesson_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_files
    ADD CONSTRAINT lesson_files_pkey PRIMARY KEY (file_id);


--
-- TOC entry 3754 (class 2606 OID 16695)
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 3756 (class 2606 OID 16697)
-- Name: lesson_progress lesson_progress_user_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);


--
-- TOC entry 3758 (class 2606 OID 16717)
-- Name: lesson_sections lesson_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_pkey PRIMARY KEY (section_id);


--
-- TOC entry 3794 (class 2606 OID 16949)
-- Name: lesson_videos lesson_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_videos
    ADD CONSTRAINT lesson_videos_pkey PRIMARY KEY (video_id);


--
-- TOC entry 3748 (class 2606 OID 16612)
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (lesson_id);


--
-- TOC entry 3872 (class 2606 OID 25098)
-- Name: managers managers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.managers
    ADD CONSTRAINT managers_pkey PRIMARY KEY (manager_id);


--
-- TOC entry 3874 (class 2606 OID 25100)
-- Name: managers managers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.managers
    ADD CONSTRAINT managers_user_id_key UNIQUE (user_id);


--
-- TOC entry 3843 (class 2606 OID 24899)
-- Name: page_settings page_settings_page_name_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_settings
    ADD CONSTRAINT page_settings_page_name_setting_key_key UNIQUE (page_name, setting_key);


--
-- TOC entry 3845 (class 2606 OID 24897)
-- Name: page_settings page_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_settings
    ADD CONSTRAINT page_settings_pkey PRIMARY KEY (setting_id);


--
-- TOC entry 3864 (class 2606 OID 25001)
-- Name: question_attachments question_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_attachments
    ADD CONSTRAINT question_attachments_pkey PRIMARY KEY (attachment_id);


--
-- TOC entry 3736 (class 2606 OID 16495)
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- TOC entry 3820 (class 2606 OID 17296)
-- Name: quiz_attachments quiz_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attachments
    ADD CONSTRAINT quiz_attachments_pkey PRIMARY KEY (attachment_id);


--
-- TOC entry 3785 (class 2606 OID 16870)
-- Name: quiz_attempt_answers quiz_attempt_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_pkey PRIMARY KEY (answer_id);


--
-- TOC entry 3782 (class 2606 OID 16848)
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (attempt_id);


--
-- TOC entry 3787 (class 2606 OID 16891)
-- Name: quiz_lessons quiz_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_pkey PRIMARY KEY (quiz_id, lesson_id);


--
-- TOC entry 3806 (class 2606 OID 17073)
-- Name: quiz_progress quiz_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 3808 (class 2606 OID 17075)
-- Name: quiz_progress quiz_progress_user_id_quiz_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_user_id_quiz_id_key UNIQUE (user_id, quiz_id);


--
-- TOC entry 3744 (class 2606 OID 16588)
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (quiz_id, question_id);


--
-- TOC entry 3741 (class 2606 OID 16583)
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (quiz_id);


--
-- TOC entry 3822 (class 2606 OID 17323)
-- Name: rankings rankings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rankings
    ADD CONSTRAINT rankings_pkey PRIMARY KEY (ranking_id);


--
-- TOC entry 3723 (class 2606 OID 16453)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- TOC entry 3725 (class 2606 OID 16455)
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- TOC entry 3832 (class 2606 OID 24822)
-- Name: school_students school_students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_students
    ADD CONSTRAINT school_students_pkey PRIMARY KEY (school_student_id);


--
-- TOC entry 3834 (class 2606 OID 24824)
-- Name: school_students school_students_student_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_students
    ADD CONSTRAINT school_students_student_code_key UNIQUE (student_code);


--
-- TOC entry 3867 (class 2606 OID 25042)
-- Name: score_change_logs score_change_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_change_logs
    ADD CONSTRAINT score_change_logs_pkey PRIMARY KEY (log_id);


--
-- TOC entry 3761 (class 2606 OID 16728)
-- Name: section_lessons section_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_pkey PRIMARY KEY (section_id, lesson_id);


--
-- TOC entry 3796 (class 2606 OID 16981)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- TOC entry 3772 (class 2606 OID 16781)
-- Name: subject_instructors subject_instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_pkey PRIMARY KEY (subject_id, instructor_id);


--
-- TOC entry 3774 (class 2606 OID 16797)
-- Name: subject_lessons subject_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_pkey PRIMARY KEY (subject_id, lesson_id);


--
-- TOC entry 3853 (class 2606 OID 24938)
-- Name: subject_payment_slips subject_payment_slips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_payment_slips
    ADD CONSTRAINT subject_payment_slips_pkey PRIMARY KEY (id);


--
-- TOC entry 3802 (class 2606 OID 17032)
-- Name: subject_prerequisites subject_prerequisites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_pkey PRIMARY KEY (id);


--
-- TOC entry 3804 (class 2606 OID 17034)
-- Name: subject_prerequisites subject_prerequisites_subject_id_prerequisite_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_subject_id_prerequisite_id_key UNIQUE (subject_id, prerequisite_id);


--
-- TOC entry 3752 (class 2606 OID 16658)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- TOC entry 3789 (class 2606 OID 24615)
-- Name: quiz_lessons unique_quiz_lesson; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT unique_quiz_lesson UNIQUE (quiz_id, lesson_id);


--
-- TOC entry 3746 (class 2606 OID 24613)
-- Name: quiz_questions unique_quiz_question; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT unique_quiz_question UNIQUE (quiz_id, question_id);


--
-- TOC entry 3855 (class 2606 OID 24940)
-- Name: subject_payment_slips unique_subject_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_payment_slips
    ADD CONSTRAINT unique_subject_user UNIQUE (subject_id, user_id);


--
-- TOC entry 3728 (class 2606 OID 16467)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3730 (class 2606 OID 16465)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3732 (class 2606 OID 24595)
-- Name: users users_user_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_code_key UNIQUE (user_code);


--
-- TOC entry 3812 (class 2606 OID 17242)
-- Name: video_progress video_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 3814 (class 2606 OID 17244)
-- Name: video_progress video_progress_user_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);


--
-- TOC entry 3860 (class 1259 OID 24981)
-- Name: idx_bank_accounts_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_accounts_default ON public.bank_accounts USING btree (is_default);


--
-- TOC entry 3861 (class 1259 OID 24982)
-- Name: idx_bank_accounts_default_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_bank_accounts_default_unique ON public.bank_accounts USING btree (is_default) WHERE (is_default = true);


--
-- TOC entry 3839 (class 1259 OID 24885)
-- Name: idx_banner_settings_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banner_settings_key ON public.banner_settings USING btree (setting_key);


--
-- TOC entry 3840 (class 1259 OID 24884)
-- Name: idx_banner_settings_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banner_settings_updated_at ON public.banner_settings USING btree (updated_at);


--
-- TOC entry 3739 (class 1259 OID 16540)
-- Name: idx_choices_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_choices_question_id ON public.choices USING btree (question_id);


--
-- TOC entry 3766 (class 1259 OID 25119)
-- Name: idx_courses_manager_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_manager_id ON public.courses USING btree (manager_id);


--
-- TOC entry 3779 (class 1259 OID 16833)
-- Name: idx_enrollments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enrollments_status ON public.enrollments USING btree (status);


--
-- TOC entry 3846 (class 1259 OID 24925)
-- Name: idx_images_file_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_images_file_id ON public.images USING btree (file_id);


--
-- TOC entry 3792 (class 1259 OID 16955)
-- Name: idx_lesson_videos_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lesson_videos_lesson_id ON public.lesson_videos USING btree (lesson_id);


--
-- TOC entry 3868 (class 1259 OID 25112)
-- Name: idx_managers_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_managers_department ON public.managers USING btree (department);


--
-- TOC entry 3869 (class 1259 OID 25113)
-- Name: idx_managers_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_managers_position ON public.managers USING btree ("position");


--
-- TOC entry 3870 (class 1259 OID 25111)
-- Name: idx_managers_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_managers_user_id ON public.managers USING btree (user_id);


--
-- TOC entry 3841 (class 1259 OID 24905)
-- Name: idx_page_settings_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_page_settings_updated_at ON public.page_settings USING btree (updated_at);


--
-- TOC entry 3862 (class 1259 OID 25008)
-- Name: idx_question_attachments_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_question_attachments_question_id ON public.question_attachments USING btree (question_id);


--
-- TOC entry 3783 (class 1259 OID 16886)
-- Name: idx_quiz_attempt_answers_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_attempt_answers_question_id ON public.quiz_attempt_answers USING btree (question_id);


--
-- TOC entry 3780 (class 1259 OID 25075)
-- Name: idx_quiz_attempts_affects_grade; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_attempts_affects_grade ON public.quiz_attempts USING btree (affects_grade);


--
-- TOC entry 3742 (class 1259 OID 16599)
-- Name: idx_quiz_questions_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_questions_question_id ON public.quiz_questions USING btree (question_id);


--
-- TOC entry 3865 (class 1259 OID 25053)
-- Name: idx_score_change_logs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_score_change_logs_user ON public.score_change_logs USING btree (user_id, created_at);


--
-- TOC entry 3759 (class 1259 OID 16739)
-- Name: idx_section_lessons_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_section_lessons_order ON public.section_lessons USING btree (order_number);


--
-- TOC entry 3851 (class 1259 OID 24958)
-- Name: idx_subject_payment_slips_uploaded_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subject_payment_slips_uploaded_at ON public.subject_payment_slips USING btree (uploaded_at);


--
-- TOC entry 3726 (class 1259 OID 16967)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 3945 (class 2620 OID 25081)
-- Name: lessons trigger_lesson_weight_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_lesson_weight_change AFTER UPDATE OF total_weight_in_biglesson ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.trigger_update_biglesson_weight();


--
-- TOC entry 3947 (class 2620 OID 25057)
-- Name: subjects trigger_log_subject_changes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_log_subject_changes AFTER UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.log_subject_changes();


--
-- TOC entry 3944 (class 2620 OID 24600)
-- Name: users trigger_reset_user_code_sequence; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_reset_user_code_sequence BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.reset_user_code_sequence();


--
-- TOC entry 3948 (class 2620 OID 25083)
-- Name: enrollments trigger_test_score_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_test_score_change AFTER UPDATE OF pre_test_percentage, post_test_score ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.trigger_calculate_learning_gain();


--
-- TOC entry 3946 (class 2620 OID 25128)
-- Name: lessons trigger_update_biglesson_weights_on_lesson_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_biglesson_weights_on_lesson_change AFTER INSERT OR DELETE OR UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_biglesson_calculated_weights();


--
-- TOC entry 3950 (class 2620 OID 25121)
-- Name: managers trigger_update_managers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_managers_updated_at BEFORE UPDATE ON public.managers FOR EACH ROW EXECUTE FUNCTION public.update_managers_updated_at();


--
-- TOC entry 3949 (class 2620 OID 24957)
-- Name: subject_payment_slips update_subject_payment_slips_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_subject_payment_slips_updated_at BEFORE UPDATE ON public.subject_payment_slips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3938 (class 2606 OID 24975)
-- Name: bank_accounts bank_accounts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3932 (class 2606 OID 24879)
-- Name: banner_settings banner_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banner_settings
    ADD CONSTRAINT banner_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3930 (class 2606 OID 24802)
-- Name: big_lesson_attachments big_lesson_attachments_big_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lesson_attachments
    ADD CONSTRAINT big_lesson_attachments_big_lesson_id_fkey FOREIGN KEY (big_lesson_id) REFERENCES public.big_lessons(big_lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3876 (class 2606 OID 16509)
-- Name: choices choices_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.choices
    ADD CONSTRAINT choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3924 (class 2606 OID 24627)
-- Name: course_attachments course_attachments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_attachments
    ADD CONSTRAINT course_attachments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;


--
-- TOC entry 3894 (class 2606 OID 16756)
-- Name: course_subjects course_subjects_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;


--
-- TOC entry 3895 (class 2606 OID 16761)
-- Name: course_subjects course_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3892 (class 2606 OID 17216)
-- Name: courses courses_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- TOC entry 3902 (class 2606 OID 16828)
-- Name: enrollments enrollments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3903 (class 2606 OID 16823)
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3914 (class 2606 OID 17006)
-- Name: admins fk_admins_departments; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admins_departments FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- TOC entry 3915 (class 2606 OID 17001)
-- Name: admins fk_admins_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admins_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3935 (class 2606 OID 24951)
-- Name: subject_payment_slips fk_approved_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_payment_slips
    ADD CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3928 (class 2606 OID 24699)
-- Name: big_lesson_progress fk_big_lesson_progress_big_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lesson_progress
    ADD CONSTRAINT fk_big_lesson_progress_big_lesson FOREIGN KEY (big_lesson_id) REFERENCES public.big_lessons(big_lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3929 (class 2606 OID 24694)
-- Name: big_lesson_progress fk_big_lesson_progress_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lesson_progress
    ADD CONSTRAINT fk_big_lesson_progress_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3925 (class 2606 OID 24673)
-- Name: big_lessons fk_big_lessons_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lessons
    ADD CONSTRAINT fk_big_lessons_created_by FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- TOC entry 3926 (class 2606 OID 24668)
-- Name: big_lessons fk_big_lessons_quiz; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lessons
    ADD CONSTRAINT fk_big_lessons_quiz FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;


--
-- TOC entry 3927 (class 2606 OID 24721)
-- Name: big_lessons fk_big_lessons_subject; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.big_lessons
    ADD CONSTRAINT fk_big_lessons_subject FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3893 (class 2606 OID 25114)
-- Name: courses fk_courses_manager; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT fk_courses_manager FOREIGN KEY (manager_id) REFERENCES public.managers(manager_id) ON DELETE SET NULL;


--
-- TOC entry 3896 (class 2606 OID 16968)
-- Name: instructors fk_instructors_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT fk_instructors_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3911 (class 2606 OID 16950)
-- Name: lesson_videos fk_lesson_videos_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_videos
    ADD CONSTRAINT fk_lesson_videos_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3880 (class 2606 OID 24680)
-- Name: lessons fk_lessons_big_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT fk_lessons_big_lesson FOREIGN KEY (big_lesson_id) REFERENCES public.big_lessons(big_lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3881 (class 2606 OID 16912)
-- Name: lessons fk_lessons_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT fk_lessons_created_by FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- TOC entry 3921 (class 2606 OID 17307)
-- Name: quiz_attachments fk_quiz_attachments_answer_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attachments
    ADD CONSTRAINT fk_quiz_attachments_answer_id FOREIGN KEY (answer_id) REFERENCES public.quiz_attempt_answers(answer_id);


--
-- TOC entry 3922 (class 2606 OID 17302)
-- Name: quiz_attachments fk_quiz_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attachments
    ADD CONSTRAINT fk_quiz_id FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3897 (class 2606 OID 17324)
-- Name: instructors fk_ranking; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT fk_ranking FOREIGN KEY (ranking_id) REFERENCES public.rankings(ranking_id);


--
-- TOC entry 3875 (class 2606 OID 16468)
-- Name: users fk_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE RESTRICT;


--
-- TOC entry 3912 (class 2606 OID 16987)
-- Name: students fk_students_departments; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_departments FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- TOC entry 3913 (class 2606 OID 16982)
-- Name: students fk_students_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3936 (class 2606 OID 24941)
-- Name: subject_payment_slips fk_subject; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_payment_slips
    ADD CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3937 (class 2606 OID 24946)
-- Name: subject_payment_slips fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_payment_slips
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3923 (class 2606 OID 17297)
-- Name: quiz_attachments fk_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attachments
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3934 (class 2606 OID 24920)
-- Name: images images_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3920 (class 2606 OID 17210)
-- Name: lesson_attachments lesson_attachments_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_attachments
    ADD CONSTRAINT lesson_attachments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id);


--
-- TOC entry 3884 (class 2606 OID 16628)
-- Name: lesson_files lesson_files_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_files
    ADD CONSTRAINT lesson_files_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3887 (class 2606 OID 16703)
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3888 (class 2606 OID 16698)
-- Name: lesson_progress lesson_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3889 (class 2606 OID 16718)
-- Name: lesson_sections lesson_sections_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3882 (class 2606 OID 16613)
-- Name: lessons lessons_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;


--
-- TOC entry 3883 (class 2606 OID 25023)
-- Name: lessons lessons_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- TOC entry 3942 (class 2606 OID 25106)
-- Name: managers managers_department_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.managers
    ADD CONSTRAINT managers_department_fkey FOREIGN KEY (department) REFERENCES public.departments(department_id) ON DELETE SET NULL;


--
-- TOC entry 3943 (class 2606 OID 25101)
-- Name: managers managers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.managers
    ADD CONSTRAINT managers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3933 (class 2606 OID 24900)
-- Name: page_settings page_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_settings
    ADD CONSTRAINT page_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3939 (class 2606 OID 25002)
-- Name: question_attachments question_attachments_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_attachments
    ADD CONSTRAINT question_attachments_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3906 (class 2606 OID 16871)
-- Name: quiz_attempt_answers quiz_attempt_answers_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.quiz_attempts(attempt_id) ON DELETE CASCADE;


--
-- TOC entry 3907 (class 2606 OID 16881)
-- Name: quiz_attempt_answers quiz_attempt_answers_choice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_choice_id_fkey FOREIGN KEY (choice_id) REFERENCES public.choices(choice_id) ON DELETE SET NULL;


--
-- TOC entry 3908 (class 2606 OID 16876)
-- Name: quiz_attempt_answers quiz_attempt_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3904 (class 2606 OID 16854)
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3905 (class 2606 OID 16849)
-- Name: quiz_attempts quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3909 (class 2606 OID 16897)
-- Name: quiz_lessons quiz_lessons_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3910 (class 2606 OID 16892)
-- Name: quiz_lessons quiz_lessons_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3918 (class 2606 OID 17081)
-- Name: quiz_progress quiz_progress_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3919 (class 2606 OID 17076)
-- Name: quiz_progress quiz_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3878 (class 2606 OID 16594)
-- Name: quiz_questions quiz_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3879 (class 2606 OID 16589)
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3877 (class 2606 OID 25016)
-- Name: quizzes quizzes_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- TOC entry 3931 (class 2606 OID 24825)
-- Name: school_students school_students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_students
    ADD CONSTRAINT school_students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3940 (class 2606 OID 25043)
-- Name: score_change_logs score_change_logs_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_change_logs
    ADD CONSTRAINT score_change_logs_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3941 (class 2606 OID 25048)
-- Name: score_change_logs score_change_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_change_logs
    ADD CONSTRAINT score_change_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3890 (class 2606 OID 16734)
-- Name: section_lessons section_lessons_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3891 (class 2606 OID 16729)
-- Name: section_lessons section_lessons_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.lesson_sections(section_id) ON DELETE CASCADE;


--
-- TOC entry 3898 (class 2606 OID 16787)
-- Name: subject_instructors subject_instructors_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(instructor_id) ON DELETE CASCADE;


--
-- TOC entry 3899 (class 2606 OID 16782)
-- Name: subject_instructors subject_instructors_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3900 (class 2606 OID 16803)
-- Name: subject_lessons subject_lessons_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3901 (class 2606 OID 16798)
-- Name: subject_lessons subject_lessons_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3916 (class 2606 OID 17040)
-- Name: subject_prerequisites subject_prerequisites_prerequisite_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_prerequisite_id_fkey FOREIGN KEY (prerequisite_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3917 (class 2606 OID 17035)
-- Name: subject_prerequisites subject_prerequisites_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3885 (class 2606 OID 16664)
-- Name: subjects subjects_post_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_post_test_id_fkey FOREIGN KEY (post_test_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;


--
-- TOC entry 3886 (class 2606 OID 16659)
-- Name: subjects subjects_pre_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pre_test_id_fkey FOREIGN KEY (pre_test_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;


-- Completed on 2025-08-26 21:13:14

--
-- PostgreSQL database dump complete
--

-- Completed on 2025-08-26 21:13:14

--
-- PostgreSQL database cluster dump complete
--

