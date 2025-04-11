CREATE TABLE post (
    id SERIAL PRIMARY KEY,
    content VARCHAR(280) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO post (content) VALUES 
('Hello, world!'),
('This is my second post.'),
('SQL is fun!'),
('Learning databases is interesting.'),
('Have a great day!'),
('Just another random thought.'),
('Exploring SQL queries.'),
('Writing some test data.'),
('Enjoying the process of learning.'),
('This is a placeholder post.');