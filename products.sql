DROP TABLE IF EXISTS products;
DROP TYPE IF EXISTS prod_category;
DROP TYPE IF EXISTS prod_exp_type;

CREATE TYPE prod_category AS ENUM('Albume', 'Merchandise', 'Device-uri');
CREATE TYPE prod_exp_type AS ENUM('Curier', 'Poștă', 'De la centrul de distribuție');

CREATE TABLE products (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) UNIQUE NOT NULL,
	description TEXT DEFAULT 'Fără descriere.',
	img_path VARCHAR(500) DEFAULT '/resources/img/placeholders/product.png',
	category prod_category NOT NULL,
	exp_type prod_exp_type NOT NULL,
	price NUMERIC(5,2) NOT NULL, --pretul in lei
	weight NUMERIC(5,2) NOT NULL CHECK (weight>0), --greutatea in grame
	add_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	color VARCHAR(50),
	prod_details VARCHAR[],
	voucher BOOLEAN NOT NULL DEFAULT TRUE
);

--albume
--descriere: an, format, gen
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details)
VALUES ('Two - Sleeping Dogs', 'Al șaselea album lansat al formației de rock alternativ finlandeze Two.',
	   'Albume', 'Poștă', '75.99', '40', '2022-06-22', 'Alb', '{"2022", "CD", "Alternative rock"}');
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details)
VALUES ('Hunter North - Take Cover', 'Albumul de "comeback" al multi-instrumentalistului Hunter North, cu ajutorul căruia s-a relansat după o pauză de 5 ani.',
	   'Albume', 'Curier', '129.99', '130', '2022-03-16', 'Negru', '{"1997", "Vinyl", "Progressive metal"}');
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details, voucher)
VALUES ('Augmented Embers - Glass Houses', 'Considerat cel mai bun album R&B al anului 2007, sunetul inconfundabil al trupei Augmented Embers rămâne "fresh" chiar și acum.',
	   'Albume', 'Poștă', '54.99', '50', '2022-11-05', 'Roșu', '{"2007", "CD", "R&B"}', FALSE);
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details)
VALUES ('Web - Apparatus', 'Oniric și cu o tentă psihedelică, acesta este albumul de debut al celor de la Web, printre cele mai importante formații dream pop din Franța.',
	   'Albume', 'Curier', '149.99', '145', '2021-12-18', 'Albastru', '{"2001", "Vinyl", "Dream pop"}');
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details, voucher)
VALUES ('Glamorows - Collar Of Bones', 'Hip-hop clasic, "genre defining", marca Glamorows.',
	   'Albume', 'Curier', '199.99', '120', '2021-12-18', 'Negru', '{"1994", "Casetă", "Hip-hop"}', FALSE);
INSERT INTO products (name, description, category, exp_type, price, weight, color, prod_details)
VALUES ('Victoria & Band - Amândoi', 'Actrița Victoria Ismulescu, devenită cântăreață peste noapte, reușește să capteze publicul internațional prin vocea ei suavă și muzicalitatea impecabilă a trupei ce o acompaniază.',
	   'Albume', 'De la centrul de distribuție', '79.99', '45', 'Verde', '{"2014", "CD", "Jazz"}');

--device-uri
--descriere: conectivitate, tip, prezenta microfonului
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details)
VALUES ('Căști Bongos X93P', 'Căști wireless de ultimă generație marca Bongos.',
	   'Device-uri', 'De la centrul de distribuție', '289.99', '132', '2021-12-18', 'Negru', '{"Wireless", "On ear", "Da"}');
INSERT INTO products (name, description, category, exp_type, price, weight, color, prod_details, voucher)
VALUES ('Căști Nymi Ultra 2', 'A doua generație de căști Nymi Ultra, perfecționată pentru orice tip de ascultător!',
	   'Device-uri', 'Curier', '449.99', '50', 'Alb', '{"Wireless", "In ear", "Da"}', FALSE);
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details, voucher)
VALUES ('Căști Bongos X90P', 'Prima generație de căști wireless de la Bongos.',
	   'Device-uri', 'Curier', '184.99', '156', '2022-11-05', 'Negru', '{"Wireless", "On ear", "Da"}', FALSE);
INSERT INTO products (name, description, category, exp_type, price, weight, color, prod_details)
VALUES ('Căști Nymi Panther 4', 'Căștile perfecte de gaming din seria Panther de la Nymi, acum de 2 ori mai performante!',
	   'Device-uri', 'Curier', '399.99', '179', 'Roșu', '{"Cu fir", "Over ear", "Da"}');
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details)
VALUES ('Boxe Bongos Zuma 4T', 'Boxe de performanță înaltă, pentru un sunet puternic și amplu',
	   'Device-uri', 'De la centrul de distribuție', '799.99', '400', '2022-06-22', 'Alb', '{"Cu fir", "Boxe", "Nu"}');
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details)
VALUES ('Boxe Koolki K729', 'Set de boxe perfect pentru birou și uz de zi cu zi!',
	   'Device-uri', 'De la centrul de distribuție', '154.99', '325', '2022-03-16', 'Albastru', '{"Cu fir", "Boxe", "Nu"}');
	   
--merchandise
--descriere: gen, marime, material
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details)
VALUES ('Tricou Augmented Embers', 'Tricou oficial din seria Augmented Embers - 2022 NA Tour',
	   'Merchandise', 'Curier', '159.99', '125', '2022-03-16', 'Negru', '{"Bărbați", "L", "100% Bumbac"}');
INSERT INTO products (name, description, category, exp_type, price, weight, add_date, color, prod_details)
VALUES ('Tricou Two', 'Tricou oficial Two.',
	   'Merchandise', 'Curier', '199.99', '120', '2022-03-16', 'Alb', '{"Femei", "M", "80% Bumbac 20% Poliester"}');
INSERT INTO products (name, description, category, exp_type, price, weight, color, prod_details)
VALUES ('Hanorac Glamorows', 'Hanorac oficial Glamorows, relansare a seriei din anii ''90',
	   'Merchandise', 'De la centrul de distribuție', '299.99', '260', 'Negru', '{"Bărbați", "XL", "100% Bumbac"}');
INSERT INTO products (name, description, category, exp_type, price, weight, color, prod_details)
VALUES ('Șapcă Glamorows', 'Șapcă oficială Glamorows, relansare a seriei din anii ''90',
	   'Merchandise', 'Poștă', '199.99', '70', 'Negru', '{"Unisex", "Reglabilă", "100% Poliester"}');
INSERT INTO products (name, category, exp_type, price, weight, add_date, color, prod_details)
VALUES ('Lanț cuban argint',
	   'Merchandise', 'Poștă', '499.99', '450', '2021-12-18', 'Argintiu', '{"Unisex", "L", "Argint 925"}');
INSERT INTO products (name, description, category, exp_type, price, weight, color, prod_details)
VALUES ('Brățară Hunter North', 'Brățară Hunter North - Stronghold Tour 2004',
	   'Merchandise', 'Poștă', '149.99', '130', 'Negru', '{"Unisex", "M", "100% Cauciuc"}');
	   
GRANT ALL PRIVILEGES ON DATABASE allmuzica TO client_allmuzica ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO client_allmuzica;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO client_allmuzica;