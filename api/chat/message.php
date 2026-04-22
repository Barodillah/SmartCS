<?php
// === DINA Chat API — Message Management ===
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'send':
        sendMessage();
        break;
    case 'history':
        getHistory();
        break;
    default:
        jsonResponse(false, 'Invalid action. Use: send, history', null, 400);
}

// --- Send / Save Message ---
function sendMessage() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(false, 'Method not allowed', null, 405);
    }

    $body = getPostBody();
    $sessionId = $body['session_id'] ?? '';
    $senderType = $body['sender_type'] ?? '';
    $message = $body['message'] ?? '';
    $metadata = $body['metadata'] ?? null;

    // Validate required fields
    if (empty($sessionId) || empty($senderType) || empty($message)) {
        jsonResponse(false, 'session_id, sender_type, and message are required', null, 400);
    }

    // Validate sender_type
    $validSenders = ['user', 'bot', 'cs'];
    if (!in_array($senderType, $validSenders)) {
        jsonResponse(false, 'sender_type must be: user, bot, or cs', null, 400);
    }

    $db = getDB();

    // Verify session exists
    $sessionStmt = $db->prepare("SELECT id, status FROM chat_sessions WHERE id = :id");
    $sessionStmt->execute([':id' => $sessionId]);
    $session = $sessionStmt->fetch();

    if (!$session) {
        jsonResponse(false, 'Session not found', null, 404);
    }

    // Insert message
    $msgId = generateUUID();
    $stmt = $db->prepare("
        INSERT INTO chat_messages (id, session_id, sender_type, message, metadata, created_at)
        VALUES (:id, :session_id, :sender_type, :message, :metadata, NOW())
    ");

    $stmt->execute([
        ':id'          => $msgId,
        ':session_id'  => $sessionId,
        ':sender_type' => $senderType,
        ':message'     => $message,
        ':metadata'    => $metadata ? json_encode($metadata, JSON_UNESCAPED_UNICODE) : null
    ]);

    // Update session's updated_at
    $db->prepare("UPDATE chat_sessions SET updated_at = NOW() WHERE id = :id")
       ->execute([':id' => $sessionId]);

    jsonResponse(true, 'Message saved', [
        'message_id' => $msgId,
        'created_at' => date('Y-m-d H:i:s')
    ]);
}

// --- Get Message History for Session ---
function getHistory() {
    $sessionId = $_GET['session_id'] ?? '';

    if (empty($sessionId)) {
        jsonResponse(false, 'session_id parameter is required', null, 400);
    }

    $db = getDB();

    // Verify session exists
    $sessionStmt = $db->prepare("SELECT id FROM chat_sessions WHERE id = :id");
    $sessionStmt->execute([':id' => $sessionId]);

    if (!$sessionStmt->fetch()) {
        jsonResponse(false, 'Session not found', null, 404);
    }

    // Fetch messages
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(100, max(10, (int)($_GET['limit'] ?? 100)));
    $offset = ($page - 1) * $limit;

    $stmt = $db->prepare("
        SELECT id, session_id, sender_type, message, metadata, created_at
        FROM chat_messages
        WHERE session_id = :session_id
        ORDER BY created_at ASC
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindValue(':session_id', $sessionId, PDO::PARAM_STR);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $messages = $stmt->fetchAll();

    // Parse metadata JSON
    foreach ($messages as &$msg) {
        if ($msg['metadata']) {
            $msg['metadata'] = json_decode($msg['metadata'], true);
        }
    }

    // Total count
    $countStmt = $db->prepare("SELECT COUNT(*) FROM chat_messages WHERE session_id = :session_id");
    $countStmt->execute([':session_id' => $sessionId]);
    $total = (int)$countStmt->fetchColumn();

    jsonResponse(true, '', [
        'messages' => $messages,
        'total' => $total,
        'page' => $page,
        'limit' => $limit
    ]);
}
