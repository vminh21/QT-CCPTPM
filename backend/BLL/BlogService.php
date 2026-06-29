<?php
require_once __DIR__ . '/../DAL/BlogRepository.php';

class BlogService {
    private $blogRepo;

    public function __construct() {
        $this->blogRepo = new BlogRepository();
    }

    public function getAllBlogs() {
        return $this->blogRepo->getAllBlogs();
    }

    public function getLatestBlogs($limit = 4) {
        return $this->blogRepo->getLatestBlogs($limit);
    }

    public function getBlogById($id) {
        $blog = $this->blogRepo->getBlogById($id);
        if ($blog) {
            // Provide a default image if none exists
            if (empty($blog['image']) || $blog['image'] == 'NULL') {
                $blog['image'] = "banner-3.png";
            }
        }
        return $blog;
    }

    public function saveBlog($id, $title, $content, $file) {
        $image_name = null;
        
        // Handle file upload
        if (isset($file) && $file['error'] == 0) {
            $file_name = $file['name'];
            $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            $allowed = array("jpg", "jpeg", "png");

            if (in_array($ext, $allowed)) {
                $image_name = time() . "_" . basename($file_name);
                $upload_path = __DIR__ . "/../uploads/" . $image_name;
                move_uploaded_file($file["tmp_name"], $upload_path);
            } else {
                return "error_ext";
            }
        }

        if (!empty($id)) {
            // Update
            if ($image_name !== null) {
                // Remove old image
                $old_data = $this->blogRepo->getBlogById($id);
                if ($old_data && !empty($old_data['image'])) {
                    $old_path = __DIR__ . "/../uploads/" . $old_data['image'];
                    // Don't delete banner-3.png as it's a default static asset sometimes assigned by logic, although the actual text in db shouldn't be banner-3.png
                    if (!in_array($old_data['image'], ['blog-1.jpg','blog-2.jpg','blog-3.jpg','blog-4.jpg','banner-3.png']) && file_exists($old_path)) {
                        unlink($old_path);
                    }
                }
            }
            $success = $this->blogRepo->updateBlog($id, $title, $content, $image_name);
        } else {
            // Create
            // Generate a unique non-numeric ID
            $id = uniqid('b_');
            $success = $this->blogRepo->createBlog($id, $title, $content, $image_name);
        }

        return $success ? "success" : "error";
    }

    public function deleteBlog($id) {
        $old_data = $this->blogRepo->getBlogById($id);
        if ($old_data && !empty($old_data['image']) && $old_data['image'] !== 'banner-3.png') {
            $old_path = __DIR__ . "/../uploads/" . $old_data['image'];
            if (file_exists($old_path)) {
                unlink($old_path);
            }
        }
        
        $success = $this->blogRepo->deleteBlog($id);
        return $success ? "deleted" : "error";
    }
}
?>
