PGDMP  	                    }            postgres    16.8    17.0 '   K           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            L           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            M           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            N           1262    5    postgres    DATABASE     s   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE postgres;
                     postgres    false            O           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                        postgres    false    3918                       1259    16993    admins    TABLE     !  CREATE TABLE public.admins (
    admin_id integer NOT NULL,
    user_id integer,
    department_id integer,
    "position" character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.admins;
       public         heap r       postgres    false                       1259    16992    admins_admin_id_seq    SEQUENCE     �   CREATE SEQUENCE public.admins_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.admins_admin_id_seq;
       public               postgres    false    263            P           0    0    admins_admin_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.admins_admin_id_seq OWNED BY public.admins.admin_id;
          public               postgres    false    262            �            1259    16474    blacklisted_tokens    TABLE     �   CREATE TABLE public.blacklisted_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 &   DROP TABLE public.blacklisted_tokens;
       public         heap r       postgres    false            �            1259    16473    blacklisted_tokens_id_seq    SEQUENCE     �   CREATE SEQUENCE public.blacklisted_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.blacklisted_tokens_id_seq;
       public               postgres    false    220            Q           0    0    blacklisted_tokens_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.blacklisted_tokens_id_seq OWNED BY public.blacklisted_tokens.id;
          public               postgres    false    219            �            1259    16498    choices    TABLE     5  CREATE TABLE public.choices (
    choice_id integer NOT NULL,
    question_id integer NOT NULL,
    text text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.choices;
       public         heap r       postgres    false            �            1259    16497    choices_choice_id_seq    SEQUENCE     �   CREATE SEQUENCE public.choices_choice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.choices_choice_id_seq;
       public               postgres    false    224            R           0    0    choices_choice_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.choices_choice_id_seq OWNED BY public.choices.choice_id;
          public               postgres    false    223            	           1259    17013    course_enrollments    TABLE     �  CREATE TABLE public.course_enrollments (
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
 &   DROP TABLE public.course_enrollments;
       public         heap r       postgres    false                       1259    17012 $   course_enrollments_enrollment_id_seq    SEQUENCE     �   CREATE SEQUENCE public.course_enrollments_enrollment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public.course_enrollments_enrollment_id_seq;
       public               postgres    false    265            S           0    0 $   course_enrollments_enrollment_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public.course_enrollments_enrollment_id_seq OWNED BY public.course_enrollments.enrollment_id;
          public               postgres    false    264                       1259    16918    course_lessons    TABLE     �   CREATE TABLE public.course_lessons (
    id integer NOT NULL,
    course_id integer NOT NULL,
    lesson_id integer NOT NULL,
    lesson_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 "   DROP TABLE public.course_lessons;
       public         heap r       postgres    false                        1259    16917    course_lessons_id_seq    SEQUENCE     �   CREATE SEQUENCE public.course_lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.course_lessons_id_seq;
       public               postgres    false    257            T           0    0    course_lessons_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.course_lessons_id_seq OWNED BY public.course_lessons.id;
          public               postgres    false    256                       1259    17249    course_progress    TABLE     �  CREATE TABLE public.course_progress (
    progress_id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    completion_date timestamp without time zone
);
 #   DROP TABLE public.course_progress;
       public         heap r       postgres    false                       1259    17248    course_progress_progress_id_seq    SEQUENCE     �   CREATE SEQUENCE public.course_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public.course_progress_progress_id_seq;
       public               postgres    false    275            U           0    0    course_progress_progress_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public.course_progress_progress_id_seq OWNED BY public.course_progress.progress_id;
          public               postgres    false    274            �            1259    16751    course_subjects    TABLE     �   CREATE TABLE public.course_subjects (
    course_id integer NOT NULL,
    subject_id integer NOT NULL,
    order_number integer DEFAULT 0
);
 #   DROP TABLE public.course_subjects;
       public         heap r       postgres    false            �            1259    16741    courses    TABLE     �  CREATE TABLE public.courses (
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(100),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cover_image_path text,
    status character varying(20) DEFAULT 'draft'::character varying,
    video_url character varying(255),
    cover_image_file_id text,
    department_id integer
);
    DROP TABLE public.courses;
       public         heap r       postgres    false            �            1259    16740    courses_course_id_seq    SEQUENCE     �   CREATE SEQUENCE public.courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.courses_course_id_seq;
       public               postgres    false    241            V           0    0    courses_course_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.courses_course_id_seq OWNED BY public.courses.course_id;
          public               postgres    false    240            �            1259    16903    departments    TABLE     �   CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(255) NOT NULL,
    faculty character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text
);
    DROP TABLE public.departments;
       public         heap r       postgres    false            �            1259    16902    departments_department_id_seq    SEQUENCE     �   CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.departments_department_id_seq;
       public               postgres    false    255            W           0    0    departments_department_id_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;
          public               postgres    false    254            �            1259    16809    enrollments    TABLE     i  CREATE TABLE public.enrollments (
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
    CONSTRAINT enrollments_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'dropped'::character varying])::text[])))
);
    DROP TABLE public.enrollments;
       public         heap r       postgres    false            �            1259    16808    enrollments_enrollment_id_seq    SEQUENCE     �   CREATE SEQUENCE public.enrollments_enrollment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.enrollments_enrollment_id_seq;
       public               postgres    false    248            X           0    0    enrollments_enrollment_id_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.enrollments_enrollment_id_seq OWNED BY public.enrollments.enrollment_id;
          public               postgres    false    247            �            1259    16767    instructors    TABLE     �  CREATE TABLE public.instructors (
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
    ranking_id integer
);
    DROP TABLE public.instructors;
       public         heap r       postgres    false            �            1259    16766    instructors_instructor_id_seq    SEQUENCE     �   CREATE SEQUENCE public.instructors_instructor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.instructors_instructor_id_seq;
       public               postgres    false    244            Y           0    0    instructors_instructor_id_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.instructors_instructor_id_seq OWNED BY public.instructors.instructor_id;
          public               postgres    false    243                       1259    17201    lesson_attachments    TABLE     *  CREATE TABLE public.lesson_attachments (
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
 &   DROP TABLE public.lesson_attachments;
       public         heap r       postgres    false                       1259    17200 $   lesson_attachments_attachment_id_seq    SEQUENCE     �   CREATE SEQUENCE public.lesson_attachments_attachment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public.lesson_attachments_attachment_id_seq;
       public               postgres    false    271            Z           0    0 $   lesson_attachments_attachment_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public.lesson_attachments_attachment_id_seq OWNED BY public.lesson_attachments.attachment_id;
          public               postgres    false    270            �            1259    16619    lesson_files    TABLE     �  CREATE TABLE public.lesson_files (
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
     DROP TABLE public.lesson_files;
       public         heap r       postgres    false            �            1259    16618    lesson_files_file_id_seq    SEQUENCE     �   CREATE SEQUENCE public.lesson_files_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.lesson_files_file_id_seq;
       public               postgres    false    231            [           0    0    lesson_files_file_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.lesson_files_file_id_seq OWNED BY public.lesson_files.file_id;
          public               postgres    false    230            �            1259    16685    lesson_progress    TABLE       CREATE TABLE public.lesson_progress (
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
 #   DROP TABLE public.lesson_progress;
       public         heap r       postgres    false            �            1259    16684    lesson_progress_progress_id_seq    SEQUENCE     �   CREATE SEQUENCE public.lesson_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public.lesson_progress_progress_id_seq;
       public               postgres    false    236            \           0    0    lesson_progress_progress_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public.lesson_progress_progress_id_seq OWNED BY public.lesson_progress.progress_id;
          public               postgres    false    235            �            1259    16709    lesson_sections    TABLE     E  CREATE TABLE public.lesson_sections (
    section_id integer NOT NULL,
    title character varying(255) NOT NULL,
    subject_id integer,
    order_number integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 #   DROP TABLE public.lesson_sections;
       public         heap r       postgres    false            �            1259    16708    lesson_sections_section_id_seq    SEQUENCE     �   CREATE SEQUENCE public.lesson_sections_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public.lesson_sections_section_id_seq;
       public               postgres    false    238            ]           0    0    lesson_sections_section_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public.lesson_sections_section_id_seq OWNED BY public.lesson_sections.section_id;
          public               postgres    false    237            �            1259    16669    lesson_subjects    TABLE     i   CREATE TABLE public.lesson_subjects (
    lesson_id integer NOT NULL,
    subject_id integer NOT NULL
);
 #   DROP TABLE public.lesson_subjects;
       public         heap r       postgres    false                       1259    16941    lesson_videos    TABLE     @  CREATE TABLE public.lesson_videos (
    video_id integer NOT NULL,
    lesson_id integer NOT NULL,
    video_url character varying(255) NOT NULL,
    duration integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 !   DROP TABLE public.lesson_videos;
       public         heap r       postgres    false                       1259    16940    lesson_videos_video_id_seq    SEQUENCE     �   CREATE SEQUENCE public.lesson_videos_video_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.lesson_videos_video_id_seq;
       public               postgres    false    259            ^           0    0    lesson_videos_video_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.lesson_videos_video_id_seq OWNED BY public.lesson_videos.video_id;
          public               postgres    false    258            �            1259    16601    lessons    TABLE     1  CREATE TABLE public.lessons (
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
    status character varying(20) DEFAULT 'active'::character varying
);
    DROP TABLE public.lessons;
       public         heap r       postgres    false            �            1259    16600    lessons_lesson_id_seq    SEQUENCE     �   CREATE SEQUENCE public.lessons_lesson_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.lessons_lesson_id_seq;
       public               postgres    false    229            _           0    0    lessons_lesson_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.lessons_lesson_id_seq OWNED BY public.lessons.lesson_id;
          public               postgres    false    228            �            1259    16484 	   questions    TABLE     0  CREATE TABLE public.questions (
    question_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type character varying(10) NOT NULL,
    score integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    question_text text,
    CONSTRAINT questions_type_check CHECK (((type)::text = ANY ((ARRAY['TF'::character varying, 'MC'::character varying, 'SC'::character varying, 'FB'::character varying])::text[])))
);
    DROP TABLE public.questions;
       public         heap r       postgres    false            �            1259    16483    questions_question_id_seq    SEQUENCE     �   CREATE SEQUENCE public.questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.questions_question_id_seq;
       public               postgres    false    222            `           0    0    questions_question_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.questions_question_id_seq OWNED BY public.questions.question_id;
          public               postgres    false    221                       1259    17288    quiz_attachments    TABLE     �  CREATE TABLE public.quiz_attachments (
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
 $   DROP TABLE public.quiz_attachments;
       public         heap r       postgres    false                       1259    17287 "   quiz_attachments_attachment_id_seq    SEQUENCE     �   CREATE SEQUENCE public.quiz_attachments_attachment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 9   DROP SEQUENCE public.quiz_attachments_attachment_id_seq;
       public               postgres    false    277            a           0    0 "   quiz_attachments_attachment_id_seq    SEQUENCE OWNED BY     i   ALTER SEQUENCE public.quiz_attachments_attachment_id_seq OWNED BY public.quiz_attachments.attachment_id;
          public               postgres    false    276            �            1259    16860    quiz_attempt_answers    TABLE     x  CREATE TABLE public.quiz_attempt_answers (
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
 (   DROP TABLE public.quiz_attempt_answers;
       public         heap r       postgres    false            �            1259    16859 "   quiz_attempt_answers_answer_id_seq    SEQUENCE     �   CREATE SEQUENCE public.quiz_attempt_answers_answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 9   DROP SEQUENCE public.quiz_attempt_answers_answer_id_seq;
       public               postgres    false    252            b           0    0 "   quiz_attempt_answers_answer_id_seq    SEQUENCE OWNED BY     i   ALTER SEQUENCE public.quiz_attempt_answers_answer_id_seq OWNED BY public.quiz_attempt_answers.answer_id;
          public               postgres    false    251            �            1259    16835    quiz_attempts    TABLE     �  CREATE TABLE public.quiz_attempts (
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
    CONSTRAINT quiz_attempts_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'awaiting_review'::character varying])::text[])))
);
 !   DROP TABLE public.quiz_attempts;
       public         heap r       postgres    false            �            1259    16834    quiz_attempts_attempt_id_seq    SEQUENCE     �   CREATE SEQUENCE public.quiz_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.quiz_attempts_attempt_id_seq;
       public               postgres    false    250            c           0    0    quiz_attempts_attempt_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.quiz_attempts_attempt_id_seq OWNED BY public.quiz_attempts.attempt_id;
          public               postgres    false    249            �            1259    16887    quiz_lessons    TABLE     c   CREATE TABLE public.quiz_lessons (
    quiz_id integer NOT NULL,
    lesson_id integer NOT NULL
);
     DROP TABLE public.quiz_lessons;
       public         heap r       postgres    false                       1259    17063    quiz_progress    TABLE     �  CREATE TABLE public.quiz_progress (
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
 !   DROP TABLE public.quiz_progress;
       public         heap r       postgres    false                       1259    17062    quiz_progress_progress_id_seq    SEQUENCE     �   CREATE SEQUENCE public.quiz_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.quiz_progress_progress_id_seq;
       public               postgres    false    269            d           0    0    quiz_progress_progress_id_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.quiz_progress_progress_id_seq OWNED BY public.quiz_progress.progress_id;
          public               postgres    false    268            �            1259    16584    quiz_questions    TABLE     g   CREATE TABLE public.quiz_questions (
    quiz_id integer NOT NULL,
    question_id integer NOT NULL
);
 "   DROP TABLE public.quiz_questions;
       public         heap r       postgres    false            �            1259    16564    quizzes    TABLE     �  CREATE TABLE public.quizzes (
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
    CONSTRAINT quizzes_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'draft'::character varying])::text[])))
);
    DROP TABLE public.quizzes;
       public         heap r       postgres    false            �            1259    16563    quizzes_quiz_id_seq    SEQUENCE     �   CREATE SEQUENCE public.quizzes_quiz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.quizzes_quiz_id_seq;
       public               postgres    false    226            e           0    0    quizzes_quiz_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.quizzes_quiz_id_seq OWNED BY public.quizzes.quiz_id;
          public               postgres    false    225                       1259    17318    rankings    TABLE     s   CREATE TABLE public.rankings (
    ranking_id integer NOT NULL,
    ranking_name character varying(50) NOT NULL
);
    DROP TABLE public.rankings;
       public         heap r       postgres    false                       1259    17317    rankings_ranking_id_seq    SEQUENCE     �   CREATE SEQUENCE public.rankings_ranking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.rankings_ranking_id_seq;
       public               postgres    false    279            f           0    0    rankings_ranking_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.rankings_ranking_id_seq OWNED BY public.rankings.ranking_id;
          public               postgres    false    278            �            1259    16445    roles    TABLE     �   CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.roles;
       public         heap r       postgres    false            �            1259    16444    roles_role_id_seq    SEQUENCE     �   CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.roles_role_id_seq;
       public               postgres    false    216            g           0    0    roles_role_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;
          public               postgres    false    215            �            1259    16723    section_lessons    TABLE     �   CREATE TABLE public.section_lessons (
    section_id integer NOT NULL,
    lesson_id integer NOT NULL,
    order_number integer DEFAULT 1 NOT NULL
);
 #   DROP TABLE public.section_lessons;
       public         heap r       postgres    false                       1259    16974    students    TABLE     Q  CREATE TABLE public.students (
    student_id integer NOT NULL,
    user_id integer,
    student_code character varying(20),
    department_id integer,
    education_level character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.students;
       public         heap r       postgres    false                       1259    16973    students_student_id_seq    SEQUENCE     �   CREATE SEQUENCE public.students_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.students_student_id_seq;
       public               postgres    false    261            h           0    0    students_student_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.students_student_id_seq OWNED BY public.students.student_id;
          public               postgres    false    260            �            1259    16777    subject_instructors    TABLE     q   CREATE TABLE public.subject_instructors (
    subject_id integer NOT NULL,
    instructor_id integer NOT NULL
);
 '   DROP TABLE public.subject_instructors;
       public         heap r       postgres    false            �            1259    16792    subject_lessons    TABLE     �   CREATE TABLE public.subject_lessons (
    subject_id integer NOT NULL,
    lesson_id integer NOT NULL,
    order_number integer DEFAULT 1 NOT NULL
);
 #   DROP TABLE public.subject_lessons;
       public         heap r       postgres    false                       1259    17026    subject_prerequisites    TABLE     �   CREATE TABLE public.subject_prerequisites (
    id integer NOT NULL,
    subject_id integer NOT NULL,
    prerequisite_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 )   DROP TABLE public.subject_prerequisites;
       public         heap r       postgres    false            
           1259    17025    subject_prerequisites_id_seq    SEQUENCE     �   CREATE SEQUENCE public.subject_prerequisites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.subject_prerequisites_id_seq;
       public               postgres    false    267            i           0    0    subject_prerequisites_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.subject_prerequisites_id_seq OWNED BY public.subject_prerequisites.id;
          public               postgres    false    266            �            1259    16645    subjects    TABLE     %  CREATE TABLE public.subjects (
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
    CONSTRAINT subjects_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'draft'::character varying])::text[])))
);
    DROP TABLE public.subjects;
       public         heap r       postgres    false            �            1259    16644    subjects_subject_id_seq    SEQUENCE     �   CREATE SEQUENCE public.subjects_subject_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.subjects_subject_id_seq;
       public               postgres    false    233            j           0    0    subjects_subject_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.subjects_subject_id_seq OWNED BY public.subjects.subject_id;
          public               postgres    false    232            �            1259    16457    users    TABLE       CREATE TABLE public.users (
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
    name character varying(255)
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    16456    users_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.users_user_id_seq;
       public               postgres    false    218            k           0    0    users_user_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;
          public               postgres    false    217                       1259    17234    video_progress    TABLE       CREATE TABLE public.video_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    lesson_id integer NOT NULL,
    watched_seconds double precision DEFAULT 0,
    video_duration double precision DEFAULT 0,
    updated_at timestamp without time zone DEFAULT now()
);
 "   DROP TABLE public.video_progress;
       public         heap r       postgres    false                       1259    17233    video_progress_id_seq    SEQUENCE     �   CREATE SEQUENCE public.video_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.video_progress_id_seq;
       public               postgres    false    273            l           0    0    video_progress_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.video_progress_id_seq OWNED BY public.video_progress.id;
          public               postgres    false    272            �           2604    16996    admins admin_id    DEFAULT     r   ALTER TABLE ONLY public.admins ALTER COLUMN admin_id SET DEFAULT nextval('public.admins_admin_id_seq'::regclass);
 >   ALTER TABLE public.admins ALTER COLUMN admin_id DROP DEFAULT;
       public               postgres    false    263    262    263            ]           2604    16477    blacklisted_tokens id    DEFAULT     ~   ALTER TABLE ONLY public.blacklisted_tokens ALTER COLUMN id SET DEFAULT nextval('public.blacklisted_tokens_id_seq'::regclass);
 D   ALTER TABLE public.blacklisted_tokens ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    220    220            c           2604    16501    choices choice_id    DEFAULT     v   ALTER TABLE ONLY public.choices ALTER COLUMN choice_id SET DEFAULT nextval('public.choices_choice_id_seq'::regclass);
 @   ALTER TABLE public.choices ALTER COLUMN choice_id DROP DEFAULT;
       public               postgres    false    224    223    224            �           2604    17016     course_enrollments enrollment_id    DEFAULT     �   ALTER TABLE ONLY public.course_enrollments ALTER COLUMN enrollment_id SET DEFAULT nextval('public.course_enrollments_enrollment_id_seq'::regclass);
 O   ALTER TABLE public.course_enrollments ALTER COLUMN enrollment_id DROP DEFAULT;
       public               postgres    false    264    265    265            �           2604    16921    course_lessons id    DEFAULT     v   ALTER TABLE ONLY public.course_lessons ALTER COLUMN id SET DEFAULT nextval('public.course_lessons_id_seq'::regclass);
 @   ALTER TABLE public.course_lessons ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    256    257    257            �           2604    17252    course_progress progress_id    DEFAULT     �   ALTER TABLE ONLY public.course_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.course_progress_progress_id_seq'::regclass);
 J   ALTER TABLE public.course_progress ALTER COLUMN progress_id DROP DEFAULT;
       public               postgres    false    274    275    275            �           2604    16744    courses course_id    DEFAULT     v   ALTER TABLE ONLY public.courses ALTER COLUMN course_id SET DEFAULT nextval('public.courses_course_id_seq'::regclass);
 @   ALTER TABLE public.courses ALTER COLUMN course_id DROP DEFAULT;
       public               postgres    false    240    241    241            �           2604    16906    departments department_id    DEFAULT     �   ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);
 H   ALTER TABLE public.departments ALTER COLUMN department_id DROP DEFAULT;
       public               postgres    false    254    255    255            �           2604    16812    enrollments enrollment_id    DEFAULT     �   ALTER TABLE ONLY public.enrollments ALTER COLUMN enrollment_id SET DEFAULT nextval('public.enrollments_enrollment_id_seq'::regclass);
 H   ALTER TABLE public.enrollments ALTER COLUMN enrollment_id DROP DEFAULT;
       public               postgres    false    247    248    248            �           2604    16770    instructors instructor_id    DEFAULT     �   ALTER TABLE ONLY public.instructors ALTER COLUMN instructor_id SET DEFAULT nextval('public.instructors_instructor_id_seq'::regclass);
 H   ALTER TABLE public.instructors ALTER COLUMN instructor_id DROP DEFAULT;
       public               postgres    false    243    244    244            �           2604    17204     lesson_attachments attachment_id    DEFAULT     �   ALTER TABLE ONLY public.lesson_attachments ALTER COLUMN attachment_id SET DEFAULT nextval('public.lesson_attachments_attachment_id_seq'::regclass);
 O   ALTER TABLE public.lesson_attachments ALTER COLUMN attachment_id DROP DEFAULT;
       public               postgres    false    271    270    271            z           2604    16622    lesson_files file_id    DEFAULT     |   ALTER TABLE ONLY public.lesson_files ALTER COLUMN file_id SET DEFAULT nextval('public.lesson_files_file_id_seq'::regclass);
 C   ALTER TABLE public.lesson_files ALTER COLUMN file_id DROP DEFAULT;
       public               postgres    false    230    231    231            �           2604    16688    lesson_progress progress_id    DEFAULT     �   ALTER TABLE ONLY public.lesson_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.lesson_progress_progress_id_seq'::regclass);
 J   ALTER TABLE public.lesson_progress ALTER COLUMN progress_id DROP DEFAULT;
       public               postgres    false    236    235    236            �           2604    16712    lesson_sections section_id    DEFAULT     �   ALTER TABLE ONLY public.lesson_sections ALTER COLUMN section_id SET DEFAULT nextval('public.lesson_sections_section_id_seq'::regclass);
 I   ALTER TABLE public.lesson_sections ALTER COLUMN section_id DROP DEFAULT;
       public               postgres    false    237    238    238            �           2604    16944    lesson_videos video_id    DEFAULT     �   ALTER TABLE ONLY public.lesson_videos ALTER COLUMN video_id SET DEFAULT nextval('public.lesson_videos_video_id_seq'::regclass);
 E   ALTER TABLE public.lesson_videos ALTER COLUMN video_id DROP DEFAULT;
       public               postgres    false    258    259    259            t           2604    16604    lessons lesson_id    DEFAULT     v   ALTER TABLE ONLY public.lessons ALTER COLUMN lesson_id SET DEFAULT nextval('public.lessons_lesson_id_seq'::regclass);
 @   ALTER TABLE public.lessons ALTER COLUMN lesson_id DROP DEFAULT;
       public               postgres    false    229    228    229            _           2604    16487    questions question_id    DEFAULT     ~   ALTER TABLE ONLY public.questions ALTER COLUMN question_id SET DEFAULT nextval('public.questions_question_id_seq'::regclass);
 D   ALTER TABLE public.questions ALTER COLUMN question_id DROP DEFAULT;
       public               postgres    false    222    221    222            �           2604    17291    quiz_attachments attachment_id    DEFAULT     �   ALTER TABLE ONLY public.quiz_attachments ALTER COLUMN attachment_id SET DEFAULT nextval('public.quiz_attachments_attachment_id_seq'::regclass);
 M   ALTER TABLE public.quiz_attachments ALTER COLUMN attachment_id DROP DEFAULT;
       public               postgres    false    277    276    277            �           2604    16863    quiz_attempt_answers answer_id    DEFAULT     �   ALTER TABLE ONLY public.quiz_attempt_answers ALTER COLUMN answer_id SET DEFAULT nextval('public.quiz_attempt_answers_answer_id_seq'::regclass);
 M   ALTER TABLE public.quiz_attempt_answers ALTER COLUMN answer_id DROP DEFAULT;
       public               postgres    false    251    252    252            �           2604    16838    quiz_attempts attempt_id    DEFAULT     �   ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.quiz_attempts_attempt_id_seq'::regclass);
 G   ALTER TABLE public.quiz_attempts ALTER COLUMN attempt_id DROP DEFAULT;
       public               postgres    false    249    250    250            �           2604    17066    quiz_progress progress_id    DEFAULT     �   ALTER TABLE ONLY public.quiz_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.quiz_progress_progress_id_seq'::regclass);
 H   ALTER TABLE public.quiz_progress ALTER COLUMN progress_id DROP DEFAULT;
       public               postgres    false    269    268    269            g           2604    16567    quizzes quiz_id    DEFAULT     r   ALTER TABLE ONLY public.quizzes ALTER COLUMN quiz_id SET DEFAULT nextval('public.quizzes_quiz_id_seq'::regclass);
 >   ALTER TABLE public.quizzes ALTER COLUMN quiz_id DROP DEFAULT;
       public               postgres    false    225    226    226            �           2604    17321    rankings ranking_id    DEFAULT     z   ALTER TABLE ONLY public.rankings ALTER COLUMN ranking_id SET DEFAULT nextval('public.rankings_ranking_id_seq'::regclass);
 B   ALTER TABLE public.rankings ALTER COLUMN ranking_id DROP DEFAULT;
       public               postgres    false    278    279    279            V           2604    16448    roles role_id    DEFAULT     n   ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);
 <   ALTER TABLE public.roles ALTER COLUMN role_id DROP DEFAULT;
       public               postgres    false    216    215    216            �           2604    16977    students student_id    DEFAULT     z   ALTER TABLE ONLY public.students ALTER COLUMN student_id SET DEFAULT nextval('public.students_student_id_seq'::regclass);
 B   ALTER TABLE public.students ALTER COLUMN student_id DROP DEFAULT;
       public               postgres    false    261    260    261            �           2604    17029    subject_prerequisites id    DEFAULT     �   ALTER TABLE ONLY public.subject_prerequisites ALTER COLUMN id SET DEFAULT nextval('public.subject_prerequisites_id_seq'::regclass);
 G   ALTER TABLE public.subject_prerequisites ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    267    266    267            |           2604    16648    subjects subject_id    DEFAULT     z   ALTER TABLE ONLY public.subjects ALTER COLUMN subject_id SET DEFAULT nextval('public.subjects_subject_id_seq'::regclass);
 B   ALTER TABLE public.subjects ALTER COLUMN subject_id DROP DEFAULT;
       public               postgres    false    233    232    233            X           2604    16460    users user_id    DEFAULT     n   ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);
 <   ALTER TABLE public.users ALTER COLUMN user_id DROP DEFAULT;
       public               postgres    false    218    217    218            �           2604    17237    video_progress id    DEFAULT     v   ALTER TABLE ONLY public.video_progress ALTER COLUMN id SET DEFAULT nextval('public.video_progress_id_seq'::regclass);
 @   ALTER TABLE public.video_progress ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    273    272    273            8          0    16993    admins 
   TABLE DATA           f   COPY public.admins (admin_id, user_id, department_id, "position", created_at, updated_at) FROM stdin;
    public               postgres    false    263   ��                0    16474    blacklisted_tokens 
   TABLE DATA           O   COPY public.blacklisted_tokens (id, token, expires_at, created_at) FROM stdin;
    public               postgres    false    220   ģ                0    16498    choices 
   TABLE DATA           c   COPY public.choices (choice_id, question_id, text, is_correct, created_at, updated_at) FROM stdin;
    public               postgres    false    224   O�      :          0    17013    course_enrollments 
   TABLE DATA           �   COPY public.course_enrollments (enrollment_id, user_id, course_id, enrollment_date, completion_date, progress_percentage, status, created_at, updated_at) FROM stdin;
    public               postgres    false    265   %&      2          0    16918    course_lessons 
   TABLE DATA           \   COPY public.course_lessons (id, course_id, lesson_id, lesson_order, created_at) FROM stdin;
    public               postgres    false    257   .      D          0    17249    course_progress 
   TABLE DATA           �   COPY public.course_progress (progress_id, user_id, course_id, completed, completed_at, created_at, updated_at, completion_date) FROM stdin;
    public               postgres    false    275   +.      #          0    16751    course_subjects 
   TABLE DATA           N   COPY public.course_subjects (course_id, subject_id, order_number) FROM stdin;
    public               postgres    false    242   d0      "          0    16741    courses 
   TABLE DATA           �   COPY public.courses (course_id, title, category, description, created_at, updated_at, cover_image_path, status, video_url, cover_image_file_id, department_id) FROM stdin;
    public               postgres    false    241    1      0          0    16903    departments 
   TABLE DATA           g   COPY public.departments (department_id, department_name, faculty, created_at, description) FROM stdin;
    public               postgres    false    255   A_      )          0    16809    enrollments 
   TABLE DATA           �   COPY public.enrollments (enrollment_id, user_id, subject_id, enrollment_date, completion_date, progress_percentage, status, created_at, updated_at, pre_test_completed, pre_test_score, post_test_completed, post_test_score) FROM stdin;
    public               postgres    false    248   �a      %          0    16767    instructors 
   TABLE DATA           �   COPY public.instructors (instructor_id, name, "position", avatar_path, created_at, updated_at, user_id, status, description, department, avatar_file_id, ranking_id) FROM stdin;
    public               postgres    false    244   �k      @          0    17201    lesson_attachments 
   TABLE DATA           �   COPY public.lesson_attachments (attachment_id, lesson_id, file_name, file_path, file_type, upload_date, title, file_url, file_size, file_id, created_at, updated_at) FROM stdin;
    public               postgres    false    271   �s                0    16619    lesson_files 
   TABLE DATA           �   COPY public.lesson_files (file_id, lesson_id, file_name, file_path, file_size, file_type, created_at, title, file_url) FROM stdin;
    public               postgres    false    231   �z                0    16685    lesson_progress 
   TABLE DATA           7  COPY public.lesson_progress (progress_id, user_id, lesson_id, completed, completion_date, duration_seconds, last_position_seconds, created_at, updated_at, video_completed, video_completion_date, quiz_completed, quiz_completion_date, overall_completed, overall_completion_date, quiz_awaiting_review) FROM stdin;
    public               postgres    false    236   �z                0    16709    lesson_sections 
   TABLE DATA           n   COPY public.lesson_sections (section_id, title, subject_id, order_number, created_at, updated_at) FROM stdin;
    public               postgres    false    238   ؃                0    16669    lesson_subjects 
   TABLE DATA           @   COPY public.lesson_subjects (lesson_id, subject_id) FROM stdin;
    public               postgres    false    234   ��      4          0    16941    lesson_videos 
   TABLE DATA           i   COPY public.lesson_videos (video_id, lesson_id, video_url, duration, created_at, updated_at) FROM stdin;
    public               postgres    false    259   �                0    16601    lessons 
   TABLE DATA           �   COPY public.lessons (lesson_id, title, description, video_url, can_preview, has_quiz, quiz_id, created_at, updated_at, duration, created_by, video_file_id, status) FROM stdin;
    public               postgres    false    229   /�                0    16484 	   questions 
   TABLE DATA           x   COPY public.questions (question_id, title, description, type, score, created_at, updated_at, question_text) FROM stdin;
    public               postgres    false    222   �(      F          0    17288    quiz_attachments 
   TABLE DATA           �   COPY public.quiz_attachments (attachment_id, quiz_id, user_id, title, file_url, file_type, file_size, file_id, file_name, file_path, created_at, answer_id) FROM stdin;
    public               postgres    false    277   OG      -          0    16860    quiz_attempt_answers 
   TABLE DATA           �   COPY public.quiz_attempt_answers (answer_id, attempt_id, question_id, choice_id, text_answer, is_correct, score_earned, created_at, has_attachments) FROM stdin;
    public               postgres    false    252   9I      +          0    16835    quiz_attempts 
   TABLE DATA           �   COPY public.quiz_attempts (attempt_id, user_id, quiz_id, start_time, end_time, score, max_score, passed, status, created_at, updated_at) FROM stdin;
    public               postgres    false    250   �M      .          0    16887    quiz_lessons 
   TABLE DATA           :   COPY public.quiz_lessons (quiz_id, lesson_id) FROM stdin;
    public               postgres    false    253   �Q      >          0    17063    quiz_progress 
   TABLE DATA           �   COPY public.quiz_progress (progress_id, user_id, quiz_id, completed, completion_date, score, passing_score, created_at, updated_at, passed, awaiting_review) FROM stdin;
    public               postgres    false    269   kR                0    16584    quiz_questions 
   TABLE DATA           >   COPY public.quiz_questions (quiz_id, question_id) FROM stdin;
    public               postgres    false    227   �T                0    16564    quizzes 
   TABLE DATA           	  COPY public.quizzes (quiz_id, title, description, time_limit_enabled, time_limit_value, time_limit_unit, passing_score_enabled, passing_score_value, attempts_limited, attempts_unlimited, attempts_value, status, created_at, updated_at, type, created_by) FROM stdin;
    public               postgres    false    226   pV      H          0    17318    rankings 
   TABLE DATA           <   COPY public.rankings (ranking_id, ranking_name) FROM stdin;
    public               postgres    false    279   �`      	          0    16445    roles 
   TABLE DATA           L   COPY public.roles (role_id, role_name, description, created_at) FROM stdin;
    public               postgres    false    216   �`                 0    16723    section_lessons 
   TABLE DATA           N   COPY public.section_lessons (section_id, lesson_id, order_number) FROM stdin;
    public               postgres    false    239   }a      6          0    16974    students 
   TABLE DATA           }   COPY public.students (student_id, user_id, student_code, department_id, education_level, created_at, updated_at) FROM stdin;
    public               postgres    false    261   �a      &          0    16777    subject_instructors 
   TABLE DATA           H   COPY public.subject_instructors (subject_id, instructor_id) FROM stdin;
    public               postgres    false    245   )d      '          0    16792    subject_lessons 
   TABLE DATA           N   COPY public.subject_lessons (subject_id, lesson_id, order_number) FROM stdin;
    public               postgres    false    246   �d      <          0    17026    subject_prerequisites 
   TABLE DATA           \   COPY public.subject_prerequisites (id, subject_id, prerequisite_id, created_at) FROM stdin;
    public               postgres    false    267   af                0    16645    subjects 
   TABLE DATA           �   COPY public.subjects (subject_id, code, title, description, credits, department, cover_image, allow_all_lessons, pre_test_id, post_test_id, status, created_at, updated_at, video_url, cover_image_file_id) FROM stdin;
    public               postgres    false    233   ~f                0    16457    users 
   TABLE DATA           �   COPY public.users (user_id, email, password, role_id, created_at, updated_at, status, username, first_name, last_name, name) FROM stdin;
    public               postgres    false    218   ��      B          0    17234    video_progress 
   TABLE DATA           m   COPY public.video_progress (id, user_id, lesson_id, watched_seconds, video_duration, updated_at) FROM stdin;
    public               postgres    false    273   ��      m           0    0    admins_admin_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.admins_admin_id_seq', 1, false);
          public               postgres    false    262            n           0    0    blacklisted_tokens_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.blacklisted_tokens_id_seq', 369, true);
          public               postgres    false    219            o           0    0    choices_choice_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.choices_choice_id_seq', 729, true);
          public               postgres    false    223            p           0    0 $   course_enrollments_enrollment_id_seq    SEQUENCE SET     T   SELECT pg_catalog.setval('public.course_enrollments_enrollment_id_seq', 133, true);
          public               postgres    false    264            q           0    0    course_lessons_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.course_lessons_id_seq', 1, false);
          public               postgres    false    256            r           0    0    course_progress_progress_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.course_progress_progress_id_seq', 435, true);
          public               postgres    false    274            s           0    0    courses_course_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.courses_course_id_seq', 60, true);
          public               postgres    false    240            t           0    0    departments_department_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.departments_department_id_seq', 22, true);
          public               postgres    false    254            u           0    0    enrollments_enrollment_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('public.enrollments_enrollment_id_seq', 1366, true);
          public               postgres    false    247            v           0    0    instructors_instructor_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.instructors_instructor_id_seq', 32, true);
          public               postgres    false    243            w           0    0 $   lesson_attachments_attachment_id_seq    SEQUENCE SET     S   SELECT pg_catalog.setval('public.lesson_attachments_attachment_id_seq', 45, true);
          public               postgres    false    270            x           0    0    lesson_files_file_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.lesson_files_file_id_seq', 1, false);
          public               postgres    false    230            y           0    0    lesson_progress_progress_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public.lesson_progress_progress_id_seq', 1051, true);
          public               postgres    false    235            z           0    0    lesson_sections_section_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.lesson_sections_section_id_seq', 1, false);
          public               postgres    false    237            {           0    0    lesson_videos_video_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.lesson_videos_video_id_seq', 16, true);
          public               postgres    false    258            |           0    0    lessons_lesson_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.lessons_lesson_id_seq', 195, true);
          public               postgres    false    228            }           0    0    questions_question_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.questions_question_id_seq', 213, true);
          public               postgres    false    221            ~           0    0 "   quiz_attachments_attachment_id_seq    SEQUENCE SET     R   SELECT pg_catalog.setval('public.quiz_attachments_attachment_id_seq', 153, true);
          public               postgres    false    276                       0    0 "   quiz_attempt_answers_answer_id_seq    SEQUENCE SET     R   SELECT pg_catalog.setval('public.quiz_attempt_answers_answer_id_seq', 701, true);
          public               postgres    false    251            �           0    0    quiz_attempts_attempt_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.quiz_attempts_attempt_id_seq', 573, true);
          public               postgres    false    249            �           0    0    quiz_progress_progress_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.quiz_progress_progress_id_seq', 333, true);
          public               postgres    false    268            �           0    0    quizzes_quiz_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.quizzes_quiz_id_seq', 87, true);
          public               postgres    false    225            �           0    0    rankings_ranking_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.rankings_ranking_id_seq', 1, false);
          public               postgres    false    278            �           0    0    roles_role_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.roles_role_id_seq', 4, true);
          public               postgres    false    215            �           0    0    students_student_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.students_student_id_seq', 39, true);
          public               postgres    false    260            �           0    0    subject_prerequisites_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.subject_prerequisites_id_seq', 9, true);
          public               postgres    false    266            �           0    0    subjects_subject_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.subjects_subject_id_seq', 67, true);
          public               postgres    false    232            �           0    0    users_user_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.users_user_id_seq', 83, true);
          public               postgres    false    217            �           0    0    video_progress_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.video_progress_id_seq', 1, false);
          public               postgres    false    272            /           2606    17000    admins admins_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (admin_id);
 <   ALTER TABLE ONLY public.admins DROP CONSTRAINT admins_pkey;
       public                 postgres    false    263            �           2606    16482 *   blacklisted_tokens blacklisted_tokens_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.blacklisted_tokens
    ADD CONSTRAINT blacklisted_tokens_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.blacklisted_tokens DROP CONSTRAINT blacklisted_tokens_pkey;
       public                 postgres    false    220            �           2606    16508    choices choices_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.choices
    ADD CONSTRAINT choices_pkey PRIMARY KEY (choice_id);
 >   ALTER TABLE ONLY public.choices DROP CONSTRAINT choices_pkey;
       public                 postgres    false    224            1           2606    17024 *   course_enrollments course_enrollments_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (enrollment_id);
 T   ALTER TABLE ONLY public.course_enrollments DROP CONSTRAINT course_enrollments_pkey;
       public                 postgres    false    265            %           2606    16925 "   course_lessons course_lessons_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT course_lessons_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.course_lessons DROP CONSTRAINT course_lessons_pkey;
       public                 postgres    false    257            A           2606    17257 $   course_progress course_progress_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY public.course_progress
    ADD CONSTRAINT course_progress_pkey PRIMARY KEY (progress_id);
 N   ALTER TABLE ONLY public.course_progress DROP CONSTRAINT course_progress_pkey;
       public                 postgres    false    275            C           2606    17259 5   course_progress course_progress_user_id_course_id_key 
   CONSTRAINT     ~   ALTER TABLE ONLY public.course_progress
    ADD CONSTRAINT course_progress_user_id_course_id_key UNIQUE (user_id, course_id);
 _   ALTER TABLE ONLY public.course_progress DROP CONSTRAINT course_progress_user_id_course_id_key;
       public                 postgres    false    275    275                       2606    16755 $   course_subjects course_subjects_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_pkey PRIMARY KEY (course_id, subject_id);
 N   ALTER TABLE ONLY public.course_subjects DROP CONSTRAINT course_subjects_pkey;
       public                 postgres    false    242    242                       2606    16750    courses courses_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);
 >   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_pkey;
       public                 postgres    false    241            #           2606    16911    departments departments_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);
 F   ALTER TABLE ONLY public.departments DROP CONSTRAINT departments_pkey;
       public                 postgres    false    255                       2606    16820    enrollments enrollments_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (enrollment_id);
 F   ALTER TABLE ONLY public.enrollments DROP CONSTRAINT enrollments_pkey;
       public                 postgres    false    248                       2606    16822 .   enrollments enrollments_user_id_subject_id_key 
   CONSTRAINT     x   ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_subject_id_key UNIQUE (user_id, subject_id);
 X   ALTER TABLE ONLY public.enrollments DROP CONSTRAINT enrollments_user_id_subject_id_key;
       public                 postgres    false    248    248                       2606    16776    instructors instructors_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_pkey PRIMARY KEY (instructor_id);
 F   ALTER TABLE ONLY public.instructors DROP CONSTRAINT instructors_pkey;
       public                 postgres    false    244            ;           2606    17209 *   lesson_attachments lesson_attachments_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.lesson_attachments
    ADD CONSTRAINT lesson_attachments_pkey PRIMARY KEY (attachment_id);
 T   ALTER TABLE ONLY public.lesson_attachments DROP CONSTRAINT lesson_attachments_pkey;
       public                 postgres    false    271            �           2606    16627    lesson_files lesson_files_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public.lesson_files
    ADD CONSTRAINT lesson_files_pkey PRIMARY KEY (file_id);
 H   ALTER TABLE ONLY public.lesson_files DROP CONSTRAINT lesson_files_pkey;
       public                 postgres    false    231                       2606    16695 $   lesson_progress lesson_progress_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (progress_id);
 N   ALTER TABLE ONLY public.lesson_progress DROP CONSTRAINT lesson_progress_pkey;
       public                 postgres    false    236                       2606    16697 5   lesson_progress lesson_progress_user_id_lesson_id_key 
   CONSTRAINT     ~   ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);
 _   ALTER TABLE ONLY public.lesson_progress DROP CONSTRAINT lesson_progress_user_id_lesson_id_key;
       public                 postgres    false    236    236                       2606    16717 $   lesson_sections lesson_sections_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_pkey PRIMARY KEY (section_id);
 N   ALTER TABLE ONLY public.lesson_sections DROP CONSTRAINT lesson_sections_pkey;
       public                 postgres    false    238                       2606    16673 $   lesson_subjects lesson_subjects_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY public.lesson_subjects
    ADD CONSTRAINT lesson_subjects_pkey PRIMARY KEY (lesson_id, subject_id);
 N   ALTER TABLE ONLY public.lesson_subjects DROP CONSTRAINT lesson_subjects_pkey;
       public                 postgres    false    234    234            +           2606    16949     lesson_videos lesson_videos_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.lesson_videos
    ADD CONSTRAINT lesson_videos_pkey PRIMARY KEY (video_id);
 J   ALTER TABLE ONLY public.lesson_videos DROP CONSTRAINT lesson_videos_pkey;
       public                 postgres    false    259            �           2606    16612    lessons lessons_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (lesson_id);
 >   ALTER TABLE ONLY public.lessons DROP CONSTRAINT lessons_pkey;
       public                 postgres    false    229            �           2606    16495    questions questions_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);
 B   ALTER TABLE ONLY public.questions DROP CONSTRAINT questions_pkey;
       public                 postgres    false    222            E           2606    17296 &   quiz_attachments quiz_attachments_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public.quiz_attachments
    ADD CONSTRAINT quiz_attachments_pkey PRIMARY KEY (attachment_id);
 P   ALTER TABLE ONLY public.quiz_attachments DROP CONSTRAINT quiz_attachments_pkey;
       public                 postgres    false    277                       2606    16870 .   quiz_attempt_answers quiz_attempt_answers_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_pkey PRIMARY KEY (answer_id);
 X   ALTER TABLE ONLY public.quiz_attempt_answers DROP CONSTRAINT quiz_attempt_answers_pkey;
       public                 postgres    false    252                       2606    16848     quiz_attempts quiz_attempts_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (attempt_id);
 J   ALTER TABLE ONLY public.quiz_attempts DROP CONSTRAINT quiz_attempts_pkey;
       public                 postgres    false    250            !           2606    16891    quiz_lessons quiz_lessons_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_pkey PRIMARY KEY (quiz_id, lesson_id);
 H   ALTER TABLE ONLY public.quiz_lessons DROP CONSTRAINT quiz_lessons_pkey;
       public                 postgres    false    253    253            7           2606    17073     quiz_progress quiz_progress_pkey 
   CONSTRAINT     g   ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_pkey PRIMARY KEY (progress_id);
 J   ALTER TABLE ONLY public.quiz_progress DROP CONSTRAINT quiz_progress_pkey;
       public                 postgres    false    269            9           2606    17075 /   quiz_progress quiz_progress_user_id_quiz_id_key 
   CONSTRAINT     v   ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_user_id_quiz_id_key UNIQUE (user_id, quiz_id);
 Y   ALTER TABLE ONLY public.quiz_progress DROP CONSTRAINT quiz_progress_user_id_quiz_id_key;
       public                 postgres    false    269    269            �           2606    16588 "   quiz_questions quiz_questions_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (quiz_id, question_id);
 L   ALTER TABLE ONLY public.quiz_questions DROP CONSTRAINT quiz_questions_pkey;
       public                 postgres    false    227    227            �           2606    16583    quizzes quizzes_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (quiz_id);
 >   ALTER TABLE ONLY public.quizzes DROP CONSTRAINT quizzes_pkey;
       public                 postgres    false    226            G           2606    17323    rankings rankings_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.rankings
    ADD CONSTRAINT rankings_pkey PRIMARY KEY (ranking_id);
 @   ALTER TABLE ONLY public.rankings DROP CONSTRAINT rankings_pkey;
       public                 postgres    false    279            �           2606    16453    roles roles_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public                 postgres    false    216            �           2606    16455    roles roles_role_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);
 C   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_role_name_key;
       public                 postgres    false    216                       2606    16728 $   section_lessons section_lessons_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_pkey PRIMARY KEY (section_id, lesson_id);
 N   ALTER TABLE ONLY public.section_lessons DROP CONSTRAINT section_lessons_pkey;
       public                 postgres    false    239    239            -           2606    16981    students students_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);
 @   ALTER TABLE ONLY public.students DROP CONSTRAINT students_pkey;
       public                 postgres    false    261                       2606    16781 ,   subject_instructors subject_instructors_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_pkey PRIMARY KEY (subject_id, instructor_id);
 V   ALTER TABLE ONLY public.subject_instructors DROP CONSTRAINT subject_instructors_pkey;
       public                 postgres    false    245    245                       2606    16797 $   subject_lessons subject_lessons_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_pkey PRIMARY KEY (subject_id, lesson_id);
 N   ALTER TABLE ONLY public.subject_lessons DROP CONSTRAINT subject_lessons_pkey;
       public                 postgres    false    246    246            3           2606    17032 0   subject_prerequisites subject_prerequisites_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_pkey PRIMARY KEY (id);
 Z   ALTER TABLE ONLY public.subject_prerequisites DROP CONSTRAINT subject_prerequisites_pkey;
       public                 postgres    false    267            5           2606    17034 J   subject_prerequisites subject_prerequisites_subject_id_prerequisite_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_subject_id_prerequisite_id_key UNIQUE (subject_id, prerequisite_id);
 t   ALTER TABLE ONLY public.subject_prerequisites DROP CONSTRAINT subject_prerequisites_subject_id_prerequisite_id_key;
       public                 postgres    false    267    267                        2606    16658    subjects subjects_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);
 @   ALTER TABLE ONLY public.subjects DROP CONSTRAINT subjects_pkey;
       public                 postgres    false    233            (           2606    16927 #   course_lessons unique_course_lesson 
   CONSTRAINT     n   ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT unique_course_lesson UNIQUE (course_id, lesson_id);
 M   ALTER TABLE ONLY public.course_lessons DROP CONSTRAINT unique_course_lesson;
       public                 postgres    false    257    257            �           2606    16467    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    218            �           2606    16465    users users_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            =           2606    17242 "   video_progress video_progress_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.video_progress DROP CONSTRAINT video_progress_pkey;
       public                 postgres    false    273            ?           2606    17244 3   video_progress video_progress_user_id_lesson_id_key 
   CONSTRAINT     |   ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);
 ]   ALTER TABLE ONLY public.video_progress DROP CONSTRAINT video_progress_user_id_lesson_id_key;
       public                 postgres    false    273    273            �           1259    16540    idx_choices_question_id    INDEX     R   CREATE INDEX idx_choices_question_id ON public.choices USING btree (question_id);
 +   DROP INDEX public.idx_choices_question_id;
       public                 postgres    false    224            &           1259    16938    idx_course_lessons_lesson_id    INDEX     \   CREATE INDEX idx_course_lessons_lesson_id ON public.course_lessons USING btree (lesson_id);
 0   DROP INDEX public.idx_course_lessons_lesson_id;
       public                 postgres    false    257                       1259    16833    idx_enrollments_status    INDEX     P   CREATE INDEX idx_enrollments_status ON public.enrollments USING btree (status);
 *   DROP INDEX public.idx_enrollments_status;
       public                 postgres    false    248            )           1259    16955    idx_lesson_videos_lesson_id    INDEX     Z   CREATE INDEX idx_lesson_videos_lesson_id ON public.lesson_videos USING btree (lesson_id);
 /   DROP INDEX public.idx_lesson_videos_lesson_id;
       public                 postgres    false    259                       1259    16886 $   idx_quiz_attempt_answers_question_id    INDEX     l   CREATE INDEX idx_quiz_attempt_answers_question_id ON public.quiz_attempt_answers USING btree (question_id);
 8   DROP INDEX public.idx_quiz_attempt_answers_question_id;
       public                 postgres    false    252            �           1259    16599    idx_quiz_questions_question_id    INDEX     `   CREATE INDEX idx_quiz_questions_question_id ON public.quiz_questions USING btree (question_id);
 2   DROP INDEX public.idx_quiz_questions_question_id;
       public                 postgres    false    227            	           1259    16739    idx_section_lessons_order    INDEX     ]   CREATE INDEX idx_section_lessons_order ON public.section_lessons USING btree (order_number);
 -   DROP INDEX public.idx_section_lessons_order;
       public                 postgres    false    239            �           1259    16967    idx_users_username    INDEX     O   CREATE UNIQUE INDEX idx_users_username ON public.users USING btree (username);
 &   DROP INDEX public.idx_users_username;
       public                 postgres    false    218            I           2606    16509     choices choices_question_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.choices
    ADD CONSTRAINT choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.choices DROP CONSTRAINT choices_question_id_fkey;
       public               postgres    false    224    222    3570            Y           2606    16756 .   course_subjects course_subjects_course_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.course_subjects DROP CONSTRAINT course_subjects_course_id_fkey;
       public               postgres    false    241    242    3597            Z           2606    16761 /   course_subjects course_subjects_subject_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.course_subjects DROP CONSTRAINT course_subjects_subject_id_fkey;
       public               postgres    false    233    3584    242            X           2606    17216 "   courses courses_department_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
 L   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_department_id_fkey;
       public               postgres    false    241    255    3619            a           2606    16828 '   enrollments enrollments_subject_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.enrollments DROP CONSTRAINT enrollments_subject_id_fkey;
       public               postgres    false    248    3584    233            b           2606    16823 $   enrollments enrollments_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.enrollments DROP CONSTRAINT enrollments_user_id_fkey;
       public               postgres    false    248    3566    218            o           2606    17006    admins fk_admins_departments    FK CONSTRAINT     �   ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admins_departments FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
 F   ALTER TABLE ONLY public.admins DROP CONSTRAINT fk_admins_departments;
       public               postgres    false    255    3619    263            p           2606    17001    admins fk_admins_users    FK CONSTRAINT     z   ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admins_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 @   ALTER TABLE ONLY public.admins DROP CONSTRAINT fk_admins_users;
       public               postgres    false    3566    218    263            j           2606    16928 '   course_lessons fk_course_lessons_course    FK CONSTRAINT     �   ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT fk_course_lessons_course FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.course_lessons DROP CONSTRAINT fk_course_lessons_course;
       public               postgres    false    241    3597    257            k           2606    16933 '   course_lessons fk_course_lessons_lesson    FK CONSTRAINT     �   ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT fk_course_lessons_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.course_lessons DROP CONSTRAINT fk_course_lessons_lesson;
       public               postgres    false    229    257    3580            [           2606    16968     instructors fk_instructors_users    FK CONSTRAINT     �   ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT fk_instructors_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 J   ALTER TABLE ONLY public.instructors DROP CONSTRAINT fk_instructors_users;
       public               postgres    false    244    3566    218            l           2606    16950 %   lesson_videos fk_lesson_videos_lesson    FK CONSTRAINT     �   ALTER TABLE ONLY public.lesson_videos
    ADD CONSTRAINT fk_lesson_videos_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.lesson_videos DROP CONSTRAINT fk_lesson_videos_lesson;
       public               postgres    false    229    3580    259            L           2606    16912    lessons fk_lessons_created_by    FK CONSTRAINT     �   ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT fk_lessons_created_by FOREIGN KEY (created_by) REFERENCES public.users(user_id);
 G   ALTER TABLE ONLY public.lessons DROP CONSTRAINT fk_lessons_created_by;
       public               postgres    false    229    218    3566            v           2606    17307 .   quiz_attachments fk_quiz_attachments_answer_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_attachments
    ADD CONSTRAINT fk_quiz_attachments_answer_id FOREIGN KEY (answer_id) REFERENCES public.quiz_attempt_answers(answer_id);
 X   ALTER TABLE ONLY public.quiz_attachments DROP CONSTRAINT fk_quiz_attachments_answer_id;
       public               postgres    false    252    277    3615            w           2606    17302    quiz_attachments fk_quiz_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_attachments
    ADD CONSTRAINT fk_quiz_id FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON UPDATE CASCADE ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.quiz_attachments DROP CONSTRAINT fk_quiz_id;
       public               postgres    false    277    226    3575            \           2606    17324    instructors fk_ranking    FK CONSTRAINT     �   ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT fk_ranking FOREIGN KEY (ranking_id) REFERENCES public.rankings(ranking_id);
 @   ALTER TABLE ONLY public.instructors DROP CONSTRAINT fk_ranking;
       public               postgres    false    3655    244    279            H           2606    16468    users fk_role    FK CONSTRAINT     �   ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE RESTRICT;
 7   ALTER TABLE ONLY public.users DROP CONSTRAINT fk_role;
       public               postgres    false    218    216    3559            m           2606    16987     students fk_students_departments    FK CONSTRAINT     �   ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_departments FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
 J   ALTER TABLE ONLY public.students DROP CONSTRAINT fk_students_departments;
       public               postgres    false    255    3619    261            n           2606    16982    students fk_students_users    FK CONSTRAINT     ~   ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 D   ALTER TABLE ONLY public.students DROP CONSTRAINT fk_students_users;
       public               postgres    false    261    218    3566            x           2606    17297    quiz_attachments fk_user_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_attachments
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;
 E   ALTER TABLE ONLY public.quiz_attachments DROP CONSTRAINT fk_user_id;
       public               postgres    false    3566    277    218            u           2606    17210 4   lesson_attachments lesson_attachments_lesson_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lesson_attachments
    ADD CONSTRAINT lesson_attachments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id);
 ^   ALTER TABLE ONLY public.lesson_attachments DROP CONSTRAINT lesson_attachments_lesson_id_fkey;
       public               postgres    false    3580    271    229            N           2606    16628 (   lesson_files lesson_files_lesson_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lesson_files
    ADD CONSTRAINT lesson_files_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.lesson_files DROP CONSTRAINT lesson_files_lesson_id_fkey;
       public               postgres    false    231    3580    229            S           2606    16703 .   lesson_progress lesson_progress_lesson_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.lesson_progress DROP CONSTRAINT lesson_progress_lesson_id_fkey;
       public               postgres    false    236    229    3580            T           2606    16698 ,   lesson_progress lesson_progress_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY public.lesson_progress DROP CONSTRAINT lesson_progress_user_id_fkey;
       public               postgres    false    3566    218    236            U           2606    16718 /   lesson_sections lesson_sections_subject_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lesson_sections
    ADD CONSTRAINT lesson_sections_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.lesson_sections DROP CONSTRAINT lesson_sections_subject_id_fkey;
       public               postgres    false    238    3584    233            Q           2606    16674 .   lesson_subjects lesson_subjects_lesson_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lesson_subjects
    ADD CONSTRAINT lesson_subjects_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.lesson_subjects DROP CONSTRAINT lesson_subjects_lesson_id_fkey;
       public               postgres    false    3580    234    229            R           2606    16679 /   lesson_subjects lesson_subjects_subject_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lesson_subjects
    ADD CONSTRAINT lesson_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.lesson_subjects DROP CONSTRAINT lesson_subjects_subject_id_fkey;
       public               postgres    false    233    234    3584            M           2606    16613    lessons lessons_quiz_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;
 F   ALTER TABLE ONLY public.lessons DROP CONSTRAINT lessons_quiz_id_fkey;
       public               postgres    false    3575    229    226            e           2606    16871 9   quiz_attempt_answers quiz_attempt_answers_attempt_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.quiz_attempts(attempt_id) ON DELETE CASCADE;
 c   ALTER TABLE ONLY public.quiz_attempt_answers DROP CONSTRAINT quiz_attempt_answers_attempt_id_fkey;
       public               postgres    false    250    3612    252            f           2606    16881 8   quiz_attempt_answers quiz_attempt_answers_choice_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_choice_id_fkey FOREIGN KEY (choice_id) REFERENCES public.choices(choice_id) ON DELETE SET NULL;
 b   ALTER TABLE ONLY public.quiz_attempt_answers DROP CONSTRAINT quiz_attempt_answers_choice_id_fkey;
       public               postgres    false    252    3572    224            g           2606    16876 :   quiz_attempt_answers quiz_attempt_answers_question_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;
 d   ALTER TABLE ONLY public.quiz_attempt_answers DROP CONSTRAINT quiz_attempt_answers_question_id_fkey;
       public               postgres    false    252    222    3570            c           2606    16854 (   quiz_attempts quiz_attempts_quiz_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.quiz_attempts DROP CONSTRAINT quiz_attempts_quiz_id_fkey;
       public               postgres    false    250    226    3575            d           2606    16849 (   quiz_attempts quiz_attempts_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.quiz_attempts DROP CONSTRAINT quiz_attempts_user_id_fkey;
       public               postgres    false    218    3566    250            h           2606    16897 (   quiz_lessons quiz_lessons_lesson_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.quiz_lessons DROP CONSTRAINT quiz_lessons_lesson_id_fkey;
       public               postgres    false    253    229    3580            i           2606    16892 &   quiz_lessons quiz_lessons_quiz_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_lessons
    ADD CONSTRAINT quiz_lessons_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;
 P   ALTER TABLE ONLY public.quiz_lessons DROP CONSTRAINT quiz_lessons_quiz_id_fkey;
       public               postgres    false    226    3575    253            s           2606    17081 (   quiz_progress quiz_progress_quiz_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.quiz_progress DROP CONSTRAINT quiz_progress_quiz_id_fkey;
       public               postgres    false    226    3575    269            t           2606    17076 (   quiz_progress quiz_progress_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_progress
    ADD CONSTRAINT quiz_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.quiz_progress DROP CONSTRAINT quiz_progress_user_id_fkey;
       public               postgres    false    218    269    3566            J           2606    16594 .   quiz_questions quiz_questions_question_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.quiz_questions DROP CONSTRAINT quiz_questions_question_id_fkey;
       public               postgres    false    222    3570    227            K           2606    16589 *   quiz_questions quiz_questions_quiz_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.quiz_questions DROP CONSTRAINT quiz_questions_quiz_id_fkey;
       public               postgres    false    226    3575    227            V           2606    16734 .   section_lessons section_lessons_lesson_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.section_lessons DROP CONSTRAINT section_lessons_lesson_id_fkey;
       public               postgres    false    229    3580    239            W           2606    16729 /   section_lessons section_lessons_section_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.section_lessons
    ADD CONSTRAINT section_lessons_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.lesson_sections(section_id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.section_lessons DROP CONSTRAINT section_lessons_section_id_fkey;
       public               postgres    false    3592    239    238            ]           2606    16787 :   subject_instructors subject_instructors_instructor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(instructor_id) ON DELETE CASCADE;
 d   ALTER TABLE ONLY public.subject_instructors DROP CONSTRAINT subject_instructors_instructor_id_fkey;
       public               postgres    false    244    245    3601            ^           2606    16782 7   subject_instructors subject_instructors_subject_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subject_instructors
    ADD CONSTRAINT subject_instructors_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.subject_instructors DROP CONSTRAINT subject_instructors_subject_id_fkey;
       public               postgres    false    245    3584    233            _           2606    16803 .   subject_lessons subject_lessons_lesson_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.subject_lessons DROP CONSTRAINT subject_lessons_lesson_id_fkey;
       public               postgres    false    229    3580    246            `           2606    16798 /   subject_lessons subject_lessons_subject_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subject_lessons
    ADD CONSTRAINT subject_lessons_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.subject_lessons DROP CONSTRAINT subject_lessons_subject_id_fkey;
       public               postgres    false    246    233    3584            q           2606    17040 @   subject_prerequisites subject_prerequisites_prerequisite_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_prerequisite_id_fkey FOREIGN KEY (prerequisite_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
 j   ALTER TABLE ONLY public.subject_prerequisites DROP CONSTRAINT subject_prerequisites_prerequisite_id_fkey;
       public               postgres    false    233    3584    267            r           2606    17035 ;   subject_prerequisites subject_prerequisites_subject_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
 e   ALTER TABLE ONLY public.subject_prerequisites DROP CONSTRAINT subject_prerequisites_subject_id_fkey;
       public               postgres    false    233    3584    267            O           2606    16664 #   subjects subjects_post_test_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_post_test_id_fkey FOREIGN KEY (post_test_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;
 M   ALTER TABLE ONLY public.subjects DROP CONSTRAINT subjects_post_test_id_fkey;
       public               postgres    false    226    3575    233            P           2606    16659 "   subjects subjects_pre_test_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pre_test_id_fkey FOREIGN KEY (pre_test_id) REFERENCES public.quizzes(quiz_id) ON DELETE SET NULL;
 L   ALTER TABLE ONLY public.subjects DROP CONSTRAINT subjects_pre_test_id_fkey;
       public               postgres    false    226    3575    233            8      x������ � �            x�ս��H�������`�����ё,���0���O�ɪLL�����T�H=T��w�/WĊ5�?P�?�fv�N��~��V+��Q.�|Ic����k�g�/�?:���X�z�8�?���M�t7����N�L�oW��ݷ{�q��������� �L�Є�TW��r����f�j&������ͱ��=��u��"O�{�^�yV_B�B�{�H�Q�0#G1�����o����߈����'�BQj kk��o��9i	����4�Ϸ�tڎ�x�!Ge<k�X��X���M���s!��k����E�f�"��߫�X&�)�`Q~#y���TeZ�EC��\O�8'gq{H�%�v�k�y�P�@	������~# e¨V�	Q��Y_�� Vl�Q� �����["�c��Zh����<Di���U��hw≕�MP�I����P�6��yb=ms	r;'lcLl�s�j;�n�^e�dl���~OGB�,�J=�M����#�`����X-�t�&xL��>"[�6����O��N���t+h�Wb��7B��6N�&P@L��uqU��-������D��������wYܴ����}v��]�2U�� F{��X�d}���9�y��Q~el#�ѫ�؃�
�x��.�*�.�.��>=W{^����U{�0VG�xb��{b��`U�����{�� ��k�iq�V�h�h�W�e�J�I��^�ܑE����Js�\Wz|���݊���}Z����� +3�u�Ěv�W�o��+k,���������=�{�a�#�����vM�
<�<9ک��~�����.B�g%�#&z���8n�������qN�6�J�������B�ݑ�k���	W�M�d!���c��d��mU-��~���ڇ��">�"����6/� O`�ZıJ�9��m��,�L�0l�;+C�;X�u����n�L�dl��B�O�'�Rp��OG���/�`��O�����yf��TM��+<X�3���0;8	�L.o}�]^���st2u��U��O.�?8l��8��������$�sǫ.��ڊx�x�K�N���꾹�<���`�x���[L�8N�S>��E����DNإ�18o���.�#q�ꦈi}������k7�x��n�t�'D-Zh�2r�(�s�xf��c��'=Vp=�2����"F� jrQ�)!�a�P��i�=%�s��#�T-W�n;�
�qFɕ����T�c�eN��љy�]d^�K��#`����Zm��gTL�
.a`T�"ɒa�twͰ�䌍8��+Ta����:Ϗ<������G:���F�'~~#��~$�HZ'ᯬr�FȪ��"#[su��R	6).�~,l$e�"t~���y.-xb�+�O_Y�7`Zp�PcaMHzX��9˭���{���%S�5������逨���#��5dS(�;3F��HѶS����ݼ�m�U{���w����A$L���dUM�Z$�<`�b$���I��BGg�%�K.ͭ"���̲y�;�e�#\��{b���С�FN�b5������p��X4�B���TSy�p�i̅����.$�H��l?��p�?P��¼���X���?8%�*$��jW�q`E��J�f�q���'oc�f6��-w�
o"��V��7�gW�|��V��0�#�Srq{]�j��\�J%mO���$a�I���eq�%A�V�UzƸ��Z��ĊC�k�M�+30p�L��3��25&a���� �8�Ʈj���]�U����u��e��V��D6�)���z���$F��F`VGP_��7�;]�Z�0��Ʈ���Ю��
��
KE�/��\��{L��!��~n/���Kįz�pob=V|F �O��Xl ��`A�a`�����$�V��/�(r�x�����Z����2?]�z�Ɋ��c0[�����|��vh��V��r?[��	Kjq���m��3��m��H�d��)ow��V��V��Gmc1����tQ�����F ��?5�^��V���r8H �Y�g;s��iJ=�v��7l�	L�䢶��[��-c��}r���}a��� ��*��O�W�
:�V���M
yk��8:p�}�1�9E�Qʳ��0M�����2Av�+X��o�XA�"K�C��oc})L<X��N�3,n6��G°�`=sU���ϗh��Z�i����g��+ޥ��OT�b����+:�����WF�T��_d{ӷ����EN��Ѽp�����I�8ff92�|���k`�IC��%��G!��PM�R�%���n�=8��*l�v�E��vȢXHE�B�JW8�
N��Oމ��	nZ��NZg�>�ܨɐd݃�`N��d=�j-y���������֪��>��tĖWdjZ����c����a�0b��A�sY�G쏸� �HQ�wO�e��
��R{�b�Ӽ�E��QZ|y�w��[�>W4�=N�)S=�� S�WV�XKD���φ�=��R ��$���꣒�c�#Ǫ4��6���#5���j�a!Ƴ��&��Hu旂/pk}ƾ�G����~�	���=ɡqS�6_����M�5i����
�+�AT���y����͕V	ëS2��?��[�1�n{�R��>���+		XSÆMm���A[8%�
�p� t��7����bWVkGjܣ)�Ί厵+��
����p��V��+���@�n��b?R(�}H���
�Zla�$�tN5'8Zwy:��l��e�灰˯�:F�4�S�ީe��J���߇D~c :�J��Q��9���)�k�[��?�[�A$����&dNR\���m�@DxI\F��n��V�8	$�O���Q-�?�C�#x���wEAdAV������\��]�,�����3�7R��T�.)GWV��/�efm���>�ҿI�������{ˤ*x��ڃv�%Iۻ'��C��U$XS�xm�۲�5�����n����=���
38����3�b����g�*-1B�R���O2��V�f�4�f�q�e����yǯ�#�\i!?z��f������u͂����%-b:k�|e�Xsk��mRa'k��b��&&oN��Xa�����u�I�R��ڪ�7��֪��'W\e�d6� 2"8n)�R������*b�x�ٱ��2=_�>�yV |���71t��]�s�6�<B�lP�f&�AU�,�9+��z}��ZM�57�e�q3I|rF�c�,ޕ�a�|h���>�kJ��<R������h65��ۈ�5�ߴ턺eٚҢ�����yُ.��񈮳LB��J-��M�1p���ޏ���f�+Sl*QZF�C��=��i��=;9윙S��IbO�LY�C����mmt�'\�0���қ�x�l�O�F��N�'��Z͵!>�M6'���
Kg��28 ��٩u��^�v�t3��玖���w{�v��;^���X^j�m�&o�H\θ��#%�}?�2P��� ̧�FJ��N�ԉ@�/�2r�4`I�d�\d������\i��Ҥ;Ӗ�����0��=o���f�B��kf�]��Y$ԇ-�����r+wS����u�g��]�/�d$�-���z�I�x�Yޚ���h��XAZ���P�=����¯����G�59�Ȝ�g�~�K\a�5:IX?�&��ۛB)���~�,b��T�>����I�q�J�1��`Eց+���k����F1��荼󖢶2ض)�VNc�[��{tR{Js�b�c��!�y��{��
 页3S~�|T�3�@�대ժ&�a)��	��*�"�r�҈�L*m֥{Ә��ϊB�'E�f��U�wA$L���3sjGj�9b�9�����ø�(�ޱت���)�b����*���P�t�{��a�7'����#%�_������ö �`Xx��k���S���u:�)3��"ϸ��Z$6U'�6q�gy��*l���2?3	�h-�R
�]d�I�Ȝ��6D��� ����jb��Y���5{�6����m|t���B    �f��.We~p�_7\��e��F���+�vFQ��^���8߰#���r������^1��8�}b�_���34�y/1�h��)�� A����'Φ4��|�Њ}�!�����]J,�]���m�=���N9�#��Mp=��S,)���=�7S�
���(�W{�Z嚸�C,���[K�´�3D&|���<_���8�1���^�va��'�nl����\?��F�
�\5��}t�{���|D���d�
�j��(�"F;���K$r1�e�}���q�{��+�o��]s䅱�]=�l��n���Yl�znV.G�W's¤��{�AG�`���6p�xwWawD�������:LF�>�ص� c���Ǜx�f^=�&���su�EKr��[�
��0M}b$��A�#�*�)�3s��J�#:�, #OO����!;]+gv�����f�}K�������ӆO�>#���'Ʈ��cٟ���l�����8ܯ��ys$��>�>��M`^���U�`���c)���f�{b�	�^�������?�WDp���Q&[LRv+��N"�a�=.���LW��<���s�<Mmc��+�g����>�#�~��C'�
���X� ����(I�D���E�%<]�V\�^W�b�(�(e��2=��5�)�'Z���b=�>���ء}�HU��6c��试�J�Y���J�����̽�8�p;-�#AO�#��\��xo�ך�t���������Wxe�~O��n��ʙ�j�W���v���W&y��*!a،2(B��ܹ\�x�9�V^����gx���!O�-��]�a��{�}��Z��}T��-�x��Tz��vX٧%y�Җ*��ݣ7�69��¹[�WV �QO����,�����Z���.�ɡ��X���
�lYQg���]d+��X���ฆ���Ƕ-�l�a�W~8��t}�i1x���+<_-�΢�h[O&΍"΍�3��U/-��b��;�n���@�q�߬��vܷy���7��_�U��6*����}�d� l�W��ǎ��jkT��qĩ��!��ln���%�l/�f�������!�.�@�&2m��~��S*������� �p˖W������F��eҞ�-tD�ǍMn���05��������4�qx�2��C�v�y�V�������tw�CR�ZWp�M���R>����"oo�0�'$;��i���SD����+f�����/��k�_:�xq�X���`)����*�9O����m�LzR =K�>ܳ_"a�����wj��[�պ���Fs<qg⼉��Tv�j�^��k���v�E�SE�G��cO�m�x7���	��Zu�G��]��]�m-�ĹA&��2���F���r�?����h�?v���+N?���N���8)}��I���u��x7�6O��x9�����~C,���Y�Ek;Zm�~�|��Iucgx�D�?6�����,�5��-��taD)/}���� �<F#�R��N�oo�ս�+������y��FΞ8?�0�A������8��[�����GnW���.�O�f}<IV�Σk��,Y�r�,���:?��(,�`O�7H�/�R'�!�P�5MG��KP׋p�Ź�����[��[A!z���	��H"}F�7ǳ��6���~�j�>.'(Bbɒp?�\d�������� :>���m4^6}�9A#/�	(T��X��S
�H���8���%����M>f';͙PH�J� ω���A:Je���
R�pb�ܧ�q>�;�i�^��F��6� k��b0��@d���X�4�;��5z�����e�D+ߙ��s6k�_N���$���B��Y���%��η�h����*���Tٺ)ݫsȚ�u�O����!������!=�V�?����u�-��l��'��!�	�	x���a�HSU�1����$�$�(���=:��5k��_��]3���Y88d@�K�H���X߮��5 ?�������$�����x��u�L��V4���[��W�v�'V`@�ɮ�ǘ쯒Cg�2�}?�%<F���7�-%'�2&9	UY���]��1��ZG�'������5��,�C��'�M؀����8�5��_�12U1�h�|�����^N�V�-�{9��3���<�ز��o���@�l�ϴ΁i��y���獲IN���!��cfL(�*��H*,�+�-��80#��&�X�~�)+��O7�Դw�(۵�px�(]��b��)
ζ�����NvtYK���w�o���3*���,�@�>X�p`��@��2�р'�Ї��z~˧~�*&�z�OSO�ٸX]�k]Xsm�6�r�1z���ݗI�}8�2X:�=.�1��L� �t.�VL��:l�{~���Sɮ.�vs]�w�sR��������'���`e�Z~�D��8&�M���l�ʹ��-ϊ�e[�{�I�:*c)��.�VO�]-�@z�`�pJ�'n$�P�{�\��'��\�̓�}�6$[9���REɦJɏ�gZW�_"H��O�s�Ô�2�\�Fw	�[��aJN
�X 8��=Վ��u�jь˶-��X�N�E�gyH|鵢�e�g[`}ζ�?�E���A�D~3�XS�W��Og�1��W���:/+�ތ����=��`��9��O���]�/sK�a~�N=��e��M��QUўǒ;ϖNR��1_�Ugq����~�Cp�l�O�nb%>ǁ�L���Jf��������*���K ?p�����0%s*\n֗Mx�cC�z��̩��Z7>ɺ�%�� �gf	�述����yc�dR�}�������x���[ԒD��h��m��t����0uC��t�0� �~�~����o����i�1d���t����ZBj�/ژ�}=��
��B��G���$ڐIL�䘊���X��e��8��20~�ws޲s#\�\�σt�| �>���v�)t"xW~r��}���Zܔ���'v�:�H~����.Š�I�9 `���Ӆ �_���ɇ�Xˆ;a����;1�r��RW+V�a��w��f*$�����!�J�a��'nBB��Oy�u�,����}"���(?�6��jg�v���C�V���1v�++��Y�κC;W6�_�k:Ƈv��W��_q�����:]�)rhȼ���֔��W0�y��8`���>�&��c"��1y0��n��i�m�^1N0M+XF��]q�٬����Ρ��m(��:b(�pn|�m�c�ىb�$T��\���А�j�u?�С<r,� b3*E�G�{����,�"^ͫŌ��mw\����S�<1b�H=�gd�:26X��=���B֏�ʒ/�QX����ƶ9=k1:������j�ir�䔠[��
�n�WV�s�(��O��C�6@_���RM1�t���&Ț�'3�[�]N�<_��Q��z#����?�]��b^Y	h����s�Q��ƀ#�Gv��������#�$�=K�������\}I#�A0T�O���Z����f�ȓ_!�'/�K�oĄ��[�z����9ڪ�g�ҝň�u&�ێ���_iڼ��c��_��}����L�i��3#�1'����=�4p��o'��ۂ����K�p�QVQ��N2��"���>I*�y�ͽ�ʈ!=F�Y	�:8����E�ӄ�����&�:E~��zVUR�����	�M��wK��,�V���9܏�{��}H�Kgk��iP��ՠ��zР����ӭ^�%C����jx�Z����稤�,�\���Ơ��l�G��s�,�4�+�cPR7_�A�;`P~g\���.�6���I{.�ʮۃۚ�����:��+$ه$w�k/︜��G�^=�Pc��v��$(��F�pV+��-��6��M�����F�-/|%�?�0
�&�"w������J������E�Ʉ��z�,�&o���4&z��Qbqb����Ƀ۬ze%�Y�I-xܡ<��f�� ������
�N`0    Țn3
Ņr��ʜ�`��D��/w��o��tI�ꭕ�XIX=�r���e�:�R����^�T/v�`;��Z;X'w��������_M�)c�\��e����,��$��A�J�ӯ�
��v��Ҽ�����<wGѴV&���{l��w�:Q��ޣȕ-�N����0?�2|#�{�z��r����v$�D��ë��7K��c `)/k���Gjo���R�ma#���2���JӓQ�Ц�j��K�@��<X��K,ۄx]ʰ�s`�뉺V3l>��q������]2�7�eŷE5�����#�tL�����h�tڻU�/-@�j�]Z�,�4oP:],��.fl&"����:���O�e|��օe��+��pAVM ��e%[�,\�>+����m�N̅e/��m}?���V�s<��w�;�U��
��f��,����{��2j�]ls *��bW�2'��3d� ��+��N��L(����F{���j��Z���#~b��a�%��aJx�3���1�v�z�����,$2�䟶��*a+sm��ʊa=V�������3,8g�o�,�L��Ro�n{�)���)�g��ȶ�n�x�$���q�7,�z���W�φP�}�Ǧ����q9'�St�jtn5Stb"�����n�5~�_�[5Zud��!�J��S�:�MkU�>��4ڮ$|���)k{��Z0[�$vXs��n��K�c�e��Q�
J~J2 t��?E~���;P�3綊���6�a�@A<�>Y��N�ၥ�.�q�}����o��J>���G�Uw����������'�q��4N�o�z�m�ى��vεK��<�����w���*- ���G]�/�'ƅ��,0l�k�Z�5�)�ƍ�[!)S�ͳ�dׅ�E��H�x>s��c��W"�~<���с�-�cC�~����P���1Yl&�[�pL�
�/�iX<Y�lR�G��銆�o$������:M��]so�� �P��A��ҡZ���Ӊ�z��w)� Τ���c5tKvy��k�� ��Cp�'�GZ��rR����>�!��rh��>g8[�nփD�#���I4z�+�G:=jK'��9����'�be�ׇ)c\מ�ͦ���{륓��P}	�����E(T��4����Qt�v��n\�Q�_��X���2��z���b>:����q�胒�z��B�U :4H�s�ǋ�=!z8���|M9�5�\8��)s���0;z��VX��P[��\���'�����<�w�f�ТC�S�t;P-�[�ŠE�Q�I��H�pi�eȕ�lW�ɞ����,/WI�&��L_@	�	��&���24.z�E፱~\�@�..�m��)ym���IfugV�Q��7�������i��Wc�	��%{�(��?�����-�^k��[(��Z�Al,/^�S�u�ڮ��Z�+�sg�d(�m���'���c�����B{p�o��/��2�خ�rKҨ&�Y���ո��}���#�6��s#@��b�V�q�"�yX�[�OL}��~!Ɓc���&�:ZM��oh	UX�d��n�LY3���:?�e6ۋI�.�h�'Q�CL�/��>K��v�Ѐ�'�K�Z��Ǻ��U��=V��x�K��.��v��E���g~m�mp�s�\;�i��Ǌ~y��oV(c	-;8Rz�eA:���C���&��&��
�w?b/���0�(7t�!��O:f�\�����	���(�E���k ��%�C�nzii�i����)Ar'�,��Wǆ���-�LmS��	�oZ零��F@|8T��=�X��V�O1���n�)�(âY�g��SkӖ�*k�B��l���v�ަ�N��ĽLw��9r��ՙ�K&�q�o�pF/[%�>���lu��G"��N����/��9��NP���9k��,؇���PF��9���1�� �?W]"5�4k+�2ز��C�`w��tw6D�0͗\$��I(��[*HS2�����
�O�|uȐX�Q*���եV~1�_8���ZX8ħK!�R�r?�����J���H���n/�Te-��W�{%���'P
Ôn�U���z��SN{����&�k'<�8S:OGs��h�v?*�\Ts^��['���:�WP��2�J�o@��dZP�U\��,����KHgc?�gK�������ek��䡮l(���6����V/����Q�/�0x,����jr�}�߯�O��ki���~f(�m���`�Dm8�fE�4Ŗ8��.����Z�Z�M�/�p�g���7-c��G�,㤆y���l�����Ө��O�e/'n�A����o����}���d�,S�~�=��)�8�wp��~�>^�έ���"( >�G�(/=�����_ 	Iኃ�Y�tp���*�Ї�dT��J��n�ڽ�wpMɚl[�jd�m�y؈垛�*ؼ�/<n>R/<3���7F%�ozc��F%^c	h���~��t���Kz�X^��t�����.�`n�Ӕxe��V���Ǩ��|gT�q'�ݼ]yE'"�v�]g����ĸ��ћ�ʧ��J��e{� F$!��W��4Zo���!�*���s�&]��'Vrm���3o�
�5��덓P稣����@������5����Z�*��B�u]���b�6-�q\����J0�ܴhS�����g�Z�p}�/���Iw���d�/����ĝ%�nP����Ҵčb՘d+��gt�ظ[/hv�_���B���	����G�:��#[y��w;+�k�8��*r�F�����ؾh'�;3����;^E�@A�D���oM*�Ƚ���*�WכRE����$r]��/��X��L��1)�;�B�>(�=ىу�?��#A���k$hԪ���i�\A������#���eP254A]f;�u���9s#�%{�������n�1�љ�(U��a��6q�ݏsn<�dM]��-iL�[����Z�*�B�AϬP���zI�J���"zJL0p�jLP�)3��Y��T��TC�d���q��Q��,+�[�b���/K����C{ro4�n�5��$<j8mVhz0=M���b)�k��fB����]ۭ��b�M���
�?jH��`��9	V1<G{Ͽ$X'��J쯣w���,N���0�
�5v��2$��u;��qvߛ}˿�9���O������}�2
�������<��U��1�k��R1a��9�d��r��(���h��K^��v�Zr���'V��1�X�.����y�jru�u���"���'�Y�#�F���j��ϛW-G��[r旚���>+�����
L�_�z>y�)�aɪ)V� ��-L�>V��b��iR�s�~� |X�8�_.t*���qR���^`A(��a�n��'^�ɗ"4���"Sz�˩��6���͖��źv��B�$%
�K�XP-BL�V�s��ևz3�C�'/��m���{�f %����h��s�M��ߴ6+ND����=ٸ������5Q�Cv�'��7�S��1 �j���Z����+i�����ĥj�̝��h3NJee(���vȮ����xU�Y�ω�XaO���Z�٠��bL��MC^6X��VhPT�Ot�t�B�C�JD}fKޙ�
��ɵ?u7�>(��|�o����CR}�۩��9���D�sG�G��sG�8�]��ŝ��Zb��{;�ȕ��K6Q����( �]��-�~^�}�2݃7�1CC�?ޢ�d�bQ���p��n��#�~�.�#�s77��Y%�6ݭ��9Ӄ��w}H��; ���,ϸ_!��ؽ�(nr37�8�XP)i�5�m�e6����8͑V��X�bI�{��T��ޭ��`��7h&�剨��ׁ�~ޱ��O�����WpU���(�^��.ˤ���5SVW���|*?d��0?��#�ʪ���Sv�9��`����$ľ��-�%kU�*�z��k*-B��>��oXI����p�j����/^p�p������~�)��	��u4��V��(�SX4��՚�CRO͙�P0޵�����ϠI�ҳhUX��=    &N=[èrCc�}��vH����~r_K�R�\2��+��%�X)(썱�+Jo(�t��&�BT@uXh��b���SO�v���EB���ɔ����2��)�U�'�"����p����Hc������5?ȳ�j:C����R���3w���0�N�v3�t'��4H�^Ia���z�&&|����oh5A���%Ԗg��	u,�|no�t;	s��oG��4V��;�:l��� �hI��7�ź�5C_��s���^��\��R�������&:#9��Y>-�3��TTe{�*�I�ã����D�%s�/�ZkT ��a�^Q���qa%�7Q|Ŋ��v,}������s≵�B�+��T�ܯ&|��B�GR�E�v�[Z��z��)b����wg�"�X��F��l��Y�WV�����c���h���/cvA7h��"=.l�b��X�D��)�>9*W�d��Fscz��x��K>����K�������bp�·f�hE�f���4d��j��7�&yD����I�t<#Ic�7*�ԊB�fn�� ֡S��ڨ��%��*��ղvM��؟�~r�V7�+��F�On����Kᶪ��]I��ݱv�<�����YC������TZ~��J/�� 9*��}a��N^B���'<��L:MYz}1����^��������7�e��wrD]��,,3V|!'E�룽��Y-o�I!��ZE���%�U�/��=�(����w;��P���K����:�-�W��3��U�?/�Crs��j2�*joݳ�R�[��/a��( ��&��ov� �zҁg�hTC�а/��=ch��SN�D7�̷�c���J�H����u�+7��k
]6����K~��'�ی�E"*Yx%�T%b�v}�'rF�'�}�}�v��}�b�`��kH�*��
��L�ۛ�uw����tq~*�Z��]s�v�n���]\���,˯�p�p�!�A�п\C��'�7���!d�2�Mi��U=H�������ާ����.g�����:[���T|���{��ĸ�r��A�A� ��&�Br8�K e�$��H7��NN��ū�6��`��䧵�ёd�ޞ�?SI"T�
�K�ރTX�����L�����D������Y���)��8vul�PӒ���&�Y�;��\I��a����ä�V/	z�|�ջ|z�YLfȓ~�"�q�h�	�Ǔ��� I� av:X��O!�oz�T��z�!A��Y��\��FA��ݜ��e���z�Z��4Fk⢹}g���$|^���gH�>m������� ?�U��ʮ�k�e�5~�&t��Kr���J�Hϔ�ft��R�OL
��C��1=���LT�������dN^$8_�@`Z��jZS����n��E,ʰ�}9k��ڣSr�f���'�����DO�xw�)=\�% �LoC����	W��y�}�����剥w��|>V�!�V|�?T��r�VFꌼ8_���#.�	�@�!߰ �����,��j�kO�۲� �u�.w�� If��Pd�s1�-`(�+⇡���T�uJ.ި�RO��N�����j��)q����2Z�wo���Hg�z�-u�ɠ�1}Hx�@��A�D_�0BȤ��82��	ʸuX�^�JKuքh��)#�P�N%a��\o��[�d��Mp|���C�k����LBHRݕ����ƞ:���hZ��{��4��Bٗo�A�yj�? ��,b���	��/�KP�8�/t=Nf��l��I+'�y4��V�99_Y�4K<۸�0}V��C���$4���g�Qi}�Ψ�{O�e~*�'�k��|sY�jƬ�y���E2u壼��,"z��[i}P�=�����߻x��ޅ&��E^Xܧ��m����P��)���,��s�6+�~*�=�R��K���|��Q���|�v�V����o	��W�޳4����k,9n�z�7(��K�!��5��҂=�WH�'8T���������|���Y�y/���2&����n�YO���,I��''��/�5�߲=�է���L]lc�c�z���䰝�}O�z�RmNơ�%�|��D��FϚ8����7(�{1��Ck����7�8D��|��Y�e��z�UZIOM�yeo���'y8_ϳ������Y����.	���CPѠ	�;U0��qؘ\��2|��x�kLh3YX	�S´���R¨�QO�8XأPG,Y���3��O�D��MN���ѨT�@��ڛ�"��(Q��Nh}o�(�i���_����'٤�$����P��?5�n�GO�A��
06ؚ� �)eL����3v���sR�Y�I�G�l�]\�L6�^!���H�+U�~��	�̧���T��Oqo�͍�B��3�5 �
�ewn��E�*$[�Da.���7�0��?��Y����c���,�̪�Yjn�.I`bS�]LB]��y)��Q����>�sV�|�����m�l�H��\��a=	���Y��El�8�0�W��]�c���'�=�u$f�z8f��N�$v����2��D��  �PE�?ߩ�z���L� r�]sR�����4�O\Z\}��O�x��0%#�����V�{��q�w�����Úʣ,ڼl���ʘ������o,�梹b��}����7\�c��ZQ�J]��#"ܐ���/�C�x+X��*G�d��m��0��D�+�ӭ����jJ��!:��J�Ϟ��Jvo��E�{�Ï(��]0�҃�� w=�ͅ�Y�z��T-�sW/�����s�NLy;9]Of��UV:�'P�;j�.�w$���?kT�� 9H���J��fd�XvG��p�P�d�X��q�(Z�_�N��=��F~�E" q���ǐ�>�I��B+�:όrL�9&�\�+S�qg斋p!�"�)x���doГ�x�֬+n����P�lx��ƌ5`�ݬ� OHa��gr,*ٿ7c��f锝�����l�V��C������<���rkm��AM��:���7�
G?��[;̸圸=s���ʛ����͍/�;�p�7��L�������ɧ)e�Ӫ�� �CE��Q!f����rϘ�� I��5�p����DU����F�x!NO#;:8�F>�[j�'��%�r~01=N��Ǉ�l���4��aڳ�-4(ҽ�
��yBъ���4�j���$�p�3�@����bb.����R�(��z��oP����6�j��B���b"&8�x�/�B&��_��=�/k^�SR5#f�+�M=j�l���aH�٧��NO��GX��ZH�ո~z�/Zxxw)���V8Ǘ��;�ţS蘑_�Dگh��)�O,Mm�'�N~�kc��|�N���~�A��z29�AQp��
����1m��]Dc��5w8��=hxx���~�"�l�A�cşer�4|g*��12����v�i8�j�ˀGY�ϳ�O�`��
�X��69D5=DB��4fW��?�k�� �R=�h�]�N�^�d.3݁�p��=j�y���~|C@��!=���ja(d-���j�*Dm���e=Z3�9yS+��Q~2E�{e�^,�<���(���F���Q���8Uzt�9��*w_�z����_N��X0+Nj��}�R��`�a��-��S���)s�ժ��D�\s���£r�畹	(���X��M���,���8e������~��<?�������h&���I��=��)H�Q,iZ��$&�N��~����-z�PL���5���?~����^��Xq�s�9�t�F�I���	�fQ1W�I*cO�IH�� ���"�2Oü��7D��ո�fנ�^�|��g�X�ܓ��Kr�L��T�m�����m���[����_Ð��E�h�x>X����b�eC������6�~��bT�DtP�{bWK��)S?����̔K���!����6q�/u�p�U�~'��څmr�v�U��k�BK*{V�+Ť�l'��)��YGB�83^9I���t��P�����X������Hb����&��J�R��Lץ g  �Y��.�G����e�����c',�����¬�y]�*��p�FV���Na���Dj�T�l^�9���Q>�L����ʉ�ݳWOk��Ht~@v�o��u�BV����(G���BJ�y��lB�����T��:�������������o�^[���=�6��Zt�m�f�2���6��s��~�Tq�>���M	�����(�\����F��@	>����Uq]蜯Z��m��	q5YKʽ����vs�R��7�����)k?m�Nl���`�?�J��,T�%�a6�A���齸�,�n�J(b�TN-Z����N�d�J��,_~	����$�>)�^��%$�Ej|K��TNc�]��s���}L��>����n�f�Sn��-
�L��e~��_/�}�2P� ��m�~I-�� )��
�$��e�Y�,��]��v����t<�h�`'&"r� 4��}�*ӷ*ؼ$�B�m��AcT]B��G0�����:҃`v�ؗϫ���no��qL��"Nn����}�<qvL_�S<8�����_� �U�&3��Lf����#�'v��f`�t�=���չ���^�8!��$`�pJ��C�L��A�G�icTq]�NpYP����l
���g�;�I��-��)�z��Qc�	��14迭�݁B��~Kʀ3;��_��B�]��T�d����`�-��?�kp��J=��O���琟�&CA(8Ta�+���'JZ8j��R^�лԓх^k�h�[]�7�಻T�����kU}i�p�_ӵ'�@%q|���{���� e{٥�����ۥ�Q�9�n�S�&��ߟ�M�DY^��8�N��m�Ϧ1��g*p�k��቉��:|����X�W���ǝ]�����Y���g,1��y�m���Di��h�<�R��I��m�>k�>Tc�}w�:o�h %��(|]G7y�W$��wC���ע�1I�q��lO�u�ܝ[6�n_}0��yS_eH>��+���Kt��_,ߙ�
,��f��$��|'��Q+V���O�v2���f�'4֣tZ�r��+'���CJo���׆�������R��G���V������6w�9M��#{T\��n2�+'pA��Y��+w�?�����h�#[            x��}msǑ�������d��_`��h���'Q\�:���!�$�f��P"wc#� )iw���`����D�6�o�K�2���Ӵo7Ζ j�ɬ���̬��,�y���'GG'G�'G+'G?���m��99^ǟ_��<9�89:<9�99:���'G�O�^��:9�?�
A��c��ur�zr��x��e�JM�[����^t>�/��Y/q� �㸦i&�N�}T��M��H����7�5����3?B|����(�C��O�����s$���&�@~�#v�$��!|}�d�v�7�����g�����?�S��~�
a%��9^�_�p�̽SG������ڇ9lrεy�#�N��d�`>=9��\_BA������{��{��������wFKEq�����������/\=�\-&���9��s����S����9���%��g�)y��/y��	��#��u�k��-�=��K�����\������;�Mf���������<���3�mIn#�t��?�_��M��+�� ��*�W\{�2�����^�딓�^c���<����!���A`���5i�� ~���~	s��+lu�"��31#�@u¯\!R}Z~���a��ކ�9�Ǐb��2��Y������q�^�(9����H�͜]l�b��Xg>��M�ck(�����p7�}���@o����Q����G��B d�IkŹ�3d��c�����C>��8g޻�<-c�rQ����}z�Q�}W�L�J���-Ѻ4�ݿ],ÉBm��Hg�볗�J��*0::t�m�n;Fx>v0�����!T�k��?�}r�5~T@x]Ң{���f��c�G��q���o�b�(�ϊ�d�<�>�*�����s@:�f֖Ў�+��I������H����Dy�V9�Wp�b��U�OqP��T�l��N�ܫ�����$�L���dӥ�c�O#1���F �.v�-9��5i�?ſ�omX�w6�n�I��4��a/z��D�=��mU���6g���U��f��2����m9f���0	�mYn��#�0aN�#\��ؑR�_UO�'�-��Ɣ[�x�E�ɧ��5d鈛9{|:�
�1��ϥ�]K�\z*�l�9���������[o���~�^��9�9�/�]�a�? �	C� E�>��~t�م|6��8��@_�r�L��]��P������?��3m��Ҫc�����ר�V����Wx���7e�p��>5�V����_y��m�#���A|�T��H5�.UO����z�|��F�)N�\"�̼2<d���}����ƀlpͱ��n4Y%��'�N�SM!ii����+�C�ͩx=��Ynf��MK`��3�Q@f�׎�`�vc�E8u~�DaR�D$@\����>@��m�Otks�l��+ܯ������D�l��Q�F����DXM���X���!��E2G�.���f6�E7Ӷ�n2sA
�t`��I��bq�KM�Qhq�CM�6����	>�ş����,�x�!)�C�0~��l��J9:F���ŜX�Վ:�|o֋fc��<��&"#����)H�!C�v��{�b>���MX��;u��r!��O�<�i"Le�)sPj+��S�mqo��ʏ��ފ�ر��H�xAi��B�#�3UٺT%U�N���6}�=�gu9 �5�C�=u������*���Dk�À�dẄ́��%q�	��ާ�yq�f~M!@6-��Ҙ��َd�0�X��X�K��0���~�
ALSx�y����)z5��8|����h�p�;|ĭ>d��T�i�T-rC����+|dM9g�q�Q�V6�����(�0׌1���c2��sO���u��"���}Z���g]<����a$Y\�D��"�g�~C�)���.�n��45��<b�T7z1�z�(�R�8ԅK�UF^��y��O���(��ְ	tÑ�+u���Fx�{𬃠RUPG��YFƔ)4=���EQ���ف���K�T��5�hV��/����h1s�a_�^:y�A��a��)\�D�`�,�P:U���-�8�N(��J���N��K��?b���>�!��J7':I���Mgª�n��c\I><�H��q��l�]�����±ɳ��q2��"UP�`��U;r܍�
�����{�Fۗ8o�7_��Z��ڝ~���������|��`8�n��~��4�&����qgҪ���.*S��f]6�@ދ�^�Zz�C0/�� �g=��4⚦��@zIO�^�6W8_����O1�����5;8�����}{nh�-zg��J��������L� Jɬ�a$~R�D��8����_+���R|�]>!wx`Wu���3G�1�1�ض��=�"��Cf�ҥݣ��Od� ,D,�m)Zt(��b�X���g��s�ӭ%��$?��NO��Hp�Ց��M��}��TD�'��r �A�5M����s(yk����,5!;x�BY���`v槀\g�<4�'�6��t-]��h�����c	��O�+ق��C��6LnB�~�������҅1�o��<́h�^�Qu�&���G���;����9؜�9�+���lŽ�UX����.r���W�؇��4��įi"dJ�j�pA��4�FZ�I)m���Rg�=�DOa����n�'�<u�)ڜ��r�-�-��$e|%�c4,^� M��l�m8�{����R��L;�����Nk�4訇�����������f��39���߈�H9;�!3ɘ�E\���7�����ak̪o�j�s~�H��c� ?��uU�^cy��dz�V��� �orAS
6�}8�}8��n��^�>_��V[�sah�S�q��$!�l�l��;�ye5M��Hc۴�W�<H�	��L�l٧xE���S������>ڬ���Zvq�s�ұڎ�rN�+��������H[�7��4=Ĝ(�7d�i�����c_Zy�9l�0�� AhOWhTc�' n��GJk=�љ5c�<�q�}-a�d0�\�8�r5Ak���0����b���On} �׋���s*��1�A/�����qi6�s1=��A��	�,4ƳR�yalE���)˩Ge��OT�s)!@ޭ���V���*�i�qjxq��� �*c���d@j"��ӷn�Rݾ���8�F���!eX�a�-YE��w�<���� �H�m�-%����4P/+e3�]
+M��C�*����Bo6�]/��4�i"�J�OZz
�Ţ���lsw����.�_#��3�9[)e���ēQ>���u53T$�i󫧧M�qB'�?+�B��풯�bL�H��~
g[yꩡ�e��<J�?���y솑��y��s��O�lM̈́O��I����Q�H;��.׷��Q�bJ����An�o�����2J�x�a�fY��BF�[P�7ͺX�F^��SA�h˰���J4q�Xp
�W��2e�Z=�t􍈁
�O����;6�Z2��:Mc0�A6N�A��4�D��D�DN��Mz\���1�f�{O�.�junl�U&sh��K��KN�p��EWU�/2i�hǈ���lk�l��)�u�����i*���Ś��6�2�<�������7�W�	�r���X.%u`4��{��[����U��ԷVS14e.�s/y2�H��]�.��S��d ��Lo�)(��R^u���d_�{|���uc-q�s��y��ޛs?�}����^�=��c_)o��gA 7ż�M�I�5M���r��+#��,��o���6��6�U�S�X)��<0UZ�rW,��o�Yw�#ʱqz^Z���P7/h=固�ݷ&�bp=Ձ︗x����� �(�9���f>2�n�����4>�
>�}y��U�KIR�/�v>w-�N�3ъ���m�`>1}m$D��3�ӆ����:��.6���[Z��pM����&���K�gr���{.��(�rڭK��Wߡ���)���AM�L�y�%���&l�3F�i������}�[����O���!��6�    ̧��Z��F�_s����5�����r��c^Kh�J{�	�x����-���Z��&��s��S��E@fD>5`̏r�+���zE��^���U��j޻��@�^*��BϤ������Mf����bo֏�8	�,�i"D�A�K�ޯ�%�7���qx��
T�R���B~4�_�b+����q����N��~��Fu�|w[�,D�AT�1X,�nW����]>3�,�TΧ֨T�ȶ����n�Z�Ik"@"�w@�)�&�]n��Q�eF4��=�eW�J�9Q�j�A[j�p�Kf����<Kn ��n����)iJ�!�(k����H�чw�I�v23ef��G���ǈ���#�J���ܔQq��B{<�E���̔���C�z�������0�<7O�X͵Ԛ;	�S浼ຊ��;��`X^�v{.n��~�����5�4��!�]���vY6~�u/b.���s;�gwʣ��n�iFej�K�=�Cv�A*�V
oG�Q��GS�`��s���4"t��jƉ*Lz�� ї\5>�ؑ?�e.Q�q�c�M3A��a��skv�wN�Y����|�|Q�+��'��f��Ս�ڜ�@�aZkr�3(jԡ�D������.�<W����^��Ŏ��Q��y�IM!i��۔�9`���ג���+�<���c�u%��9�-����o*L��J]�Oҿ�2Ҭ�x�;Tt��wd:���V=��@m���.{�Eu(P6D�d��4Ҙ�f���!d&��a�)73Zr�S��w��)�[VG`;����
=.����y�T��@���+�|���N.�쾼Z�p3*.;R���*[~�2݌x	�=l4����i�
I�m@ٵ]X+眞#�N�V����4�\�4K�X�mJ{���
)�z�T3��Cq/���8:9���σ��#��X�Ǥ��z�k&�j����Y-1�y��\�GZQK)5��GO�]RL��(������/�Q��:�g���+�Xf�ֿXW�ʹ�ln���K�8r#?���F�Ly@ӈ~�u=�b.=ׁ���NYJ��"S�*��9ې� Y/5S�dM�t5K��Z}�ؒ���=yA"�גz����+<�Rs�	�>��?�u�$7��V�������i���w�x4g!��ɘ+�4��]N_[\��;��B7�1j�~��\ʠU�/�^���R���.A�<�i#/����i����hِ,�r��@ ���MWb�Ԭ}n���1�أ�T�j,��;M���MF�wFK&�O��2�L�& Х{sł��� !r3��_���D���f4�� B�&�{��>Z��q��"��Y?v�Ts��B':֣u�|���)�GyJ��K�_8�.�`3g$�Y����.BX��eB�4&&V�%x6u��bMz�f���$��xc�oQ�*!dYziM�L�xMb>%�Te.� ���:�X7f7�����%Z(�L$�2Z��K~}���d���4��&hAMߚ&�D�2q���_%kg��[�k;��|pjU͖$��#�kC��� 1K�����ϛ����Y J6SM*����z�Z���f^.''n&ij�X����(��R��+ɉ���Sb�t�\�r����3H)�#չ߮�!F|^ &r.Dh�2W"ՙ�x���Y����:�Ċ�h����,���nf~Z�BX(k�mi�lQg�!eA��,��2�xEO�jE'�t���h�<��L)֨w��\d,[�}�;ȆP�p6� �C���4d��X�&H-�<-�.o��Bn��v�[~�h��ɮ�^��R ��� ʇ�����B�x<��yw �����ə�&
8�n�����`D��4&P�@�Fw'�h6DH a~���п߁����l��Um`'�&X����g��p�i�=�K����q�נH�Z����h�b�	�19�!z6/M�3sZ4&Iy��:_,,&��l��q�yT�D`�Y�|0���%�[��ٟ�B��M�aVȒ�{����Ž�bɲ�2�g��%yMAJ ��G��s}�|C� u�?�_(�#b���[�{���w-c��,��7Z*�D�b����O=C�e�L�y�17.��¦������x�	$ ��2���d�������!�=�a��r�p���D 3��x���Ms��>�wDI ��¨?�C�qV'?ͬ����' �E�74�B|�"r=σbua(C�S�T�ƖqP}4}��ۆݜ�kMn"���w�|���t`�x9�/�����W�ָ!� �]����My�����������ۅ)z�QGiu�v���P��!C�)�;6��4B�b���mA�=b�8�3��dk�t�ͅB��!<�>��<�i"�	��9pΙ_��Kwt��3E����G:g޻�O��g�a=��9se�ȷr��}�t,ο����e�Q�^j��2�~y��aM�Lx�"���0c^��ցt�];'8]36�ϧ�io�����Ѐ��R�m߆��bp��.���1͑{�~E�O��d>�V�bH,�f���� ���M����i�e�DR��5Q�C12��{��׿��{�!����?u��X�o��r!��E���E����еd���P3����5��-�#u<�Of��%[��F5M�dFI�Z]u!4�5����,����ș݈�z�����K^~�^����~�(��TaGM/��3Ǯi4�%%��#-OY�jg)@�9Ӟ���j7�	�s��Y?t�<����W |9*cB�9ʧE[1��i�`Ei MM?2�^�~�8����q�Fc���L�׊M��6�T�Ѝ�$Ɍy)5�Ƽ�733��b�`�؄А���A~М�|d,�B���<e�'m���r-�7�����&s�&�Gt����D�w~�J�.~�ko������[ͺ��C��e��0:E����SsNf�a�Fa�UZ���0��βb�j���t�yc.|��տ�pl�'В|��xS]D�ѱ�D)�mF��gò�&	+GT���|�䪛�Q�5M�Ũ%��(��P���Om��*骽-%x���*�w8n�a^(@+R�5���$SLj��{���ۜ6�+���t)y\Y��r�q��p�!g�6��zq㢻���������=�iOh�{tŧ��z��{�8/XRK�zR5+�r{tV���u4Z\	��%�R�^��u��&�Z��9���A6VJ�ks��p �)薬�D�t�Z)��~.͞�زj��\�����]�|;�u���ڳϷ=q�G<�(>p��ݸoq�� `�v���Cɪ�)e,A��\�\�Sr`��f ��� �ޚ3�"���F޾f� Ō0����W.䜹</O�+C����]�ā?��ď��-�tN�?@���E�͐�?��G�΅��byyz>Ѯ��['��BwĀ �_���}�z����+>�G��%qMA��`0$H�^c����/�ow`+F��pn������B8X�rȔ]�?xj2�Tu�jq�^�
�[]�S�9~]	<���IM�e������ef�婪y��f������i��m������7n\3A�Y~��4A.w���{�޽�&D��)}-i�^�{׍d<�YH�p�v�è����������4�I���7;��"Ƈ��b�
,��'�okӂe���g��M<?���&B6�!�Gjd�L��O\������c;�Aj�c�1�h��,�fYۏȫ��Zv����5���7(�ǆPqu��?����U#��Ny�P�D0B���F�ctcĈq������޵Od��EϙdI�YMI�}Ht�8X�T�RK��./�˹8|Vt��i׮_�8=H�Q�G��D��m	��#����`�d���#D�!·������4F�L��:����=b�y���٬�Q%�ak4�A.�!SݐKc2�>�=�ɞ�T�|����^�ok}!���P�i��4�DĝE.����+�Ւqw������*��_p�7��/��(�.��G`�,P?��k��"�    /ߋW�N0"���>�c���1~߹��pwy2�L�0�E��<ةP@I����������O)�f4�A����Z�HNA���&�f ��@��!,��4�E3sد�B�{ľ1M�B:`�������#���>�	�NM1���`ͤM�@}�6��=��6�Fs���|�$��I���+���q�o��ٮ����u������/m��%��@6�JBQ�L�����byn<X���&��Hehyr����路4-.i�2����'�o^�4���D����G��by����Q�H�p4ܺ�		�!�a�����HO�7H�\��� M㚦�S��ʚV�v+iC�G%ʖ�����l�{�xK�L/��"��#W�9F���8E��\�'&
x�P49�tAn"(�[A�)�o��[`��X��dΗ� ��E��㺮�w�׏�q5ϯi"�br��@���6��5$�6��D�~��'Y���]�6�}�x����s�ֶ�3<�*�71���m�$���&�fbaS
�3�j�e`���c�Vn�@�x$���1e�x{+���$���Ԟ�ƙ��|��&Z}J5�Y�j���ߗ�2C�e�Me\��-El�ebF��>�0Z�YA�u³,Iu�Gn��"��.mO��+�-O�V;�9^���,n��G4��D��.�<�P���&�p�q�G�m=n��~{�%b��p\,�>�j"T��֧�қ��ʹ!��0�CcA�M����%�^��D`��RO��]jQJ��=ȱNED|I:�_��7I�~%�T�O/�ث����mP��[彴&U�Zr�&�ۈC.�}��ŁT�8�<_��&B"� Qu�yzJaUg>,�}��=(��Y֘@TE�o����KKD�t��V��ϷF���[�9=�O>O,���D�1�R�J(ԧ��[�>�;@�jdhʮ1LFa�K��EH�q`����X�Ujr����Y�T��1�A�L3�(7�D��e�F�a��T�=K)2p���:���j�=���i�0�J�-�p\^ai�m>�0�0�H�6'wԏ��^��;0
(U���C���%KeA�������QG@VB�U%�&�HԎ�,[}=��?����b4dm����$�=i��v�+��6)��NL�����;�Ğh̖��!�@��sZ�Nܒ��Y��3��ȇ�Y?w�ٗFaM���Lzj	�#�cf=�Á<6�c�h��-����-FT��w�8�Ȉ�D��K�\�p�
��9����d0����A��e�bq�@��W�DcDt����b8�1�N7�L��)b^-&��ƟvF#k!�-r�xH����˂�&��#�u�SvE�l3�f�>��!}��؟�!W�J����B	fP��qD���5���K��U@7���3KM�p����$�EJ��Uw���BA�m���ur��S���{��/^~Ɯ���)W�'�sa~�̼eG��lqӆPį�x��s����<���I���&��"���߻Ʊ5��(_�Ew�r��?X�ytp ���d��4xt(��,�i"h>�9��d�qc�/qa; �=υ���h"P���o�`ƽ_����\��
��dҟ�ԄL�I���vT�4�-@B1�+��FAՖh	�]�8��93��+E�kw�՛�@���n�d���~��Vj"09�T�MabH
$0�����)��@>��W���NK0��iO} m�?�$��	]J�?�;�>1%���������Tj"\������ﶤZ"U�z�s�_���W��/U��!~q���a��9@�{�2m�;�Ҕg�O��֒�Ys*b6���Gt�*j���m�*qu�?!ر��Y�����#�RSf�]u����g�d^���Fn"ܥ�;�KM�D�gs�] i�lƘmCmz��ZE���ȉuAZ#�kj�je4�:ü�T�y�l���g��#5q�Q-1Ĩظ�Ä��N�0�Qc<��"�q��MD�7�]�߃ۄ���a��4Fbʈ�����]~���5^�I�*����^�ĿXr,�t��k��j]5�4J�0)����WZ^���2?�N;0L�`�W��9^9�j����8�㺬��1��v�K\Eϋj�kyk�T�z~���F� 6�#�P�M7�V<�u#�@-�$��q�����?(�PQ`0�_p�ꂉ�|����&�"������1�F��R�w�/F��n�_x���N��Ψ��BZd�����m�Q�F1�R��&��"�v�odC���p�o;0���h�J��Ԙ��EZ��ed5k�S��D�lYe��)�i��[av+J���5^�˓�Y�5��+W�_�����k��;��hM'F���>�t�R�a>�v�B'�a�n޻aJ�1����ܠ�FTe�e5M&G&b���0��H`�*7�����T�$�d{U=��^ኈ���&B(4��{��T=U+���)wG[�!o�2Xe�t�o�\Њ`�4�?�[�d�44�^:���͹�u����)ա�ϛ�i`x�x='�|�ӗ��4yh59k]}��3[W����ba��4?Ϙ?��s]���:���!\�|�	�?�������A9���8�i"h����h�q�sN�	-D4��E��l��j[K��6#}��%�=���IM��ٳG������[v�R˶eꖼ���S�6<�nE��د�T�<�'�%O5Xف��q��iM�x��R�**�Xn�_(n�di�U���05}�!iR����x�qo���w�D��}�`��8��ښDZ�޼�$*/�q^�ʂy�AR�D�غ�eNu�8g.����`�;k·ƜD���,Q�Kǯ�@~%��Z�u�P�|�3"�h{�?lb��'�uR��6˧Q�M�6\�{���+�s� A*�]?�WΌ&�=��IM�_�)�F�k �X6Dn
���&B�_ܛ-�9���9\�O<ϋ�&��#
��w���E���Oo�Gw����ac@�Iqor�����������@Tv��O�!�Ygn��Y>�bt(��#�+U�ԫ�?��ȗ��
�?��[t0/M��v�g"ս ��Kj�1 fX��ih��h"r}��޿�T���ܝ!�P�����5��(��](�h��DDH�A
7�H��w��1���1�}p���X-a%W�˷�ht��G���jU����Jݹ�Yq�z6�/;v���t�;,u� �����T�ƚ��1�$�C4�1��Q;H% s��rQ*�q�$����x=���d�2��*�7[x7�:^�wT����\�������?���;��w�:�U�x��tU����ӿ���>�_&T�D�8g��5�-޽����>���6�W�W�w�i����HϚ�͆��EQ5Md8��#6��w��Cx.��,0Uj"(�̏�w��e;m�� ��H�&���'b��h9�o?��3�圁�~	��u��qXkd2���g�Q�mv蝳?w�с��m_0���R��/zO����j����"P��M�sDc%!ugO	���lo7��$��3����L�_�ST����Ƿ}�f��d!ɶ����mK.|��Q�Xe�ف���'��6�uZ��5��:�δ�	��O���^MA�ڈ����s���1�[��Q\��'���}(�lT�D&�����
�\�vő���FZ��9)52l�(s߳��h"c�7��L9wz�8���GH=/ӝ7����*�>E3�/��+V��WR�{皳п?�;1eژD��P������%Y�-��o�.CA1�'�p2�,/���7���E1t��?���"x��G|Iм�-�Hʸ���<�@�c��]y�-�/���O�9�w�_Q1��>)-3ƥ�r�n�Hu]�DC9E������ V�Q��h��d���k�e�ؚ�hH��۴�}7ʢ 4��i�$�(-�4�,ύ�p�Y�>��ܙu���t�92��f����D�s~���o��ns��Lit�<�,z@��yzd�ʲ���������byp �  ���[Y������������+nKaUY?��yt9�5������P��m�,�#�՞I���:��[�����u�5�^<�|�VFe��L{�?���/����BS]JMdha�cOY�%S��>��0s���r�f��D�D��-2��j�~���iؘ~���"q"��,��h&L���d�n�t�S ;]ʊ���Ͱc{�#PZ��m�q)}�V$���T���YB=����H���V�CL�K
��H���;
�<ȓԈ�IMD�d�I�^�$p����,�O �M�B�(h� ���>j�OO
�XHMQ]S�gs|{o�$E��4�1e&2k�ʮ��4ܚ��t\�/c�R��:�҇߻~�:���[F�l�%Ʈ��^bu�3Q�)�<��2%��z��gyh8JrA�j�D�S�qgS,��$�ȷ,����x��6S�^��fe��D�j�I��-`P����>��u�پνW���b[���fG}Ѓ�.�\/�K�y�6h˸w�ޜ�`M?�9��Y��rA�E[dX,��)&��L��ԜA�_Ch��)�v�,��q2w����;�!U Ϥ%�&��a�u����{ՎM���8����נ^RS{�tS.�l��D�{�_�D(D�5�Ѿ�9�l_�a�m�ds"����Dv�@°���A�dV��eu�-�\��Ay*İ�P?Lr�	wJіT�4G3��D�p4\�DJ'���)Y��\��c�wg<Z4�J8$\恗"5�y]k�b�
�W��&�M0��;Ղ�\?q=�n;+�1Y������M9��@��֌�z�r�����2f4����\�{��ʊ�9��`����B�<,�����z3�2ҳ�+=9}�h"�&�9�U����qUt� LӖ��|D�!����T��ec��WTŵx�����s�0�Y�	;�H����i}�I	|������=G.���z�std+U�֣:�(4��;Z��p;��X���*���ꞿ�c%-�2 X��"�C[B����d�(�g�@�f�MD�d�ª���|&U-�8���iJ,X}��&B'G:�N��cvJJ�0zӘ
\
��D��O�ܧ�b����%��h`P�QiϾ+)D�'����v�9f�s��������f��ɬ/.Q�O!����3�]��Ѽ�E~�
�)��̷@�&!$<L<,�z�+F,.��;K�"&�h��&V}iϕ�C/@�%���<m�57g��$N��P7BR8?���ǃ��jw�?͂2�[{�:�����kze�����]5囂�K�!���x���Ҟ���rɹx�ƅ_]�~�]6�����zRn���.�{��Kn�<�GD�߸����mc8�^����T���(��% ��������69�GC5	Z6D�g���qy��p$�9<�����Pb�
#�A���|r�$8 Q�l�E���d~�$�T|S��I&����Z����UcjD�i^Рƿ8�[�v����L#��� �8Uя��3ǻ��X������6�E�K$���DzC�M��R�6�&��"�b^���X _��-9��sR�n��gؐ��g��\1o��_��{���"��ɭ�xQ�zxᯎ��3��L�N���.���5}	�q�;��N�k]�A�ү/��375�7�-bd�ȩ5��ᐟ!�Y�{ �Q�&��f~M��dy�":B�� vs(y��4�H`���5MG�l7��)�5ͼ�~nC$�k�����ewi�<9�w�K�wQk���ΐ�����vtg�3��:��=<3&.���R�q%r����Y������1��h<{��6�G[����&�5�S-ʺ���"����\Dh���<�i"�%��2��(��ŕZ��O�L�\a"�pW�~6 ��"q,n���.�j���g�j��چW�ʭ�����f� @о���Ը�&Z{y��n�o�@�\��%�9��ͅ�ܧ�����;Z�V�<�Ӽz�EDЭ����A�8�J"�YwRHѸv��wՄ	��)p'�԰����3�����w�����.O�ů��:����F�%3�elm
�r2�������r�4��'ձxf�&*f��R�'�<R&V�s���;��2�<��ɝqџ/��q�Zre��6���!�57�r�P�峎�t@WY�ٱn��2��=f�il��Zo�'��%��y�]ae�0;h���"�DuՕ�b��mq?P��nCJ#e
qS���ɏ��+U����J�a��o�vU�B�r��~|q�$N5P#�<䣶U��d��>@�t�8�ZxHm"*�N89=�3�-+[t`���9K���UJ�S����5�=\�Z�ϊ��jP����FΏQ���%����������e��	a��,7K� 2�C����j��j�to	����	^�ѱ�3F����]ŉ�g_ffU�5!I�¦N�ށ[�W�kbO�u��;i��Iz�=Vc �E����H"�s�]l����!�X�cR�tI����W�m�)Ġ��g�:���������p�]�*����0gʡ��[]��SB��;)}���4pJ{�L�?�I�7��{s4�0%��)�4��#����n�i�4�� aB��rTU'V�fT+�X��P9u`�_W����Y������/���T%]&Rʈy2)���E27�cM�~m4Z��N/1s�� q�$�C�JMd�`�{;��������Ck	�'�[Lk�3OLp��N-$���Ƙ^Ӏ�ύQ�QMr>[ts|�[7����i��욪͘�H§7����)�<�|c�JM3���-=�isHt}�+O�M�WLӳm
�yrg2��ۀ`s��� ���K��`�<�/,pL����%�%p�ۋ�4��\r����h�!���x������0�b���bX����Mt�,��jl���i����`��F�MnA2
�IFr�0�����a�ǽ����h�l�_)D�=����D�|
�J�Mc� a����;�"X/�����2c�t��l���\����	<���!DlFs���82c�&�#2�p�\�z�#	���>����3�����}c	ҠF������>��](�H����?�@�"М�����,jfjQ��
<�ѽ�����V_^&%�䎇�QeZ�@dۚfRϣK;�1����ל3��]���[�Y�������t[偝Cr�dv"���Q�s$�B���7.ܸ朹1��	�������"�������ǌ�Cn+=�}���W���R��������r�{>��Ď*��U�D ��D@�z�=���29��N�%l<���".ak"��"�ҮA���l�Q�y�P[� 
i��<���P�7�n쥑_�2����wc|��!|w:����Q\�D@|����h�5}V�_�F�g�Ax�×h> �˒�	1L�����H�$i���5�v�G�h|�+�%���]9�/��/���sgff�/�e��      :   �  x��ZI�,7\'O�.�R"5�!�z��0x����I��~�R�
�]@��bV�G=���Q>Q>	?�$'J�TQ�����Ͽ���?���o����p;���p�3��3�9K˴�6����įE��z���C�X�ڷ	݇��2^�n'K�B(͌vs����?~����Wt�T�4�3e��K��>��ݵ�A�ԟĐK�u�)݇@j�F7N�@+-`������C�!:r�@Ҵ�'�j�(�2I&t�������������l
�I�!��nM� 95�IHLm�۔�C��x�8+M]M%�����H�!�=#%'��L5T.����F�!��c	tk�r˕߳���C�X[ɐ$��唪�����]��؝ݣ�'�S80�V�w6�}r��x�p9S�֌���}
ڤ�v�S�DO�����6�}�R�m��2b��qɎĄ��RdJ�!H�g�`�,��7M�I�!�1�a|ܛ��ԂhA�����CP��M���P2�]�?�>�z����*$�)�
\�ʷ)݇ 5��7բӖ�ܠ�Ǻ�?#݇���99P�Q"fI���}��X(��j�:��1v��p�0�d�·�;6��m�t��
!��N�,B�h]���C���ך�ua��I�'݇@3�Ge��#�R������݇@��q�j)�fb?�>�gߧ:�\{_���^FtM|56qMK?�w��I�!P�\cB-��ړ�C��w�Q!�k$�c�ˬ;�E@��} �3�]�?�>Z�f����/Ș��g��H����I�դ��w�]�>�����뽪�6�Xeݲ&t�*�E������a�Zk9�W݇��#��҇)��h*Z����I�!ȯk���cD'_i�9�}Z�=\�`�)����\ە�CP�W�%�lzE_"�-[2�J�N�>5�J�v�ɢ��=;֥���}�����.l�ݨ�g�iU�S�A����IRL�Q	Er��N2�}��2�l�\o׾M�>��F.[��l��a['Ʉ�CP����>T�KK��ڃ�"Pˡ-t�"����g��7��݇��^j2����l�J�(��>�o"�E��V/��H��ڔ�C��{F�=K�dDȉb�����C��c�����4���GNu�Z��}t��r_�:�6���H�l��H�!(報e��D�1���8N�>���ȿ��V"XN=�*���Y�)݇��~m��H�5b�H��U���M�>�Α��[_��j�����u,'t�&�93)��BU�Q$���j̹ˑ�w ��H���Cj.[��e?b�"�0J[��)݇�\�ޕۙ�U��Zw�	݇��~u�v�hꖵ�S�X{�}Z;^{�{�
����F��ܓ�CJ�%.�xG��&���dJ�!5�[3��M}ki�TR�|m��}H��,�K6�%i�*�⅚�v@S�vs�$q�R�lJ�!�����L�(��=|Ӟ�t�ܝ{�w�8c��%��݇ ǾM7
*a8�ȕ�>mJ�!%wsq��C���ה�C �P޶n�Y�X��*e�uz�]^��~�LM��ι���rS�i������I�;\�C���:%'t��{����^1���kʔ�C�Mj�*\��I�/KS1�I����R�_��E�mc�1$mmnB�!5��:g�Knm�9�ML�>����v2ف8���i���tRך}˷�5��e.!�r��P�^<�LŐ����m���:g�n�#k���q��sdIy'������U���E��R2RۨT[<k���6tJ�!���tB_D-o�:��5}�ќmgme�߰vg���*�V8�8���{J�!�OW֕��X֊>ї���tRs�(�:�_g�f`��p�&G����&�X��DE�֖K�)݇�Z���@RO9h#m�oFS�%<*�lʶ5�h��6���v��Zw]"��DQ�&�Zm��������b��Mj��E����ܓ�Cj��G����%�$RQ���t� �R^�#      2      x������ � �      D   )  x�}�ݑ�0���*܀1��"R����'��slJ��}�j���rh��������DR>H��;��s�KHd�jT�W}z����=?���&��gҤ����.�,�i��c��$��g�lP3:rQ�'f6�����D��6�ѡ������� �u�=S���APy�ZV�r1��FL�42^Q�(�S/��P���{�<��Au��������A��Q�N�=�X� ��,:M�sFߡ����"/�Wα!����$���AMicz����ˆ���F5�f՚(ݠV9��.�i�X'%�ʾ�)�%�5����WVq�C�����}�b�L�#h�2��*m�P!+ß:�U�Q?����ͶZ� �H~ӷs�i~s�U�r&���ǃ\��mΌ���|u���nP�Jf�M���1b������E��&���	���Y�{U�7�!��58w�Q�]�A��E}`y��R��z�Bs�J�O�u2����j'�N7�2 ��ݠF�W���;�y��`��T��U�<���$�j_�Z�mwhq      #   �   x�-��D1C�N1#���c�<� ۆ.�az �z�}����/yt�ͤ�4�h��Y�V�h�^{d�C�;s�̏	�}��6\���l?sB��|�4w�֬�V���O�����E`Ik����c�2�+.      "      x��}�RY��o�)Ν�� �RDG��A�`<5�(-X�!̔)Wo��)
\m��x���]��m�~��G�<k�=S�����[�2�����N,��i��\�ޜ����?�޼���~���������ͷ���7G��W�oo��{����ۛK��|���|vڥ��F�/�D/�D���޼���;z�������Ϳ�ѮC_L�:;C�p4��wD� N���X�3�L&�)�O+��Z-}�^�Z�p:�+��ӹX)�[*�{�{���D�ip�<]�Nw�/=y�9�9�xlkn�۩u��(8��]���Q˯�r�u�z��^_�\p�e;�6&������
��⥅�ٙ\=���4�(�;W(y'!,�#4 `o>�� �0��__A4��A҅�)��5�p�>|G��B^�;�?�{�;ş^N��1��C`�_��>���1�d�%�h��+��Gm?�",���u�V��d��Fi��dRCK�=�����V+GzWr���*D��x.U�>�ښ�Ek���\��;�a{������.SA�?FD�� }>���	����$c~���w���C���7�W8�	�M�a�h:O'�Ѯ�TW���/FJ���X������:zb��@��hr�^?��mw5����=ss���'�#����ѭ�]���c�B�s���ĺB�@o(�|@�~��`��BI�G"�X2�t�b�X,f��d��sɵ��\�2_��g'"����;���jC��M�,�03�6��FD<8�6<Y+d*�!'��+����3S����[%F39�c�#�:E�sR��s��%Z��I'��������T'y��x$Iu&��]�2�?�"���::{�]�x:��4ן队|ؿ44R^�?mi���kK#�#�
D�J����F1�O<g#�!߹B�;�XU�
��	oܯ�Ȧ�>��q�
��748�B�c��q�G*��S̽�R��=4�J=q�Z�!R-��h�tq3tlѐ�ޡ�o�jο�~Q�t��h��=��}�^�E�G��.��˾�$˄*V{�tu�`�;�" ��_2��qIW���8��N-���[� ��8��j��j�}�;v���O2��_9�L��*G~B���q�(̎�f��B�TP�k�O�y� {7?7v`rI���s��Um �:����Q�M�@8}���C�{D ?���<�˿ X��R�{@�8�gb���|���|}A_����DR@��=�`f�F!$������ԤxH�OC^>E@���_�.=�Kh!�R�!�p��_�w٢|d���AJ���F�{��$����!�R�x^�Wh?�yO=�>G �/abh�7m��Q��Y�L͘᫗�dC>�ܥ�r���
&Y�1��aX8�"
��.��*�h�G������iO�� ��R����2�S��	=P)��@�t�LT(����藄�	�0��M�>2c�B0�b�p$�H�HR��b�H2�vƢ�H*��]zГ)ƒ�O�NW~~k�������g��Dq�ԄͶ�]�?\}R�6[n+5���u=�.��B�s�"�;�xS�=�f���	z�� J��v� :x�h;��i��G�_0\���z�.����'b��
��BP*=�,F��f$����[�Q�9��6�b��=j�좉NI�J,�����iT"��ЬX)ߠ]��;^0ՈZ,`�	� ����h���چ��w%��bP=H,�́�К��H�Td�|nξ�mN�8�oa/c�l_�ׯ9��8�d|�(��i���ķt8W��4mP�.��Ω�d�w����n�1�D�»i���G��j坤18����M.���=0��}��sHI��MI�Ǔ�X�3�òJ~�U	��K�呭����ٮ�����'���D������h�roG�gi����zl�V�f����C�s�"�;�dP�{Hm%�q�ь���5N0?��W�b�
*K �Xpʋ(�A_���^w����H���b����w&�8�:�$&ͬQ^(�g�c�yOßg�x-���Ih�o�E�/�b�V�}�%/���n����A]q��4��t����a������B�cN�Z.��%X����G�<�m ��|�i�I��dH�kf��?p��&�D g�4?�;��t�'eN���4���9<qO '.+�tN���.`���5����4scy��̶#�Əĺ��1ÂQ� ѹȂ��TY�ےO����]�W?��b�Ib�*�S�*jS-hw�E��8��J�xj�� F	�\�h960��E�Q۹9�W�K�ο��[�� ��KBfE#�%�'��1Ɇ{�p����W&��K
跧%rL�uJԝ�<���k{��>�W�)�LYKkP�҇$x���iH	-/D���"� HH_���e_��<��t�j�+�~����)�h�I]l]���$�ׄ��Hwg*G�l?�ڀ}�33����г������X*<P^Z�_Zy)4a��S�6��ۙyhv��g�2S�����ɕ��\!��
�����7\^�TK�z�R3��J�R�,o�e�^
�h�i���)b�+���^#�~d���]p�D�BN Xn���~�b0�e��Ք�Va��v���4�]N�4U���c�-�ѰR����z���ޤ���WKQh-]LoA��]�ĵT�]��k����!�W���w,��q�FO��,��U���k
`�X�%
�|Pr�ϩ���k��j�L
�n%������u.ًA����x�i\b�LLT�i��R�S��&"�l���J��V�8(��q�W���>�5�ͻ~g����m����v}�Rn}�zo�:�BS����U�a���N���NCJx�({����$%�ׄ��FQ��޼��lD�O��`y6�kŬ8��|�a���9O�3+d�W���I��P^n��eП��,5\�i��t=�pU�N�Jb�Η
��cK[k">�|8��� E9�w\��|��B"���1��)���=����O�i�ȢH37-y���K�tp^��b@�%�5�Vl7@���G�3�@'R˒K�8h�r]��鯬�P��B᏷JFE��Vݘ6�x$H�Bĉ�1�g�mWF��_��q@���dh~M���Ԑi�/_(�B�+_q�����s�����x:ܕ�&;c�ɮhL�)���]]�X4�i����V&��,�e���#�Ϧ6������Xq��l�΍�d�0.4(6f��T�����\0.�V��B�Rw��P���Z&�Bm�/	�����p}	ps�?�v�D�C�`O+HцyALy#�Sl1pH��C�4�����R���^R�a��K���� \@
Ʈn�*JCF�\�	�@���h����F:��)��$�w4�H@ �W�Q������L����[��aG�qb��{x���~A�x~BOC﮼�3}������2�%2Wf S}���	3��j�fǫ��T�`��*�=�͗�L�����&�/59�֓�A$_��q͝�{G�Q:�;��B��4��], 1M�$:D�>$PB���a�W��mC�:��CM �*Ō���HS���Y:�[�l�)���Ξ���C�D~�9e�б�+n�/3���t��j)oL�
�=]���X���i7ᣘu�E�*�|r��r�/��C��z`�YkX��V�8����\�ɳ���a*�i�e48'�R�gC���Q��0�4ߋ�2�U�)��O��� >ӱ������ ��5�>��
I�]*C�i��K>�yEC��H�.v+p�u�$�۠կL��C��=��h�m�V±@��z��] ����m��zj��r���� d� �G�F��ᐈ(�����͑\���s���Ra1Ww��=���;���8�1痝��o�=�| 
�5a�#�5�t,���;�D"�e���㩏F���]��Ç�����'�G��������h�F_8]�e��ՠǳ:<��/>z�    )��3S���\�Ot'X�Y�n������n��w_�m���~y���>_�OP���\KS�
�� ���	\5�'K@���4����x�.zgOu�p�<Z}H⾢�!,_=�#�X<��Hq�ؒ� O%G"N���}���4y��w��� 7���	V�g&�'ͻ_Թ���qE�:���:��Da�u�_-�h��/���F	�F�a�z�hPҕ���%3�g�e�A5�,OH�m��L�h��<����1i�d�k4.����a���~o+F��l}bɵ�X�F�G��{zfе��E�U����[7�!NcQ�ی���!���e��}��޳��8R����BkG2�r����̻7�i5�b}��J_�"ڒ{ ���pB i�,N�R�ˋ8��d��?6�AU{.#�dB0�xk(5c���	6���[$��B3�Z��;��c��JV&ao�R����y���e˚FIB~�A���A<��yܪD��Ⱥ�FH?��EY�LF0�Y�)h@ͫ�f>A｡珘��#�4ҥx*�����F�vk���>�L��Q�ۏ_Z�δ� �a?�b���������K[��Ĉ�!�
UZ,;��#� ���T_[eqR�P l��J�"���pw����o� ��.$&DJ��xt��y:���[�'OOlD����&����CC�^~m$���E��Gs}}�r�w�P��N��&/d�0~�-u�?�l<��3&����V���<�ٳ�V,8y�����3K��F�E6^
f?�*��'$���؋�MeNmH(�%��:J�4���"n6�x/�b'�!� G����@[7���3��M���њ�>�F�	a	�&|"��?v����4�������'���D ��g`5Ix�扦���`ހ����<SM��DO9;�Ͷ�-ŵ��X���S�o��9�`E�V+%~Dc�Uۊ�7�� �W� ���;U����\0a0�USA�[�I��3��=�/	O���>�l�Jy'��#�Pv��P����4����C��6&sE0XY/�Q��][�N�NNp�v��;�b�j�h���>��٧��P('��[(�m0��T�ۺ}3�l+J.׫���"���WP)0�)�۵������\l�\�b&���B�)x~|G��D(@�+�8�U�V��ȕa�t��q��`�ٹOsj��J�:ՂS�N`���P}N�s�,X!h�����r~�V�H.�y��=Wr��Jn�V�꛹�C�@
�?�XU%�(![b;�&�xPs�2V�P��&���	V�dWh,B�ug�,�Wȏ����A �H�4�
W�w�t�df��Ԩ���2e��UW)�d�'�S�6p�b~Ţ�M��9��jV�*zO#$�x��Y�T(�\����EX�;�S.�>)�O}i��Xxe��;%P�S�9O{�Q�&w��+:$�Ɩ{�t�֐@'e]_Q�N���zeh{~��E�D3asS��{�4�Pاp��@6�O�GRBE>�8	g)���+�O�v�N!8@M�Wb��ٝO���=���ͨBa-:���T��K��mn��s?{\��W"/�o�����4��U��zn�T���j!�Pt�2�L8~.&��
����f��E�s��t���P�ڌR���8�	9�V�:��m��	F��ϡ���*�`�ѱʺ��]���|ݨ��(����� z2��=`��w�M��D$8�����J8��7��uUzxG\�Lk�r����D��79ۮ|9h�]w�]��mqd.��6���:uπSF�e�D�ko0QR0D�cAt����ٍ[>��7娈�¥��3�؟XƎ�!i�L0H������x+�M�lY5!�&�J�6��|O�hd;��k���P�Hm��i{|aDR�>��e#z J�i�
_��Ɛ���a�H<MFm?�f������g]Nyb��5<<���;�9�q���P~��NV=ɍ�s������''�������s�㉐�\�H�N"e�̉:��/��6��v�s��+��^=�pB7�)�mZ��Ȭ{)�������_��K��k��o��� ������\-����g���Pβ�P>��m-b[X�>$"�A�i3��9k��Z�����1n��^�%��	�x�$���;����+�j�vg^�9
Lu�c,����z�9��/��m�ZO��5V��̐�\>��O�#����il�ˁ�@���܎�&�gk)ܼK���s���M��p&��"T���5��2����f�=k�;p�\L=76;�7he����O"i\V�6����J���.Ҭ���� ��������@�H�ִ�j�s=��Y0Kb�!H\CͶ�b��ٽ�e���a�$A�fݶ4��HUa�S�l��Ө��S���d}��U�].1j��)mkF �FE"9�E"�xx>d���wu��Oб��W1v}���,���U�g��R��+j�q�&�̴)Mpdo�l`a�N\z�E�,q�J�L��������+� 5o,�N�g��1����NKغ���+/^�?(�n(�1r�Y&	ؓ��|�Y�6_�<��}�I����sݣ�4�Q"XޒZv?,�\�T���a�?A��g�?|�k�	�`~Z�i}�Ջ�"D�	9s��SK�N)��D`�+ҕN�;éh$��~J�H8�p�vvGR��$l~y�������ޅb�����tw����㍑�d�FM	+�t�
����I��o������@����?e6�.���ނX�A��֙sa!Qȱ��tG��&w�/�0�J�]'5�޹����W��Q���@7'4��|�T7:�G���M��rڬI&���Qo�p��%�{�fs���n������f��\w��f>���E!9$�8�<,�7t�)���;M��ai��Ly��B|Gy�����L��������j�)�.)��Lu��
z��◀��C�����=�Z�T���?��rf�=!xtZ �&{��:!���"1쯚h'@}~`z��E-0�3|�z�Aa.�Ȓ�V	�e9]���tW�ҾM9m�z�Ie�Ԫ;SVpɟ�m=�Bɝvje���|D�}��m���t�E'H��rUU� �<�Č���466=��w���+Egq���j��Ou�'p_.,V+:(���
��J=WVKMt<��c�|H���>c��"����&]��Q���}P	���K���q��k�+��ԡz-�=�$�#}�K������MK+����H��ido@
�xť
6i�#����Px�A��u}i���J�a�������1Y�u-��f�M��G�x�^���q� ?1�7���)�wJ>�dQ]��@�}B�cY�ۧMj�c6;��_5�8�⫻�0�'z��2=
6��D{wᘌG�<C{z�&��/
��5L5	��D�:��#Z���w��������<����Z�j��z"r� MM�k�U���|�$�>%�3Mc��<M�9]�TP��&b�3r��B�7;"�zJ�t��~Oe�Ir����`�n��i�3%u�X���[=��Z�"���Y%�N/�c��VhN�kf�ro&�����73'o�G���w��W/����Є��H:ޕ�:É�X��)"Q�S��3��&������>�O�Ţ��⤓\�<}v�#c[[��p5�s�|�23��k睉����d��c��,�|�r7r'V+�:,��w6�be�X8V�,*[���1m间���T����k���:O\R��KMP,�@��\| �b�X��pi�Ȍ+B٤�"���>㓓}@,���)7���:ť��ܢ��F�4fd�dɒ��j������i�s�E�X�G[����Vr=,�c/�0����|����C���גH�������	�p��?c��Q.b�ό���>��-*��.Vk�A���Ff��p��z!�Ӽ&�ⲁ�>���*�+%5��CS�d���g����&UGs%?���2�~>��(�P�6�C�D������;4I� ��G���PpZi�� '  ��Ō1˛6�g@����Z�lqT	it�Zȫ�P���c�����ǝ|!��q�e<�"(��O�#�1:Աy�2��Y�g�)v�;�
Q�2�+LKYkZ`yiUB2v�q��lV��5ӡixf�&�^��wG\!��G��HK4P�����+z2�kX���uG*-�)/����L���ﭡ�O:� GLh�f�R@,�0U��;~�%R1����*��R���������5T���E�4zq��AڄS�%��%X���΅�H�2.?�V���k@K�vA�Zv�\j�+��W�(K'�{���s�G�ʪx�2����h�5E�>R�����D���и�i
� N׺����[I&��,�8�������	B��Co�|@@Tjto���,�+՚�1{�sH�JӚ���=�Xs8^�T��Z_���h����D|�Q2v�v�t��
t�p�m�Rm�+�'~We����caJ��1�pƀ�q-�˧8q�R�����1(�`��AYU��(��H�b��ִ���ЂA��tOxF�l�I=��\�c��J5��нƐ�㩊,�),�_�tD��3�L.RB��d�w��O�+۲�k0�S��<&��@	����W`c˅��{\��H�~k�D���ܽ=����Ƶ�1fc�h�]b�R�.��� �΋��Wߵ���X����� ��zn2������oD�R9�ޤ_�����1��Hb��,b?�S��թ4�7U*��Dwn�J8!&)�0��+�ڎ�a��#4�H���n1$�7Tѯ.M+�MYbO[�Fs$�����K��H��U��8N;�pf������a2�D2��?v~Oz�7ē5;T�^�oY�)/6�>"ꎏ�z"W02��z�X�z�z�eEx
���+���.��H$�6�a�M&Q����� �t��*-��\[�_���ns?����ٮ������/�+L����-g�4֣UȪpS�;�y����{�G����;���m�8[utUl�*	��Bm6�����W�;�m6�>���Z(��bF�]Ѯ5,�����V6k���!��}+�J�i�g�b1Ug	�^���a�De�<��C�i���\�S3�J�be�b���~��E-˃��(L��}�US��^��>�4�Sl�,��.`u���W^ᒧ��`))X���Âu�p٥UG�q֊���ɦ�8l��0�}��N:kă��8~k�9�W���u�axN��I��p�#�&!�*Uj����JG<$�G՞M
i�)�Jz��u��i�̳�o{*����+��;��PK��h�3�JF�)�O��2�����J�k�kl�nn��N<(�-d���f�eǦR��G���*!�q��x�7���)�1V�h�\CZvq�q1��L�3��P�Q>�+�D���5&�F��I��#���`�� ��?of�'��M�K!K9��d���9��d�^��1�NFk�gj��γ��|�Y�ע�}M��+�2yO}�+1��V/`�^��iZLo�bl���k�8rI<�B���$i���:\@�/{'Y'��WI����r ��T��w�A���5�)���N�e���h_C;>S��
=όV61�%����d`��д[gP'��:�X(�pv0C���aAOy��E���K�EG�T���d�����z��I��]���L�j�_mC3�`j2�~���?0603�[�2݃��ג��^h^䂱�W=��|�i$;9a"��X�ڌS��9=�pN���*Z�qGxj�Z�ײt>���~JV�Mԋ�����:�¥�'\�ɝ���Or��ʽ�b��
��]i#=����T����f���K�\�X�5���ɲkU�D��J�A�ݺ�ff���O�5aO�!0����B�`|;;=��t�V_�:��xť��� �t��'[K�u�~˝̌���x�#Cn1��xnm�t䬳��t�)�9dO���_��� 8�mx";�q�_֕}��?���P�pX�Y�KA�5�:7��+�Px��S�J�d�z}�����@mgb��j/���8 ;ͥvJ(/V���f�u���-7'M�ѯ?P��-���uM�eH!��Z��:���p�����٬n=�����A�h^�&���O��^_�M�Y��o�&��-�KDkp�EԘ�l��x�ȣ�]!�ɶ7�9}�����鯸�V�3��!��XI�� z�B:$�\�Ұ���7DSܪR륄�0B�l��}�|�	�|#i��<]�{�Je'ץYX_^&���qb�Yb��oQ!>�K��.,��"Ԇ˵J�\��1sk��8�B���9��m�wHm�z쥉RZ��xeq%�Ε\��85}̈́	�H{I�e�|x�%��.<�ԯ��+v=k�I<3+�j�c-W�w�L��j�g]`*���qC����ۮI���jW��OM�,�@]������7�'�Y�������9m�u�I֔��|su��j��P��eѫ�8���F�b�klᳶ�r��r�nG��m0�j�R�Y�df�$���U̕��Z= W�5��8S�'A�l_<_��oՓhS=����J�R����;:��
��iQƍ�V�	kbLV�S�A��Y�C(�SP�)x/l���؜�Bm�yHW �N�b*�x��L�+ ѱ����!lzC9��AS�Po�D�@m��Q�i^\����,U�Z�-椹HkS��E���/��E���%g�'��4���0�l@�{s]%J�����gLĞ�ǜc�h��i�.�9ycm�O���7�?I,l���%Z�Ő��Q���^�a�܂���o��6'���[b���H�NO𜤐�����e����L��Ӡ$`�4$͹��b-�|
�dS�`��x�tQ�R᠛�=p��GҴZ�%�t�;�u&�T��om������H=_��n�����fc�xx��z\�_�n�6�Ytkrkdsfdx1�;.�MH�,���.u�4<J�Y¢���?�O�F4��D:S1�ˤ�y:��&ӱHgw$����Iy��`}jz}k|�Yj"�6��{4ҳ�=1PxT���Cjss�Ak����/��v�7������٧�p�w��$R�7�uj�Ǎ�@�t�p<��&]Ɉ�X*��t&c�d"��t��s��J���J�l��j4��L<{4�<�{�㭃k��hi;36Y��	�N��X������xC��A�r�K���"� ����e/٨;�I!�@b���%K�R�Ҳ��>����|V=�ݻ�ֳ�u�_�qEU�1uk0��IZ7�q&�?��X\�9���H�T�KOcR�G������k�鄷h,�ȟ�\�pD�-+W�hl@�q�Gl/h�!fLj�����܀�v�i1*���;`�&ps@�{u���U�f@�	��J�Y͈�m�����h4����Xg"K%��"�p8�Hu���h4�Ot�o=^Xr2������������h�3~���h�|5�T�^� �����f'
�����խx=�;T��p��JMd6��5������{���i�X<ե����˅��L9�U��Mn�>-���eFf�����ÇMX\�p�+I����Ν;��R�E      0   �  x��W�n�0�m���ݏF���C�	�0K��:iZ�-TbTA�� c��6~��>�,(�)�)��}w�w��q��m%��(�Wr�d�d��Tŷ��J����@� �m�]����uG����ܲ�n�����Y�B�q
���c%G����.$h�~�7J0>��OP��Bli�y���[�'l�!Z.;��i		��� $�JJ(�GW�^:��['(���ۅh/[ɰ�[�NK�װ��6N؞��/J~9(!�E�YNw�11�(�F��G$GG�{��p�د�ֲ��~%E彚bc��9�L�	�UNx`���o�����{f =+�&���d39��Ʊt6p�	95�76c�+q�&ư�K���Vt���y�1noo)]�$���,s�!�-n��Y��\5�Q;5�Gc����vߕ��h��yW���$5G2��W2�fR
�?�
#SJ�o�Q���%��1�+�=Vn��������W�(���>����3�Ogi5���T9@;jگ�Ի;�$���$LoL������@ւ&���A/����[�S��{c"�CtD"0�Lvi~�k��+ɲ���&-���7�n�1j=
:9�Ƚ{��_i]��(�_����´�I��0L���Ɛ�_���&�ywRj�V�V��I9      )   �	  x���[ݸ���Ud(��ŋ�
�C���`f���t�e�6݇�&��;�Q�$&��MLS��߀���5Ҍu�
gNi��/L���_�������?<�#�C���%R��L��~�qNeF�rAy�^+ ���퇕�E���0#��ZΗ�S�#}�)O(�����~]�BD@���6���"�D<�Cؼ,�0�H ~�<z�Ęl��q�y��Ś=���Hk3����J�!ϔBj1�7y�^GZ�m�Gb,3��b��9X���Su�"�<C����M�#�abjo�#���<�k�R(�����H+9��Yd�Pw��i�Р�B.)U�Y�^�y/�um�Ze~��_܄E ��3� )U��G�#�D�u^$6%�h-jM�I��q�u�u%�7���qe���OU�-q�u�1[�x�(�n�q�<I�6W��Ze���kJ2�\��u��Ʀ`�C�1�T��}�xime�V�[����6�H�B�m�4h��D�^G�LR&���H.0̟6K~$�q����בVbUby����~��x9�Tjrɣב�`'�O�A�uv�d�u�f*�y�u���DK^�nܟM^1.�Vy���v�h~��C�9�_(ZE�(0qs�y�:Rg�1ˋL���y;o�&$��\d���r�:�`�C�,Q��LdM[p� ��~��o������{^G����By�~&�Ex�E0�������ב�F���a`f�	Vx={N��ԑ�9���bv=Px��hM�?��,(��b�K�v^G�5�łClO����c*襖G�#u�żCl�)�t�o��G��94��u�ב�pZ>Kc"��pfݿ`���,{�,���77̝ב��$�<�2�;��BԼ�RU����H�Z�����KXN��)��^++PipLF�Ώe�����<�%��P4(�
�u*�������E�˰w�u��F7Ki�e�lJe���閬u���HAB����ZY[Y$J�³�9@��n���u��$c�W�l��"�dwQf��7*ȷ̝ב:si'��,Ƥ7�Rp*3͔t���]~����X�;���$��sA�}�^G��h��
�I��gϟP/C�5%�8ziM����h�s
����#���H="Lq<�z��ْ��&��䝤O��k�4'�~24�j��u���6��E&G��Mu!� �.�9�K�ב:�I�"Q��"2[����oо�A�� .^Nr�u�~ۗ�ۜ�$jqFг�
��w�S�#u&�5�lf]*��jHϒe�ё�L�Ԝ'^G�̥8�o2�Rr����JI�q��b-�:?�:�z����z��8p`�������H��}��D�}�>U+z��5��]��yie��c��,3'K17�G�h�R����Lh�u�δCi>Z=�$c��̤��,��9$�g�-�(kY*(��xf�V:���Y2OoU�0� ��ڷ���"��f�����f�:RG�is��J�s۾����J�pc��ϞN����@��x݇�@ ��R�����H+��o8�']��g��M��בV���fƙ�^�4H���H�@bԁ$؎���G��e�~Fv�u��L�t�?�����"S��^�3k�/�R%e����ב:TF�@�)�'���I�"�v�XN����6����i�M]}L�3����S�#��F���ZaY/i7������u�;w�#u������A�=ړ���s�r�u���q����-fP��3�3�ҁŀt�M��]"U��lL�2Gt
��#����c �A+�(B-�S���H*3�l���j��1H�t.:O����.��n�uK�����=����u��Z��y�n������Ɨ�MO���F�fQ>�.j%�2����S�#�Lsٸ��ن_w܂�{�{�u�δ�����A�,�����\.��54��P}=&�a3s�m�,3 �)��\�^G�[�O�ƳV�B��Mݣב6Cj��_R����W�K����>�(�D��#m�mZz�Eh�v_�� l�Kj+h�E��#�q{u�=.y�D��-��Ƹ/�e;O��ԙu��\Z�I��#��LI��aW�p3��#m�z}D�]�^��Ʉ{�)�l�|�ZsĐ�ț�;xi��nn�$}�J�[��7���	
��*���tn����v�$�e�d�h+�wOݢ}�B�z]r�Y����^$6#�kĴdD9�G���e$>�d1�F6tl�� �jR����O����Zq6��ǡV@d���g+�q��,�i(&�L��檟�eNN�}�u�S?��p4��-{�
'^G�0���0,/ �=�w̽�ZY��vm���M��'�+oILKqʤ�#m�V�n��P�Ͷ����mW�P;)������r<�×ğs(��^_��zi������Y&�7z��Uf��G��0Sk�C��,�E��a� n��"�J�]}�u�컊1�>
�d6��d�˒7�j9zi��a�v��S�a�yJ�w���x���B	_�|�?�j      %     x��X[oE~���~L\�{w��bw���F+$@~�I����v�剉"ٱ���x��Q�x���G6����){Ω���0�I�-��g��t]���s��Q�ш���h�Hri���I,d��LpƝqNԙҨ1���I�z���;�lT�GE�����W�{E�a�w�|��O��4.�t�-�GE�V�?�C�F33���V$<��zbng-\[�(�o��p��k9��J�V���pm�_)�%�*	�
�+���'h�c! q&3�9m�LJB���LIJȾ-��q�?pq�����E�AH�����y�ȟ_0��p'����ّpf�����,թi�I�3\D�d"�L<"D��&���t1� l�î'f<1q�c�F�!�x"��k����	th����|���(5 �|����g$��"?�O0�@|l���D�eD-���)@�� �
�H�ےZ8�2��4�"3�Yc�5u&��U�p]����!b��I1��]l����@`�"�@�7��O`����:UgRfv�ԢZ�S�A�#��o���>P��n�� J�a0 �n�AB6���n�z6�Y�Eu&e�![��e��ݦx��N�=b����*��Jth���L(���he&�L��$B��J����*"L�������!��e,�����!�'�k0�#�,S#��X��L��(f$��Τ�0��%ڣ���m�V|�N�I彋�pE�M{MC��#��R���o�bV��7�Yg��Τ�H�?��4T2h��z�f��r��xH��6���Jw/0{��E�$�ue�W*�r���0=b�I�Z�U��R	���cdf,3NZ��LZ��N$Bi&�装�8^]�,���X��C&��.���:���t1����I��Q�1ţ�Q>D�H(f�_FE���@�Ù��v5]e�_'� 7�~��$LG�����/��pfy��PY�R��'|�9���V�tL��Sq�ojۦ��8^���p���j,,�Y<��>]Zn�iܙo�q��]֘e��Q�a�I�q�o�B/�'A~F�II ��N	sȷ�E�0i�)I�t�#�4Y��O�ʫ�(fJp�gӌK���:Wg�U��{�Ϊ&a��T���3�2�"H��:��
*�F��J&�j�1;�\�?lF�L�*l�R��3b »���`4k���Ǩ�j��y:��e��Ǵ��8ntې�[������P�Bk��q�wV���e��XZ���d�K���/,6����w�]}�]���������[r�����?���g||[|<��B������u�2��l*2�˘Kyjd�ɦom��|O'��y��/����BD;�	v��!�V�� �8m �����d d�&���a�U�q�9�N��+?[ja�����|a��?�mC���2�����]x��7o�x���zz���f_���o������e!P�G�=�0��3%f �
jC�|�$zD��!���j��}`����o1E�����XzNa�Ux����t�?�T��.����-_�W��P���!e�G���M?b�*�4��q`��3)�H��]�N�nL��)g���{�.%�u��r3��v(3��G7lAO�Y�Sx�1�
�����8�8оF#z�m�i�x^s������pq��)������z��
ݬyNⱚ�an��_��g��y~v0[x٧�~�O�C���č|ۓ���>��^�|U�TI�Ȓ���[�D�z��s��k�OU�B���z+�t�m�yw䉠�J����h��
k���Ѣ��C]�:�g���$�~����N��%o����LL�ĴO�z9Q���F�?��.y�p]��}�#�)o℧�����u�ģ��{���re���Q�=~�N�4���2�z^%��wH��a ��y^Ar���~��n$�OpDB��|�-�r���^~�e�|��N��D!�2��~�����~a@�����/�?�[��pm*�8�f�1i��fP�jx�B��RZU�`��a�.]�?޶�      @   �  x�͙���H�m�)�j�b12��G�h�(H�t�EQ�7c��ik�� ㍧v{_D��)-�;c��(,PȒ�#�/~�@��̿�����z���������럞�/������s�����Ͽ|������%�<�7���޸�e���5{�x����E���^O�]xdTܞ��q`9�Cg(���{1�����|ҏ���ꛏ���?@�$�V)�e�<V��������3>���f�8ە6?����y���c�/��iw󓛵Ms�!���G�9ښẫ��ۊ������# �5���Rvz5s������~�����������������������7W��)�$�'.�hI���Hf�i@��7m	DG7�����ٛ��������Pݚ���5���������kkZ�/���%�\��9��d� ��s��S���"2! dC�P�%�C+�+�
c*��ō-�i�1Z���E�]׾�k�sNm/z�)TVd���B{�B�P�%�C�Kf�-�&��d�����M[�ZX&5�ӆK�jz{�D���Fڛ�-	��"q%Ӳ��7=��q���a�u����r�>���Iz{IN��6J�os� 
�M
�C�����|��v���t�$y�i�u�U�As,���x�e�X��Fڛ�-	Pf�B�d�Ae��;]�:����p�^^{�w�Zj{1�I� ���^D��I�q�ђ f/�J�>�(oy0)�}B�YOUg��˫c;���k)�� ��Aڛ�-	�0{1W2喾�foM/]��:�YV[�?w����Rz���Ks�
�y�-QhoRhj�$@���{+����|c��q~��Y�1l�!�n�����9�v-H��w�9��7f	�q�ђ��
@�d
��֨U,�
��t��a��M���~��^�Y#û�r��&�ơFKbS���o���Z���>���5A�6+�6�:ÅD��Ks	�Tȷ�r��&�ơFKb�&|S�U�wk�`���yٛ����<����Z�4�)��q!�T���r��&�ơFK+|���>�K�:ֻͷ�Wg�#����-����"�4�@U�P�Aڛ�-	�Mm�oj�.1���b���Z��W�Z��|-�YJ�*����,"� �ۮ8�B{�B�P�%�����HP��e�5{]�	�9�;wݝ]�^z{�G�%�_i� 
�M
�C��V� �+$�|h��8��"�������&���r觷��"bE��n^��ݤ��HE@ld�|UD1+��e ��JWVx]�=��6	~K_׀����E�l�9�Bs�B�P�%����u��Z�Ω]��m�]7��7�l���n�̦���4@�L$�݈B{�B�P�%�����+-�!u:��۫9Hm�1�Wܯ�NQ�p8��<*�*C��O� ��mdBhj�$ 6�Q��-�ݥS�T�L:�K�:^�+S-�#��+C�u����D��I�q�ђ�����e��Ն�z�r����7Gz���Ȯ_�cxLo/� "$�q罈B{�B�P�%�CS�GQ�8\�*+�[��.�xd��[�2
f��E2c�"I��O� 
�M
�C���F6�w�@��}�v�y��[���<�ܓ��ߪ�Ko���IQ�(��ᚃ�{ӛ�-	��l*�Ȗ�����*�^Sk�<� ���$ͥ<��]�*�|w/���!!45Z�)
�����            x������ � �         	  x��Z[��6�v�b6 D-"+�wV��?���U��r'��d��y���ƭn�n���Uo[mR�ܸ��{ӭR����E����:N�;�P��d������n��m����cS�j<uh�3���O���'ע���?���+Ķ�7�yz�ʯ�<������?��'h8@П
���ӛ�@�ֵ�x+��l��b㐫�V��Ax����O��So�au��B�z��%�Z�Ԯ6��R�ο��^���F� 	B	���݇�y%��E�r�� �ݽ����ZZ��I6�����Z�����Ĺ��CN-�i�_ix�z?��J�Ko� ���R�a�!� 1�=��0+�W�y{�+*eJ!d~̲Q!�D1f�<��.��h����E����h��z���P�ߪ�� �"^�/ul,�7��FP�^�D)fI�lE;3��������`V������f���c�b^$X�|p����w����C�/��a��B���f�(i�q��@GD�>q�S�v�9.il�>mϲ."���g�h��¡����/T=�P5�|��vu/�@i�J�<��H+^L��EnB�~�e8����O�-4��r��T�35=��*�5�Ȅ?F����O�BU�Q��GdmL8 �~SY�o�y<���͏�#�̹�o5�3`����,��Q���bZM<p \���T%�� ��M{�J��ur�Y�xw4�D���a{�b�Yn�1������(c(�ʛJ�L�JQ�*]�gFb������:�]� {�����6���t��^*����Q)M��t�vhx�1�~���:��G��'6���Ď��0�:�W ��=�A.R2C�����5�\��+�V�f4If�3)	#�Q��T1�*�ѷ�zp��r�pv���ZmNk�Z����P�I��9_Ļ��2>�r9�]��Z��<%���eF����M�������[�7��A��v��{e�����~"����H�L�I�,w)a�m��b|��#���F��^[�]�K/rx+y�_'��� �`�4%k	��45I�])�qb�R�%o�ڇ���K�[W�ڣ�4�e?��0�bl =ڻ��R[�=Ov���hj�p�3��ӎR?��%Ŋ�z��.���������U
����8��d���������6�CUK�Qeb����@��氃 P�oOݟ�ʟ�S���K��wG��z>a
�$�V��p�?���[����O��\�F�����"��.��ʑ�|��`��z��s�O��"���u.��Xs�>���`�V���LM�A_o������T�R1ʬ2H�L�2�e=�Q����e��F|P�gW�;ӈY�W1?ap���K���2�н�3v�̢�N�Ӌ��P�U��/���(���P�\�s�N�9�}-t�q�㹆���܄i�;�t��)�V����{�3���̻O3��F�:*��V{A]�7�^�
S|�������Ch���2�mW�$y]�@V���,�o�B�*��RPw������&���z��'���J���:Ts���ف)��V�:� ��6��+�}�ٺ�{8��U��I�����J�,��cHڗ���x+���0�����|Ԋ�o�����e�����3�	���L��$����TЏ���ՙ��щ�b�4!-=X�M�r�a,�r<Ν|���T�PN��G�#��	JZ�/�4��K��9]�p��Ue�1����G�>��ۈ�Ѿ�:az��ܺg�ݥ�.����Ar�"��g���H�B�.��Ӿ�u�YM]v��P��]�ҭ��٭=��_��I�U�um��[�+��+m�K���w�ё�"i��%g�Њ��:�5�-�{��n��BG�J_V'*WtX���Μ�Ur��h�`hζPl1z�j[8�`;��.�8��č��U2��-�����n(�~��^e7��u�ܚ8�.|��k�tOʅ��o%_��;9|�gߡ��Kv|\y\��� �Of>�KF���{�H�<y��{�r_=3��汝�A�����Sv������ɠ[��t�����\!�qҏ�+�l���ţ<{n���������]��精J	D��P��� ��}*w��	���t���7�HR9��"�	�x����vncHe��x5��B	�.����	��1)إ����(:��?���x�#Ơ�t=+��Zm�%كΏ�y��e])��ZΞ>[֩�td1
�F��n=����U~���Nߚ��p�!$%l���b�i�S��������            x������ � �            x������ � �      4      x������ � �            x��ywW�/�7�S���}7uKJ�T���'40
`h�b%�!)!�)r��j-�
y�ᵅ)a_\BWW.�ԫ��J|���?3�>cD�R�ܯ�l,g�g�=��>�d�'~|���Íw<|���+�ûO~<|C���~������wN��<���C��?���p����l��n���&����H�~�=��?�?���'���p�|�#�m����__�~���w�I˿'/���?����G��A?~���������2�?�����W��+<z��?���I���ߑ_n��o�_��x��5h������>��鏇_�ɑ0	_������E0V<��y�����AY1��G�~��M2�=���5�̗�O��O�/�c.�Y�OȜ_�����A��[�\��#?Х{�q������"m�;���5����GK�68:���$_�ub�`hqȁ�LD(���#Ӧ<�)�s�P����M�Y�5aJ�mmi��䫈�'-`R=��MF��J�hJJ�@c��o;���%��i�%�;�tp����~O�ql+l!JL4�Z��l��h�S�x�^����P�����]�J����}����"-+�Ԏ%�-�x��w���;���^��.����j��R��QQ�:�g�_�ؤ����E*(�}�����~F}��͕Zc�_�V���<������]���I�J��6�k.��˻�T�{q{��O����b�o7�A���7q���4�'eso;�M�kiuƽ`(q���	�/����
$�@���y�+f{0=�T��_��Ҟ�:��h7�#`�g���/S�-�A\b`Ą`�~2Pe��E��b�#T�m��y��}�r[��lO���'T�o�O���&"7�q���,�&7�o�d�f�8�-��GX6��!�aw@~�ɽ��#"3��!D����p��nzNR��z�����B�
�m��-�������x��(��X7�����2����H�oH7���Q:��,��7���:�w�-�C�O~�N ��/8��@��.��b5d��� 0H�o����`̷d6?ȴ���
����~�E�K._u��+D���/�w����T:�x�������4�立�����mp�� ���Ku@�����3�p<'���|�L�U���{�|�a���&�!�G�:��(#? ���s�ee��w|ŕdxȌ_Iu\�։�Ng�]����f��M��>��vm�^�[��Q�W�ڇ��������#���W�\>�����'2�L~$��P&S�J�L���Ɗ�G�C�G�ҩ�z����	L�5���wLT[�Yab}`b?a{�yx��>���^�_M]��7�,�M\������毭M�ypM��(ʤJ�b)�M��\���e
'd��� �yB6�'\wX <u��z�l���/���6IE�)�3�kl�i8�|��l��j�{��|��r�=���R�:wu��03*G�-�F����X��z�w��C"�����_-~��j��s�����]�(
W�6���?%p �^ƹO�gn�-�ߙ�^�s9�t���{S��U��܋��l:��F�y�#m��|Ͼ�{	�:X��AP�E%ͼֹ���A#E.��/^�{��)�QƗ�/]��O���(E��iK�|2�K����GE���c}K|Ō���~0�'2�8��##�j�ng�by��~����V�z����t����B�lJ�E��E�X2���G�L@&��AK��0߀:tQ-M��Sn�p��V�/O^�9s��p��ѹ1�j.߹�[:?��ݸ��T<u��%-M>S�J�L2�*�)rFy��R�tI��X�a���(��������"$�&��_|Oa���>�X���c
���f�*~"��O'��\룥��t��&��V�A�\���⥙�gOS�e�䳥L>YK���\�0�� �2'd��hߧ�cɍ
,m3�
�FKZ�I����W/6Euz^����:�ȧS���j����S��ܾ2sC�
|��:+WJ�%Ӿ�N]�4zf�9E����b�����ࠢ/�o���C�NxM���^����S#��"���d�۵��ܽ���*�ٜB���X�d&�-(�_y�w�KA!��R��g�;"`v9N�I�%��-�=�Y�%���"�����©�S�<K�t2�N�2�#�x�E�y��$��	�� ��{�ύS>s�6s��n-W��s{*�ޞ\[_���TStʒ�I��)W�}�&Uu>�;#wF����q �� ���V����~����'.������M=��d'w��S��C7%=��2=�̧RcP�菔���԰�Ϟj�TOS3d�M�G��T�|�v�<25w�{T�ҥ\�7#���B:_t=R�]�qX4�=$5-[�9�	<Rm�3�S6�F��	���O.m�3J��D ����&ܒ�r�ō�}H��|�D����u15�7��<4��+��@����rn$�IQ�w%���oX����	����a��\v�b�Ӥa�ؖ�~��ҷ ��/���SV�G�b6��o���B�"tj\8i``�����z�����iᘊ	nb����)@n�?_�_
u�Oq��n*vΏ+��� u<��1&��� $�L P�ғ�{��_��B�5�H�}m�t(Y/F�	��4w��.��l�^�GTP�U�v�uH3��A#_�w�������ǋ9��47�G#�w��(��#t�|�\Q��_ �*j� X����_��hD}�p�^���2M�K��xM�����Y�񣭮օӅ�R�[9��j��B��	-_s�G��)��h�p{�'���g����eRs���ȹ���=w�Gg.U��7�ܺӪu̱��X)�JR�bJ�EJ�T���d�ر��4tλ�i���A��[��Ԇ�3�m�is�N��Ӓx�ޱ:�~\`[P����*��+��B]I,�X2E��)@!����E���5��Yj6�ѹ�jyM�򗪋ѓ�|
���V���3x_�=o�ja��Y2�������l��-z�!)Q���/`NO|v�,Q;=�F��(�J�D���I�5���&��۾�6���H#�&�9��d*�6滾!㚣��uD���~N�����0��lի�8I�zΗ���j6�^�q�y��$j-���,I%�[]���bG�׶g�0�amMA��|�4*�t`B��(.�4���}�C�v�0�21�5��ջ��(~$���(F̥�7�P5y��CEg3>؃�M�F8�I0	�2s�_��P'�Ӛ;R´nN.�j�F��/���x(�o���r�
M9H�����W��ќȟ.ڱ��̫��K�wV��/�"�U���F�?Z<�ޚy�4��,��f2��1�#5�c��@a|(o�2���"������R��-����둚��ɝH���X[[K��������k�Ne�W�����t��ꩉ��g����R����N,�j��-o}d��R���V,eҥl&9ZL�勮G*.��N�v�O���ՁL��{(���[!�2����h��GHvye��6GB�8uv�M!N��7m%�����Vh�Pu���9�}�Oms��l�)��mj�v�������	�R��d?*��w�X�h\���S���kc�m�F4]4��';�x��|�1#v��������Sn�<d��I<6x �<H�v����#"�w4���b��8�s�YH#����	ٿ$֠Z?I�踆 Y�HE����h�\�@O��oI�m62J�O���dy;ن��'�s�[���-�����ݸ��A\�	Ol�1����A[�<Π}�i+�0�.�3����IB37Ĕ�F���"i6v���,a�Ӆ��m X��,;���L��r��A+�Vy��x���r�2_:
�rc��O��L'$.z�WE��F,j��ר����G�g��t�,�1�ш�v���cŌ�VH�NE�ς���鏄�Z���}���F2��.�}z�rvPn���c�hU�6LQٷ�L�FS��e+g��    �q�K+��G&OO5�����BE���'Gӣ�t��HA�r�<b�:맅��h��)�ĘE�|�UgG�!p��:���
�R�K���Й�
�W�t�	� ���Ionc�g� F<k���Hf����Ps����{8θ����cU E���S��� |��qve���he�%W��H)
�D���H��O
%����}4�j5}?��d��l�m³����p$�e��@�E��*���B�+�F����&�����F)ڕpGл(��9�%�����qV2���w�G\wu�V�����
(
��P/�1�(�Vp���B�h�r��4�|�He��#+�ō�pN?��S.��{D�m�k���y-{�vy�k[�yF�R���Nk}��c�%�.Փ��<nm}dϹY��4����"{��T���	���_�lXWd
/��z�<�f$�0���W���O�� /�J�t�f�����\D�'������;�e4u��D��g����V�n@�-u�h�kmO�8d��v���$T��qԣ��T;4)���(:Q7�榋��3gw��~����|�O�(wI�z�C�&�j�����nڹ����"�CԹ�	qDQh�P�$5tg�ǆ=a���_����Rt�"�����ӷl����.W���H�9PC��G����w>�r<���v�?�ѯ�l��?.�7h�gm��%u$�r�Y���t%��H���[7�̮/}ts�;2eF�����Xr4�Ό�]�T$9}B%��|�4��������?b�J���=v,�f<Щ�oD�Ѫ�LH����a�O*���?��7@����3�s�p��Qp"�8A"w��5g�%y^f]sV���	{�3�T`�x�7A��!��5t�TDz�= !�8i��X��4]�{��a�}�� 0��]�d�d�Sf/�t��n��;V%n�
�j�7��+�S�6ؘ�+^��f�U��14� �f���쁝��&J\o�:^hǊ�j蛜��䢱� �%�WV�F��՜���k��D�D܎oF�rX�q��cn�&�lE�?p�/�M�IU7�9�@*i�������]�8�&�6f?�a��Ӭ���m������cba��K�w������s�[���M26���h�~2��<�k2^���w�N���`6�-}�C��U�0��f5(uѡ�4���Lغ�.�v�8�`�� ���o��Ⱥ_"8FR��jz��A�Ĵ8���E�l�1Q/�꣙��c5ũBz�=�(���)�z�ܨ�����s~>ȣѺ��k�x,�_Ph<ue�6k�o@��(�Y?Qb�����h���ze���KW.������WG>*N��wO]����|��)&��\^�?R͌��`������j5��h)�Jf��)x���Hv:%��*��_�o,��0Aq�x]On�B��z�s}��g���箭6�s�3gק<�s�t)ULf
�Tv��H]����0;҂HcK����r�d:��s�Gڂ��(���O��e"�\�|M[�J6}}m�b�\�T=����W���7���&��K9���d1�.��G���>/I�KKl��!��A����q��'/]���͟� 7�?�j�I�ώ/=83w�fz���͌���iC��m�%7_�9�IH�^��c�tb��B��Q��r��^�Vip�2�T~�/�?�f�����\�	Ne��vH@{��������_�#u�E)j��w<z�AÀ��Dsy���Z�Z�MfZw$�1�Y3`IfͻG�_�8��Y�l2�/�?�6�,��&;�X���:���w��lE~	^a$�ƴI�q�B6��\��L.�I�K]��Y	O#_�9��aW�3C"�r��8m\�:#m��>�F�a@P_��y���0˹Org������b1+*x�I%���lԜ}r��ȼ ���B�B�j!���C��vw�8��R
����v��n�!��r�u��3���h*gX�|!��g�����K>�� K�0T*�rH�K�4ZTL�Z��/x�g�e��x�Ӫ���9.�9�G����w�*0|
��AV!t�3�d��*h�?*$�Hz���L��K7�3�.!�Lљr�Zǩy'":�9��AÃ�n$H�;X@�m�lo��B��і��O��8�'�n� �Q�tq�|[����M��P��q�������#S��K� o����� #"��(�d��$ՒP#%.R�ĹZ
���Ȗ��;AZ](=7y��9���NMP*h�
�-��ɐ�W��9ɐ�b�u������5g;n�c���W'���p���r�D�Dv���Z�N8��lo�K6�e�" &��3�s�/��f�������P��=qw,JL6+�e��9j���si6���b�k�ޠ��Vye阗�'������	yH���Q�%�{�#�p��c���B�0$��G���Zk��e�TDSC�BƝ��a7�,e��%�.���1:Ge7R��#����BsM�G�����f�u�����U�s5?F�8�&�Xq��n69�l`Zi ����q�3e���Y]$O��H�h�����x������a} k��y2#��s~�eOE4v�F��ch�8�^k+�@O�̑�~F~�a_�K����#bECm{��n��*W��0��	��Z�^��K=v�W�����bv�qkQ���cnM��ȼ���h�
��m)��  p�`c�4؆V>u�7Ϻ�#��+h�V^l���y��0*��c���a�F�Q#9�\��pF��H#$���H�Z�5���%���ًsSW�lǝC3بOp�Õd�Y�	lq�M��ԅ�	��쟂�1�=�}M��!�6L�������}
��d?�9�;ZF`<��ĤOm�P��E.��el����|7݅4��{B�H��)�SQ.F�Z�[?�/{��V�:�����N�!W%�>S#*O.�.RÊ�&�s�}�h�l��{ҥO�̍�k�ހ�F71��� ���iK�1��/y�,�񀒥�U�V�6OɁ�4��x�>������w�ܙ��M�0X[n�\]�\�ym��څݺ!��J��c4%S(���T)�Mf�:X[8�"�ʆP���u᭶����@ǌ7)@��H<�W�wb�t������F��	���C|�>d(D&Xa� "J̗o�SR�эvTx�w�djs��Qb�U[.���yo�P3�E�!��]e>|莡<���g�oQb���j����pg�D�0�rA���J�.ynx�GC�Db�Ԉ)���C M#��{R�| ٌ��O��'��ţȸ`�O����LI�����{�k�\����P+�b3�z�n� �o#~���[EP&)?v�,#�-�Z��&��Vd�L��Z �NE�+�n��z��-P ����� �J�A�n�"�֓�([��g��d$�d@��/>�f��� ��[⛒��0�9>�3�b׍�mCɪ0�K�ӓS�6��#n�(+/_�\r%�%.5��Ns��9o6a��ey7έ��(�!x)�n	�c��2Af���͔�|z���Ű�6���x���ƹ�I�uM�|���/�璁�7lS*RL�����fr��N���"!K@2Ȑ2LY�qOI�2���b�� q�u{�,E[�yI=�7[���#�)��c.��îL%�%С�A��D�M�M�7ï�@=�
}�y�I���_���!���7�k�~\��퀖#M�S6v>�}Й�-�$9�c����;7�g
�κv�dJ�T2�ΤS��l);���;Cp���KM���i=��K Z� ��˱1��{r�b��h� F�=!��1gǳ�)������rw�n	��=8	8��cJ�)�V����y���_�׭�<Q��F��ޮ����.��u�R��h��wxL�0�-����Cj��i��Be�A�e���
o[Ƭ����jtj���i/�V��!m��M�lRp���.Y� �0�%ۂ�ej/���7�m�cz&���tԙ}qI����7�Rx@��C01v�[�j����4l    �G�V�?4�(���a����>_(�oT_S]S�K���G��X����1#�g����������9��_�����f���F�ZU�����������#dW/n:�ur(�D���tpcC��G��S���S=R���@C�;<�Ɉ���9L�7��o �_���|�~���������r�^{@��&X�A�T����)>��b>=Ddm�T0�FپW���d�)��Ҝ���,)��wr��+�ha��R��sYܟ(d׷b=P%����#�A�L��(��?����E��Ń
���.�~1�O¸Wsb��:�@U$�$R3����p�D�������^��o� ��W�t�\���3��zm�/��uH�x�?ŉ��(�1�>¯�M2<w*B�x������#no��l�|_��jX����Œ2a/Q�C���:�`���r ���d����h�ukv�Nf�A�um#�w�Od�f��j��J��*Z��b)�I�ә����V�D*��,�IŞЉr��.W����֒d���d����� ��A�yд�F�Zˤ��Lf4(��I�t� �$s� Qa��c'd�ev�y�$.*?�D����A4�_�+:y�u��T��ϑZ#�ö�v-�J��R�O7�!	w��B���i������U���g�M[=L
�#;����&P�F��1j�3��d�������	72-t~(��
J�.��k�Ԟ�*�G8�	��ٿ�u��X�g�t��ޮ�:�ig`���Ji�ψΠ������sA����/�֘M�_�:k��]3U%���1c>F�f/���4�]~���y�ݷ�����H�F��3C�]>��E,��$J`���O#ţJ�W*^��&��N�	3�{2<�ɌKyC��1{b�<�F�!����~˵����)���ng�kt|iE�@���+�ѡ�͓:�];���
�%�ך#Ӿ��l!ed��.�d�f�Qi�����lL��1w����L�:OyY��.h�<#���Y��� ?D��d�qSQF��l�bI�_��l�N�+w�+`u�9켱j@�∜to�arj8n�?KJĦ�p��1e�6c��̶����`��ta�v`���w�K�ZH,�r�s����ߒ�{\��{������ܨ��g��"5&{#Wdl`���W]x�u���{��?����Q�b�5�R*�+��ҥ@x�
��5I��9Bz�͹Keg	�� �m��*5���x�F�@.@yC�������D��n�����*��
�����l0j�U"~���koX���������I�Q�]����T�x���tŞd��XK�s�֍$��Y��q����׃�$��觜Ԃ|�7�;����+�/�h�	pCz�����f��礝c}o���ͨw����7����A�o�
 �6\�H\�����r�H����ԁ��hyG��zr��0:svv|�n�VQr�A@��R��ˈ3��� �1@�}���Ĩ��,��>�`��X}�^b�#G����d��.��6-����8��Dp����hn�vk��tf�̝�͏�Sgk�s�s]s'�*���t��U�H��N>u�K�$�s���č��ˣ8���#�Vx��3��҉�#T{�l�d��1�`,���~J�ǜc���N{++�C��&��^��3h��W�Js�k���K��&�ᄓ%G���a�VQg㱚D�8�PL�>��ӛ ur�6���A��h����
��)��&�A�JLw�u-��:�����)�7��f��t�=�)�:T���53������!*�z0�S�as0l�3�QV^�~�Q�]�GY��'��7!�cC�
4��T��D^X<��-`]�@jyA��sfUǥe����.��dma�ka ��P��C���n�ke���o�;�X~�Z�L3z����g����}p���i.�;^U�@79ʀ��g-�����+�΂x�#�D��v�2af�S�����Gۑb�z��!�J��aGe�QD6ǣ�ry�,�3\�W�ͷ̭7\(���%�s�������fWgF��s�Fc��ho��t�0��e<��\�{h��{:�h|����@sY����n���̌k
��c�Q�p�VY��8��6p���ɼs��#�Q��c"Z�;*�l#TXon5jFb�j�A�� ���	��D:��Fޑ�o�޽JɈ��!ĵ���!�}�U�%]�	��A=nD`��i�L�\4���E�+������O���A[LzǞ���3�w+�h����`t��E�1�!V}K��� ���GUS0#k�r{�]�8�/�Q�>�/�s#�7 \$���=�����}t�Gp��m��8,+�Mܔ^������זs��Xѧ����Q�N��m��meNF�i���4�G-6���,�U���51N&�!�T0Y�g߉zR+F&��g��H�Q櫊�A%�­%�GK�jH���6��i��@�F����ܗC0QO���MG�]��Fx(n�U��"	�㎮F1�-���#�U~�}=�:}�~o�r����p${�Tw�p��D���S��ʖ�k��/&�r�b^�pDz���K�O�A�G+w�*f�Q�S�D2��'��н���\�&!���=wm�Q�[�9�>�&�I��R6�L����p�g8�
g?��%��ĺ'LC��_�QNu������x���Lu��������s)iQ��R>�,��ҹ���{&�ύi#�8F���l[��@cN+��|^JҹT!�z��tޣ�8m�p��H��X'zEH�(]���1��r!��i�y�f<F�����b�rV���5s&�qׯ�O��������X�ꎚ�� =Gе��nc+@�hg���0r#�ZED]i�V�8/�h_���Nn����'�9ǰ%D�����,�� y�F�˶@��[�������L�)��C�L^o��Embei��.�+)��L�T��3�e��ݷ�����c��J�ĩr�VA�d�խt�-��T��Vn��T�]�tA����j��0Z�7��*K� (�|�y�%�a��Z���|��|���=���b�̤��R;���5U�V$v?�<�%|���G���Ѐ@F�g�!7�]�5�r��2{�
���O��w�*�Pkw��x��y�.ȧ΂^�|�(�����kV�ܥ��_�Z���N_�	Qnw������.u;C�3�YP�r��z��{��M��;��-���6���z�<e�5�	J̷��ЀmTm�K*B���j%�t���u�����'���ȯ답]�Nm^d�������mo�E8rտ��FA��г���"玥b!�1��P�����q�Pbҫ{� -o�Ns@��"�:��C.��ś�+K��h�n��d���j���lu�Q�M[s�y�.7,�l�}����JZQ�<
+j爙EAq�;����0���iow#�z<�s u�v�rI2��⨡����E��Y[�j��!��G���!�IF��=:�+͵ѝ�]��߼R*~�F��%�QߴR6��Q�ʪ2>"0l {Tp�:�����A\������SmLր�;��u5���f�a�����X
�&�Ѿ�\����;/��� ;n�`L�Gm,��>Lݫ����Y�ƞ�E�T���Ѷ���U��\Wn�[��9�)_Ҩ�4���]��o�W$
sj�����;7nUn����;�(L�2��h��O]�T�<w�&v��Kb���Q��	-�$�L[�t<!�yG��l�=.�²1x�q�j�I��J����5�R��M6���:blp�RA����w_x��d�T���#jEv��C�?dZ~լ����O�;�UBGX!x���d <�K���(����R"=��ޒVDF��9k��L�	�vv� �{,�Ǹٶ.;R�%�@(;e�nq38�1p��B��R�;�F�5�
�I��)�rti��|k��g����"A	�8��%�����i�����P�a�v���J��ч���a4�F�E���aT,�Zİ�*&	)������m    @)���`��~H6��/A���d�NO�g��Rh71۬5:^k��~�mnM{ɬw�[�B
�������"+�p�h�b��֧�jO�Dq6���W�)��bT����Dr��|�mX�:F�8R��J(.� ��Cr�����h��d�h��uQ6���)膘0��mk�7�oXPT�k"��-X%�j���:�r���KL�];2�h�����ս}���D��.k�$ڎ4�}����r���*�z�嚙89 �j�iA��1E��)�<a.�#_F5���w��~���Қ���0ʫ����I�`Y{4D�ƣ��J������>�.<��b����6�&�����z�֭Z�ֹu+���èZ����I�k�^��ў5�����f��#�;�H�>y,O��%�\%�W=�1"��Wi6��2C�-�{���y}�Y	;$�����F��qlp��>��Ll��]�b�(b��K�8��m��w��!�~�:��
��A�Y
� �`�L*[n���@f1��������T�["���D��H;�8�n��DfĒ�b�(�!���@�@I[����W,��'��1������4��ܠx�7�.��X���]E#�"�	w�������l9h���i�qo�%W��i[d���k��$h�ԏ;gDIe�LA%I�|	^�G	�X
�Np����]��CwI���B�R�У���и�,�������,c��l�)�R����HV�ZOj:�mr=&����
Ad��Ã� @�l��)?�M����c;Q�0�-
j#��C�#*�Ќh;��J��=�]�/��g29��/�3���~`9P��Wഹ��ʵ��i5D��\?sg�L���ir�^�A�^���ؙ�K�rz��)�)����[*�/��Gj:BOU��d���c����ҧ�����Af��9�� oX���28�(�Nx	E	Jڀ6�֦S�Q3*I�Qy�h­��qb��v�Oz\< �j�!os�Y �:wXS��uH(��A����ݼ�m/� *�)({v���
;�d�^dB�E���q/��:��C��a]��ywcE����s�J\mT�C<#΄ǹ{p��Ћu�_���6�&zK��-߶O�m�X��Y���Vߙ��h���,���K-ɠ�:�����)��'��rG
�(��T�;�l�c�Q�������I��׼}�%�}�/پM�WV�F5A���h�:ny�n������[+���0��5�-�F��~۾�-�t�Cȫ�=	捋w�ԽF"�d}�!J�$ ��O���8���d�G�~r� bk��
"g�Љ>� �z
�8AI���Ԑ��1 ��=�ꃴ!�HS�x�.(�E��c5(`��hf�B����+8r(`��L�m��z�A
j�*	A����<? ^�A�Ry��S�h���N��1,�C�m:;��g\�kY�6c{��k�ȫv|F
Q�2R�T:���$Md[%5�� ;:�9�z��L�@�b�
�w��a�is������+s+p�g(�lq��rP�	4eݣQ���W����LK�9�8g�6��E}�F��Qq�#Q�Ȧ��I&w��VXz1֣��B@�0��[	�F��X(b'���q��v=q�r+M*����!���bt0S�'��צ)��ǯ./������͵ S8���6s�R?�h�[��tB��)����2�p��!��>��񖛭u���O 8��TX7b��p/�oA߿}�A�@�rQd+p�m!�NB� 1���g��Z��v��y�"��[�]�0���vu�H5�gj^������A'��>&	%Aۡ�]wY#E�E9��w�6X���R�^B�=�x5���!�%f��9� ۘ"�Q�x~����q�)�2�?�+�f��k�E�
�9ߦ4��G���������N���Q_��?
Fĭ�z����	���<[&b��	PU���C�͛�]&�;E`JxR��ߑ�g���9�cz� -���	¢j�)�ᘇ���ca��]j�M4�:+epς���B��$ &ǉ��R�*A�f������/�ꤜېI��9U�M~��k0��l��К0e\�� π�d�L|r��%a&���e<����/�Uf�O�K������L��k@Lpn�^�p��z�Q��0*�roK1�ϸ�9��5�-]���_8kl����>)q]ɩ��
�H���EHW$��o��)=~���i�<mR[1�,�9?�2�[����S>%G�쳰SH���ds!�ȅ�kc�В�s(�#�X��´1����0u%��y��ºRNy�>#U>���d�mig�-V��!�W�V�\�ȯg)Ĳj�~�~-���r�P����my#�V�k!16�	�����4̛@`���a�NN�Gw�����7>>���ἳ/D��5x9Y��P��hr��zF)���o��!2��L��zl��������ZQ}4�,��ý��������?�U8,��<po��5��Po1R�OC��nHP����p�S�w�uC�A�[�ϥg-�@����]��7��:j$bv��6��8���b8ئQ[ �ڤ���������p����[��[-��m�k�^�f.���x��>F�o��ߡ�N�S�j�!i�S�b�y��oY�j��s΢�`����x)�8`�����y4fp7����s�d�XV�����jJ��fo7m:�F��/��@�z�T0n �M;��G���3z�;�h�YF�4��Q�Z���Sy0�M�Cp�} F���A9�`E��_� (3p�A<Ĩ� ?IL�߀8Q��c�;ƀ.a���qn?� �pc,!�ӳ�#�f 2�s���{`U>	ʭ�LWo\�|u��x5W��L�j��3����nM�k��3��h)�M���ѱ��r�t�p�۟�V)r���Iͪ��R��u��dG���"��E��ь�>s�&��� �I�7���O �`k?���t���gdfą4�U��w ��xq�'J{8�Ñg�mͤ3�X�.g������D��̱���z{nq��İ�}�}g
�=%�AԴ��Oa;(:�@�?k�1��ϼ\ ,�C-JUF�O��T
��F��1�V�,�9R��V�_aD��Zk�Lz()\�t�[��T��
^-�-�Z�J�V)���������G7������àJ����Hz8�R}�"*Ao��Yj�p�ձؖ�zT�A�������A���Č08�&ƭk�Z@F��AU)e���Ӻ�QѴ������!Q=��D[A KJ��C.�`���a._{1����ï	�u��� �L\	�-4[w�����@��N����U&�:;��*b!k���7�a��mՖ)�u���������?�{��#�B��+�ɲ\��M�\��#��6tL��f}���ٳg�v*�]�|��\3m�tE�d���}Ī�Ѭ�wp�#��Ⱥ�p��;��a�\�N4/,!�Ӊ�2���.���^���Zcg�Ւ������������}+�'(����F�Ee��A�V^\t�&񄸳�ڵ	ْ�.�-?(߭��Vyq�kt�"G�Mc�sA��d�jYi�mr�E'J�{��Z#l���* �-�^�;�Iօ|�'-�B�΅�"��(��t�����3��e6$
Aa�Ʊ��&�R�f�x$;��l�XC�$p���g���d�E��;����d�W�B r��W�Ą�:��w�'V ~K������&!��ɑ#2�}�m�HH��C�Z%9	N�P��19q5,�`'s���@���f�VPoؾIN�������s�捳Yr���+S�.�]�����q���mCI��X)7�=��Xq,�s=R��t*s"Z<G��%a�/9���\BQE���޵9�F.t���:ק�x��^{��j�:�>sv}�3�9�·�sI|YP*�z��q
l<߸�d���@��}x�3�V8Φ$:���V�t2s%��L��ז�n��A䉩�"�"ʽ�F����
����I��<m[<0�W��a1d)v    &�� ��E`ْ�8��]��=�ve�J��7�5�[��q�,��EI��?\����*��ȭ��#k3�
���P��:����;Q��5/�����r�jd�Rw2&m�$���שŚk��$���s�Zr�a�d��N�F�GKE�n���N��c�C$=B�k�@N�rK�S�bX�e�~/y��M�]*��A�)o�9���i>���U�+^���fʝV��<Al��X��Y���Y��}��B�=��6/�����Q���tj�Hi� �&w����8�hrG���"�)�[V�-�>�`��]#"Ƥ�bYZ�X��f��˾�p����x� ����N����ϵ�15�����X{���~�%N��r��4Bp���tjz�y��A`�гhM(�@�'0�{�r�x:c���x�^�g:��f*���8b�9�i�K̎��,�d@���#����`�\��Ob宪V�PA������C5#��"W";�6�>G6���@2(����^D������/tL&�m�>�w�k�T�6lF|����~B׃Κ">��$�c�D�E����oԴ�r�z��7���F�Z�b��z�5@[�I�������Oy��U��U��R/��D-4[$e0d+�Z��X8����ߔ�?��a�_�w��Fb���hwZ�p,��_���Q�Ug*�{q�Q��i�5�=@-gV�K'��P���1o���N�sjg9�Țz���$瀧���@��;`��c��(��?i���pay�A���Z�f�Ӄ��xY�{M�;^�J����ȓ��o�
bp�#�K�{;mO���Ou���\��D�j]�pw��Z_�r�����G��I�2�d:3���\�����	2��d>=�P����Y"�H����i�������E�����Wfnr`��t�)�/]Wp`p.S��{Ƶ�ϱ�SH��;gR���P.Ҩ�����O���(Xۨ���gz(n���ؙ�~z��8���O��pt�I6<=�e�qW<�7��b�-A�S{'��}G]�
��`?x��:ا@�|�/e~#��J"����"�08#
ǵ��X�?
���#��"�>�`X:��Ǎ6�������[C0� kA:���-�	��5¸l���X����61�� {�	�g�k�h�(���ű	�BS��]xUWf3hT��R#����0֟���D`���U%4����n�4��>�;�W�S���d��e?_1��a��a=������43�Y�׾mb��,E,�i���/ B�O�M�qۊ�mp�j�1i 
�<&,�Y][O�?s�kLa��N �H&'�����p��?�MN�9�R���f�6���h�wL�}�Rlqw��h�
L A�εr��vRm�th+�L�L�eB�"��S�S�Y���=��J�P�ם_w��p�=�J7�@$4��+J����!�(B���P�=�M��'�D�򅝐�.��q5l�f�p�f�����Jy�2���&ΎL���/_~p�k�e��T&YL�FӮG*,S<-9H!�
��~�y��D2�ԇ[��~����'.��ý���M=��d'w��2k�1�J�br,;Z-���d1]��:�+��J�1���#�w�7o�J�W֊�Sӧ��Ņ���3E�c�\19Z����Gj6�X��^Ҽl_}�]m������Z��ﶗ�4�?X+w*K�Z��A�������ϝ���*����m���%3�\ftT<ʤQ:Uʌ��y��W��{���
�l{x6zvo�(�u��Q��Yk�fc���m�������f<m��
��R���V����I��ח� '�_~�5�,�]EQ�&$=�8S���D���_�R�l�7x����0�z:�.&m��%�dAȸ����a<(20�5� ��d� �;���ʎ��,\���pa��0���������p�-�>�b��~sS(qvv5'��M!p��d�R���IX0h�{��u�L���-C�WN���K1H���L��W|u�J��j�}��y�i�Ld簨���J��2tq|>����j�k�q��F�N���Q(;�`��9ͭ�|�i����,J\��:�r]h���-���p�����N���x��g4۬5:G .�^�������f�����|�3��6zmd$I�)�sd�*l�`GC��{�:a�G+���Ja��FQ�o��6셰auZ��2\�d�#3������P��0p,r��	�
���4����H��O�<����}f�����r���4��HB��f�Yiև\8XT�z�N���@�Np�'0���گ일8�Ϩ�\�5��������A�m�fx"1�.>�-��m��n�At*(;K�C��s~�&x�t���3���ՖW�J�&i�=|�7������{:�S�΅���ɧhZ6D��|M��5��U
�_���Gdɞ��lk���ħ�������r��9X/8GJ+�ဃ/�d@��v!ա NE�f/J�Z�iB�+�~}-��FtQK��/���yb�"�ZE���d	dtI�%�Y�]*8,���k-12��4��;��ì�ѩAui������=u#q�����5>��.�|��t�y�\�|um��p��F�N�ss�S�	o9u�^5�]�R.G`��\>�w=R�%vIί��rv�H͕rc�F�ʭ�Gb�ب�[U4魲�D�B3�R�PJ�1T�-����ʟ���&a������Wv�3��}Hş��b����0�Mfr�\1�z�ΰ W��oH�@ہ��4��N-m<���1_Lf}̪U
�GZe��	]��+D��@����h	��I��ٹ�at���3S�N�;3�i��Yn�\]�\�ym��څݺ�:�Rf���&�l��u=Ҩ��4�)��M���0�/����׌P�t�J6}}m�b'�'�T=����W���7����	����ٱ|!�N@z�M�x���s�Q��Ge���`�{|0�&ܺOy�<&�:�\!�I�p���H��%!C���c4vF 
X8:Q�z���zXYlqo�Α,�(��ǩ��x��œ08�a%���
��g̳'��=m�H����ؖ��}|�+�(�ƌc�+��}(&��Õ�		�O�A�l~��N>Z� �-���D<�0��� ��=Х��F�sM��?�gHiG����/
K����)�^�8�&�l0=��
e9��I����ř9����d�|F���Å=2��1����f�ܺ^kT���by��lG��
{�w3��Z�k/�[z�-�-.o��XZ� #����q�Tl�
�A�~^���-�G6Y�˪f"����_�d����z�%hK"6�O�|������tM%��,� ����O'}#瑫��Y��<���kJ.�	�H�p���d1H�0�&&C6N懍�^��Y�C�nR��h����*ߟ�b�r����F��ޮ�uII)���?�q�t�����U��du	ә"d�{�CB��`�&��&�7�ֶ��A�cs�a�"xj/dt����9���1)�(�ढp��Y6;V�(�a�`�	H���5�q�N�3q|��#�����[(d���t�vy���<7��(n�*�S���u���f,l3=�jq�Y��9~䶐B�b�W�(yƙ�V�۹Ѿ_�ܸ�m<�D^
�|>���-���`��-@�'����>R�s��h)�I3c����:�сeu�1�<.Z�-&��ќ���<R�]<q��Z���j+#&���v(=�����Q�QRP����� Q&��9��0���Ka@��r�Ϻs�I�G�|�H`���Ь������P`vbnN����yP�B�D͋��$����T�m�:�U@熽2�Ƙy�A?l���@�&m1��nIdr2c5z���ӎ
J��|�o@�m'�*A��fp�W�K �K��x��iV=zx��,��5S���˶>'�	���򼜻�\�4�^oT�Z�F��f3�源�|��]prWƓ�4HI��-GM	f?��WE��?7����2�˱r5�[�ȿ�쨵    K�P���u��G���j�E�2K.�{�����=~PC����B�Q!���-��$�eo�#� ��:�V�K��at��7�����ɿ�o�F��?��ڎ�\�'�_�Y�Լڔ)X[&����ӳ�_��da����B�5�֖juO�t�M|Eq]�o+�l��Zł�L�Q��j�H&��p"ac�op(��I�*�0Ui��v��21�\�:Su�Z?[M�\^?��t���C�r�Jf��
{��8Y��*wO#�T	�J�:�y�$���ۈ��Uqr�r��	ؕĴJ6�s�ҵP��J!&����e�@����^�ỘM�e�5V��������5r����k(�>��Ct�$hP�|�*�.5y�C��Jg����6�B��i�>� ,B��k������1�ڇ�i�%<J��y��̓>��������{��AM��Ĝ��7<yC��E�	����]^����P�ٹ/������o���Z\��u�v'A���l�x����S��n:Y-w��;m��N����f�j�/�"��v����$�J)��ǃ���87w�br��j{䳖�^�� �{�;2�`�֬{�zs1�����'=イ�i�T.�t�W,8JE����;?��y��GW�"t����ŵ��6NO�M�c�68� 
�)p�ᐬ:��~c�[/�BFcu�b��u��T�bT�lc�lY��.7�`�C|�ކ�X�s0[��,�v<�nk8S���-,9�#�ն� ��#�"��	��W�Vkkg�Yr�|cr�ڜ�н|a��Jn�N���T:Y��Q�#5�u�� �D���|����G��(N�K�3JΣ�H�y�����.�X|�~F�ķk0��}*9�+�3�Gڬ�NF��|-�IHA,aa�r�n<�idJ�br4�*f
�G�4��Έ�f�+���>p��qn��.΍����M,��?�j�I�ώ/=83w�f�[�PJg��|NA@�G*�?A��>���\?8�E�C�t����E� G� %pBI����� '$V�;�`�ۉ����|��1-�ĽM����k4���RN{Y��/���{K�I��YpA'�l��*��l/H�o��
�}�JX�|�=?�������sv$��]�a [�D�F��U�z��ί߲qWXL����0�+/!47��~ý�gd��K�³�'|OҪ�O�e	ik����NMM�bʗoiR%���;�fg�}SːGE�$�bâ��	KD���P��߂�`K���[0d���>^��!.�%�.��&c՛G|�~�w�3��ĺ���d8���a�?M2@�����&����S�>e�X:��E~��l ��b����oA�-�~^�(!4$bK��II����y�e�`
F�P�h�z׀��q@~8���U]鉇oyr�H"

K�P�^��z��C�m�,���X+��JX�r˶</ɪn)W�X#]0<O]SnS��nQ����!7�R�	�&���%�_��D�,�g�y�l9�������h��n�0��6���h�g�RB�'1�A��2-C��hv^�gjPJK�#F����I�������(P.}hoԙ�A,q7�
{d�4�G�܂f0
�ua)�]��%�t�ѾUh� $]SÖe��BfO:���?X���A��A��d
���m�`u�ǎ�ډ��.���%S��O���n�o{^	Y)Ҩ���6����Kx5�<�CR���\��m\PQ���AH�8+���	��G��q}v<+m8����93�������4�
���׉�R��āu5���$3^���$����@�!���T A�ⶉ&5�ЩV�\����N���.��+6S���8��n�p����$�a	}ʓ��f#>�p�1eYB�Q@u�>'�6�®��X���Tf�kf�����q<��	�J1pc0&�ku�]�����=��Qc�kc7V��l�(g�nz��N[�lS8�6�J��8��ɦq�#�)�R�lZjG�0�q��*z ��1��ԗ����IX�7�Wh�ܧ���F�^��� �F��;�:Na4�p�t�A���.�4�
�P���c����o&D��
�#�en��m�-��͍Mi"ZW�a>�'יu����.[2p��`_��9��PQ��`�s�a�R�+`C<$v �'9���2�V�����H�æ|��{��A�X�o�>�K 5X�!��Ь4e_ZA4��\�?�o�_
�P7��ߌW����תymm�����|~W�ᒩi�0�2���di�5�(*��N�Yç4Z̈qB:��*R��QS~��͸Vn��AI+��Ȓ>	r����}��>�]��˄Ή�����ZG�c��u�Y]��n�+w[�n�:Ri֛����:�a��oD����lW/��>�ONXh�4�Z#�lOgB��K�	�0!g���w�v�>8�q�U��������=�}�e��NaO0Ę]���~	KC��_�4p��`�Qd�رBv�Ö;<�̢O����4�r�ᵂEc7��ЂOZ�B�/#k��J	�?���d��-_��J�7`q����G���ll�3>��1"�K#��!k��u�j��[�CH���g`���Rf^��%��5���Ը$��TG\�_�B��W�����.7|���V�r'Q�v�#�z}�{�߷	B�a�^h��xY�x���}h2	�[V�Ş�e��β/@my1 :u�T��-yX��&p@����-�}��t�����KH��� 9�3%�օ
A'mB:1�ǣ���J���Ȇ�\�W�Qc8���^��M.��a��%hAx��r�76�l�%�1)�"�e!q�~S~YuE��G�x�Y��M�$���y� �g��ǑYtD��2��qQ��M�,֣Uʾw��qH|��.⋴
�BZ)��<R���Oy$��ɐ��2�lV��H6./j��TQ�GUЌ�@�	�o���Í��G{��zݛ�oL�'3U2ߑgrg^��r�V77�0�������d�P�d\������( N�<�+�il���)����᧟m�]���f�)�Q��حԽZ�+�*	B�0�*|��t7ZۺQBPj��9	�^ʗ ���Ƴo��ѳ�A�槜�R�eԵMLz�����f��}ܧ;���㛭w(��s�#�;(Q�+.����j��#W���c�xD%(o�
���1ža*^=\V%f���%��G��^	�c�
Ev�yD�.<k�Vs�#��n��>��
T
c%�r.	����g��@��@��z߅)�q0���;�����e��<�p��*���n�6uZn�3>�����f��:!^e��!��]`(��9��k�Ep�	��x��f�v�Cg�z�>��+��R4�����V�PZ����
�PS��P"/6�@����n��H1�7�N��1�M}9�s	Z)�Z�h5�MI ���<J@ޑ%��8���ڀ)3HyS�������z�Z{a����/�E�$�$|n��aM#�#��6���jhvjUo���Џ>�W�����_�P��+�Yk�ĕ��W�	cU�^�"�ҎF���&RS0w��.��d7	�x�&2y�����Kn
&2��3v�$q��2��:� Q9�$�{I���s�j�!9yD��q%�Ƣ/��:�r�:�¯X$��D�7�@*[Ox�@G8t;�.z�s� �&�u�	����� �2ٙ�^��5��=)���c���7H����1��<Ϗ%�
a�!c��m/��l��Vja���oyn���|X��o��g�v�W����EFD���r�·�X�Ll�����1�ʜ�(�����E��q�"Z,\��k`e�W��T�8��f�����;�e]�~��ø��dp$i�qg|����h��|��Lh����P3n�M��W����u`(�q H�q�F��Nx8`3R; �0����U���`������dzGikJ?Ǽ&	X	�z
���[��0�Gl�~h���[�h�>��R��H=�>�R*DB2�!��q))���U�qz|br��n"A�R���� u{&����@    �"�g��oDB�+�YQ@�t���b��G+�+�����	�6F�o������X��H�8P�w�?��E�"%����C+7ZJg���b~T�	Mz��gW��Zδ�xf������t"�?���a�����c>��o%�\!���E�#���Is��M]:��ڝA�i|�^�0�+f�,ORJ5�O��u-��ŭ�ϕ٩���5iь�kx8�d]"��� $�����H�D�.2��D�6!�`�d>��M�i��&��&IF��m�����-6����(���6��%�#<~i�*$���nKر��X?�A�s?���	����6�q)��;�a
��WƯ�N�������;(��k�����q`��5�N�^��ֺ"G�+�1�P��Z	�+i.z��i��֫L�ژ"���_���J![>>uU��>���}�qb���q���@P�ѩU�D�"��:����`n�����|m�u��i���m�p�5�C�epw"�ʏq$����b@7�3+���"E���E0`{(��tꗮ�(F�@Ӛ�+m��3&>��1��z�bt ��a�|%���
Fa��f�:��Y�I��݇�^k�րk����l¶%�O9�2��N��*_5zu����{t�����t4�����x%����8�Z��rE�S jx��+�������Iu��6#���J�D���$�Rx���ιz�o��n����lOHS���f��e�7/z��w,)9 M#+$�[q@��M�l'	����4���}��q'�����j�BW�^��3��5���:��I����ǝ���
���o��o�Ns,9I)�dd��Z
��{�=���Y�s�s>F-�������ȱ�8��C�������>������ص��+�r%}�Ƶ����y���X2;Zͤ]�T��*��SB�R��������ٷ]��}�
�I�/�[>�/�8��/J�%�-R�	��;.n���s.08T,R����螓�6��Tf�-�z�\�R

D���8H�E8Ė�H_ �'�q���;��g>�#N���1d�r��fg'��F����p,}b�\k R���Ky�mA-�	K�!��@y�v=�)��{�#�SN� ��0SJ�M~Y�������X'Jr�}ګ���W鴚+K͖׮�����~�����1���7������
�!u�1�(v�M��[;��Q(K�����ߴF8��*��;��E�"����f �J9L4�11�C�m�X7(3	�l�+�f��N�F�+�n��=��bg	�m�V�j��!F�׌FH��`G.�y��OC���4����d�mqC�|�μ�����x�����hi�/">{\J�ĳ9_�-y�:Uov:l%UiɈ ��+�o��)i�b�E]������ uϬ_��ˢ�H���!"�������G%TmĄ�cn�'�@߁hSf8p�P'A�jc/{�2�vޢ��Q�*��Y	*}�2_}u��e*��TO��I@e�Я�o�ҵ��#�1�D�����v�,���b�����9��_�W@�,[�4������+F�0��}�"PK�	����R��=�m<����Ŏ�l��W��a���f_u\U��+��x��>�ź���Ae1��tvؗ��\J��C%f�_���͢��Z�,�-�F��T>[p<Q�������7�?�d�8:VPsɥGʰ��(������)<�7�c�N��7���V'%b#(1�R�z˵f���>$�!�(n�*�B��#�VAND����Q"��vy��m����bt�'���A�x�=���
�W��]	1%@�O�4���K��;�;<D�r��)��ALl ����69�Km�W�bO@@����]pEe�4饹��E->�=`���f�⹂��*E`�5��*��4���=h"k��U������EG߿R~'Ϟ!�5{��fH'X�e�|F�Qp6L��� hg�#͐�U��ȶ�\Yk�k/�v}� �lX`0gG�X)GK�!���d�X�}e���	����7��Sy��9�^pi�	�T�v�43G~�G�h��`�ʟ���t����gͼ��`����+�u)#��	󒝲�1���T�E
N����#��i�����/<�3�����D�
k>l���$�6�aḠb��s�O�[D@���Y^�8&�{�ak��[�8�� ��ɱs;&D��;�lA)lI.����\�{��e�����㛭��_9]fs��x�VJ�;r�������`�TFǅ��	x.���S�U}�GV����cO.����w���>$}���a[o4@EC�:d�������+{�\��dL�������^�W��(��,l�#6�L5��`�Hgmm������Y�8���3��h�Lq=������T��MfR��B��Hu�p�BJ��ɻ�m�f�{G���b�ƍ��|�q�,2�� yڂ�շb�r��=d!�v�j�&ܤ�&W���s�nu]�|�T�6x��yH���2z�kȒ��!�q�/�Js7M<7^�%L�(İ��r}�S���6�h���h���; �aP׮���7������Zy2!�%��7���qŻ�Ud�T�Q����y�S�W�Vc����ڞ��.p����]`W��G6���|���������,Uܷ�	qnz	���qKC�ն���5��>�:�X�{(1��V�u�Q�b��%oL��W�U�g�1���VV��R [~e#�2J�逸��u���Y�t=�QTӉ&��%+"�J��e;�n> /y��-<�p�&��)�.�� DC���Fì�O��ԻZ�.P�b�'�K�V���U�!>U$�0.w���,k�O����D��i5뢓p9mtȸHfb;8�9����sud�'��oN�[�Λλ���`�>ic4���4٠���&�-f���hEaK�d�!�h�XHh�l�*1
��/�V(+@A�^��m�*{�:;i���0s�g��U�141������h�C�t���Q�A���靖�C�g}��Kj�앀Y<�J/��P-Y&z�dg�A�/�UAhv��e��S����Bz!_!����[��ֵ�����兂!���N��R*�/;-j��G��*�Y��e	2_+l:�e^�C�>[�gS��:��2/����$Pd�w%�3�t*9�ˍ*��*��)�N��L���˸���X&7�W��:��	��~�= ��jp����L�P��>R'U�+�o��<[ʎ&3���h��H8>ii��;I��l�jj��Tc*}�F�v�Y�,��z-5�]�:��{,S+�]��A�C��H���?K����;uX���Eܪt7o����7ۗ��/�����Μ�n/�f��y�S�9_4�G3*WI��y�9s����VF�d�*�3�n}��-���qR��\��[l,߹99b�Tg����X��H=A�RD�s��3`&�a���L���j��>r~���dv���jv�z{a����3Ӗ�J٬?��6���:��C<��Y<���K�L2Sͪ�>QG����c���t�`3��K�\2�/f��N��sR�<-D�c�Gz҅&�C+0(��-��6Ms�4�3^�1L����mV�!#�ݙ^�_�t��0O�BjL?ȏL�L^=��_��oX��'G��r)UzK��k��^rVE��K��7 �������;��s����F�#�ۉ��8�eB:�`ǐ�;U���H�j2���Kw�,Ӽ.����|_�0� ��Q��]��0�`f�#,�}XK��ėdd����O,�7�kΜ�p��x���E����P�x�+���yQ-[�҉d�F�� ���=���
��Z"�� �`�{�:>��X�ܺ��V������8&�d9z;`i0�L;�!����3���њf��)7�FF���$)�x(�^��l���f�sFAK�)��d�?���[�����ȉ��3xJV�t�/����i.��(�7�?(! E[�D�`    �C��[��HwX�*�-��ll-0J�Nuۡ�k[��U����3��I���s��A�3^{i0�{��0|X$��l2��0���Z.NP��c	�q�$��%&$������j��ұ�ؠ��B���1���~�J��9x��9V��V���!1�l,��]�
�*6�t�`�2=�$�����,�\I) {Sa�P��V[��S=3??��c�uk�����E�0$��膸��7=?�gGT�Qw����?�{f��z(�{r�/�����=;�d?Įݢ��c�f�������:3,� 7-��&&�P�?�^˪ǣ�������Q]Y���_q��iR]R��f�#K�т�TW)哔��L��D�*�0�P��'f,��؃et���7��'��߹�{)���cʁAz�}�{�g?KX����,@.��[�d�&CR�!7wܥX��r�:^�Ên) UQD�q������oj�D��H�R8˓�?���En�>�-2�ELܾ�et�X�H�<TH	��̍I&nmjŌ��À�������$I�rڻ��󸦣$f�#a+�L'�a��g��B�n4V��0��A��#��l+2�Btm�K�'@z�Eu�]]��6o�3K,��׻�����յ�ݍzy�ޤ=���3�b)S)��[���ʵB�t�2̒Yփ詐���ŕ�d-���df�z��A�����N͵�ܽ�i�VM��^O��_A�~�Y̩#g���l��\<݇3Ae&$E���Qp�nwY���:��+y�}@�*��f�c����$(r�#�o���o�( ����^���T���丝�Iv���P��X��r)^#;;%>�j�0~��,�t�F<T37^1�������%�}��0��p?��"�Ɛ2�Ĺ�������?S��ѕf��� �BH�++N��|�.c��rS��kp�F����QX��,�Fm=���އ�,(�C�_��E��S�h���^ؑ���0c�jYD;'r;���GFW�B�7!����+'\ .�}gu��%����Vd��钠c���b�}��14"�R~����������wO�`��fy@x�V�3�:��R);�^�Ty��Ka�����'��~h���/m���讁ᕀ�c�����2�#�}j���-�u%�I�Dp��0��Ł�Dֲ�?�.båO?���ǘ�I�s��l4С������r8n�DY��o"�!���:�!�i�KC+�ȥ�Z�3�k����Ņx��#�p*�S+�ss�����	4��6Vr��ma�ʲ�qT�����$x�S���]�b�> �1�S�����������"�wL�I��wG�����Ӟ`��xL�G,���ke~uI� $���J�ԉ}[�xA	Vv�+�G���y{⅕q�,�0 ]�Ĩi�1L��"�-�O�����w�!��S�[�>}!�c��%/L�ϯ����W�+�m�p6E7> Gn�}5OQ�:���O�����̎hŬA�'�[I�;CH��{<��C��Z�P+d��\�c���Jb��fTx6��
�Eװ�K����)��Az��sf����~�ֹۃ��Vynfkf����糵L>]ʖ�%�4�?�$����0|��P�������������`��/�s�\�꽥W �Qϑ��Ng%L���v����.��1�l�����4�O����sR
y�)�\Z�'�k��yG���X�x��~i>��H�"���'��a��}��(�Oiy��E��z��Ǵw:O�g�$0�]�1�_�5c~o��	������ �;�~K2���>O�Z$n%�؈�"@ԗS贷:3oc1��3f&0,&$��"��\�'f�}C3�F]x�Z!�"N�75����#����c`����Ԏ}G$�F6axC\;'��=ʥ�2S��u�� #��Y���������,��Z�z{je��]op�xS
�.��tm|c%�����:\����̢A/{(E�#�_���V����������,�uiyn~j�}������v}'��������T6��w��z���"w���CNW��.JB4s4�V�I�-��.����HbOd,
�O�ٍ��]Y�]A�ӗ;�m4�	NO��7���=�]�鶨�q�MZ�4��dke���,��Gtayq�f~���Dh�lZ[��?��{�O}ev���96�t�(E�^�]�%�seu����~jO�{L���������ҥ%���q~����7�Al����>l5Sc-������	4F&C��ܭ�z���A~�h�Os��p����z��p�Fl�F3H�MKo8��+4jh���U:�G�lM��͈=3�ޠ��s�_�p�{�1��	�nch���.y��?y~3�2�u���FjL6��� ��/O�����d���)���g���c�l�
�I4�����*a�s�����v��ү�Ṛ�A\����e�Z�7�ؑoqD�&ϯ7ۍ����Nj��i��c�G���Ơ��Ŋ������(��N�5	���z��loQ���1���g/QU���Ka� �);u!D�f[Rg��RW0Nn��3��致�����f�͊�Tm��iq���Jv�ִ9W���}�P��ǲ���Xe�;Ʋ.�����F7i��v������5���k	Y�V���ï�SO$��oX�?�|��;�U
E�|�;Ӻrs��{l��Au���7f��k�b�T3(TKF���
�J��H/U�í�+A9x��~��,q��^7���>e�ag#�l?Ԣ�8�~���T� �%��U���剢��7$o������|$����Dz�0N�y�خւmk�،Q?C�q�9�Y��j�X�B#<7;K��gN�yWA+?X��g"�H�>��DX��ՌՊ']Z���	��N>M�n��X0���#��>pSY�FhqqI�)�a�X�Z
;$�c�*<����&ڲ3��C�+=�������X��5���6�_Пeg�`3/�S4խolcՔ�P�'��0;@���u?B�gB�9��c⭕�N�痌5^i���zKʝݞ�T�%�9�g���G�/3���)�G� �Z��[��Y_oX�(�Zs�k���e��>�?�<p)�[��X�܀l�LG�{<�(\@��� l��KA�ՙ`:�ro E���>�J p��#���E$\7�T�o��9�����T��$�z���|��	!�dp§}@�����ރ�N��k�ͼ��gQ����_�r3�xbKɐ��
�Mu�-�,���4"�����O`T�YT�W�jN�3��C+���&`���6��6��0F*�6c͛�yoܴ�Y��/#!��|���o�FTއ���K�+�*������՘~}ev����/ǖg��ͮ�^��]��83�+t#��9�B�Q��_�Qj�՛��י��6�!�=�3�m_@��e\
v��=ΧH��a����Ԗ(=�"����x�][��	�v}���N��ѝ[A���#�|R��-!h��O]F��6M+�\(e_��"K0�m"�ʧ���Yq��5k��?��*��O�$�����hS?R7�0p�+���t�C��.l�w�~]���ūZ��_^�������W6�W�Vȑ
��B5��k�l�V,��ռoT���~�t��@�;u6�-�=�%1~@_������S��fɩ��r��S-S����h��=�M͙��u����˻���6���[�V�z��n�}�B�Wu�J��,�ek��{Xʕ*eۭR�Z0̅YZO���
��Uړ�!#��{*V\T:5�JuC~���p�(T�x�By��-���\�b��e�ղ��B��$aY:�r#Y�Cn�!�H����V��9{��|�J��5���8�U�k�L����$�?���Ѽ�A_����]��3�(g�ϐ����FUE��I�tBe(�v�#��ʧjJQO��QX�mu���EN�@�k�������g *Ȉ�9&�0E/�Q��^���[CR��m�IC�¢:|KOH����Ț��yJ4g�"&LbQV�v�"1I.�s%-�    ÛQ,�o��mA~)���HG5A���7�|���n��ӝ�c�Pň��p'�z�0�`Q	hD(�<�m�(6If�nƱ�@���2�@C�ԕ���x�-LSz�5����3*�@|N�̠��+k��Woձ03;�Qz#n�X�g<iK�����RtX޵�ß��"�����4��"��BJDcT��(��Zs����`OŖze��[/��^�؟�z�<�f_�!"�~�����A~49�N�c���	��Vۜ����cS�[���2�� 6�>5,��Dl�'�V�����΅��ٹ�d�RG˳�I�0��0���\�E��lT�i�xJ1<Qfjjk+�Hq��E��͢F�k���	��6O���v��3?��gn!��_�WFd��q���`>��j�S��~r�����`o& ��78��,F����F(�	),�#���"�;�̡��ˋs>�r$R<��V�s$�'ǙDV���`��+�Q��
���s�H�F?���l貉@��`�xj�A�f���t���PD�S/e	����r8+��ND�~I_�(S%�z+�q�Z|�z�0{����V�㘽u*ڍcbOf��=�Dq^����c�>����ǹD�?D�ca�fo�<��c����۽���v6{o�p�;�z���+sK��9�q:C�����j���(���,��/�Y�8�}���V\zk�����n�z{��?�ׯol����unz;l�.����j��ܠ �@��*��j�B�XMW��L.�e�X9u�`�v�/_~��Ț�_;ANc����U];�~�n���V��t	'ao�h|��vЫN�{����#@�@�++l`f+�l eG1?��_���?!-T�Z`��tk����S?)���l�սU��H��vAice������������K��j��l$�E��K�̤�l����.�P��O>�[�m���A�qx�Ϯw{�#`#��TI�fp2׈��Y��*	Ӟ��7]�p����}��	��)		�VH~|��IQ��V�[�q���\9K7:�x�,��&9 �)�Hx���(�m<�}�ހk�P�d�#���Pi��"g��P~Ay���N�-�i�1r��3�ӫ�/�"��yzI��8���NЯ#|p���nlm��de,��o�[���=�h��w�u�����v��x���`;{�ݠ��� �;���
ߑOuϯn7{$�egm�O�ȏ����~��n�dm���1q2�ɱ�ךxh4�.�=S��I��g&������d/7��j��$"m��>c[��bm�����$}��J��G�	�w_�Kq�}S��ɾ��hty�jk�gP-���)����4!Hp���xY�DQ�'�y;��&b�1��o��Etk�:���c�^)���jH�k ;l�@p�$���e�Ìx�Nh�*.I�����eQ[��~�P6�H!KQ �'?�`��]!��V�h0���ݯL�ѻbk�-_a˫0_#W�쪂��/��S�Ґuo#�z~�qz�s�����ƚ;�3�ot��P��	�<Pc=;����</V�+I�({���}$'9{�G 9M5��8 �;���B����y�Q����J�)�ܧ�^�p�#A���Q�~��A
W��lT��*OOᡥY)V���57��9%��jA	�`���ϳĆ#e�'�TT%	+��`j���K՛�.]ʳ����\����73=� Y�(Zk�4/���r.���n
��)-�H�<|H��SQ�����Z�����ho������w�YY_�Z��^�2����T�Z�䋾[:�9R�J�:ƛ�t5~�Ǭd�>h��O�����R�ɂ�_ϽS,���v������ �j�\:W.+u��[�Y�v&â���"�jn����hu:��SNs¨��,�]߸���`ݾ�V�It$x�~���6�}��!7����0.�P"�-�C��9�8UL�<��f�qyhI�-OB��p��0c��I�Ӭ"�1��U꾙'e3fkff�������H�TE�÷B��R"R��M��`ˬp�Eu#%�%a21���iD�qs�c�k�P�}N(���[!�K���i˸',(���d�����t������!�(�
����	�K�\��l�$�.�?�*�#��i�:X�mu�Rc�:i,�S(>��Y��������i�	1K��1���R��>�6p<
w�!J-=�[��?!IN�9�˼).4{+�A��(9��� PpK�>�rE�rQ�Rrl���-�-��C7�׃v���>���˗��`��w�vl�����i��fl)���@ ^�u<1�G�M�u#�t�]zd�`i�%]7Z�
�s�ɿ���b�Fz ��_�&�P
��'�.��Ƌ+1�"�����H�mtN Rg�&��9�m=��ϼ�?\?5�d3*�н��ʡs�Ρ�c77�lǴ� w���$CBo�]�%#3Џ�@��0sc!={��;�)�df�:���F���$K�)�uY�R�V��J�P��nj@�ɸхVp{�s۪� �(�{�ɳ(VK���j)�P�6P�F�NS"�A�ﻌyٯC�����áuG�5��(�/��3�8l���c���g�^s�=�o��?j��[ue�_Sux�S*�b�	�\Qf�:|C��J����v	,jߗ����5,�o�2��Gb�����:���.2*�ui��`�ۋ��������0n���ޡa�%`����Rl��,h/�D�y����ʑ�(�H�b]/( ��3�N෠����TV`��wwnL�
��/�*�"K0�-Բ�t�X�缷��9�B�-놦\�V̐��R�����	�{� 0�w��A����6)'x%��m�y�[�;�k(�2��f/hL��v��4�d�A����������<���ϕ�[�L��7X!��]�IE����4�S��\��}������F�1�϶e���m�Th��ewf��\.�/����V1]�Y��%���hX�0�/��4���>�%vr(���O�z{�l�'�m$�׫Ti�k�aOŁ�х"��P��%�'�kE�O���mi���i�H�!X٩��'P�7�z{=��<p�fo�I���и�6;-��
<=��*&<J˗��ݝFk�w+�g��z�,Z�.^����S	-tA�F)5\�ͮ�Y��΅�=�/Ό �h�#�������(K;�)�H��IC*;Y�ʵ��"�-)��mc��zEEk���ğ�6NI��1��}����iޡ�1u���1!���!Ӑ<L�V��yPT����Nߛ��2���	&E��f�U�mV���s��Ho/	���]�o���4���/9��Qy��!S�5�ľ�AEL0(�D�r<�9���N�
����t��xe8� @<�;�ۿ���Q���}qQ*�H��	(Y��g̃wL���TKwD�V��9CJ�4�V�[i\���M�d��IY<)�����麗�E��tm���)�x�K��h��q���yr�8�Vּx>�v4�jx����n�A�M�<������%q��
��rD6�$�����q�R�5N;�#��S��,�e_�5������� ���%�s}ʀU3�<[�s���B�a傴��,L㩐��+_��S*}}�Oh�|�Э���`h��4�y�F�LP���%q�]����a����^6�Tc�Ң�^�me�'���n���{�rN�K��n#�u��3�S'��ׯ�Z(���cD	��p���(nuF�r��D��Ҫz Xg�����M;��`��u�aQd��K�$���]M3�,��?�η�E����Fp;��n~1���X�w5q�A��8��Zӭ�݀y	�>V~��b1�s�� l]�Ymnk<�1���P�N�.�ɂ֠�Ɓ�9��h�C	��x����s�:h�4��3q�c�n?�濫*	�+ɧ�y��
���gNO`q8�p�G���(�5�ڍ�i^���N�j��A�(!��.��� Uqy>B�L&#�n5{���"�0�d��=������^��	��(�X��5�kduJ�!3��1�Oph�s��m"{�    Hh|6�t��|K��l3T�;2����5�|	�46k�A������@�����l����p���!Ô�HtM�����b�~I��L��D@�OU�$&/�̴g���K�������*X��!9_Ӎ0A�o�0)�b;4f��\��n}�(�󊤺�v��+X��
LL�b��#cدo$�B'�A���N����r�5��;��m��3���g�Que���i�.�~E��C1�C���v���v��Aۻ����&��R	�����Þ0BA�cY�����e�YP��G��v�%�I-��%wvd������ ��������D��nz�m zyeq����i�ײ5H�׾����&9{X�&Ht�9+uK�o=��!6��-}����-"}�f@vS�i-2�e�B`e�1�5"���m��-����G� K�òE�|�z��N�
yG���[I�2�� ����cA"���=p݊�f��4o�S�;U�d
He������"�A,�z4z�K	��s�v�6�X�{L���C��;1ې��w�u`W��!=U{�>��l����O��#ucb�c&F.L➊���>1�d��������%� <��+�KdUd���^Ҋ��Y�e2$|+[.�%�-�KZ�^Rɇe�=�(�v?�4wJT�@�����Y����P���{-��`�\@29�����%�[V�
I��I3�E�8*��(![��L4q��]0ʔN�������۝E��Y���s����o�l��I�����I�4�P,�wlIx���}I8v��Ⱥ.>i��|�_�~iju���~,Pe���FrR& Ύ�����+�˭z�����)�b��)�s�l�\��2�e�m�f�pʧ�<����܊"��:��X�>�3�+��Щ@��{b��B��4� �6:ր.�b�Q@�����c��
ث?J�!pُ-�@h���c�RV7"dB����p�r����(��5���!݋r�	��1�)�M*�b���ϕ�-k��e�#B�s:��=�u�^A��Ǻ�>���ۨ��8����6�%R]I�Z��|x=ӹ:Wڞ���ˣ"_+���B�R1�nxK?E�S�N�,(R%��H@ִ�H�J��*�'jwΗ.��������&Ac  ۅ(�I�^���]�P<��O_�EC��Ȝ�c�8��9����<�?�lE���nʲ���y�[
�����y��6��=�Ǉ,��!��S�����Q0��nb���'>��.�D#�R�?��s�h��N�����яGZ���I'�t�0E�*t1`H[��Z��0�7�^���W�aP�Q�w�P9:-��'��~0��%(9{�ў�xذ�#F��i�-�c��i��X 	���񇄿��~!Ѽ[�+~?m��ԓpm8����qCB������_�:=Kݖb��+4Kڣ���g�x�o�E�#�?۰���)"hȑP�G� �F� t��ocj�5��oJc�	�$@+z��|&o�f�`��"Bi旡������;�N��HI�}��������Y8�#}��~Z���h��^r)�Dnykx��F�:��ƾ8�*��5�Ȏ�H�B��{\�b�N+{�Ӗ���e���˃V_��J�[�_�z�b&3�]쌧`N6�[����#&���H؀t������`&�/D�-X���E��wB�5�&�ö�Jb��1�Fj��&x���5��~� �4�4e���PÁ�X[�!�#��)9UY�f���|
u�|k�5�g�Kp�W#��z�!h'1��r��8##����[䠦����3�7����7�����a��9,𙤱����]��(������G,+YioM�I\: ���Ԛ?�	s*$��wd�&7AI��Q�ʈ�tH�}��#�yG$�2�-��&8l���AKjC�WM�A=TU�ܤ��rg���ʷ>���z.�hDK��N ɨ�7v��2W�����~0�r�>˨G����0��FM[U�x�+���;9%Λ�� c g��萫?֍5ɬ\nל����5GL�@젝@�=�"���i<T,�t6��4�ȼ�ݸ���אE��-���O�����Rk#���Nu���Oy��8q�����tn�-D\"x.��XEo�b[�K�C���j�y�\K���ԡ��G@�'�L��_�5��r��HbeC��Ci�t~8J�˻ˆ��NS��ڪ�yn�(	ڞ��\:��F���������.�	5�\� w�]C)&zw�__�n1!j:w��><��=�-�w]�o�K���yš���_��W���%�.�1�%@V��$ ����z[�Knt��PlF������o��3��"Ffq�ph]04�9�����M���vC�v6G�H�V���XZ�>�D3��O���Jh0�;._Dgu��%��|����H�Haz��
��o&8����^������'B7�aQ>�	�f�XP��rh&��9+�V��I��{����l��{������bw����B��O�ʙ\�>���Z�0�0"Ч�����2�������#��Cz�D��>p�zK�8FKa����3��q����$�ϘP&c[�C9��s�b:W�Uex��.g��ܩ^��#��b{�7.W׮-�;��K+�q�?e�~�j-_I�r�BA������L��������t�+i��j���Wk�����N���sH�<�R�|o3q�^� ɐ��t��-T����V��.T,�IuR�U�{����=���̎����ӽûA���+b�\P�E��쨼�w���G (��~���&iL��65��hJ����Xv���ؗ�/FE��Ag:�/e�%˭B�X6+�V���/���XT0:@���v6���F@ع��<��_�[���������U�������O���o��^@� �B�g�Ef����v�u;���N��n�vD��O�4��+�ז+_�er�b�\)-���B��J+��;�.�/oH�O�"|@��oe{E[!ܕ��)�<�N5��xt!�{f�����}��D�x������F<�ʚFR�6�8�IU����������u _�&ݻ�.=j	p�Im/�"�P�}I v�ڰ�����D�V����� �A0�]�$8_o�J�
�
�/�	�E���
|r�~1�F�0�CXr�5�ܡ�$�%T�|l�޲��ђ~#b���Zt���<,m��U����ȷ�g�؃��Lk���Ѣ��R��93�YA��f�6��L5��XQ�l"��o�Mi��Rv����+�3�|QҴ;1Q�Q�쨎98�8u[w$���o����h�=�lO���IV[M�I`���@�WY��������_���1������P��L)�t�H��B3v�(��A��RЧ����������(�f�3�m�%m'u�1�&fM��,���'?e���_!�NVCnnv5���0�>����Kb�!���	��r���k�V�O�ʀ8Z�x�c��A�7��� �kK(u����-��[�~���n'�9�,c���&�b�;��Q�c��;��yx�}�u�˰�E�6ӎLqG����[5�Ӛ��:�`ʻs�#��ҟeĎ�+W��Y���A$���-{���EL���b�d�	���C'X
UHq�Ihr�%��&�'�MJk L�},�߇2C�\����^ UG	�+��fm�.�eLz�Գ:�4t^M��T~����إvwAq��*.��@����A�c��tS�+�g ��u�bOu_p��񃨖!M�Y������6��� 0Y=b5X��}���J�j����υ���~���?�=#�U-.9+����ﹰ���ք*��4�x��.w@W�ʧ�����?r��2�d�O����*6��w)~5�H��S�?��i�v9��z��WG�깊�h���ղ�������ym�5{���ԙn?�	4�j��V-ڂ�����1�/��1̺J}ȷ������>�񟅮����yM g  ��Yf����d�Y:O��o�-�-�׽����yw���e�����ۻy�FؽԭvrԖI���I�X�"���3�bU���Y�-�2�Z����f���)3�Z�Z��1�.|_����.[w���%��U�D���+4舤��;�m�SZ6����8�U����i�+�]�t��B?�vv�ш�䶵�T�7��������BچQG=+�TX(XI2̯������@io�iO��:7Y�|�im���R��Eִ�@����3f<�325|#�V(O!�!c]��(�ƚZ�l��i������b�0���3A����U[�y��)�|5vjWm�C
8����Y����*v��~�4I�`5ꭳ�So7Ps�n��Eb��Y�.�Z����`�8�X3�R-[J���LY9�*�r�PNg�e3�#�_�gb[������]��~F��G`K}!�2~���DV��s�-���B�{EW��Q�Q��3�T'^�r��ɚw��t��3�L�x��\��.��/�`��G�r��C��s[�=���Q�9з���J����8��:S��u(V��\ռU̥�E3����h���.��㔝�EXL��s���	X��5��)88����Z��J���8�UJ���<�����[X�
��MJ2)d8
ֶ�48'�������ld�EI��sG�){ V�ͭ����˵L&]-
��ˤvp�`��)���;�Ԩ�	��~�t���H�^������Ծh1�1�D�����BѼŞ�Y�ʹN��c��?
]��&8o�D����j��U�K�f4��#$�ɖ˅��V>]1�^�y��U�\���_M��l����bg�#��2���rE�ɭb��].hH�1��~�;J�w�E��TG�g�߂P��9�
��C�4∨�R��[���ܪ��62��&���d�fFg��Dd�7I�>��s`H���$A�aD��P�e1���K&�Vk��5WqVr�n�����#�T��l�aK����P����z:��^���7�L&c�U�Ep��O�����r��������'IN��s`s�<z%�uy"%b4[�X�e��R�R���[�l��1��?�����?��:�            x��][s�u~��	��8�L��N�%ʢK�h�)��*�"W4,���D����'�� ɲ@�YL���_�>��g��/���J���N���s��=��N����rrtxr������񽓣͓�g'GwO��<9�?9����}��}��o����]����/N�^���['GN���?��_~_�������-�����T�/�y�sJF�R4�U�"����8� -����a8`��%B}���Q�"B�1���r�3����L�N�7�q����KH>��[~�9�`�m��㓣�f'�''GG��fA�O�(-X�`SO�'��5�>���'~m��a�����v����R�x9"�`UM��P$�h�Cd߹X3|�s�����g#A��b�jR$M�!�G��8���@�_#�������=$� ���~����V��2��)���M�Q`�>���Q�q����!@r�Ma)��bT�嵠IH��B'������f�al�s��EqVkV}L����bl�idZ�%e�V�[�6I�T����b>@��-S��C.��;w���z�>�<��ݬ(|@G��JZT��m�"IlU�������� #���6��R��0#PC�
�𺨪�-I�PI� �얿��\���_=¿�?;�5�4�1>v�1�V��P�";�[i0ʞ���4=�J["���ȑ����'�ӈ��x!*V7M��Yf	�[�jR>C�ߠ���u����"z�M��r���mk�
Y����"�KOs��߀����&W�q, ^)��F�!���L�a�|b��ܱN`���J��R2�I��h���^����ӫ^Ơ�ʢl�	
�β�;��k"5����"�5��	hp%U��C+_~�_��a��tAF��a	!I�$x���AL}��6L��*1|�k̡��6�)w���z��k~fFTg<��H�²���$I�R����3�R��H�7��F��˧(�Gz�A���C��F[w?|a���~��r(�jěBfj��		�q��lA��[�>����Un�5V��G�ɖ�'��/���rb����W8�����9�tF������uQӺj�	De�]=����B�Zq��l�PG������$��l�&�T���S~m����x)�1^�h���|=��d�$-mYŒ$����#J��������x=s�>Σ:��:wy�\:��'l/ ����N�(�(��;f���Qi��x
��4�e!Z�С�9$�7�p�?�3��?����/��	Y ��^���J�`��^8���Yq��."9<I�XS���&�
@X�l�da弣�'�؊�?��l��>C�h�){yV�������I�RҦH���}�^�z��C�1v+��V#�G��
��-�E[�H���PA����=��#��tI&] �ΰ��Շ��u��za��g��S�Z����}c�7�x�_����=��`cK�֍'��BL�c�]WI��l��x���Α����`���y�yԨ��qV�	O�V.�,<$��
"��a�}ڶ����)C�p����*XK����&T2�ͷ3�)�Y��;_��%(�Q��K�_��>�0ZX��n�%K� �;�Z6�����o,r`eT�Uc��)�'�X`��@&�2i�4E�� !�φ�:���A�Ui�
ɞ�H�0B%�rDk(��uKy�"L�6;X��7&�[3[�2+�F�5�tD����ƀ�`w#��g?!���%��A�2��I�_̘��D���z�㠡�U��M$�{�rV�D[��h�:E��Tݶ�䔺JF�����.��ǀ���Ǒ�L���{�ҡQ�=c)���)r��tb�X���6E���m(�|տ�w�-el'å�p�Wd��;Vy���������C�ܮC������H������[������R~q�Jn��Jڱ"�)Q�H��ɯM�*k�'2�(�tl��!�ڤ� ������{^)=y���WE�r&�	 5����~r`�T�p7?���>�'��t�͈R9�M]�	P�Y�XSK�r�eRi`D��(+��iD�$��eb�m� a~c,�2$��l�)O���@�ٱ0��q�II��8;��ԥ��쓀����BW��6z�X�3.,9#���iH�8X�������m����%��'�KX�2@I� 38���@���3z�-������1���e�>��H^�RF
�Pn�c�\;��L�&�߷Zy��,�⪟v$6"����P k��6�����CTV��a�*��MC��1�45+�	@�^��� }�3�IR,��g/�N�.�-�,�__]�zki����\�+�ZG��HX���4]�8[��	�������i;��	U�\��fU]{sc�����Z;a26^%~����WU��*֐:A�pbm�"�iψ�`����w!�lf�|࠙����sD�����f��nU��љ,���d��<��Ye���:&W~�`D�����SQ��������tԩx,��wPa*E|\�����P>1	�*֨�#����!��o�Q�F��(L&`UK[�"P�yctv�I7_����E�Uã��J��&��3O��R���9��_�����(�nMMʪM���*�dz�
�T��؁q�1��86l�(�k�%l�2x��Ѣ C������_�gX�C���CL<��b � �.������x��Ѳ`mM�$	�m��������:��^�����H���~�Nn��33��]��h���NP�X��C��n���z={	��C�uM:�C���1��ZĎ��!��nDۤH�L*���J�V�Lܛ��!:DAe#C;�"t��m��ϬH:1�Nʆa�i��y16d�JۢT���>	�`���nEY"��H5b��k��y��xv���������܍��m���RO��/���m������츁�ݕ����C�>��=6���M�m�l��ǩL��U�xҳI�J�����/&W��zZ#����ڵ{�ٹ�^��Fi��|��m�WW'7&���1���Iaû�	o(I� f���N�'�`(iј�� ��N<4%�;:�9�4?���������
�(o�P����ef�]�M��U��Ͼ�����Z����z_���[!��P�auI��5pH���l�g��W?:g �h[��Y���݀��EQ�� Ꞅ�����o(�O�n�a�صS�Hgľ�c��R����t9̢T�@0�i�$	�g�U���7�~��i�i?a D2�+Y�"!Fn6q|���0NM����=�iK���V]-yf�����(���%�M��K��1,��uK<֥�?[��݊���I
�����s#����2,f-�)ʦ�.^�_�vmu��6��U�uQ���"�0ur1�ѳ{:�[�H[�O��|7>��f�#��7zK���\��u���]wl����������do�P(�Np�e��e^���P.U`��L��L�V���T2�lR$d�M�+v�<��+7�Z̓���6��`5x�pxB�P���a�n[�I�)�Y�U��+��Mӌ���|��Lf�oQ�t���`�9v5!��7�g���]y+$9!��2�+�L˂s^i?HR�����̢w3�MR�a��ց��]�����ruB�O괨i�"!W�魞���W@��X,�j~��^Z8Tg�����w��#p���5�<�v�t��h����7��g[�h����OB�yU�����7��]��K�n/�P�P�m�d��o�� ��Y�d��J�rЍ�����&w�l���KP~6�ࣔiIJ�����:�@>	������aa*_���dim��z�[z�e��ۜȘO@�m���	EZe�j�#�X����l�ý��>��C�Ӵ�W�"�L�����-�1C�"!Ku�_~�r8��<_�F��Դ��$|~#��V,5�}fQ���0������!�[1|�l�rh��kvmӤx;�T����p�����9�OE'����Zi��F�!4��i�!��N����[�$i�t�� b  �"Ib"�J�)D�>�=�A<��d��5G�)h8k��Z!���irlg� ��VuT��?6���[L��-9$���~�ø>)�b,�y�vseym�W�3�+��W9kZ橁CB�<����P�N{�^���F�´8�{��e�:Q�%j�CBV�4�~ca!k}%@7��?����{:�{��X
��b�I3!���$	y�^�씟}c���[�������WV?��]cP1 �6Ï�B��(�����s`�0X�R&�w}bhҵ��^(ZZ����	gLtDZ��55g)�������j�?��[�؅��gg��'�a(�Ǖ�h/�o@(x ����C����r3g|{�z.w�{�;m��w��x�Ў$�H��(I�?�wc
��3ݚ#M�֩��G����~nv�����4J�\3�W��6E�6eCS$����s�aq����E8��_��[\X�/^=������n�;��4ĳH��L�a���g��zu�>�� r����@���f����9��N�F�ڬ�n�	yj��vj��rF˫M֡��c�����	��1�X�ph���_%�0�	Y��^6��	^v�/l�S.lLt�W��޷���;)���v�$G��`���WWo߄��~6�`،�)%ޕSN*�,�$�>쩊��E����U~i�<��;������ɍs3�tDaҹ7mdB9�����:��3�=�xj��q��bb�k��l�{���D4���&�|�L;]���?�a�z*�mS��Я;4��6EBH6�~b�K+�&K�N�(ʡ9�!ɸ�,K�"!*�œ�,�T��=�;:F��%�z��̖R0�x��YII��L0�'*��%�q/)!�ڶ�$h0�b�h0����B�tU��@����ѰE�rZ�ǚ�7#�T�eۨ\P�
qt��h��ޅ7����P巇���ޮ����SETz��x	� �Ai�4)bVwr�Y�J��M��3�W���T��5/�Ҏ�!n���Un�Wz��lX��q�B��Q��th����W����P�jL$X��%qn��I(��.��-�}�ф/�N�Q`Gf�����s��U���q9$#8H��d��S$�o컧�t��sʭ�VSݡ;'�b�g��o����v������EKA*�U����v��^k�1<c�>=���!�I�`n�5$!KT]U��m���ؾ����1��Q�O����q� I�&�j�2R�*EB�X��t�>�6&O�a�;��8�����2(�����P�%���?��el�Ff�E�F<E�C[U�����k���/�Z��-��l����v�+9�$	9�	t�
z����n���}a�ե�)�@�/^���L�-��5K�k��m�S�zQ{��Ъ���!�xMP6�6�$��Dݞ�ʀ3EB��6ݦ��ʈ`0\UU]O�Ƅ2(#�$�oǂ�{�C�c��(g�=DL��弲/��I�Ɣ����20�'wZ�o��qO���qW� ��=�;��
��\����&!v�t�8����(��X��J�C±�4s8�Z=����]���AT=	Q�����ͥ��Q���������.pO3�:�T����8$3l8�m������⇷�_]Y^�,���㫓�L�=�,�d����;w�$�Ug�&���/oMVo{�W/o�i��D��7?��L�ƺh�4�4�����t�Sw*����ߜ�-^�ʭ���!%���&!�6�����Ѧz�0�=��j!|hZ���'��f�F�N��É�1��K��L�91��#Ί��U�$!X��F��#�. ����V��R;$S�����̆�Ss���3#o[4]/Rg���.�P�o�/�?���c�Fe��H�e�	�OO����� ��P�@0*K?�̳�	��5�@����@p.vDaOdJx�%(7�{���.j+JF� ;�n�����Ig���q��˦ �4�Ь9$��4R��)�NH����MɎY86���A��t
 ��C��IW�0M/!yR<P)��E	9�Ci�t]k+K�bi���3oO��VΜ��iO̪�\0Y��I����ytv����3��1��==��%EB6wӹ���	�GB��e�	�&�hMTѡq�^�۸���O�[��M�ϭ����=cT���C%.Q�YeN֤H�#с�O��[����FB;aAYM}�d�p��{����wR�7qO�D��m7�c���I��ܦ���rmR�b��j� !�������!�����3(����_�.��jWo�pw�^���)(�y��3�C�����-t-u���$���.||�<�t�M���0=	�	�&21Z���`T+_�Ȁqmݾ\�=�$�PS�1*���1i���ҁϻ8$��.��S�+�n/�䝨eFB�zQ�$	�5)���ɣ�Έ��cx�%LJ ���%&	1�JC�w.�q%�����߻��Z����?}���� ��9�#`B�􄶭_	rH �W���s�$�j�_8]f+˓��+�o��o�꘲�1)«�JTܳ�	��L*�+TnהE�NY���сb�/5�������e�k�K�����Տ�?CM:a�C�p�@M���$ϲ�?^\���n�l����;+$��B�5�Ʈ���	1�W��J���ÖKt&����+:z�_~o�JL|�3�[ȫR$�.N�f^*M|Y�m�"�U?��׳ݲt��2�e��A�2C�R���U۽2YG��q����~`6dCxA*�~r@BI��^/�MӞ��?7��?zD��oX=�s�p�P�qzhg;o�d��c�-�N����ڶ�:1 �m�H?�=U�I(�.���U+�V>�:仗�̥��[ؠ���}����G��B�WWn�O��9$���y`���M���\����teu��ߜ�˕B�Z��C3�P�mP1U&��{w�	Hz)4h��nZ�~��޻}��6.:
�Cf˴�l��ą ڂZ�I�-��DP	[�ջ�݆:��7[y�~)Y��(z�7n��r�ι�U���7|G����P�p�D�*J*o��$1�� �;�t��)�,�hN/��Q�.�'�;���V��u��mG���(|��X纤m���:t�QL�[Gr��$I8���]�Y9�2��֩.l���_�u���\㙩��g  s�h�oC�-q���$��9����@��d�lz�8���z?)����f� �!!RJ��=��U��JDX���,��O�% �O�.H�֜��MB��;�К"�{}�X��܅l�;}�6�U�eY5�7}6	Y���N����
[ͩ�ҽ�t=n0��6�\�$�sl��}�q��D�ǻ���;y���nw�[��N����5p�6/ь2htii�$��l}�����¶6��w�ëS��
^"'�N�	޲]BӧP	
�ۑ�����ٸx}1׎��w]V�	�7wS|��L��.��p82�pã18�d2�ʲ;�$���M���"|��.��S�>�\rag>6LG���/���9�p���nj��ˤ��B��zW%����ܰ�k�Y����UT5���쇅G��+ou'aP< ^A�_&���	!�{ퟢ������y��"?�r���'���i�yZ^�
�9�=� ��*�J�&��g�k������9      F   �  x���Kn�0�5u
/ۅ�ypfH�'�F�d @�s����"�AW]�+%8�m=�����0�]����������P5/[4=��sD!14+���U���c]���y@79�/�M�������n.A@���6J���0��B��ԚSo�}\�����6��M̪cR��r�Y��Z�m����Ģ�wj�V����s� ��$\5+lM�6����^�>��}��x�����֏?.~����_�.���&��D(!ʖ��)i�)#5�`��Lj��o!�vlZ��1��A v���P�~o�O�-c�-���,K5��7�k�884�W�d9cz�?zM����H"��Q03�L\&3���*%o��
�����Vz�Y���9���/'/���v���81���G��_�L��f_��L,��'q����va��$J��G�ē�/�D%` ȜĚ�,��;��      -   ~  x���A�#7E�է�FEQ��9�,��@���"`vAv�&��6>J>��햪4�\�(��R�"�u���r����������y�o���WI>���x%ZcD�hy{)�7�9~��r��r�v9�s9��������>�Wя��<���D�N�F����g�$�0�-􈤴F
1
1;��Yyu���/�����$����Y�._�4 ����d�t��/�o���z��
�I�FI�������+���4��^Ii!i���!������DQzAB&D�� ᴒ�\�Zs�;�c��dK��J��y\���[y� ے�Y#2�غ�ڑ+�˂����eM%�¤ő�!rE� I���#��8V��І���S�N|AX�Pd&���E�xCF� �~�G��1PC����2A�Ӯ/�V)�sA��h1?��P��.��	�[f�I��sG	h³�2B���"� 07$E~�&|_^��#\i�ԝGnV�@P�,;����<0:d��bݐY��)?+�+�T��
5�mH���d�~V�W$S�MT���iCf�S��/+��K$$�!�������J���J��#7+O PQ�ZA�P��מ8��Lsl�@}z��RB��jrsdZ/S����zE��4j^ǘ��80�����b���.B�Qԅ��ӑIR�h�w����|M5���@wd��#Ĵ��xI])����FCԑ��}@L��j�"�+�'�4G��ܐb��Tj8�5c���s�.ɑ�����
}0�R
1k%?$�"S5�|Gl�CDCK�C/0���!������l�h�&��)�}�H1���@��^.�q>@8bީ�I��0�$GJR�6W�a�p��E��&�2�nؓ2��~�Uh_�g,#%jO�
�i?Z�H�E"��-F�^M�-!C������H�����^MvDs�=êt�Ϋ�b���ޗe�/�X��w�N`�x2&j'�˘h�ޑC��N�;& <zŞ�ha���]��������N�x�H�N�x�HH'���d��ݏ'�� �NV���,`��m�W�,X��n�Gn���J�dN�J���T�w2�q��n���M$�Ά�+bk$�ث9�r�`(2[,n���I�_A:2�H�������?�ǭ0      +     x���o��6�?ۧ�D EQ�|�� @��b��C�h��go���#J�|{��o)���"/��HQ?Q���ºŸ�(G��IL��}���_����������*i��k���F��I��Ō(t���� .�F�ɓ2��\̹�"rfɲ+1(�\̹��z����z��Y�b����6F7�2�\��Y�����E�P$�X����4<$s>�&Zrm+60�-r�l��I^6�m��]���Z̓&0&l�{"A+��(�̺�A���H�*�ƞ��yP�B� ����K���SL����.���S�R5fO-Ȥ0J�H���,�a}���Z�!іR`���'��>�*�551�!�-��|�ea�Q����������������?����q!�f�@J�����$˜۪h���$M���T�Z�;�P�z%l�9��&i��������w�_�L���;�3�.��-��G+���x�qAɷrJu?Y�`���Aɓ���)p��!M���kH��VO�v��l��z��&f�x�c�����I��f�N�ʤϺ~p�vw�c*(Yز'���S.�����F2�� P���gi@1���djo*(����+%��7�O�����\S��Z�=i@1���גbD�$�h��#Ly  � m��&�$�Q|�)��u3�!K2k��;i��f\@���{PUk��F����B{%+�JC�P�.����ؓ�.��.��#%��1ń(J�"J����� �]t�$1=�S7i�0႙������|ݤ1ń(�;��K��(�w���%��ژ-�M3L���[3�b4WSL���[�%-�5��FSL���Z=����b� ޤ�i��t�Q��r�����3[�|��w�i`�.������,�n�>��x�:q�N���j����>v� �:�x�g��f��#n�w�B$��:�����Eǰy�v���A�K�$��<��q���y#�P�F��L�˩<����)`���p-F�<i�1c�b(j����H�����9���?q�^�      .   p   x����0���0�رeg��?ǩ}Q�E����; ��F5[(�5�E-���"��&"��X�1��q�h�W)���Re$�J�U�J<ʕp̊�+Ļ�������      >   ,  x�}��ml!F�L�@��m("d=�=)/��fqG�1��Ppq(!�|}�����+v���qB����Ԉ�Y{u��Ry��Z2�2�ɘ:j�@l�Fe,�~d1d��L���0F�Z�6e���;b�?��~�)kPn+C|"v��"rd��d8e7��WdנbS`;�%ょ¸u��b��L2L۪F�҄�@�I�	�M��A�
F�tB�eÅ[E@?��tyqچ��xUVB�Z�Ŕm�+X��xގ��me� �Ko[�v�i��W$�˼����bm��yU���L�+b�ڰ�ۥ�u���e�+��	-�M�}b�B��U��P턖�6��Q*qS�[�?��b��q�"�EΩG+sƾ�]��t�y��4��k�ʐ�B���~�%��Ǜ'd��` +�"�	�=�{dE6��QZ5���%�D�����;d��r�D5m+���r���7��s9@=.�DZ�ED߲y��NfO����f��Q���f ~�S�~��{|g��fe9��v3	�`�ʸ������\R�q3��>����         �  x�E��q�0D�D0S�N����F�\��W����w1�H%��>��h�ȮI��_R�c�rj*;��BUy���*P%5��ZM���?��ų�:���Ú�m�b~��#��
��L�y�uI��u��"���>���Gb�w2I��t����G6Y�z�qE�SN��~*��T�)���a_RI#�m�2�"�ľ}��:l���k��$��j���T��G>�{���d�.�!�����H|�~�=T�r+��ld��hQ �n�o�+[�MN{�Vx��X�
!�f+]]I��r+�ę�V�z�8&��f qND��I⸈U+쀫 �#đ�C��V��Eب\a\9��
�����+�U�

�2+�Lg�0s3�o�Ҹ&2Badg�>�]i\9�0�R@�;\�! =��+���\a��o-��n�S�����'"����         
  x��Z[o��~^�
�O탉�_��-�"N��@_kk]l�ʆ%�[��j�!h�*�N"�H��@�:(�o�Sz�p�3�ȵja!�<�����ό0��j����wZ�'E���_-o��Z�E~^Q��cqu��,)�}�]��"����V����/E�mqu�������woO&{E&��<ޛ��܇�d��hzo��7���LBdFeFh*ׂ6I6#,U�M'}0��Sn��%��~2ݼ�h�p/�^��=���"��?+gk��1$�$�Ri���T0J�`ص`�P$W��S�9>��-��M�_9�n�"��c�%�=�F'�{{�Of��ʈ ���,FZ!�d-d��l���'���򝕨��>�O�O��*�\HY�c����;d�{�w��%�	���[���tT��"q��I^�_�+@:�W§���k�;�����[OEJ*X&H��!��H���+EE�W��"��d�ֹ���ȏ��)z����G4��΄�M�U\��3���.�4.�u��^Ic���گ4���Gg���� ����1�9	Ɯr���&\�\����Tn)���2��_.��r�Ò�d��A��Z~��\< }���ɗr�uWه�������qf���<���tº@!WKM<��;�������wg;ވb����g�p�4m���/%$�	�r΅�1�
-���@��;u^�x�6�t����(��C�Sc����H��Pݰ�..o_#��G9�q�dNC�J�uQ/F�Pٵ@=�碞����J[_�D�a������S/��>r�:u�u�>�"�M�̊ɯ��#�H֢ȓq ��TRn��<1�!%�8��B��2�S����y0�*�+����j�Ir��S������%����DVh����s��mw�o�Q��B��'e�ёkt�~����>�ĩ��F��E�I�H��U�����x}��5ܯt`Q�֏��b-��Ѥ.�ߧ'2�.�ȘN-a�ܢx��4�i���[F�'C��2��!�P#��'���R�N�_�l��ʢь�˹zK�R�k5���&IC	��Q��mGkm�Ti��΋�7��uQa�2�\�L�&F�:��{���-�Ör�xA�R&��j�<[��K��1��㠓�N��"�$�W�1f�z]�¨�@B�K�1����j�@��A �����<;1��Lq�8��G�$��<_1ۼ&�(ϸ�2%U�h"b$�W�$��P����ﯠ��))#x�Y�H�YZx�IM8�����: ��~�QmU��?ߟ&l4tN�jbR�6I�Ti���o�l�j\�i���V$��"���|,�4�����?�t��ri�q���	��`Ad�P��*+l��aEJ��}�e_�:����K0�pޯq�y ��͉sP�Z}1��w�$S���L{��\���`��"T�H���J��;�f�RJ�21��}�=������L�h� �b�$v�)x��FQ��A���%��k���/������6I��#mX\��_$��O4��1�Q�Rdnc6FZ�Vò�v@[�U���j�Q���n�?�x�	��!�������6�d
i
U��S1�Л��MM�1�-,ygs3�u3�{
%�k�iA��1���:�����k��L�HU�UD�/!��󵡑nxʴ"��HM�U���u{Ɯ(:�6i�F��^450�~;�}�`g�I~?���b�;���hޙ۝\1nb$�{�ys��<dQ��0)�Qh�$�
YY��ֱd{�����~o�~/�����,��n�Dx�D8��R1c8������$Ҵ�h��8�[��i�"(�t�TTE(m,��	���IJ��f�1�0� y�k�٤id����`���u��f��S�ϧ�>��l��P��! P�kA,�}�Mr&�93�+�k��1���/C��Ll\�E���P[�:Oo�F�b�"�J	�L׈l5�����z��} ��'���,��M��O>��$n1)o

B�N�f��Y�}5�n�)�^����ޡ�L�6��00� ˰͕V��(9s��X::[�?�>��ib�}w�be� ����"6\��	i��|k�5�&>�=��Fi0��q(!5�m�P}Je�@��u����_mϞ�}�d$��m5sA�m�:�a��r?T��ֻ������9
��W�}�Ԏ�����R�X���LpY���Z�/��vY��E�ͦ,��#^��駑"�UW��V=��R�����W=��Aђ��q�&㧷l=ޞ��l�H�yZ*��o���M9eB�%�z�%S���bk�3e�tC7ai�Պ&Aү����VKi2ˣ;+�*c����ɀ���cR*l+�3�$d1$�jͨѓ��-����w67GZ�kG����M4���jcUx�Ȉ�tkw�5��׷����n:j�;��@����;�@�#p�ZPH�v��ͧ�w�Ϸ���w��ݞ�|<1f�:"��T7(M�r��\@%
�1���r@�_O�Ӛ�k��9�q_!������ŊԸm���1C��%�������y�/��@�ݽ�l�tcc���4�      H      x������ � �      	   �   x�}�=
�@���)�@�&�,6�I��M�`���S)"(�
����Q�l�M���|o�g���L*ځ^�%�t}@'kn;_7�+�
t`�.]���q̅��(����Re=U��� ��@��I�,I�\��Z+��������0+�̲�׍]�v��mAwK�S�b�1~w�9���ی             x������ � �      6     x���;�A���S�ܪw?�	6��p/ d�+@D,"$ �4{�9
5����n��X�<��]�UE\�M� 
0,�e���?�����X��_��v@=0M�ݤ+e���6@��B��f]�mxB�X:���Je�RP5x�-����&�n�s�b,�P�
Z�X�d�A��:j���J�4@���$� �u����2[��Ojm���N57+$4@�	O��B�.i��Qx�3����Ȩ����.���p{{�;��`�+g�VJ��
&�i7��A�k�qnV��~��8,��xh�v�ܐ�� %vp:�D����Ǝ;kVo�e���U��G�e�Q,�w�L��� �h+���^�s[�_�c��2J�X ��Ûe~�$ �@�4�.F�#Dv�����<��k����!�ɭ�*�����u�������rq¦��̋��@���2_��|�}�[�.����#X�ŴP�0�>�J���w�s}ݎs����8��6�JA�?�G�l-v�˺ci���o�CIJ��(�H�.�����D�z�J�Ph��v�~l�,�Ȫ\&I
T�Xܦ3�>���W��1eL|��T�Y�1�H�3��)nTy��4�?�T�5�C���_��D߬-� ���R�e�%      &   s   x�%�� �o:�E@Pw�����yi�M7t[�12�s��2?���E��I+>�rI�9��H8(�1gĵ��sl/${��%uU;����zmʒ���K~���� ��] �      '   �  x�E�[n1C���T	�<������CT��q�&��n�Y�"�n�ݜ�W�ƭY\�]<`"��PV����aCl����+�H��`ƹ������x.���³Os����s��#
��NY#t��ҏ�*n^���2��܍��G��L�h����Q!��9,Ű)�-qھ	,8)��syZ���UM-;Z!�9�ICP��!�h��a���v��ôqu�(�%(j$��*�@��P��}����!n���(��������m�[�eۓ��ly�"߰vB1��G�n`�Z$��E�5Ipl�cK4�G@��M����~�X�zx�S#�7��-�cu/��q�,�E���Gӌ����S�	j��f	r�*wNS���M{�-�u�O�������x"��'�{o^�����?�-�      <      x������ � �            x���yW\W�/�7|����e�B1�Z�hf�@�UY�/ � � � B�r-#�%RvVu��e$�m౐Ѣ˒�L�����/����a���t�@Ρ׫�T��a�}�������N�Ӆ��G����?z��h�����v���޼?������G������ؓ?�'߰��?���m��=|���؇���/��{R�TO�g�g��^j�N��4��^j�ј�y������՚w�r2���3W��g����t';9�2|q���ͳ�
��^����Uo�tZK�X��ݞv�o&�并�MO6�-���<ɦK�t)3����O�R~8�,җ#;�ͥ9��=lZ>����G/�,�?�_������%�������?zL���,��oӇœ��/��u�����o(�x���@'�`ve��i��廕K���NNܚ̜��9��x�R6W�dRC���|6�'J���{s9N��6�gt~�u8�1���g�}؂'_�4�?��INi�n�Q�g�N�\4��7��+gg
���ju���:r�>��VΝ�t�u投P�BO�h#T��ϗrC������J�b)�I�QQ*Euܛ-p*e8�^2R�`�5B��=ٕ;w�S�Off
��nזϴ2�����כ��3��"�)����I�����ᰟ�|����e�|{�@y�f�6�����˞}�����'���G�C�V�`?>�b�~����;����˸p����>��f߰?wœ�K��C������ϬS>�5&1������C�@���L��s���}F{ƿ�fX�[�n��ts6�}��W���~x�������F�@���D�O�[�M蛼:�簦{0H<���V~�_�

�E����[����C@�W��o�P� �[�%��[�!��#�0F��S��l���2�ݠ-�?أoY���c�2o��Vm�Ģp�巶!¬�/޿{�^�����z$�6�ޑ\�C��F9Fu��:�/�����H�A���d�Nky%�pkb�깫�G��g��&�I��rål>U(���5��ɗ҃����Q��f�\e{�Ԏ��y˖c>p�{4t�$f�䣩ў�ԗW+7+�n�x�o�G�Z˃�ť��CC�Ies._�dS�l��)��D)�wov�S$����&�Eo�rN�ƃ}f!(�Z�M�lnj���R6�иZ�{������������r��L2��
>��{����Q�O�lQ}�f�8��=Ȣ{��|���WL�m0��0�[��63�[F�c��q�F�nnz� �����j��R�<��1}��_��p���'�{�ϥ����,�C�<%��S>W��R�in:Fuܛf6�"����O�Rkq�O�w��n6*܍:i7�T�1�,/.V��'z�X����5r�v��F��eF���o�vG��r(\s����ɾ��{B)�7�9k���BSQ#�a�o���)��x{S1���i�(�bz�i�%|K�R�iT�}�a�b5���N�M6�}�������¦#�E�F��1
7t.�bS@��2�1+IP�$G�vњ�8_�����E཮2����X�u�a�M�-m�)��;�pr��s�� ��s���b�)�!
a��x�+%�u�M��;�..�co<�:���ʷі�/��Ə�;�6��xD��._���xlؼ�Y�!�\d�?I;��u�H_���Wky���Rm�-��Z���:�=��Qz<���:����y�����[�\�5�ht�Q����葔�k�9�]���>�a��4�63!�"hd�	�-��7�.d�����Z��M�d�o���.
�u�F�� i7����%�H�<�/�]���]�3Q�����U����|��#j����P|a��!�A��(��s���I���c
�Y���V��39���
c�;�gi��fk�ۇR� �}��ͮ�d�Zv��a�A�o@��qŲv���:�ֶ!��y���������0�����?�v>�P�T�[	�4�3�aX�~2��a�Y�� �ď@H�TB	�M3�@�h,����dN(6��fϹ&�E�!Hié�e�S��~�w�L��
~�om�!��gl7��}����n�B��E��,9u��'�Q�s!-�m,���o��G�O���Psv����Q^g��D��Y�юu7�# 1 ��{�1�����V��������׮\�ܛ�pn��By�9�а�'{rC�'^$�L�P(er��t&�?��R'=�M���7���ƐRt�;Aހ���V���@��2[��0���>��[k��g��������ds&*�㭉F�P"ԭ�H6d����Ѥ��s�:zXu��zm0��A�bM�QG`c�����q�!� @�({��M&�_���|N�4�|���`?q��%���ơ!祈���8�s.~�	`ƻ��E�$6�u�3\����gl� 7�9Z�p�Ŭ�5�e���d�En������ɳ�o���=�z�j-��M�]iܺ��]��a	_�ҩ�p6=�U"��Rn����4����
=�&f.�\�����vͳĴc������c�˅���@�9\�ھ[�QlL�Z*L<�N �����G�/�J��T:���ZH;�.����Go�:����J&�c�pgC����L=w���3����f���EC��{a�Zro�] 1��%B�2㍀4U�o�yI�z��N����f��f��'}�.L��Ị��L�v1�{_'¥��j��ɿnV�h(&B����^�:Bپ�j.ֱql� ֨%�GP�*;`�;�H�7��!kW��ĉ�]��Xi� _+��#}3'���ِ��~'<:�I��b��&g�M1�������Ə����0*JW�(�@l�o���V,�o�~f,�d.�и%F�l��tg�P�f����f�nWjgV+K�n���oO%�vb�Dөl1�.��N�O,(���|����=q7L�h�]�-�<2��j{�-�ö~�f��@��d*��Р�1Ԅ&���y�$�$8��pi#�CI���\t�Y�y�/ďdJ�"�W.}tؿ�̈́�G8��IQ,��"T�̲p�!n����t6u|�S��m����#%o�R����3+o%0���5��1hq-m��(���!8~�\�SʥHwe�+r�C�,�Ќ	�OM`81�x��|��r�R��I��N�l��j��l��Yj*q�o�v���6�wի�i
I�F��v"�%��mQ��}-ۘ�,z�vH���ηٛ���6�ΓI"�����~�"&,�JƮ��j���h��5�{����<�6��A�A��O�t�ٙkw�^�\�x�Ur�\���
s�$VXj�2Uh���6Aɚ���屑-:�ۼ�k&�Ǯ�	#���SۛצFOό�o�1�X<x�i����j���u�U���&{�	ǚi*WŻo���kRʲ���_1�K"^��V�ԊT	u��5�Af�h��yZ>�!=�2b�f�Dop���H����e� %i�مų��hPA �L�U��c.�p��[Y!��D!lXj~��F+Nފ���7���3�d��j��f���O��0��~ :j��yA��ƺ��k�Яet�8
�*a�jIbɺm	�X#^�W�U�d��+�l@�8s� ��;�ܔ=�R����xt��('���ʼ�8p��$Ӛ�h��l�Q.��,�*�wP���2Ը�a�1GF�9'��+p>�N�#�h^��ψo�Z����8a�9 $����|-7�>x�?��84��
ׇ�)J$�)tx�:Øy�E t���x�����{��[�����];7����h���������ʬ=
�vD�sON���j"�|��/�
�\��J��7�a8[�'4yҎ�i��N�d#'��Au��vI����i�)�[���#�3�唱&�|��k-�gۖ.v�[>Ϸ�@�qBS:�
� #�XB]�1�� �p2b�!�$���na�D+,a�hGH�$փ�H4��,�x	�Z$M�v�9懰5� OsH�II4c2j�@X�����\��?    ��#�<�1�� ��.�]�R�!�m���`�D~���V��`0$�v�����9'����Q�A��ٗ?��mA�T��G�8�6(��ȯ��TW�r�d���G8S��������ٚG��v?�ҩ��e�M����
/ +,6GR�`�q�}�(eFp��Sd�`�8�&��ÒU
�e|V9L�{˳8�G�'=8�w�ɒ<W���(B�@��"��bpz�� ;��q�$ԧe��7���o�$���v����(��-:X��j�-�a��z "��ua ~W�a�j|��������ݾ.&y�D��Y�$(�U��,�h�c�Wp`WpR(����ơ@��s�؟C��y���-�VҢ�ڴ�0��W�K(x���Xx��(
O͇+u�LVJ�`�d�=�dw8��D�>��YT�U�w��p��	�8���tt�Z���������1��Ď��]
k�2�8�U<����������@�P�ܽ{�z������|���ܽgE�|�@I:SʧK�L*�K�
8H�� �Ŏ�7�e(`�ť8<Z�D#Z}#�ťN�k�	���h�X�an6E��J���!�w��'(����@���߿��3��זP���&$:K�����Ȟ����5:.C��"�4T��+��CH���R"�����'H���\�FN7�2�ˉ~r��r�Z�����^��XjԪ�r]} ��}r�k�X���T�i~�]�����[æ�"�+.��x7�Q���U9P���+i���G�ʀ��lD�&Q�3����r� t�B�r�\�W�=C�x�$p��+t��Of�m̯�>1�D@����se�̌L��0�O������������NLK@��02\mP�O�E����~���ON��y��jT�g�"�0ENW*M����y9�O�-��vf�^�]��k-�"f|7�'l&g�Mo�\����S��n!�W�sj�ӎ�A!ҋO�1��ߘaU���?uҸMf���|�?Rkt*��W>yF}�>ݸ�^)7��Q�v��U@�CbU^�:\񔿦��A�a_�g�$f1I�ױu��8�,�nN� mK�Y�\��tS�,j]죆ދj�T1xz�v�X5���[�Y�@�CdPFD��s����iL�I����֏��vJ s�:��s<�q�B�#��!
�h�K��!l�DH�[�E~�������W�*B�.�'󧇼������͡�Nn���M/m������ݣ���JI��N�S�C��pF�(�_s��,?��qo>�<JZ]J/��ƹ?by%㍚7ש���L�Y|�%h]v0O��?iC�	��E;涰����Rvc��H@8)�t���Y����U�2I�����g�<�|4�eR�<Ѹ�Hȗ'}��;�-,\J/AB�+HD}��b��uK]Y���0�r+}2e�,�^��7�߰U7�Y����M��هy J��y(�[-{(8�	"6  o[�3�]6�>��Uo�V�c�[ND��) �?D�������3���	+�y9��T`[S=�$�t.�&x"r}�Z�r��}3�r�5׬.�4tDp
F�����e��TD�q�<\�OD-�XC�=���'��S#WI�T����5�Aᑅr���N����9�F�|EDѦ���U[�p��t��B�@��0�2�K������(��D�}�T�zaz���H�5l����j�"�e�����R��5�MQ�B�/�t�a�o��B6�n�1:A�7����v����H���C;���[K����Y�6%�L�<E�X�4�B�i������]��~|���U�oԅMn���T���]�矣Ђ�7��9;�k�g'^�#�h��K��O�%��"T~���֎t��=9���4'(���|7�Jۑ,@�}�L�;��ݽyo�y~5�Z?S��t��\k��D�n�޽�[�ǒ9cå��*5T����O��T:ϝ���{�E��p�∭�K������<ۨ��=��;�G߶W����X�3
��]-�W�� }�r��@�*0�a;:@O,��h �m4��?�����$���+�N�	h��䨞�����VO y0#�~����֨޽�qla{�U<֐�1�l,6b���9i�����A�w�� ܓuȞ�4��F�]%����� �b\����,�2D��/ٴ~`J�{!D��o���~Z_8!t}�����4�����m��@��8��jK���a8��K��A�g�O�y?{���:�n�������]Nl�J��e�G,K�:��HĚ&E�+�o!zo��X��Q��5����jyH��� �0���݋��ߣ%�r�L��_0��A���з��م�Rr�y�������Ю�j0f��e��{�r��Zv
|���2�aM�usMM趋���cl2m�I;Z���P��y��%��,����@�r2�dŇ���r?aU��܇��HaH�� �Z��mR1��F~#����DBd�R�@��{�&B��Q=��I(�kOSm[�Ej��I)���.��ݿ�q�H�2�VZ�k���Tp�%�e$���
���Wb���L��c�X�#ޖ:��;��p���X���!�H�aJ���XQC���̻�ui.z�*�0�w[t��Eہ�K�&FFq��uEkƓ[_���K|۱\`-|�J`ȴ� c�&�pWa;%���o�w%�,�E���T�G��������u�p\?C�%�S���a��2���#)���3X�� '2-F�����L��\�Ӑ �d����#�o$��NLR�T�ui'�G5�q9�����3�C#S#��s����|sjt���Bm��`~�F"�$�.e�J�l*��2�O��Ra0�/2�$���|��&�
bi�����y:�x�ϡ��$It�G�M��-���5$|��a�P1JT;(����!�=��`��8U�HS�H�8�X	z�����ы+��:	JhXu��A�[	*��G�}?ʣ��%�l�8��d�*F7�H�@,�UJj�Ü(�'�w�&>��ޤpD�3��Q�W���6�$ϟ��%v�/N�t�Et�ܡ������vP���3H��I��`,���yZ���xU�����ȋf;���eh�ޭ�sH<bN�:����R�̷������f�������@%&c &1fw�K���6���N柿���t��P��f+l��N�7��L�Z�дر�j�[�Q	�H0�j�m���4*�"�������5�>Z�I.�;��X�zf_�CD�s�$�s�	Bs�7�{%�W�"���gNn�K�D<ƥ�>����e��>Z����Z#}SMo�\K6Hl&r3�*fZĿ�1j�3��Zm�%g}é�$����j���Sp�a,�%-�8��^�+W)��O �c��H?eKF�a<��+߂��%w�Iߨ'�j�=2��TVOX By����1*��-w ^�is�*�<��x3r����O�Jq3{u+.��A>���?�gP�������_�U�r�y)O!�Lm�.ʀ�5F���<?�����T�s�V%�;k%�5�\��o�Ӟmz��B�w���y�2g�������P*��K݁u���n;m�n��d�.X���&�	w)��w;��^��I�����H�	��\�0>	 Ե�JNj �Ϝ���#f�"1�L�'��΍N�������j&4�G>&�p/�Z��|2u�l����Zeqiue�~sd";;vg��yHK�\*�,t�P��RCCCx�귷0�3��dri���Dav�k��LvR�G}���г�����'/u���
[���r�"�.o�Y��r�h9Rk G|+ x��(B~��g����?�,�g�q*�t�<�q��m���5/�f����T��A���� ���˖��2��Af�*�˖�g�r*���{�04��h0j�1R�Ż+Ģx�a�#;r*(�lub�<��]�z��_��i0� rP�c��Y\mݫe����J�	
	oF,"��� T�$\�n, ��E3���p�<�̉��wf�1{%�4<�0>=Ӟ�?|e�    �U����Z��[)_��}_n[�t�7"����l&/o�-d2���4�|����������C=�p��\���A�-��'�OZȡ'�"�V�k����	���t�N���7@�d��κ1)�H$i@����#�[�ӞL�H���]�!��ͬ�xSU����(V1�*g&~ȴ#��j�^D,�B=�M�wa�)�݅������E-�f���ǎ����g�-�nD}>Ȫ��qyNX{Z)��Ϛk!(���Pر<��/�t,�{�Sv��L�Pi�\�@�����̞I�n��ĆH%��S"1%���s�z�M�I5۸��������F���!�w ؼ[�'��l�/kXY��Z�X���� �}�Eo��x�㽦WU�T��wrư`���eQ%��(�i3'��ZOq�P���0�!�5_D$iU!U�)Ψ#Oўʥ���T�����ŉʮ̡HUc��0�l�TH&��y/�4��ԮpZ2u-T�*��&)�\�t�lZ��_*a84�߰]@�%�䴳��Nu��l_��fݻ�m�
��� ��ȳZ��&~���ҳ��K�����iϻK�fd�ux=E0V��z<����3Ł�;�K��ۭ3�G3�N�܍���gj��EU, G2�L�^~=��Ű�(F�wo~�%���O�~�#o�O�)'����
��WS���V�:�:Ap~�K֖-1-"jl*��ȐQ�d���"� ��M�5�ΖQ�ZC� ؟xU�߂�P��L\F��_c��5�h�&�}�g�Y�\���hY��*vߔ��q��$Q>q��H�F�1@�RK��s�{�6?��9��lΗ��e��$<��)Jr�W�9��k�տ[jzmu���C��	n� }3�K^��с�I��9��oB�8̗҆$}W:eZ���=���*EK�ķ�>\z���w�Á8]9G�c}���74������v��1B���y�G��)P��@+�6��B����8�P�C�-��w�V0�}�)��yޕφE
�T���T�n�}T����ښ��u侚2��Ǥ%V���vX/�9|~-2���ݗO4u!��̄�0a�$*_$�X��=�g��������-z��^#^����W�Yk�' E��d���pb{��s�x	?�nv%�I0�Y�H��v����q�foC���R�q�'"��V8c��@P+8�c+-숺)bs���N����*�6¨�N���!��)��W.��\�a�*������"���S��f+������r}^�����+��?YPdl�Kp���_��妿�sZ+�x��C�L�����=w|ܔ窧Ͽ�F�>��M�8�W��
���L[Һ�|��L{�rl����2��)4���{�� �ո�|kk�<[��g K����w�z`��'���?���E������tF�H̛0?�/M��_�m��";��I�=�S����h�I�%c⚷M݁5{�$���_�U�!�SdXoK�Z��w�hT����eham��X�>����%U{����U_5�vi�<p-P�L����s��Q�&�Es@��mW�HD�L�Ot2��,w���X��� 3�o��������F�9��S�y���D�&�F��g�U����P�a��d��PQH�ꆣᓫ��/x��wO�&j7f&�&f3+����|��|�nҴ�|�TȤ���\n0�'
�D�ݛ��I&ݣj�+"��b-�tk�MH�}(�i]0���b����?��<5�Cg�x���h�w8���1@��%�� 1D��PC��A3���
Ҥt�6xC�p��`B3���0��%f"��$��E���0�2̣y�R���v��淚����?����:[�8�V�� �2�X��U�=8�j@�A�Ns$#��	�vK�����tdaW�<H�į�c<e��ږ� ���"��	�E�>���)�	(�0H�$��<
9��ap�0X�X�!u�´{թ=�hC��o���mz�:�Q�P�n(9�x��A�8b��ٚ���?��3��w����5�g�P����C�s��҂j��4��Y�ی�� ��p2U��Nrʬc��
�c�U���^��͙f��8�+�)J�lz���#H!ZZ��}�m?"��� �	Q�ʄ�ی�ؾl@�RȜa8>L/�d��M�D	Q9�/��b�n��]ŭ4�����!��E��6@�|Z�7w���� �꒝ ���X���i[���ӿJ�8�#��`�"y�˗x� ��&�~�.������PZ�����!gehR(�R��6��᯲�A����]$�C[D̶���� ���%巬����ͭ�S-Pr��+L��SD��`�g�_�(M����UC=�f�)�w2����-���5}��҃іd�܇�*�eéb6!�����|I��*RJȽc����5�i� U�}w��i��EQ^
I%U�%��4e]�������_:�}��3�V7&h6s���K�f�~:2=�8x}�}���݉���K�&���@�L)�����sC�\!�'
�E�ݛf�Y���i��S�6E��¯	ei_�d��z�^)���p��zf���cP�|�f��_jt���e��nQ���c	{ق�%�˳��
B�:^�N��P>�9~*Dr�v�s�������&��ׂ@�j����F��gh��H��`�"b<꒒a������;��k�CO�~��C$Dg�cZ|A z��u!�����|x�3wNb1ϟ;���f��L�@<�!@=�ܔSe���$^An�z݄��o0�
HbOv�x�����k�B�	Aҝ;.��X����SF$�S�sn��vi��`�|r'<�zU� �$��ߢP��2�P��;����̩�,4��j�2��^k��,k�4�dT3-#|x�{��I��Bç�j���	��U�[F
Q �".L�����.�h{��Ԑ������j{r�7�g��f�w�(�g/�5ž�a�3��p�y�.�qя �p�vC�t*�NI���߄R
U�t�l��.���{#3��pf�W�r�5�-�g>���/,�q�"d�,�c�s�*�")&(SՎ�[�F.�́$"!Cx<�s֌��Lj��2ҳ�0ʨ��;�K��,�]��gk�奕����O&�~r��lu��xi��iRw'�/ҩ�b17<�uw���-�����1��K���i�û�x�����	)�;�р��k|x���R�BW�q��p8��|"`[Ix� [����I�e��|�{���_r�醠Ĩ����79s��e���l��N��Q�-ܙw��[�8A�r8e��/�*ȟ���o,�D���
5�@�q��rp��� {Ƽ^:�}���E	3	.�e؈;�6b^ l�����8y�~���=چlYہ.���ª���L݅�҃��Se��l�w{<�j��"�m��tp�`��.���^�e����y1�P���_��V-�I�J�Q؝���~�?�>���{G�Y!�L�d�R	J|��[��Y��L>L���,��-UiCB��u�o��̴d���PF/%IQī]g���O���X}�Z��&K��Ė�9/����/�RK�k�<�k��2.�&i�/N�_�+��~q��M5#��A"�d�!�#��v�L�_D��w��H&��l/K������N����������;��\��07:^X��[�_O��eK�L)�M�29տ���^
��� ??�qo!�sa��2�4���l_�g�(g��{=�x%��t��w�o5V>��9��ݽ�����s�9o)��c�G����c���\��/�顡A\��֚.e��l��#���|��(�(�t����B�}��K�nx���Wk,�0݉�7�D7�E��ϩ��P�jpo�S�6�^��;GD��[�f�`8� E����y2!�}?e���r���q���p�/2���m�TpՍJo��1J��W΂��|d�k�I�'WP2  �2��%v�1jB��l�Qo��+��C��<�N�A5�t�)�"��I;��\�p��M[]��3�    �����4b%r��\�f&<�����cO��r���S�.�q"���aXoA=~�����
 �!a5����~2��^�GM�vfW1�P�ⳝZm`���-.�����-�@�'��5������<�%�6
Fxn�\
%�[���ZW��S%}�W���w�M��ͻ�%r�\���%�nX��1�ph�	�)���� ��՚G�<��
�S؋O�Q�i��p�f~���ϐ^���7q(��O����Զ�馘r�Q��Zz�Y^�Vͻ��"5K��4�䴿��r��\���^/����d����H�N���5�8������Tr�"�9�����U���x)�P�h�w6ˡ��i�ʡDt�F��ݦK�ԋ����0�=��F�i(�*�f]E�T��Hme��_b&�\e�l����5�ϟ��" �q-46��G#+K��[Uڌ��b���l�]��ؗ�׀%�ck�	4_GXe��8d}� �)���j<vಠmI`JЗii���v�3��4�
�����ѓb��1�����c��o�4Z���'*�O4�tq���R!v[��������1,8q�D?9닕�r�c��!� ,���k0ȶ����X�g���7~g��ͫkl���	/j�AmKs�2ԅ�^�i��-�)�ѳ�5[	(����7w�,"aU&��~�f`�+�����O�1.����S��d"��}�Ԡ	祠|��6�U�
��@��tW�O����`׭���(�Ex�r�Ac9i�������{g9�o���58<c-�ңA�`�';�psAt[�
�����5}�\(߽:�m,\h���޻74�z>323^�M��f
�l�]D�/�
�X(�2�R�B&���{��ӧ��lO�����7��L���k��E����)q�S!
�L�q�²�d
O�� �=��Ay
��Kz+
s����	�g�PO�YrJ�^�cK:Pk��f�/���*�_��n��mY��Y�ö����5WOu>�v$Fa!M_!c3��S�y��TJJ���t�_�;�\c��O�`قf�P	�U"�Lv ��*F��@�n��7���K],�d�C8n��d2>������@���O�i2A[_��?;=w�[���o_�ܟ�w������z�n�š���2�����-f҅t>�'*k���-z�_�g�=�2�_B�z2��s��禲s�[�O���
�s�����ɹ{�^]Iv�x>��er��`�OtNQ}��L�P�M��\�mz�Qoс�i���߲������?t�S�l��"`���&&s˝����(��"��JI��U�$��
�v��U[��z����fG�Q��^��Q���
����%i��@� ��6��\v��}_�6�V ��{��P���(���;�b_�(_�6��E�L��}�K��Uii����l�k��?[���6�#8�\�Z1�t�8���j��&�?�0�N��xg!����Q������̹��29�c_)n��xu��<�򒌒_eB�Q�)�z�X"�J�Ϻ�މ���+��v%Lt,,�H8EWj"�.I���`�`��f�<X�f�o�0#P)��p!�"l	�Q!�8#�WIbbO��9�,Z|Ͼ�RDQ1�ІM6���U�r�0J�s	�=Q32�$�B4nŁ�aqg9%*����O�V@: W��D�tj t�n����o�.Mw;G�mg���z�p����2!CHT��9E�NcY0�����~�[�_r���v����B��R��eM�-���82�{�N&ꃱo	FUGw2��<���t|�f��,�/�1�Ɵ~��N�Ckd��c�X��a�%c�j��ԪU_�&#��C8�l���&0��i�Ѩ�JV]e+�o}���n?UE�K�j���f�C)���_��z?�8}�Z��<Z���6� ������r�-��v��&���j��&�������B)r�(F?2'-�+C�9L�0'��?����+&67l����:��ઠ�'ri���V�u�_�����.�94�� Y����*�"ݬ���������X����yo�9�ַN |uu	�^�V�Ͷ����=�����H����S-�?"sL�O}�R��NU���7���'�z�]-�Zs�w*����g�SR�dLo^�R��+S7���Rj(۳6�D�����S���r]_�/j76�ń2қ��MbL�<#����גUC�>��8���f=co�dtcgUh�4��əc$#�"�� ��N�����d����'3w����Wk�+������r{az���i�i�0�������ق�S��͕���p���츷0���B��=��׷A��]��^��rb��M����DC�e�i ��� x�s�D��c��R("��
�dM���0�?|��.JD9���FC�]YNa��[m����~259M����3:vylf�v����sd�b�~;Nʂ{q��tKB.:���h}".�ݒEH!��8T�Xx*��e.��4d@���ʡ��8xh.�$7�M�YLķ����|�2%H#�=촿�n��^���ϻ�T\�?�AX�@%(<c�"Kn�p�6w��s?Aˏ�Qx�L�f��-�$,��ذ&�L�u�������$m���sܴ�Ż�j�,������
�:
�fh���Ef���ը��/���Z�x�Ժ�ց_��V���j+����u���-p#��9C�y�EpLi��-y�(6c�<)�ֳ��HN1�]mz}��>>���KK�#�>��h�J=6!�3� N�;T��� ��G���S$�N��ޥ�pqzr��6*�d��lyM��?�T���y������gγ�T�����v��'?�'}�������&�D'��T˫W�>>��j�~�_	��V��_"���U[�w�G������[n��|�����^�T[�٩ӻX��j��v^��;O�V��?�m��U����^Z��He2EN�xֳnH�"1��'�CMs(�f�M�)Q���5>C��e^f�:�Gڪ}D���x.ָ���vr0	�w�H\�s�5r�Ŧ~�R6�rh�@}6]jT�m�D������3|Z
L��Q��@݂A�I��)7-��B��"6X�J.Y��X/�*J��w��6�#7`�y������H_�5�$�����T+%��gJ�||��P'�ϗT�b�Z����y�ˋKܥ������^.�=�e�+�������%:%� �c���e�Lγ�lB��1	�\��d�Zq'Xe�ө۾\���g:�j��:u����6m"��Q^l�?	MEH�6��}���|�Ӭs��.�;��|:B��k��z�MnS��cx]!��"tS����cٵ@�%_�F-��?1�E~ˍ����	?V�V�q�q��T�y����5p�lF�˟Z��D��v�t�'��F�k�_�S1�#i���a��z)JV�(����߂�S���i�<���ˏ\P��	l6.�+^�k{�h}��
��7ɩ��_�g���t*�0G�h=6/謟d�������?j��#pӭJO$���<j�rj~(A��Jרkq\�@�T���%Y��b-\Ӈ�͎�b�Z!*&ϱ�#�U�>jǜ��t^����	��s����&s׮^��#\>$�ξ�tۨ�񠴂Z�/`7�Ͼ������U�Bce���Y�[feT�f	M�u�X��X��hj!0�i��7��+6���D�Z����*�#�6�k}��:�D�L~�@�A�h�&=�J���gy+��k� �0 9}�7T�s}�[~����`/҇�ޝ�k1�
�4(���-�׺����J�Q���"�Z.�!��b2���!Ax�.W^��\Nv�]�%Wenp�=`�rf��.����(�e,���{��:�E:�F�
c�A��h7�8����*c���)����x,v�������~RsM���F�:?�'x�\�c	v}������FC~�Tn�VM���x��i~
��r�L����ǚ�^��=6���>����	�[ߙ3�N��t����=S�A߾D���ߚ��ǂ,^�    6�h(�Tw����AX�՗����ٕ�z�Y����+�gE�]y�h?h0y?�)�㱑���p�T�i{h��0mS�1�#2ꭷ��~�sGB�W3I��){ڈ�Tm��[�p����\}(��j�����ɫ3�(���3����Sr��/�M�]=E���{����ɫ����'~�8=>vJ�q��%~\!&����'��]���:��H&�Yj6�h��:E	C=��["<�""A"V�Ŷ^�-�����܍g!�]�)��+���̱YU��0��W�bⳏ�`��Y����u7�{iM�iR�2^rG��dFC���p0��iB���y�&\�rǢ�c`��_��.�������/����3ӓ���gt�L_�����kv�`�gЬ�;L2�R&S�fR�t:S̄�D����-��|�߀)����q�9�%.��?�yZ��2�E���n��~:�~�@{F�y�R��E��	�}G/�hD��Q��~�O��A��
�N�]]�����D�2�������J�]#�ZuJv.��Z��-�z��Qra̡:1g�5ى��8]C��Hk�~����l���f��a��Ў����x�I*ȳ~YOج�0>h1��J8�H�0f�s�E~Vz.���l��29[k��m�O#��U���K���IM�Y�΁ͺ�8`����ML���	v�w=��/����<ao���b�s�b���i)e ��� ��2\�
�xK�B���*N8M��M����:�V;"�4�-叽�5a��sM��fyz�5P��7�$]�%�p�N5��>/Υ���J�j�!8�����FR]�w1���_s\7+8ΜY�R�p�M�	m�ۭ~�T���Y��j�2�Tn�W���~�V��5��H*��%�o�8$1���[�����Lb� u+�o�����[Dg ��ʺ�֑��P�=C�9[���W[mo1dȷ[sk�<�/͚V�p�?����gNNzd���eccF�4W&x�>9V8�C��-ԫX1!���� ����,�����5�
XZ��Xő�	�YxLD���S�����' c����h,�o��^�RP�U��B��������o���"nw�����2h�~�J��̆�+"��V+����� �x�7�����]*Y�m�H�	��4��v�畓7��J	�u�����Tj�ܞ[���l��Y���8�L�)� eT��BC��S�Z��
U�w۴ A�y��(��6w�ek*���{������Z"zY_a���4��R��"uDk����O���W�Z���.x��A�[�<�Q��m0���P��
�z�j&g�(8��b��OF��~U�\�Y�ٍt;߮�ˑj0Z�~����Mְ-�9��r�G)�9���;.'�8)y��6-����i�����r����F��@Y;V|���⍮*2n)e��(`]����`�X֓�acr^<�,<{���t��؂�'(�l���CF�r^�Wj	�ks�IYG��\L��,�y9�ƸX�ڥ�sؽ;bo��
Ҭ�*Z�����+c��r/�Δ,�E���'�,�ѯ�LTY���8�����CJ���{)�x*���`��r}�*T�E�~��C���&��HJ�5_����5A	lW���P�9a-\E`B�M�\.��%Q�7�qV��� xO����q� �'k�侖yW����8�g��Q/�ߺ?sw���΍�����'���/���*WN�6�F�ۣ�ٞ��=�*ҩl&�.h�d���B�G����-�X�?�c���5	#���k���Q�˭��B��Y��f=�݅#���1��K��u!+MY�n$�� º|
vZ��5��A+S�G�>�H1��p��`��g���&�!��>���R�!�w��ʻ+8���U�b�����e�Ы�֔��GܳUS
�����k��6Vzop�����aw�j�R�3a�aU┣`R�V�jݣ��^�F
��u��OZ^͛k7�-%3s��H֟	�/9?�^�^N���N@�j�V�����_�^5��B���&8��}�lXs��)��E�?c�X���դ����(���V�|�v�w��mP���\��+\�V�^��3��I�Hw�����mS������;m��U ?��5��O��ʿuT��;J�tO�v�r�Zp3Ƕ�Y`�(@�1�y���
���b���W4r��f���S�2(݇q,2>99,���˖��M���s��BF��� ��M��������m��Ϗ��<wn9�=��v&�_�0?��4�+ڸr��ia9im��p)[He�����H�3��p���7IEu�[���t&�K{C�cPɊ��|���0�x��"S�U��P$��;�*]�!�8���o���"I��btg�$�nB���i^�Y��5[-n	q�sƴ{������$��"/L�?ڧ4�٪`⬽{�톈5UY���QCKq��M��rakT��}����

�3�N���뛻$:�X {u�&��6H���}MG��ѡQn��7�5b���i�fk�m̄v���n�4\	��c�K�"k�g�ͯ7vyw�643�1�!�m:!k+��Bm���o�;����'9֋c�J3� �qw˼��Q���A��p���T���z,�l�1��'-�v	g؈��y^��������0�d�i�D�X8͇���慩�ت�p�;f��G������z�`��N'�������pʙ�}`��f?=D�J���E�g��1}� ������uף/���Qk 9� ���
��"�~��?����À��ؐ��}�����$����������}��b=�b�?E|���߂�:D2�&��Ɍˎo; H��Z���~��%�lvm����x^yg��@�z�����'�K3�t��Y���i��J��'w2q���@&C��R&[*�2٢<�l����Q=�s�-��+�1'%�+D{��{�x�!D���Fr�;b4�M�-#]���lD.	 E�6K����si�@۫xޔN�b��.�ѯkn��a�t�9��2ym�$N���%�vA�G��`;��&���`�BZ�v����2��!�m���lh2��/�+�8$�\d��!=v�)n�L�>�Ѿ�f5B���;љ9�Q��d��2D~�	ſ9�-�V���\C��Oİ˗p� l.A��:��� ��PORT�U������z3t����k�Yxd�z��&Y��8Do�x���"����G����s	��I�^J�%��LL��E������p��x��c[���mn�7�@u� �F	I����%
�.�Yٴ�M�k�
�Ł����6��JQ�B�N��S"9�����~Q]�7����q;vkH~�a/o-��d6|���V���DU��P�iE�,�e��=�.��Qr�^��뇖Y�vJy�� a<�#<;}���P�\cu��<��]�T.�.\�x��pa��TbG8�/eҩ|�0<\����Q}��=Y��z8���-�p Jx�њ�|IW�����H����׿���)O��yzԧe&M��ҝ�j���<�ٸ8>49:4;7����]�xP��ӈKN��A��.�r)�b���B�L)���I冋��Q��V��{��{Fɜ����0�}�R@; 1;�P�76<|or��X�&D�N7���չj�F.��^�V���s^���p�8k�	q���-t���>�g|�� �X�x!��Z�&`:ZNW�Ѥ�Ԯ�$I�si�`�>� B�Rw�BA�- o��wxn�#_,�[�-1��2���+q�]��w!��E�8������/�-T��앛u^�´kh?�pD|ټo�@B ��%E�M�۝��Ɨ�����5�˻����F�7�iW��1*�i,.u�^�\����d���&�!��tz�/͆�@;p岼��W� ��a+��O��&PT�$���%׬D(ć��pցo��������@w�z�1��3p߀����m���G.���#�8"���z�/��<��ٸ��<nv �  �$k��%�k2'\ُP����%�l<ܽ���KweuG���o�3����K�%�k� ��Iv{07�I�c����j���˭��!��_� p�^���G(ֹ�W����"[���G�]h�4����j��-�_O�[Ci�4l��!�<��GS�=��W
��o_�F2�ڷ��K7�SW��,�xpq`�=����d�@���=�B*=�,)?�JԿͦ�9�Dt�[,�|�L:��1h��R��c"��X	]��t!q�d#��|`���7�D��M��L6�^�^�������?����T�;���ԭ��ٰ�����2�^m�n����:�7pm��b��w)���R3�b�x��GsO�!=�����a�F�\X���E����z���]�/x�j�\���G�0A�Ec�o����Īw�/�+5��y(<C��s a�I&�����u_�Q/ٳ�W�b�[�ނ��_b��Q�~2��_k��V���1�=�!|�l�*)�f��?�D0����p�1\3���UE������c~h�ql���	Ƀ�Pc�0LÔ*�=�� n1���]P�������*��E�!��X���!`�5rW�p �ۨ�v��oͣ�P{������_�.�}f*���
��'�橺rb�;!��j4C��\\����t�����Oί��
w��]�~s��t�q����O��_N'u��y��e��Á��͐�p)��'�ӃC�݋��7�������e�            x��Z[�붕~����EI�OG��-[���@�e[�mɖ��SәA;A3�&h���� i� E��7��E_����r�� �Ey��׍F��� ��,k���a�~��]�o�պ)(�ʰ+�/Ϸ��1X�����,!�N�	}�4r�q'  �1��"JQ$c�[�{z����O��d�_<=������?}z����;��[������O��==����Ot�{M�~����CB(>�V|E�#�r���\~^2z��b���Ա��#.K#�k2�Y�sy�s#>�+�"A%�t߯�����O�_S^�Oo������G�1��#��wO����}=���3��7b�2B�22`VZ��İXH�� 7�S~�^�G�:͈v�׳��Jێݹ��cӋ���yA	EP�,���g�}ƾ��o7���q�o�\��?r�E�~��;o�A�����wn^�-[1�!�M]5�m}�wK�}`ԥMs�χ�,XάW���8%�� ��w8x�� �8$��b��E:I���f�m��s�^<&p�ha-�!-��\�®J��l�R}��BR���RN%�=h�!���@&~ҫZ�xYG �< �!^��(�	)Cé��x��B��u0���=�]%�����~ �0Z5�8��(c%��C�U����P�ۘ$s�ּRE���3L!*7 EE:}����W�x_���W3^
.�vQ��u� ��{%~�'���Wv�E���k|3i���&�����5p(ā�  �Yx$�P�������zK�ӟ9���2����Ԃ��;$F��7�׭�h�4�=��<�V�	����B��鞝�u���T��A�*	���7�!�j^�YFQ��y#�Q=2FGq{qڋQ%{c�P��B��s�te�/���}35�J_Z��Q���AM�9�a��&nSPy����,I2�"] zو�@i��?>��5(L���r�6�vzbI��8Jo��}��La��ƨ�.���s���ž<W^ ��n6��mL�"����\�`�-N[L�9}�v��g����,�Ѫ�bG�覎�lolE�"��Y��ik��l��j�=�����Q�a�(���WP���+�p����DSU�a��o����+v}�u���O�1A�|" ��-k��,~~�K̴�${ �#�㑠u�U�6��%㍳(���vt�V�t�5"ԛ��@QB�H'�.prj�P�S��;ً���b�B����r�^���7��~u7�W����@��j_�ͻj���AG�,ː��
Ƶ4�� t�B����P�"]tq@�����?��c��/8f��b���X�����c"�JtW�ŝ]$XπDt_t�j*~����.S��z=��73I]�;���|�8�*�CE�Q$�����*�tf���y�+*)!1����N��Сn=?��ݢ���|��{��ԥJ٨�U_{��Ѓ��@x	)�$=�f��]�a�)ޢ]�D�H�ZI-�@/�;���
�'��l��|��+��O)`e��I�U���=F2/a	H8�t	7i��5�/Ͼ�����T�^_P����e�0�xz��5��1��~)��`�[�	����a����j����Y�[��R]nյ�l�3��9�p�Rt4��2�$DI"(�t����J�b<�`_�o?f���wFq�5�λbH
��c��v�/�ԝj���^��ٍ��ۥ�P�o;��3�m�ȧ�j����-�����J �P �Q���}T��J���pΰ?���JW���Wt�=[��s?l���ǐJH�cн��h��TR*���� i���ɹ���Z{<��#���>m{]�
�W
�КQc&��K���Z|��YJ��c,��q�w;�{�Qw�C$��r+�V%�/�a:��mi�����jfLuu?��VѰ��F�`����t�3n� b��y, �2�M���+�~l��sq�� �X:��:���$��L��_�� �Vg�����Ҩ��aO���d��M9+����$Ƈ͘��8��5ծcm�JX�� �D"��D�����m�/��~r���������KL�jܲ=p��Ls�.��u�&���Xd�݆�����gN����1���-��a���r���oآ��ٹ/�s�a|�������yKL�a�N��/�=/��ҕHg>��v"�,*�����^n㭹\O�+X�a�fBX�1$ F���[�|ĲO���S�O;�e��X���.��U�~u�3����_������?����!��0J�S��tc*8J=���&�YS2Ƭ�X�[d
�b;���b/���^._x:��"��' I:-���n�	��lˏs���qߊ��3M�m/R)1���l-o���>�K=8y�W�	{��l�S-��"���7Q���z�� �<�R�(�	�Z�t��#��E���Z�J��� �6O�U�7Y��h����L��~n�e?�	}�����R`H���"�Jd]��ea�0E��/��)#���YȖGu��t��%'��kNUYX��Hs=�2J�p�/Q$` �3�[�s��~	��/��F`��v�7EK�ei��a�j�kX�!�q6-nV���Z2j�v��0���M�nx�K�$^ y7ኯ�d,�3�ț��7�)��Fϓ��!�;:�;�U`ռ���騸���.q��ș5a��͐5�_q�i � 
��,�Q�y ��8��MN3�$
���x�� �j�P�
Ê��c���Dj/[��o����mk'&�`�vI�n "�<�@�(�	`���F�I�X��GC�u��*֤j {I��6�)�n���D+��_��n�Z:��6�}� K��, ���mb%�t�����ȇ��o8��o�Z����l� �q�f��iwg�]@ҹ��X�r���LZ�����Ƞz����8���lm]�VX�L��ȋ4L�(�j�{)'�{��
g�w�ӔI�/�&�t�'�J�a�i��MuRΗ����o�'މˎ�&S?������ xH &R��k�(��7��a���QMi9_�7���L�b�ju׭���VWq]e����޾�^U���{����#/�b�=W�N��-��i3��ŏ��D���>m|8��J�Ѥ�WfY�,-3j��-K�Lu�'3��֡�̹�VZ˶`ik��V��]I4���Y� �Q�Z! ׷P��C�������nR��7m;���� ����7\�i�*��3�����x_jRwm����Hhy$�i%)�t��o��r���-N[L�9� ��O�*�;�C-
��VQ�ժfΚn/)L
���M_ӻ���S{c�6�kY�P`4j�)2T$�#I'�G(፵P��Pc85�oNw�t��5i�o7��~��ڛ��$R�l��P�9��]7����R;��-�Z�G4RX�1��YE��!��x�Q�l`��q��s7>0c�rr�請�j�u��6:�q�er��= ��|�����Fb&�)nw4�����"��O��H�	����ti���tih�u��S�J�����;먕*�J[?���M�t�pU��CJ�dR+�4�Z��R��б:hsxV6��f��A
��$LdE�N	<s�9�@֣
'�9�n�;皓����(��C�X���֟�e&�ag�!��FK˛���x�j�޳�I@�`���B��(�	�̙.G�	$rE�����19;�[�j���!S3k��� �)m�	�Mra�C�_r�M!�;ē��U�34<�_'�0WG��E�r����t�-�i�D^:�(�}��_Qb��ٶ��6��K��"鬺��b5$YP�Z�_���Sʢ�$����/�Ȩ�4R��V�#PA
.��H��9
�P��P'�9.�q��¤�Zo� ]��.�8>	�v�Ұ�+Jz�:��B,u�uO_�N�`��E%�t}n$���Qȅ�ҽD ��4x�~қ�"�kͥ��.��'V���q��i�����Ҷ~���@�H'&�'�� C�0�5��~�*���N-�T��3�<�Z�9 b  R�f-�ꥫn.P;�)kaZ���r�� 04 I Q�{5�0��4�:.�/Ε����^�~���$�M��7���"�����5���N�{�C�L��h�V�]4�|c��hn�U�z������F��J���r�/�� ����]��5O9��49�4=�`�!~|���1^#�:�W��Rk^�����M��J���$1If��ֵ��R�n(R�-M+�+Sp�BRpX�@��H���p��}}<����Q�a:(s���s���T�ꆯ��WyU���`Q��V�R�)�n*�{m�n�Ў�*����C��
�T�S���n��M���U����ci�����������[���g�-����PlK;�D�:T���^�i�Y��=/��mb��m�Ŷa˹�Є���z�Pw�B^�b�i�z���ȩ�x<��tx)�0V�<����W�õ&�mn��ҟkw����-��y{H=,E�"d���E�	r���ݢef�QK^j�;�%��Juң�tý��B}��\x����O�C��s<8
M凌��_F�:p����x�x�jʜ8״��g�g�[���lW�g����W&���H�_]����69��db�絁6�S��V�-)����Hxf��E:�2����1�s�ߏ&�xTz<�����������؇������Ν`t�
��z�NZm���<�C�i6p��)�mz��t��ˇQ-���Z�j�X�)�0T�(҉���:ܚ2����O���`������L?:ie�XXLxwR1�*HVʥmjK(k��d��|~�ZNeE@���V&�U�R�H`]3u��Bx�K"%�t��|�G{��X�� ���W      B      x������ � �     