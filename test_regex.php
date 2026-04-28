<?php
$lines = [
    "ALEXANDRE JUSTIN REPIA\t2026-04-28 10:46:00\tFingerprint\tCheck In",
    "ALEXANDRE JUSTIN REPIA\t2026-04-28 10:46:50\tFace\t",
    "ALEXANDRE JUSTIN REPIA\t2026-04-28 10:46:56\tFace\tCheck In",
    "ALEXANDRE JUSTIN REPIA\t4/28/2026 10:48 AM\tFingerprint\t",
    "\t2026-04-28 10:52:20\tFingerprint\t",
    "ALEXANDRE JUSTIN REPIA\t4/28/2026 10:52 PM\tFingerprint\tCheck Out"
];

foreach ($lines as $line) {
    if (!preg_match('/^(.*?)\s+((?:\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{1,2}-\d{1,2})\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i', $line, $mLine)) {
        echo 'INVALID: ' . $line . "\n";
        continue;
    }
    
    $afterDate = substr($line, strlen($mLine[0]));
    if (!preg_match('/(check\s*in|check\s*out|break\s*in|break\s*out|c\/in|c\/out|\bin\b|\bout\b)/i', $afterDate)) {
        echo 'SKIPPED NO STATUS: ' . $line . "\n";
        continue;
    }
    
    echo 'VALID: ' . $line . "\n";
}
