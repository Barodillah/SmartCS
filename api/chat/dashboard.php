<?php
// === SmartCS — Dashboard Stats API ===
require_once dirname(__DIR__) . '/config.php';

$db = getDB();

function calculateTrend($db, $table, $dateCol, $whereClause = "") {
    $where1 = $whereClause ? "AND $whereClause" : "";
    
    // Current period (last 30 days)
    $stmt = $db->query("SELECT COUNT(*) FROM $table WHERE $dateCol >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) $where1");
    $current = (int)$stmt->fetchColumn();

    // Previous period (31-60 days ago)
    $stmt = $db->query("SELECT COUNT(*) FROM $table WHERE $dateCol >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) AND $dateCol < DATE_SUB(CURDATE(), INTERVAL 30 DAY) $where1");
    $last = (int)$stmt->fetchColumn();

    if ($last == 0) {
        return $current > 0 ? "+100%" : "0%";
    }
    $diff = (($current - $last) / $last) * 100;
    return ($diff > 0 ? "+" : "") . round($diff, 1) . "%";
}

function getResponseTimeStats($db) {
    // Fetch last 200 messages to ensure we get enough pairs
    $stmt = $db->query("
        SELECT session_id, sender_type, created_at 
        FROM chat_messages 
        ORDER BY created_at DESC 
        LIMIT 200
    ");
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sessions = [];
    foreach ($messages as $msg) {
        $sessions[$msg['session_id']][] = $msg;
    }

    $pairs = [];
    foreach ($sessions as $sessionId => $sessionMessages) {
        usort($sessionMessages, function($a, $b) {
            return strtotime($a['created_at']) - strtotime($b['created_at']);
        });

        $lastUserTime = null;
        foreach ($sessionMessages as $msg) {
            if ($msg['sender_type'] === 'user') {
                $lastUserTime = strtotime($msg['created_at']);
            } elseif ($msg['sender_type'] === 'bot' && $lastUserTime !== null) {
                $botTime = strtotime($msg['created_at']);
                $pairs[] = [
                    'diff' => $botTime - $lastUserTime,
                    'time' => $botTime
                ];
                $lastUserTime = null;
            }
        }
    }

    usort($pairs, function($a, $b) {
        return $b['time'] - $a['time'];
    });

    $currentPairs = array_slice($pairs, 0, 20);
    $previousPairs = array_slice($pairs, 20, 20);

    $currentAvg = 0;
    if (count($currentPairs) > 0) {
        $currentAvg = array_sum(array_column($currentPairs, 'diff')) / count($currentPairs);
    }

    $previousAvg = 0;
    if (count($previousPairs) > 0) {
        $previousAvg = array_sum(array_column($previousPairs, 'diff')) / count($previousPairs);
    }

    $trend = $currentAvg - $previousAvg;
    
    if (count($previousPairs) == 0) {
        $trend = 0;
    }

    return [
        'waktu_respon' => $currentAvg > 0 ? round($currentAvg, 1) . "s" : "0s",
        'trend_respon' => ($trend > 0 ? "+" : "") . round($trend, 1) . "s"
    ];
}

try {
    // 1. Total Percakapan (Total Sessions)
    $stmt = $db->query("SELECT COUNT(*) FROM chat_sessions");
    $totalPercakapan = (int)$stmt->fetchColumn();
    $trendPercakapan = calculateTrend($db, 'chat_sessions', 'created_at');

    $stmt = $db->query("SELECT COUNT(DISTINCT ip_address) FROM chat_sessions");
    $uniqueIpPercakapan = (int)$stmt->fetchColumn();

    // 2. Semua Leads
    $stmt = $db->query("SELECT COUNT(*) FROM chat_leads");
    $semuaLeads = (int)$stmt->fetchColumn();
    $trendLeads = calculateTrend($db, 'chat_leads', 'created_at');

    // 3. Total View Artikel
    $stmt = $db->query("SELECT COUNT(*) FROM article_views");
    $totalViewArtikel = (int)$stmt->fetchColumn();
    $trendView = calculateTrend($db, 'article_views', 'viewed_at');

    // Total Artikel (just additional context)
    $stmt = $db->query("SELECT COUNT(*) FROM articles");
    $totalArticles = (int)$stmt->fetchColumn();

    // Waktu Respon (DINA)
    $responStats = getResponseTimeStats($db);
    $waktuRespon = $responStats['waktu_respon'];
    $trendRespon = $responStats['trend_respon'];

    // Chart Data (Last 7 days of active sessions)
    $stmt = $db->query("
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM chat_sessions 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $recentActivity = $stmt->fetchAll();

    jsonResponse(true, '', [
        'total_percakapan'   => $totalPercakapan,
        'unique_ip_percakapan' => $uniqueIpPercakapan,
        'trend_percakapan'   => $trendPercakapan,
        'semua_leads'        => $semuaLeads,
        'trend_leads'      => $trendLeads,
        'total_view_artikel'=> $totalViewArtikel,
        'trend_view'       => $trendView,
        'total_artikel'    => $totalArticles,
        'waktu_respon'     => $waktuRespon,
        'trend_respon'     => $trendRespon,
        'recent_activity'  => $recentActivity
    ]);
} catch (Exception $e) {
    jsonResponse(false, 'Failed to fetch dashboard stats: ' . $e->getMessage(), null, 500);
}
