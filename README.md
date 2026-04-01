# Racha (Android nativo con Kotlin)

Proyecto Android nativo listo para abrir directamente con Android Studio.

## Requisitos

- Android Studio (Hedgehog o superior recomendado)
- JDK 17
- SDK Android instalado desde Android Studio
- Gradle local (solo para bootstrap inicial del wrapper en este repo)

## Importante sobre archivos binarios en este repo

Este repositorio **no versiona binarios** (por política de PR), por eso no incluye `gradle-wrapper.jar`.

Antes de compilar por terminal, ejecuta una sola vez:

```bash
./scripts_bootstrap_wrapper.sh
```

Esto genera `gradle/wrapper/gradle-wrapper.jar` localmente.

## Cómo abrir y correr en tu Android físico

1. Clona el repositorio.
2. Abre Android Studio y selecciona **Open** sobre esta carpeta (`Racha`).
3. Si Android Studio te pide regenerar wrapper, acepta.
4. Si prefieres terminal, corre `./scripts_bootstrap_wrapper.sh`.
5. Conecta tu teléfono con **Depuración USB** habilitada.
6. Pulsa **Run** ▶ y selecciona tu dispositivo.

## Ejecutar por terminal

```bash
./scripts_bootstrap_wrapper.sh
./gradlew assembleDebug
```

APK generado en:

`app/build/outputs/apk/debug/app-debug.apk`

## Icono

La app usa un icono adaptativo con una **flama** (`ic_launcher_foreground.xml`).
