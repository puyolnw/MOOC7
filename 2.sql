--
-- PostgreSQL database cluster dump
--

-- Started on 2025-04-20 00:33:42

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
-- Dumped by pg_dump version 16.8

-- Started on 2025-04-20 00:33:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Completed on 2025-04-20 00:33:49

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
-- Dumped by pg_dump version 16.8

-- Started on 2025-04-20 00:33:49

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 263 (class 1259 OID 16993)
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
-- TOC entry 262 (class 1259 OID 16992)
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
-- TOC entry 3835 (class 0 OID 0)
-- Dependencies: 262
-- Name: admins_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_admin_id_seq OWNED BY public.admins.admin_id;


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
-- TOC entry 3836 (class 0 OID 0)
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- TOC entry 3837 (class 0 OID 0)
-- Dependencies: 223
-- Name: choices_choice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.choices_choice_id_seq OWNED BY public.choices.choice_id;


--
-- TOC entry 265 (class 1259 OID 17013)
-- Name: course_enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_enrollments (
    enrollment_id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    enrollment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completion_date timestamp without time zone,
    progress_percentage integer DEFAULT 0,
    status character varying(20) DEFAULT 'in_progress'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT course_enrollments_status_check CHECK (((status)::text = ANY (ARRAY[('in_progress'::character varying)::text, ('completed'::character varying)::text, ('dropped'::character varying)::text])))
);


ALTER TABLE public.course_enrollments OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 17012)
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
-- TOC entry 3838 (class 0 OID 0)
-- Dependencies: 264
-- Name: course_enrollments_enrollment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_enrollments_enrollment_id_seq OWNED BY public.course_enrollments.enrollment_id;


--
-- TOC entry 257 (class 1259 OID 16918)
-- Name: course_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_lessons (
    id integer NOT NULL,
    course_id integer NOT NULL,
    lesson_id integer NOT NULL,
    lesson_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.course_lessons OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 16917)
-- Name: course_lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_lessons_id_seq OWNER TO postgres;

--
-- TOC entry 3839 (class 0 OID 0)
-- Dependencies: 256
-- Name: course_lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_lessons_id_seq OWNED BY public.course_lessons.id;


--
-- TOC entry 242 (class 1259 OID 16751)
-- Name: course_subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_subjects (
    course_id integer NOT NULL,
    subject_id integer NOT NULL,
    order_number integer DEFAULT 0
);


ALTER TABLE public.course_subjects OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16741)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(100),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cover_image_path character varying(255),
    status character varying(20) DEFAULT 'draft'::character varying,
    video_url character varying(255)
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16740)
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
-- TOC entry 3840 (class 0 OID 0)
-- Dependencies: 240
-- Name: courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_course_id_seq OWNED BY public.courses.course_id;


--
-- TOC entry 255 (class 1259 OID 16903)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(255) NOT NULL,
    faculty character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 16902)
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
-- TOC entry 3841 (class 0 OID 0)
-- Dependencies: 254
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- TOC entry 248 (class 1259 OID 16809)
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
    CONSTRAINT enrollments_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'dropped'::character varying])::text[])))
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16808)
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
-- TOC entry 3842 (class 0 OID 0)
-- Dependencies: 247
-- Name: enrollments_enrollment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.enrollments_enrollment_id_seq OWNED BY public.enrollments.enrollment_id;


--
-- TOC entry 244 (class 1259 OID 16767)
-- Name: instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructors (
    instructor_id integer NOT NULL,
    name character varying(255) NOT NULL,
    "position" character varying(100),
    avatar_path character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    status character varying(20) DEFAULT 'active'::character varying,
    description text,
    department integer
);


ALTER TABLE public.instructors OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16766)
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
-- TOC entry 3843 (class 0 OID 0)
-- Dependencies: 243
-- Name: instructors_instructor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.instructors_instructor_id_seq OWNED BY public.instructors.instructor_id;


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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- TOC entry 3844 (class 0 OID 0)
-- Dependencies: 230
-- Name: lesson_files_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_files_file_id_seq OWNED BY public.lesson_files.file_id;


--
-- TOC entry 236 (class 1259 OID 16685)
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_progress (
    progress_id integer NOT NULL,
    user_id integer NOT NULL,
    lesson_id integer NOT NULL,
    completed boolean DEFAULT false,
    completion_date timestamp without time zone,
    duration_seconds integer DEFAULT 0,
    last_position_seconds integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lesson_progress OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16684)
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
-- TOC entry 3845 (class 0 OID 0)
-- Dependencies: 235
-- Name: lesson_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_progress_progress_id_seq OWNED BY public.lesson_progress.progress_id;


--
-- TOC entry 238 (class 1259 OID 16709)
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
-- TOC entry 237 (class 1259 OID 16708)
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
-- TOC entry 3846 (class 0 OID 0)
-- Dependencies: 237
-- Name: lesson_sections_section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_sections_section_id_seq OWNED BY public.lesson_sections.section_id;


--
-- TOC entry 234 (class 1259 OID 16669)
-- Name: lesson_subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_subjects (
    lesson_id integer NOT NULL,
    subject_id integer NOT NULL
);


ALTER TABLE public.lesson_subjects OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 16941)
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
-- TOC entry 258 (class 1259 OID 16940)
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
-- TOC entry 3847 (class 0 OID 0)
-- Dependencies: 258
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
    created_by integer
);


ALTER TABLE public.lessons OWNER TO postgres;

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
-- TOC entry 3848 (class 0 OID 0)
-- Dependencies: 228
-- Name: lessons_lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_lesson_id_seq OWNED BY public.lessons.lesson_id;


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
-- TOC entry 3849 (class 0 OID 0)
-- Dependencies: 221
-- Name: questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_question_id_seq OWNED BY public.questions.question_id;


--
-- TOC entry 252 (class 1259 OID 16860)
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.quiz_attempt_answers OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16859)
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
-- TOC entry 3850 (class 0 OID 0)
-- Dependencies: 251
-- Name: quiz_attempt_answers_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_attempt_answers_answer_id_seq OWNED BY public.quiz_attempt_answers.answer_id;


--
-- TOC entry 250 (class 1259 OID 16835)
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
    CONSTRAINT quiz_attempts_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'timed_out'::character varying])::text[])))
);


ALTER TABLE public.quiz_attempts OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16834)
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
-- TOC entry 3851 (class 0 OID 0)
-- Dependencies: 249
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_attempts_attempt_id_seq OWNED BY public.quiz_attempts.attempt_id;


--
-- TOC entry 253 (class 1259 OID 16887)
-- Name: quiz_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_lessons (
    quiz_id integer NOT NULL,
    lesson_id integer NOT NULL
);


ALTER TABLE public.quiz_lessons OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 17063)
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.quiz_progress OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 17062)
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
-- TOC entry 3852 (class 0 OID 0)
-- Dependencies: 268
-- Name: quiz_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_progress_progress_id_seq OWNED BY public.quiz_progress.progress_id;


--
-- TOC entry 227 (class 1259 OID 16584)
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_questions (
    quiz_id integer NOT NULL,
    question_id integer NOT NULL
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
    CONSTRAINT quizzes_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'draft'::character varying])::text[])))
);


ALTER TABLE public.quizzes OWNER TO postgres;

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
-- TOC entry 3853 (class 0 OID 0)
-- Dependencies: 225
-- Name: quizzes_quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quizzes_quiz_id_seq OWNED BY public.quizzes.quiz_id;


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
-- TOC entry 3854 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- TOC entry 239 (class 1259 OID 16723)
-- Name: section_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section_lessons (
    section_id integer NOT NULL,
    lesson_id integer NOT NULL,
    order_number integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.section_lessons OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 16974)
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    student_id integer NOT NULL,
    user_id integer,
    student_code character varying(20),
    department_id integer,
    education_level character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.students OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 16973)
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
-- TOC entry 3855 (class 0 OID 0)
-- Dependencies: 260
-- Name: students_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_student_id_seq OWNED BY public.students.student_id;


--
-- TOC entry 245 (class 1259 OID 16777)
-- Name: subject_instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_instructors (
    subject_id integer NOT NULL,
    instructor_id integer NOT NULL
);


ALTER TABLE public.subject_instructors OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16792)
-- Name: subject_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_lessons (
    subject_id integer NOT NULL,
    lesson_id integer NOT NULL,
    order_number integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.subject_lessons OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 17026)
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
-- TOC entry 266 (class 1259 OID 17025)
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
-- TOC entry 3856 (class 0 OID 0)
-- Dependencies: 266
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
    cover_image_path character varying(255),
    allow_all_lessons boolean DEFAULT true,
    pre_test_id integer,
    post_test_id integer,
    status character varying(10) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subjects_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'draft'::character varying])::text[])))
);


ALTER TABLE public.subjects OWNER TO postgres;

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
-- TOC entry 3857 (class 0 OID 0)
-- Dependencies: 232
-- Name: subjects_subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjects_subject_id_seq OWNED BY public.subjects.subject_id;


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
    last_name character varying(50)
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
-- TOC entry 3858 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 3482 (class 2604 OID 16996)
-- Name: admins admin_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN admin_id SET DEFAULT nextval('public.admins_admin_id_seq'::regclass);


--
-- TOC entry 3396 (class 2604 OID 16477)
-- Name: blacklisted_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens ALTER COLUMN id SET DEFAULT nextval('public.blacklisted_tokens_id_seq'::regclass);


--
-- TOC entry 3402 (class 2604 OID 16501)
-- Name: choices choice_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.choices ALTER COLUMN choice_id SET DEFAULT nextval('public.choices_choice_id_seq'::regclass);


--
-- TOC entry 3485 (class 2604 OID 17016)
-- Name: course_enrollments enrollment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_enrollments ALTER COLUMN enrollment_id SET DEFAULT nextval('public.course_enrollments_enrollment_id_seq'::regclass);


--
-- TOC entry 3472 (class 2604 OID 16921)
-- Name: course_lessons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_lessons ALTER COLUMN id SET DEFAULT nextval('public.course_lessons_id_seq'::regclass);


--
-- TOC entry 3442 (class 2604 OID 16744)
-- Name: courses course_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN course_id SET DEFAULT nextval('public.courses_course_id_seq'::regclass);


--
-- TOC entry 3470 (class 2604 OID 16906)
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- TOC entry 3452 (class 2604 OID 16812)
-- Name: enrollments enrollment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN enrollment_id SET DEFAULT nextval('public.enrollments_enrollment_id_seq'::regclass);


--
-- TOC entry 3447 (class 2604 OID 16770)
-- Name: instructors instructor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors ALTER COLUMN instructor_id SET DEFAULT nextval('public.instructors_instructor_id_seq'::regclass);


--
-- TOC entry 3423 (class 2604 OID 16622)
-- Name: lesson_files file_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_files ALTER COLUMN file_id SET DEFAULT nextval('public.lesson_files_file_id_seq'::regclass);


--
-- TOC entry 3431 (class 2604 OID 16688)
-- Name: lesson_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.lesson_progress_progress_id_seq'::regclass);


--
-- TOC entry 3437 (class 2604 OID 16712)
-- Name: lesson_sections section_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_sections ALTER COLUMN section_id SET DEFAULT nextval('public.lesson_sections_section_id_seq'::regclass);


--
-- TOC entry 3475 (class 2604 OID 16944)
-- Name: lesson_videos video_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_videos ALTER COLUMN video_id SET DEFAULT nextval('public.lesson_videos_video_id_seq'::regclass);


--
-- TOC entry 3418 (class 2604 OID 16604)
-- Name: lessons lesson_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN lesson_id SET DEFAULT nextval('public.lessons_lesson_id_seq'::regclass);


--
-- TOC entry 3398 (class 2604 OID 16487)
-- Name: questions question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN question_id SET DEFAULT nextval('public.questions_question_id_seq'::regclass);


--
-- TOC entry 3466 (class 2604 OID 16863)
-- Name: quiz_attempt_answers answer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers ALTER COLUMN answer_id SET DEFAULT nextval('public.quiz_attempt_answers_answer_id_seq'::regclass);


--
-- TOC entry 3458 (class 2604 OID 16838)
-- Name: quiz_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.quiz_attempts_attempt_id_seq'::regclass);


--
-- TOC entry 3493 (class 2604 OID 17066)
-- Name: quiz_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.quiz_progress_progress_id_seq'::regclass);


--
-- TOC entry 3406 (class 2604 OID 16567)
-- Name: quizzes quiz_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN quiz_id SET DEFAULT nextval('public.quizzes_quiz_id_seq'::regclass);


--
-- TOC entry 3389 (class 2604 OID 16448)
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- TOC entry 3479 (class 2604 OID 16977)
-- Name: students student_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN student_id SET DEFAULT nextval('public.students_student_id_seq'::regclass);


--
-- TOC entry 3491 (class 2604 OID 17029)
-- Name: subject_prerequisites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites ALTER COLUMN id SET DEFAULT nextval('public.subject_prerequisites_id_seq'::regclass);


--
-- TOC entry 3425 (class 2604 OID 16648)
-- Name: subjects subject_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN subject_id SET DEFAULT nextval('public.subjects_subject_id_seq'::regclass);


--
-- TOC entry 3391 (class 2604 OID 16460)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 3823 (class 0 OID 16993)
-- Dependencies: 263
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (admin_id, user_id, department_id, "position", created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3780 (class 0 OID 16474)
-- Dependencies: 220
-- Data for Name: blacklisted_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blacklisted_tokens (id, token, expires_at, created_at) FROM stdin;
34	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0MzgzOTI5NCwiZXhwIjoxNzQzOTI1Njk0fQ.rOGhsPf-zgb5MriNjSwNrTp8oY26964Nrqtz6o9Cxaw	2025-04-06 14:48:14	2025-04-05 15:11:36
35	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQzODQwNzEwLCJleHAiOjE3NDM5MjcxMTB9.k2fdUYTkxuEbSSbPCqJ3NnrwbbNC6EWHs7hft2QhBEM	2025-04-06 15:11:50	2025-04-05 15:49:21
36	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0Mzg0MzM1NCwiZXhwIjoxNzQzOTI5NzU0fQ._EAZ3aAUQBxQ2ERbCwbbb_A8ECeEh-EZ6YSZd3UWIHI	2025-04-06 22:55:54	2025-04-05 15:55:59
37	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQzODQzODM1LCJleHAiOjE3NDM5MzAyMzV9.id6bktel7ty-vUHdJMSDxRD87KjRxQqx3haBahiOUOU	2025-04-06 16:03:55	2025-04-05 16:04:38
38	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQzOTE0MjMyLCJleHAiOjE3NDQwMDA2MzJ9.fbWoaTnhzBnKrUspgsFzyTj2_IicwDJZFs5mFDXj_W4	2025-04-07 11:37:12	2025-04-06 11:39:32
39	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQzOTE0NDM0LCJleHAiOjE3NDQwMDA4MzR9.VMc7KaIR9SGhF8MhOhto5bGWYelA-pIvWxA_RptnW74	2025-04-07 11:40:34	2025-04-06 11:42:34
40	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQzOTE0OTA5LCJleHAiOjE3NDQwMDEzMDl9.QcNtWZH0zksx5yctm903BjZ0MzrrNBUdU7tc2XNiThk	2025-04-07 11:48:29	2025-04-06 17:26:12
41	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQzOTM1MTc1LCJleHAiOjE3NDQwMjE1NzV9.iDVLzcf_d-6vEUC_-Bt2-Wq4SwJk9Dc0TN_3_mM49jY	2025-04-07 17:26:15	2025-04-06 17:31:02
42	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQzOTM1NDY1LCJleHAiOjE3NDQwMjE4NjV9.UwilG9ZVspnTALyBb-Rxu8AiXTCuTB-WB5hawCuzkaE	2025-04-07 17:31:05	2025-04-06 17:32:37
43	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0MzkzNTYzMCwiZXhwIjoxNzQ0MDIyMDMwfQ._QMGghWsMyjE1JCNM8UcmBoM5zmE947lRcP_BMBBjK8	2025-04-07 17:33:50	2025-04-06 17:34:43
44	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQzOTM1Njk0LCJleHAiOjE3NDQwMjIwOTR9.0EXod-CMF774I0T1RcFMKLGB50O_YKR_AziQO8588J0	2025-04-07 17:34:54	2025-04-06 17:45:16
45	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQzOTM2NTQ4LCJleHAiOjE3NDQwMjI5NDh9.kRdVPH00JsuKao3HweOZQx32xorAG7piMQp0Ov5aUfo	2025-04-07 17:49:08	2025-04-06 17:49:20
46	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0MzkzNjU2OCwiZXhwIjoxNzQ0MDIyOTY4fQ.Srdb0O9BSDAsPcSkKJkV5GOeaBb9SY-t3gKOv1iIR2o	2025-04-07 17:49:28	2025-04-06 17:50:11
47	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0MzkzNjY1NiwiZXhwIjoxNzQ0MDIzMDU2fQ.KG7-fxrgJJLoHewNtDPpYoeZdE7dH0d4jCd9pZbKSp0	2025-04-07 17:50:56	2025-04-06 17:51:30
48	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQzOTM2OTU5LCJleHAiOjE3NDQwMjMzNTl9.mNsm6fRSw1kqg9Gqx0WII95SRJApS2QspEEqtLmpZ4w	2025-04-07 17:55:59	2025-04-07 12:03:57
49	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQ0MDAyMjU0LCJleHAiOjE3NDQwODg2NTR9.EDNthxrpSmS1ya8isS82sQbWwpLzNsqtQ0_FNJA29cs	2025-04-08 12:04:14	2025-04-07 12:04:21
50	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NDAxNjM3MSwiZXhwIjoxNzQ0MTAyNzcxfQ.AMDmwoIKm39H3NXPnBp6JR_KeaFjwiy4PiOdfAKFbIk	2025-04-08 15:59:31	2025-04-07 16:02:38
51	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NDM4NTczNSwiZXhwIjoxNzQ0NDcyMTM1fQ.jtWB9luWv-P4vpprBaHN-Q5ajQYqcF_2cwrF5QRcZUc	2025-04-12 22:35:35	2025-04-12 15:52:33
52	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJhQGEuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQ0NDQ3OTU3LCJleHAiOjE3NDQ1MzQzNTd9.Mz77WJmsR6Kq8aoXMAoKpx-fYJ2ZqWC0SS3TDqbGKmU	2025-04-13 15:52:37	2025-04-12 15:52:46
53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NDg5MzM0NCwiZXhwIjoxNzQ0OTc5NzQ0fQ.mOB562hpWIxLRHA2149073fySVGE-K6s-e6_ibS3u5Y	2025-04-19 02:35:44	2025-04-17 20:50:26
54	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJlbWFpbEBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjEsImlhdCI6MTc0NDg5Nzg4NSwiZXhwIjoxNzQ0OTg0Mjg1fQ.yfrROmbYhdE75JJx9ZR_mCBstFXMXkLknPDyyhRF2oc	2025-04-19 03:51:25	2025-04-17 20:51:40
55	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NDg5NzkwMiwiZXhwIjoxNzQ0OTg0MzAyfQ.6yUoCPbQwGdWcgZPVklIt6OZ-jjSLyFfRhMIe_Y4l-8	2025-04-19 03:51:42	2025-04-17 21:43:43
56	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJlbWFpbEBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjEsImlhdCI6MTc0NDkwMTA1NCwiZXhwIjoxNzQ0OTg3NDU0fQ.L92wmnGtIb3MdXXA0GE-ozjfEj7RwCRDm91HmWX-a5Q	2025-04-19 04:44:14	2025-04-17 23:14:32
57	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NDkwNjQ3NCwiZXhwIjoxNzQ0OTkyODc0fQ.39GGjmurTjJlwyx3J241onEazZmmkQqI1pZ5-taTFUs	2025-04-19 06:14:34	2025-04-17 23:15:56
58	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJlbWFpbEBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjEsImlhdCI6MTc0NDkwNjU2MywiZXhwIjoxNzQ0OTkyOTYzfQ.AXJ2QmVAfIWbXhJDZcttSCzVbNxN2E_wjyjfbexrMJk	2025-04-19 06:16:03	2025-04-17 23:19:06
59	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NDkwNjc0NywiZXhwIjoxNzQ0OTkzMTQ3fQ.vMNMr_z_XThJ6_hM_QsGtEyAi1DKHLpUIUl-t7iJq-g	2025-04-19 06:19:07	2025-04-17 23:19:56
60	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJlbWFpbEBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjEsImlhdCI6MTc0NDkwNjgwNCwiZXhwIjoxNzQ0OTkzMjA0fQ.064NZuR8H1CO6qtJuAaBaRIiNrv8tdyk1DW44BlDi44	2025-04-19 06:20:04	2025-04-18 00:01:11
62	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJlbWFpbEBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjEsImlhdCI6MTc0NDkxMDEyMiwiZXhwIjoxNzQ0OTk2NTIyfQ.YQVzZ6_erpKkHWLRH3NjzKC35dBI4wrUwERROeBoKa0	2025-04-19 07:15:22	2025-04-18 00:21:35
63	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQ0OTEwNTEyLCJleHAiOjE3NDQ5OTY5MTJ9.Doj10JkeA153tA1MFpUzo8CxsPUbHJ7ka_vg8EmoQm4	2025-04-19 07:21:52	2025-04-18 00:23:43
64	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZV9pZCI6MiwiaWF0IjoxNzQ0OTE4NjIzLCJleHAiOjE3NDUwMDUwMjN9.o7ZyY8qP4n1ABqw-iGWC94_lB5B89ICbVIqqFU3FBFs	2025-04-19 02:37:03	2025-04-18 02:37:23
65	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NDkxMjUyMywiZXhwIjoxNzQ0OTk4OTIzfQ.azvdQNlPoxqrzC79faciyOeXx1jUnOp1wSW_CAzXjOM	2025-04-19 07:55:23	2025-04-18 07:44:18
66	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJlbWFpbEBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjEsImlhdCI6MTc0NDkxMDY3MSwiZXhwIjoxNzQ0OTk3MDcxfQ.ypczDEU-jB_cjcNKL4l3G0AYwJ_6ZbjtsnfaO4GQEbE	2025-04-19 07:24:31	2025-04-18 12:22:08
67	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NDk1MzczMSwiZXhwIjoxNzQ1MDQwMTMxfQ.EKFERaCp74tG455X-3EVQJbLOb7ilprqZqj_KKSY44s	2025-04-19 19:22:11	2025-04-18 13:00:21
68	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NDk2ODYyMywiZXhwIjoxNzQ1MDU1MDIzfQ.Tj3gslTe-RPHXUYSi3MuXRXZGKNSatrz6f1pNHceKBM	2025-04-19 16:30:23	2025-04-18 16:36:59
69	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NTAyMjQ0MCwiZXhwIjoxNzQ1MTA4ODQwfQ.SLHZvslOWL-tEn0UuXaW-JGiuXSoCIm-XgVU_9MRmhQ	2025-04-20 14:27:20	2025-04-19 13:01:37
71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVfaWQiOjQsImlhdCI6MTc0NTAxNjIzNCwiZXhwIjoxNzQ1MTAyNjM0fQ.Sai14jzzroFaX-U6ufmz0hDJzgtlkdHfDupUyPZUIfk	2025-04-20 05:43:54	2025-04-19 21:14:39
\.


--
-- TOC entry 3784 (class 0 OID 16498)
-- Dependencies: 224
-- Data for Name: choices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.choices (choice_id, question_id, text, is_correct, created_at, updated_at) FROM stdin;
3	2	ตัวเลือกที่ 1	f	2025-04-11 09:30:27.408717	2025-04-11 09:30:27.408717
4	2	ตัวเลือกที่ 2	t	2025-04-11 09:30:27.408717	2025-04-11 09:30:27.408717
5	2	ตัวเลือกที่ 3	t	2025-04-11 09:30:27.408717	2025-04-11 09:30:27.408717
6	3	ตัวเลือกที่ 1	f	2025-04-11 09:39:36.976332	2025-04-11 09:39:36.976332
7	3	ตัวเลือกที่ 2	t	2025-04-11 09:39:36.976332	2025-04-11 09:39:36.976332
8	3	ตัวเลือกที่ 3	f	2025-04-11 09:39:36.976332	2025-04-11 09:39:36.976332
9	9	True	t	2025-04-11 09:58:28.809462	2025-04-11 09:58:28.809462
10	9	False	f	2025-04-11 09:58:28.809462	2025-04-11 09:58:28.809462
11	10	ตัวเลือกที่ 1	t	2025-04-11 09:58:57.279074	2025-04-11 09:58:57.279074
12	10	ตัวเลือกที่ 2	t	2025-04-11 09:58:57.279074	2025-04-11 09:58:57.279074
13	10	ตัวเลือกที่ 3	f	2025-04-11 09:58:57.279074	2025-04-11 09:58:57.279074
14	11	JavaScript	t	2025-04-11 13:10:41.297621	2025-04-11 13:10:41.297621
15	11	Microsoft Word	f	2025-04-11 13:10:41.297621	2025-04-11 13:10:41.297621
16	11	Adobe Photoshop	f	2025-04-11 13:10:41.297621	2025-04-11 13:10:41.297621
17	12	JavaScript	t	2025-04-11 13:10:59.963368	2025-04-11 13:10:59.963368
18	12	Python	t	2025-04-11 13:10:59.963368	2025-04-11 13:10:59.963368
19	12	Microsoft Excel	f	2025-04-11 13:10:59.963368	2025-04-11 13:10:59.963368
20	12	Java	t	2025-04-11 13:10:59.963368	2025-04-11 13:10:59.963368
21	13	True	t	2025-04-11 13:11:08.232636	2025-04-11 13:11:08.232636
22	13	False	f	2025-04-11 13:11:08.232636	2025-04-11 13:11:08.232636
23	14	ปาก	t	2025-04-11 13:12:07.124588	2025-04-11 13:12:07.124588
24	14	ไม่รู้	t	2025-04-11 13:12:07.124588	2025-04-11 13:12:07.124588
25	14	ถูกทุกข้อ	t	2025-04-11 13:12:07.124588	2025-04-11 13:12:07.124588
26	14	ไม่รู้เหมือนกัน	t	2025-04-11 13:12:07.124588	2025-04-11 13:12:07.124588
33	18	ตัวเลือกที่ 1	t	2025-04-13 00:22:09.137539	2025-04-13 00:22:09.137539
34	18	ตัวเลือกที่ 2	t	2025-04-13 00:22:09.137539	2025-04-13 00:22:09.137539
35	18	ตัวเลือกที่ 3	f	2025-04-13 00:22:09.137539	2025-04-13 00:22:09.137539
52	19	True	t	2025-04-13 00:26:50.347459	2025-04-13 00:26:50.347459
53	19	False	f	2025-04-13 00:26:50.347459	2025-04-13 00:26:50.347459
54	21	True	t	2025-04-13 00:43:58.002797	2025-04-13 00:43:58.002797
55	21	False	f	2025-04-13 00:43:58.002797	2025-04-13 00:43:58.002797
\.


--
-- TOC entry 3825 (class 0 OID 17013)
-- Dependencies: 265
-- Data for Name: course_enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_enrollments (enrollment_id, user_id, course_id, enrollment_date, completion_date, progress_percentage, status, created_at, updated_at) FROM stdin;
1	1	8	2025-04-17 15:55:53.115601	\N	0	in_progress	2025-04-17 15:55:53.115601	2025-04-17 15:55:53.115601
2	1	7	2025-04-17 15:59:06.874938	\N	0	in_progress	2025-04-17 15:59:06.874938	2025-04-17 15:59:06.874938
3	1	9	2025-04-17 16:16:29.316918	\N	0	in_progress	2025-04-17 16:16:29.316918	2025-04-17 16:16:29.316918
4	1	10	2025-04-17 16:20:16.259697	\N	0	in_progress	2025-04-17 16:20:16.259697	2025-04-17 16:20:16.259697
6	1	12	2025-04-18 07:01:13.289848	\N	0	in_progress	2025-04-18 07:01:13.289848	2025-04-18 07:01:13.289848
5	1	11	2025-04-18 06:58:32.039474	\N	0	in_progress	2025-04-18 06:58:32.039474	2025-04-19 17:26:49.49648
7	1	13	2025-04-19 14:13:28.625756	\N	50	in_progress	2025-04-19 14:13:28.625756	2025-04-19 17:26:49.49648
\.


--
-- TOC entry 3817 (class 0 OID 16918)
-- Dependencies: 257
-- Data for Name: course_lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_lessons (id, course_id, lesson_id, lesson_order, created_at) FROM stdin;
\.


--
-- TOC entry 3802 (class 0 OID 16751)
-- Dependencies: 242
-- Data for Name: course_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_subjects (course_id, subject_id, order_number) FROM stdin;
4	4	1
4	6	2
5	6	1
5	4	3
6	4	1
6	8	2
7	4	1
7	6	2
7	8	3
7	9	4
8	4	1
8	8	2
8	9	3
8	6	4
8	10	0
9	9	1
9	8	2
9	6	3
9	10	4
9	4	5
10	4	1
10	10	2
10	9	3
10	6	4
10	8	5
11	11	1
12	12	1
13	12	1
13	11	2
\.


--
-- TOC entry 3801 (class 0 OID 16741)
-- Dependencies: 241
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (course_id, title, category, description, created_at, updated_at, cover_image_path, status, video_url) FROM stdin;
5	dasdad	\N	sadasd	2025-04-12 06:01:56.511332	2025-04-12 06:01:56.511332	C:\\Users\\acer NITRO 5\\OneDrive - Rajabhat Mahasarakham University\\Desktop\\workkkkk\\creditbank\\back_creditbank\\uploads\\courses\\covers\\course-cover-1744437716286-608888241.png	active	https://www.youtube.com/watch?v=V9PVRfjEBTI
4	ชื่อหลักสูตร	หมวดหมู่	คำอธิบายหลักสูตร	2025-04-12 05:40:51.087977	2025-04-13 05:00:42.506	\N	active	https://www.youtube.com/watch?v=V9PVRfjEBTI
6	พัฒนาตัวตนระดับจักรวาล	\N	ไม่มี	2025-04-12 07:44:23.132496	2025-04-13 01:36:20.209	C:\\Users\\Jakkapat\\Desktop\\CreditBlank\\back_creditbank\\uploads\\courses\\covers\\course-cover-1744491601359-518875489.jpg	active	https://www.youtube.com/watch?v=V9PVRfjEBTI
7	หหหห	\N	หหห	2025-04-17 13:19:55.818732	2025-04-17 13:19:55.818732	C:\\Users\\acer NITRO 5\\OneDrive - Rajabhat Mahasarakham University\\Desktop\\workkkkk\\creditbank\\back_creditbank\\uploads\\courses\\covers\\course-cover-1744895996012-979321452.jpg	active	https://www.youtube.com/watch?v=V9PVRfjEBTI
8	กฟหก	\N	ฟหกฟหกฟก	2025-04-17 13:31:29.8889	2025-04-17 13:31:29.8889	/uploads/courses/covers/course-cover-1744896690099-123828775.jpg	active	https://www.youtube.com/watch?v=dJ9uVVNWClk
9	ทดสอบระบบ	\N	ไม่มี	2025-04-17 16:15:23.468336	2025-04-17 16:15:23.468336	C:\\Users\\acer NITRO 5\\OneDrive - Rajabhat Mahasarakham University\\Desktop\\workkkkk\\creditbank\\back_creditbank\\uploads\\courses\\covers\\course-cover-1744906523709-646419664.jpg	active	\N
10	หลักสูตรที่ดี	\N	ฟหก	2025-04-17 16:19:52.748573	2025-04-17 16:19:52.748573	C:\\Users\\acer NITRO 5\\OneDrive - Rajabhat Mahasarakham University\\Desktop\\workkkkk\\creditbank\\back_creditbank\\uploads\\courses\\covers\\course-cover-1744906792984-596117289.jpg	active	\N
11	aaa22131231	\N	213213	2025-04-18 06:58:12.941522	2025-04-18 06:58:12.941522	\N	active	\N
12	ฟฟกฟห	\N	ฟหกฟหก	2025-04-18 07:00:55.360162	2025-04-18 07:00:55.360162	\N	active	\N
13	test	\N	..	2025-04-19 03:31:37.51684	2025-04-19 03:31:37.51684	D:\\Moocproject\\back_creditbank-main\\uploads\\courses\\covers\\course-cover-1745033493996-496653592.png	active	\N
\.


--
-- TOC entry 3815 (class 0 OID 16903)
-- Dependencies: 255
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_id, department_name, faculty, created_at, description) FROM stdin;
1	คณิตศาสตร์	คณะวิทยาศาสตร์	2025-04-12 14:26:22.093754	\N
2	วิทยาการคอมพิวเตอร์	คณะวิทยาศาสตร์	2025-04-12 14:26:36.354001	\N
3	เทคโนโลยีสารสนเทศ	คณะเทคโนโลยีสารสนเทศ	2025-04-12 14:26:45.436531	\N
\.


--
-- TOC entry 3808 (class 0 OID 16809)
-- Dependencies: 248
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (enrollment_id, user_id, subject_id, enrollment_date, completion_date, progress_percentage, status, created_at, updated_at) FROM stdin;
1	1	10	2025-04-17 15:55:53.115601	\N	0	in_progress	2025-04-17 15:55:53.115601	2025-04-17 15:55:53.115601
2	1	4	2025-04-17 15:55:53.115601	\N	0	in_progress	2025-04-17 15:55:53.115601	2025-04-17 15:55:53.115601
3	1	8	2025-04-17 15:55:53.115601	\N	0	in_progress	2025-04-17 15:55:53.115601	2025-04-17 15:55:53.115601
4	1	9	2025-04-17 15:55:53.115601	\N	0	in_progress	2025-04-17 15:55:53.115601	2025-04-17 15:55:53.115601
5	1	6	2025-04-17 15:55:53.115601	\N	0	in_progress	2025-04-17 15:55:53.115601	2025-04-17 15:55:53.115601
7	1	12	2025-04-18 07:01:13.289848	2025-04-19 17:23:01.151014	100	completed	2025-04-18 07:01:13.289848	2025-04-19 17:23:01.151014
6	1	11	2025-04-18 06:58:32.039474	2025-04-19 17:32:08.233642	100	completed	2025-04-18 06:58:32.039474	2025-04-19 17:32:08.233642
\.


--
-- TOC entry 3804 (class 0 OID 16767)
-- Dependencies: 244
-- Data for Name: instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instructors (instructor_id, name, "position", avatar_path, created_at, updated_at, user_id, status, description, department) FROM stdin;
1	ชื่อ นามสกุล	อาจารย์	\N	2025-04-12 07:20:46.36414	2025-04-12 07:20:46.36414	5	active	รายละเอียดผู้สอน	1
2	adads das	asdad	\N	2025-04-12 07:30:18.462773	2025-04-12 07:30:18.462773	6	active	asdadad	1
3	asdad sadasd	asdsad	\N	2025-04-12 08:52:28.276675	2025-04-12 08:52:28.276675	7	active	sadasd	1
4	aaa aaa	aaa	C:\\Users\\acer NITRO 5\\OneDrive - Rajabhat Mahasarakham University\\Desktop\\workkkkk\\creditbank\\back_creditbank\\uploads\\avatars\\avatar-1744893430286-256001472.png	2025-04-17 12:37:10.095991	2025-04-17 12:37:10.095991	8	active	aaa	1
\.


--
-- TOC entry 3791 (class 0 OID 16619)
-- Dependencies: 231
-- Data for Name: lesson_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_files (file_id, lesson_id, file_name, file_path, file_size, file_type, created_at) FROM stdin;
\.


--
-- TOC entry 3796 (class 0 OID 16685)
-- Dependencies: 236
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_progress (progress_id, user_id, lesson_id, completed, completion_date, duration_seconds, last_position_seconds, created_at, updated_at) FROM stdin;
2	1	10	t	2025-04-19 17:21:50.152036	9	9	2025-04-18 07:01:19.83215	2025-04-19 17:23:01.151014
1	1	7	f	\N	0	0	2025-04-18 06:41:36.009883	2025-04-18 06:41:53.021375
4	1	9	t	2025-04-19 17:26:17.522346	276	0	2025-04-19 17:26:17.522346	2025-04-19 17:33:49.158415
3	1	5	f	\N	0	0	2025-04-18 07:29:08.724147	2025-04-18 08:51:56.52488
5	1	8	t	2025-04-19 17:28:24.44956	1800	1800	2025-04-19 17:28:24.44956	2025-04-19 17:28:25.187239
\.


--
-- TOC entry 3798 (class 0 OID 16709)
-- Dependencies: 238
-- Data for Name: lesson_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_sections (section_id, title, subject_id, order_number, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3794 (class 0 OID 16669)
-- Dependencies: 234
-- Data for Name: lesson_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_subjects (lesson_id, subject_id) FROM stdin;
4	4
5	6
7	8
8	10
11	8
\.


--
-- TOC entry 3819 (class 0 OID 16941)
-- Dependencies: 259
-- Data for Name: lesson_videos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_videos (video_id, lesson_id, video_url, duration, created_at, updated_at) FROM stdin;
1	1	https://www.youtube.com/watch?v=dQw4w9WgXcQ	1800	2025-04-11 13:39:40.793022	2025-04-11 13:39:40.793022
2	3	https://www.youtube.com/watch?v=C2RGkVVpD84	1800	2025-04-11 14:09:13.01371	2025-04-11 14:09:13.01371
3	4	https://www.youtube.com/watch?v=gqOZjgLqck8&t=3051s	1800	2025-04-11 14:59:17.95012	2025-04-11 14:59:17.95012
4	5	https://www.youtube.com/watch?v=C2RGkVVpD84	1800	2025-04-12 05:11:51.037662	2025-04-12 05:11:51.037662
6	7	https://www.youtube.com/watch?v=dJ9uVVNWClk	1800	2025-04-12 07:40:26.501447	2025-04-12 07:40:26.501447
7	8	https://www.youtube.com/watch?v=dJ9uVVNWClk	1800	2025-04-17 14:35:21.877745	2025-04-17 14:35:21.877745
8	9	https://www.youtube.com/watch?v=SnlNirKhMvI	1800	2025-04-18 06:56:34.769787	2025-04-18 06:56:34.769787
9	10	https://www.youtube.com/watch?v=wv5ZbrXSD28	1800	2025-04-18 07:00:16.830088	2025-04-18 07:00:16.830088
10	11	https://youtu.be/eKL3TceSxvk?si=UuEwta5fZlUqklmE	1800	2025-04-19 00:54:38.382774	2025-04-19 00:54:38.382774
\.


--
-- TOC entry 3789 (class 0 OID 16601)
-- Dependencies: 229
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (lesson_id, title, description, video_url, can_preview, has_quiz, quiz_id, created_at, updated_at, duration, created_by) FROM stdin;
1	บทเรียนทดสอบ JSON	คำอธิบายบทเรียนทดสอบผ่าน JSON	https://www.youtube.com/watch?v=dQw4w9WgXcQ	t	f	\N	2025-04-11 13:39:40.793022	2025-04-11 13:39:40.793022	\N	2
3	อะไรเอ้ย	หหห5555	https://www.youtube.com/watch?v=C2RGkVVpD84	f	f	\N	2025-04-11 14:09:13.01371	2025-04-11 14:09:13.01371	\N	2
4	sda	adas	https://www.youtube.com/watch?v=gqOZjgLqck8&t=3051s	t	f	\N	2025-04-11 14:59:17.95012	2025-04-11 14:59:17.95012	\N	2
5	ไม่มี	วิชาหลัก	https://www.youtube.com/watch?v=C2RGkVVpD84	f	f	\N	2025-04-12 05:11:51.037662	2025-04-12 05:11:51.037662	\N	2
7	บทที่ 1 การทดสอบ	อะไร	https://www.youtube.com/watch?v=dJ9uVVNWClk	f	f	\N	2025-04-12 07:40:26.501447	2025-04-13 00:28:00.643935	\N	2
8	ฟหกฟหก	กฟหกฟกฟกฟหก	https://www.youtube.com/watch?v=dJ9uVVNWClk	f	f	12	2025-04-17 14:35:21.877745	2025-04-17 14:35:21.877745	\N	2
9	sadasd	asdasd	https://www.youtube.com/watch?v=SnlNirKhMvI	f	f	12	2025-04-18 06:56:34.769787	2025-04-18 06:56:34.769787	\N	2
10	มีแบบทดสอบ		https://www.youtube.com/watch?v=wv5ZbrXSD28	f	f	12	2025-04-18 07:00:16.830088	2025-04-18 07:00:16.830088	\N	2
11	test	.....0	https://youtu.be/eKL3TceSxvk?si=UuEwta5fZlUqklmE	f	f	14	2025-04-19 00:54:38.382774	2025-04-19 00:54:38.382774	\N	2
\.


--
-- TOC entry 3782 (class 0 OID 16484)
-- Dependencies: 222
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (question_id, title, description, type, score, created_at, updated_at) FROM stdin;
2	ทดสอบ	ทดสอบ	MC	4	2025-04-11 09:30:27.408717	2025-04-11 09:30:27.408717
3	กก	กก	SC	1	2025-04-11 09:39:36.976332	2025-04-11 09:39:36.976332
9	s	ss	TF	1	2025-04-11 09:58:28.809462	2025-04-11 09:58:28.809462
10	sssฟหกฟ	ss	MC	1	2025-04-11 09:58:57.279074	2025-04-11 09:58:57.279074
11	ข้อใดคือภาษาโปรแกรมมิ่งที่ใช้ในการพัฒนาเว็บไซต์?	เลือกคำตอบที่ถูกต้องที่สุด	SC	1	2025-04-11 13:10:41.297621	2025-04-11 13:10:41.297621
12	ข้อใดเป็นภาษาโปรแกรมมิ่ง?	เลือกคำตอบที่ถูกต้องทั้งหมด	MC	2	2025-04-11 13:10:59.963368	2025-04-11 13:10:59.963368
13	JavaScript เป็นภาษาโปรแกรมมิ่งที่ใช้ในการพัฒนาเว็บไซต์	พิจารณาว่าข้อความนี้ถูกหรือผิด	TF	1	2025-04-11 13:11:08.232636	2025-04-11 13:11:08.232636
14	อะไรเอ่ย	คำถามอะไรเอ่ย	MC	1	2025-04-11 13:12:07.124588	2025-04-11 13:12:07.124588
18	คำถามทดสอบ 1	1	MC	1	2025-04-12 07:39:01.436136	2025-04-13 00:22:09.137539
19	คำถามทดสอบ 2	เทส1	TF	1	2025-04-12 07:39:14.9922	2025-04-13 00:26:50.347459
20	คำถามทดสอบ 1	\N	MC	1	2025-04-13 00:42:55.630688	2025-04-13 00:42:55.630688
21	คำถามทดสอบ 2	23	TF	2	2025-04-13 00:42:55.630688	2025-04-13 00:43:58.002797
\.


--
-- TOC entry 3812 (class 0 OID 16860)
-- Dependencies: 252
-- Data for Name: quiz_attempt_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_attempt_answers (answer_id, attempt_id, question_id, choice_id, text_answer, is_correct, score_earned, created_at) FROM stdin;
3	7	18	\N	[0,2]	f	0	2025-04-18 08:41:53.403593
4	7	19	\N	true	t	1	2025-04-18 08:41:53.403593
5	8	18	\N	[0,2]	f	0	2025-04-18 08:43:21.932164
6	8	19	\N	true	t	1	2025-04-18 08:43:21.932164
7	11	18	\N	[0,2]	f	0	2025-04-18 08:50:54.354744
8	11	19	\N	true	t	1	2025-04-18 08:50:54.354744
9	14	18	\N	[0,2]	f	0	2025-04-18 08:51:39.413425
10	14	19	\N	false	f	0	2025-04-18 08:51:39.413425
11	17	18	\N	[2,1]	f	0	2025-04-18 09:28:52.939581
12	17	19	\N	false	f	0	2025-04-18 09:28:52.939581
13	20	18	\N	\N	f	0	2025-04-19 15:30:32.336959
14	20	19	\N	\N	f	0	2025-04-19 15:30:32.336959
15	21	18	\N	[1,2]	f	0	2025-04-19 15:32:12.337593
16	21	19	\N	false	f	0	2025-04-19 15:32:12.337593
17	24	18	\N	[0,2]	f	0	2025-04-19 15:36:44.978354
18	24	19	\N	true	t	1	2025-04-19 15:36:44.978354
19	27	18	\N	[0,1]	f	0	2025-04-19 15:47:30.638429
20	27	19	\N	true	t	1	2025-04-19 15:47:30.638429
21	28	18	\N	[0,1]	f	0	2025-04-19 15:47:31.279985
22	28	19	\N	true	t	1	2025-04-19 15:47:31.279985
23	31	18	\N	[0,2]	f	0	2025-04-19 15:51:15.895906
24	31	19	\N	true	t	1	2025-04-19 15:51:15.895906
25	34	18	\N	[0,2]	f	0	2025-04-19 15:51:30.417924
26	34	19	\N	false	f	0	2025-04-19 15:51:30.417924
27	37	18	\N	[0,2]	f	0	2025-04-19 15:52:48.111072
28	37	19	\N	false	f	0	2025-04-19 15:52:48.111072
29	40	18	\N	[0,2]	f	0	2025-04-19 15:56:11.968873
30	40	19	\N	false	f	0	2025-04-19 15:56:11.968873
31	43	18	\N	[1,2]	f	0	2025-04-19 15:58:21.915125
32	43	19	\N	true	t	1	2025-04-19 15:58:21.915125
33	46	18	\N	[0,2]	f	0	2025-04-19 16:00:10.01541
34	46	19	\N	true	t	1	2025-04-19 16:00:10.01541
35	49	18	\N	[0,2]	f	0	2025-04-19 16:03:26.413829
36	49	19	\N	false	f	0	2025-04-19 16:03:26.413829
37	52	18	\N	[0,2]	f	0	2025-04-19 16:04:11.073091
38	52	19	\N	false	f	0	2025-04-19 16:04:11.073091
39	55	18	\N	[2,1]	f	0	2025-04-19 16:07:55.813622
40	55	19	\N	false	f	0	2025-04-19 16:07:55.813622
41	58	18	\N	[0,2]	f	0	2025-04-19 16:08:06.013026
42	58	19	\N	false	f	0	2025-04-19 16:08:06.013026
43	60	18	\N	[0,2]	f	0	2025-04-19 16:08:38.494297
44	60	19	\N	false	f	0	2025-04-19 16:08:38.494297
45	63	18	\N	[1,0]	f	0	2025-04-19 16:13:17.593493
46	63	19	\N	false	f	0	2025-04-19 16:13:17.593493
47	66	18	\N	[0,1]	f	0	2025-04-19 16:26:13.248085
48	66	19	\N	false	f	0	2025-04-19 16:26:13.248085
49	69	18	\N	[0,2]	f	0	2025-04-19 16:26:27.396623
50	69	19	\N	true	t	1	2025-04-19 16:26:27.396623
51	72	18	\N	[1,0]	f	0	2025-04-19 16:44:59.945369
52	72	19	\N	true	t	1	2025-04-19 16:44:59.945369
53	75	18	\N	[0,2]	f	0	2025-04-19 16:50:08.977802
54	75	19	\N	false	f	0	2025-04-19 16:50:08.977802
55	78	18	\N	[0,2]	f	0	2025-04-19 16:53:13.175964
56	78	19	\N	false	f	0	2025-04-19 16:53:13.175964
57	81	18	\N	[0,2]	f	0	2025-04-19 16:56:58.197401
58	81	19	\N	false	f	0	2025-04-19 16:56:58.197401
59	84	18	\N	[1,2]	f	0	2025-04-19 17:01:55.914813
60	84	19	\N	false	f	0	2025-04-19 17:01:55.914813
61	87	18	\N	[0,2]	f	0	2025-04-19 17:03:54.554875
62	87	19	\N	false	f	0	2025-04-19 17:03:54.554875
63	90	18	\N	[2,0]	f	0	2025-04-19 17:05:22.657562
64	90	19	\N	true	t	1	2025-04-19 17:05:22.657562
65	93	18	\N	[0,2]	f	0	2025-04-19 17:21:07.255487
66	93	19	\N	true	t	1	2025-04-19 17:21:07.255487
67	96	18	\N	[0,2]	f	0	2025-04-19 17:22:44.335914
68	96	19	\N	true	t	1	2025-04-19 17:22:44.335914
69	99	18	\N	[0,2]	f	0	2025-04-19 17:25:34.595067
70	99	19	\N	false	f	0	2025-04-19 17:25:34.595067
71	102	9	\N	true	t	1	2025-04-19 17:26:06.954547
72	102	10	\N	[1,2]	f	0	2025-04-19 17:26:06.954547
73	105	9	\N	true	t	1	2025-04-19 17:27:55.435477
74	105	10	\N	[0,2]	f	0	2025-04-19 17:27:55.435477
75	108	9	\N	true	t	1	2025-04-19 17:31:54.414648
76	108	10	\N	[1,2]	f	0	2025-04-19 17:31:54.414648
\.


--
-- TOC entry 3810 (class 0 OID 16835)
-- Dependencies: 250
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_attempts (attempt_id, user_id, quiz_id, start_time, end_time, score, max_score, passed, status, created_at, updated_at) FROM stdin;
7	1	13	2025-04-18 08:41:53.403593	2025-04-18 08:41:53.403593	1	2	f	completed	2025-04-18 08:41:53.403593	2025-04-18 08:41:53.403593
8	1	13	2025-04-18 08:43:21.932164	2025-04-18 08:43:21.932164	1	2	f	completed	2025-04-18 08:43:21.932164	2025-04-18 08:43:21.932164
9	1	13	2025-04-18 08:50:36.411837	2025-04-18 08:50:36.411837	0	0	f	completed	2025-04-18 08:50:36.411837	2025-04-18 08:50:36.411837
10	1	13	2025-04-18 08:50:36.559269	2025-04-18 08:50:36.559269	0	0	f	completed	2025-04-18 08:50:36.559269	2025-04-18 08:50:36.559269
11	1	13	2025-04-18 08:50:54.354744	2025-04-18 08:50:54.354744	1	2	f	completed	2025-04-18 08:50:54.354744	2025-04-18 08:50:54.354744
12	1	13	2025-04-18 08:50:55.904849	2025-04-18 08:50:55.904849	0	0	f	completed	2025-04-18 08:50:55.904849	2025-04-18 08:50:55.904849
13	1	13	2025-04-18 08:50:56.004943	2025-04-18 08:50:56.004943	0	0	f	completed	2025-04-18 08:50:56.004943	2025-04-18 08:50:56.004943
14	1	13	2025-04-18 08:51:39.413425	2025-04-18 08:51:39.413425	0	2	f	completed	2025-04-18 08:51:39.413425	2025-04-18 08:51:39.413425
15	1	13	2025-04-18 08:51:40.931272	2025-04-18 08:51:40.931272	0	0	f	completed	2025-04-18 08:51:40.931272	2025-04-18 08:51:40.931272
16	1	13	2025-04-18 08:51:41.02134	2025-04-18 08:51:41.02134	0	0	f	completed	2025-04-18 08:51:41.02134	2025-04-18 08:51:41.02134
17	1	13	2025-04-18 09:28:52.939581	2025-04-18 09:28:52.939581	0	2	f	completed	2025-04-18 09:28:52.939581	2025-04-18 09:28:52.939581
18	1	13	2025-04-18 09:28:53.830994	2025-04-18 09:28:53.830994	0	0	f	completed	2025-04-18 09:28:53.830994	2025-04-18 09:28:53.830994
19	1	13	2025-04-18 09:28:53.948134	2025-04-18 09:28:53.948134	0	0	f	completed	2025-04-18 09:28:53.948134	2025-04-18 09:28:53.948134
20	1	13	2025-04-19 15:30:32.336959	2025-04-19 15:30:32.336959	0	2	f	completed	2025-04-19 15:30:32.336959	2025-04-19 15:30:32.336959
21	1	13	2025-04-19 15:32:12.337593	2025-04-19 15:32:12.337593	0	2	f	completed	2025-04-19 15:32:12.337593	2025-04-19 15:32:12.337593
22	1	13	2025-04-19 15:32:14.018358	2025-04-19 15:32:14.018358	0	0	f	completed	2025-04-19 15:32:14.018358	2025-04-19 15:32:14.018358
23	1	13	2025-04-19 15:32:14.118574	2025-04-19 15:32:14.118574	0	0	f	completed	2025-04-19 15:32:14.118574	2025-04-19 15:32:14.118574
24	1	13	2025-04-19 15:36:44.978354	2025-04-19 15:36:44.978354	1	2	f	completed	2025-04-19 15:36:44.978354	2025-04-19 15:36:44.978354
25	1	13	2025-04-19 15:36:46.639194	2025-04-19 15:36:46.639194	0	0	f	completed	2025-04-19 15:36:46.639194	2025-04-19 15:36:46.639194
26	1	13	2025-04-19 15:36:46.759255	2025-04-19 15:36:46.759255	0	0	f	completed	2025-04-19 15:36:46.759255	2025-04-19 15:36:46.759255
27	1	13	2025-04-19 15:47:30.638429	2025-04-19 15:47:30.638429	1	2	f	completed	2025-04-19 15:47:30.638429	2025-04-19 15:47:30.638429
28	1	13	2025-04-19 15:47:31.279985	2025-04-19 15:47:31.279985	1	2	f	completed	2025-04-19 15:47:31.279985	2025-04-19 15:47:31.279985
29	1	13	2025-04-19 15:47:32.178681	2025-04-19 15:47:32.178681	0	0	f	completed	2025-04-19 15:47:32.178681	2025-04-19 15:47:32.178681
30	1	13	2025-04-19 15:47:32.267964	2025-04-19 15:47:32.267964	0	0	f	completed	2025-04-19 15:47:32.267964	2025-04-19 15:47:32.267964
31	1	13	2025-04-19 15:51:15.895906	2025-04-19 15:51:15.895906	1	2	f	completed	2025-04-19 15:51:15.895906	2025-04-19 15:51:15.895906
32	1	13	2025-04-19 15:51:17.519185	2025-04-19 15:51:17.519185	0	0	f	completed	2025-04-19 15:51:17.519185	2025-04-19 15:51:17.519185
33	1	13	2025-04-19 15:51:17.616392	2025-04-19 15:51:17.616392	0	0	f	completed	2025-04-19 15:51:17.616392	2025-04-19 15:51:17.616392
34	1	13	2025-04-19 15:51:30.417924	2025-04-19 15:51:30.417924	0	2	f	completed	2025-04-19 15:51:30.417924	2025-04-19 15:51:30.417924
35	1	13	2025-04-19 15:51:31.917087	2025-04-19 15:51:31.917087	0	0	f	completed	2025-04-19 15:51:31.917087	2025-04-19 15:51:31.917087
36	1	13	2025-04-19 15:51:32.016493	2025-04-19 15:51:32.016493	0	0	f	completed	2025-04-19 15:51:32.016493	2025-04-19 15:51:32.016493
37	1	13	2025-04-19 15:52:48.111072	2025-04-19 15:52:48.111072	0	2	f	completed	2025-04-19 15:52:48.111072	2025-04-19 15:52:48.111072
38	1	13	2025-04-19 15:52:49.536613	2025-04-19 15:52:49.536613	0	0	f	completed	2025-04-19 15:52:49.536613	2025-04-19 15:52:49.536613
39	1	13	2025-04-19 15:52:49.625601	2025-04-19 15:52:49.625601	0	0	f	completed	2025-04-19 15:52:49.625601	2025-04-19 15:52:49.625601
40	1	13	2025-04-19 15:56:11.968873	2025-04-19 15:56:11.968873	0	2	f	completed	2025-04-19 15:56:11.968873	2025-04-19 15:56:11.968873
41	1	13	2025-04-19 15:56:13.314621	2025-04-19 15:56:13.314621	0	0	f	completed	2025-04-19 15:56:13.314621	2025-04-19 15:56:13.314621
42	1	13	2025-04-19 15:56:13.414941	2025-04-19 15:56:13.414941	0	0	f	completed	2025-04-19 15:56:13.414941	2025-04-19 15:56:13.414941
43	1	13	2025-04-19 15:58:21.915125	2025-04-19 15:58:21.915125	1	2	f	completed	2025-04-19 15:58:21.915125	2025-04-19 15:58:21.915125
44	1	13	2025-04-19 15:58:23.196066	2025-04-19 15:58:23.196066	0	0	f	completed	2025-04-19 15:58:23.196066	2025-04-19 15:58:23.196066
45	1	13	2025-04-19 15:58:23.295073	2025-04-19 15:58:23.295073	0	0	f	completed	2025-04-19 15:58:23.295073	2025-04-19 15:58:23.295073
46	1	13	2025-04-19 16:00:10.01541	2025-04-19 16:00:10.01541	1	2	f	completed	2025-04-19 16:00:10.01541	2025-04-19 16:00:10.01541
47	1	13	2025-04-19 16:00:11.415575	2025-04-19 16:00:11.415575	0	0	f	completed	2025-04-19 16:00:11.415575	2025-04-19 16:00:11.415575
48	1	13	2025-04-19 16:00:11.51517	2025-04-19 16:00:11.51517	0	0	f	completed	2025-04-19 16:00:11.51517	2025-04-19 16:00:11.51517
49	1	13	2025-04-19 16:03:26.413829	2025-04-19 16:03:26.413829	0	2	f	completed	2025-04-19 16:03:26.413829	2025-04-19 16:03:26.413829
50	1	13	2025-04-19 16:03:27.874548	2025-04-19 16:03:27.874548	0	0	f	completed	2025-04-19 16:03:27.874548	2025-04-19 16:03:27.874548
51	1	13	2025-04-19 16:03:27.972963	2025-04-19 16:03:27.972963	0	0	f	completed	2025-04-19 16:03:27.972963	2025-04-19 16:03:27.972963
52	1	13	2025-04-19 16:04:11.073091	2025-04-19 16:04:11.073091	0	2	f	completed	2025-04-19 16:04:11.073091	2025-04-19 16:04:11.073091
53	1	13	2025-04-19 16:04:12.693536	2025-04-19 16:04:12.693536	0	0	f	completed	2025-04-19 16:04:12.693536	2025-04-19 16:04:12.693536
54	1	13	2025-04-19 16:04:12.793886	2025-04-19 16:04:12.793886	0	0	f	completed	2025-04-19 16:04:12.793886	2025-04-19 16:04:12.793886
55	1	13	2025-04-19 16:07:55.813622	2025-04-19 16:07:55.813622	0	2	f	completed	2025-04-19 16:07:55.813622	2025-04-19 16:07:55.813622
56	1	13	2025-04-19 16:07:57.492519	2025-04-19 16:07:57.492519	0	0	f	completed	2025-04-19 16:07:57.492519	2025-04-19 16:07:57.492519
57	1	13	2025-04-19 16:07:57.592606	2025-04-19 16:07:57.592606	0	0	f	completed	2025-04-19 16:07:57.592606	2025-04-19 16:07:57.592606
58	1	13	2025-04-19 16:08:06.013026	2025-04-19 16:08:06.013026	0	2	f	completed	2025-04-19 16:08:06.013026	2025-04-19 16:08:06.013026
59	1	13	2025-04-19 16:08:07.513119	2025-04-19 16:08:07.513119	0	0	f	completed	2025-04-19 16:08:07.513119	2025-04-19 16:08:07.513119
60	1	13	2025-04-19 16:08:38.494297	2025-04-19 16:08:38.494297	0	2	f	completed	2025-04-19 16:08:38.494297	2025-04-19 16:08:38.494297
61	1	13	2025-04-19 16:08:39.874929	2025-04-19 16:08:39.874929	0	0	f	completed	2025-04-19 16:08:39.874929	2025-04-19 16:08:39.874929
62	1	13	2025-04-19 16:08:39.97415	2025-04-19 16:08:39.97415	0	0	f	completed	2025-04-19 16:08:39.97415	2025-04-19 16:08:39.97415
63	1	13	2025-04-19 16:13:17.593493	2025-04-19 16:13:17.593493	0	2	f	completed	2025-04-19 16:13:17.593493	2025-04-19 16:13:17.593493
64	1	13	2025-04-19 16:13:19.75402	2025-04-19 16:13:19.75402	0	0	f	completed	2025-04-19 16:13:19.75402	2025-04-19 16:13:19.75402
65	1	13	2025-04-19 16:13:19.854729	2025-04-19 16:13:19.854729	0	0	f	completed	2025-04-19 16:13:19.854729	2025-04-19 16:13:19.854729
66	1	13	2025-04-19 16:26:13.248085	2025-04-19 16:26:13.248085	0	2	f	completed	2025-04-19 16:26:13.248085	2025-04-19 16:26:13.248085
67	1	13	2025-04-19 16:26:16.896425	2025-04-19 16:26:16.896425	0	0	f	completed	2025-04-19 16:26:16.896425	2025-04-19 16:26:16.896425
68	1	13	2025-04-19 16:26:16.995457	2025-04-19 16:26:16.995457	0	0	f	completed	2025-04-19 16:26:16.995457	2025-04-19 16:26:16.995457
69	1	13	2025-04-19 16:26:27.396623	2025-04-19 16:26:27.396623	1	2	f	completed	2025-04-19 16:26:27.396623	2025-04-19 16:26:27.396623
70	1	13	2025-04-19 16:26:51.72295	2025-04-19 16:26:51.72295	0	0	f	completed	2025-04-19 16:26:51.72295	2025-04-19 16:26:51.72295
71	1	13	2025-04-19 16:26:51.816125	2025-04-19 16:26:51.816125	0	0	f	completed	2025-04-19 16:26:51.816125	2025-04-19 16:26:51.816125
72	1	13	2025-04-19 16:44:59.945369	2025-04-19 16:44:59.945369	1	2	f	completed	2025-04-19 16:44:59.945369	2025-04-19 16:44:59.945369
73	1	13	2025-04-19 16:45:01.415739	2025-04-19 16:45:01.415739	0	0	f	completed	2025-04-19 16:45:01.415739	2025-04-19 16:45:01.415739
74	1	13	2025-04-19 16:45:01.515775	2025-04-19 16:45:01.515775	0	0	f	completed	2025-04-19 16:45:01.515775	2025-04-19 16:45:01.515775
75	1	13	2025-04-19 16:50:08.977802	2025-04-19 16:50:08.977802	0	2	f	completed	2025-04-19 16:50:08.977802	2025-04-19 16:50:08.977802
76	1	13	2025-04-19 16:50:13.774836	2025-04-19 16:50:13.774836	0	0	f	completed	2025-04-19 16:50:13.774836	2025-04-19 16:50:13.774836
77	1	13	2025-04-19 16:50:13.877491	2025-04-19 16:50:13.877491	0	0	f	completed	2025-04-19 16:50:13.877491	2025-04-19 16:50:13.877491
78	1	13	2025-04-19 16:53:13.175964	2025-04-19 16:53:13.175964	0	2	f	completed	2025-04-19 16:53:13.175964	2025-04-19 16:53:13.175964
79	1	13	2025-04-19 16:53:14.594891	2025-04-19 16:53:14.594891	0	0	f	completed	2025-04-19 16:53:14.594891	2025-04-19 16:53:14.594891
80	1	13	2025-04-19 16:53:14.695447	2025-04-19 16:53:14.695447	0	0	f	completed	2025-04-19 16:53:14.695447	2025-04-19 16:53:14.695447
81	1	13	2025-04-19 16:56:58.197401	2025-04-19 16:56:58.197401	0	2	f	completed	2025-04-19 16:56:58.197401	2025-04-19 16:56:58.197401
82	1	13	2025-04-19 16:56:59.776942	2025-04-19 16:56:59.776942	0	0	f	completed	2025-04-19 16:56:59.776942	2025-04-19 16:56:59.776942
83	1	13	2025-04-19 16:56:59.877645	2025-04-19 16:56:59.877645	0	0	f	completed	2025-04-19 16:56:59.877645	2025-04-19 16:56:59.877645
84	1	13	2025-04-19 17:01:55.914813	2025-04-19 17:01:55.914813	0	2	f	completed	2025-04-19 17:01:55.914813	2025-04-19 17:01:55.914813
85	1	13	2025-04-19 17:01:57.214504	2025-04-19 17:01:57.214504	0	0	f	completed	2025-04-19 17:01:57.214504	2025-04-19 17:01:57.214504
86	1	13	2025-04-19 17:01:57.314606	2025-04-19 17:01:57.314606	0	0	f	completed	2025-04-19 17:01:57.314606	2025-04-19 17:01:57.314606
87	1	13	2025-04-19 17:03:54.554875	2025-04-19 17:03:54.554875	0	2	f	completed	2025-04-19 17:03:54.554875	2025-04-19 17:03:54.554875
88	1	13	2025-04-19 17:03:56.713973	2025-04-19 17:03:56.713973	0	0	f	completed	2025-04-19 17:03:56.713973	2025-04-19 17:03:56.713973
89	1	13	2025-04-19 17:03:56.814295	2025-04-19 17:03:56.814295	0	0	f	completed	2025-04-19 17:03:56.814295	2025-04-19 17:03:56.814295
90	1	13	2025-04-19 17:05:22.657562	2025-04-19 17:05:22.657562	1	2	f	completed	2025-04-19 17:05:22.657562	2025-04-19 17:05:22.657562
91	1	13	2025-04-19 17:05:24.958322	2025-04-19 17:05:24.958322	0	0	f	completed	2025-04-19 17:05:24.958322	2025-04-19 17:05:24.958322
92	1	13	2025-04-19 17:05:25.049459	2025-04-19 17:05:25.049459	0	0	f	completed	2025-04-19 17:05:25.049459	2025-04-19 17:05:25.049459
93	1	13	2025-04-19 17:21:07.255487	2025-04-19 17:21:07.255487	1	2	f	completed	2025-04-19 17:21:07.255487	2025-04-19 17:21:07.255487
94	1	13	2025-04-19 17:21:08.656938	2025-04-19 17:21:08.656938	0	0	f	completed	2025-04-19 17:21:08.656938	2025-04-19 17:21:08.656938
95	1	13	2025-04-19 17:21:08.75766	2025-04-19 17:21:08.75766	0	0	f	completed	2025-04-19 17:21:08.75766	2025-04-19 17:21:08.75766
96	1	13	2025-04-19 17:22:44.335914	2025-04-19 17:22:44.335914	1	2	f	completed	2025-04-19 17:22:44.335914	2025-04-19 17:22:44.335914
97	1	13	2025-04-19 17:22:45.896396	2025-04-19 17:22:45.896396	0	0	f	completed	2025-04-19 17:22:45.896396	2025-04-19 17:22:45.896396
98	1	13	2025-04-19 17:22:45.994464	2025-04-19 17:22:45.994464	0	0	f	completed	2025-04-19 17:22:45.994464	2025-04-19 17:22:45.994464
99	1	13	2025-04-19 17:25:34.595067	2025-04-19 17:25:34.595067	0	2	f	completed	2025-04-19 17:25:34.595067	2025-04-19 17:25:34.595067
100	1	13	2025-04-19 17:25:36.214249	2025-04-19 17:25:36.214249	0	0	f	completed	2025-04-19 17:25:36.214249	2025-04-19 17:25:36.214249
101	1	13	2025-04-19 17:25:36.334631	2025-04-19 17:25:36.334631	0	0	f	completed	2025-04-19 17:25:36.334631	2025-04-19 17:25:36.334631
102	1	7	2025-04-19 17:26:06.954547	2025-04-19 17:26:06.954547	1	2	f	completed	2025-04-19 17:26:06.954547	2025-04-19 17:26:06.954547
103	1	7	2025-04-19 17:26:08.513489	2025-04-19 17:26:08.513489	0	0	f	completed	2025-04-19 17:26:08.513489	2025-04-19 17:26:08.513489
104	1	7	2025-04-19 17:26:08.613684	2025-04-19 17:26:08.613684	0	0	f	completed	2025-04-19 17:26:08.613684	2025-04-19 17:26:08.613684
105	1	7	2025-04-19 17:27:55.435477	2025-04-19 17:27:55.435477	1	2	f	completed	2025-04-19 17:27:55.435477	2025-04-19 17:27:55.435477
106	1	7	2025-04-19 17:27:56.935346	2025-04-19 17:27:56.935346	0	0	f	completed	2025-04-19 17:27:56.935346	2025-04-19 17:27:56.935346
107	1	7	2025-04-19 17:27:57.035852	2025-04-19 17:27:57.035852	0	0	f	completed	2025-04-19 17:27:57.035852	2025-04-19 17:27:57.035852
108	1	7	2025-04-19 17:31:54.414648	2025-04-19 17:31:54.414648	1	2	f	completed	2025-04-19 17:31:54.414648	2025-04-19 17:31:54.414648
109	1	7	2025-04-19 17:31:56.373326	2025-04-19 17:31:56.373326	0	0	f	completed	2025-04-19 17:31:56.373326	2025-04-19 17:31:56.373326
110	1	7	2025-04-19 17:31:56.473638	2025-04-19 17:31:56.473638	0	0	f	completed	2025-04-19 17:31:56.473638	2025-04-19 17:31:56.473638
\.


--
-- TOC entry 3813 (class 0 OID 16887)
-- Dependencies: 253
-- Data for Name: quiz_lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_lessons (quiz_id, lesson_id) FROM stdin;
\.


--
-- TOC entry 3829 (class 0 OID 17063)
-- Dependencies: 269
-- Data for Name: quiz_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_progress (progress_id, user_id, quiz_id, completed, completion_date, score, passing_score, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3787 (class 0 OID 16584)
-- Dependencies: 227
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_questions (quiz_id, question_id) FROM stdin;
7	9
7	10
8	14
12	13
12	12
12	11
12	10
12	9
13	18
13	19
14	20
14	21
\.


--
-- TOC entry 3786 (class 0 OID 16564)
-- Dependencies: 226
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quizzes (quiz_id, title, description, time_limit_enabled, time_limit_value, time_limit_unit, passing_score_enabled, passing_score_value, attempts_limited, attempts_unlimited, attempts_value, status, created_at, updated_at, type) FROM stdin;
7	แบบทดสอบพื้นฐาน	แบบทดสอบสำหรับทดสอบระบบ	t	30	minutes	t	70	t	f	2	draft	2025-04-11 09:57:49.832684	2025-04-11 09:57:49.832684	standard
8	แบบทดสอบพื้นฐาน	แบบทดสอบสำหรับทดสอบระบบ	t	30	minutes	t	70	t	f	2	draft	2025-04-11 13:09:13.602489	2025-04-11 13:09:13.602489	standard
12	กก	กก	f	60	minutes	f	0	t	f	1	active	2025-04-11 14:01:49.041736	2025-04-11 14:01:49.041736	\N
13	แบบทดสอบ 1 	\N	f	60	minutes	f	0	t	f	1	draft	2025-04-12 07:39:40.132537	2025-04-12 07:39:40.132537	\N
14	แบบทดสอบ 2		f	60	minutes	f	0	f	t	1	active	2025-04-12 07:40:00.542846	2025-04-13 01:06:00.062158	\N
\.


--
-- TOC entry 3776 (class 0 OID 16445)
-- Dependencies: 216
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, role_name, description, created_at) FROM stdin;
1	student	นักเรียนทั่วไป	2025-04-01 01:39:03.03677
2	instructor	ผู้สอน	2025-04-01 01:39:03.03677
4	admin	ผู้ดูแลระบบ	2025-04-01 01:39:03.03677
3	manager	ผู้จัดการหลักสูตร	2025-04-01 01:39:03.03677
\.


--
-- TOC entry 3799 (class 0 OID 16723)
-- Dependencies: 239
-- Data for Name: section_lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section_lessons (section_id, lesson_id, order_number) FROM stdin;
\.


--
-- TOC entry 3821 (class 0 OID 16974)
-- Dependencies: 261
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (student_id, user_id, student_code, department_id, education_level, created_at, updated_at) FROM stdin;
1	9	653170000000	1	มัธยมต้น	2025-04-18 00:45:35.945583	2025-04-18 00:45:35.945583
2	10	653170000001	1	มัธยมต้น	2025-04-18 01:13:29.977221	2025-04-18 01:13:29.977221
11	25	650112345	1	ปริญญาตรี	2025-04-18 10:47:55.027899	2025-04-18 10:47:55.027899
\.


--
-- TOC entry 3805 (class 0 OID 16777)
-- Dependencies: 245
-- Data for Name: subject_instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_instructors (subject_id, instructor_id) FROM stdin;
\.


--
-- TOC entry 3806 (class 0 OID 16792)
-- Dependencies: 246
-- Data for Name: subject_lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_lessons (subject_id, lesson_id, order_number) FROM stdin;
4	1	1
4	3	2
6	3	1
6	1	2
6	4	3
8	7	1
8	5	2
9	7	1
10	5	1
10	4	2
10	3	3
10	1	4
10	7	5
11	9	1
11	8	2
12	10	1
\.


--
-- TOC entry 3827 (class 0 OID 17026)
-- Dependencies: 267
-- Data for Name: subject_prerequisites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_prerequisites (id, subject_id, prerequisite_id, created_at) FROM stdin;
1	4	10	2025-04-17 16:15:23.468336
2	10	8	2025-04-17 16:15:23.468336
3	8	9	2025-04-17 16:15:23.468336
4	9	8	2025-04-17 16:19:52.748573
5	9	4	2025-04-17 16:19:52.748573
7	8	10	2025-04-17 16:19:52.748573
8	8	6	2025-04-17 16:19:52.748573
9	8	4	2025-04-17 16:19:52.748573
\.


--
-- TOC entry 3793 (class 0 OID 16645)
-- Dependencies: 233
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (subject_id, code, title, description, credits, department, cover_image_path, allow_all_lessons, pre_test_id, post_test_id, status, created_at, updated_at) FROM stdin;
4	CS4223	การเขียนโปรแกรมเว็บขั้นสูง	รายวิชาเกี่ยวกับการพัฒนาเว็บแอปพลิเคชันขั้นสูงด้วย Node.js และ React	3	1	\N	t	\N	\N	active	2025-04-11 14:43:51.840954	2025-04-11 14:43:51.840954
6	adasd	asda		3	\N	\N	f	8	7	active	2025-04-11 15:30:56.54441	2025-04-11 15:30:56.54441
8	TH-8000	วิชาภาษาเอก 		3	\N	\N	f	13	14	active	2025-04-12 07:40:55.663519	2025-04-12 07:40:55.663519
9	101212	ทดสอบเทส ๆ	เทส	3	\N	/app/uploads/subjects/covers/subject-cover-1744465503653-207860860.png	f	14	13	inactive	2025-04-12 13:45:03.722141	2025-04-13 05:09:45.446
10	dsadasd	adadsd	asdadadadadad	3	\N	\N	f	13	13	active	2025-04-17 14:29:06.079374	2025-04-17 14:29:06.079374
11	asdasd	asdasd	asdasd	3	\N	\N	f	7	8	active	2025-04-18 06:57:55.499413	2025-04-18 06:57:55.499413
12	112ฟหก	มีแบบทดสอบ	ฟหก	3	\N	\N	f	13	14	active	2025-04-18 07:00:40.761758	2025-04-18 07:00:40.761758
\.


--
-- TOC entry 3778 (class 0 OID 16457)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password, role_id, created_at, updated_at, status, username, first_name, last_name) FROM stdin;
1	email@example.com	$2b$10$FMakc9xhps3RwVSm.XKEyuaQ6vThtlcxF0naojYN5ZL4h9lzb/wlW	1	2025-03-31 19:26:32.153598	2025-03-31 19:26:32.153598	active	email	jakkapat	
2	admin@example.com	$2b$10$LKzv0BnS2xN94Cjdt3KQmu4LIBSO0Mn7CBPy0Ua2a7lyOu79tBsNi	4	2025-04-01 09:02:33.648537	2025-04-01 09:02:33.648537	active	admin	Admin	
3	instructor@example.com	$2b$10$X8u28AV.ZN9Qz09IdqTh5uN.3EkI88GRsszJpA.D4SY3WXRgBGswe	2	2025-04-01 10:59:03.150143	2025-04-01 10:59:03.150143	active	instructor	Instructor	
5	instructor1@example.com	$2b$10$NEsC1nckJ67urGI01o.sK.c./yQIsLpZJpzw7O.TBkODSv/G7TCMe	2	2025-04-12 07:20:46.36414	2025-04-12 07:20:46.36414	active	instructor1	ชื่อ	นามสกุล
6	asdasd@gmail.com	$2b$10$TKPSVb.Q.7jEzqY/9ua0P.aktz6IQ9SDYkBOXFtwKLt6bIiK2oSA.	2	2025-04-12 07:30:18.462773	2025-04-12 07:30:18.462773	active	asdsad	adads	das
7	a@a.com	$2b$10$Xjm113nkGfDMhyJKJa35ZeCj58Z6rV8dNeWJIHbO8joVcQJr9pTS.	2	2025-04-12 08:52:28.276675	2025-04-12 08:52:28.276675	active	asss	asdad	sadasd
8	aaa@aaa.com	$2b$10$lnqDaREVDgi6xBg0o8YrAeZ3DEh1TTV53OAn5Pry9ed.tQmyLbfM.	2	2025-04-17 12:37:10.095991	2025-04-17 12:37:10.095991	active	main	aaa	aaa
9	test001@example.com	$2b$10$mzhz70n5mJPgTKhbipM6BeMD9WM8PIeb7SJNrffn93uAm/zIzQWbe	1	2025-04-18 00:45:35.945583	2025-04-18 00:45:35.945583	active	\N	\N	\N
10	test002@example.com	$2b$10$BtQzWSMnYxOzW6TdSQZ0uuGCqyU7teE1/eL7QvKbQoBxzYqpIm2mO	1	2025-04-18 01:13:29.977221	2025-04-18 01:13:29.977221	active	\N	\N	\N
25	johndoe1@example.com	$2b$10$PhCkp0lzRa0Ryhjz7Roawu.dnCauqCikOXk10cyQ6eggHOqtQfHkC	1	2025-04-18 10:47:55.027899	2025-04-18 10:47:55.027899	active	johndoe1234	John	Doe
\.


--
-- TOC entry 3859 (class 0 OID 0)
-- Dependencies: 262
-- Name: admins_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_admin_id_seq', 1, false);


--
-- TOC entry 3860 (class 0 OID 0)
-- Dependencies: 219
-- Name: blacklisted_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blacklisted_tokens_id_seq', 71, true);


--
-- TOC entry 3861 (class 0 OID 0)
-- Dependencies: 223
-- Name: choices_choice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.choices_choice_id_seq', 55, true);


--
-- TOC entry 3862 (class 0 OID 0)
-- Dependencies: 264
-- Name: course_enrollments_enrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_enrollments_enrollment_id_seq', 7, true);


--
-- TOC entry 3863 (class 0 OID 0)
-- Dependencies: 256
-- Name: course_lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_lessons_id_seq', 1, false);


--
-- TOC entry 3864 (class 0 OID 0)
-- Dependencies: 240
-- Name: courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_course_id_seq', 13, true);


--
-- TOC entry 3865 (class 0 OID 0)
-- Dependencies: 254
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 3, true);


--
-- TOC entry 3866 (class 0 OID 0)
-- Dependencies: 247
-- Name: enrollments_enrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enrollments_enrollment_id_seq', 7, true);


--
-- TOC entry 3867 (class 0 OID 0)
-- Dependencies: 243
-- Name: instructors_instructor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instructors_instructor_id_seq', 4, true);


--
-- TOC entry 3868 (class 0 OID 0)
-- Dependencies: 230
-- Name: lesson_files_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesson_files_file_id_seq', 1, false);


--
-- TOC entry 3869 (class 0 OID 0)
-- Dependencies: 235
-- Name: lesson_progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesson_progress_progress_id_seq', 5, true);


--
-- TOC entry 3870 (class 0 OID 0)
-- Dependencies: 237
-- Name: lesson_sections_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesson_sections_section_id_seq', 1, false);


--
-- TOC entry 3871 (class 0 OID 0)
-- Dependencies: 258
-- Name: lesson_videos_video_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesson_videos_video_id_seq', 10, true);


--
-- TOC entry 3872 (class 0 OID 0)
-- Dependencies: 228
-- Name: lessons_lesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_lesson_id_seq', 11, true);


--
-- TOC entry 3873 (class 0 OID 0)
-- Dependencies: 221
-- Name: questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_question_id_seq', 21, true);


--
-- TOC entry 3874 (class 0 OID 0)
-- Dependencies: 251
-- Name: quiz_attempt_answers_answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_attempt_answers_answer_id_seq', 76, true);


--
-- TOC entry 3875 (class 0 OID 0)
-- Dependencies: 249
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_attempts_attempt_id_seq', 110, true);


--
-- TOC entry 3876 (class 0 OID 0)
-- Dependencies: 268
-- Name: quiz_progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_progress_progress_id_seq', 1, false);


--
-- TOC entry 3877 (class 0 OID 0)
-- Dependencies: 225
-- Name: quizzes_quiz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quizzes_quiz_id_seq', 14, true);


--
-- TOC entry 3878 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 4, true);


--
-- TOC entry 3879 (class 0 OID 0)
-- Dependencies: 260
-- Name: students_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_student_id_seq', 11, true);


--
-- TOC entry 3880 (class 0 OID 0)
-- Dependencies: 266
-- Name: subject_prerequisites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subject_prerequisites_id_seq', 9, true);


--
-- TOC entry 3881 (class 0 OID 0)
-- Dependencies: 232
-- Name: subjects_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_subject_id_seq', 12, true);


--
-- TOC entry 3882 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 25, true);


--
-- TOC entry 3578 (class 2606 OID 17000)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 3515 (class 2606 OID 16482)
-- Name: blacklisted_tokens blacklisted_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens
    ADD CONSTRAINT blacklisted_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3519 (class 2606 OID 16508)
-- Name: choices choices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.choices
    ADD CONSTRAINT choices_pkey PRIMARY KEY (choice_id);


--
-- TOC entry 3580 (class 2606 OID 17024)
-- Name: course_enrollments course_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (enrollment_id);


--
-- TOC entry 3568 (class 2606 OID 16925)
-- Name: course_lessons course_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT course_lessons_pkey PRIMARY KEY (id);


--
-- TOC entry 3546 (class 2606 OID 16755)
-- Name: course_subjects course_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_pkey PRIMARY KEY (course_id, subject_id);


--
-- TOC entry 3544 (class 2606 OID 16750)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);


--
-- TOC entry 3566 (class 2606 OID 16911)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- TOC entry 3554 (class 2606 OID 16820)
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (enrollment_id);


--
-- TOC entry 3556 (class 2606 OID 16822)
-- Name: enrollments enrollments_user_id_subject_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_subject_id_key UNIQUE (user_id, subject_id);


--
-- TOC entry 3548 (class 2606 OID 16776)
-- Name: instructors instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_pkey PRIMARY KEY (instructor_id);


--
-- TOC entry 3529 (class 2606 OID 16627)
-- Name: lesson_files lesson_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_files
    ADD CONSTRAINT lesson_files_pkey PRIMARY KEY (file_id);


--
-- TOC entry 3535 (class 2606 OID 16695)
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 3537 (class 2606 OID 16697)
-- Name: lesson_progress lesson_progress_user_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);


--
-- TOC entry 3539 (class 2606 OID 16717)
-- Name: lesson_sections lesson_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_pkey PRIMARY KEY (section_id);


--
-- TOC entry 3533 (class 2606 OID 16673)
-- Name: lesson_subjects lesson_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_subjects
    ADD CONSTRAINT lesson_subjects_pkey PRIMARY KEY (lesson_id, subject_id);


--
-- TOC entry 3574 (class 2606 OID 16949)
-- Name: lesson_videos lesson_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_videos
    ADD CONSTRAINT lesson_videos_pkey PRIMARY KEY (video_id);


--
-- TOC entry 3527 (class 2606 OID 16612)
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (lesson_id);


--
-- TOC entry 3517 (class 2606 OID 16495)
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- TOC entry 3562 (class 2606 OID 16870)
-- Name: quiz_attempt_answers quiz_attempt_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_pkey PRIMARY KEY (answer_id);


--
-- TOC entry 3559 (class 2606 OID 16848)
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (attempt_id);


--
-- TOC entry 3564 (class 2606 OID 16891)
-- Name: quiz_lessons quiz_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_pkey PRIMARY KEY (quiz_id, lesson_id);


--
-- TOC entry 3586 (class 2606 OID 17073)
-- Name: quiz_progress quiz_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 3588 (class 2606 OID 17075)
-- Name: quiz_progress quiz_progress_user_id_quiz_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_user_id_quiz_id_key UNIQUE (user_id, quiz_id);


--
-- TOC entry 3525 (class 2606 OID 16588)
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (quiz_id, question_id);


--
-- TOC entry 3522 (class 2606 OID 16583)
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (quiz_id);


--
-- TOC entry 3506 (class 2606 OID 16453)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- TOC entry 3508 (class 2606 OID 16455)
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- TOC entry 3542 (class 2606 OID 16728)
-- Name: section_lessons section_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_pkey PRIMARY KEY (section_id, lesson_id);


--
-- TOC entry 3576 (class 2606 OID 16981)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- TOC entry 3550 (class 2606 OID 16781)
-- Name: subject_instructors subject_instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_pkey PRIMARY KEY (subject_id, instructor_id);


--
-- TOC entry 3552 (class 2606 OID 16797)
-- Name: subject_lessons subject_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_pkey PRIMARY KEY (subject_id, lesson_id);


--
-- TOC entry 3582 (class 2606 OID 17032)
-- Name: subject_prerequisites subject_prerequisites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_pkey PRIMARY KEY (id);


--
-- TOC entry 3584 (class 2606 OID 17034)
-- Name: subject_prerequisites subject_prerequisites_subject_id_prerequisite_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_subject_id_prerequisite_id_key UNIQUE (subject_id, prerequisite_id);


--
-- TOC entry 3531 (class 2606 OID 16658)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- TOC entry 3571 (class 2606 OID 16927)
-- Name: course_lessons unique_course_lesson; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT unique_course_lesson UNIQUE (course_id, lesson_id);


--
-- TOC entry 3511 (class 2606 OID 16467)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3513 (class 2606 OID 16465)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3520 (class 1259 OID 16540)
-- Name: idx_choices_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_choices_question_id ON public.choices USING btree (question_id);


--
-- TOC entry 3569 (class 1259 OID 16938)
-- Name: idx_course_lessons_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_lessons_lesson_id ON public.course_lessons USING btree (lesson_id);


--
-- TOC entry 3557 (class 1259 OID 16833)
-- Name: idx_enrollments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enrollments_status ON public.enrollments USING btree (status);


--
-- TOC entry 3572 (class 1259 OID 16955)
-- Name: idx_lesson_videos_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lesson_videos_lesson_id ON public.lesson_videos USING btree (lesson_id);


--
-- TOC entry 3560 (class 1259 OID 16886)
-- Name: idx_quiz_attempt_answers_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_attempt_answers_question_id ON public.quiz_attempt_answers USING btree (question_id);


--
-- TOC entry 3523 (class 1259 OID 16599)
-- Name: idx_quiz_questions_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_questions_question_id ON public.quiz_questions USING btree (question_id);


--
-- TOC entry 3540 (class 1259 OID 16739)
-- Name: idx_section_lessons_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_section_lessons_order ON public.section_lessons USING btree (order_number);


--
-- TOC entry 3509 (class 1259 OID 16967)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 3590 (class 2606 OID 16509)
-- Name: choices choices_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.choices
    ADD CONSTRAINT choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3605 (class 2606 OID 16756)
-- Name: course_subjects course_subjects_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;


--
-- TOC entry 3606 (class 2606 OID 16761)
-- Name: course_subjects course_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3612 (class 2606 OID 16828)
-- Name: enrollments enrollments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3613 (class 2606 OID 16823)
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3626 (class 2606 OID 17006)
-- Name: admins fk_admins_departments; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admins_departments FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- TOC entry 3627 (class 2606 OID 17001)
-- Name: admins fk_admins_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admins_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3621 (class 2606 OID 16928)
-- Name: course_lessons fk_course_lessons_course; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT fk_course_lessons_course FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;


--
-- TOC entry 3622 (class 2606 OID 16933)
-- Name: course_lessons fk_course_lessons_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT fk_course_lessons_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3607 (class 2606 OID 16968)
-- Name: instructors fk_instructors_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT fk_instructors_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3623 (class 2606 OID 16950)
-- Name: lesson_videos fk_lesson_videos_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_videos
    ADD CONSTRAINT fk_lesson_videos_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3593 (class 2606 OID 16912)
-- Name: lessons fk_lessons_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT fk_lessons_created_by FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- TOC entry 3589 (class 2606 OID 16468)
-- Name: users fk_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE RESTRICT;


--
-- TOC entry 3624 (class 2606 OID 16987)
-- Name: students fk_students_departments; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_departments FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- TOC entry 3625 (class 2606 OID 16982)
-- Name: students fk_students_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3595 (class 2606 OID 16628)
-- Name: lesson_files lesson_files_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_files
    ADD CONSTRAINT lesson_files_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3600 (class 2606 OID 16703)
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3601 (class 2606 OID 16698)
-- Name: lesson_progress lesson_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3602 (class 2606 OID 16718)
-- Name: lesson_sections lesson_sections_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3598 (class 2606 OID 16674)
-- Name: lesson_subjects lesson_subjects_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_subjects
    ADD CONSTRAINT lesson_subjects_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3599 (class 2606 OID 16679)
-- Name: lesson_subjects lesson_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_subjects
    ADD CONSTRAINT lesson_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3594 (class 2606 OID 16613)
-- Name: lessons lessons_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;


--
-- TOC entry 3616 (class 2606 OID 16871)
-- Name: quiz_attempt_answers quiz_attempt_answers_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.quiz_attempts(attempt_id) ON DELETE CASCADE;


--
-- TOC entry 3617 (class 2606 OID 16881)
-- Name: quiz_attempt_answers quiz_attempt_answers_choice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_choice_id_fkey FOREIGN KEY (choice_id) REFERENCES public.choices(choice_id) ON DELETE SET NULL;


--
-- TOC entry 3618 (class 2606 OID 16876)
-- Name: quiz_attempt_answers quiz_attempt_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3614 (class 2606 OID 16854)
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3615 (class 2606 OID 16849)
-- Name: quiz_attempts quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3619 (class 2606 OID 16897)
-- Name: quiz_lessons quiz_lessons_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3620 (class 2606 OID 16892)
-- Name: quiz_lessons quiz_lessons_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3630 (class 2606 OID 17081)
-- Name: quiz_progress quiz_progress_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3631 (class 2606 OID 17076)
-- Name: quiz_progress quiz_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3591 (class 2606 OID 16594)
-- Name: quiz_questions quiz_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3592 (class 2606 OID 16589)
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3603 (class 2606 OID 16734)
-- Name: section_lessons section_lessons_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3604 (class 2606 OID 16729)
-- Name: section_lessons section_lessons_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.lesson_sections(section_id) ON DELETE CASCADE;


--
-- TOC entry 3608 (class 2606 OID 16787)
-- Name: subject_instructors subject_instructors_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(instructor_id) ON DELETE CASCADE;


--
-- TOC entry 3609 (class 2606 OID 16782)
-- Name: subject_instructors subject_instructors_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3610 (class 2606 OID 16803)
-- Name: subject_lessons subject_lessons_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3611 (class 2606 OID 16798)
-- Name: subject_lessons subject_lessons_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3628 (class 2606 OID 17040)
-- Name: subject_prerequisites subject_prerequisites_prerequisite_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_prerequisite_id_fkey FOREIGN KEY (prerequisite_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3629 (class 2606 OID 17035)
-- Name: subject_prerequisites subject_prerequisites_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3596 (class 2606 OID 16664)
-- Name: subjects subjects_post_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_post_test_id_fkey FOREIGN KEY (post_test_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;


--
-- TOC entry 3597 (class 2606 OID 16659)
-- Name: subjects subjects_pre_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pre_test_id_fkey FOREIGN KEY (pre_test_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;


-- Completed on 2025-04-20 00:34:02

--
-- PostgreSQL database dump complete
--

-- Completed on 2025-04-20 00:34:02

--
-- PostgreSQL database cluster dump complete
--

