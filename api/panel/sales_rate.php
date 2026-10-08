<?php
require_once '../config.php';
require_once '../config_legacy.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $start_date = $_GET['start_date'] ?? date('Y-m-01');
    $end_date = $_GET['end_date'] ?? date('Y-m-t');

    // Ensure date format is Y-m-d
    $start_date = date('Y-m-d', strtotime($start_date));
    $end_date = date('Y-m-d', strtotime($end_date));

    $conn = getLegacyDB();
    $pdo = getDB();

    if (!$conn || !$pdo) {
        jsonResponse(false, 'Database connection failed', null, 500);
    }

    $query = "SELECT * FROM surveyupdate WHERE (status != 'PDI' AND wa_date BETWEEN '$start_date' AND '$end_date') OR (status = 'PDI' AND pdi_date BETWEEN '$start_date' AND '$end_date')";
    $result = mysqli_query($conn, $query);
    if (!$result) {
        jsonResponse(false, 'Legacy DB Query Error: ' . mysqli_error($conn), null, 500);
    }

    $rekapSales = [];
    $unsurveyed_statuses = ['PERLU FOLLOW UP', 'TIDAK DIANGKAT', 'NOMOR SALAH', 'SALAH SAMBUNG', 'PERJANJIAN', 'DITOLAK/REJECT', 'SURVEY_WA'];

    $stmt = $pdo->prepare("SELECT rangka, score, note FROM nps_data");
    $stmt->execute();
    $npsDataRaw = $stmt->fetchAll();
    
    $npsMapByRangka = [];
    foreach ($npsDataRaw as $row) {
        $score = (int)$row['score'];
        $status_nps = 'detractor';
        if ($score >= 9) $status_nps = 'promotor';
        elseif ($score >= 7) $status_nps = 'passive';
        
        $npsMapByRangka[$row['rangka']] = [
            'score' => $score,
            'status_nps' => $status_nps,
            'note' => $row['note']
        ];
    }

    // First collect by SPV -> Sales
    while ($row = mysqli_fetch_assoc($result)) {
        $id_cust = $row['id'];
        $sales = $row['sales'] ?: 'Unknown';
        $spv = $row['spv'] ?: 'Tanpa SPV';

        if (!isset($rekapSales[$spv])) {
            $rekapSales[$spv] = [];
        }
        
        if (!isset($rekapSales[$spv][$sales])) {
            $rekapSales[$spv][$sales] = [
                'total' => 0,
                'surveyed' => 0,
                'unsurveyed' => 0,
                'promotor' => 0,
                'passiver' => 0,
                'detraktor' => 0,
                'detail_nps' => [],
                'detail_survey' => [],
                'warranty_total_days' => 0,
                'warranty_count' => 0,
                'pdi_count' => 0,
                'detail_warranty' => []
            ];
        }

        $status = strtoupper($row['status']);
        $isPDI = ($status === 'PDI');

        // Kalkulasi Warranty
        $pdi_date_str = $row['pdi_date'] ?? null;
        $wa_date_str = $row['wa_date'] ?? null;
        
        if (!empty($pdi_date_str) && $pdi_date_str !== '0000-00-00' && $pdi_date_str !== '0000-00-00 00:00:00') {
            $pdiDate = new DateTime($pdi_date_str);
            if ($isPDI) {
                $endDate = new DateTime(); // Hari ini
            } else {
                if (!empty($wa_date_str) && $wa_date_str !== '0000-00-00' && $wa_date_str !== '0000-00-00 00:00:00') {
                    $endDate = new DateTime($wa_date_str);
                } else {
                    $endDate = new DateTime();
                }
            }
            $diff = $pdiDate->diff($endDate);
            $warranty_days = $diff->days;
            
            $rekapSales[$spv][$sales]['warranty_total_days'] += $warranty_days;
            $rekapSales[$spv][$sales]['warranty_count']++;
            
            if ($isPDI) {
                $rekapSales[$spv][$sales]['pdi_count']++;
            }
            
            $rekapSales[$spv][$sales]['detail_warranty'][] = [
                'nama' => $row['nama'] ?? 'Unknown',
                'kendaraan' => $row['kendaraan'] ?? 'Unknown',
                'rangka' => $row['rangka'] ?? '',
                'status' => $status,
                'pdi_date' => $pdi_date_str,
                'wa_date' => $wa_date_str,
                'days' => $warranty_days
            ];
        }

        if ($isPDI) {
            continue; // Skip Survey/NPS logic for PDI
        }

        $rekapSales[$spv][$sales]['total']++;

        $isSurveyed = false;
        $survey_status_label = 'Sudah';
        
        if (in_array($status, $unsurveyed_statuses) || empty($status)) {
            $rekapSales[$spv][$sales]['unsurveyed']++;
            $survey_status_label = 'Belum';
        } else {
            $isSurveyed = true;
            $rekapSales[$spv][$sales]['surveyed']++;
        }

        $rekapSales[$spv][$sales]['detail_survey'][] = [
            'nama' => $row['nama'] ?? 'Unknown',
            'kendaraan' => $row['kendaraan'] ?? 'Unknown',
            'rangka' => $row['rangka'] ?? '',
            'status_survey' => $survey_status_label,
            'status_detail' => $status ?: 'BLANK'
        ];

        if ($isSurveyed) {
            $rangka = $row['rangka'];
            $npsScoreStr = null;
            
            if (isset($npsMapByRangka[$rangka]) && !empty($npsMapByRangka[$rangka]['status_nps'])) {
                $npsScoreStr = strtolower($npsMapByRangka[$rangka]['status_nps']);
            } else {
                $hasilQuery = mysqli_query($conn, "SELECT nilai FROM surveyhasil WHERE cust_id = $id_cust");
                $hasilnps = mysqli_fetch_assoc($hasilQuery);
                if ($hasilnps) {
                    $nilai = (int)$hasilnps['nilai'];
                    if ($nilai >= 9 && $nilai <= 10) $npsScoreStr = 'promotor';
                    elseif ($nilai >= 7 && $nilai <= 8) $npsScoreStr = 'passive';
                    elseif ($nilai >= 0 && $nilai <= 6) $npsScoreStr = 'detractor';
                }
            }

            if (!$npsScoreStr && !empty($row['est'])) {
                $nilai = (int)$row['est'];
                if ($nilai >= 9 && $nilai <= 10) $npsScoreStr = 'promotor';
                elseif ($nilai >= 7 && $nilai <= 8) $npsScoreStr = 'passive';
                elseif ($nilai >= 0 && $nilai <= 6) $npsScoreStr = 'detractor';
            }

            if ($npsScoreStr === 'promotor') $rekapSales[$spv][$sales]['promotor']++;
            else if ($npsScoreStr === 'passive') $rekapSales[$spv][$sales]['passiver']++;
            else if ($npsScoreStr === 'detractor' || $npsScoreStr === 'detraktor') $rekapSales[$spv][$sales]['detraktor']++;

            if ($npsScoreStr) {
                $actual_score = null;
                $actual_note = null;
                if (isset($npsMapByRangka[$rangka])) {
                    $actual_score = $npsMapByRangka[$rangka]['score'];
                    $actual_note = $npsMapByRangka[$rangka]['note'];
                } elseif (isset($nilai)) {
                    $actual_score = $nilai;
                }

                if (empty($actual_note)) $actual_note = $row['note'] ?? '';
                
                $rekapSales[$spv][$sales]['detail_nps'][] = [
                    'nama' => $row['nama'] ?? 'Unknown',
                    'kendaraan' => $row['kendaraan'] ?? 'Unknown',
                    'rangka' => $rangka,
                    'kategori' => $npsScoreStr,
                    'score' => $actual_score,
                    'note' => $actual_note
                ];
            }
        }
    }

    // Prepare Response array
    $spvData = [];

    foreach ($rekapSales as $spvName => $salesDataMap) {
        $spvTotal = 0;
        $spvSurveyed = 0;
        $spvPromotor = 0;
        $spvPassiver = 0;
        $spvDetraktor = 0;
        $spvWarrantyTotalDays = 0;
        $spvWarrantyCount = 0;
        $spvPdiCount = 0;
        $spvDetailWarranty = [];
        $salesList = [];

        foreach ($salesDataMap as $salesName => $data) {
            $surveyed_nps = isset($data['detail_nps']) ? count($data['detail_nps']) : 0;
            $unsurveyed_nps = $data['total'] - $surveyed_nps;
            $ratio = $data['total'] > 0 ? ($surveyed_nps / $data['total']) * 100 : 0;
            
            $promotor = $data['promotor'];
            $passiver = $data['passiver'];
            $detraktor = $data['detraktor'];
            $totalnps = $promotor + $passiver + $detraktor;
            
            $promotorPct = $totalnps > 0 ? ($promotor / $totalnps) * 100 : 0;
            $passiverPct = $totalnps > 0 ? ($passiver / $totalnps) * 100 : 0;
            $detraktorPct = $totalnps > 0 ? ($detraktor / $totalnps) * 100 : 0;
            
            $nps = $promotorPct - $detraktorPct;
            $nps_normal = ($nps + 100) / 2;
            $skor = ($ratio * 0.5) + ($nps_normal * 0.5);

            $avg_warranty = $data['warranty_count'] > 0 ? round($data['warranty_total_days'] / $data['warranty_count'], 1) : 0;

            $salesItem = [
                'sales' => $salesName,
                'total' => $data['total'],
                'surveyed' => $surveyed_nps,
                'unsurveyed' => $unsurveyed_nps,
                'ratio' => round($ratio, 2),
                'skor' => round($skor, 2),
                'promotor' => $promotor,
                'passiver' => $passiver,
                'detraktor' => $detraktor,
                'promotor_pct' => round($promotorPct, 2),
                'passiver_pct' => round($passiverPct, 2),
                'detraktor_pct' => round($detraktorPct, 2),
                'nps' => round($nps, 2),
                'detail_nps' => $data['detail_nps'],
                'detail_survey' => $data['detail_survey'],
                'avg_warranty' => $avg_warranty,
                'warranty_count' => $data['warranty_count'],
                'pdi_count' => $data['pdi_count'],
                'detail_warranty' => $data['detail_warranty']
            ];
            
            $salesList[] = $salesItem;

            // Add to SPV Aggregate
            $spvTotal += $data['total'];
            $spvSurveyed += $surveyed_nps;
            $spvPromotor += $promotor;
            $spvPassiver += $passiver;
            $spvDetraktor += $detraktor;
            $spvWarrantyTotalDays += $data['warranty_total_days'];
            $spvWarrantyCount += $data['warranty_count'];
            $spvPdiCount += $data['pdi_count'];
            $spvDetailWarranty = array_merge($spvDetailWarranty, $data['detail_warranty']);
        }

        // Sort salesList by skor DESC
        usort($salesList, function($a, $b) {
            return $b['skor'] <=> $a['skor'];
        });

        // Calculate SPV Aggregate Stats
        $spvRatio = $spvTotal > 0 ? ($spvSurveyed / $spvTotal) * 100 : 0;
        $spvTotalNps = $spvPromotor + $spvPassiver + $spvDetraktor;
        $spvPromotorPct = $spvTotalNps > 0 ? ($spvPromotor / $spvTotalNps) * 100 : 0;
        $spvDetraktorPct = $spvTotalNps > 0 ? ($spvDetraktor / $spvTotalNps) * 100 : 0;
        $spvNps = $spvPromotorPct - $spvDetraktorPct;
        $spvNpsNormal = ($spvNps + 100) / 2;
        $spvSkor = ($spvRatio * 0.5) + ($spvNpsNormal * 0.5);

        $spvAvgWarranty = $spvWarrantyCount > 0 ? round($spvWarrantyTotalDays / $spvWarrantyCount, 1) : 0;

        $spvData[] = [
            'spv' => $spvName,
            'total' => $spvTotal,
            'surveyed' => $spvSurveyed,
            'ratio' => round($spvRatio, 2),
            'promotor' => $spvPromotor,
            'passiver' => $spvPassiver,
            'detraktor' => $spvDetraktor,
            'nps' => round($spvNps, 2),
            'skor' => round($spvSkor, 2),
            'avg_warranty' => $spvAvgWarranty,
            'warranty_count' => $spvWarrantyCount,
            'pdi_count' => $spvPdiCount,
            'detail_warranty' => $spvDetailWarranty,
            'sales_list' => $salesList
        ];
    }

    // Sort SPV list by skor DESC
    usort($spvData, function($a, $b) {
        return $b['skor'] <=> $a['skor'];
    });

    jsonResponse(true, 'Data berhasil diambil.', [
        'start_date' => $start_date,
        'end_date' => $end_date,
        'spv_data' => $spvData
    ]);

} else {
    jsonResponse(false, 'Method not allowed', null, 405);
}
