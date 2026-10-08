# تشغيل JAWEBNI داخل بيئة مقيدة (WebAssembly PHP)

بعض بيئات التطوير (الساندبوكس) ما فيهاش PHP أصلي ولا Composer ولا وصول لـ Packagist.
باش نقدرو نشغّلو Laravel 12 فعلاً (ماشي mock)، كنستعملو PHP 8.3 مجمّع WebAssembly:

```
bash sandbox-tools/serve.sh
```

السكريبت كيدير كلشي:

1. `npm install` داخل `sandbox-tools` (تيجيب `@php-wasm/node` = PHP 8.3.33).
2. `node install-vendor.mjs` — كيقرا `composer.lock` وكيجرّد كل باكيج من
   `api.github.com/repos/<vendor>/<repo>/zipball/<sha>` داخل `vendor/`.
3. `node make-autoload.mjs` — كيولّد autoloader بلاصت `composer dump-autoload`
   (Composer كيستعمل `proc_open` اللي ما خدامش فـ WebAssembly).
4. `php artisan key:generate` + `migrate --seed`.
5. `npm install` + `npm run build` (Vite) للواجهة.
6. `node sandbox-tools/server.mjs` — سيرفور HTTP على `0.0.0.0:8000` كيمرر
   الطلبات لـ `public/index.php` داخل PHP.

## التفاصيل التقنية المهمة

| المشكل | الحل |
|---|---|
| `popen()/proc_open()` ممنوع فـ WebAssembly | `php.setSpawnHandler()` كيمرر الأوامر لـ `/bin/sh` (Symfony كيستعمل `stty` فقط لقياس الطرفية) |
| `SCRIPT_NAME === REQUEST_URI` → Laravel كيولّد `/login/login` | `sandbox-tools/router.php` كيصحّح `SCRIPT_NAME`/`PHP_SELF` لـ `/index.php` قبل ما يشغّل `public/index.php` |
| كوكي الجلسة ضاعت | `set-cookie` كيجي مصفوفة: خاصها تبقى headers منفاصلين، ماشي مدموجين بـ `,` |
| `$argv` و `STDOUT` ما كاينينش (SAPI = `wasm`) | `sandbox-tools/php-cli.php` كيعرّفهم وكياخد الهدف من `JAWEBNI_CLI_TARGET` |

## الحسابات بعد `migrate --seed`

| البريد | كلمة المرور | الدور |
|---|---|---|
| `said@jawebni.ma` | `password123` | مشرف عام (super admin) على `artisanat-marocain` |
| `sara@jawebni.ma` | `password123` | وكيل |
| `mariam@jnane.ma` | `password123` | مالك tenant ثاني (`jnane-marrakech`) |

مرجع أداء معلق للمراجعة: `JW-CAFTAN99` (499 MAD).

## أوامر مفيدة

```bash
node sandbox-tools/run.mjs artisan --version
node sandbox-tools/run.mjs artisan migrate:fresh --force --seed
node sandbox-tools/run.mjs artisan queue:work --stop-when-empty
```

> ملاحظة: `sandbox-tools/` و `vendor/` و `public/build/` محطوطين فـ `.gitignore`،
> يعني خاص تعاود `bootstrap.sh` من بعد كل clone جديد.
