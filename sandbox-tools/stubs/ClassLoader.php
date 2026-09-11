<?php

namespace Composer\Autoload;

/**
 * Minimal PSR-4 / PSR-0 / classmap autoloader compatible with Composer's public
 * API. Composer itself cannot be executed inside WebAssembly (it relies on
 * proc_open), so sandbox-tools/make-autoload.mjs generates the maps and this
 * class loads them.
 */
class ClassLoader
{
    /** @var array<string, list<string>> */
    private array $prefixDirsPsr4 = [];

    /** @var array<string, list<string>> */
    private array $prefixesPsr0 = [];

    /** @var array<string, string> */
    private array $classMap = [];

    private bool $classMapAuthoritative = false;

    private ?string $apcuPrefix = null;

    /** @var list<string> */
    private array $fallbackDirsPsr0 = [];

    public function getPrefixes(): array
    {
        return $this->prefixesPsr0;
    }

    public function getPrefixesPsr4(): array
    {
        return $this->prefixDirsPsr4;
    }

    public function getFallbackDirs(): array
    {
        return $this->fallbackDirsPsr0;
    }

    public function getClassMap(): array
    {
        return $this->classMap;
    }

    public function addClassMap(array $classMap): void
    {
        foreach ($classMap as $class => $path) {
            $this->classMap[$class] = $path;
        }
    }

    public function setClassMap(array $classMap): void
    {
        $this->classMap = $classMap;
    }

    /** PSR-0 */
    public function add(string $prefix, $paths, bool $prepend = false): void
    {
        $paths = (array) $paths;

        if ($prefix === '') {
            $this->fallbackDirsPsr0 = $prepend
                ? array_merge($paths, $this->fallbackDirsPsr0)
                : array_merge($this->fallbackDirsPsr0, $paths);
            return;
        }

        $this->prefixesPsr0[$prefix] = array_values(array_unique(array_merge(
            $paths,
            $this->prefixesPsr0[$prefix] ?? []
        )));
    }

    /** PSR-0 */
    public function set(string $prefix, $paths): void
    {
        $paths = (array) $paths;

        if ($prefix === '') {
            $this->fallbackDirsPsr0 = $paths;
            return;
        }

        $this->prefixesPsr0[$prefix] = $paths;
    }

    public function setPsr4(string $prefix, $paths): void
    {
        $this->prefixDirsPsr4[$prefix] = (array) $paths;
    }

    public function addPsr4(string $prefix, $paths, bool $prepend = false): void
    {
        $paths = (array) $paths;
        $existing = $this->prefixDirsPsr4[$prefix] ?? [];
        $this->prefixDirsPsr4[$prefix] = array_values(array_unique(
            $prepend ? array_merge($paths, $existing) : array_merge($existing, $paths)
        ));
    }

    public function setClassMapAuthoritative(bool $authoritative): void
    {
        $this->classMapAuthoritative = $authoritative;
    }

    public function isClassMapAuthoritative(): bool
    {
        return $this->classMapAuthoritative;
    }

    public function setApcuPrefix(?string $prefix): void
    {
        $this->apcuPrefix = $prefix;
    }

    public function getApcuPrefix(): ?string
    {
        return $this->apcuPrefix;
    }

    public function setUseIncludePath(bool $use): void
    {
        // No-op: include_path is irrelevant here.
    }

    public function getUseIncludePath(): bool
    {
        return false;
    }

    public function register(bool $prepend = false): void
    {
        spl_autoload_register([$this, 'loadClass'], true, $prepend);
    }

    public function unregister(): void
    {
        spl_autoload_unregister([$this, 'loadClass']);
    }

    public function loadClass(string $class): bool|string|null
    {
        $file = $this->findFile($class);

        if ($file !== null) {
            require_once $file;

            return true;
        }

        return null;
    }

    public function findFile(string $class): ?string
    {
        $class = ltrim($class, '\\');

        if (isset($this->classMap[$class])) {
            return $this->classMap[$class];
        }

        if ($this->classMapAuthoritative) {
            return null;
        }

        if ($file = $this->findFilePsr4($class)) {
            return $file;
        }

        return $this->findFilePsr0($class);
    }

    private function findFilePsr4(string $class): ?string
    {
        foreach ($this->prefixDirsPsr4 as $prefix => $dirs) {
            if ($prefix !== '' && ! str_starts_with($class, $prefix)) {
                continue;
            }

            $relative = substr($class, strlen($prefix));
            $relativeFile = str_replace('\\', DIRECTORY_SEPARATOR, $relative) . '.php';

            foreach ($dirs as $dir) {
                $file = rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . $relativeFile;
                if (is_file($file)) {
                    return $file;
                }
            }
        }

        return null;
    }

    private function findFilePsr0(string $class): ?string
    {
        $logicalPath = str_replace('\\', DIRECTORY_SEPARATOR, $class) . '.php';
        $logicalPathPsr0 = str_replace('_', DIRECTORY_SEPARATOR, $logicalPath);

        foreach ([$logicalPath, $logicalPathPsr0] as $path) {
            foreach ($this->prefixesPsr0 as $prefix => $dirs) {
                if ($prefix !== '' && ! str_starts_with($class, $prefix)) {
                    continue;
                }

                foreach ($dirs as $dir) {
                    if (is_file($file = rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . $path)) {
                        return $file;
                    }
                }
            }

            foreach ($this->fallbackDirsPsr0 as $dir) {
                if (is_file($file = rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . $path)) {
                    return $file;
                }
            }
        }

        return null;
    }
}
