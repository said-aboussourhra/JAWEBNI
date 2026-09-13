<?php
require '/jawebni/vendor/autoload.php';
$src = file_get_contents('/jawebni/vendor/phpunit/phpunit/src/Event/Facade.php');
preg_match('/\$defaultEvents\s*=\s*\[(.*?)\n\s*\];/s', $src, $m) || exit("list not found\n");
preg_match_all('/([A-Za-z][\w\\\\]*)::class/', $m[1], $mm);
$missing = [];
foreach (array_unique($mm[1]) as $short) {
    $fqcn = 'PHPUnit\\Event\\' . $short;
    if (! class_exists($fqcn)) $missing[] = "[class] $fqcn";
    if (! interface_exists($fqcn . 'Subscriber')) $missing[] = "[iface] {$fqcn}Subscriber";
}
echo 'total events: ' . count(array_unique($mm[1])) . PHP_EOL;
echo 'missing: ' . count($missing) . PHP_EOL;
foreach (array_slice($missing, 0, 15) as $x) echo " - $x" . PHP_EOL;
