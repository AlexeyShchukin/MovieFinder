CREATE TABLE IF NOT EXISTS log_query(
    query_id INT AUTO_INCREMENT PRIMARY KEY,
    genre VARCHAR(30),
    actor VARCHAR(50),
    year INT,
    count INT
);
