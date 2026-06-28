/**
 * Config toàn cục cho frontend
 * Ảnh upload (notifications, trainers, blogs mới) → /BTLWeb(PC)/backend/uploads/
 * Ảnh static cũ của blog gốc                    → /BTLWeb(PC)/backend/assets/
 * Cả 2 đều được Vite proxy sang localhost khi dev
 */
export const UPLOADS_URL = '/BTLWeb(PC)/backend/uploads';
export const ASSETS_URL  = '/BTLWeb(PC)/backend/assets';

// Ảnh blog mặc định được lưu trong assets/
const STATIC_BLOG_IMAGES = ['blog-1.jpg','blog-2.jpg','blog-3.jpg','blog-4.jpg','banner-3.png'];

/**
 * Trả về URL ảnh blog đúng thư mục (assets hoặc uploads)
 */
export function getBlogImageUrl(image) {
  if (!image) return null;
  if (STATIC_BLOG_IMAGES.includes(image)) {
    return `${ASSETS_URL}/${image}`;
  }
  return `${UPLOADS_URL}/${image}`;
}
