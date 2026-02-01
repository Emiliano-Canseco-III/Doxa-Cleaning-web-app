import db from "#db/client";

export async function createUser(
  customer_id,
  employee_id,
  email,
  password_hash,
  role
) {
  const sql = `
    INSERT INTO users
        (customer_id, employee_id, email, password_hash, role)
    VALUES
        ($1, $2, $3, $4, $5)
    RETURNING *;
    `;
  const {
    rows: [newUser],
  } = await db.query(sql, [
    customer_id,
    employee_id,
    email,
    password_hash,
    role,
  ]);
  return newUser;
}

export async function getUser() {
  const sql = `
SELECT *
FROM users
`;
  const { rows: users } = await db.query(sql);
  return users;
}

export async function getUserById(id) {
  const sql = `
  SELECT *
  FROM users
  WHERE id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [id]);
  return user;
}

export async function getUserByEmail(email) {
  const sql = `
  SELECT *
  FROM users
  WHERE email = $3
  `;
  const {
    rows: [user],
  } = await db.query(sql, [email]);
  return user;
}
