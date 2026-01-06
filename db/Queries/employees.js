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
