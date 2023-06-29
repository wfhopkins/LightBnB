DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS resdervations CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS property_reviews CASCADE;


CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY NOT NULL,
  start_datae DATE,
  end_date DATE,
  property_id INTEGER REFERENCES properties(id) = properties.id,
  guest_id INTEGER REFERENCES users(id) = users.id,
);

CREATE TABLE properties (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES owners(id) = owners.id,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_photo_url VARCHAR(255),
  cover_photo_url VARCHAR(255),
  cost_per_night INTEGER NOT NULL,
  parking_spaces INTEGER NOT NULL,
  number_of_bathrooms INTEGER NOT NULL,
  number_of_bedrooms INTEGER NOT NULL,
  country VARCHAR(255) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  post_code VARCHAR(255) NOT NULL,
  active BOOLEAN  TRUE
);

CREATE TABLE property_reviews (
  id SERIAL PRIMARY KEY NOT NULL,
  guest_id INTEGER REFERENCES users(id) = users.id,
  property_id INTEGER REFERENCES properties(id) = properties.id,
  reservation_id INTEGER REFERENCES reservations(id) = reservations.id,
  rating SMALLINT,
  message TEXT
);