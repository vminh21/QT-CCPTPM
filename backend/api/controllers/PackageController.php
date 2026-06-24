<?php
/**
 * PackageController
 *
 * GET /api/packages  → Danh sách gói tập (public)
 */

require_once ROOT_PATH . 'DAL/PackageRepository.php';

class PackageController {

    public static function handle(?string $id, string $method): void {
        match (true) {
            !$id && $method === 'GET' => self::index(),
            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    private static function index(): void {
        $repo     = new PackageRepository();
        $packages = $repo->getAllPackages();
        jsonResponse(['success' => true, 'data' => $packages]);
    }
}
