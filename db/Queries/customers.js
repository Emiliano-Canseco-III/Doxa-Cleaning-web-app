import db from "#db/client";

export async function createCustomer(
  name,
  user_id,
  street_add1,
  street_add2,
  state,
  city,
  zip_code,
  phone
) {
  const sql = `
    INSERT INTO customers
        (name, user_id, street_add1, street_add2, state, city, zip_code, phone)
    VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
    `;
  const {
    rows: [newEmployee],
  } = await db.query(sql, [
    name,
    user_id,
    street_add1,
    street_add2,
    state,
    city,
    zip_code,
    phone,
  ]);
  return newEmployee;
}
