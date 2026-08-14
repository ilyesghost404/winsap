--
-- PostgreSQL database dump
--

\restrict lJVd3QnEWYelqcSxSspPvi84roC5xSsISn2FVHX7CqR53IZBXVBCqA4qEGmgLIm

-- Dumped from database version 18.4 (Debian 18.4-1+b1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1+b1)

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

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.login_history DROP CONSTRAINT IF EXISTS login_history_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leave_transactions DROP CONSTRAINT IF EXISTS fk_leave_transactions_employee;
ALTER TABLE IF EXISTS ONLY public.leave_balances DROP CONSTRAINT IF EXISTS fk_leave_balances_employee;
ALTER TABLE IF EXISTS ONLY public.absences DROP CONSTRAINT IF EXISTS fk_employee;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS fk_attendance_employee;
ALTER TABLE IF EXISTS ONLY public.face_security_logs DROP CONSTRAINT IF EXISTS face_security_logs_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.face_profiles DROP CONSTRAINT IF EXISTS face_profiles_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS email_verification_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cra_entries DROP CONSTRAINT IF EXISTS cra_entries_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_qr_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_target_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_actor_id_fkey;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
DROP TRIGGER IF EXISTS update_leave_balances_updated_at ON public.leave_balances;
DROP TRIGGER IF EXISTS update_cra_entries_updated_at ON public.cra_entries;
DROP INDEX IF EXISTS public.idx_qr_sessions_token;
DROP INDEX IF EXISTS public.idx_notifications_user_unread;
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_notifications_created_at;
DROP INDEX IF EXISTS public.idx_leave_transactions_employee;
DROP INDEX IF EXISTS public.idx_leave_balances_employee;
DROP INDEX IF EXISTS public.idx_face_security_logs_employee_id;
DROP INDEX IF EXISTS public.idx_face_profiles_employee_id;
DROP INDEX IF EXISTS public.idx_employees_email_address;
DROP INDEX IF EXISTS public.idx_cra_status;
DROP INDEX IF EXISTS public.idx_cra_entries_end_time;
DROP INDEX IF EXISTS public.idx_cra_employee_pending;
DROP INDEX IF EXISTS public.idx_cra_employee;
DROP INDEX IF EXISTS public.idx_absences_source;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_employee_id_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_key;
ALTER TABLE IF EXISTS ONLY public.user_settings DROP CONSTRAINT IF EXISTS user_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS unique_employee_daily_attendance;
ALTER TABLE IF EXISTS ONLY public.qr_sessions DROP CONSTRAINT IF EXISTS qr_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.login_history DROP CONSTRAINT IF EXISTS login_history_pkey;
ALTER TABLE IF EXISTS ONLY public.leave_transactions DROP CONSTRAINT IF EXISTS leave_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.leave_balances DROP CONSTRAINT IF EXISTS leave_balances_pkey;
ALTER TABLE IF EXISTS ONLY public.leave_balances DROP CONSTRAINT IF EXISTS leave_balances_employee_id_key;
ALTER TABLE IF EXISTS ONLY public.holidays DROP CONSTRAINT IF EXISTS holidays_pkey;
ALTER TABLE IF EXISTS ONLY public.face_security_logs DROP CONSTRAINT IF EXISTS face_security_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.face_profiles DROP CONSTRAINT IF EXISTS face_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.face_profiles DROP CONSTRAINT IF EXISTS face_profiles_employee_id_key;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_matricule_key;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_email_key;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS email_verification_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE IF EXISTS ONLY public.cra_entries DROP CONSTRAINT IF EXISTS cra_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.absences DROP CONSTRAINT IF EXISTS absences_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.qr_sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.password_reset_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.login_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.leave_transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.leave_balances ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.holidays ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.face_security_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.face_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employees ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.email_verification_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.departments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cra_entries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.attendance ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.absences ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_settings_id_seq;
DROP TABLE IF EXISTS public.user_settings;
DROP SEQUENCE IF EXISTS public.user_sessions_id_seq;
DROP TABLE IF EXISTS public.user_sessions;
DROP SEQUENCE IF EXISTS public.qr_sessions_id_seq;
DROP TABLE IF EXISTS public.qr_sessions;
DROP SEQUENCE IF EXISTS public.password_reset_tokens_id_seq;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.login_history_id_seq;
DROP TABLE IF EXISTS public.login_history;
DROP SEQUENCE IF EXISTS public.leave_transactions_id_seq;
DROP TABLE IF EXISTS public.leave_transactions;
DROP SEQUENCE IF EXISTS public.leave_balances_id_seq;
DROP TABLE IF EXISTS public.leave_balances;
DROP SEQUENCE IF EXISTS public.holidays_id_seq;
DROP TABLE IF EXISTS public.holidays;
DROP SEQUENCE IF EXISTS public.face_security_logs_id_seq;
DROP TABLE IF EXISTS public.face_security_logs;
DROP SEQUENCE IF EXISTS public.face_profiles_id_seq;
DROP TABLE IF EXISTS public.face_profiles;
DROP SEQUENCE IF EXISTS public.employees_id_seq;
DROP TABLE IF EXISTS public.employees;
DROP SEQUENCE IF EXISTS public.email_verification_tokens_id_seq;
DROP TABLE IF EXISTS public.email_verification_tokens;
DROP SEQUENCE IF EXISTS public.departments_id_seq;
DROP TABLE IF EXISTS public.departments;
DROP SEQUENCE IF EXISTS public.cra_entries_id_seq;
DROP TABLE IF EXISTS public.cra_entries;
DROP SEQUENCE IF EXISTS public.attendance_id_seq;
DROP TABLE IF EXISTS public.attendance;
DROP SEQUENCE IF EXISTS public.activity_logs_id_seq;
DROP TABLE IF EXISTS public.activity_logs;
DROP SEQUENCE IF EXISTS public.absences_id_seq;
DROP TABLE IF EXISTS public.absences;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
--
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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: absences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.absences (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    type character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    status character varying(30) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    validated_at timestamp without time zone,
    document_url text,
    source character varying(30) DEFAULT 'employee_request'::character varying NOT NULL,
    CONSTRAINT valid_absence_dates CHECK ((end_date >= start_date)),
    CONSTRAINT valid_absence_source CHECK (((source)::text = ANY ((ARRAY['employee_request'::character varying, 'automatic'::character varying])::text[]))),
    CONSTRAINT valid_absence_type CHECK (((type)::text = ANY ((ARRAY['Vacation'::character varying, 'Sick Leave'::character varying, 'Training'::character varying, 'Other'::character varying, 'Telework'::character varying])::text[]))),
    CONSTRAINT valid_status CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Validated'::character varying, 'Rejected'::character varying])::text[])))
);


ALTER TABLE public.absences OWNER TO postgres;

--
-- Name: absences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.absences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.absences_id_seq OWNER TO postgres;

--
-- Name: absences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.absences_id_seq OWNED BY public.absences.id;


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    actor_id integer,
    action_type character varying(50) NOT NULL,
    target_user_id integer,
    description text,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    browser character varying(100),
    device character varying(100)
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    date date NOT NULL,
    check_in time without time zone,
    check_out time without time zone,
    status character varying(30) DEFAULT 'Present'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    validation_status character varying(30) DEFAULT 'Pending'::character varying,
    justification_reason text,
    face_verified boolean DEFAULT false,
    qr_verified boolean DEFAULT false,
    face_confidence double precision,
    verification_method character varying(50),
    qr_session_id integer,
    device_information text,
    verification_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_attendance_status CHECK (((status)::text = ANY ((ARRAY['Present'::character varying, 'Late'::character varying, 'Absent'::character varying])::text[])))
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_id_seq OWNER TO postgres;

--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: cra_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cra_entries (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    ticket_reference character varying(100) NOT NULL,
    description text NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    duration_minutes integer,
    status character varying(30) DEFAULT 'PENDING_START'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    priority integer DEFAULT 0 NOT NULL,
    source character varying(20) DEFAULT 'manual'::character varying,
    CONSTRAINT valid_cra_duration CHECK ((duration_minutes >= 0)),
    CONSTRAINT valid_cra_status CHECK (((status)::text = ANY ((ARRAY['PENDING_START'::character varying, 'IN_PROGRESS'::character varying, 'PENDING_APPROVAL'::character varying, 'COMPLETED'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[]))),
    CONSTRAINT valid_cra_times CHECK ((end_time >= start_time))
);


ALTER TABLE public.cra_entries OWNER TO postgres;

--
-- Name: cra_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cra_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cra_entries_id_seq OWNER TO postgres;

--
-- Name: cra_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cra_entries_id_seq OWNED BY public.cra_entries.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_verification_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_verification_tokens OWNER TO postgres;

--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_verification_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_verification_tokens_id_seq OWNER TO postgres;

--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_verification_tokens_id_seq OWNED BY public.email_verification_tokens.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    matricule character varying(50) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(150),
    phone character varying(20),
    "position" character varying(100),
    hire_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    department_id integer,
    email_address character varying(150),
    avatar_url character varying(500),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: face_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.face_profiles (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    registered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    face_enabled boolean DEFAULT true,
    face_registered_at timestamp without time zone,
    last_face_verification timestamp without time zone,
    face_embedding jsonb,
    embedding_version character varying(50) DEFAULT 'arcface_v1'::character varying,
    CONSTRAINT face_profiles_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'disabled'::character varying])::text[])))
);


ALTER TABLE public.face_profiles OWNER TO postgres;

--
-- Name: face_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.face_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.face_profiles_id_seq OWNER TO postgres;

--
-- Name: face_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.face_profiles_id_seq OWNED BY public.face_profiles.id;


--
-- Name: face_security_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.face_security_logs (
    id integer NOT NULL,
    employee_id integer,
    action character varying(50) NOT NULL,
    result character varying(50) NOT NULL,
    confidence double precision,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.face_security_logs OWNER TO postgres;

--
-- Name: face_security_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.face_security_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.face_security_logs_id_seq OWNER TO postgres;

--
-- Name: face_security_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.face_security_logs_id_seq OWNED BY public.face_security_logs.id;


--
-- Name: holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.holidays (
    id integer NOT NULL,
    holiday_date date NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) DEFAULT 'National'::character varying,
    recurring boolean DEFAULT false,
    description text,
    color character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    end_date date
);


ALTER TABLE public.holidays OWNER TO postgres;

--
-- Name: holidays_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.holidays_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.holidays_id_seq OWNER TO postgres;

--
-- Name: holidays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.holidays_id_seq OWNED BY public.holidays.id;


--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_balances (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    paid_leave_balance numeric(5,2) DEFAULT 0.00 NOT NULL,
    sick_leave_balance numeric(5,2) DEFAULT 5.00 NOT NULL,
    last_accrual_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_paid_balance_nonnegative CHECK ((paid_leave_balance >= (0)::numeric)),
    CONSTRAINT chk_sick_balance_nonnegative CHECK ((sick_leave_balance >= (0)::numeric))
);


ALTER TABLE public.leave_balances OWNER TO postgres;

--
-- Name: leave_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_balances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_balances_id_seq OWNER TO postgres;

--
-- Name: leave_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_balances_id_seq OWNED BY public.leave_balances.id;


--
-- Name: leave_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_transactions (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    leave_type character varying(20) NOT NULL,
    amount numeric(5,2) NOT NULL,
    transaction_type character varying(20) NOT NULL,
    reference_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_leave_type CHECK (((leave_type)::text = ANY ((ARRAY['paid'::character varying, 'sick'::character varying])::text[]))),
    CONSTRAINT chk_transaction_type CHECK (((transaction_type)::text = ANY ((ARRAY['ACCRUAL'::character varying, 'DEDUCTION'::character varying, 'REFUND'::character varying, 'ADJUSTMENT'::character varying])::text[])))
);


ALTER TABLE public.leave_transactions OWNER TO postgres;

--
-- Name: leave_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_transactions_id_seq OWNER TO postgres;

--
-- Name: leave_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_transactions_id_seq OWNED BY public.leave_transactions.id;


--
-- Name: login_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    login_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address character varying(45),
    success boolean DEFAULT true,
    logout_time timestamp without time zone,
    browser character varying(100),
    device character varying(100)
);


ALTER TABLE public.login_history OWNER TO postgres;

--
-- Name: login_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_history_id_seq OWNER TO postgres;

--
-- Name: login_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_history_id_seq OWNED BY public.login_history.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(150) NOT NULL,
    message text NOT NULL,
    type character varying(50),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reference_id integer,
    reference_type character varying(50),
    read_at timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: qr_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qr_sessions (
    id integer NOT NULL,
    company_id integer DEFAULT 1,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.qr_sessions OWNER TO postgres;

--
-- Name: qr_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qr_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.qr_sessions_id_seq OWNER TO postgres;

--
-- Name: qr_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qr_sessions_id_seq OWNED BY public.qr_sessions.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_jti character varying(255) NOT NULL,
    ip_address character varying(45),
    browser character varying(100),
    device character varying(100),
    expires_at timestamp without time zone NOT NULL,
    last_activity timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_sessions_id_seq OWNER TO postgres;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    id integer NOT NULL,
    user_id integer,
    email_notifications boolean DEFAULT true,
    absence_notifications boolean DEFAULT true,
    holiday_notifications boolean DEFAULT true,
    report_notifications boolean DEFAULT true,
    theme character varying(20) DEFAULT 'light'::character varying,
    density character varying(20) DEFAULT 'comfortable'::character varying,
    sidebar_collapsed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approval_notifications boolean DEFAULT true,
    compact_mode boolean DEFAULT false
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: user_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_settings_id_seq OWNER TO postgres;

--
-- Name: user_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_settings_id_seq OWNED BY public.user_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    employee_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    failed_attempts integer DEFAULT 0,
    locked_until timestamp without time zone,
    is_verified boolean DEFAULT false,
    two_factor_enabled boolean DEFAULT false,
    two_factor_type character varying(20),
    totp_secret character varying(255),
    password_changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    account_status character varying(20) DEFAULT 'Active'::character varying,
    activation_token character varying(255),
    activation_token_expiry timestamp without time zone,
    activated_at timestamp without time zone,
    reset_password_code character varying(10),
    reset_password_code_expiry timestamp without time zone,
    reset_password_verified boolean DEFAULT false,
    face_id_enabled boolean DEFAULT false,
    avatar_url character varying(500),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'manager'::character varying, 'employee'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: absences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences ALTER COLUMN id SET DEFAULT nextval('public.absences_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: cra_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cra_entries ALTER COLUMN id SET DEFAULT nextval('public.cra_entries_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: email_verification_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens ALTER COLUMN id SET DEFAULT nextval('public.email_verification_tokens_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: face_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.face_profiles ALTER COLUMN id SET DEFAULT nextval('public.face_profiles_id_seq'::regclass);


--
-- Name: face_security_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.face_security_logs ALTER COLUMN id SET DEFAULT nextval('public.face_security_logs_id_seq'::regclass);


--
-- Name: holidays id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays ALTER COLUMN id SET DEFAULT nextval('public.holidays_id_seq'::regclass);


--
-- Name: leave_balances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances ALTER COLUMN id SET DEFAULT nextval('public.leave_balances_id_seq'::regclass);


--
-- Name: leave_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_transactions ALTER COLUMN id SET DEFAULT nextval('public.leave_transactions_id_seq'::regclass);


--
-- Name: login_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history ALTER COLUMN id SET DEFAULT nextval('public.login_history_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: qr_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_sessions ALTER COLUMN id SET DEFAULT nextval('public.qr_sessions_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: user_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings ALTER COLUMN id SET DEFAULT nextval('public.user_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: absences; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.absences VALUES (1, 4, 'Sick Leave', '2026-07-27', '2026-07-31', 'mridh', 'Validated', '2026-07-23 11:04:15.71188', '2026-07-23 11:04:34.691306', NULL, 'employee_request');
INSERT INTO public.absences VALUES (5, 4, 'Telework', '2026-08-06', '2026-08-06', 'Working from home on API specs', 'Validated', '2026-08-06 11:23:27.793399', '2026-08-06 11:23:27.818711', NULL, 'employee_request');
INSERT INTO public.absences VALUES (7, 4, 'Telework', '2026-08-07', '2026-08-07', 'Work from home tomorrow (Quick request)', 'Rejected', '2026-08-06 11:25:03.596887', '2026-08-06 11:27:00.91596', NULL, 'employee_request');
INSERT INTO public.absences VALUES (31, 33, 'Other', '2026-08-12', '2026-08-12', 'Automatic absence - no check-in detected', 'Validated', '2026-08-12 17:30:00.046982', NULL, NULL, 'automatic');
INSERT INTO public.absences VALUES (32, 1, 'Other', '2026-08-12', '2026-08-12', 'Automatic absence - no check-in detected', 'Validated', '2026-08-12 17:30:00.050826', NULL, NULL, 'automatic');
INSERT INTO public.absences VALUES (33, 15, 'Other', '2026-08-12', '2026-08-12', 'Automatic absence - no check-in detected', 'Validated', '2026-08-12 17:30:00.053215', NULL, NULL, 'automatic');
INSERT INTO public.absences VALUES (34, 4, 'Other', '2026-08-12', '2026-08-12', 'Automatic absence - no check-in detected', 'Validated', '2026-08-12 17:30:00.057561', NULL, NULL, 'automatic');
INSERT INTO public.absences VALUES (36, 39, 'Vacation', '2026-08-18', '2026-08-20', 'test', 'Validated', '2026-08-14 11:50:06.043831', '2026-08-14 11:55:45.816112', NULL, 'employee_request');
INSERT INTO public.absences VALUES (13, 4, 'Sick Leave', '2026-08-19', '2026-08-21', 'mo', 'Validated', '2026-08-11 19:26:56.888448', '2026-08-11 19:27:11.461317', NULL, 'employee_request');
INSERT INTO public.absences VALUES (14, 4, 'Vacation', '2026-09-10', '2026-09-11', 'looo', 'Rejected', '2026-08-11 19:28:22.406027', '2026-08-11 19:28:40.059261', NULL, 'employee_request');
INSERT INTO public.absences VALUES (15, 4, 'Vacation', '2026-09-10', '2026-09-11', 'lo', 'Rejected', '2026-08-11 19:29:15.252289', '2026-08-11 19:32:16.721566', NULL, 'employee_request');
INSERT INTO public.absences VALUES (37, 39, 'Telework', '2026-08-21', '2026-08-21', 'd', 'Rejected', '2026-08-14 12:32:18.323574', '2026-08-14 12:32:40.863435', NULL, 'employee_request');


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.activity_logs VALUES (1, 1, 'login', 1, 'User ''ilyes'' logged in', '::ffff:127.0.0.1', '2026-07-23 10:32:56.958205', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (2, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-07-23 10:34:03.674644', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (3, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-07-23 10:43:01.24123', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (5, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-07-23 10:45:30.100744', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (4, 1, 'user_created', NULL, 'User ''ilyeshmid'' created with role ''manager'' by admin ''ilyes''. Activation email sent.', '::1', '2026-07-23 10:43:42.456834', NULL, NULL);
INSERT INTO public.activity_logs VALUES (6, 1, 'user_deleted', NULL, 'User ''ilyeshmid'' deleted by ''ilyes''', '::1', '2026-07-23 10:45:50.324162', NULL, NULL);
INSERT INTO public.activity_logs VALUES (8, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-07-23 10:48:54.4017', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (9, 1, 'login', 1, 'User ''ilyes'' logged in', '::ffff:127.0.0.1', '2026-07-23 10:49:45.525484', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (11, 1, 'login', 1, 'User ''ilyes'' logged in', '::ffff:127.0.0.1', '2026-07-23 10:50:14.033897', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (14, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-07-23 10:51:09.359826', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (15, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-07-23 10:51:25.775808', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (7, 1, 'user_created', NULL, 'User ''ilyesM'' created with role ''manager'' by admin ''ilyes''. Activation email sent.', '::1', '2026-07-23 10:46:15.641994', NULL, NULL);
INSERT INTO public.activity_logs VALUES (16, 1, 'user_deleted', NULL, 'User ''ilyesM'' deleted by ''ilyes''', '::1', '2026-07-23 10:51:40.401393', NULL, NULL);
INSERT INTO public.activity_logs VALUES (18, 1, 'login', 1, 'User ''ilyes'' logged in', '::ffff:127.0.0.1', '2026-07-23 10:54:15.471368', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (21, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-07-23 10:55:26.037453', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (23, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-07-23 10:55:57.555239', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (19, 1, 'user_created', NULL, 'User ''mgr_verified_1784800455491'' created with role ''manager'' by admin ''ilyes''.', '::ffff:127.0.0.1', '2026-07-23 10:54:15.568637', NULL, NULL);
INSERT INTO public.activity_logs VALUES (20, NULL, 'login', NULL, 'User ''mgr_verified_1784800455491'' logged in', '::ffff:127.0.0.1', '2026-07-23 10:54:15.659228', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (24, 1, 'user_deleted', NULL, 'User ''mgr_verified_1784800455491'' deleted by ''ilyes''', '::1', '2026-07-23 10:56:00.602469', NULL, NULL);
INSERT INTO public.activity_logs VALUES (17, 1, 'user_created', NULL, 'User ''ilyes_manager'' created with role ''manager'' by admin ''ilyes''.', '::1', '2026-07-23 10:52:05.94006', NULL, NULL);
INSERT INTO public.activity_logs VALUES (22, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-07-23 10:55:49.932793', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (25, 1, 'user_deleted', NULL, 'User ''ilyes_manager'' deleted by ''ilyes''', '::1', '2026-07-23 10:56:02.319675', NULL, NULL);
INSERT INTO public.activity_logs VALUES (12, 1, 'user_created', NULL, 'User ''manager_fixed'' created with role ''manager'' by admin ''ilyes''.', '::ffff:127.0.0.1', '2026-07-23 10:50:14.12784', NULL, NULL);
INSERT INTO public.activity_logs VALUES (13, NULL, 'login', NULL, 'User ''manager_fixed'' logged in', '::ffff:127.0.0.1', '2026-07-23 10:50:14.20429', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (26, 1, 'user_deleted', NULL, 'User ''manager_fixed'' deleted by ''ilyes''', '::1', '2026-07-23 10:56:04.060087', NULL, NULL);
INSERT INTO public.activity_logs VALUES (10, 1, 'user_created', NULL, 'User ''manager_test'' created with role ''manager'' by admin ''ilyes''. Activation email sent.', '::ffff:127.0.0.1', '2026-07-23 10:49:47.175444', NULL, NULL);
INSERT INTO public.activity_logs VALUES (27, 1, 'user_deleted', NULL, 'User ''manager_test'' deleted by ''ilyes''', '::1', '2026-07-23 10:56:06.432023', NULL, NULL);
INSERT INTO public.activity_logs VALUES (28, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-07-23 10:58:38.97189', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (31, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-07-23 11:01:57.491481', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (32, 1, 'user_created', 9, 'User ''ilyes_benhmid'' created with role ''employee'' by admin ''ilyes''.', '::1', '2026-07-23 11:02:33.128053', NULL, NULL);
INSERT INTO public.activity_logs VALUES (33, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in', '::1', '2026-07-23 11:03:30.681988', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (35, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in', '::1', '2026-07-23 11:05:59.032163', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (37, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::ffff:127.0.0.1', '2026-08-06 10:25:14.495124', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (38, NULL, 'login', NULL, 'User ''testadmin'' logged in', '::ffff:127.0.0.1', '2026-08-06 10:25:31.162423', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (39, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::ffff:127.0.0.1', '2026-08-06 10:25:45.96079', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (40, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::ffff:127.0.0.1', '2026-08-06 10:26:04.475767', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (41, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::ffff:127.0.0.1', '2026-08-06 10:26:25.424818', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (42, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in', '::1', '2026-08-06 10:32:40.387613', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (43, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 10:33:31.331259', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (44, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 10:35:11.88219', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (46, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 10:35:23.827049', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (47, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::ffff:127.0.0.1', '2026-08-06 10:44:04.249148', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (48, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 10:45:56.023134', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (188, NULL, 'login', NULL, 'User ''testadmin_act'' logged in', '::ffff:127.0.0.1', '2026-08-12 09:42:01.215566', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (30, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-07-23 11:00:16.846044', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (34, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-07-23 11:04:23.604684', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (36, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 10:18:02.958066', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (29, 1, 'user_created', NULL, 'User ''ilyes_manager'' created with role ''manager'' by admin ''ilyes''.', '::1', '2026-07-23 10:59:15.910522', NULL, NULL);
INSERT INTO public.activity_logs VALUES (45, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 10:35:16.193625', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (49, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 11:10:26.885198', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (189, NULL, 'user_created', NULL, 'User ''front_test_user'' created with role ''employee'' by admin ''testadmin_act''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 09:42:01.269008', NULL, NULL);
INSERT INTO public.activity_logs VALUES (201, NULL, 'login', NULL, 'User ''mgr_admin'' logged in', '::ffff:127.0.0.1', '2026-08-12 10:42:09.539284', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (217, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-12 11:08:42.079659', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (202, NULL, 'user_created', NULL, 'User ''emp_user_final'' created with role ''employee'' by admin ''mgr_admin''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 10:42:09.572045', NULL, NULL);
INSERT INTO public.activity_logs VALUES (203, NULL, 'login', NULL, 'User ''emp_user_final'' logged in', '::1', '2026-08-12 10:42:15.363618', 'Chrome Headless', 'Linux');
INSERT INTO public.activity_logs VALUES (210, NULL, 'login', NULL, 'User ''timing_admin'' logged in', '::ffff:127.0.0.1', '2026-08-12 10:53:07.968862', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (211, NULL, 'user_created', NULL, 'User ''timing_emp'' created with role ''employee'' by admin ''timing_admin''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 10:53:08.016623', NULL, NULL);
INSERT INTO public.activity_logs VALUES (228, 59, 'login', 59, 'User ''ilyes_manager'' logged in', '::1', '2026-08-12 12:07:44.189149', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (222, NULL, 'login', NULL, 'User ''prof_test_user'' logged in', '::ffff:127.0.0.1', '2026-08-12 12:00:42.274553', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (239, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-12 14:25:30.3942', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (234, NULL, 'login', NULL, 'User ''notif_test_user'' logged in', '::ffff:127.0.0.1', '2026-08-12 12:21:41.853844', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (241, 59, 'login', 59, 'User ''ilyes_manager'' logged in', '::1', '2026-08-13 18:18:56.998924', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (246, 1, 'account_disabled', 72, 'Account ''winsap_manager'' disabled by ''ilyes''', '::1', '2026-08-13 18:55:14.507972', NULL, NULL);
INSERT INTO public.activity_logs VALUES (50, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 11:10:43.24051', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (52, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 11:19:32.408023', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (54, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 11:21:27.019646', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (229, NULL, 'login', NULL, 'User ''mgr_persistence_user'' logged in', '::1', '2026-08-12 12:11:17.519102', 'Chrome Headless', 'Linux');
INSERT INTO public.activity_logs VALUES (56, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 11:34:52.531153', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (58, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 11:41:14.849273', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (190, NULL, 'login', NULL, 'User ''testadmin_e2e'' logged in', '::ffff:127.0.0.1', '2026-08-12 09:42:39.705672', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (60, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 11:44:46.849049', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (61, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 11:44:58.69601', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (191, NULL, 'user_created', NULL, 'User ''testuser_e2e'' created with role ''employee'' by admin ''testadmin_e2e''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 09:42:39.753928', NULL, NULL);
INSERT INTO public.activity_logs VALUES (63, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 12:02:35.995865', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (204, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-12 10:43:26.370694', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (65, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 12:03:12.745755', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (205, 1, 'user_deleted', NULL, 'User ''lays'' deleted by ''ilyes''', '::1', '2026-08-12 10:43:32.005325', NULL, NULL);
INSERT INTO public.activity_logs VALUES (67, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:11:00.62201', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (69, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:12:47.325165', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (71, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:13:38.665756', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (73, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:20:14.907707', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (235, NULL, 'login', NULL, 'User ''notif_test_user'' logged in', '::ffff:127.0.0.1', '2026-08-12 12:22:03.199401', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (75, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:38:06.039418', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (212, NULL, 'login', NULL, 'User ''diag_admin'' logged in', '::ffff:127.0.0.1', '2026-08-12 10:56:59.168225', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (77, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:38:46.523928', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (213, NULL, 'user_created', NULL, 'User ''diag_emp'' created with role ''employee'' by admin ''diag_admin''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 10:56:59.213578', NULL, NULL);
INSERT INTO public.activity_logs VALUES (79, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:45:54.024665', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (218, 1, 'user_created', 59, 'User ''ilyes_manager'' created with role ''manager'' by admin ''ilyes''. Activation pending.', '::1', '2026-08-12 11:09:14.446026', NULL, NULL);
INSERT INTO public.activity_logs VALUES (81, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:49:12.922838', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (83, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:58:23.966598', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (240, 59, 'login', 59, 'User ''ilyes_manager'' logged in', '::1', '2026-08-12 17:03:19.40349', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (85, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:58:54.518717', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (223, NULL, 'login', NULL, 'User ''prof_test_user'' logged in', '::ffff:127.0.0.1', '2026-08-12 12:00:58.60464', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (87, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 14:59:26.183156', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (89, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 15:18:13.295649', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (263, 1, 'user_created', NULL, 'User ''winsap.emp'' created with role ''employee'' by admin ''ilyes''. Activation pending.', '::1', '2026-08-14 11:05:53.653268', NULL, NULL);
INSERT INTO public.activity_logs VALUES (242, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-13 18:44:17.225381', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (247, 1, 'activation_email_resent', 72, 'Resent activation email to user ''winsap_manager'' (ilyeshmidilyes404@gmail.com).', '::1', '2026-08-13 18:55:19.249637', NULL, NULL);
INSERT INTO public.activity_logs VALUES (93, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in', '::1', '2026-08-06 15:31:18.325687', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (94, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 15:40:28.835688', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (95, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 15:41:33.18281', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (96, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 15:42:20.424436', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (97, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 18:05:08.399802', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (98, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-06 18:10:30.655014', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (100, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-06 18:13:10.627849', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (251, 1, 'activation_email_resent', NULL, 'Resent activation email to user ''winsap.emp'' (ilyesh321@gmail.com).', '::1', '2026-08-13 19:25:39.618612', NULL, NULL);
INSERT INTO public.activity_logs VALUES (255, 1, 'user_deleted', NULL, 'User ''winsap.emp'' deleted by ''ilyes''', '::1', '2026-08-13 19:34:51.338002', NULL, NULL);
INSERT INTO public.activity_logs VALUES (103, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 18:26:49.637878', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (105, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 18:56:02.179579', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (259, 1, 'activation_email_resent', NULL, 'Resent activation email to user ''winsap.emp'' (ilyesh321@gmail.com).', '::1', '2026-08-13 19:37:26.807054', NULL, NULL);
INSERT INTO public.activity_logs VALUES (267, 83, 'login', 83, 'User ''winsap.emp'' logged in via Face ID', '::1', '2026-08-14 11:39:52.464054', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (108, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 20:30:06.104023', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (109, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 20:54:13.673945', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (271, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-14 12:00:35.983104', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (111, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-06 21:00:34.350184', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (275, 83, 'login', 83, 'User ''winsap.emp1'' logged in via Face ID', '::1', '2026-08-14 12:32:03.476051', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (113, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-08 09:07:25.182811', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (116, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-08 10:37:42.41161', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (119, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-08 12:35:24.195673', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (121, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-08 13:31:24.929', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (122, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-08 13:32:02.528782', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (123, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-08 13:32:38.428091', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (219, 59, 'login', 59, 'User ''ilyes_manager'' logged in', '::1', '2026-08-12 11:10:06.394961', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (127, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-08 19:58:10.243768', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (129, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-08 20:04:34.038283', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (192, NULL, 'login', NULL, 'User ''testadmin_e2e'' logged in', '::ffff:127.0.0.1', '2026-08-12 09:42:58.071902', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (131, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-11 17:46:57.284941', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (252, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-13 19:27:29.107801', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (133, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-11 17:48:32.945159', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (134, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-11 18:11:44.18658', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (193, NULL, 'user_created', NULL, 'User ''testuser_e2e'' created with role ''employee'' by admin ''testadmin_e2e''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 09:42:58.123599', NULL, NULL);
INSERT INTO public.activity_logs VALUES (136, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-11 18:29:53.969676', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (194, NULL, 'login', NULL, 'User ''testuser_e2e'' logged in', '::1', '2026-08-12 09:43:03.645515', 'Chrome Headless', 'Linux');
INSERT INTO public.activity_logs VALUES (138, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-11 18:39:33.94504', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (179, 1, 'user_created', NULL, 'User ''lays'' created with role ''employee'' by admin ''ilyes''. Activation pending.', '::1', '2026-08-12 08:49:39.069606', NULL, NULL);
INSERT INTO public.activity_logs VALUES (140, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-11 18:52:46.030704', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (142, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-11 19:27:22.850506', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (144, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-11 19:28:57.813986', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (224, NULL, 'login', NULL, 'User ''prof_test_user'' logged in', '::ffff:127.0.0.1', '2026-08-12 12:01:27.089547', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (146, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-11 19:35:02.692853', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (206, 1, 'user_created', NULL, 'User ''lays'' created with role ''employee'' by admin ''ilyes''. Activation pending.', '::1', '2026-08-12 10:43:59.978731', NULL, NULL);
INSERT INTO public.activity_logs VALUES (148, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-11 19:38:55.311064', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (214, NULL, 'login', NULL, 'User ''lays'' logged in', '::1', '2026-08-12 11:01:13.644388', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (150, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-11 19:41:40.567911', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (152, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-11 20:16:40.45944', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (236, NULL, 'login', NULL, 'User ''notif_test_user'' logged in', '::ffff:127.0.0.1', '2026-08-12 12:22:30.321137', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (158, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-12 08:28:38.582974', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (159, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-12 08:31:59.863868', 'Mobile Safari', 'iOS');
INSERT INTO public.activity_logs VALUES (153, 1, 'user_created', NULL, 'User ''lays'' created with role ''employee'' by admin ''ilyes''.', '::1', '2026-08-11 20:31:48.494251', NULL, NULL);
INSERT INTO public.activity_logs VALUES (154, 1, 'user_updated', NULL, 'User ''layss'' updated by ''ilyes''', '::1', '2026-08-11 20:31:54.103119', NULL, NULL);
INSERT INTO public.activity_logs VALUES (160, 1, 'user_deleted', NULL, 'User ''layss'' deleted by ''ilyes''', '::1', '2026-08-12 08:32:23.371322', NULL, NULL);
INSERT INTO public.activity_logs VALUES (161, 1, 'user_created', NULL, 'User ''lays'' created with role ''employee'' by admin ''ilyes''.', '::1', '2026-08-12 08:32:40.711827', NULL, NULL);
INSERT INTO public.activity_logs VALUES (172, NULL, 'user_created', NULL, 'User ''testemp_created'' created with role ''employee'' by admin ''testadmin''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 08:46:27.225589', NULL, NULL);
INSERT INTO public.activity_logs VALUES (164, NULL, 'login', NULL, 'User ''testadmin'' logged in', '::ffff:127.0.0.1', '2026-08-12 08:40:19.608893', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (162, 1, 'account_disabled', NULL, 'Account ''lays'' disabled by ''ilyes''', '::1', '2026-08-12 08:32:47.741833', NULL, NULL);
INSERT INTO public.activity_logs VALUES (165, NULL, 'user_created', NULL, 'User ''testuser_activation'' created with role ''employee'' by admin ''testadmin''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 08:40:22.508949', NULL, NULL);
INSERT INTO public.activity_logs VALUES (166, NULL, 'login', NULL, 'User ''testuser_activation'' logged in', '::ffff:127.0.0.1', '2026-08-12 08:40:22.918251', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (167, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-12 08:40:54.186463', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (163, 1, 'account_enabled', NULL, 'Account ''lays'' enabled by ''ilyes''', '::1', '2026-08-12 08:32:52.232497', NULL, NULL);
INSERT INTO public.activity_logs VALUES (168, NULL, 'login', NULL, 'User ''testadmin'' logged in', '::ffff:127.0.0.1', '2026-08-12 08:45:53.495964', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (175, 1, 'user_deleted', NULL, 'User ''lays'' deleted by ''ilyes''', '::1', '2026-08-12 08:48:57.490122', NULL, NULL);
INSERT INTO public.activity_logs VALUES (169, NULL, 'login', NULL, 'User ''testadmin'' logged in', '::ffff:127.0.0.1', '2026-08-12 08:46:27.142782', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (170, NULL, 'user_created', NULL, 'User ''testadmin_created'' created with role ''admin'' by admin ''testadmin''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 08:46:27.175938', NULL, NULL);
INSERT INTO public.activity_logs VALUES (171, NULL, 'user_created', NULL, 'User ''testmgr_created'' created with role ''manager'' by admin ''testadmin''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 08:46:27.196004', NULL, NULL);
INSERT INTO public.activity_logs VALUES (225, NULL, 'login', NULL, 'User ''ui_prof_user'' logged in', '::1', '2026-08-12 12:01:35.074723', 'Chrome Headless', 'Linux');
INSERT INTO public.activity_logs VALUES (174, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-12 08:48:52.312281', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (155, 1, 'account_unlocked', NULL, 'Account unlocked by admin ''ilyes''', '::1', '2026-08-11 20:32:21.525412', NULL, NULL);
INSERT INTO public.activity_logs VALUES (156, 1, 'account_unlocked', NULL, 'Account unlocked by admin ''ilyes''', '::1', '2026-08-11 20:32:28.256282', NULL, NULL);
INSERT INTO public.activity_logs VALUES (176, 1, 'user_deleted', NULL, 'User ''test_admin_1786476143281'' deleted by ''ilyes''', '::1', '2026-08-12 08:49:00.325607', NULL, NULL);
INSERT INTO public.activity_logs VALUES (177, 1, 'user_deleted', NULL, 'User ''test_manager_1786476143106'' deleted by ''ilyes''', '::1', '2026-08-12 08:49:02.089178', NULL, NULL);
INSERT INTO public.activity_logs VALUES (178, 1, 'user_deleted', NULL, 'User ''test_employee_1786476142498'' deleted by ''ilyes''', '::1', '2026-08-12 08:49:04.45478', NULL, NULL);
INSERT INTO public.activity_logs VALUES (230, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-12 12:13:30.79234', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (231, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-12 12:13:48.580322', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (243, 1, 'user_created', 72, 'User ''winsap_manager'' created with role ''manager'' by admin ''ilyes''. Activation pending.', '::1', '2026-08-13 18:48:30.583365', NULL, NULL);
INSERT INTO public.activity_logs VALUES (180, NULL, 'login', NULL, 'User ''testadmin_act'' logged in', '::ffff:127.0.0.1', '2026-08-12 08:55:37.18671', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (248, 72, 'login', 72, 'User ''winsap_manager'' logged in', '::1', '2026-08-13 18:57:26.377449', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (256, 1, 'user_created', NULL, 'User ''winsap.emp'' created with role ''employee'' by admin ''ilyes''. Activation pending.', '::1', '2026-08-13 19:35:16.632791', NULL, NULL);
INSERT INTO public.activity_logs VALUES (260, NULL, 'login', NULL, 'User ''winsap.emp'' logged in via Face ID', '::1', '2026-08-13 19:39:21.672966', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (264, 1, 'user_created', NULL, 'User ''winsap.emp'' created with role ''employee'' by admin ''ilyes''. Activation pending.', '::1', '2026-08-14 11:36:34.284134', NULL, NULL);
INSERT INTO public.activity_logs VALUES (268, 59, 'login', 59, 'User ''ilyes_manager'' logged in', '::1', '2026-08-14 11:51:16.101477', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (272, 83, 'login', 83, 'User ''winsap.emp1'' logged in via Face ID', '::1', '2026-08-14 12:01:46.978921', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (276, 59, 'login', 59, 'User ''ilyes_manager'' logged in', '::1', '2026-08-14 12:32:27.558755', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (181, NULL, 'user_created', NULL, 'User ''testuser_act'' created with role ''employee'' by admin ''testadmin_act''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 08:55:37.223023', NULL, NULL);
INSERT INTO public.activity_logs VALUES (182, NULL, 'login', NULL, 'User ''testuser_act'' logged in', '::ffff:127.0.0.1', '2026-08-12 08:55:37.384494', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (51, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 11:18:03.564197', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (184, NULL, 'login', NULL, 'User ''speed_test_admin'' logged in', '::ffff:127.0.0.1', '2026-08-12 09:21:08.702568', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (53, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 11:21:14.20355', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (185, NULL, 'login', NULL, 'User ''speed_test_admin'' logged in', '::ffff:127.0.0.1', '2026-08-12 09:21:27.890086', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (195, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-12 09:50:00.522561', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (183, 1, 'activation_email_resent', NULL, 'Resent activation email to user ''lays'' (ilyes.benhmid@esprim.tn).', '::1', '2026-08-12 09:19:08.530256', NULL, NULL);
INSERT INTO public.activity_logs VALUES (196, 1, 'activation_email_resent', NULL, 'Resent activation email to user ''lays'' (ilyes.benhmid@esprim.tn).', '::1', '2026-08-12 09:50:18.415083', NULL, NULL);
INSERT INTO public.activity_logs VALUES (207, NULL, 'login', NULL, 'User ''test_admin_ui'' logged in', '::ffff:127.0.0.1', '2026-08-12 10:47:29.225046', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (208, NULL, 'user_created', NULL, 'User ''test_emp_ui'' created with role ''employee'' by admin ''test_admin_ui''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 10:47:29.30876', NULL, NULL);
INSERT INTO public.activity_logs VALUES (215, 1, 'user_deleted', NULL, 'User ''lays'' deleted by ''ilyes''', '::1', '2026-08-12 11:06:12.155385', NULL, NULL);
INSERT INTO public.activity_logs VALUES (220, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-12 11:13:41.653861', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (226, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-12 12:04:06.084256', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (232, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-12 12:14:31.556937', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (237, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-12 14:17:00.880727', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (244, 1, 'account_disabled', 72, 'Account ''winsap_manager'' disabled by ''ilyes''', '::1', '2026-08-13 18:54:07.07509', NULL, NULL);
INSERT INTO public.activity_logs VALUES (253, 9, 'login', 9, 'User ''ilyes_benhmid'' logged in via Face ID', '::1', '2026-08-13 19:28:23.626657', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (249, 1, 'user_created', NULL, 'User ''winsap.emp'' created with role ''employee'' by admin ''ilyes''. Activation pending.', '::1', '2026-08-13 19:07:14.126837', NULL, NULL);
INSERT INTO public.activity_logs VALUES (261, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-14 10:53:42.724829', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (257, 1, 'activation_email_resent', NULL, 'Resent activation email to user ''winsap.emp'' (winsap@winsap.net).', '::1', '2026-08-13 19:36:47.649749', NULL, NULL);
INSERT INTO public.activity_logs VALUES (265, 1, 'user_deleted', NULL, 'User ''winsap.emp'' deleted by ''ilyes''', '::1', '2026-08-14 11:38:16.719246', NULL, NULL);
INSERT INTO public.activity_logs VALUES (269, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-14 11:51:28.595821', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (273, 1, 'login', 1, 'User ''ilyes'' logged in', '::1', '2026-08-14 12:31:39.197049', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (277, 83, 'login', 83, 'User ''winsap.emp1'' logged in via Face ID', '::1', '2026-08-14 12:33:26.113185', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (99, 1, 'account_unlocked', NULL, 'Account unlocked by admin ''ilyes''', '::1', '2026-08-06 18:10:41.235603', NULL, NULL);
INSERT INTO public.activity_logs VALUES (101, 1, 'account_unlocked', NULL, 'Account unlocked by admin ''ilyes''', '::1', '2026-08-06 18:13:17.093105', NULL, NULL);
INSERT INTO public.activity_logs VALUES (120, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-08 12:36:38.876656', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (124, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-08 13:38:23.711732', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (125, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-08 18:43:32.299574', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (126, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-08 19:43:41.218103', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (128, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-08 20:04:08.580839', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (130, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 17:40:34.088406', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (55, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 11:26:28.680575', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (57, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 11:40:01.748142', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (59, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 11:41:57.54159', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (62, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 11:54:15.305363', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (64, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 12:02:58.02223', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (66, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 12:03:58.237428', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (68, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 14:12:23.366525', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (70, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 14:13:14.579693', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (72, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 14:19:58.056486', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (74, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 14:37:45.834983', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (76, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 14:38:30.363766', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (78, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 14:45:39.067561', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (80, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 14:48:56.69002', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (82, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 14:58:07.11888', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (84, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 14:58:41.688725', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (86, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 14:59:08.076723', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (88, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 15:17:53.610983', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (90, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 15:25:01.885846', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (91, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 15:30:59.079056', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (92, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 15:31:18.195812', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (102, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 18:19:17.501738', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (104, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 18:27:17.339793', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (106, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 18:56:22.522947', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (107, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 20:27:38.855373', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (110, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-06 20:54:22.26458', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (112, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-08 08:12:29.072303', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (114, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-08 09:07:36.965962', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (115, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-08 10:18:08.796906', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (117, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-08 10:39:55.69344', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (118, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-08 11:45:30.38878', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (132, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 17:48:12.072718', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (135, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 18:27:38.81869', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (137, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 18:31:47.920335', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (139, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 18:44:49.780683', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (141, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 19:27:06.166295', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (143, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 19:28:31.376287', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (145, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 19:30:03.259908', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (147, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 19:36:31.100118', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (149, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 19:40:18.440511', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (151, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-11 20:02:49.989024', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (157, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-12 08:09:51.939567', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (173, NULL, 'login', NULL, 'User ''ilyes_manager'' logged in', '::1', '2026-08-12 08:47:55.078155', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (186, NULL, 'login', NULL, 'User ''speed_test_admin'' logged in', '::ffff:127.0.0.1', '2026-08-12 09:21:46.221477', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (187, NULL, 'user_created', NULL, 'User ''speed_test_user'' created with role ''manager'' by admin ''speed_test_admin''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 09:21:46.251965', NULL, NULL);
INSERT INTO public.activity_logs VALUES (245, 1, 'activation_email_resent', 72, 'Resent activation email to user ''winsap_manager'' (ilyesbenhmid13@gmail.com).', '::1', '2026-08-13 18:54:25.496749', NULL, NULL);
INSERT INTO public.activity_logs VALUES (197, NULL, 'login', NULL, 'User ''diag_admin'' logged in', '::ffff:127.0.0.1', '2026-08-12 09:54:49.4605', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (198, NULL, 'user_created', NULL, 'User ''diag_emp_user'' created with role ''employee'' by admin ''diag_admin''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 09:54:49.52315', NULL, NULL);
INSERT INTO public.activity_logs VALUES (254, NULL, 'account_activated', NULL, 'User ''act_skip_test'' activated account and skipped Face ID setup.', '::ffff:127.0.0.1', '2026-08-13 19:33:35.260946', NULL, NULL);
INSERT INTO public.activity_logs VALUES (199, NULL, 'login', NULL, 'User ''diag_admin'' logged in', '::ffff:127.0.0.1', '2026-08-12 09:54:53.064178', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (200, NULL, 'user_created', NULL, 'User ''diag_emp_user'' created with role ''employee'' by admin ''diag_admin''. Activation pending.', '::ffff:127.0.0.1', '2026-08-12 09:54:53.11174', NULL, NULL);
INSERT INTO public.activity_logs VALUES (209, 1, 'activation_email_resent', NULL, 'Resent activation email to user ''lays'' (ilyes.benhmid@esprim.tn).', '::1', '2026-08-12 10:50:01.026685', NULL, NULL);
INSERT INTO public.activity_logs VALUES (216, 1, 'user_created', 58, 'User ''lays'' created with role ''employee'' by admin ''ilyes''. Activation pending.', '::1', '2026-08-12 11:06:50.709566', NULL, NULL);
INSERT INTO public.activity_logs VALUES (221, 59, 'login', 59, 'User ''ilyes_manager'' logged in', '::1', '2026-08-12 11:56:50.41023', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (250, 1, 'account_disabled', NULL, 'Account ''winsap.emp'' disabled by ''ilyes''', '::1', '2026-08-13 19:25:25.012334', NULL, NULL);
INSERT INTO public.activity_logs VALUES (227, NULL, 'login', NULL, 'User ''mgr_profile_user'' logged in', '::ffff:127.0.0.1', '2026-08-12 12:05:37.669782', 'Unknown Browser', 'Unknown OS');
INSERT INTO public.activity_logs VALUES (233, NULL, 'login', NULL, 'User ''test_set_user'' logged in', '::1', '2026-08-12 12:17:46.596638', 'Chrome Headless', 'Linux');
INSERT INTO public.activity_logs VALUES (258, 1, 'account_disabled', NULL, 'Account ''winsap.emp'' disabled by ''ilyes''', '::1', '2026-08-13 19:37:12.395487', NULL, NULL);
INSERT INTO public.activity_logs VALUES (238, NULL, 'login', NULL, 'User ''nav_test_user'' logged in', '::1', '2026-08-12 14:21:15.340041', 'Chrome Headless', 'Linux');
INSERT INTO public.activity_logs VALUES (262, 1, 'user_deleted', NULL, 'User ''winsap.emp'' deleted by ''ilyes''', '::1', '2026-08-14 11:04:32.076797', NULL, NULL);
INSERT INTO public.activity_logs VALUES (266, 1, 'user_created', 83, 'User ''winsap.emp'' created with role ''employee'' by admin ''ilyes''. Activation pending.', '::1', '2026-08-14 11:38:42.347396', NULL, NULL);
INSERT INTO public.activity_logs VALUES (270, 72, 'login', 72, 'User ''winsap_manager'' logged in', '::1', '2026-08-14 11:51:45.029538', 'Opera', 'Linux');
INSERT INTO public.activity_logs VALUES (274, 59, 'login', 59, 'User ''ilyes_manager'' logged in', '::1', '2026-08-14 12:31:50.5131', 'Opera', 'Linux');


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.attendance VALUES (7, 4, '2026-08-06', '11:29:41.828855', '11:29:43.055577', 'Present', '2026-08-06 11:29:41.828855', 'Pending', NULL, false, false, NULL, NULL, NULL, NULL, '2026-08-06 11:29:41.828855');
INSERT INTO public.attendance VALUES (8, 33, '2026-08-12', NULL, NULL, 'Absent', '2026-08-12 17:30:00.044425', 'Pending', NULL, false, false, NULL, NULL, NULL, NULL, '2026-08-12 17:30:00.044425');
INSERT INTO public.attendance VALUES (10, 15, '2026-08-12', NULL, NULL, 'Absent', '2026-08-12 17:30:00.052162', 'Pending', NULL, false, false, NULL, NULL, NULL, NULL, '2026-08-12 17:30:00.052162');
INSERT INTO public.attendance VALUES (11, 4, '2026-08-12', NULL, NULL, 'Absent', '2026-08-12 17:30:00.054703', 'Validated', NULL, false, false, NULL, NULL, NULL, NULL, '2026-08-12 17:30:00.054703');
INSERT INTO public.attendance VALUES (9, 1, '2026-08-12', NULL, NULL, 'Absent', '2026-08-12 17:30:00.049246', 'Rejected', NULL, false, false, NULL, NULL, NULL, NULL, '2026-08-12 17:30:00.049246');
INSERT INTO public.attendance VALUES (12, 4, '2026-08-13', '19:28:32.751032', NULL, 'Present', '2026-08-13 19:28:32.751032', 'Pending', NULL, true, false, 87.9177763753801, 'AI_FACE', NULL, 'Browser: Netscape on Linux x86_64', '2026-08-13 19:28:32.751032');
INSERT INTO public.attendance VALUES (13, 39, '2026-08-14', '11:45:19.409521', '11:45:30.641953', 'Present', '2026-08-14 11:45:19.409521', 'Pending', NULL, true, false, 95.1074618352337, 'AI_FACE', NULL, 'Browser: Netscape on Linux x86_64', '2026-08-14 11:45:30.641953');


--
-- Data for Name: cra_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.cra_entries VALUES (29, 4, 'tr', 'rt', '2026-08-11 17:47:20.945382', '2026-08-11 17:48:01.695', 1, 'COMPLETED', '2026-08-11 17:47:20.945382', '2026-08-11 17:48:01.695822', 1, 'manual');
INSERT INTO public.cra_entries VALUES (30, 4, 'er', 'er', '2026-08-11 00:00:00', '2026-08-11 00:00:00', 240, 'APPROVED', '2026-08-11 17:47:41.095341', '2026-08-11 17:48:17.16467', 1, 'manual');
INSERT INTO public.cra_entries VALUES (31, 4, 'kki', 'fd', '2026-08-11 18:09:30.143498', '2026-08-11 18:09:37.794', 1, 'COMPLETED', '2026-08-11 18:09:30.143498', '2026-08-11 18:09:37.795175', 1, 'manual');
INSERT INTO public.cra_entries VALUES (32, 4, 'errrrrrrrr', 'er', '2026-08-11 18:10:51.869239', '2026-08-11 18:12:01.255', 1, 'COMPLETED', '2026-08-11 18:10:51.869239', '2026-08-11 18:12:01.256006', 0, 'manual');
INSERT INTO public.cra_entries VALUES (3, 4, 'jira404', 'test', '2026-08-06 12:02:50.235139', '2026-08-06 12:03:43.19', 1, 'APPROVED', '2026-08-06 12:02:50.235139', '2026-08-06 12:04:05.776873', 0, 'manual');
INSERT INTO public.cra_entries VALUES (34, 4, 'j', 'j', '2026-08-11 18:44:39.788649', '2026-08-11 19:03:58.491', 19, 'COMPLETED', '2026-08-11 18:40:36.501045', '2026-08-11 19:03:58.49149', 1, 'manual');
INSERT INTO public.cra_entries VALUES (36, 4, 'trrr', 'rttrtr', '2026-08-11 19:50:04.943729', '2026-08-11 19:58:07.738', 8, 'COMPLETED', '2026-08-11 19:50:04.943729', '2026-08-11 19:58:07.738648', 0, 'manual');
INSERT INTO public.cra_entries VALUES (35, 4, 'rt', 'rt', '2026-08-11 19:58:11.096498', '2026-08-11 19:58:15.694', 1, 'COMPLETED', '2026-08-11 19:49:48.975215', '2026-08-11 19:58:15.695025', 1, 'manual');
INSERT INTO public.cra_entries VALUES (7, 4, 'tm002', 'eererer', '2026-08-06 14:11:17.162027', '2026-08-06 14:11:45.54', 1, 'APPROVED', '2026-08-06 14:11:17.162027', '2026-08-06 14:12:29.239474', 0, 'manual');
INSERT INTO public.cra_entries VALUES (4, 4, 'et005', 'testeeee', '2026-08-06 14:12:29.244421', '2026-08-06 14:12:59.678', 1, 'APPROVED', '2026-08-06 12:03:27.845067', '2026-08-06 14:13:18.182482', 0, 'manual');
INSERT INTO public.cra_entries VALUES (37, 39, 'ref_77', 'ticket', '2026-08-14 11:48:05.725704', '2026-08-14 11:48:18.688', 1, 'COMPLETED', '2026-08-14 11:47:55.558622', '2026-08-14 11:48:18.688998', 2, 'manual');
INSERT INTO public.cra_entries VALUES (38, 39, 'ref-1', 'ref', '2026-08-14 11:48:51.916521', '2026-08-14 11:48:57.796', 1, 'COMPLETED', '2026-08-14 11:48:51.916521', '2026-08-14 11:48:57.79706', 0, 'manual');
INSERT INTO public.cra_entries VALUES (39, 39, 'ticket1', 'ticket', '2026-08-14 11:50:59.519004', '2026-08-14 12:01:53.641', 11, 'COMPLETED', '2026-08-14 11:50:59.519004', '2026-08-14 12:01:53.641897', 0, 'manual');
INSERT INTO public.cra_entries VALUES (9, 4, 'ht002', 'hehdy', '2026-08-06 14:15:44.642771', '2026-08-06 14:19:51.128', 4, 'APPROVED', '2026-08-06 14:15:44.642771', '2026-08-06 14:20:05.277425', 0, 'manual');
INSERT INTO public.cra_entries VALUES (8, 4, 'er3', 'tester3', '2026-08-06 14:13:18.186185', '2026-08-06 14:13:43.628', 1, 'APPROVED', '2026-08-06 14:11:37.515883', '2026-08-06 14:20:06.575588', 0, 'manual');
INSERT INTO public.cra_entries VALUES (12, 4, 'il', 'rr', '2026-08-06 14:38:23.164148', '2026-08-06 14:38:25.807', 1, 'APPROVED', '2026-08-06 14:38:23.164148', '2026-08-06 14:38:34.312458', 0, 'manual');
INSERT INTO public.cra_entries VALUES (11, 4, 'ttr', 'ttr', '2026-08-06 14:38:34.318724', '2026-08-06 14:38:53.077', 1, 'APPROVED', '2026-08-06 14:20:26.236384', '2026-08-06 14:45:43.173539', 0, 'manual');
INSERT INTO public.cra_entries VALUES (16, 1, 'JIRA-312', 'Hello, please work on the PDF export for attendance reports. Priority: Low.', NULL, NULL, NULL, 'PENDING_START', '2026-08-06 14:56:15.384215', '2026-08-06 14:56:15.384215', 2, 'email');
INSERT INTO public.cra_entries VALUES (19, 4, 'ff4', 'ffff', '2026-08-06 14:58:33.171501', '2026-08-06 14:58:34.208', 1, 'APPROVED', '2026-08-06 14:58:33.171501', '2026-08-06 14:58:45.013478', 0, 'manual');
INSERT INTO public.cra_entries VALUES (18, 4, 'JIRA-311', 'we need to create the new dashboard statistics widgets as specified. Priority: Medium.', '2026-08-06 14:58:45.017427', '2026-08-06 14:59:03.18', 1, 'APPROVED', '2026-08-06 14:56:15.394666', '2026-08-06 14:59:12.739224', 2, 'email');
INSERT INTO public.cra_entries VALUES (24, 4, 'tty', 'ererr', '2026-08-06 18:56:12.625194', '2026-08-06 20:30:09.655', 94, 'APPROVED', '2026-08-06 18:56:12.625194', '2026-08-06 20:54:52.22687', 0, 'manual');
INSERT INTO public.cra_entries VALUES (25, 4, 'tet', 'tete', '2026-08-08 00:00:00', '2026-08-08 00:00:00', 60, 'APPROVED', '2026-08-08 20:03:37.401337', '2026-08-08 20:04:17.944358', 1, 'manual');
INSERT INTO public.cra_entries VALUES (26, 4, 'tr', 'rttt', '2026-08-11 00:00:00', '2026-08-11 00:00:00', 60, 'APPROVED', '2026-08-11 17:41:01.688154', '2026-08-11 17:41:10.057118', 1, 'manual');


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.departments VALUES (1, 'Administration', 'System Administration & Management', '2026-07-23 10:32:53.308415', '2026-07-23 10:32:53.308415');
INSERT INTO public.departments VALUES (2, 'IT', 'IT', '2026-07-23 11:00:48.107473', '2026-07-23 11:00:48.107473');
INSERT INTO public.departments VALUES (5, 'fins', 'fin', '2026-08-11 20:03:28.2454', '2026-08-12 11:13:13.867811');
INSERT INTO public.departments VALUES (7, 'winsap_dept', 'winsap', '2026-08-13 19:04:52.685654', '2026-08-13 19:04:52.685654');
INSERT INTO public.departments VALUES (8, 'winsap111', 'winsap', '2026-08-14 11:53:58.690404', '2026-08-14 11:54:06.60293');


--
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employees VALUES (33, 'EMP-MGR-59', 'ilyes', 'manager', 'hmidilyes607@gmail.com', '52666777', 'manager', '2026-08-12', '2026-08-12 12:13:04.571619', NULL, NULL, '/uploads/profile-pictures/avatar_59_1786533199035_c7882490.jpeg', '2026-08-12 12:13:19.039422');
INSERT INTO public.employees VALUES (1, 'ADM001', 'Ilyes', 'Hmid', 'hmidilyes4442@gmail.com', NULL, 'System Administrator', '2026-07-23', '2026-07-23 10:32:53.313132', 1, 'hmidilyes4442@gmail.com', '/uploads/profile-pictures/avatar_1_1786533288776_c252cc55.jpeg', '2026-08-12 12:14:48.780382');
INSERT INTO public.employees VALUES (39, 'EMP_002', 'winsap', 'emp22', 'winsap@winsap.net', '21111222', 'CHEFs', '2026-08-14', '2026-08-13 19:05:35.642806', 7, NULL, '/uploads/profile-pictures/avatar_83_1786704240781_ca7783eb.jpg', '2026-08-14 11:44:00.78882');
INSERT INTO public.employees VALUES (15, 'EMP005', 'ilyes', 'lays', 'ilyes.benhmid@esprim.tn', '', 'chef', '2026-08-12', '2026-08-12 08:48:43.679757', 5, NULL, NULL, '2026-08-12 12:01:14.755367');
INSERT INTO public.employees VALUES (4, 'EMP002', 'ilyes', 'benhmid2', 'hmidilyes100@gmail.com', '52225791', 'chef', '2026-07-24', '2026-07-23 11:01:38.796401', 2, 'hmidilyes100@gmail.com', '/uploads/profile-pictures/avatar_9_1786532690889_1ce90d22.png', '2026-08-12 12:04:50.897817');


--
-- Data for Name: face_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.face_profiles VALUES (3, 39, '2026-08-13 19:38:55.398726', '2026-08-14 13:07:44.135515', 'active', true, '2026-08-14 13:07:44.135515', '2026-08-14 12:33:26.11784', '[-0.34139126539230347, -0.5638597011566162, 1.256289005279541, 1.7860171794891357, -1.1053882837295532, -0.2464420199394226, 0.22604019939899445, 0.3642110824584961, 0.8925544023513794, 0.9186281561851501, -2.0052154064178467, 0.1640411615371704, -0.07257001101970673, 0.14293085038661957, 1.085111141204834, -1.0041072368621826, 0.7815442085266113, 0.47360971570014954, -0.25809863209724426, -0.6372436285018921, 2.102484703063965, 0.41607218980789185, -0.15717075765132904, 0.07352854311466217, 0.05294981971383095, -2.44313383102417, 0.2089235633611679, -1.549891710281372, -1.5596951246261597, -0.3577537536621094, -0.43825387954711914, -1.2537974119186401, -0.8674092292785645, -0.4499920606613159, 1.7762799263000488, -0.23707930743694305, -0.0648391842842102, 1.3485568761825562, -0.7745507955551147, 0.9072054028511047, 0.10782039165496826, 0.29273855686187744, 0.4641917049884796, 0.9005134701728821, -0.4767339527606964, 1.5688856840133667, -0.16842591762542725, -0.6496492028236389, 0.7861138582229614, 1.4441062211990356, -0.6410157680511475, 0.28268128633499146, -1.9723504781723022, -0.7198476791381836, 0.24168141186237335, 2.120603561401367, 1.4810442924499512, 0.05086768791079521, 0.38537803292274475, -0.9763109087944031, 2.013646364212036, 1.1561479568481445, 0.7509791851043701, -0.16425415873527527, 0.5501387715339661, -1.1775785684585571, -0.2830813527107239, -0.6188333034515381, 0.6388052701950073, 1.1761986017227173, 0.09787978231906891, -0.503621518611908, 0.24220958352088928, 0.3472241163253784, 0.9435973763465881, 1.6800634860992432, 2.0613346099853516, -0.5069813132286072, -0.9596408009529114, 0.1411767601966858, -0.42851722240448, -1.97519850730896, 0.15313276648521423, -0.29567819833755493, -0.382026731967926, 1.3011651039123535, 0.4082369804382324, 0.5360288023948669, 2.3200607299804688, 0.5158420205116272, -1.6432632207870483, 1.8623073101043701, 0.6020811796188354, 0.5532406568527222, 2.2587573528289795, 1.259556531906128, 0.3295861482620239, 0.27948904037475586, -2.1815037727355957, 0.7238477468490601, 0.936830461025238, -0.719569206237793, 0.6869571208953857, 0.7180814743041992, 1.0749046802520752, 1.4711142778396606, 0.31486183404922485, -0.5319682955741882, -0.09758372604846954, 1.0174518823623657, 2.209292411804199, -2.3309566974639893, -0.09906922280788422, -0.6402375102043152, 0.8589577674865723, -0.9178171157836914, 0.4729841649532318, 1.6586346626281738, 0.6810625791549683, -0.5478719472885132, 1.767164945602417, 0.9640891551971436, -1.023219108581543, -0.8519293069839478, 0.015306835994124413, -1.070347785949707, 0.8270352482795715, -0.18534724414348602, -0.8056693077087402, 0.491691917181015, 0.8005566000938416, -1.5209482908248901, 0.31147223711013794, 1.4918479919433594, -0.9827510118484497, 1.3782294988632202, -1.0475660562515259, -1.212226152420044, 0.7291653156280518, 0.28241419792175293, -0.8448187112808228, 1.3511273860931396, -0.3413626551628113, 0.3070794939994812, 0.30057772994041443, 1.1147689819335938, -0.28086480498313904, 1.294670581817627, -0.7300691604614258, 0.8299249410629272, 4.142517566680908, -0.08710727840662003, -1.5957427024841309, 0.130729079246521, -0.16191811859607697, 0.9584293961524963, -0.0672658309340477, 0.32468780875205994, -0.5454198718070984, -0.22403584420681, -0.5552683472633362, -2.1431264877319336, 0.9412012696266174, 0.9496687054634094, 1.080723762512207, -0.14990347623825073, 0.6118959784507751, 0.6342965364456177, 0.423969030380249, 0.6047648191452026, -1.1828821897506714, -0.7032616138458252, 0.7847016453742981, -0.2563425302505493, -1.3067232370376587, -0.4320715069770813, 0.30407774448394775, 0.5440128445625305, -0.198336660861969, -0.17479956150054932, 0.39740607142448425, 0.7478224039077759, 0.6716960668563843, -0.08639596402645111, -0.1444750726222992, 0.5423506498336792, -0.6535582542419434, -1.5604217052459717, 0.46678873896598816, 1.5920255184173584, -0.11944995075464249, -1.1687911748886108, -0.2840544581413269, -0.8279291391372681, -1.2523078918457031, -0.596680760383606, 0.3707095980644226, 0.35315683484077454, -0.5982007384300232, 1.4613046646118164, -0.9142201542854309, -1.5235135555267334, 0.07148068398237228, -0.0748329758644104, 0.3537694811820984, -0.5158473253250122, -0.6086732149124146, -0.6312634944915771, 1.44771409034729, 0.3398216962814331, 2.2454936504364014, -0.04663224145770073, -1.8657565116882324, -0.3763885498046875, -2.6690585613250732, 2.2149558067321777, 1.0202957391738892, -2.164180040359497, -0.37287530303001404, -0.4304182231426239, 1.0467182397842407, -0.1578063666820526, 1.1976102590560913, -0.28800588846206665, 0.17299595475196838, -0.7690057158470154, -0.7519160509109497, 0.42987295985221863, -0.35988175868988037, 0.23056736588478088, -1.0883257389068604, -0.32445603609085083, 1.8300457000732422, 0.43914613127708435, 0.7235202789306641, -0.44456398487091064, -1.4887290000915527, 0.66770339012146, -1.62993586063385, -0.20255768299102783, -2.3535444736480713, 0.23609724640846252, -1.1894233226776123, 0.26663416624069214, -0.3780345320701599, -1.5030348300933838, 0.319721519947052, -1.2413886785507202, 0.4509023129940033, 0.7519290447235107, 0.2385561168193817, -0.3917001485824585, -0.17163655161857605, -0.12082640826702118, 0.6221402287483215, -1.0984615087509155, 0.39167657494544983, 1.1281042098999023, 1.4210630655288696, 0.48202720284461975, 0.13306036591529846, 0.3266289532184601, -0.08172821253538132, 0.2436017096042633, -0.42261260747909546, -1.0552420616149902, -0.3462370038032532, 0.402588427066803, 0.04048680514097214, 1.0644327402114868, 0.11726314574480057, 0.9288371801376343, -0.7501651048660278, 0.17577122151851654, 0.31308984756469727, 0.6184817552566528, 1.3885154724121094, 1.7472484111785889, -1.4593210220336914, -1.002415657043457, -0.9036198854446411, -0.6048928499221802, -2.5783982276916504, 0.01143386960029602, -0.38979652523994446, 0.9930149912834167, -2.411651372909546, -1.2995761632919312, -1.2608681917190552, 0.6933271884918213, -0.5773656964302063, 0.48254624009132385, 1.3386260271072388, -0.5614073872566223, 0.05809071287512779, 0.30710235238075256, 1.912261724472046, 0.846405565738678, -0.46494901180267334, -0.8244653344154358, -1.0026755332946777, -0.2806101441383362, -1.9461795091629028, 2.3316867351531982, -0.5853318572044373, 0.11626129597425461, 1.039734125137329, 1.0342648029327393, -0.2785070538520813, 1.0377135276794434, -0.6945737600326538, 1.0031208992004395, -1.5039669275283813, 0.33495327830314636, -0.44509005546569824, -0.24770979583263397, -1.0840983390808105, -1.6725637912750244, -0.0875590443611145, 1.8590481281280518, 0.7728368043899536, -0.1849467158317566, -1.1010329723358154, 1.6244077682495117, -0.6344180703163147, 0.963638186454773, 0.31322139501571655, -0.7772454619407654, -1.4893101453781128, 0.30903181433677673, 0.7154020071029663, -0.5574010610580444, 0.8894581198692322, -0.2736284136772156, 0.820974588394165, 0.9402085542678833, 0.5891591310501099, -0.4367303252220154, -2.1929962635040283, -0.5779077410697937, 0.38820701837539673, 0.4922569990158081, -0.8753288984298706, 1.0136375427246094, 0.019394319504499435, 1.722312331199646, 0.2710384726524353, -1.0102075338363647, -0.07982754707336426, 0.5039134621620178, 1.4629766941070557, 0.8444127440452576, 0.6071478128433228, -1.0692548751831055, 0.37654903531074524, 0.38084501028060913, 0.060779206454753876, -3.166724443435669, -0.44582754373550415, 1.7116972208023071, 0.006397247314453125, 1.4333548545837402, 0.19877439737319946, 0.36226382851600647, -0.2771022915840149, -3.18862247467041, -1.6031914949417114, -1.5906727313995361, -0.7801728248596191, -0.5076010823249817, -0.14842326939105988, 0.015200510621070862, -1.5727434158325195, -0.689371645450592, -0.14970527589321136, -1.1883646249771118, -0.24759502708911896, -1.1397225856781006, -0.644961953163147, -0.5563408732414246, -0.1977231800556183, 1.8396550416946411, -1.5172171592712402, -0.5078631043434143, -0.06178898736834526, 0.07014200091362, -0.38893982768058777, 0.01768570765852928, -0.07023255527019501, -2.080899953842163, -0.14131715893745422, -1.09488844871521, -1.1248059272766113, 1.6239290237426758, -0.8541146516799927, -0.6272264719009399, -0.15138152241706848, -0.08425568789243698, -0.3853505849838257, 1.6665630340576172, -0.8974027633666992, 0.2901102602481842, -0.007421165704727173, -0.6188895106315613, 0.10957193374633789, -0.2806505858898163, -0.836026132106781, 3.3423562049865723, 0.4019329249858856, 2.1692848205566406, 0.5303891897201538, 0.9089468717575073, 0.059301234781742096, -0.3815643787384033, -0.6334131956100464, -0.4524877369403839, 0.11138437688350677, -0.48254233598709106, -1.1971322298049927, -1.1642465591430664, -0.5069058537483215, -1.5609371662139893, -1.473394751548767, -0.6177328824996948, -0.4974835216999054, -0.08391624689102173, 0.6594066023826599, -0.9513956904411316, -2.2512741088867188, -0.24603143334388733, 0.25667595863342285, 1.1082983016967773, -0.1726899892091751, 1.0997402667999268, 2.0879065990448, -0.4593607485294342, -0.9473972916603088, 0.7709176540374756, 0.8734169602394104, -0.7889467477798462, -1.8815724849700928, -0.2699182629585266, -1.5873193740844727, 0.26123106479644775, -0.2221774458885193, 1.0739160776138306, 0.18534807860851288, -2.160674810409546, -0.04629536718130112, 1.278821349143982, 0.10483647882938385, 0.3833977282047272, -0.7663969993591309, 0.4543267488479614, 0.6389120221138, 0.27090680599212646, -0.8890918493270874, -0.7830485105514526, -0.13725489377975464, -0.04736420512199402, -2.185483932495117, 1.9198695421218872, 0.2390112429857254, 2.298023223876953, 0.7291362285614014, -1.7012341022491455, -0.04404148459434509, -0.5925688147544861, -0.22949424386024475, 0.9445973634719849, -1.1180191040039062, -0.9646226763725281, -0.2685708999633789, 0.020828183740377426, 0.051697224378585815, -0.9688526391983032, -0.19049599766731262, 1.4030835628509521, 1.8129684925079346, 0.5080695748329163, 1.4874533414840698, 1.2587729692459106, 3.512247323989868, 0.7640828490257263, 0.8047072291374207, -1.3373273611068726, -0.20381921529769897, 0.05535107105970383, 0.8689849376678467, -0.44162389636039734, 0.11577437818050385, -0.15261879563331604, -0.33357757329940796, 1.0707764625549316, -0.17028123140335083, 1.5632734298706055, 0.38713863492012024, 0.3126378059387207, 0.15362802147865295, 1.5944583415985107, -1.111302375793457, -0.6637331247329712, 0.11621794104576111, -0.6430407166481018, -0.3081246614456177, 1.0588809251785278, 3.444617748260498, 0.008341077715158463, -1.983335256576538, -0.17822325229644775, -0.9564747214317322, 0.8967085480690002]', 'arcface_v1');
INSERT INTO public.face_profiles VALUES (2, 4, '2026-07-23 11:03:09.38471', '2026-07-23 11:03:09.38471', 'active', true, '2026-07-23 11:03:09.38471', '2026-08-13 19:28:32.747419', '[-1.5859131813049316, -0.11489889770746231, 0.7313137650489807, 0.1829824447631836, 0.44900596141815186, -1.3877232074737549, -0.8336623907089233, -0.8863489627838135, -0.2827410399913788, 0.7846077084541321, -0.5781816244125366, -0.3032539486885071, -0.6610735654830933, -0.9025912880897522, 0.9889061450958252, -0.4208926558494568, 1.2299613952636719, 0.8875852823257446, 0.17212237417697906, 0.3440427780151367, 0.2687273621559143, -0.5747194886207581, -0.04018670320510864, -0.5112583637237549, 0.34749332070350647, -2.416970729827881, 0.16470980644226074, -0.7591455578804016, -1.0754055976867676, 0.21004825830459595, -0.1719876378774643, 0.0245017409324646, -0.966719388961792, -0.4582112431526184, 1.409924030303955, -0.9602665901184082, -0.9138845801353455, 2.736457586288452, 0.9150959253311157, 1.5699135065078735, 0.2090710550546646, 0.2765701115131378, 0.20528057217597961, 0.866989254951477, 0.11496730148792267, 0.7686004638671875, -1.4653412103652954, 0.6286226511001587, 0.7968865036964417, 1.7400411367416382, 0.09820520877838135, -0.40009939670562744, -1.1585299968719482, 0.7294803261756897, -1.301892876625061, 1.1676042079925537, 1.9911043643951416, 0.6854225397109985, 0.748003363609314, -0.16433897614479065, 1.743456482887268, 0.8763508796691895, -0.3316454291343689, 0.9244795441627502, 0.4306698441505432, -2.6275243759155273, -1.589035153388977, -1.3502857685089111, 0.30309829115867615, 0.047428689897060394, -0.8910847306251526, 0.1974371373653412, -0.38071733713150024, 0.16993877291679382, 1.4809962511062622, 0.7483381032943726, 0.6022773385047913, -0.6520012021064758, -1.5384788513183594, 0.9870487451553345, -0.3753170967102051, -1.5244948863983154, -0.0685049444437027, -0.3957372307777405, -0.4156949520111084, -0.32957619428634644, 0.1514582633972168, 1.5372097492218018, 1.4933353662490845, 1.0564510822296143, -2.0787620544433594, 1.555928111076355, -0.20411857962608337, -0.443774938583374, 2.5312371253967285, 0.1382320076227188, -0.04602509364485741, -0.5018721222877502, -1.2578755617141724, 0.7049803733825684, 0.7287363409996033, 0.03998430818319321, 0.6442528367042542, 1.1669436693191528, 0.9172623157501221, -0.8829720616340637, -0.34998127818107605, -0.02171790599822998, -0.6553100943565369, 0.34659796953201294, 2.2141106128692627, -2.435518741607666, 0.08156369626522064, -1.2876098155975342, 0.18813733756542206, -0.7999300956726074, 0.11451202630996704, 0.03989233821630478, 0.6898360848426819, -0.29479360580444336, 0.7047819495201111, 0.16065877676010132, -0.564103364944458, -1.1673094034194946, 0.1188599094748497, -1.0552937984466553, 1.4053165912628174, -1.4822779893875122, -0.5416420102119446, -0.9064536690711975, 1.4441804885864258, -0.4651241600513458, -0.4170134663581848, 0.19534650444984436, -1.2440190315246582, 0.2811272442340851, -1.49569571018219, -1.2483187913894653, 0.4131264090538025, -0.06941073387861252, 0.3473861813545227, 2.132359504699707, 1.503973126411438, 0.3723236918449402, 0.5836483836174011, 0.3726964592933655, -1.1043989658355713, 1.3887856006622314, -0.48232924938201904, 1.0331000089645386, 2.892496109008789, -0.8957369923591614, -0.4730226397514343, 0.005712856538593769, -0.42713505029678345, 0.7830827832221985, -1.2342076301574707, 0.8587534427642822, 0.6448805332183838, -0.54439777135849, 0.034093670547008514, -0.11514304578304291, -0.11917611956596375, 0.6262217164039612, 1.0023083686828613, 0.1266702264547348, 0.559544563293457, 0.2716500461101532, 0.7131373286247253, 0.5272555351257324, -1.0011711120605469, -0.6619073152542114, 0.15212133526802063, -0.8715378046035767, -1.852213978767395, -1.2779771089553833, 0.16402561962604523, 1.8588166236877441, -1.1401921510696411, -0.7773969173431396, 0.8285562992095947, -0.5205721855163574, 0.4564065933227539, 1.014816164970398, 0.7637303471565247, -0.11530187726020813, 0.29049214720726013, -1.2450053691864014, 0.6211016178131104, 1.2059741020202637, -0.5049317479133606, -0.7695543766021729, -0.22325031459331512, -1.1085398197174072, -0.15602421760559082, -1.3878147602081299, 1.1980394124984741, -0.19888043403625488, 0.045391105115413666, 1.6733702421188354, -0.6785024404525757, -1.614527940750122, -0.4524766802787781, 0.031809911131858826, 0.2745093107223511, -0.6507863402366638, -1.041995644569397, 0.004848465323448181, -0.22690381109714508, 0.32455897331237793, 2.0997042655944824, 0.04774146527051926, -1.1777207851409912, -0.5996465086936951, -2.9543824195861816, 3.305511236190796, -0.4169040024280548, -1.0105807781219482, -0.6784876585006714, -0.6202539205551147, -0.6972021460533142, -0.44847172498703003, 1.2631487846374512, 0.13587331771850586, 0.17783072590827942, -0.8453775644302368, -1.0328015089035034, -0.9797425270080566, -0.03270447254180908, 0.9830239415168762, -2.024759292602539, -0.4686398208141327, 2.271807909011841, -0.1832512617111206, 1.344992995262146, -0.15286751091480255, -1.1004480123519897, 1.180195927619934, 0.07629764825105667, 0.5041038990020752, -3.104149580001831, -0.8243098258972168, -1.4338027238845825, 0.4525575339794159, 0.45278462767601013, -0.7515726089477539, 0.6453324556350708, -1.446020483970642, -0.9374769330024719, 0.28992998600006104, 0.71538245677948, 0.1675688773393631, -0.7132608890533447, 0.05836748331785202, 1.3460302352905273, 0.0317995548248291, 0.05552992969751358, 0.41170454025268555, 1.4366495609283447, 0.4705253541469574, -0.3493973910808563, -0.633098304271698, -0.47433462738990784, 0.4681780934333801, 0.6624938249588013, -0.5483711957931519, 0.295256644487381, 1.2321350574493408, 0.6860144138336182, 1.1829514503479004, 1.217483401298523, 0.4154178202152252, 0.20802120864391327, -2.2851920127868652, 0.49978873133659363, -0.16926908493041992, 0.03169943392276764, 2.360884428024292, -1.6340659856796265, -1.5161492824554443, -1.143292784690857, 0.2658542990684509, -1.4310351610183716, -0.09103021025657654, -0.08257075399160385, 0.006948709487915039, -1.9464843273162842, -1.7043954133987427, -2.3143229484558105, 1.0243433713912964, -0.08661112189292908, 1.0061705112457275, 0.8368285894393921, 0.48665696382522583, 0.6725382804870605, 1.5313761234283447, 2.234431028366089, -0.297562837600708, -0.0005434602499008179, -0.12180635333061218, -0.846027135848999, -0.2428293228149414, -0.805637776851654, 0.8739944100379944, 0.514802873134613, -0.08844992518424988, 0.2888472378253937, 0.891550600528717, -1.1827178001403809, 2.044506549835205, -0.599120557308197, -0.5125565528869629, -1.269669771194458, 0.5652848482131958, -1.3548755645751953, -0.2272614985704422, -0.7905770540237427, -1.0149191617965698, -0.3685305118560791, 2.4186036586761475, 0.8830351233482361, 1.1726820468902588, -2.8860490322113037, 2.2933433055877686, 0.09649433195590973, 0.9973148107528687, 0.9009132385253906, 0.2923603057861328, -1.6774967908859253, 0.1986347734928131, -0.7076495885848999, -0.6363416314125061, 1.5420948266983032, 0.14455875754356384, 0.5913828611373901, 0.15106874704360962, 0.9986276030540466, 0.888077974319458, -2.490272283554077, -2.105900287628174, 1.3722338676452637, -0.07509471476078033, -0.4234482944011688, 0.07022753357887268, 0.3693752586841583, 1.0012329816818237, -0.15358901023864746, -1.2533811330795288, 0.6738699078559875, 0.7177741527557373, 0.43833598494529724, 1.9709062576293945, 1.7116103172302246, -0.48929768800735474, -0.22305715084075928, -0.21607813239097595, -0.7104055881500244, -2.1957149505615234, -1.0113377571105957, 0.612978994846344, 0.6908161044120789, 1.9280664920806885, 0.18665365874767303, -0.36035123467445374, -0.5633987188339233, -1.9785199165344238, -2.470189094543457, -0.9331491589546204, -0.9959620237350464, -0.7903980016708374, -0.9539519548416138, 0.504417896270752, -1.6817598342895508, -1.199714183807373, -0.8353612422943115, -0.8137217164039612, 0.19827304780483246, -0.6454787254333496, -1.337030053138733, -0.20297783613204956, -0.22126466035842896, 0.21147792041301727, -1.4029227495193481, -1.9774225950241089, 0.5106611251831055, -0.17095379531383514, 0.1328732967376709, 0.46512508392333984, -0.2300327569246292, -0.3226231038570404, 0.13058948516845703, -0.6459107995033264, -0.9858288764953613, 1.1052714586257935, -1.6436527967453003, -1.456579566001892, -0.7511023283004761, 0.7357884049415588, -0.1911245733499527, 0.8060967922210693, -0.028130412101745605, 0.315121054649353, -0.36451196670532227, -0.18207144737243652, 0.6620364785194397, -1.3947012424468994, -1.0680736303329468, 1.0779091119766235, 0.5692066550254822, 1.9844810962677002, 0.37200483679771423, 1.2016785144805908, -0.14936833083629608, 0.44663867354393005, -0.2098207175731659, -0.22813859581947327, 0.8100394606590271, 0.47982168197631836, -1.2498043775558472, -1.9166102409362793, -1.0284322500228882, -1.216421365737915, -1.4495964050292969, 0.3275776505470276, 0.5904659032821655, -0.6098500490188599, 0.8516067862510681, -0.3458670675754547, -1.3995000123977661, -0.376854807138443, -0.9812712073326111, 1.2706702947616577, -0.21186110377311707, 0.8170313835144043, 1.2823010683059692, -1.606273889541626, -0.7675206065177917, 1.2544260025024414, -0.3546389937400818, -0.17494401335716248, -0.9968233108520508, -0.34904947876930237, -1.6305168867111206, 0.8322029113769531, 0.10591557621955872, 0.9131674766540527, 0.27005577087402344, -2.027777671813965, 0.0745965987443924, 1.1193456649780273, -0.9257788062095642, -0.27668774127960205, -0.5455187559127808, 0.17717154324054718, 0.9974814653396606, 0.13862881064414978, 0.23697581887245178, 0.3067063093185425, 1.6314387321472168, 0.8481776714324951, -2.4907398223876953, 2.095686912536621, 0.734221875667572, 0.513390064239502, 0.6363534927368164, -0.6652121543884277, -0.11195342987775803, -0.46959248185157776, -0.5590783357620239, 1.0811463594436646, -0.03942137956619263, -0.9707385301589966, 0.2152194082736969, 1.2275789976119995, -0.4877026081085205, -0.21259629726409912, -0.7036083340644836, 0.4155898690223694, 2.1933276653289795, 0.11504129320383072, 1.2192442417144775, 0.8285234570503235, 3.1235790252685547, -0.06414197385311127, -0.40044569969177246, -1.479985237121582, -0.7960085272789001, -0.8133281469345093, 1.1512247323989868, -0.2646121680736542, 1.1954046487808228, 0.5633773803710938, -0.5364498496055603, 1.1989294290542603, -0.46516525745391846, 1.896446704864502, 1.199009656906128, -0.3547537326812744, 0.4326075315475464, 2.1321020126342773, -1.606157660484314, -0.3262730836868286, 0.028826728463172913, -0.501768946647644, -1.413576364517212, 1.063977837562561, 3.28531551361084, -0.40693673491477966, -1.5001564025878906, -0.705372154712677, 1.5176581144332886, 1.6434448957443237]', 'arcface_v1');


--
-- Data for Name: face_security_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.face_security_logs VALUES (1, 4, 'REGISTER', 'SUCCESS', NULL, '2026-07-23 11:03:09.390508');
INSERT INTO public.face_security_logs VALUES (2, 4, 'VERIFY', 'SUCCESS', 92.56016422848981, '2026-07-23 11:03:51.398891');
INSERT INTO public.face_security_logs VALUES (3, 4, 'VERIFY', 'SUCCESS', 100, '2026-08-06 10:25:14.496424');
INSERT INTO public.face_security_logs VALUES (4, 4, 'VERIFY', 'SUCCESS', 100, '2026-08-06 10:25:45.963269');
INSERT INTO public.face_security_logs VALUES (5, 4, 'VERIFY', 'SUCCESS', 100, '2026-08-06 10:26:04.478175');
INSERT INTO public.face_security_logs VALUES (6, 4, 'VERIFY', 'SUCCESS', 100, '2026-08-06 10:26:25.426088');
INSERT INTO public.face_security_logs VALUES (7, 4, 'VERIFY', 'SUCCESS', 85.97606290463156, '2026-08-06 10:32:51.467293');
INSERT INTO public.face_security_logs VALUES (8, 4, 'VERIFY', 'SUCCESS', 86.64259884680081, '2026-08-06 10:33:31.332586');
INSERT INTO public.face_security_logs VALUES (9, 4, 'VERIFY', 'SUCCESS', 85.45870361714877, '2026-08-06 10:35:11.884002');
INSERT INTO public.face_security_logs VALUES (10, 4, 'VERIFY', 'SUCCESS', 85.51322686060698, '2026-08-06 10:35:23.828365');
INSERT INTO public.face_security_logs VALUES (11, 4, 'VERIFY', 'SUCCESS', 100, '2026-08-06 10:44:04.250343');
INSERT INTO public.face_security_logs VALUES (12, 4, 'VERIFY', 'SUCCESS', 100, '2026-08-06 10:44:06.107084');
INSERT INTO public.face_security_logs VALUES (13, 4, 'VERIFY', 'SUCCESS', 100, '2026-08-06 10:44:08.473682');
INSERT INTO public.face_security_logs VALUES (14, 4, 'VERIFY', 'SUCCESS', 100, '2026-08-06 10:44:10.406558');
INSERT INTO public.face_security_logs VALUES (15, 4, 'VERIFY', 'SUCCESS', 85.90982569529729, '2026-08-06 10:45:56.024311');
INSERT INTO public.face_security_logs VALUES (16, 4, 'VERIFY', 'SUCCESS', 85.17735717782365, '2026-08-06 10:46:01.737051');
INSERT INTO public.face_security_logs VALUES (17, 4, 'VERIFY', 'SUCCESS', 85.23766454749399, '2026-08-06 10:56:13.684292');
INSERT INTO public.face_security_logs VALUES (18, 4, 'VERIFY', 'SUCCESS', 82.70081135231698, '2026-08-06 11:05:15.063011');
INSERT INTO public.face_security_logs VALUES (19, 4, 'VERIFY', 'SUCCESS', 84.80809494111851, '2026-08-06 11:10:43.241937');
INSERT INTO public.face_security_logs VALUES (20, 4, 'VERIFY', 'SUCCESS', 83.35231366803862, '2026-08-06 11:19:32.408959');
INSERT INTO public.face_security_logs VALUES (21, 4, 'VERIFY', 'SUCCESS', 85.67965923391638, '2026-08-06 11:21:27.020694');
INSERT INTO public.face_security_logs VALUES (22, 4, 'VERIFY', 'SUCCESS', 84.34432884269502, '2026-08-06 11:34:52.532934');
INSERT INTO public.face_security_logs VALUES (23, 4, 'VERIFY', 'SUCCESS', 84.74626659077305, '2026-08-06 11:41:14.850548');
INSERT INTO public.face_security_logs VALUES (24, 4, 'VERIFY', 'SUCCESS', 84.76398205742679, '2026-08-06 11:44:46.85176');
INSERT INTO public.face_security_logs VALUES (25, 4, 'VERIFY', 'SUCCESS', 82.3876775647278, '2026-08-06 11:44:58.698206');
INSERT INTO public.face_security_logs VALUES (26, 4, 'VERIFY', 'SUCCESS', 83.97772280989744, '2026-08-06 12:02:35.998441');
INSERT INTO public.face_security_logs VALUES (27, 4, 'VERIFY', 'SUCCESS', 85.9453012931161, '2026-08-06 12:03:12.748315');
INSERT INTO public.face_security_logs VALUES (28, 4, 'VERIFY', 'SUCCESS', 83.3611739136551, '2026-08-06 14:11:00.623371');
INSERT INTO public.face_security_logs VALUES (29, 4, 'VERIFY', 'SUCCESS', 86.11220262185684, '2026-08-06 14:12:47.328246');
INSERT INTO public.face_security_logs VALUES (30, 4, 'VERIFY', 'SUCCESS', 85.57634456521521, '2026-08-06 14:13:38.667939');
INSERT INTO public.face_security_logs VALUES (31, 4, 'VERIFY', 'SUCCESS', 84.2514791758201, '2026-08-06 14:20:14.908728');
INSERT INTO public.face_security_logs VALUES (32, 4, 'VERIFY', 'SUCCESS', 84.49293925407792, '2026-08-06 14:38:06.04052');
INSERT INTO public.face_security_logs VALUES (33, 4, 'VERIFY', 'SUCCESS', 85.18833166033647, '2026-08-06 14:38:46.525166');
INSERT INTO public.face_security_logs VALUES (34, 4, 'VERIFY', 'SUCCESS', 83.91090939664865, '2026-08-06 14:45:54.026518');
INSERT INTO public.face_security_logs VALUES (35, 4, 'VERIFY', 'SUCCESS', 84.5783398976005, '2026-08-06 14:49:12.924219');
INSERT INTO public.face_security_logs VALUES (36, 4, 'VERIFY', 'SUCCESS', 83.84628574566864, '2026-08-06 14:58:23.968149');
INSERT INTO public.face_security_logs VALUES (37, 4, 'VERIFY', 'SUCCESS', 85.4277943284686, '2026-08-06 14:58:54.52109');
INSERT INTO public.face_security_logs VALUES (38, 4, 'VERIFY', 'SUCCESS', 83.7378498140654, '2026-08-06 14:59:26.184235');
INSERT INTO public.face_security_logs VALUES (39, 4, 'VERIFY', 'SUCCESS', 84.28710860824104, '2026-08-06 15:18:13.297088');
INSERT INTO public.face_security_logs VALUES (40, 4, 'VERIFY', 'SUCCESS', 83.77503342054378, '2026-08-06 15:40:28.836932');
INSERT INTO public.face_security_logs VALUES (41, 4, 'VERIFY', 'SUCCESS', 84.07150176941536, '2026-08-06 15:41:33.183882');
INSERT INTO public.face_security_logs VALUES (42, 4, 'VERIFY', 'SUCCESS', 83.2772193131618, '2026-08-06 15:42:20.426517');
INSERT INTO public.face_security_logs VALUES (43, 4, 'VERIFY', 'SUCCESS', 85.20545039710746, '2026-08-06 18:05:08.403478');
INSERT INTO public.face_security_logs VALUES (44, 4, 'VERIFY', 'SUCCESS', 83.79281165384785, '2026-08-06 18:26:49.640117');
INSERT INTO public.face_security_logs VALUES (45, 4, 'VERIFY', 'SUCCESS', 84.95662739588275, '2026-08-06 18:56:02.182375');
INSERT INTO public.face_security_logs VALUES (46, 4, 'VERIFY', 'SUCCESS', 86.30429075350085, '2026-08-06 20:30:06.104972');
INSERT INTO public.face_security_logs VALUES (47, 4, 'VERIFY', 'SUCCESS', 83.7617212517189, '2026-08-06 20:54:13.676158');
INSERT INTO public.face_security_logs VALUES (48, 4, 'VERIFY', 'SUCCESS', 83.45204421671666, '2026-08-06 21:00:34.35191');
INSERT INTO public.face_security_logs VALUES (49, 4, 'VERIFY', 'SUCCESS', 86.1355421620778, '2026-08-08 09:07:25.185495');
INSERT INTO public.face_security_logs VALUES (50, 4, 'VERIFY', 'SUCCESS', 87.40687720455456, '2026-08-08 10:37:42.414386');
INSERT INTO public.face_security_logs VALUES (51, 4, 'VERIFY', 'SUCCESS', 85.97741412976407, '2026-08-08 13:31:24.930389');
INSERT INTO public.face_security_logs VALUES (52, 4, 'VERIFY', 'SUCCESS', 85.24437868023995, '2026-08-08 13:32:38.429021');
INSERT INTO public.face_security_logs VALUES (53, 4, 'VERIFY', 'SUCCESS', 89.03967720193872, '2026-08-08 19:58:10.246016');
INSERT INTO public.face_security_logs VALUES (54, 4, 'VERIFY', 'SUCCESS', 88.29686152350702, '2026-08-08 20:04:34.043598');
INSERT INTO public.face_security_logs VALUES (55, 4, 'VERIFY', 'SUCCESS', 85.87442827593273, '2026-08-11 17:46:57.287315');
INSERT INTO public.face_security_logs VALUES (56, 4, 'VERIFY', 'SUCCESS', 84.7445982081632, '2026-08-11 17:48:32.949254');
INSERT INTO public.face_security_logs VALUES (57, 4, 'VERIFY', 'SUCCESS', 83.6915192101982, '2026-08-11 18:11:44.188516');
INSERT INTO public.face_security_logs VALUES (58, 4, 'VERIFY', 'SUCCESS', 83.38695522655203, '2026-08-11 18:29:53.972181');
INSERT INTO public.face_security_logs VALUES (59, 4, 'VERIFY', 'SUCCESS', 84.55199559689778, '2026-08-11 18:39:33.947152');
INSERT INTO public.face_security_logs VALUES (60, 4, 'VERIFY', 'SUCCESS', 84.78332474149451, '2026-08-11 18:52:46.032487');
INSERT INTO public.face_security_logs VALUES (61, 4, 'VERIFY', 'SUCCESS', 84.75749808206447, '2026-08-11 19:02:06.260632');
INSERT INTO public.face_security_logs VALUES (62, 4, 'VERIFY', 'SUCCESS', 85.88915282170613, '2026-08-11 19:02:09.0212');
INSERT INTO public.face_security_logs VALUES (63, 4, 'VERIFY', 'SUCCESS', 86.34740295949263, '2026-08-11 19:02:12.072292');
INSERT INTO public.face_security_logs VALUES (64, 4, 'VERIFY', 'SUCCESS', 86.19933788462329, '2026-08-11 19:02:15.151198');
INSERT INTO public.face_security_logs VALUES (65, 4, 'VERIFY', 'SUCCESS', 83.42350772402962, '2026-08-11 19:02:18.22721');
INSERT INTO public.face_security_logs VALUES (66, 4, 'VERIFY', 'SUCCESS', 84.90751739150633, '2026-08-11 19:02:21.209909');
INSERT INTO public.face_security_logs VALUES (67, 4, 'VERIFY', 'SUCCESS', 87.13156198425254, '2026-08-11 19:02:26.007382');
INSERT INTO public.face_security_logs VALUES (68, 4, 'VERIFY', 'SUCCESS', 86.2710973832299, '2026-08-11 19:02:29.472064');
INSERT INTO public.face_security_logs VALUES (69, 4, 'VERIFY', 'SUCCESS', 87.07528527564087, '2026-08-11 19:02:32.705766');
INSERT INTO public.face_security_logs VALUES (70, 4, 'VERIFY', 'FAILED', NULL, '2026-08-11 19:02:34.972669');
INSERT INTO public.face_security_logs VALUES (71, 4, 'VERIFY', 'SUCCESS', 87.81952547841082, '2026-08-11 19:02:50.03373');
INSERT INTO public.face_security_logs VALUES (72, 4, 'VERIFY', 'SUCCESS', 87.3644888600968, '2026-08-11 19:02:52.835823');
INSERT INTO public.face_security_logs VALUES (73, 4, 'VERIFY', 'SUCCESS', 84.28697289103488, '2026-08-11 19:10:55.077998');
INSERT INTO public.face_security_logs VALUES (74, 4, 'VERIFY', 'SUCCESS', 84.99204770295634, '2026-08-11 19:10:58.183246');
INSERT INTO public.face_security_logs VALUES (75, 4, 'VERIFY', 'SUCCESS', 87.19972746778622, '2026-08-11 19:27:22.851754');
INSERT INTO public.face_security_logs VALUES (76, 4, 'VERIFY', 'SUCCESS', 84.60226731841458, '2026-08-11 19:28:57.815415');
INSERT INTO public.face_security_logs VALUES (77, 4, 'VERIFY', 'SUCCESS', 83.5148395306692, '2026-08-11 19:38:55.313091');
INSERT INTO public.face_security_logs VALUES (78, 4, 'VERIFY', 'SUCCESS', 84.34186828528239, '2026-08-11 19:41:40.570062');
INSERT INTO public.face_security_logs VALUES (79, 4, 'VERIFY', 'SUCCESS', 84.09942054563568, '2026-08-12 11:13:41.655836');
INSERT INTO public.face_security_logs VALUES (80, 4, 'VERIFY', 'SUCCESS', 84.390242692186, '2026-08-12 12:04:06.087066');
INSERT INTO public.face_security_logs VALUES (81, 4, 'VERIFY', 'SUCCESS', 86.26612394355303, '2026-08-12 12:13:30.794516');
INSERT INTO public.face_security_logs VALUES (82, 4, 'VERIFY', 'SUCCESS', 84.02036453348043, '2026-08-12 12:13:48.581541');
INSERT INTO public.face_security_logs VALUES (83, 4, 'VERIFY', 'SUCCESS', 85.29154490017167, '2026-08-12 14:17:00.883235');
INSERT INTO public.face_security_logs VALUES (84, 4, 'VERIFY', 'SUCCESS', 87.45120249679337, '2026-08-12 14:25:30.397322');
INSERT INTO public.face_security_logs VALUES (85, 4, 'VERIFY', 'SUCCESS', 88.97458289992252, '2026-08-13 19:27:29.109919');
INSERT INTO public.face_security_logs VALUES (86, 4, 'VERIFY', 'SUCCESS', 89.26154027784837, '2026-08-13 19:28:23.630568');
INSERT INTO public.face_security_logs VALUES (87, 4, 'VERIFY', 'SUCCESS', 87.9177763753801, '2026-08-13 19:28:32.737613');
INSERT INTO public.face_security_logs VALUES (89, 39, 'REGISTER', 'SUCCESS', NULL, '2026-08-13 19:38:55.415902');
INSERT INTO public.face_security_logs VALUES (90, 39, 'VERIFY', 'SUCCESS', 98.02363083678662, '2026-08-13 19:39:21.676212');
INSERT INTO public.face_security_logs VALUES (91, 39, 'REGISTER', 'SUCCESS', NULL, '2026-08-14 11:39:40.301964');
INSERT INTO public.face_security_logs VALUES (92, 39, 'VERIFY', 'SUCCESS', 96.98221044408368, '2026-08-14 11:39:52.466845');
INSERT INTO public.face_security_logs VALUES (93, 39, 'VERIFY', 'SUCCESS', 96.69777493600935, '2026-08-14 11:45:19.387852');
INSERT INTO public.face_security_logs VALUES (94, 39, 'VERIFY', 'SUCCESS', 95.1074618352337, '2026-08-14 11:45:30.631968');
INSERT INTO public.face_security_logs VALUES (95, 39, 'VERIFY', 'SUCCESS', 95.01205546553224, '2026-08-14 12:01:46.979811');
INSERT INTO public.face_security_logs VALUES (96, 39, 'VERIFY', 'SUCCESS', 95.62089972615743, '2026-08-14 12:32:03.479122');
INSERT INTO public.face_security_logs VALUES (97, 39, 'VERIFY', 'SUCCESS', 95.90308788098987, '2026-08-14 12:33:26.114402');
INSERT INTO public.face_security_logs VALUES (99, 39, 'UPDATE', 'SUCCESS', NULL, '2026-08-14 12:51:42.612311');
INSERT INTO public.face_security_logs VALUES (101, 39, 'VERIFY', 'SUCCESS', NULL, '2026-08-14 13:07:38.818127');
INSERT INTO public.face_security_logs VALUES (102, 39, 'UPDATE', 'SUCCESS', NULL, '2026-08-14 13:07:44.14621');


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.holidays VALUES (1, '2026-07-30', 'aid', 'National', false, 'aid', 'blue', '2026-07-23 11:05:10.953197', '2026-07-30');
INSERT INTO public.holidays VALUES (26, '2026-08-15', 'Summer Holiday', 'National', false, NULL, NULL, '2026-08-13 18:35:03.947848', '2026-08-17');
INSERT INTO public.holidays VALUES (27, '2026-08-27', 'f', 'National', false, 'f', NULL, '2026-08-13 18:37:11.0366', '2026-08-27');
INSERT INTO public.holidays VALUES (29, '2026-08-31', 'aid', 'Religious', false, 'aid111', NULL, '2026-08-14 11:56:57.223389', '2026-08-31');


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.leave_balances VALUES (1, 1, 22.00, 5.00, '2026-08-06', '2026-08-06 11:01:27.764582', '2026-08-11 19:55:14.256937');
INSERT INTO public.leave_balances VALUES (711, 15, 22.00, 5.00, '2026-08-12', '2026-08-12 08:48:43.683565', '2026-08-12 08:48:43.683565');
INSERT INTO public.leave_balances VALUES (833, 33, 22.00, 5.00, '2026-08-12', '2026-08-12 12:20:33.369861', '2026-08-12 12:20:33.369861');
INSERT INTO public.leave_balances VALUES (911, 39, 19.00, 5.00, '2026-08-13', '2026-08-13 19:05:35.645639', '2026-08-14 11:55:45.813072');
INSERT INTO public.leave_balances VALUES (3, 4, 23.00, 2.00, '2026-08-06', '2026-08-06 11:01:27.764582', '2026-08-14 11:55:51.893029');


--
-- Data for Name: leave_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.leave_transactions VALUES (4, 4, 'sick', -3.00, 'DEDUCTION', 13, '2026-08-11 19:27:11.453326');
INSERT INTO public.leave_transactions VALUES (5, 1, 'paid', -2.00, 'DEDUCTION', 16, '2026-08-11 19:35:01.007265');
INSERT INTO public.leave_transactions VALUES (6, 4, 'paid', -1.00, 'DEDUCTION', 22, '2026-08-11 19:40:22.268782');
INSERT INTO public.leave_transactions VALUES (7, 39, 'paid', -3.00, 'DEDUCTION', 36, '2026-08-14 11:55:45.813072');
INSERT INTO public.leave_transactions VALUES (8, 4, 'paid', 1.00, 'REFUND', 22, '2026-08-14 11:55:51.893029');


--
-- Data for Name: login_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.login_history VALUES (1, 1, '2026-07-23 10:32:56.955956', '::ffff:127.0.0.1', true, NULL, 'Unknown Browser', 'Unknown OS');
INSERT INTO public.login_history VALUES (2, 1, '2026-07-23 10:33:58.929026', '::1', false, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (3, 1, '2026-07-23 10:34:03.672521', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (4, 1, '2026-07-23 10:43:01.239803', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (5, 1, '2026-07-23 10:45:30.098935', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (6, 1, '2026-07-23 10:48:54.39986', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (7, 1, '2026-07-23 10:49:45.523475', '::ffff:127.0.0.1', true, NULL, 'Unknown Browser', 'Unknown OS');
INSERT INTO public.login_history VALUES (8, 1, '2026-07-23 10:50:14.031477', '::ffff:127.0.0.1', true, NULL, 'Unknown Browser', 'Unknown OS');
INSERT INTO public.login_history VALUES (10, 1, '2026-07-23 10:51:09.357362', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (11, 1, '2026-07-23 10:51:25.771956', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (12, 1, '2026-07-23 10:54:15.469844', '::ffff:127.0.0.1', true, NULL, 'Unknown Browser', 'Unknown OS');
INSERT INTO public.login_history VALUES (14, 1, '2026-07-23 10:55:26.034477', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (16, 1, '2026-07-23 10:55:57.554052', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (17, 1, '2026-07-23 10:58:38.969795', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (19, 1, '2026-07-23 11:01:57.488142', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (20, 9, '2026-07-23 11:03:30.680232', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (22, 9, '2026-07-23 11:05:59.029693', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (23, 1, '2026-08-06 10:17:47.623033', '::1', false, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (24, 1, '2026-08-06 10:17:53.512754', '::1', false, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (180, 1, '2026-08-12 10:43:26.367558', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (26, 9, '2026-08-06 10:25:14.49357', '::ffff:127.0.0.1', true, NULL, 'Unknown Browser', 'Unknown OS');
INSERT INTO public.login_history VALUES (28, 9, '2026-08-06 10:25:45.958104', '::ffff:127.0.0.1', true, NULL, 'Unknown Browser', 'Unknown OS');
INSERT INTO public.login_history VALUES (29, 9, '2026-08-06 10:26:04.471762', '::ffff:127.0.0.1', true, NULL, 'Unknown Browser', 'Unknown OS');
INSERT INTO public.login_history VALUES (30, 9, '2026-08-06 10:26:25.423075', '::ffff:127.0.0.1', true, NULL, 'Unknown Browser', 'Unknown OS');
INSERT INTO public.login_history VALUES (31, 9, '2026-08-06 10:32:40.38555', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (32, 9, '2026-08-06 10:33:31.32984', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (33, 9, '2026-08-06 10:35:11.880015', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (35, 9, '2026-08-06 10:35:23.824951', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (36, 9, '2026-08-06 10:44:04.247922', '::ffff:127.0.0.1', true, NULL, 'Unknown Browser', 'Unknown OS');
INSERT INTO public.login_history VALUES (37, 9, '2026-08-06 10:45:56.02017', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (186, 59, '2026-08-12 11:10:06.393878', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (39, 9, '2026-08-06 11:10:43.239233', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (188, 59, '2026-08-12 11:56:50.408242', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (41, 9, '2026-08-06 11:19:32.407179', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (43, 9, '2026-08-06 11:21:27.018957', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (193, 58, '2026-08-12 12:03:54.685453', '::1', false, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (45, 9, '2026-08-06 11:34:52.529823', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (194, 58, '2026-08-12 12:03:58.82158', '::1', false, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (47, 9, '2026-08-06 11:41:14.848339', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (195, 9, '2026-08-12 12:04:06.081054', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (49, 9, '2026-08-06 11:44:46.847092', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (50, 9, '2026-08-06 11:44:58.694127', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (197, 59, '2026-08-12 12:07:44.186852', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (52, 9, '2026-08-06 12:02:35.994522', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (199, 9, '2026-08-12 12:13:30.789949', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (54, 9, '2026-08-06 12:03:12.742939', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (200, 9, '2026-08-12 12:13:48.578966', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (56, 9, '2026-08-06 14:11:00.618694', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (202, 1, '2026-08-12 12:17:06.129528', '::1', false, NULL, 'Chrome Headless', 'Linux');
INSERT INTO public.login_history VALUES (58, 9, '2026-08-06 14:12:47.323103', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (60, 9, '2026-08-06 14:13:38.664096', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (62, 9, '2026-08-06 14:20:14.905913', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (208, 1, '2026-08-12 14:20:37.894937', '::1', false, NULL, 'Chrome Headless', 'Linux');
INSERT INTO public.login_history VALUES (64, 9, '2026-08-06 14:38:06.037954', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (210, 9, '2026-08-12 14:21:54.085756', '::1', false, NULL, 'Chrome Headless', 'Linux');
INSERT INTO public.login_history VALUES (66, 9, '2026-08-06 14:38:46.521139', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (212, 59, '2026-08-12 17:03:19.401557', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (68, 9, '2026-08-06 14:45:54.022773', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (213, 59, '2026-08-13 18:18:56.993543', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (70, 9, '2026-08-06 14:49:12.920497', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (215, 1, '2026-08-13 18:44:17.220886', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (72, 9, '2026-08-06 14:58:23.965691', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (217, 9, '2026-08-13 19:27:29.106066', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (74, 9, '2026-08-06 14:58:54.516735', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (76, 9, '2026-08-06 14:59:26.181853', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (221, 83, '2026-08-14 11:39:52.460004', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (78, 9, '2026-08-06 15:18:13.293704', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (223, 1, '2026-08-14 11:51:28.591826', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (225, 1, '2026-08-14 12:00:35.980905', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (227, 1, '2026-08-14 12:31:39.194213', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (82, 9, '2026-08-06 15:31:18.324473', '::1', true, NULL, 'Unknown Browser', 'Unknown OS');
INSERT INTO public.login_history VALUES (83, 9, '2026-08-06 15:40:28.83405', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (229, 83, '2026-08-14 12:32:03.473712', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (231, 83, '2026-08-14 12:33:26.110417', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (88, 9, '2026-08-06 15:41:33.181539', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (90, 9, '2026-08-06 15:42:20.421452', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (91, 9, '2026-08-06 18:05:08.394657', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (93, 1, '2026-08-06 18:07:45.470304', '::1', false, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (94, 1, '2026-08-06 18:10:30.65354', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (100, 1, '2026-08-06 18:13:10.62571', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (103, 9, '2026-08-06 18:26:49.635269', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (105, 9, '2026-08-06 18:56:02.17727', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (108, 9, '2026-08-06 20:29:36.56204', '::1', false, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (109, 9, '2026-08-06 20:29:41.935553', '::1', false, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (110, 9, '2026-08-06 20:29:53.57463', '::1', false, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (111, 9, '2026-08-06 20:30:06.102406', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (112, 9, '2026-08-06 20:54:13.671158', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (114, 9, '2026-08-06 21:00:34.348249', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (116, 9, '2026-08-08 09:07:25.180122', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (175, 1, '2026-08-12 09:50:00.51669', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (119, 9, '2026-08-08 10:37:42.408662', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (122, 1, '2026-08-08 12:35:24.194465', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (124, 9, '2026-08-08 13:31:24.927384', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (125, 1, '2026-08-08 13:32:02.5272', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (126, 9, '2026-08-08 13:32:38.426682', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (185, 1, '2026-08-12 11:08:42.078212', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (187, 9, '2026-08-12 11:13:41.651752', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (130, 9, '2026-08-08 19:58:10.241605', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (132, 9, '2026-08-08 20:04:34.032092', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (134, 9, '2026-08-11 17:46:57.281748', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (136, 9, '2026-08-11 17:48:32.941593', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (137, 9, '2026-08-11 18:11:44.184781', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (139, 9, '2026-08-11 18:29:53.967418', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (141, 9, '2026-08-11 18:39:33.941417', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (201, 1, '2026-08-12 12:14:31.555246', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (143, 9, '2026-08-11 18:52:46.029001', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (145, 9, '2026-08-11 19:27:22.848885', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (147, 9, '2026-08-11 19:28:57.812072', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (207, 9, '2026-08-12 14:17:00.877965', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (149, 1, '2026-08-11 19:35:02.691597', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (151, 9, '2026-08-11 19:38:55.308677', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (211, 9, '2026-08-12 14:25:30.391876', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (153, 9, '2026-08-11 19:41:40.565878', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (214, 59, '2026-08-13 18:35:09.233314', '::1', false, NULL, 'Chrome Headless', 'Linux');
INSERT INTO public.login_history VALUES (155, 1, '2026-08-11 20:16:40.45806', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (216, 72, '2026-08-13 18:57:26.372819', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (157, 1, '2026-08-12 08:28:38.577266', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (158, 1, '2026-08-12 08:31:59.862101', '::1', true, NULL, 'Mobile Safari', 'iOS');
INSERT INTO public.login_history VALUES (218, 9, '2026-08-13 19:28:23.620424', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (220, 1, '2026-08-14 10:53:42.720552', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (161, 1, '2026-08-12 08:40:54.182429', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (222, 59, '2026-08-14 11:51:16.099551', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (224, 72, '2026-08-14 11:51:45.027482', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (226, 83, '2026-08-14 12:01:46.977976', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (165, 1, '2026-08-12 08:48:52.310508', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (228, 59, '2026-08-14 12:31:50.510468', '::1', true, NULL, 'Opera', 'Linux');
INSERT INTO public.login_history VALUES (230, 59, '2026-08-14 12:32:27.555719', '::1', true, NULL, 'Opera', 'Linux');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.notifications VALUES (7, 72, 'New Leave Request', 'Employee ''winsap.emp1'' submitted a Telework request (2026-08-21 to 2026-08-21).', 'warning', false, '2026-08-14 12:32:18.331603', 37, 'absence', NULL);
INSERT INTO public.notifications VALUES (8, 59, 'New Leave Request', 'Employee ''winsap.emp1'' submitted a Telework request (2026-08-21 to 2026-08-21).', 'warning', true, '2026-08-14 12:32:18.333725', 37, 'absence', '2026-08-14 12:32:35.489688');
INSERT INTO public.notifications VALUES (6, 83, 'Leave Request Submitted', 'Your Telework request (2026-08-21 to 2026-08-21) was submitted successfully.', 'success', true, '2026-08-14 12:32:18.326563', 37, 'absence', '2026-08-14 12:45:21.203513');
INSERT INTO public.notifications VALUES (9, 83, 'Leave Request Rejected', 'Your request for Telework (2026-08-21 to 2026-08-21) was not approved.', 'error', true, '2026-08-14 12:32:40.867029', 37, 'absence', '2026-08-14 12:45:21.203513');


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: qr_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.qr_sessions VALUES (1, 1, '0c04619e9c3d4c7151e84cf3f67a8e3accc590623440dd59377cc8e99201cb1e', '2026-07-23 10:51:26.289', true, '2026-07-23 10:50:26.289922');
INSERT INTO public.qr_sessions VALUES (2, 1, '71a5e9ee1d2ac3269b78fb8f918f226a2f02c82c74d3219787d36ec6e4daa9aa', '2026-07-23 10:51:26.296', false, '2026-07-23 10:50:26.296419');
INSERT INTO public.qr_sessions VALUES (3, 1, '109902a440cc88e476f352d736b86f984ff1283e8084cd306786821d5f007f8f', '2026-07-23 10:45:26.297', false, '2026-07-23 10:50:26.29772');
INSERT INTO public.qr_sessions VALUES (4, 1, '41b8afb17aa594c825af1a15cd681bed7382c3b06ce099c14133328aefdbc18d', '2026-07-23 11:01:33.499', false, '2026-07-23 11:00:33.500186');
INSERT INTO public.qr_sessions VALUES (5, 1, 'a5106f60165d314ff536f6d614c9c1b39a62c0d66fc8608517cdd64915dba534', '2026-07-23 11:01:33.501', false, '2026-07-23 11:00:33.501321');
INSERT INTO public.qr_sessions VALUES (6, 1, '4904de614ad6d2673867fb8dab4373475a3d2c5225cde297120b61baf202590d', '2026-07-23 11:06:42.852', false, '2026-07-23 11:05:42.852224');
INSERT INTO public.qr_sessions VALUES (7, 1, '21f7c1e8b4884103e6a7e217a5d197038fc14ed325da577662b7a70cd3c0c19b', '2026-07-23 11:06:42.87', false, '2026-07-23 11:05:42.871049');
INSERT INTO public.qr_sessions VALUES (8, 1, 'bd9d522377a2d78eee2df1e9e1bb860c6d9e365800ab871b39cc6f11563410b2', '2026-07-23 11:06:46.233', false, '2026-07-23 11:05:46.233197');
INSERT INTO public.qr_sessions VALUES (9, 1, 'b0f35ea8c6a822d6bd1dec1de072003e254c568c6fd4d11a22f67f794437a7ff', '2026-08-06 11:19:22.071', false, '2026-08-06 11:18:22.071354');
INSERT INTO public.qr_sessions VALUES (10, 1, '5fd7fe69a83821129eea30ed1b4616d2dade7269ab123c6022ddab8edf3b6649', '2026-08-06 11:19:22.083', false, '2026-08-06 11:18:22.08383');
INSERT INTO public.qr_sessions VALUES (11, 1, '722557baf5a150665d2cd96b4c138817cf610b1f1688d423e9c698360085975d', '2026-08-06 11:19:29.175', false, '2026-08-06 11:18:29.176015');
INSERT INTO public.qr_sessions VALUES (12, 1, '743efb7b3c07b923aa3c353603c373d4ccad50eb2bde9e6a1caaa588d4da823d', '2026-08-06 11:19:29.177', false, '2026-08-06 11:18:29.177394');
INSERT INTO public.qr_sessions VALUES (13, 1, '6ba2fdae2311d2f2181bdae6fa223934ce306b51a72fc460a632d8e0111ee8c6', '2026-08-06 11:28:15.207', false, '2026-08-06 11:27:15.207499');
INSERT INTO public.qr_sessions VALUES (14, 1, '3e7340a712124d622ca57d8cc032fc314f78f6821b9c3aa2ee41b907806408dd', '2026-08-06 11:28:15.209', false, '2026-08-06 11:27:15.209293');
INSERT INTO public.qr_sessions VALUES (15, 1, 'edfd3294b94971ac3610e3b17b170fb06323a52e4c354dbdafb5baf9bd1679f5', '2026-08-06 11:55:41.93', false, '2026-08-06 11:54:41.93062');
INSERT INTO public.qr_sessions VALUES (16, 1, '0ed67c048ee232081313c0d3dab2c1a432dea39aa0302aa5c7f2aaee548d71d8', '2026-08-06 11:55:41.943', false, '2026-08-06 11:54:41.943726');
INSERT INTO public.qr_sessions VALUES (17, 1, 'a16c6b3021a2afa85245471cdd7a20d83251a29627a6f91146fbbb09f13694ad', '2026-08-06 20:29:39.167', false, '2026-08-06 20:28:39.167987');
INSERT INTO public.qr_sessions VALUES (18, 1, 'b2e4d04b12d6441b2afb6d4d68d258437b5a20e273dc8a3eadaaf3ebcf9846ec', '2026-08-06 20:29:39.169', false, '2026-08-06 20:28:39.169674');
INSERT INTO public.qr_sessions VALUES (19, 1, '0e7c6f0c19862cd4fbe13a82ddb469f55197f1bb7908ee3af4f56d75a92b5439', '2026-08-08 08:37:53.337', false, '2026-08-08 08:36:53.337804');
INSERT INTO public.qr_sessions VALUES (20, 1, '320349a9d043dbfe60e2a98a09317ca7ad651f1c51665ba53b85197b012ed2a2', '2026-08-08 08:37:53.342', false, '2026-08-08 08:36:53.342856');
INSERT INTO public.qr_sessions VALUES (21, 1, '41a437f9b1084a811e926892dba0814734a39a030ca5bbf9514c038ecb995609', '2026-08-08 08:42:58.846', false, '2026-08-08 08:41:58.846839');
INSERT INTO public.qr_sessions VALUES (22, 1, '035000896b395071a2fdbc21d61b7469778136de30c00830c327b255952848e1', '2026-08-08 08:42:58.847', false, '2026-08-08 08:41:58.847916');
INSERT INTO public.qr_sessions VALUES (23, 1, 'b66b975bf6eaaab865fd9721e6b01589dd2f0a48b69433232c46d2cc0ea7ae86', '2026-08-08 09:05:08.585', false, '2026-08-08 09:04:08.586104');
INSERT INTO public.qr_sessions VALUES (24, 1, 'aca24e72220f29bcf119d4bfe5fdf74beb7d9465bbeb2df3d0a55505fd6efd75', '2026-08-08 09:05:08.589', false, '2026-08-08 09:04:08.589741');
INSERT INTO public.qr_sessions VALUES (25, 1, 'efb6a40bab4c24a6da1a6f2a72e654439d62e08f07694859554e0d852a1b251d', '2026-08-08 09:25:25.347', false, '2026-08-08 09:24:25.34759');
INSERT INTO public.qr_sessions VALUES (26, 1, '579d22f4f2d970555105f53c6f17f32b256e67b19625ec6b6967275af2b9acae', '2026-08-08 09:25:25.348', false, '2026-08-08 09:24:25.348557');
INSERT INTO public.qr_sessions VALUES (27, 1, 'ed3e2215fcf4d49440edf07533142a477971360cf1d29ad9b2b4d7b8f3a63331', '2026-08-08 09:47:13.856', false, '2026-08-08 09:46:13.856671');
INSERT INTO public.qr_sessions VALUES (28, 1, '1fc163bfa47686784acfa131a293e892a13fd199153d92bc06302f846392eae7', '2026-08-08 09:47:13.858', false, '2026-08-08 09:46:13.858336');
INSERT INTO public.qr_sessions VALUES (29, 1, 'f66efed336d2ffd5c60e7275591c19303bc556f29d2ce97f455baef28374c745', '2026-08-08 18:54:58.675', false, '2026-08-08 18:53:58.67607');
INSERT INTO public.qr_sessions VALUES (30, 1, 'b0ca8e190bf14891cbc79e2e8ccaeb3bb112c0d483102165608722c94e6d21a5', '2026-08-08 18:54:58.698', false, '2026-08-08 18:53:58.698996');
INSERT INTO public.qr_sessions VALUES (31, 1, '2d619e953fefbd4bbab203cd6629c6db19acdccdffe3759987c4a312574c5307', '2026-08-08 18:55:02.203', false, '2026-08-08 18:54:02.204028');
INSERT INTO public.qr_sessions VALUES (32, 1, '0a1e3461dcbeaebc24518faaa1b9701d4d0b28b1bf2132a07554ae6bc42ba98e', '2026-08-11 18:33:24.627', false, '2026-08-11 18:32:24.628033');
INSERT INTO public.qr_sessions VALUES (33, 1, '316c3d96859f52606c119dcdac7c8b3a42ac74cc14dfeabb68ff2d68f82f7aca', '2026-08-11 18:33:24.642', false, '2026-08-11 18:32:24.643394');
INSERT INTO public.qr_sessions VALUES (34, 1, '7866c9c58a735d5021291b7f7493d5b87743806d8a9b742adb05aa8e75d049fd', '2026-08-11 20:03:57.866', false, '2026-08-11 20:02:57.867087');
INSERT INTO public.qr_sessions VALUES (35, 1, '7a1c44f568406a126f7ab8e8d5685af21dbab66ce34290d2c1cbc5bb83821a78', '2026-08-11 20:03:57.868', false, '2026-08-11 20:02:57.868461');


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_sessions VALUES (1, 1, 'fde33aa9-440b-4603-bebe-3a9668cc0b37', '::ffff:127.0.0.1', 'Unknown Browser', 'Unknown OS', '2026-07-23 11:32:56', '2026-07-23 10:32:56.963516', '2026-07-23 10:32:56.963516');
INSERT INTO public.user_sessions VALUES (33, 9, 'bde46300-8759-4460-976a-6b3b9e87eacd', '::ffff:127.0.0.1', 'Unknown Browser', 'Unknown OS', '2026-08-06 11:44:04', '2026-08-06 10:44:08.483788', '2026-08-06 10:44:04.254164');
INSERT INTO public.user_sessions VALUES (18, 1, '4f21eaab-9424-4052-83a9-fe700cafcf59', '::1', 'Opera', 'Linux', '2026-07-23 12:01:57', '2026-07-23 11:03:13.091753', '2026-07-23 11:01:57.494708');
INSERT INTO public.user_sessions VALUES (5, 1, '0493eeb7-25ee-4def-92f0-3e5d4ffe70be', '::1', 'Opera', 'Linux', '2026-07-23 11:48:54', '2026-07-23 10:48:54.502368', '2026-07-23 10:48:54.404287');
INSERT INTO public.user_sessions VALUES (6, 1, '7d53ac87-64c1-4cb9-9a8a-a93bd236dcd6', '::ffff:127.0.0.1', 'Unknown Browser', 'Unknown OS', '2026-07-23 11:49:45', '2026-07-23 10:49:45.5444', '2026-07-23 10:49:45.526994');
INSERT INTO public.user_sessions VALUES (7, 1, '679f7227-5cb4-4d2f-846a-3752297df31d', '::ffff:127.0.0.1', 'Unknown Browser', 'Unknown OS', '2026-07-23 11:50:14', '2026-07-23 10:50:14.063012', '2026-07-23 10:50:14.038733');
INSERT INTO public.user_sessions VALUES (2, 1, '5af20049-9be9-4814-8fa0-2aee9088468a', '::1', 'Opera', 'Linux', '2026-07-23 11:34:03', '2026-07-23 10:34:22.569861', '2026-07-23 10:34:03.677614');
INSERT INTO public.user_sessions VALUES (38, 9, 'e517da83-ad16-4720-b6d7-83850bba098d', '::1', 'Opera', 'Linux', '2026-08-06 12:19:32', '2026-08-06 11:21:10.347751', '2026-08-06 11:19:32.410856');
INSERT INTO public.user_sessions VALUES (34, 9, '22179d02-c4c4-45ef-9cd1-6c01f738dcf2', '::1', 'Opera', 'Linux', '2026-08-06 11:45:56', '2026-08-06 11:10:21.18481', '2026-08-06 10:45:56.026203');
INSERT INTO public.user_sessions VALUES (9, 1, '4a55cfba-3369-4c99-ad42-449889da4c7c', '::1', 'Opera', 'Linux', '2026-07-23 11:51:09', '2026-07-23 10:51:09.505386', '2026-07-23 10:51:09.361863');
INSERT INTO public.user_sessions VALUES (16, 1, '13fcc0cc-4ec3-4cb9-83c0-c0b976e97a59', '::1', 'Opera', 'Linux', '2026-07-23 11:58:38', '2026-07-23 11:00:01.990447', '2026-07-23 10:58:38.973985');
INSERT INTO public.user_sessions VALUES (178, 9, '978df231-fa4a-4620-a004-e6252a8b3a9f', '::1', 'Opera', 'Linux', '2026-08-12 13:13:30', '2026-08-12 12:13:40.71594', '2026-08-12 12:13:30.796527');
INSERT INTO public.user_sessions VALUES (161, 1, '9915c759-0b20-4c91-9f50-c2278a1b4c9c', '::1', 'Opera', 'Linux', '2026-08-12 11:43:26', '2026-08-12 11:08:27.284548', '2026-08-12 10:43:26.373556');
INSERT INTO public.user_sessions VALUES (23, 9, 'b31eb8f7-ab51-41d6-a389-ea9aaebf3464', '::ffff:127.0.0.1', 'Unknown Browser', 'Unknown OS', '2026-08-06 11:25:14', '2026-08-06 10:25:14.501067', '2026-08-06 10:25:14.501067');
INSERT INTO public.user_sessions VALUES (111, 9, '75f9140d-2a0d-4b15-b70e-483e69ce7d27', '::1', 'Opera', 'Linux', '2026-08-08 20:58:10', '2026-08-08 20:03:49.790152', '2026-08-08 19:58:10.257874');
INSERT INTO public.user_sessions VALUES (25, 9, '5435a7c9-aab2-4627-9a6f-5bf47303f14e', '::ffff:127.0.0.1', 'Unknown Browser', 'Unknown OS', '2026-08-06 11:25:45', '2026-08-06 10:25:45.967404', '2026-08-06 10:25:45.967404');
INSERT INTO public.user_sessions VALUES (26, 9, '6f18ad1a-bfff-4194-bd4d-0445a56ba8d2', '::ffff:127.0.0.1', 'Unknown Browser', 'Unknown OS', '2026-08-06 11:26:04', '2026-08-06 10:26:04.484786', '2026-08-06 10:26:04.484786');
INSERT INTO public.user_sessions VALUES (27, 9, 'bb0312cd-563d-471d-a302-23862b55e6f2', '::ffff:127.0.0.1', 'Unknown Browser', 'Unknown OS', '2026-08-06 11:26:25', '2026-08-06 10:26:25.430849', '2026-08-06 10:26:25.430849');
INSERT INTO public.user_sessions VALUES (21, 9, '297a071e-fe0d-49a5-80e9-3b82f97f1b99', '::1', 'Opera', 'Linux', '2026-07-23 12:05:59', '2026-07-23 11:06:36.639469', '2026-07-23 11:05:59.034213');
INSERT INTO public.user_sessions VALUES (55, 9, '68c4a359-82ff-490b-bc54-4155156f27b4', '::1', 'Opera', 'Linux', '2026-08-06 15:12:47', '2026-08-06 14:12:59.711176', '2026-08-06 14:12:47.330283');
INSERT INTO public.user_sessions VALUES (3, 1, 'aa27fbcc-72b1-4b29-908a-37ff0c9dde5f', '::1', 'Opera', 'Linux', '2026-07-23 11:43:01', '2026-07-23 11:42:56.930335', '2026-07-23 10:43:01.243383');
INSERT INTO public.user_sessions VALUES (195, 1, '5c717abe-3b95-4502-8981-5d231efee18c', '::1', 'Opera', 'Linux', '2026-08-14 11:53:42', '2026-08-14 11:38:42.395532', '2026-08-14 10:53:42.729192');
INSERT INTO public.user_sessions VALUES (15, 1, 'eed8c306-44c9-4ad1-9bb4-9365889377dd', '::1', 'Opera', 'Linux', '2026-07-23 11:55:57', '2026-07-23 10:56:08.112952', '2026-07-23 10:55:57.557193');
INSERT INTO public.user_sessions VALUES (10, 1, '1549c8b1-189b-4732-9d2d-f5b37bbae6a3', '::1', 'Opera', 'Linux', '2026-07-23 11:51:25', '2026-07-23 10:52:29.94354', '2026-07-23 10:51:25.778106');
INSERT INTO public.user_sessions VALUES (11, 1, '10cfc646-e8ae-4c7c-9707-7146a0a937ea', '::ffff:127.0.0.1', 'Unknown Browser', 'Unknown OS', '2026-07-23 11:54:15', '2026-07-23 10:54:15.499263', '2026-07-23 10:54:15.476687');
INSERT INTO public.user_sessions VALUES (46, 9, 'a9fb0c84-b8e3-4c72-ad7e-797ffa23f43e', '::1', 'Opera', 'Linux', '2026-08-06 12:44:46', '2026-08-06 11:44:46.960314', '2026-08-06 11:44:46.857582');
INSERT INTO public.user_sessions VALUES (42, 9, 'dcba7526-ecea-4915-8734-cc0689700ef9', '::1', 'Opera', 'Linux', '2026-08-06 12:34:52', '2026-08-06 11:36:45.892031', '2026-08-06 11:34:52.536165');
INSERT INTO public.user_sessions VALUES (169, 59, 'b2aed499-e110-48d8-818a-b9f21aceb199', '::1', 'Opera', 'Linux', '2026-08-12 12:56:50', '2026-08-12 12:03:46.473846', '2026-08-12 11:56:50.412687');
INSERT INTO public.user_sessions VALUES (40, 9, '0fb89df6-6b0f-491d-8e20-84c68aa21527', '::1', 'Opera', 'Linux', '2026-08-06 12:21:27', '2026-08-06 11:25:03.65373', '2026-08-06 11:21:27.023168');
INSERT INTO public.user_sessions VALUES (28, 9, 'f262b0ff-2a10-4574-9024-6bbfacbf8754', '::1', 'Opera', 'Linux', '2026-08-06 11:32:40', '2026-08-06 10:32:49.915679', '2026-08-06 10:32:40.390183');
INSERT INTO public.user_sessions VALUES (179, 9, '1dda8585-2aa0-4224-8ce8-ef61eff5f8e1', '::1', 'Opera', 'Linux', '2026-08-12 13:13:48', '2026-08-12 12:14:27.079553', '2026-08-12 12:13:48.584638');
INSERT INTO public.user_sessions VALUES (13, 1, '049f3384-01d7-4633-9c4f-6053324974fd', '::1', 'Opera', 'Linux', '2026-07-23 11:55:26', '2026-07-23 10:55:27.799542', '2026-07-23 10:55:26.040921');
INSERT INTO public.user_sessions VALUES (174, 9, '70a7228c-cc7c-44df-bd12-e9684a40552c', '::1', 'Opera', 'Linux', '2026-08-12 13:04:06', '2026-08-12 12:07:39.541672', '2026-08-12 12:04:06.09098');
INSERT INTO public.user_sessions VALUES (29, 9, '50f636a4-4799-4f19-9e38-bcab988cbc92', '::1', 'Opera', 'Linux', '2026-08-06 11:33:31', '2026-08-06 10:33:31.436195', '2026-08-06 10:33:31.335462');
INSERT INTO public.user_sessions VALUES (4, 1, 'a1d5ea29-e18f-49ad-aee2-9e3c9c300bab', '::1', 'Opera', 'Linux', '2026-07-23 11:45:30', '2026-07-23 10:46:33.870673', '2026-07-23 10:45:30.102721');
INSERT INTO public.user_sessions VALUES (187, 9, '0f3e97fa-24d8-4dec-b601-a1f409542392', '::1', 'Opera', 'Linux', '2026-08-12 15:25:30', '2026-08-12 14:25:30.524451', '2026-08-12 14:25:30.399785');
INSERT INTO public.user_sessions VALUES (30, 9, 'fb3856a1-1961-4c6b-85e7-44557a521131', '::1', 'Opera', 'Linux', '2026-08-06 11:35:11', '2026-08-06 10:35:11.969662', '2026-08-06 10:35:11.885869');
INSERT INTO public.user_sessions VALUES (201, 83, '9e3fa575-b14a-4382-9f20-07305fe1cade', '::1', 'Opera', 'Linux', '2026-08-14 13:01:46', '2026-08-14 12:01:55.578752', '2026-08-14 12:01:46.981255');
INSERT INTO public.user_sessions VALUES (191, 72, 'bc14a17e-116d-47c8-8174-1be6fa0638f5', '::1', 'Opera', 'Linux', '2026-08-13 19:57:26', '2026-08-13 19:05:35.67881', '2026-08-13 18:57:26.386316');
INSERT INTO public.user_sessions VALUES (32, 9, 'fc2708b7-f54c-44cf-a538-7d3537c5d644', '::1', 'Opera', 'Linux', '2026-08-06 11:35:23', '2026-08-06 10:35:23.901713', '2026-08-06 10:35:23.829969');
INSERT INTO public.user_sessions VALUES (19, 9, '2bb9f1c1-4e4e-4936-9749-793dc6d0c8c2', '::1', 'Opera', 'Linux', '2026-07-23 12:03:30', '2026-07-23 11:04:15.73843', '2026-07-23 11:03:30.683918');
INSERT INTO public.user_sessions VALUES (53, 9, '6660b258-6b74-46f6-a998-129f74f0b065', '::1', 'Opera', 'Linux', '2026-08-06 15:11:00', '2026-08-06 14:11:45.582833', '2026-08-06 14:11:00.628821');
INSERT INTO public.user_sessions VALUES (44, 9, 'a6179bc2-2b1e-48d6-90e8-1e919d5563b3', '::1', 'Opera', 'Linux', '2026-08-06 12:41:14', '2026-08-06 11:41:51.902138', '2026-08-06 11:41:14.853128');
INSERT INTO public.user_sessions VALUES (197, 59, '956ecb2a-4c1d-4faf-b0c9-82cd17798eed', '::1', 'Opera', 'Linux', '2026-08-14 12:51:16', '2026-08-14 11:51:16.362673', '2026-08-14 11:51:16.104749');
INSERT INTO public.user_sessions VALUES (36, 9, 'c5522d34-6309-43ef-b68b-18164cb28c31', '::1', 'Opera', 'Linux', '2026-08-06 12:10:43', '2026-08-06 11:17:01.810236', '2026-08-06 11:10:43.244745');
INSERT INTO public.user_sessions VALUES (205, 59, '241ae1da-40cc-4fdf-96fe-e99dda706f2b', '::1', 'Opera', 'Linux', '2026-08-14 13:32:27', '2026-08-14 12:32:40.948449', '2026-08-14 12:32:27.561054');
INSERT INTO public.user_sessions VALUES (47, 9, '2a997960-a236-4177-a377-c9cc689b6586', '::1', 'Opera', 'Linux', '2026-08-06 12:44:58', '2026-08-06 11:53:32.08215', '2026-08-06 11:44:58.700162');
INSERT INTO public.user_sessions VALUES (51, 9, 'e5c2e4e3-1ea8-4b55-abc0-3ceec3df2bd5', '::1', 'Opera', 'Linux', '2026-08-06 13:03:12', '2026-08-06 12:03:43.240014', '2026-08-06 12:03:12.750207');
INSERT INTO public.user_sessions VALUES (57, 9, '17e3152a-ee26-4bfb-9c56-3581b74e94dd', '::1', 'Opera', 'Linux', '2026-08-06 15:13:38', '2026-08-06 14:19:51.170451', '2026-08-06 14:13:38.670389');
INSERT INTO public.user_sessions VALUES (49, 9, '7c987066-da12-4aee-8e25-a902c5a5083c', '::1', 'Opera', 'Linux', '2026-08-06 13:02:36', '2026-08-06 12:02:50.281826', '2026-08-06 12:02:36.000651');
INSERT INTO public.user_sessions VALUES (61, 9, 'a2da7e01-2b31-4d0c-a6eb-6f4b55619046', '::1', 'Opera', 'Linux', '2026-08-06 15:38:06', '2026-08-06 14:38:25.853288', '2026-08-06 14:38:06.042732');
INSERT INTO public.user_sessions VALUES (59, 9, 'a920641b-8745-4d85-89f2-142ed87a12a7', '::1', 'Opera', 'Linux', '2026-08-06 15:20:14', '2026-08-06 14:37:39.179373', '2026-08-06 14:20:14.910541');
INSERT INTO public.user_sessions VALUES (63, 9, 'f72d371f-413b-41a6-8ffa-5f875cf714ed', '::1', 'Opera', 'Linux', '2026-08-06 15:38:46', '2026-08-06 14:45:20.408727', '2026-08-06 14:38:46.527155');
INSERT INTO public.user_sessions VALUES (65, 9, 'e619791d-85dc-409c-a95d-3d5e469bbe73', '::1', 'Opera', 'Linux', '2026-08-06 15:45:54', '2026-08-06 14:48:52.948044', '2026-08-06 14:45:54.029119');
INSERT INTO public.user_sessions VALUES (67, 9, '7dc6737c-b0f7-425f-8405-5ff09acee9bf', '::1', 'Opera', 'Linux', '2026-08-06 15:49:12', '2026-08-06 14:57:10.152594', '2026-08-06 14:49:12.927359');
INSERT INTO public.user_sessions VALUES (81, 9, '9aa0360b-fec6-4626-9191-1304ea85a212', '::1', 'Opera', 'Linux', '2026-08-06 16:41:33', '2026-08-06 15:41:33.281787', '2026-08-06 15:41:33.185162');
INSERT INTO public.user_sessions VALUES (192, 9, '49bd0fd1-ef0d-4a67-8120-364308ede057', '::1', 'Opera', 'Linux', '2026-08-13 20:27:29', '2026-08-13 19:27:29.334517', '2026-08-13 19:27:29.114902');
INSERT INTO public.user_sessions VALUES (84, 1, '9af6b7ea-e3c1-486d-8b01-35cf7b88c01b', '::1', 'Opera', 'Linux', '2026-08-06 19:10:30', '2026-08-06 18:10:41.261509', '2026-08-06 18:10:30.656738');
INSERT INTO public.user_sessions VALUES (69, 9, '91c7ebdc-101f-4351-b7f8-320f176a52db', '::1', 'Opera', 'Linux', '2026-08-06 15:58:23', '2026-08-06 14:58:34.247564', '2026-08-06 14:58:23.971167');
INSERT INTO public.user_sessions VALUES (82, 9, 'a4b38c61-d8ec-4f11-ab87-29071ec4cd40', '::1', 'Opera', 'Linux', '2026-08-06 16:42:20', '2026-08-06 15:42:25.283787', '2026-08-06 15:42:20.43208');
INSERT INTO public.user_sessions VALUES (75, 9, 'a3b9c80c-b410-4396-8963-b0db81790ee8', '::1', 'Opera', 'Linux', '2026-08-06 16:18:13', '2026-08-06 15:24:55.231779', '2026-08-06 15:18:13.301012');
INSERT INTO public.user_sessions VALUES (180, 1, '8fdded65-32f0-4777-9e72-d4f35453f000', '::1', 'Opera', 'Linux', '2026-08-12 13:14:31', '2026-08-12 13:12:16.558253', '2026-08-12 12:14:31.558565');
INSERT INTO public.user_sessions VALUES (188, 59, '7a045f69-0304-4652-a4d1-e05be8f97f77', '::1', 'Opera', 'Linux', '2026-08-12 18:03:19', '2026-08-12 17:03:23.103927', '2026-08-12 17:03:19.405523');
INSERT INTO public.user_sessions VALUES (87, 9, 'fe51dd88-7421-4c2b-907b-e1143a789e71', '::1', 'Opera', 'Linux', '2026-08-06 19:26:49', '2026-08-06 18:27:13.802711', '2026-08-06 18:26:49.641683');
INSERT INTO public.user_sessions VALUES (79, 9, 'e900cf04-ca4b-4518-a408-2374a8ae481f', '::1', 'Unknown Browser', 'Unknown OS', '2026-08-06 16:31:18', '2026-08-06 15:31:18.335881', '2026-08-06 15:31:18.327235');
INSERT INTO public.user_sessions VALUES (166, 1, 'f45070e8-4146-45b1-bba6-04dd4d938b4f', '::1', 'Opera', 'Linux', '2026-08-12 12:08:42', '2026-08-12 11:09:14.497138', '2026-08-12 11:08:42.082916');
INSERT INTO public.user_sessions VALUES (95, 9, 'fd671111-5bdd-4103-b78d-2a06163888a6', '::1', 'Opera', 'Linux', '2026-08-06 22:00:34', '2026-08-06 21:00:40.403182', '2026-08-06 21:00:34.357092');
INSERT INTO public.user_sessions VALUES (198, 1, '7cc33f1e-8e2c-4c5b-be3b-1709217ae4df', '::1', 'Opera', 'Linux', '2026-08-14 12:51:28', '2026-08-14 11:51:30.354768', '2026-08-14 11:51:28.598679');
INSERT INTO public.user_sessions VALUES (71, 9, '07a2acfc-0e23-49a2-b174-1b86ece88f26', '::1', 'Opera', 'Linux', '2026-08-06 15:58:54', '2026-08-06 14:59:03.217412', '2026-08-06 14:58:54.523917');
INSERT INTO public.user_sessions VALUES (85, 1, 'b12ceace-776c-4c93-a438-c1446742ee80', '::1', 'Opera', 'Linux', '2026-08-06 19:13:10', '2026-08-06 18:13:17.11866', '2026-08-06 18:13:10.63162');
INSERT INTO public.user_sessions VALUES (97, 9, '1908677e-c2f9-4b6c-b304-11c298274c0c', '::1', 'Opera', 'Linux', '2026-08-08 10:07:25', '2026-08-08 09:07:27.084265', '2026-08-08 09:07:25.191331');
INSERT INTO public.user_sessions VALUES (73, 9, 'b66b6e0b-586e-42c2-ab0c-0525518f7e54', '::1', 'Opera', 'Linux', '2026-08-06 15:59:26', '2026-08-06 15:17:49.971258', '2026-08-06 14:59:26.186048');
INSERT INTO public.user_sessions VALUES (105, 9, '394c6917-5ff1-4107-93bd-1355e22f3e4a', '::1', 'Opera', 'Linux', '2026-08-08 14:31:24', '2026-08-08 13:31:58.964563', '2026-08-08 13:31:24.932508');
INSERT INTO public.user_sessions VALUES (202, 1, 'fa24a48b-ec12-42e0-9170-82c3bdec03ed', '::1', 'Opera', 'Linux', '2026-08-14 13:31:39', '2026-08-14 12:31:42.221305', '2026-08-14 12:31:39.203637');
INSERT INTO public.user_sessions VALUES (83, 9, 'd6be2b31-214b-4a41-9742-551af127a626', '::1', 'Opera', 'Linux', '2026-08-06 19:05:08', '2026-08-06 18:05:24.885517', '2026-08-06 18:05:08.420392');
INSERT INTO public.user_sessions VALUES (80, 9, '001ed6fe-e41c-4918-839b-b74a42cba1d9', '::1', 'Opera', 'Linux', '2026-08-06 16:40:28', '2026-08-06 15:40:32.528631', '2026-08-06 15:40:28.840024');
INSERT INTO public.user_sessions VALUES (92, 9, '03858135-725d-425c-b7b6-6623d5b207f8', '::1', 'Opera', 'Linux', '2026-08-06 21:30:06', '2026-08-06 20:32:21.314015', '2026-08-06 20:30:06.107379');
INSERT INTO public.user_sessions VALUES (206, 83, '0c5a7246-e587-4b8b-a423-77c7f8555846', '::1', 'Opera', 'Linux', '2026-08-14 13:33:26', '2026-08-14 13:07:48.933181', '2026-08-14 12:33:26.116275');
INSERT INTO public.user_sessions VALUES (120, 9, 'a084824e-e25a-462a-b98e-91661299ff87', '::1', 'Opera', 'Linux', '2026-08-11 19:29:53', '2026-08-11 18:31:30.45848', '2026-08-11 18:29:53.97516');
INSERT INTO public.user_sessions VALUES (89, 9, '157016b2-d1b2-4506-a9ce-80b44bface83', '::1', 'Opera', 'Linux', '2026-08-06 19:56:02', '2026-08-06 18:56:15.565222', '2026-08-06 18:56:02.187662');
INSERT INTO public.user_sessions VALUES (93, 9, 'e222bb90-f08d-4d33-8d10-37188f4af51b', '::1', 'Opera', 'Linux', '2026-08-06 21:54:13', '2026-08-06 20:54:15.182535', '2026-08-06 20:54:13.682035');
INSERT INTO public.user_sessions VALUES (196, 83, '434342d5-da20-4733-94d2-367f8c5a56de', '::1', 'Opera', 'Linux', '2026-08-14 12:39:52', '2026-08-14 11:50:59.59748', '2026-08-14 11:39:52.470024');
INSERT INTO public.user_sessions VALUES (117, 9, '0ffda7f3-5837-4ad2-80d7-40242ffb5759', '::1', 'Opera', 'Linux', '2026-08-11 18:48:32', '2026-08-11 18:11:32.042749', '2026-08-11 17:48:32.955072');
INSERT INTO public.user_sessions VALUES (128, 9, '1c2916dc-45ee-48d7-8248-e2cac087a7ba', '::1', 'Opera', 'Linux', '2026-08-11 20:28:57', '2026-08-11 19:29:15.291604', '2026-08-11 19:28:57.817077');
INSERT INTO public.user_sessions VALUES (124, 9, '96630195-62d1-4729-812c-287d798a01c7', '::1', 'Opera', 'Linux', '2026-08-11 19:52:46', '2026-08-11 19:26:56.934898', '2026-08-11 18:52:46.034873');
INSERT INTO public.user_sessions VALUES (130, 1, '7dcd398d-50bc-4367-904a-4a1f9745996c', '::1', 'Opera', 'Linux', '2026-08-11 20:35:02', '2026-08-11 19:36:25.031212', '2026-08-11 19:35:02.698563');
INSERT INTO public.user_sessions VALUES (115, 9, '8283374c-d830-4a9f-b0aa-9e038bff330a', '::1', 'Opera', 'Linux', '2026-08-11 18:46:57', '2026-08-11 17:48:01.785539', '2026-08-11 17:46:57.294865');
INSERT INTO public.user_sessions VALUES (203, 59, '7bc27fec-dc44-4be4-b50a-b34cdede12cb', '::1', 'Opera', 'Linux', '2026-08-14 13:31:50', '2026-08-14 12:31:50.754798', '2026-08-14 12:31:50.515123');
INSERT INTO public.user_sessions VALUES (176, 59, '43967096-159c-46f3-b0e9-2f0999037bcc', '::1', 'Opera', 'Linux', '2026-08-12 13:07:44', '2026-08-12 12:13:22.291638', '2026-08-12 12:07:44.193107');
INSERT INTO public.user_sessions VALUES (126, 9, 'd2d08583-1ef8-43cc-ad45-b5fa64309d97', '::1', 'Opera', 'Linux', '2026-08-11 20:27:22', '2026-08-11 19:28:24.624121', '2026-08-11 19:27:22.853182');
INSERT INTO public.user_sessions VALUES (100, 9, '50de549d-8d50-43dd-bca2-1c8ec36ff80c', '::1', 'Opera', 'Linux', '2026-08-08 11:37:42', '2026-08-08 10:39:45.793311', '2026-08-08 10:37:42.417706');
INSERT INTO public.user_sessions VALUES (103, 1, '3ffc5ff8-e9b2-46fb-8cd1-85a9d9d5fda2', '::1', 'Opera', 'Linux', '2026-08-08 13:35:24', '2026-08-08 12:36:10.78185', '2026-08-08 12:35:24.197248');
INSERT INTO public.user_sessions VALUES (138, 1, '9a259efe-cc86-4b50-b87e-96e89e25cda6', '::1', 'Opera', 'Linux', '2026-08-12 09:28:38', '2026-08-12 08:31:11.698314', '2026-08-12 08:28:38.589251');
INSERT INTO public.user_sessions VALUES (122, 9, '5a4aca6b-5b67-4c63-8e82-eb5e94e12b6d', '::1', 'Opera', 'Linux', '2026-08-11 19:39:33', '2026-08-11 18:44:39.835442', '2026-08-11 18:39:33.950324');
INSERT INTO public.user_sessions VALUES (106, 1, '03ace463-5a51-4f37-abc6-5203a22dd18a', '::1', 'Opera', 'Linux', '2026-08-08 14:32:02', '2026-08-08 13:32:21.641285', '2026-08-08 13:32:02.530744');
INSERT INTO public.user_sessions VALUES (113, 9, '9a2346aa-bb93-410b-acbc-2a2963ba8a31', '::1', 'Opera', 'Linux', '2026-08-08 21:04:34', '2026-08-08 20:05:07.761124', '2026-08-08 20:04:34.04949');
INSERT INTO public.user_sessions VALUES (167, 59, '8ab678b0-c176-4a09-911f-a376d87e6324', '::1', 'Opera', 'Linux', '2026-08-12 12:10:06', '2026-08-12 11:13:23.172783', '2026-08-12 11:10:06.396846');
INSERT INTO public.user_sessions VALUES (134, 9, 'b1c70a78-0f0c-4019-8e17-157a87911886', '::1', 'Opera', 'Linux', '2026-08-11 20:41:40', '2026-08-11 20:02:45.340044', '2026-08-11 19:41:40.572657');
INSERT INTO public.user_sessions VALUES (142, 1, '39891ebe-2469-4b90-ae74-89981fcdf7b1', '::1', 'Opera', 'Linux', '2026-08-12 09:40:54', '2026-08-12 08:46:59.589847', '2026-08-12 08:40:54.190237');
INSERT INTO public.user_sessions VALUES (193, 9, '6cbd7e6b-1455-462f-b450-cdb836cbc9e3', '::1', 'Opera', 'Linux', '2026-08-13 20:28:23', '2026-08-13 19:38:59.743189', '2026-08-13 19:28:23.637088');
INSERT INTO public.user_sessions VALUES (118, 9, '4931f82c-f0d9-458d-a70c-f64ed717086d', '::1', 'Opera', 'Linux', '2026-08-11 19:11:44', '2026-08-11 18:27:33.198852', '2026-08-11 18:11:44.192392');
INSERT INTO public.user_sessions VALUES (185, 9, '6147310c-48e1-4533-9546-c27586f9fff4', '::1', 'Opera', 'Linux', '2026-08-12 15:17:00', '2026-08-12 14:17:46.883785', '2026-08-12 14:17:00.887135');
INSERT INTO public.user_sessions VALUES (189, 59, 'ac3e13eb-e81a-4a3a-99d6-daff4bdae2e0', '::1', 'Opera', 'Linux', '2026-08-13 19:18:57', '2026-08-13 18:43:59.43553', '2026-08-13 18:18:57.007214');
INSERT INTO public.user_sessions VALUES (199, 72, 'be4f36dc-e4cd-4e85-a418-c14531e56e2e', '::1', 'Opera', 'Linux', '2026-08-14 12:51:45', '2026-08-14 11:59:52.784236', '2026-08-14 11:51:45.032761');
INSERT INTO public.user_sessions VALUES (107, 9, 'bdc085d3-193c-425b-b669-b22454ce8e0b', '::1', 'Opera', 'Linux', '2026-08-08 14:32:38', '2026-08-08 13:36:32.872084', '2026-08-08 13:32:38.430062');
INSERT INTO public.user_sessions VALUES (139, 1, '87078d27-903d-4f60-89c3-9cb9a0484f8d', '::1', 'Mobile Safari', 'iOS', '2026-08-12 09:31:59', '2026-08-12 08:40:35.149245', '2026-08-12 08:31:59.867829');
INSERT INTO public.user_sessions VALUES (204, 83, '68665249-3919-49dc-b15f-0de82e87ab96', '::1', 'Opera', 'Linux', '2026-08-14 13:32:03', '2026-08-14 12:32:18.371888', '2026-08-14 12:32:03.482595');
INSERT INTO public.user_sessions VALUES (132, 9, 'fd795970-653f-49e7-b813-4c8b0790d415', '::1', 'Opera', 'Linux', '2026-08-11 20:38:55', '2026-08-11 19:39:41.293921', '2026-08-11 19:38:55.316765');
INSERT INTO public.user_sessions VALUES (146, 1, 'e2e3ca2c-8193-45e8-968f-cbfd7bb3cc45', '::1', 'Opera', 'Linux', '2026-08-12 09:48:52', '2026-08-12 09:48:02.162317', '2026-08-12 08:48:52.316059');
INSERT INTO public.user_sessions VALUES (136, 1, '54e8da2b-4158-44ef-8eb2-13b1fc1cd931', '::1', 'Opera', 'Linux', '2026-08-11 21:16:40', '2026-08-11 20:41:35.493548', '2026-08-11 20:16:40.465226');
INSERT INTO public.user_sessions VALUES (200, 1, '801726a2-d8c8-457d-8d94-60b2db5bc85e', '::1', 'Opera', 'Linux', '2026-08-14 13:00:35', '2026-08-14 12:01:22.940801', '2026-08-14 12:00:35.985058');
INSERT INTO public.user_sessions VALUES (156, 1, '94e6c1a2-a326-4abb-8ebe-19151c745fd6', '::1', 'Opera', 'Linux', '2026-08-12 10:50:00', '2026-08-12 09:50:17.380448', '2026-08-12 09:50:00.5274');
INSERT INTO public.user_sessions VALUES (190, 1, 'b567d078-2dfd-4f23-ba65-c5943b7e4998', '::1', 'Opera', 'Linux', '2026-08-13 19:44:17', '2026-08-13 19:37:14.918788', '2026-08-13 18:44:17.229643');
INSERT INTO public.user_sessions VALUES (168, 9, '37b55884-1b40-4111-8d8e-2a5c912d427c', '::1', 'Opera', 'Linux', '2026-08-12 12:13:41', '2026-08-12 11:56:41.141428', '2026-08-12 11:13:41.657823');


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_settings VALUES (2, 9, true, true, true, true, 'light', 'comfortable', false, '2026-08-08 10:39:45.783489', '2026-08-08 10:39:45.783489', true, false);
INSERT INTO public.user_settings VALUES (3, 1, true, true, true, true, 'light', 'comfortable', false, '2026-08-08 13:32:15.81633', '2026-08-08 13:32:15.81633', true, false);
INSERT INTO public.user_settings VALUES (4, 59, true, true, true, true, 'light', 'comfortable', false, '2026-08-12 11:57:03.566605', '2026-08-12 11:57:03.566605', true, false);
INSERT INTO public.user_settings VALUES (12, 83, true, true, true, false, 'light', 'comfortable', false, '2026-08-14 12:45:28.463221', '2026-08-14 12:45:28.463221', true, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (83, 'winsap.emp1', 'ilyesh321@gmail.com', '$2b$10$yZxYJlN7W562dj3RFBa2WO6SCdLVx968W6PXeya5n2yXkMS28IIOa', 'employee', 39, true, '2026-08-14 11:38:42.342932', '2026-08-14 12:33:26.065447', 0, NULL, true, false, NULL, NULL, '2026-08-14 11:38:42.342932', 'active', 'Active', NULL, NULL, '2026-08-14 11:39:40.303687', NULL, NULL, false, false, '/uploads/profile-pictures/avatar_83_1786704240781_ca7783eb.jpg');
INSERT INTO public.users VALUES (72, 'winsap_manager', 'ilyeshmidilyes404@gmail.com', '$2b$10$kMjB0XtjXJzSNQhDTRW4ou7OMpxCX7VbFc20OSB565o/BZsZk5NUa', 'manager', NULL, true, '2026-08-13 18:48:30.578019', '2026-08-14 11:51:45.017246', 0, NULL, true, false, NULL, NULL, '2026-08-13 18:48:30.578019', 'active', 'Active', NULL, NULL, '2026-08-13 18:57:02.359061', NULL, NULL, false, false, NULL);
INSERT INTO public.users VALUES (1, 'ilyes', 'hmidilyes4442@gmail.com', '$2b$10$DQtG47CGGoeFh7byPLxVp.0hh78OgSSvtXdIgppBrzdUhm/ngwH5G', 'admin', 1, true, '2026-07-23 10:32:53.380853', '2026-08-14 12:31:39.144361', 0, NULL, true, false, NULL, NULL, '2026-07-23 10:32:53.380853', 'active', 'Active', NULL, NULL, NULL, NULL, NULL, false, false, '/uploads/profile-pictures/sample_avatar.png');
INSERT INTO public.users VALUES (59, 'ilyes_manager', 'hmidilyes607@gmail.com', '$2b$10$MlYkio3.HJ3MmJaCKUOsRux/7COuRBrwAVChAgg/MkoQvN6r3cF8m', 'manager', 33, true, '2026-08-12 11:09:14.44314', '2026-08-14 12:32:27.50787', 0, NULL, true, false, NULL, NULL, '2026-08-12 11:09:14.44314', 'active', 'Active', NULL, NULL, '2026-08-12 11:09:52.672652', NULL, NULL, false, false, '/uploads/profile-pictures/avatar_59_1786533199035_c7882490.jpeg');
INSERT INTO public.users VALUES (58, 'lays', 'ilyes.benhmid@esprim.tn', '$2b$10$/DLbpx.ibhNKelfEViGjZesokCa3WKxI1xrqEe3A4RFz8rmscaRXG', 'employee', 15, true, '2026-08-12 11:06:50.701345', '2026-08-12 12:03:58.813472', 2, NULL, true, false, NULL, NULL, '2026-08-12 11:06:50.701345', 'active', 'Active', NULL, NULL, '2026-08-12 11:07:44.65268', NULL, NULL, false, false, NULL);
INSERT INTO public.users VALUES (9, 'ilyes_benhmid', 'hmidilyes100@gmail.com', '$2b$10$MDdoz6eh1ef7UzphN3RntOPhBeluE9UCwSYa.Cbr5RTy5F58esv32', 'employee', 4, true, '2026-07-23 11:02:31.166284', '2026-08-13 19:28:23.50261', 0, NULL, true, false, NULL, NULL, '2026-07-23 11:02:31.166284', 'active', 'Active', NULL, NULL, '2026-07-23 11:03:09.392787', NULL, NULL, false, false, '/uploads/profile-pictures/avatar_9_1786532690889_1ce90d22.png');


--
-- Name: absences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.absences_id_seq', 37, true);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 277, true);


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_id_seq', 13, true);


--
-- Name: cra_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cra_entries_id_seq', 39, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 8, true);


--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_verification_tokens_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 48, true);


--
-- Name: face_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.face_profiles_id_seq', 5, true);


--
-- Name: face_security_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.face_security_logs_id_seq', 102, true);


--
-- Name: holidays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.holidays_id_seq', 29, true);


--
-- Name: leave_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_balances_id_seq', 1077, true);


--
-- Name: leave_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_transactions_id_seq', 8, true);


--
-- Name: login_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_history_id_seq', 231, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 9, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: qr_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.qr_sessions_id_seq', 35, true);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 206, true);


--
-- Name: user_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_settings_id_seq', 12, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 90, true);


--
-- Name: absences absences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT absences_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: cra_entries cra_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cra_entries
    ADD CONSTRAINT cra_entries_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- Name: employees employees_matricule_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_matricule_key UNIQUE (matricule);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: face_profiles face_profiles_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.face_profiles
    ADD CONSTRAINT face_profiles_employee_id_key UNIQUE (employee_id);


--
-- Name: face_profiles face_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.face_profiles
    ADD CONSTRAINT face_profiles_pkey PRIMARY KEY (id);


--
-- Name: face_security_logs face_security_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.face_security_logs
    ADD CONSTRAINT face_security_logs_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_employee_id_key UNIQUE (employee_id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_transactions leave_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_transactions
    ADD CONSTRAINT leave_transactions_pkey PRIMARY KEY (id);


--
-- Name: login_history login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: qr_sessions qr_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_sessions
    ADD CONSTRAINT qr_sessions_pkey PRIMARY KEY (id);


--
-- Name: attendance unique_employee_daily_attendance; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT unique_employee_daily_attendance UNIQUE (employee_id, date);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_absences_source; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_absences_source ON public.absences USING btree (source);


--
-- Name: idx_cra_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cra_employee ON public.cra_entries USING btree (employee_id);


--
-- Name: idx_cra_employee_pending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cra_employee_pending ON public.cra_entries USING btree (employee_id, status, priority DESC, created_at);


--
-- Name: idx_cra_entries_end_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cra_entries_end_time ON public.cra_entries USING btree (end_time);


--
-- Name: idx_cra_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cra_status ON public.cra_entries USING btree (status);


--
-- Name: idx_employees_email_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_email_address ON public.employees USING btree (email_address);


--
-- Name: idx_face_profiles_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_face_profiles_employee_id ON public.face_profiles USING btree (employee_id);


--
-- Name: idx_face_security_logs_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_face_security_logs_employee_id ON public.face_security_logs USING btree (employee_id);


--
-- Name: idx_leave_balances_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_balances_employee ON public.leave_balances USING btree (employee_id);


--
-- Name: idx_leave_transactions_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_transactions_employee ON public.leave_transactions USING btree (employee_id);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_qr_sessions_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qr_sessions_token ON public.qr_sessions USING btree (token);


--
-- Name: cra_entries update_cra_entries_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_cra_entries_updated_at BEFORE UPDATE ON public.cra_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leave_balances update_leave_balances_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON public.leave_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_settings update_user_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_logs activity_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: activity_logs activity_logs_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: attendance attendance_qr_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_qr_session_id_fkey FOREIGN KEY (qr_session_id) REFERENCES public.qr_sessions(id) ON DELETE SET NULL;


--
-- Name: cra_entries cra_entries_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cra_entries
    ADD CONSTRAINT cra_entries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: email_verification_tokens email_verification_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: face_profiles face_profiles_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.face_profiles
    ADD CONSTRAINT face_profiles_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: face_security_logs face_security_logs_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.face_security_logs
    ADD CONSTRAINT face_security_logs_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: attendance fk_attendance_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: absences fk_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leave_balances fk_leave_balances_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT fk_leave_balances_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leave_transactions fk_leave_transactions_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_transactions
    ADD CONSTRAINT fk_leave_transactions_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: login_history login_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict lJVd3QnEWYelqcSxSspPvi84roC5xSsISn2FVHX7CqR53IZBXVBCqA4qEGmgLIm

