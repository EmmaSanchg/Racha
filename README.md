# Racha de Objetivos (Android nativo)

Aplicación minimalista para seguimiento de rachas por objetivo.

## Qué permite hacer

- Definir objetivos.
- Elegir icono (emoji) y color por objetivo.
- Configurar recordatorio diario por objetivo (hora/minuto).
- Marcar el avance del día para mantener la racha.
- Pausar un objetivo (estado opaco con ícono de hielo).
- Ver detalle del objetivo seleccionado: racha actual y mejor racha.
- Visualizar actividad en una grilla tipo contribuciones (estilo GitHub).
- Añadir widget de lista en pantalla de inicio con objetivo + días actuales.

## Nombre

- Nombre interno de la app: **Racha de Objetivos**.
- Nombre mostrado en launcher/menú: **Racha**.

## Requisitos

- Android Studio
- JDK 17
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

1. Abre el proyecto en Android Studio.
2. Sincroniza Gradle.
3. Ejecuta en dispositivo físico con depuración USB.

## Widget

Mantén presionada la pantalla de inicio → Widgets → selecciona **Racha**.
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
