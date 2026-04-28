<?php
// === SmartCS — Dashboard Stats API ===
require_once __DIR__ . '/config.php';

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

    // Waktu Respon (DINA) - Mock for now
    $waktuRespon = "1.2s";
    $trendRespon = "-0.4s";

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
