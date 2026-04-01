#!/usr/bin/env bash
set -euo pipefail

if ! command -v gradle >/dev/null 2>&1; then
  echo "Error: gradle no está instalado en el sistema." >&2
  echo "Instala Gradle o abre el proyecto en Android Studio para que regenere el wrapper." >&2
  exit 1
fi

tmp_dir="$(mktemp -d)"
cleanup() { rm -rf "$tmp_dir"; }
trap cleanup EXIT

cat > "$tmp_dir/build.gradle" <<'GRADLE'
// bootstrap wrapper file
GRADLE

(
  cd "$tmp_dir"
  gradle wrapper --gradle-version 8.7 --no-validate-url --no-daemon
)

mkdir -p gradle/wrapper
cp "$tmp_dir/gradle/wrapper/gradle-wrapper.jar" gradle/wrapper/gradle-wrapper.jar

cat > gradle/wrapper/gradle-wrapper.properties <<'PROPS'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.7-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
PROPS

echo "Wrapper generado en gradle/wrapper/gradle-wrapper.jar"
