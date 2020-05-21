module.exports = {
  mySqlURL: 'localhost',
  mySqlUser: 'jack',
  mySqlPassword: 'lightuponlight',
  mySqlDB: 'analysis',
}

/**
 * Port : 3306
 */

/**
 * Create User
 * CREATE USER 'root'@'localhost' IDENTIFIED BY 'lightuponlight';
 */

/**
 * Grant Privileges to user
 * GRANT ALL PRIVILEGES ON * . * TO 'jack'@'localhost';
 */

/**
 * Restart
 * sudo /usr/local/mysql/support-files/mysql.server restart
 * */

/**
 * Authentication protocol fix
 * ALTER USER 'jack'@'localhost' IDENTIFIED WITH mysql_native_password BY 'lightuponlight'
 * flush privileges;
 */