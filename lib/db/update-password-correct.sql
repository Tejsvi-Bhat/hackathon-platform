UPDATE users SET password_hash = '$2b$10$84hlXSAKqte14kES.x0kgOf2xD8HHatCaI6rJv.vzso2HIj2Cw8zu';

SELECT email, LENGTH(password_hash) as length, password_hash FROM users LIMIT 1;
