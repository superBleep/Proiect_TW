DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    username character varying,
    surname character varying NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    date_of_birth date,
    register_date date DEFAULT CURRENT_DATE,
    chat_color character varying DEFAULT 'black',
    role character varying DEFAULT 'common',
    phone character varying,
    profile_img character varying,
    token character varying,
    confirmed boolean DEFAULT false,
    saltstring character varying,
    PRIMARY KEY (id)
);

GRANT ALL PRIVILEGES ON DATABASE allmuzica TO client_allmuzica;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO client_allmuzica;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO client_allmuzica;