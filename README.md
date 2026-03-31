# Racha (React Native + Expo)

Aplicación Android hecha con React Native y Expo para gestionar hábitos con rachas.

## Funcionalidades

- Crear hábitos con **nombre, color e icono**.
- Marcar hábito completado por día.
- Cálculo de **racha activa** y **mejor racha**.
- Recordatorios diarios configurables por hábito (hora HH:MM) usando notificaciones locales.
- Vista gráfica de cumplimiento de últimos 84 días estilo grilla tipo GitHub.
- Vista resumida para widget (lista de hábitos + días en racha).

## Ejecutar

```bash
npm install
npm run android
```

## Nota sobre widget Android

El widget nativo de Android no está disponible en **Expo Go** puro; para widget real se requiere **Expo Dev Build / prebuild** con módulos nativos.
Esta entrega incluye la vista/estructura de datos para el widget dentro de la app para que el comportamiento de negocio esté listo.
