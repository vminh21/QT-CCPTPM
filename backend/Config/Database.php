<?php
class Database {
    private static $instance = null;
    private $conn;

    private $host = 'localhost';
    private $user = 'root';
    private $pass = '';
    private $dbname = 'gymmanagement';

    // Private constructor to prevent multiple instances (Singleton Pattern)
    private function __construct() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Throw exception on error
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Fetch as associative array by default
                PDO::ATTR_EMULATE_PREPARES   => false, // Better security
            ];
            $this->conn = new PDO($dsn, $this->user, $this->pass, $options);
            $this->conn->exec("set names utf8mb4");
        } catch (PDOException $e) {
            die("Kết nối Database thất bại: " . $e->getMessage());
        }
    }

    // Get Single Instance
    public static function getInstance() {
        if (!self::$instance) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    // Get Connection
    public function getConnection() {
        return $this->conn;
    }
}
?>
