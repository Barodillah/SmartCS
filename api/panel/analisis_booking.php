<?php
// === Analisis Booking API ===
// Handles analytics aggregation for booking data
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . '/config_legacy.php';
$conn = getLegacyDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tahun = isset($_GET['tahun']) ? mysqli_real_escape_string($conn, $_GET['tahun']) : date('Y');
    $bulan = isset($_GET['bulan']) ? mysqli_real_escape_string($conn, $_GET['bulan']) : '';

    $action = isset($_GET['action']) ? $_GET['action'] : 'summary';

    $whereClause = "WHERE YEAR(tanggal) = '$tahun'";
    if (!empty($bulan)) {
        $whereClause .= " AND MONTH(tanggal) = '$bulan'";
    }

    if ($action === 'heatmap') {
        $heatmapType = isset($_GET['type']) ? $_GET['type'] : 'WALK IN';
        
        if ($heatmapType === 'BOOKING') {
            $whereClause .= " AND status IN ('BOOKING', 'DATANG')";
        } else {
            $whereClause .= " AND status = 'WALK IN'";
        }
        
        $query = "
            SELECT 
                DAYOFWEEK(tanggal) as day_of_week,
                LEFT(jam, 2) as hour_of_day,
                COUNT(*) as count
            FROM booking
            $whereClause
            GROUP BY DAYOFWEEK(tanggal), LEFT(jam, 2)
        ";
        $result = mysqli_query($conn, $query);
        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $day = (int)$row['day_of_week']; // 1=Sunday, 2=Monday...
                $hour = $row['hour_of_day'];
                if (empty($hour) || !is_numeric($hour)) continue;
                
                $data[] = [
                    'day' => $day,
                    'hour' => $hour,
                    'count' => (int)$row['count']
                ];
            }
        }
        echo json_encode(['status' => true, 'data' => $data, 'query' => ['tahun' => $tahun, 'bulan' => $bulan, 'action' => 'heatmap']]);
        mysqli_close($conn);
        exit;
    }

    if ($action === 'capacity') {
        // Find how many distinct days are in this period
        $queryDays = "SELECT COUNT(DISTINCT tanggal) as total_days FROM booking $whereClause AND status IN ('BOOKING', 'DATANG', 'WALK IN')";
        $resDays = mysqli_query($conn, $queryDays);
        $totalDays = mysqli_fetch_assoc($resDays)['total_days'] ?: 1;

        $query = "
            SELECT 
                LEFT(jam, 2) as hour_of_day,
                status,
                COUNT(*) as count
            FROM booking
            $whereClause AND LEFT(jam, 2) IN ('08', '09', '10', '11', '13', '14') AND status IN ('BOOKING', 'DATANG', 'WALK IN')
            GROUP BY LEFT(jam, 2), status
        ";
        $result = mysqli_query($conn, $query);
        $data = [
            '08' => ['BOOKING' => 0, 'DATANG' => 0, 'WALK IN' => 0],
            '09' => ['BOOKING' => 0, 'DATANG' => 0, 'WALK IN' => 0],
            '10' => ['BOOKING' => 0, 'DATANG' => 0, 'WALK IN' => 0],
            '11' => ['BOOKING' => 0, 'DATANG' => 0, 'WALK IN' => 0],
            '13' => ['BOOKING' => 0, 'DATANG' => 0, 'WALK IN' => 0],
            '14' => ['BOOKING' => 0, 'DATANG' => 0, 'WALK IN' => 0],
        ];
        
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $hour = $row['hour_of_day'];
                $status = strtoupper($row['status'] ?? '');
                $count = (int)$row['count'];
                if (isset($data[$hour]) && isset($data[$hour][$status])) {
                    // Average per day
                    $data[$hour][$status] = round($count / $totalDays, 1);
                }
            }
        }
        
        $response = [];
        foreach ($data as $hour => $counts) {
            $response[] = [
                'hour' => $hour,
                'booking' => $counts['BOOKING'],
                'datang' => $counts['DATANG'],
                'walk_in' => $counts['WALK IN']
            ];
        }
        echo json_encode(['status' => true, 'data' => $response, 'totalDays' => $totalDays, 'query' => ['tahun' => $tahun, 'bulan' => $bulan, 'action' => 'capacity']]);
        mysqli_close($conn);
        exit;
    }

    $selectDate = empty($bulan) ? "DATE_FORMAT(tanggal, '%Y-%m') as tanggal" : "tanggal";
    $groupByDate = empty($bulan) ? "DATE_FORMAT(tanggal, '%Y-%m')" : "tanggal";

    $query = "
        SELECT 
            $selectDate,
            status,
            COUNT(*) as count
        FROM booking
        $whereClause
        GROUP BY $groupByDate, status
        ORDER BY $groupByDate ASC
    ";

    $result = mysqli_query($conn, $query);
    
    $data = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $date = $row['tanggal'];
            $status = strtoupper($row['status'] ?? 'REQUEST');
            $count = (int)$row['count'];

            if (!isset($data[$date])) {
                $data[$date] = [
                    'tanggal' => $date,
                    'booking' => 0,
                    'datang' => 0,
                    'walk_in' => 0,
                    'cancel' => 0,
                    'total' => 0
                ];
            }

            if ($status === 'BOOKING') $data[$date]['booking'] += $count;
            elseif ($status === 'DATANG') $data[$date]['datang'] += $count;
            elseif ($status === 'WALK IN') $data[$date]['walk_in'] += $count;
            elseif ($status === 'CANCEL' || $status === 'BATAL') $data[$date]['cancel'] += $count;
            
            $data[$date]['total'] += $count;
        }
    }

    // Convert associative array to indexed array
    $responseData = array_values($data);

    echo json_encode(['status' => true, 'data' => $responseData, 'query' => ['tahun' => $tahun, 'bulan' => $bulan]]);
}

mysqli_close($conn);
?>
