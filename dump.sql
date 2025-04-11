--
-- PostgreSQL database cluster dump
--

-- Started on 2025-04-11 20:03:29

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

-- Started on 2025-04-11 20:03:30

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

-- Completed on 2025-04-11 20:03:36

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

-- Started on 2025-04-11 20:03:36

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
-- TOC entry 3718 (class 0 OID 0)
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
-- TOC entry 3719 (class 0 OID 0)
-- Dependencies: 223
-- Name: choices_choice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.choices_choice_id_seq OWNED BY public.choices.choice_id;


--
-- TOC entry 242 (class 1259 OID 16751)
-- Name: course_subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_subjects (
    course_id integer NOT NULL,
    subject_id integer NOT NULL
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- TOC entry 3720 (class 0 OID 0)
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- TOC entry 3721 (class 0 OID 0)
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
-- TOC entry 3722 (class 0 OID 0)
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- TOC entry 3723 (class 0 OID 0)
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
-- TOC entry 3724 (class 0 OID 0)
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
-- TOC entry 3725 (class 0 OID 0)
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
-- TOC entry 3726 (class 0 OID 0)
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
    duration integer
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
-- TOC entry 3727 (class 0 OID 0)
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
-- TOC entry 3728 (class 0 OID 0)
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
-- TOC entry 3729 (class 0 OID 0)
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
-- TOC entry 3730 (class 0 OID 0)
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
-- TOC entry 3731 (class 0 OID 0)
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
-- TOC entry 3732 (class 0 OID 0)
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
-- TOC entry 233 (class 1259 OID 16645)
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    subject_id integer NOT NULL,
    code character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    credits integer DEFAULT 3 NOT NULL,
    department character varying(100),
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
-- TOC entry 3733 (class 0 OID 0)
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
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role_id integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- TOC entry 3734 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 3360 (class 2604 OID 16477)
-- Name: blacklisted_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens ALTER COLUMN id SET DEFAULT nextval('public.blacklisted_tokens_id_seq'::regclass);


--
-- TOC entry 3366 (class 2604 OID 16501)
-- Name: choices choice_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.choices ALTER COLUMN choice_id SET DEFAULT nextval('public.choices_choice_id_seq'::regclass);


--
-- TOC entry 3406 (class 2604 OID 16744)
-- Name: courses course_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN course_id SET DEFAULT nextval('public.courses_course_id_seq'::regclass);


--
-- TOC entry 3431 (class 2604 OID 16906)
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- TOC entry 3413 (class 2604 OID 16812)
-- Name: enrollments enrollment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN enrollment_id SET DEFAULT nextval('public.enrollments_enrollment_id_seq'::regclass);


--
-- TOC entry 3409 (class 2604 OID 16770)
-- Name: instructors instructor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors ALTER COLUMN instructor_id SET DEFAULT nextval('public.instructors_instructor_id_seq'::regclass);


--
-- TOC entry 3387 (class 2604 OID 16622)
-- Name: lesson_files file_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_files ALTER COLUMN file_id SET DEFAULT nextval('public.lesson_files_file_id_seq'::regclass);


--
-- TOC entry 3395 (class 2604 OID 16688)
-- Name: lesson_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.lesson_progress_progress_id_seq'::regclass);


--
-- TOC entry 3401 (class 2604 OID 16712)
-- Name: lesson_sections section_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_sections ALTER COLUMN section_id SET DEFAULT nextval('public.lesson_sections_section_id_seq'::regclass);


--
-- TOC entry 3382 (class 2604 OID 16604)
-- Name: lessons lesson_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN lesson_id SET DEFAULT nextval('public.lessons_lesson_id_seq'::regclass);


--
-- TOC entry 3362 (class 2604 OID 16487)
-- Name: questions question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN question_id SET DEFAULT nextval('public.questions_question_id_seq'::regclass);


--
-- TOC entry 3427 (class 2604 OID 16863)
-- Name: quiz_attempt_answers answer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers ALTER COLUMN answer_id SET DEFAULT nextval('public.quiz_attempt_answers_answer_id_seq'::regclass);


--
-- TOC entry 3419 (class 2604 OID 16838)
-- Name: quiz_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.quiz_attempts_attempt_id_seq'::regclass);


--
-- TOC entry 3370 (class 2604 OID 16567)
-- Name: quizzes quiz_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN quiz_id SET DEFAULT nextval('public.quizzes_quiz_id_seq'::regclass);


--
-- TOC entry 3354 (class 2604 OID 16448)
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- TOC entry 3389 (class 2604 OID 16648)
-- Name: subjects subject_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN subject_id SET DEFAULT nextval('public.subjects_subject_id_seq'::regclass);


--
-- TOC entry 3356 (class 2604 OID 16460)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 3677 (class 0 OID 16474)
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
\.


--
-- TOC entry 3681 (class 0 OID 16498)
-- Dependencies: 224
-- Data for Name: choices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.choices (choice_id, question_id, text, is_correct, created_at, updated_at) FROM stdin;
1	1	คำตอบที่ถูกต้อง 1	t	2025-04-11 08:49:51.426471	2025-04-11 08:49:51.426471
2	1	คำตอบที่ถูกต้อง 2	t	2025-04-11 08:49:51.426471	2025-04-11 08:49:51.426471
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
\.


--
-- TOC entry 3699 (class 0 OID 16751)
-- Dependencies: 242
-- Data for Name: course_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_subjects (course_id, subject_id) FROM stdin;
\.


--
-- TOC entry 3698 (class 0 OID 16741)
-- Dependencies: 241
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (course_id, title, category, description, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3712 (class 0 OID 16903)
-- Dependencies: 255
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_id, department_name, faculty, created_at) FROM stdin;
\.


--
-- TOC entry 3705 (class 0 OID 16809)
-- Dependencies: 248
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (enrollment_id, user_id, subject_id, enrollment_date, completion_date, progress_percentage, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3701 (class 0 OID 16767)
-- Dependencies: 244
-- Data for Name: instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instructors (instructor_id, name, "position", avatar_path, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3688 (class 0 OID 16619)
-- Dependencies: 231
-- Data for Name: lesson_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_files (file_id, lesson_id, file_name, file_path, file_size, file_type, created_at) FROM stdin;
\.


--
-- TOC entry 3693 (class 0 OID 16685)
-- Dependencies: 236
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_progress (progress_id, user_id, lesson_id, completed, completion_date, duration_seconds, last_position_seconds, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3695 (class 0 OID 16709)
-- Dependencies: 238
-- Data for Name: lesson_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_sections (section_id, title, subject_id, order_number, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3691 (class 0 OID 16669)
-- Dependencies: 234
-- Data for Name: lesson_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_subjects (lesson_id, subject_id) FROM stdin;
\.


--
-- TOC entry 3686 (class 0 OID 16601)
-- Dependencies: 229
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (lesson_id, title, description, video_url, can_preview, has_quiz, quiz_id, created_at, updated_at, duration) FROM stdin;
\.


--
-- TOC entry 3679 (class 0 OID 16484)
-- Dependencies: 222
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (question_id, title, description, type, score, created_at, updated_at) FROM stdin;
1	ทดสอบคำถามเติมคำ	รายละเอียดคำถามเติมคำ	FB	1	2025-04-11 08:49:51.426471	2025-04-11 08:49:51.426471
2	ทดสอบ	ทดสอบ	MC	4	2025-04-11 09:30:27.408717	2025-04-11 09:30:27.408717
3	กก	กก	SC	1	2025-04-11 09:39:36.976332	2025-04-11 09:39:36.976332
9	s	ss	TF	1	2025-04-11 09:58:28.809462	2025-04-11 09:58:28.809462
10	sssฟหกฟ	ss	MC	1	2025-04-11 09:58:57.279074	2025-04-11 09:58:57.279074
\.


--
-- TOC entry 3709 (class 0 OID 16860)
-- Dependencies: 252
-- Data for Name: quiz_attempt_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_attempt_answers (answer_id, attempt_id, question_id, choice_id, text_answer, is_correct, score_earned, created_at) FROM stdin;
\.


--
-- TOC entry 3707 (class 0 OID 16835)
-- Dependencies: 250
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_attempts (attempt_id, user_id, quiz_id, start_time, end_time, score, max_score, passed, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3710 (class 0 OID 16887)
-- Dependencies: 253
-- Data for Name: quiz_lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_lessons (quiz_id, lesson_id) FROM stdin;
\.


--
-- TOC entry 3684 (class 0 OID 16584)
-- Dependencies: 227
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_questions (quiz_id, question_id) FROM stdin;
7	9
7	10
\.


--
-- TOC entry 3683 (class 0 OID 16564)
-- Dependencies: 226
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quizzes (quiz_id, title, description, time_limit_enabled, time_limit_value, time_limit_unit, passing_score_enabled, passing_score_value, attempts_limited, attempts_unlimited, attempts_value, status, created_at, updated_at) FROM stdin;
7	แบบทดสอบพื้นฐาน	แบบทดสอบสำหรับทดสอบระบบ	t	30	minutes	t	70	t	f	2	draft	2025-04-11 09:57:49.832684	2025-04-11 09:57:49.832684
\.


--
-- TOC entry 3673 (class 0 OID 16445)
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
-- TOC entry 3696 (class 0 OID 16723)
-- Dependencies: 239
-- Data for Name: section_lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section_lessons (section_id, lesson_id, order_number) FROM stdin;
\.


--
-- TOC entry 3702 (class 0 OID 16777)
-- Dependencies: 245
-- Data for Name: subject_instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_instructors (subject_id, instructor_id) FROM stdin;
\.


--
-- TOC entry 3703 (class 0 OID 16792)
-- Dependencies: 246
-- Data for Name: subject_lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_lessons (subject_id, lesson_id, order_number) FROM stdin;
\.


--
-- TOC entry 3690 (class 0 OID 16645)
-- Dependencies: 233
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (subject_id, code, title, description, credits, department, cover_image_path, allow_all_lessons, pre_test_id, post_test_id, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3675 (class 0 OID 16457)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, email, password, role_id, created_at, updated_at) FROM stdin;
1	jakkapat	email@example.com	$2b$10$FMakc9xhps3RwVSm.XKEyuaQ6vThtlcxF0naojYN5ZL4h9lzb/wlW	1	2025-03-31 19:26:32.153598	2025-03-31 19:26:32.153598
2	Admin	admin@example.com	$2b$10$LKzv0BnS2xN94Cjdt3KQmu4LIBSO0Mn7CBPy0Ua2a7lyOu79tBsNi	4	2025-04-01 09:02:33.648537	2025-04-01 09:02:33.648537
3	Instructor	instructor@example.com	$2b$10$X8u28AV.ZN9Qz09IdqTh5uN.3EkI88GRsszJpA.D4SY3WXRgBGswe	2	2025-04-01 10:59:03.150143	2025-04-01 10:59:03.150143
\.


--
-- TOC entry 3735 (class 0 OID 0)
-- Dependencies: 219
-- Name: blacklisted_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blacklisted_tokens_id_seq', 50, true);


--
-- TOC entry 3736 (class 0 OID 0)
-- Dependencies: 223
-- Name: choices_choice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.choices_choice_id_seq', 13, true);


--
-- TOC entry 3737 (class 0 OID 0)
-- Dependencies: 240
-- Name: courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_course_id_seq', 1, false);


--
-- TOC entry 3738 (class 0 OID 0)
-- Dependencies: 254
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 1, false);


--
-- TOC entry 3739 (class 0 OID 0)
-- Dependencies: 247
-- Name: enrollments_enrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enrollments_enrollment_id_seq', 1, false);


--
-- TOC entry 3740 (class 0 OID 0)
-- Dependencies: 243
-- Name: instructors_instructor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instructors_instructor_id_seq', 1, false);


--
-- TOC entry 3741 (class 0 OID 0)
-- Dependencies: 230
-- Name: lesson_files_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesson_files_file_id_seq', 1, false);


--
-- TOC entry 3742 (class 0 OID 0)
-- Dependencies: 235
-- Name: lesson_progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesson_progress_progress_id_seq', 1, false);


--
-- TOC entry 3743 (class 0 OID 0)
-- Dependencies: 237
-- Name: lesson_sections_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesson_sections_section_id_seq', 1, false);


--
-- TOC entry 3744 (class 0 OID 0)
-- Dependencies: 228
-- Name: lessons_lesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_lesson_id_seq', 1, false);


--
-- TOC entry 3745 (class 0 OID 0)
-- Dependencies: 221
-- Name: questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_question_id_seq', 10, true);


--
-- TOC entry 3746 (class 0 OID 0)
-- Dependencies: 251
-- Name: quiz_attempt_answers_answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_attempt_answers_answer_id_seq', 1, false);


--
-- TOC entry 3747 (class 0 OID 0)
-- Dependencies: 249
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_attempts_attempt_id_seq', 1, false);


--
-- TOC entry 3748 (class 0 OID 0)
-- Dependencies: 225
-- Name: quizzes_quiz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quizzes_quiz_id_seq', 7, true);


--
-- TOC entry 3749 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 4, true);


--
-- TOC entry 3750 (class 0 OID 0)
-- Dependencies: 232
-- Name: subjects_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_subject_id_seq', 1, false);


--
-- TOC entry 3751 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 3, true);


--
-- TOC entry 3447 (class 2606 OID 16482)
-- Name: blacklisted_tokens blacklisted_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens
    ADD CONSTRAINT blacklisted_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3451 (class 2606 OID 16508)
-- Name: choices choices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.choices
    ADD CONSTRAINT choices_pkey PRIMARY KEY (choice_id);


--
-- TOC entry 3478 (class 2606 OID 16755)
-- Name: course_subjects course_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_pkey PRIMARY KEY (course_id, subject_id);


--
-- TOC entry 3476 (class 2606 OID 16750)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);


--
-- TOC entry 3498 (class 2606 OID 16911)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- TOC entry 3486 (class 2606 OID 16820)
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (enrollment_id);


--
-- TOC entry 3488 (class 2606 OID 16822)
-- Name: enrollments enrollments_user_id_subject_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_subject_id_key UNIQUE (user_id, subject_id);


--
-- TOC entry 3480 (class 2606 OID 16776)
-- Name: instructors instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_pkey PRIMARY KEY (instructor_id);


--
-- TOC entry 3461 (class 2606 OID 16627)
-- Name: lesson_files lesson_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_files
    ADD CONSTRAINT lesson_files_pkey PRIMARY KEY (file_id);


--
-- TOC entry 3467 (class 2606 OID 16695)
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 3469 (class 2606 OID 16697)
-- Name: lesson_progress lesson_progress_user_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);


--
-- TOC entry 3471 (class 2606 OID 16717)
-- Name: lesson_sections lesson_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_pkey PRIMARY KEY (section_id);


--
-- TOC entry 3465 (class 2606 OID 16673)
-- Name: lesson_subjects lesson_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_subjects
    ADD CONSTRAINT lesson_subjects_pkey PRIMARY KEY (lesson_id, subject_id);


--
-- TOC entry 3459 (class 2606 OID 16612)
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (lesson_id);


--
-- TOC entry 3449 (class 2606 OID 16495)
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- TOC entry 3494 (class 2606 OID 16870)
-- Name: quiz_attempt_answers quiz_attempt_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_pkey PRIMARY KEY (answer_id);


--
-- TOC entry 3491 (class 2606 OID 16848)
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (attempt_id);


--
-- TOC entry 3496 (class 2606 OID 16891)
-- Name: quiz_lessons quiz_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_pkey PRIMARY KEY (quiz_id, lesson_id);


--
-- TOC entry 3457 (class 2606 OID 16588)
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (quiz_id, question_id);


--
-- TOC entry 3454 (class 2606 OID 16583)
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (quiz_id);


--
-- TOC entry 3439 (class 2606 OID 16453)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- TOC entry 3441 (class 2606 OID 16455)
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- TOC entry 3474 (class 2606 OID 16728)
-- Name: section_lessons section_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_pkey PRIMARY KEY (section_id, lesson_id);


--
-- TOC entry 3482 (class 2606 OID 16781)
-- Name: subject_instructors subject_instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_pkey PRIMARY KEY (subject_id, instructor_id);


--
-- TOC entry 3484 (class 2606 OID 16797)
-- Name: subject_lessons subject_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_pkey PRIMARY KEY (subject_id, lesson_id);


--
-- TOC entry 3463 (class 2606 OID 16658)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- TOC entry 3443 (class 2606 OID 16467)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3445 (class 2606 OID 16465)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3452 (class 1259 OID 16540)
-- Name: idx_choices_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_choices_question_id ON public.choices USING btree (question_id);


--
-- TOC entry 3489 (class 1259 OID 16833)
-- Name: idx_enrollments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enrollments_status ON public.enrollments USING btree (status);


--
-- TOC entry 3492 (class 1259 OID 16886)
-- Name: idx_quiz_attempt_answers_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_attempt_answers_question_id ON public.quiz_attempt_answers USING btree (question_id);


--
-- TOC entry 3455 (class 1259 OID 16599)
-- Name: idx_quiz_questions_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_questions_question_id ON public.quiz_questions USING btree (question_id);


--
-- TOC entry 3472 (class 1259 OID 16739)
-- Name: idx_section_lessons_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_section_lessons_order ON public.section_lessons USING btree (order_number);


--
-- TOC entry 3500 (class 2606 OID 16509)
-- Name: choices choices_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.choices
    ADD CONSTRAINT choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3514 (class 2606 OID 16756)
-- Name: course_subjects course_subjects_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;


--
-- TOC entry 3515 (class 2606 OID 16761)
-- Name: course_subjects course_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3520 (class 2606 OID 16828)
-- Name: enrollments enrollments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3521 (class 2606 OID 16823)
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3499 (class 2606 OID 16468)
-- Name: users fk_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE RESTRICT;


--
-- TOC entry 3504 (class 2606 OID 16628)
-- Name: lesson_files lesson_files_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_files
    ADD CONSTRAINT lesson_files_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3509 (class 2606 OID 16703)
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3510 (class 2606 OID 16698)
-- Name: lesson_progress lesson_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3511 (class 2606 OID 16718)
-- Name: lesson_sections lesson_sections_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3507 (class 2606 OID 16674)
-- Name: lesson_subjects lesson_subjects_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_subjects
    ADD CONSTRAINT lesson_subjects_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3508 (class 2606 OID 16679)
-- Name: lesson_subjects lesson_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_subjects
    ADD CONSTRAINT lesson_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3503 (class 2606 OID 16613)
-- Name: lessons lessons_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;


--
-- TOC entry 3524 (class 2606 OID 16871)
-- Name: quiz_attempt_answers quiz_attempt_answers_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.quiz_attempts(attempt_id) ON DELETE CASCADE;


--
-- TOC entry 3525 (class 2606 OID 16881)
-- Name: quiz_attempt_answers quiz_attempt_answers_choice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_choice_id_fkey FOREIGN KEY (choice_id) REFERENCES public.choices(choice_id) ON DELETE SET NULL;


--
-- TOC entry 3526 (class 2606 OID 16876)
-- Name: quiz_attempt_answers quiz_attempt_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3522 (class 2606 OID 16854)
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3523 (class 2606 OID 16849)
-- Name: quiz_attempts quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3527 (class 2606 OID 16897)
-- Name: quiz_lessons quiz_lessons_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3528 (class 2606 OID 16892)
-- Name: quiz_lessons quiz_lessons_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3501 (class 2606 OID 16594)
-- Name: quiz_questions quiz_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3502 (class 2606 OID 16589)
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 3512 (class 2606 OID 16734)
-- Name: section_lessons section_lessons_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3513 (class 2606 OID 16729)
-- Name: section_lessons section_lessons_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.lesson_sections(section_id) ON DELETE CASCADE;


--
-- TOC entry 3516 (class 2606 OID 16787)
-- Name: subject_instructors subject_instructors_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(instructor_id) ON DELETE CASCADE;


--
-- TOC entry 3517 (class 2606 OID 16782)
-- Name: subject_instructors subject_instructors_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3518 (class 2606 OID 16803)
-- Name: subject_lessons subject_lessons_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 3519 (class 2606 OID 16798)
-- Name: subject_lessons subject_lessons_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 3505 (class 2606 OID 16664)
-- Name: subjects subjects_post_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_post_test_id_fkey FOREIGN KEY (post_test_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;


--
-- TOC entry 3506 (class 2606 OID 16659)
-- Name: subjects subjects_pre_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pre_test_id_fkey FOREIGN KEY (pre_test_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;


-- Completed on 2025-04-11 20:03:48

--
-- PostgreSQL database dump complete
--

-- Completed on 2025-04-11 20:03:48

--
-- PostgreSQL database cluster dump complete
--

