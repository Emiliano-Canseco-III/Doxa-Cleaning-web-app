import db from "#db/client";

export async function createEmployee(user_id, name, phone) {
  const sql = `
    INSERT INTO employees
        (user_id, name, phone)
    VALUES
        ($1, $2, $3)
    RETURNING *;
    `;
  const {
    rows: [newEmployee],
  } = await db.query(sql, [user_id, name, phone]);
  return newEmployee;
}

export async function getEmployees() {
  const sql = `
SELECT *
FROM employees
`;
  const { rows: employees } = await db.query(sql);
  return employees;
}

export async function getEmployeeByUserId(user_id) {
  const sql = `
  SELECT *
  FROM employees
  WHERE user_id = $1
  `;
  const {
    rows: [employee],
  } = await db.query(sql, [user_id]);
  return employee;
}
