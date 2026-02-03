DROP TABLE IF EXISTS users     CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS jobs      CASCADE;


-- First admin account is manually seeded into the database then ONLY the admin can create employee accounts.
CREATE TABLE customers (
    id                serial PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    street_add1       VARCHAR(255) NOT NULL,
    street_add2       VARCHAR(255),
    state             VARCHAR(2) NOT NULL,
    city              VARCHAR(100) NOT NULL,
    zip_code          VARCHAR(10) NOT NULL,
    phone             VARCHAR(20) NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id              serial PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(100) NOT NULL, -- 'admin' or 'employee'
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
    id          serial PRIMARY KEY,
    employee_id integer NOT NULL,
    customer_id integer NOT NULL,
    status      VARCHAR(50) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration INTEGER DEFAULT 60, -- in minutes
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
