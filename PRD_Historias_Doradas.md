# Product Requirements Document (PRD): Historias Doradas

## 1. Resumen Ejecutivo
Historias Doradas es una plataforma de intimidad narrativa y monetización de contenido con enfoque "Audio-First". Diseñada específicamente para creadores adultos mayores, les permite compartir su legado, historias de vida, y contenido exclusivo a través de audios, fotos y videos. El modelo de negocio se basa en suscripciones, mensajes Pay-Per-View (PPV), contenido bloqueado y propinas, con un esquema de ingresos 80% (creador) / 20% (plataforma). El diseño y la experiencia de usuario (UX) están adaptados a las necesidades de la tercera edad, priorizando simplicidad, botones grandes, alto contraste y flujos extremadamente guiados.

## 2. Objetivo General y Visión
**Visión:** Convertirse en la plataforma líder mundial para que los adultos mayores preserven y compartan su legado, historias y sabiduría de forma íntima, mientras generan ingresos a través de una audiencia cautiva y respetuosa.

**Objetivo General:** Desarrollar un Producto Mínimo Viable (MVP) robusto y altamente accesible, usando React + TypeScript y Supabase, que valide el interés del mercado mediante un sistema de publicación de audios (Smart Teaser), suscripciones y monetización directa.

## 3. Público Objetivo
*   **Creadores (Adultos Mayores - 60+ años):** Buscan un espacio seguro y fácil de usar para contar sus historias. No son nativos digitales avanzados. Requieren herramientas libres de fricción, como un grabador de voz de un solo botón.
*   **Fans o Seguidores (Público General):** Personas interesadas en escuchar anécdotas, historia oral, consejos de vida o intimidad narrativa. Están dispuestos a apoyar a los creadores económicamente a cambio de contenido auténtico, exclusivo y sin publicidad.

## 4. Funcionalidades Principales del MVP
*   **Audio-First Feed:** Timeline principal priorizando historias en audio con reproductor visual (Waveform).
*   **Smart Teaser (Audio PPV):** Reproducción de los primeros 15-30 segundos de un audio de forma gratuita; tras esto, se solicita un pago o suscripción para continuar ("Para escuchar el resto de esta historia, apoya al creador con [precio]").
*   **Creador de Contenido Ultra-Simple:** Botón gigante de micrófono, grabación, adición de título/descripción y selección de visibilidad (Gratis, Suscriptores, PPV).
*   **Monetización Core:** Suscripciones mensuales, compra de mensajes/audios individuales (PPV) y sistema de propinas en posts.
*   **Diseño Accesible (The Heritage Editorial):** Implementación del sistema de diseño "Historias Doradas" (Modo Claro, alto contraste, botones oversized, tipografías Newsreader e Inter, sin bordes agresivos).

## 5. Módulos del Sistema
1.  **Autenticación y Registro:** Login sin contraseñas (Magic Link / OTP SMS) o OAuth (Google) para facilitar acceso a creadores.
2.  **Perfil de Creador:** Biografía, fotos destacadas, niveles de suscripción, feed público/privado.
3.  **Feed de Contenido:** Algoritmo cronológico o de destacados, filtrado por tipo de medio.
4.  **Grabación de Audio:** Interfaz de grabadora de voz nativa del navegador, optimizada y de un solo toque.
5.  **Reproductor de Audio con Waveform:** Generación de forma de onda visualizando la pista de audio.
6.  **Background Play:** Capacidad de seguir escuchando el audio mientras se navega por otras pantallas de la app.
7.  **Paywall para Audio:** Bloqueo automatizado de la pista de audio y del waveform después del límite del *Smart Teaser*.
8.  **Mensajes PPV / Chat:** Mensajería directa entre fan y creador donde el creador puede enviar audios, fotos o videos bloqueados por un precio.
9.  **Propinas:** Botón de "Dejar propina" integrado en el reproductor de audio o el perfil.
10. **Suscripciones:** Gestión de membresías (Stripe Billing recomendado bajo el capó).
11. **Dashboard de Ganancias:** Panel ultra-simplificado para creadores (Disponible, En Espera, Total ganado).
12. **Verificación KYC Asistida:** Proceso guiado para la verificación de identidad y configuración bancaria para retiros.

## 6. Flujos Completos de Usuario
*   **Registro de Creador:** Landing Page -> Click "Conviértete en Creador" -> Login con Teléfono/Email -> Onboarding asistido (Paso 1: Foto, Paso 2: Biografía Corta, Paso 3: Tarifa de suscripción).
*   **Subida/Verificación de Identidad (KYC):** Dashboard -> "Verificar Cuenta" -> Subir ID o selfie -> Validación de identidad manual/automática.
*   **Grabación y Publicación de Audio:** Botón inferior gigante de "Micrófono" -> Iniciar grabación -> Detener -> Escuchar vista previa -> Ingresar título -> Elegir visibilidad (Gratis/Suscripción/PPV Precio) -> Publicar.
*   **Envío de Contenido PPV:** Abrir chat con Fan -> Botón "Adjuntar o Grabar" -> Fijar Precio -> Enviar (El fan recibe una burbuja de mensaje bloqueada).
*   **Compra de Contenido por Fan:** Fan explora feed -> Encuentra audio PPV -> Escucha *Smart Teaser* de 15 a 30 segundos -> Audio se pausa y muestra overlay de pago -> Click "Desbloquear por $X" -> Pasarela de pago -> Audio se reanuda automáticamente.
*   **Retiro de Ganancias:** Dashboard de Ganancias -> "Retirar fondos" -> Confirmar cuenta bancaria conectada -> Mostrar estado "En proceso".

## 7. Requisitos Funcionales Detallados
*   **F01:** El sistema debe usar la MediaRecorder API y Web Audio API para capturar la voz y subirla a Supabase Storage.
*   **F02:** El *Smart Teaser* debe requerir que desde backend/Edge Functions se expida un archivo/clip recortado o se valide firmemente mediante RLS el tiempo de escucha. Para evitar fugas (descargas por usuarios técnicos), el archivo fuente solo será accesible tras validar la compra.
*   **F03:** La plataforma debe integrarse con una pasarela de pago (ej. Stripe Connect) para enrutar el 80% al creador y el 20% a la plataforma.
*   **F04:** El reproductor debe tener estado global (Context API/Zustand) para mantenerse persistente al cambiar de rutas (SPA background play).
*   **F05:** El creador debe poder grabar usando comandos de voz básicos si el navegador lo soporta (opcional, Web Speech API).

## 8. Requisitos No Funcionales
*   **Seguridad:** Cumplimiento de normativas de privacidad. Autenticación robusta y almacenamiento encriptado de material KYC (fotos, identidades).
*   **Accesibilidad (WCAG 2.1 AA):** Navegabilidad sencilla, soporte a lectores de pantalla (Screen readers).
*   **Usabilidad para Adultos Mayores:**
    *   **Alto Contraste:** Sistema visual The Heritage Editorial (Cream y Deep Navy, Contraste 7:1 mínimo).
    *   **Botones Grandes:** `min-height` y objetivos táctiles (touch targets) enormes (al menos 56x56px).
    *   **Pocas Opciones por Pantalla:** Flujos fraccionados, limpios y lineales. Textos sin jerga, claros y directos.
    *   **Comandos de voz:** Soporte accesible futuro para ejecutar grabaciones e inicio de sesión.
*   **Rendimiento:** Carga inicial en <2.5 segundos. Pre-fetch y lazy loading del audio.
*   **Protección de Contenido:** Prevenir la descarga fácil del audio (deshabilitar click derecho, URLs firmadas que expiran pronto en Supabase).

## 9. Modelo de Datos Recomendado para Supabase (PostgreSQL)
*   `users`: (auth_id PK, email, phone, role [creator, fan], created_at)
*   `creators`: (user_id PK, bio, profile_image_url, monthly_price, kyc_status)
*   `fans`: (user_id PK, display_name)
*   `posts`: (id, creator_id, title, description, media_type [audio, photo, video], media_url, teaser_url, price, is_ppv, is_sub_only, created_at)
*   `audio_files`: (id, post_id, full_audio_url, teaser_url, duration_sec, waveform_data JSON)
*   `subscriptions`: (id, fan_id, creator_id, status [active, canceled], current_period_end)
*   `ppv_messages`: (id, sender_id, receiver_id, media_url, content_text, price, is_unlocked)
*   `purchases`: (id, fan_id, item_type [post, message], item_id, amount_paid, created_at)
*   `tips`: (id, fan_id, creator_id, amount, post_id, message, created_at)
*   `earnings`: (id, creator_id, total_amount, platform_fee, net_amount, status [pending, available, withdrawn])
*   `withdrawals`: (id, creator_id, amount, status, payout_method, processed_at)
*   `kyc_verifications`: (id, creator_id, document_url, status)

## 10. Políticas de Seguridad con Supabase RLS (Row Level Security)
*   **Posts:** Público para metadatos (título, precio). El contenido multimedia bloqueado restringe acceso si no es suscriptor o no ha comprado.
*   **Audio/Storage Buckets:** Buckets privados. Acceso a las URLs del audio gestionado mediante Supabase Edge Functions, devolviendo URLs firmadas temporales:
    *   Gratis/Teaser: URL temporal de 5 minutos generada sin validación profunda.
    *   PPV completo: Solo se genera URL si en `purchases` existe registro para `fan_id = auth.uid()` y el `item_id`.
*   **Mensajes Privados:** RLS solo permite `SELECT` si `sender_id = auth.uid() OR receiver_id = auth.uid()`.
*   **Dashboard y Finanzas:** Acceso total y exclusivo al usuario cuyo `user_id = auth.uid()`. No público.

## 11. Estructura Recomendada del Proyecto en React + TypeScript
Uso sugerido de **Vite** para construir una Single Page Application, permitiendo el *Background Play* del audio fácilmente.
```text
src/
├── app/ o pages/          # Vistas: /feed, /creator/:id, /studio, /earnings
├── components/
│   ├── core/              # DS Heritage Editorial: Buttons (oversized), Cards (no borders)
│   ├── audio/             # GlobalAudioPlayer, WaveformVisualizer, SmartTeaserOverlay
│   ├── creator/           # GiantRecordButton, DashboardKpis
│   └── layout/            # BaseLayout, BottomTabBar
├── contexts/              # GlobalAudioContext, AuthContext
├── hooks/                 # useAudioRecorder, useSupabase, usePayment
├── services/              # Inicialización de Supabase client
├── types/                 # Interfaces TypeScript globales
├── utils/                 # Formatters (moneda, fechas), y Audio processors
└── styles/                # Tailwind o CSS modules globales con colores de The Heritage
```

## 12. Componentes Principales del Frontend
1.  **GlobalAudioPlayer:** Reproductor flotante persistente con controles principales (play/pausa).
2.  **GiantRecordButton:** Interfaz prominente de un toque para captura de voz y control del tiempo.
3.  **WaveformVisualizer:** Render de la pista basado en `wavesurfer.js` para visualización clara, indicando hasta donde es gratis (Teaser).
4.  **ContentCard:** Tarjeta de feed basada en profundidad de fondo (tonal shift), sin líneas divisorias, aplicando los principios del diseño.
5.  **SmartTeaserOverlay:** Capa semitransparente (Subtle Glassmorphism) sobre el audio bloqueado que incluye el CTA principal "Apoyar para escuchar".

## 13. Pantallas Necesarias
*   **Landing Page:** Promesa de valor y conversión.
*   **Login / Registro:** Acceso simple por teléfono (SMS OTP).
*   **Onboarding Creador:** Tres simples pasos guiados (Foto, Bio, Configurar Tarifa).
*   **KYC Asistido:** Verificación validada en pasos grandes.
*   **Dashboard Creador:** Tres métricas grandes: Disponible, En Espera, Total.
*   **Feed Fan (Home):** Línea de tiempo con contenido multimedia y audios.
*   **Perfil del Creador:** Vista pública, bio y contenido de sus historias.
*   **Chat / Mensajes PPV:** Interfaz de mensajería íntima de texto/audio.
*   **Estudio de Grabación:** Pantalla libre de distracciones solo para grabar y publicar.
*   **Página de Ganancias y Retiros.**

## 14. Priorización del MVP usando MoSCoW
*   **Must Have (Debe tener):**
    *   Autenticación y perfiles (Creador/Fan).
    *   Grabación nativa web (un botón) y subida a Supabase.
    *   Feed cronológico de audios.
    *   Reproductor Audio + Waveform visual.
    *   Smart Teaser y Paywall (PPV).
    *   Integración pasarela de pagos (Stripe) para pagos y propinas en posts.
*   **Should Have (Debería tener):**
    *   Suscripciones mensuales a perfiles.
    *   Reproducción en segundo plano (Background play en SPA).
    *   Dashboard de finanzas simplificado.
*   **Could Have (Podría tener):**
    *   Mensajes directos y PPV (Chat).
    *   Soporte para comandos de voz.
    *   KYC automatizado integrado.
*   **Won’t Have (No tendrá en el MVP):**
    *   App móvil nativa en tiendas.
    *   Edición compleja de audio en navegador.
    *   Live Audio Rooms.

## 15. Roadmap por Fases
*   **Fase 1: MVP (Meses 1-2)**
    *   Setup técnico: Supabase DB, Auth, Storage, Edge Functions.
    *   Implementación UI/UX del Design System "The Heritage Editorial".
    *   Módulos core: Grabación, Feed, Reproductor Smart Teaser, Pago PPV básico con Stripe.
*   **Fase 2: Beta Crecimiento (Mes 3-4)**
    *   Suscripciones recurrentes y módulo de propinas avanzado.
    *   Dashboard analítico y retiros integrados.
    *   KYC funcional. Optimización del player y background.
*   **Fase 3: Versión Escalable (Mes 5+)**
    *   Implementación del Chat Privado PPV y engagement 1-1.
    *   Accesibilidad por voz para creadores.
    *   Progressive Web App (PWA) instalable.

## 16. Riesgos Técnicos y Soluciones
*   **Riesgo:** Limitaciones del navegador (iOS Safari) para Web Audio API, Auto-play y Background Recording.
    *   **Solución:** Validar y forzar interacciones del usuario (clicks) para desbloquear el audio context; testear exhaustivamente en Safari.
*   **Riesgo:** Saltarse el muro de pago (descarga de audios por usuarios avanzados).
    *   **Solución:** RLS y Supabase Edge Functions. El frontend solo expone y renderiza un recorte pre-generado (teaser de 30s) como URL. El archivo fuente solo se retorna a usuarios autenticados que validen el pago.
*   **Riesgo:** Curva de aprendizaje alta para creadores de tercera edad.
    *   **Solución:** Diseño restrictivo y enfocado; test de usabilidad regulares; eliminar menúes complejos por flujos paso a paso de pantalla completa.

## 17. Recomendaciones de Librerías para React + TypeScript
*   **UI/Estilos:** Tailwind CSS, usando como base la paleta de The Heritage Editorial (Deep Navy, Cream, Gold).
*   **Componentes base:** Radix UI (Componentes headless accesibles para lectores de pantalla).
*   **Audio & Waveforms:** `wavesurfer.js` para los gráficos interactivos, `react-media-recorder` (o MediaRecorder nativo) para captura simple.
*   **Data Fetching & State:** React Query (TanStack Query) para conexión y cacheo con Supabase, `zustand` para el estado global del reproductor y pagos en curso.
*   **Pagos:** `@stripe/react-stripe-js`.
*   **Formularios:** React Hook Form + Zod.

## 18. Integración Supabase (Auth, Storage, Database, Edge Functions y Realtime)
*   **Auth:** Login con OTP (Phone/Email Magic Link) configurado para ser la fricción mínima.
*   **Storage:** 
    *   `media-public`: avatares, fotos, teaser audios de 30s.
    *   `media-private`: audios fuentes completos y fotos PPV (seguros por RLS).
*   **Database (PostgreSQL):** Esquema relacional fuerte (visto en sección 9), protegido por RLS estrictos.
*   **Edge Functions:**
    1.  Manejo de Webhooks de Stripe (registro seguro de pagos en la BD).
    2.  Petición de Signed URLs para archivos privados (Valida compra -> Responde URL segura de 5 minutos).
    3.  Procesamiento en background (ej. extraer teaser de 30s de audios nuevos).
*   **Realtime:** Habilitado en la tabla `ppv_messages` para actualizar el chat en vivo, y en `tips` para notificar al creador la llegada de propinas.

## 19. Propuesta de Arquitectura General
**Arquitectura Serverless y SPA (Vite + Supabase)**
*   **Capa Cliente:** React SPA manejando la interactividad pesada (audio, player, estado, grabación). Vite permite rápido HMR e integra fluido con TypeScript.
*   **Capa Backend y BD (BaaS):** Supabase funciona como el hub principal. Las APIs REST auto-generadas de PostgREST sirven los datos al cliente.
*   **Capa Computo Dinámico:** Edge Functions manejan lógica de negocio crítica (pagos, entrega de URL segura de audio) para no exponer secretos y validar seguridad del lado del servidor.
*   **Integración de Terceros:** Stripe gestiona pasarelas (Stripe Connect para los retiros automáticos o manuales de los creadores).

## 20. Criterios de Aceptación para Cada Módulo
*   **Registro Creador:** El usuario mayor a 60 años completa el onboarding en menos de 2 minutos, usando OTP y una interfaz limpia con texto gigante.
*   **Grabación:** Al presionar el botón "Micrófono", comienza la captura. Al detener, puede escuchar y publicar en 3 clicks. El audio se procesa y el teaser está disponible en < 5 segundos en el feed.
*   **Smart Teaser (Audio PPV):** En el timeline, el fan inicia el audio sin interrupciones. Exactamente al superar los 15-30s, el audio se corta y aparece la ventana sobre el waveform de pago bloqueado. Imposibilidad total de seguir escuchando si la tabla de compras (`purchases`) no valida al usuario.
*   **Transacciones y Dashboard:** Un pago de $10 USD procesado con Stripe refleja automáticamente $8 USD disponibles para retiro y $2 USD en comisiones en el Dashboard sin necesidad de refrescar, y el fan obtiene acceso inmediato y permanente a ese audio.
*   **Diseño Accesible:** El sistema pasa auditoría WCAG AA para contrastes de color, tamaños de botón (min 56px) e interactividad sin mouse.

---

### Detalles de Diseño (The Heritage Editorial)
Se ha incorporado la directiva de usar el esquema **"Historias Doradas Digitales"** proveniente del sistema de diseño (StitchMCP):
*   **Tipografías:** Newsreader (Títulos) e Inter (Cuerpo).
*   **Paleta de Colores:** Cream (`#FBFAEE`), Deep Navy (`#0F172A`) y Heritage Gold (`#D4AF37`).
*   **Estructura Visual:** Ausencia de bordes definidos ("No-Line Rule"), separación mediante "Tonal Depth" (shifts en el color de fondo). Botones redondeados grandes (`xl`), uso estratégico del espacio negativo para reducir ruido visual y facilitar la adopción tecnológica por el usuario final.
