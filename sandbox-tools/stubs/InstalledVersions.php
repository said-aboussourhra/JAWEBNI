<?php

namespace Composer;

/**
 * Minimal replacement for Composer's generated Composer\InstalledVersions.
 * Reads the installed.php map produced by sandbox-tools/make-autoload.mjs.
 */
class InstalledVersions
{
    private static ?array $installed = null;

    private static function data(): array
    {
        if (self::$installed === null) {
            self::$installed = require __DIR__ . '/installed.php';
        }

        return self::$installed;
    }

    public static function reload(array $data): void
    {
        self::$installed = $data;
    }

    public static function getRawData(): array
    {
        return self::data();
    }

    public static function getAllRawData(): array
    {
        return [self::data()];
    }

    public static function getInstalledPackages(): array
    {
        return array_keys(self::data()['versions'] ?? []);
    }

    public static function getInstalledPackagesByType(string $type): array
    {
        $packages = [];

        foreach (self::data()['versions'] ?? [] as $name => $package) {
            if (($package['type'] ?? 'library') === $type) {
                $packages[] = $name;
            }
        }

        return $packages;
    }

    public static function isInstalled(string $packageName, bool $includeDevRequirements = true): bool
    {
        foreach (self::data()['versions'] ?? [] as $name => $package) {
            if (strcasecmp($name, $packageName) === 0) {
                return $includeDevRequirements || empty($package['dev_requirement']);
            }
        }

        return false;
    }

    public static function getVersion(string $packageName): ?string
    {
        foreach (self::data()['versions'] ?? [] as $name => $package) {
            if (strcasecmp($name, $packageName) === 0) {
                return $package['version'] ?? null;
            }
        }

        return null;
    }

    public static function getVersionRanges(string $packageName): string
    {
        return '[]';
    }

    public static function getPrettyVersion(string $packageName): ?string
    {
        foreach (self::data()['versions'] ?? [] as $name => $package) {
            if (strcasecmp($name, $packageName) === 0) {
                return $package['pretty_version'] ?? null;
            }
        }

        return null;
    }

    public static function getInstalledVersion(string $packageName, bool $includeDevRequirements = true): ?string
    {
        foreach (self::data()['versions'] ?? [] as $name => $package) {
            if (strcasecmp($name, $packageName) === 0) {
                if (! $includeDevRequirements && ! empty($package['dev_requirement'])) {
                    return null;
                }

                return $package['pretty_version'] ?? null;
            }
        }

        return null;
    }

    public static function getReference(string $packageName): ?string
    {
        foreach (self::data()['versions'] ?? [] as $name => $package) {
            if (strcasecmp($name, $packageName) === 0) {
                return $package['reference'] ?? null;
            }
        }

        return null;
    }

    public static function getInstallPath(string $packageName): ?string
    {
        foreach (self::getAllRawData() as $data) {
            foreach ($data['versions'] ?? [] as $name => $package) {
                if (strcasecmp($name, $packageName) !== 0) {
                    continue;
                }

                return str_replace(
                    ['$vendorDir', '$baseDir'],
                    [dirname(__DIR__), dirname(dirname(__DIR__))],
                    (string) ($package['install_path'] ?? '')
                );
            }
        }

        return null;
    }

    public static function getRootPackage(): array
    {
        return self::data()['root'] ?? [];
    }

    public static function satisfies(\Composer\Semver\VersionParser $parser, string $packageName, ?string $constraint): bool
    {
        if ($constraint === null) {
            return true;
        }

        $version = self::getVersion($packageName);

        if ($version === null) {
            return false;
        }

        try {
            return $parser->parseConstraints($constraint)->matches(
                $parser->parseConstraints($version)
            );
        } catch (\Throwable) {
            return false;
        }
    }
}
