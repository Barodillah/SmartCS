<?php
require_once '../config.php';
require_once '../config_legacy.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $bulan = $_GET['bulan'] ?? date('Y-m'); // e.g. 2026-05

    // Parse bulan into Y-m-d start and end
    list($tahun, $bln) = explode('-', $bulan);
    $tanggal_awal = date('Y-m-d', strtotime("$tahun-$bln-01"));
    $tanggal_akhir = date('Y-m-t', strtotime("$tahun-$bln-01"));

    $conn = getLegacyDB();
    $pdo = getDB();

    if (!$conn || !$pdo) {
        jsonResponse(false, 'Database connection failed', null, 500);
    }

    // Ambil data dari surveyupdate berdasarkan wa_date
    $query = "SELECT * FROM surveyupdate WHERE status != 'PDI' AND wa_date BETWEEN '$tanggal_awal' AND '$tanggal_akhir'";
    $result = mysqli_query($conn, $query);
    if (!$result) {
        jsonResponse(false, 'Legacy DB Query Error: ' . mysqli_error($conn), null, 500);
    }

    $rekapSales = [];
    
    // Status yang dianggap belum tersurvey
    $unsurveyed_statuses = ['PERLU FOLLOW UP', 'TIDAK DIANGKAT', 'NOMOR SALAH', 'SALAH SAMBUNG', 'PERJANJIAN', 'DITOLAK/REJECT', 'SURVEY_WA'];

    // Ambil nps_data dari smartcs DB untuk matching NPS
    $stmt = $pdo->prepare("SELECT rangka, score, note FROM nps_data");
    $stmt->execute();
    $npsDataRaw = $stmt->fetchAll();
    
    $npsMapByRangka = [];
    foreach ($npsDataRaw as $row) {
        $score = (int)$row['score'];
        $status_nps = 'detractor';
        if ($score >= 9) {
            $status_nps = 'promotor';
        } elseif ($score >= 7) {
            $status_nps = 'passive';
        }
        $npsMapByRangka[$row['rangka']] = [
            'score' => $score,
            'status_nps' => $status_nps,
            'note' => $row['note']
        ];
    }

    $unit_ids = [];
    $salesByUnit = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $id_cust = $row['id'];
        $sales = $row['sales'] ?: 'Unknown';
        
        $unit_ids[] = $id_cust;
        $salesByUnit[$id_cust] = $sales;

        if (!isset($rekapSales[$sales])) {
            $rekapSales[$sales] = [
                'total' => 0,
                'surveyed' => 0,
                'unsurveyed' => 0,
                'promotor' => 0,
                'passiver' => 0,
                'detraktor' => 0,
                'invalid_numbers' => 0,
                'detail_nps' => [],
                'detail_survey' => [],
                'spv' => $row['spv'] ?? ''
            ];
        }

        $rekapSales[$sales]['total']++;

        $status = strtoupper($row['status']);
        $isSurveyed = false;
        $survey_status_label = 'Sudah';
        
        if (in_array($status, $unsurveyed_statuses) || empty($status)) {
            $rekapSales[$sales]['unsurveyed']++;
            $survey_status_label = 'Belum';
        } else {
            $isSurveyed = true;
            $rekapSales[$sales]['surveyed']++;
        }

        $rekapSales[$sales]['detail_survey'][] = [
            'nama' => $row['nama'] ?? 'Unknown',
            'kendaraan' => $row['kendaraan'] ?? 'Unknown',
            'rangka' => $row['rangka'] ?? '',
            'status_survey' => $survey_status_label,
            'status_detail' => $status ?: 'BLANK'
        ];

        if (in_array($status, ['NOMOR SALAH', 'SALAH SAMBUNG', 'DITOLAK/REJECT'])) {
            $rekapSales[$sales]['invalid_numbers']++;
        }

        if ($isSurveyed) {
            $rangka = $row['rangka'];
            $npsScoreStr = null;
            
            // Check NPS by Rangka from nps_data map
            if (isset($npsMapByRangka[$rangka]) && !empty($npsMapByRangka[$rangka]['status_nps'])) {
                $npsScoreStr = strtolower($npsMapByRangka[$rangka]['status_nps']);
            } else {
                // Jika tidak ada di nps_data, fallback check legacy surveyhasil
                $hasilQuery = mysqli_query($conn, "SELECT nilai FROM surveyhasil WHERE cust_id = $id_cust");
                $hasilnps = mysqli_fetch_assoc($hasilQuery);
                if ($hasilnps) {
                    $nilai = (int)$hasilnps['nilai'];
                    if ($nilai >= 9 && $nilai <= 10) {
                        $npsScoreStr = 'promotor';
                    } elseif ($nilai >= 7 && $nilai <= 8) {
                        $npsScoreStr = 'passive';
                    } elseif ($nilai >= 0 && $nilai <= 6) {
                        $npsScoreStr = 'detractor';
                    }
                }
            }

            // Jika masih kosong, coba dari field est di surveyupdate
            if (!$npsScoreStr && !empty($row['est'])) {
                $nilai = (int)$row['est'];
                if ($nilai >= 9 && $nilai <= 10) {
                    $npsScoreStr = 'promotor';
                } elseif ($nilai >= 7 && $nilai <= 8) {
                    $npsScoreStr = 'passive';
                } elseif ($nilai >= 0 && $nilai <= 6) {
                    $npsScoreStr = 'detractor';
                }
            }

            if ($npsScoreStr === 'promotor') {
                $rekapSales[$sales]['promotor']++;
            } else if ($npsScoreStr === 'passive') {
                $rekapSales[$sales]['passiver']++;
            } else if ($npsScoreStr === 'detractor' || $npsScoreStr === 'detraktor') {
                $rekapSales[$sales]['detraktor']++;
            }

            if ($npsScoreStr) {
                $actual_score = null;
                $actual_note = null;
                if (isset($npsMapByRangka[$rangka])) {
                    $actual_score = $npsMapByRangka[$rangka]['score'];
                    $actual_note = $npsMapByRangka[$rangka]['note'];
                } elseif (isset($nilai)) {
                    $actual_score = $nilai;
                }

                if (empty($actual_note)) {
                    $actual_note = $row['note'] ?? '';
                }
                
                $rekapSales[$sales]['detail_nps'][] = [
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

    // --- STAFF PERFORMA LOGIC ---
    $performaData = [];
    foreach ($rekapSales as $sales => $data) {
        $performaData[$sales] = [
            'sales' => $sales,
            'total_konsumen' => $data['total'],
            'invalid_numbers' => $data['invalid_numbers'],
            'total_logs' => 0,
            'pkt_yes' => 0,
            'pkt_no' => 0,
            'komplen' => $data['detraktor'],
        ];
    }

    if (!empty($unit_ids)) {
        $idsStr = implode(',', $unit_ids);
        $recordQuery = "SELECT * FROM surveyupdate_record WHERE unit_id IN ($idsStr) ORDER BY time ASC";
        $recordResult = mysqli_query($conn, $recordQuery);
        
        $finalPktByUnit = [];
        
        while ($rec = mysqli_fetch_assoc($recordResult)) {
            $unit = $rec['unit_id'];
            $sales = $salesByUnit[$unit];
            $pkt = $rec['pkt'];
            
            $performaData[$sales]['total_logs']++;
            
            if ($pkt === 'Yes' || $pkt === 'No') {
                $finalPktByUnit[$unit] = $pkt;
            }
        }

        foreach ($finalPktByUnit as $unit => $pkt) {
            $sales = $salesByUnit[$unit];
            if ($pkt === 'Yes') {
                $performaData[$sales]['pkt_yes']++;
            } else if ($pkt === 'No') {
                $performaData[$sales]['pkt_no']++;
            }
        }
    }

    $rankingPerforma = [];
    foreach ($performaData as $sales => $p) {
        $valid_rate = $p['total_konsumen'] > 0 ? (($p['total_konsumen'] - $p['invalid_numbers']) / $p['total_konsumen']) * 100 : 0;
        $avg_attempts = $p['total_konsumen'] > 0 ? $p['total_logs'] / $p['total_konsumen'] : 0;
        $total_pkt = $p['pkt_yes'] + $p['pkt_no'];
        $pkt_compliance = $total_pkt > 0 ? ($p['pkt_yes'] / $total_pkt) * 100 : 0;
        $komplen_rate = $p['total_konsumen'] > 0 ? ($p['komplen'] / $p['total_konsumen']) * 100 : 0;

        // Performa Skor: Valid Rate (40%) + PKT Compliance (40%) - Komplen Rate (20%)
        // Jika avg_attempts sangat tinggi (misal > 3), bisa menjadi penalti tapi untuk saat ini skor sederhana
        $performa_score = ($valid_rate * 0.4) + ($pkt_compliance * 0.4) - ($komplen_rate * 0.2);

        $rankingPerforma[] = [
            'sales' => $sales,
            'total_konsumen' => $p['total_konsumen'],
            'invalid_numbers' => $p['invalid_numbers'],
            'total_logs' => $p['total_logs'],
            'valid_rate' => round($valid_rate, 1),
            'avg_attempts' => round($avg_attempts, 1),
            'pkt_yes' => $p['pkt_yes'],
            'pkt_no' => $p['pkt_no'],
            'pkt_compliance' => round($pkt_compliance, 1),
            'komplen' => $p['komplen'],
            'komplen_rate' => round($komplen_rate, 1),
            'performa_score' => round($performa_score, 2)
        ];
    }

    // Sort Performa by Performa Score DESC
    usort($rankingPerforma, function($a, $b) {
        return $b['performa_score'] <=> $a['performa_score'];
    });

    $rankingQualified = [];
    $rankingNonQualified = [];

    foreach ($rekapSales as $sales => $data) {
        $ratio = $data['total'] > 0 ? ($data['surveyed'] / $data['total']) * 100 : 0;
        
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
        
        $item = [
            'sales' => $sales,
            'spv' => $data['spv'] ?? '',
            'total' => $data['total'],
            'surveyed' => $data['surveyed'],
            'unsurveyed' => $data['unsurveyed'],
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
            'detail_survey' => $data['detail_survey']
        ];
        
        if ($data['total'] >= 2) {
            $rankingQualified[] = $item;
        } else {
            $rankingNonQualified[] = $item;
        }
    }

    // Sort descending by skor
    usort($rankingQualified, function($a, $b) {
        return $b['skor'] <=> $a['skor'];
    });
    
    usort($rankingNonQualified, function($a, $b) {
        return $b['skor'] <=> $a['skor'];
    });

    // --- CS FOLLOW UP LOGIC ---
    $csFollowUpData = [
        'total_data' => 0,
        'hari_kerja_efektif' => 0,
        'total_hari_kerja' => 0,
        'avg_follow_up_per_hari' => 0,
        'avg_response_time' => 0,
        'skor_produktivitas' => 'Rendah',
        'kontak_efektif' => 0,
        'kontak_gagal' => 0,
        'kontak_efektif_pct' => 0,
        'pola_harian' => [
            'Senin' => 0, 'Selasa' => 0, 'Rabu' => 0, 'Kamis' => 0, 'Jumat' => 0, 'Sabtu' => 0, 'Minggu' => 0
        ],
        'trend_harian' => []
    ];

    $daysMap = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'];

    $total_hari_kerja = 0;
    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $bln, $tahun);
    for ($i = 1; $i <= $daysInMonth; $i++) {
        $dayOfWeek = date('N', strtotime("$tahun-$bln-$i"));
        if ($dayOfWeek <= 5) {
            $total_hari_kerja++;
        }
    }
    $csFollowUpData['total_hari_kerja'] = $total_hari_kerja;

    $success_statuses = ['PUAS', 'BIASA SAJA', 'SARAN', 'TIDAK PUAS', 'KOMPLEN', 'PROMOTOR', 'PASSIVE', 'DETRACTOR', 'SURVEYED', 'PERJANJIAN'];

    $csQuery = "
        SELECT r.id, r.time, r.status, s.pdi_date
        FROM surveyupdate_record r
        JOIN surveyupdate s ON r.unit_id = s.id
        WHERE DATE(r.time) BETWEEN '$tanggal_awal' AND '$tanggal_akhir'
    ";
    
    $csResult = mysqli_query($conn, $csQuery);
    
    $unique_dates = [];
    $total_response_time = 0;
    $count_response_time = 0;

    if ($csResult) {
        while ($rec = mysqli_fetch_assoc($csResult)) {
            $csFollowUpData['total_data']++;
            
            $logTime = $rec['time'];
            if (!$logTime || $logTime === '0000-00-00 00:00:00') continue;
            
            $logDate = date('Y-m-d', strtotime($logTime));
            $dayOfWeek = date('N', strtotime($logTime));
            
            if (isset($daysMap[$dayOfWeek])) {
                $csFollowUpData['pola_harian'][$daysMap[$dayOfWeek]]++;
            }
            
            if (!isset($csFollowUpData['trend_harian'][$logDate])) {
                $csFollowUpData['trend_harian'][$logDate] = 0;
            }
            $csFollowUpData['trend_harian'][$logDate]++;
            
            if ($dayOfWeek <= 5) {
                $unique_dates[$logDate] = true;
            }
            
            $status = strtoupper($rec['status']);
            
            if (in_array($status, ['TIDAK DIANGKAT', 'NOMOR SALAH', 'DITOLAK/REJECT', 'SALAH SAMBUNG'])) {
                $csFollowUpData['kontak_gagal']++;
            } else {
                $csFollowUpData['kontak_efektif']++;
                
                if (in_array($status, $success_statuses) && !empty($rec['pdi_date']) && $rec['pdi_date'] !== '0000-00-00') {
                    try {
                        $pdiDate = new DateTime($rec['pdi_date']);
                        $logDateTime = new DateTime($logTime);
                        $diff = $pdiDate->diff($logDateTime);
                        $daysDiff = $diff->days;
                        if ($logDateTime < $pdiDate) {
                            $daysDiff = 0; 
                        }
                        $total_response_time += $daysDiff;
                        $count_response_time++;
                    } catch (Exception $e) {}
                }
            }
        }
    }

    $csFollowUpData['hari_kerja_efektif'] = count($unique_dates);
    
    if ($csFollowUpData['hari_kerja_efektif'] > 0) {
        $csFollowUpData['avg_follow_up_per_hari'] = round($csFollowUpData['total_data'] / $csFollowUpData['hari_kerja_efektif'], 1);
    }
    
    if ($count_response_time > 0) {
        $csFollowUpData['avg_response_time'] = round($total_response_time / $count_response_time, 1);
    }
    
    if ($csFollowUpData['avg_follow_up_per_hari'] >= 15 && $csFollowUpData['avg_response_time'] <= 7) {
        $csFollowUpData['skor_produktivitas'] = 'Tinggi';
    } elseif ($csFollowUpData['avg_follow_up_per_hari'] >= 10 && $csFollowUpData['avg_response_time'] <= 14) {
        $csFollowUpData['skor_produktivitas'] = 'Sedang';
    } else {
        $csFollowUpData['skor_produktivitas'] = 'Rendah';
    }
    
    $total_contact = $csFollowUpData['kontak_efektif'] + $csFollowUpData['kontak_gagal'];
    $csFollowUpData['kontak_efektif_pct'] = $total_contact > 0 ? round(($csFollowUpData['kontak_efektif'] / $total_contact) * 100, 1) : 0;

    jsonResponse(true, 'Data berhasil diambil.', [
        'debug' => [
            'bulan' => $bulan,
            'tanggal_awal' => $tanggal_awal,
            'tanggal_akhir' => $tanggal_akhir,
            'query' => $query,
            'raw_count' => mysqli_num_rows($result),
            'rekap_keys' => array_keys($rekapSales)
        ],
        'qualified' => $rankingQualified,
        'non_qualified' => $rankingNonQualified,
        'performa' => $rankingPerforma,
        'cs_performa' => $csFollowUpData
    ]);
} else {
    jsonResponse(false, 'Method not allowed', null, 405);
}
