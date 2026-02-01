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

export async function getCustomers() {
  const sql = `
SELECT *
FROM customers
`;
  const { rows: customers } = await db.query(sql);
  return customers;
}

export async function getCustomerByUserId(user_id) {
  const sql = `
  SELECT *
  FROM customers
  WHERE user_id = $1
  `;
  const {
    rows: [customer],
  } = await db.query(sql, [user_id]);
  return customer;
}
