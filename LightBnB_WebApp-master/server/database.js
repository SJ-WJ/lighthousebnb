const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lighthousebnb_db'
});
// the following assumes that you named your connection variable `pool`
pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => { console.log(response) });

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(`
    SELECT * FROM users WHERE email = $1`, [email]
    ).then((result => {
      return result.rows[0]
    })).catch((err) => {
      console.log(err.message);
    });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return Promise.resolve(users[id]);
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
    .query(`
  INSERT INTO users(name, email, password) VALUES($1, $2, $3)`, [users.name, users.email, users.password])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
 
   // 1
   const queryParams = [];
   // 2
   let queryString = `
   SELECT properties.*, avg(property_reviews.rating) as average_rating
   FROM properties
   JOIN property_reviews ON properties.id = property_id
   `;
 
   // 3
   if (options.city) {
     queryParams.push(`%${options.city}%`);
     queryString += `WHERE city LIKE $${queryParams.length} `;
   }
   if (options.minimum_price_per_night) {
    console.log("MIN PRICE", options.minimum_price_per_night);
    queryParams.push(`${options.minimum_price_per_night}`);
    queryString += `\nAND cost_per_night >= $${queryParams.length} `;
  }
  if (options.maximum_price_per_night) {
    console.log("MAX PRICE", options.maximum_price_per_night);
    queryParams.push(`${options.maximum_price_per_night}`);
    queryString += `\nAND cost_per_night <= $${queryParams.length} `;
  }
  if (options.minimum_rating) {
    console.log("MIN RATING", options.minimum_rating);
    queryParams.push(`${options.minimum_rating}`);
    queryString += `\nHAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  }
 
   // 4
   queryParams.push(limit);
   queryString += `
   GROUP BY properties.id
   ORDER BY cost_per_night
   LIMIT $${queryParams.length};
   `;
 
   // 5
   console.log(queryString, queryParams);
 
   // 6
   return pool.query(queryString, queryParams).then((res) => res.rows);
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  return pool
    .query(`
    INSERT INTO properties (
      owner_id, 
      title,
       description, 
       thumbnail_photo_url, 
       cover_photo_url, 
       cost_per_night, 
       parking_spaces, 
       number_of_bathrooms, 
       number_of_bedrooms, 
       country, 
       street, 
       city, 
       province,
       post_code)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        properties.owner_id,
        properties.title,
        properties.description,
        properties.thumbnail_photo_url,
        properties.cover_photo_url,
        properties.cost_per_night,
        properties.parking_spaces,
        properties.number_of_bathrooms,
        properties.number_of_bedrooms,
        properties.country,
        properties.street,
        properties.city,
        properties.province,
        properties.post_code,
      ]
    )
}
exports.addProperty = addProperty;
