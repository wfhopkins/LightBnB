const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


const properties = require("./json/properties.json");
const users = require("./json/users.json");

/// Users

/**GET USER WITH EMAIL
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool.query(`
    SELECT *
    FROM users
    WHERE email = $1;`, [email])
  .then((result) => {
    return result.rows[0];
  })
  .catch((err) => {
    console.log('err.message', err.message);
  });
};


/**GET USER WITH ID
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool.query(`
    SELECT *
    FROM users
    WHERE id = $1;`, [id])
  .then((result) => {
    return result.rows[0];
  })
  .catch((err) => {
    console.log('err.message', err.message);
  });
};


/**ADD A NEW USER
 * to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool.query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;`,[user.name, user.email, user.password]
  )
  .then((result) => {
    return result.rows[0];
  })
  .catch((err) => {
    console.log('err.message', err.message);
  });
};


/// Reservations

/**GET ALL RESERVATIONS
 * for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool.query(`
    SELECT *
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    GROUP BY properties.id, reservations.id, property_reviews.id
    ORDER BY $1
    LIMIT $2;`, [guest_id, limit])
  .then((result) => {
    console.log(result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
};


/// Properties

/**GET ALL PROPERTIES
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  const whereClauses = [];
  let queryString = '';

  //FILTER BY OWNER ID
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    whereClauses.push('owner_id = $${queryParams.length}');
  }
  //FILTER BY CITY
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    whereClauses.push(`city LIKE $${queryParams.length} `);
  }
  //FILTER BY MIN PRICE/NIGHT
  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    whereClauses.push(`cost_per_night >= $${queryParams.length} `);
  }
  //FILTER BY MAX PRICE/NIGHT
  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    whereClauses.push(`cost_per_night <= $${queryParams.length} `);
  }
  
  //BEGIN BUILDING QUERY STRING
  queryString = `SELECT properties.*, AVG(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON property_reviews.property_id = properties.id
  `;

  //APPEND ALL FILTER WITH WHERE || AND
  if (whereClauses.length > 0) {
      queryString += `WHERE ${whereClauses.join(" AND ")}`;
  }

  queryString +=  `
  GROUP BY properties.id `

  //FILTER FOR HAVING
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  }

  //FINISH BUILDING QUERY STRING
  queryParams.push(limit);
  queryString += `
  ORDER BY properties.cost_per_night ASC
  LIMIT $${queryParams.length};
  `;

  //RUN THE QUERY
  return pool.query(queryString, queryParams)
  .then((result) => {
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
};


/**ADD A NEW PROPERTY
 * to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  return pool.query(`
  INSERT INTO properties(owner_id, title, description,
    thumbnail_photo_url, cover_photo_url, cost_per_night,
    street, city, province, post_code, country, parking_spaces,
    number_of_bathrooms, number_of_bedrooms)

  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  
  RETURNING *;`,[property.owner_id, property.title, property.description,
    property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night,
    property.street, property.city, property.province, property.post_code, property.country,
    property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms]
)};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
