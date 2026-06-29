<?php
require_once __DIR__ . '/../Config/Database.php';

class BlogRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllBlogs() {
        $stmt = $this->db->query("SELECT * FROM blogs ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getLatestBlogs($limit = 4) {
        $stmt = $this->db->prepare("SELECT * FROM blogs ORDER BY created_at DESC LIMIT :limit");
        // Bind parameter as integer since LIMIT requires an int
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBlogById($id) {
        $stmt = $this->db->prepare("SELECT * FROM blogs WHERE blog_id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createBlog($id, $title, $content, $image) {
        $stmt = $this->db->prepare("INSERT INTO blogs (blog_id, title, content, image) VALUES (:id, :title, :content, :image)");
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':image', $image);
        return $stmt->execute();
    }

    public function updateBlog($id, $title, $content, $image = null) {
        if ($image !== null) {
            $stmt = $this->db->prepare("UPDATE blogs SET title=:title, content=:content, image=:image WHERE blog_id=:id");
            $stmt->bindParam(':image', $image);
        } else {
            $stmt = $this->db->prepare("UPDATE blogs SET title=:title, content=:content WHERE blog_id=:id");
        }
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function deleteBlog($id) {
        $stmt = $this->db->prepare("DELETE FROM blogs WHERE blog_id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
?>
