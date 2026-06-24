<?php
/**
 * ChatController
 *
 * POST /api/chat  → Gửi tin nhắn tới AI Gemini
 */

class ChatController {

    public static function handle(string $method): void {
        if ($method !== 'POST') {
            jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405);
        }

        define('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE');

        $body        = getRequestBody();
        $userMessage = $body['message'] ?? '';
        $history     = $body['history'] ?? [];

        if (empty($userMessage)) {
            jsonResponse(['success' => false, 'error' => 'Tin nhắn không được để trống'], 400);
        }

        $systemPrompt = "Bạn là trợ lý ảo thông minh của phòng gym FitPhysique. "
            . "Nhiệm vụ của bạn là tư vấn sức khỏe, thể hình và các gói tập tại gym. "
            . "Đặc biệt: Nếu người dùng cung cấp chiều cao và cân nặng, hãy giúp họ tính BMI "
            . "(BMI = cân nặng / (chiều cao/100)^2) và đưa ra lời khuyên tập luyện, ăn uống phù hợp với trạng thái đó. "
            . "Hãy trả lời một cách thân thiện, chuyên nghiệp bằng tiếng Việt.";

        $url  = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . GEMINI_API_KEY;
        $data = [
            "contents" => [[
                "parts" => [["text" => $systemPrompt . "\n\nNgười dùng: " . $userMessage]]
            ]]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $result   = json_decode($response, true);
            $botReply = $result['candidates'][0]['content']['parts'][0]['text'] ?? 'Xin lỗi, tôi gặp chút trục trặc.';
            jsonResponse(['success' => true, 'data' => $botReply]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Lỗi kết nối API AI: ' . $response], 500);
        }
    }
}
