import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime } from '@php-wasm/node';
import fs from 'fs';

async function main() {
  console.log('Loading PHP 8.2 WASM runtime...');
  const php = new PHP(await loadNodeRuntime('8.2'));
  
  console.log('PHP loaded, testing...');
  
  // Test phpinfo
  const result = await php.run({
    code: `<?php echo "PHP Version: " . phpversion() . "\\n"; echo "Extensions: " . implode(", ", get_loaded_extensions()) . "\\n"; ?>`
  });
  
  console.log('STDOUT:', result.text);
  console.log('STDERR:', result.errors);
  
  // Try to run artisan
  console.log('\\n--- Trying to run artisan via PHP WASM ---');
  const artisanCode = `
  <?php
  chdir('/home/user/JAWEBNI');
  echo "Current dir: " . getcwd() . "\\n";
  echo "Files: " . implode(", ", array_slice(scandir('.'), 0, 10)) . "\\n";
  // Try to include artisan
  if (file_exists('artisan')) {
    echo "artisan file exists\\n";
    echo file_get_contents('artisan', false, null, 0, 500) . "\\n";
  }
  ?>
  `;
  
  const artisanResult = await php.run({ code: artisanCode });
  console.log('Artisan check STDOUT:', artisanResult.text);
  console.log('Artisan check STDERR:', artisanResult.errors);
}

main().catch(console.error);
