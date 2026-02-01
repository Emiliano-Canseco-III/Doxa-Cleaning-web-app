DROP TABLE IF EXISTS users     CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS jobs      CASCADE;

CREATE TABLE customers (
    id                serial PRIMARY KEY,
    user_id           integer UNIQUE NOT NULL,
    name              VARCHAR(255) NOT NULL,

    street_add1       VARCHAR(255) NOT NULL,
    street_add2       VARCHAR(255),
    state             VARCHAR(2) NOT NULL,
    city              VARCHAR(100) NOT NULL,
    zip_code          VARCHAR(10) NOT NULL,
    phone             VARCHAR(20) NOT NULL,

    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id              serial PRIMARY KEY,
    user_id         integer UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
    id          serial PRIMARY KEY,
    employee_id integer NOT NULL,
    customer_id integer NOT NULL,
    status      VARCHAR(50) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE users (
    id              serial PRIMARY KEY,
    customer_id     integer UNIQUE,
    employee_id     integer UNIQUE,

    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

ALTER TABLE customers ADD CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE employees ADD CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id);