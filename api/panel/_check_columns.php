<?php
require_once dirname(__DIR__) . '/config_legacy.php';
$conn = getLegacyDB();
$result = mysqli_query($conn, 'SHOW COLUMNS FROM surveyupdate_record');
while($row = mysqli_fetch_assoc($result)) {
    echo $row['Field'] . ' - ' . $row['Type'] . PHP_EOL;
}
mysqli_close($conn);
