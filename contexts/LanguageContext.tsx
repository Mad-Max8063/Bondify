import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

type TranslationKeys =
  | 'app_subtitle'
  | 'onboarding_question'
  | 'onboarding_efficient_title'
  | 'onboarding_efficient_badge'
  | 'onboarding_efficient_desc'
  | 'onboarding_community_title'
  | 'onboarding_community_badge'
  | 'onboarding_community_desc'
  | 'onboarding_guest_btn'
  | 'onboarding_privacy'
  | 'nav_favorites'
  | 'nav_traveling'
  | 'nav_waiting'
  | 'nav_history'
  | 'nav_profile'
  | 'profile_title'
  | 'profile_usage_mode'
  | 'profile_safety_timer'
  | 'profile_safety_timer_desc'
  | 'profile_panic_btn'
  | 'profile_panic_btn_desc'
  | 'profile_presentation_mode'
  | 'profile_presentation_mode_desc'
  | 'profile_close'
  | 'fav_title'
  | 'fav_placeholder'
  | 'fav_add'
  | 'fav_empty'
  | 'history_title'
  | 'history_total_trips'
  | 'history_total_time'
  | 'history_verifications'
  | 'history_empty'
  | 'waze_title'
  | 'waze_picket'
  | 'waze_accident'
  | 'waze_broken'
  | 'waze_station_closed'
  | 'waze_deviation'
  | 'waze_submit'
  | 'waze_success'
  | 'traveler_title'
  | 'traveler_line'
  | 'traveler_ramal'
  | 'traveler_activate'
  | 'traveler_cancel'
  | 'geo_sharing'
  | 'geo_stop'
  | 'geo_panic'
  | 'nudge_title'
  | 'nudge_desc'
  | 'nudge_confirm'
  | 'nudge_deny'
  | 'map_search_placeholder'
  | 'map_help_title'
  | 'map_status_verified'
  | 'map_status_estimated'
  | 'map_status_trail'
  | 'map_updated_ago'
  | 'map_trail_desc'
  | 'map_safety_note'
  | 'map_status_problem'
  | 'map_status_ghost'
  | 'map_card_passengers'
  | 'map_card_speed'
  | 'map_card_reports'
  | 'map_card_crowdsourced'
  | 'map_card_community_thanks'
  | 'map_card_report_issue'
  | 'map_card_waiting_time'
  | 'map_card_minutes'
  | 'map_card_seconds'
  | 'map_card_verified_desc'
  | 'map_card_estimated_desc'
  | 'map_card_ghost_desc'
  | 'map_card_problem_desc'
  | 'deviation_alert_title'
  | 'deviation_alert_desc'
  | 'deviation_alert_subbed'
  | 'deviation_alert_report'
  | 'deviation_alert_keep'
  | 'deviation_confirm_title'
  | 'deviation_confirm_desc'
  | 'deviation_confirm_btn'
  | 'deviation_confirm_reject'
  | 'deviation_notif_title'
  | 'deviation_notif_desc'
  | 'deviation_confirm_passenger_report'
  | 'deviation_confirm_community_validations'
  | 'deviation_confirm_need_more'
  | 'deviation_confirm_missing_single'
  | 'deviation_confirm_missing_multiple'
  | 'deviation_confirm_reason_title'
  | 'deviation_confirm_reason_desc'
  | 'deviation_confirm_btn_sub'
  | 'deviation_confirm_reject_sub'
  | 'traveler_how_works'
  | 'traveler_how_works_desc'
  | 'traveler_choose_line'
  | 'traveler_manual_placeholder'
  | 'traveler_choose_ramal'
  | 'traveler_select_ramal'
  | 'traveler_select_ramal_other'
  | 'traveler_battery_warning'
  | 'install_already_installed'
  | 'install_already_installed_desc'
  | 'install_continue'
  | 'install_title'
  | 'install_subtitle'
  | 'install_btn_now'
  | 'install_ios_step1_title'
  | 'install_ios_step1_desc'
  | 'install_ios_step2_title'
  | 'install_ios_step2_desc'
  | 'install_ios_step3_title'
  | 'install_ios_step3_desc'
  | 'install_android_step1_title'
  | 'install_android_step1_desc'
  | 'install_android_step2_title'
  | 'install_android_step2_desc'
  | 'install_android_step3_title'
  | 'install_android_step3_desc'
  | 'install_benefits'
  | 'geo_sharing_active'
  | 'geo_waiting_movement'
  | 'geo_sharing_desc'
  | 'geo_sharing_get_off'
  | 'geo_sharing_panic'
  | 'geo_sharing_verified'
  | 'notif_detour_confirmed_title'
  | 'notif_detour_confirmed_desc'
  | 'notif_detour_verified_by'
  | 'demo_banner'
  | 'demo_exit'
  | 'demo_label'
  | 'demo_blocked_action'
  | 'points_earned'
  | 'deviation_thanks'
  | 'deviation_reported'
  | 'route_updated'
  | 'empty_state_title'
  | 'empty_state_desc'
  | 'empty_state_cta'
  | 'empty_state_demo'
  | 'notify_bus_near'
  | 'notify_need_location'
  | 'feedback_thanks'
  | 'search_no_results'
  | 'report_need_line'
  | 'report_need_location'
  | 'report_pending_confirmation'
  | 'report_success'
  | 'report_error'
  | 'report_which_line'
  | 'geo_permission_denied'
  | 'geo_error'
  | 'panic_activated'
  | 'deviation_confirmed_community'
  | 'deviation_confirmation_registered'
  | 'install_banner_title'
  | 'install_banner_desc'
  | 'install_banner_cta'
  | 'profile_points'
  | 'profile_level'
  | 'onboarding_legal_prefix'
  | 'onboarding_legal_terms'
  | 'onboarding_legal_and'
  | 'onboarding_legal_privacy'
  | 'traveler_consent';

const translations: Record<Language, Record<TranslationKeys, string>> = {
  es: {
    app_subtitle: 'Viajá mejor, esperá menos.',
    onboarding_question: '¿Cómo querés usar la app?',
    onboarding_efficient_title: 'Modo Eficiente',
    onboarding_efficient_badge: 'Simple',
    onboarding_efficient_desc: 'Quiero la herramienta de consulta rápida. Solo dame los horarios de arribo precisos, alertas de mapa y cronómetro de seguridad.',
    onboarding_community_title: 'Modo Comunidad',
    onboarding_community_badge: 'Recomendado',
    onboarding_community_desc: '¡Sumate al tránsito colaborativo! Reportá incidentes en vivo, validá desvíos de colectivos y viajá más seguro junto a otros pasajeros en tiempo real.',
    onboarding_guest_btn: 'Ingresar como Invitado',
    onboarding_privacy: 'Privacidad garantizada • Conexión cifrada de geolocalización',
    nav_favorites: 'Favoritos',
    nav_traveling: 'Viajando',
    nav_waiting: 'Esperando',
    nav_history: 'Historial',
    nav_profile: 'Perfil',
    profile_title: 'Ajustes de Perfil',
    profile_usage_mode: 'Modo de Uso',
    profile_safety_timer: 'Cronómetro de Seguridad',
    profile_safety_timer_desc: 'Envía alertas a tus contactos si un viaje se demora más de lo habitual.',
    profile_panic_btn: 'Botón de Pánico',
    profile_panic_btn_desc: 'Acceso rápido para compartir geolocalización de emergencia.',
    profile_presentation_mode: 'Modo Presentación',
    profile_presentation_mode_desc: 'Habilita controles para simular desvíos e incidentes en vivo.',
    profile_close: 'Cerrar',
    fav_title: 'Líneas Favoritas',
    fav_placeholder: 'Ej: 152, 60, 29',
    fav_add: 'Agregar',
    fav_empty: 'No tenés líneas favoritas agregadas.',
    history_title: 'Tu Historial de Viajes',
    history_total_trips: 'Viajes Totales',
    history_total_time: 'Tiempo de Viaje',
    history_verifications: 'Verificaciones',
    history_empty: 'Aún no registraste viajes.',
    waze_title: 'Reportar Incidente',
    waze_picket: 'Piquete / Corte',
    waze_accident: 'Accidente',
    waze_broken: 'Unidad Rota',
    waze_station_closed: 'Parada Anulada',
    waze_deviation: 'Desvío de Ruta',
    waze_submit: 'Confirmar Reporte',
    waze_success: '✅ ¡Reporte enviado con éxito! Gracias por colaborar.',
    traveler_title: 'Activar Modo Viajero',
    traveler_line: 'Línea de Colectivo',
    traveler_ramal: 'Ramal / Destino (Opcional)',
    traveler_activate: '¡EMPEZAR VIAJE ANÓNIMO! 🚀',
    traveler_cancel: 'Cancelar',
    geo_sharing: 'Compartiendo viaje de la línea',
    geo_stop: 'Terminar Viaje',
    geo_panic: '🚨 PÁNICO',
    nudge_title: '¡Hora de viajar!',
    nudge_desc: 'Detectamos que estás en tu horario habitual de la línea',
    nudge_confirm: '¡SÍ, SUBÍ! 🚌',
    nudge_deny: 'Ahora no',
    map_search_placeholder: 'Buscar parada o línea de colectivo...',
    map_help_title: 'Guía de uso',
    map_status_verified: 'VERIFICADO',
    map_status_estimated: 'ESTIMADO',
    map_status_trail: 'RECORRIDO',
    map_updated_ago: 'Actualizado hace {time}',
    map_trail_desc: 'Señal reciente sin verificar. Alguien compartió esta posición pero todavía no pasó la validación del servidor.',
    map_safety_note: 'Usala como referencia: esperá siempre en la parada, en un lugar iluminado.',
    map_status_problem: 'DEMORA/ALERTA',
    map_status_ghost: 'GHOST BUS',
    map_card_passengers: 'Pasajeros a bordo',
    map_card_speed: 'Velocidad promedio',
    map_card_reports: 'Reportes activos',
    map_card_crowdsourced: 'Tiempo Real Colaborativo',
    map_card_community_thanks: '¡Gracias por reportar y ayudar a viajar mejor!',
    map_card_report_issue: 'Reportar problema en este colectivo',
    map_card_waiting_time: 'Tiempo de espera estimado',
    map_card_minutes: 'min',
    map_card_seconds: 'seg',
    map_card_verified_desc: 'Ubicación validada en vivo por pasajeros a bordo.',
    map_card_estimated_desc: 'Ubicación estimada según frecuencias teóricas.',
    map_card_ghost_desc: 'Servicio oficial programado (sin señal GPS activa).',
    map_card_problem_desc: 'Incidentes o demoras inusuales reportadas en la zona.',
    deviation_alert_title: '⚠️ ¿Cambiaste de colectivo?',
    deviation_alert_desc: 'Detectamos que te desviaste del recorrido habitual de la línea',
    deviation_alert_subbed: 'Sí, me bajé aquí ✅',
    deviation_alert_report: 'Sí, hay un desvío ↪️',
    deviation_alert_keep: 'No, sigo viajando 👍',
    deviation_confirm_title: '↪️ Confirmar Desvío de Recorrido',
    deviation_confirm_desc: '¿Podés confirmar si este colectivo está tomando un camino alternativo?',
    deviation_confirm_btn: 'Sí, hay desvío ↪️',
    deviation_confirm_reject: 'No, recorrido normal 👍',
    deviation_notif_title: '↪️ Desvío Confirmado en Línea',
    deviation_notif_desc: 'El desvío ya fue validado por pasajeros en tiempo real. ¡Ruta recalculada!',
    deviation_confirm_passenger_report: '↪️ Un pasajero reportó que este colectivo se desvió',
    deviation_confirm_community_validations: 'Validaciones comunitarias',
    deviation_confirm_need_more: 'Para confirmar el desvío y alertar a otros usuarios en las paradas, necesitamos que {count} pasajeros más lo validen en vivo.',
    deviation_confirm_missing_single: '¡Falta solo 1 confirmación!',
    deviation_confirm_missing_multiple: 'Faltan {count} confirmaciones más',
    deviation_confirm_reason_title: '¿Por qué 3 confirmaciones?',
    deviation_confirm_reason_desc: 'Por seguridad y consistencia, los reportes comunitarios de desvío requieren validación cruzada antes de notificar oficialmente a toda la comunidad.',
    deviation_confirm_btn_sub: 'Confirmo que el colectivo cambió de ruta',
    deviation_confirm_reject_sub: 'El colectivo va por el recorrido habitual',
    traveler_how_works: '¿Cómo funciona?',
    traveler_how_works_desc: 'Cuando activás el modo viajero, tu ubicación GPS se comparte automáticamente de forma anónima. Otros usuarios podrán ver dónde está tu colectivo en tiempo real.',
    traveler_choose_line: '¿En qué línea estás viajando?',
    traveler_manual_placeholder: 'O escribí el número de línea',
    traveler_choose_ramal: 'Ramal (opcional)',
    traveler_select_ramal: 'Seleccioná el ramal',
    traveler_select_ramal_other: 'Otro',
    traveler_battery_warning: '🔋 El GPS consume batería. Desactivá cuando bajes del colectivo.',
    install_already_installed: '¡Ya instalaste Bondify!',
    install_already_installed_desc: 'Estás usando la app instalada. ¡Genial!',
    install_continue: 'Continuar',
    install_title: 'Instalá Bondify',
    install_subtitle: 'Acceso rápido desde tu inicio',
    install_btn_now: 'Instalar ahora',
    install_ios_step1_title: 'Tocá el botón Compartir',
    install_ios_step1_desc: 'Buscá el ícono □↑ en la barra de Safari',
    install_ios_step2_title: 'Agregar a pantalla de inicio',
    install_ios_step2_desc: 'Deslizá hacia abajo y tocá "Agregar a pantalla de inicio"',
    install_ios_step3_title: 'Confirmá y listo',
    install_ios_step3_desc: 'Tocá "Agregar" y Bondify aparecerá como app',
    install_android_step1_title: 'Menú del navegador',
    install_android_step1_desc: 'Tocá los 3 puntos ⋮ en Chrome',
    install_android_step2_title: 'Instalar aplicación',
    install_android_step2_desc: 'Seleccioná "Instalar app" o "Agregar a pantalla"',
    install_android_step3_title: '¡Listo!',
    install_android_step3_desc: 'Bondify estará en tu pantalla de inicio',
    install_benefits: '✨ Sin Play Store ni App Store • Acceso instantáneo • Funciona offline',
    geo_sharing_active: 'Compartiendo ubicación',
    geo_waiting_movement: 'Esperando que arranque el bondi…',
    geo_sharing_desc: '📍 Tu ubicación se comparte con un margen de 50m para tu privacidad.',
    geo_sharing_get_off: 'Bajarme',
    geo_sharing_panic: '🚨 PÁNICO',
    geo_sharing_verified: 'Verificado',
    notif_detour_confirmed_title: '¡Alerta de Desvío Confirmada!',
    notif_detour_confirmed_desc: 'La Línea {linea} se está desviando de su recorrido habitual.',
    notif_detour_verified_by: 'Verificado por 3 pasajeros a bordo',
    demo_banner: 'MODO DEMO — datos simulados',
    demo_exit: 'Salir',
    demo_label: 'demo',
    demo_blocked_action: 'Esta acción no está disponible en modo demo. Salí del demo para usar datos reales.',
    points_earned: '🏆 +{n} puntos',
    deviation_thanks: 'Gracias por avisar. El colectivo se mostrará en gris (estimado) para otros usuarios.',
    deviation_reported: 'Reporte de desvío enviado. Otros pasajeros lo van a confirmar.',
    route_updated: 'Tu ruta habitual se actualizó.',
    empty_state_title: 'No hay colectivos compartidos ahora',
    empty_state_desc: 'Bondify se construye entre todos: cuando alguien viaja y comparte su bondi, aparece acá en vivo. Sé el primero de tu línea.',
    empty_state_cta: 'Compartir mi viaje',
    empty_state_demo: 'Ver cómo funciona (demo)',
    notify_bus_near: '🔔 ¡Salí ahora! Tu colectivo está a menos de 600 metros.',
    notify_need_location: 'Necesitamos tu ubicación para avisarte cuando el bondi esté cerca. Habilitá el GPS y probá de nuevo.',
    feedback_thanks: '¡Gracias! Tu opinión ayuda a la comunidad.',
    search_no_results: 'Ahora no hay bondis de la línea {line} compartiendo ubicación.',
    report_need_line: 'Elegí o escribí la línea del reporte.',
    report_need_location: 'Necesitamos tu ubicación real para publicar el reporte. Habilitá el GPS y probá de nuevo.',
    report_pending_confirmation: '⏳ ¡Reporte enviado! Necesita 3 confirmaciones de otros pasajeros para hacerse público.',
    report_success: '✅ ¡Gracias! Tu reporte ya está visible en el mapa.',
    report_error: 'No pudimos enviar el reporte. Probá de nuevo en un momento.',
    report_which_line: '¿De qué línea es el reporte?',
    geo_permission_denied: 'No se pudo acceder a tu ubicación. Habilitá los permisos de GPS en los ajustes de tu celular.',
    geo_error: 'Error de GPS: asegurate de tener la ubicación activada.',
    panic_activated: '🚨 MODO PÁNICO: GPS apagado y datos de sesión borrados por tu seguridad.',
    deviation_confirmed_community: '✅ ¡Desvío confirmado por la comunidad! Los que esperan más adelante van a ser notificados.',
    deviation_confirmation_registered: '✅ Confirmación registrada. Faltan {n} confirmaciones más.',
    install_banner_title: 'Instalá Bondify',
    install_banner_desc: 'Acceso rápido desde tu pantalla de inicio',
    install_banner_cta: 'Instalar',
    profile_points: 'puntos',
    profile_level: 'Nivel',
    onboarding_legal_prefix: 'Al continuar aceptás los',
    onboarding_legal_terms: 'Términos y Condiciones',
    onboarding_legal_and: 'y la',
    onboarding_legal_privacy: 'Política de Privacidad',
    traveler_consent: 'Al activar, aceptás compartir tu ubicación aproximada de forma anónima mientras dure el viaje. Detalles en la',
  },
  en: {
    app_subtitle: 'Travel better, wait less.',
    onboarding_question: 'How do you want to use the app?',
    onboarding_efficient_title: 'Efficient Mode',
    onboarding_efficient_badge: 'Simple',
    onboarding_efficient_desc: 'A direct, lightweight consultation tool. Just show me exact arrival times, map alerts, and the safety countdown timer.',
    onboarding_community_title: 'Community Mode',
    onboarding_community_badge: 'Recommended',
    onboarding_community_desc: 'Join our crowdsourced transit network! Report live incidents, validate route deviations, and travel safer with others in real-time.',
    onboarding_guest_btn: 'Enter as Guest',
    onboarding_privacy: 'Privacy guaranteed • Encrypted geolocation connection',
    nav_favorites: 'Favorites',
    nav_traveling: 'Traveling',
    nav_waiting: 'Waiting',
    nav_history: 'History',
    nav_profile: 'Profile',
    profile_title: 'Profile Settings',
    profile_usage_mode: 'Usage Mode',
    profile_safety_timer: 'Safety Countdown Timer',
    profile_safety_timer_desc: 'Sends urgent notifications to your emergency contacts if a trip takes longer than usual.',
    profile_panic_btn: 'Panic Button',
    profile_panic_btn_desc: 'Quick emergency shortcut to broadcast your secure geolocation details.',
    profile_presentation_mode: 'Demo Mode',
    profile_presentation_mode_desc: 'Enables simulator controls to trigger live deviations and map incident reports.',
    profile_close: 'Close',
    fav_title: 'Favorite Lines',
    fav_placeholder: 'e.g., 152, 60, 29',
    fav_add: 'Add',
    fav_empty: 'You have no favorite lines saved.',
    history_title: 'Your Trip History',
    history_total_trips: 'Total Trips',
    history_total_time: 'Travel Time',
    history_verifications: 'Verifications',
    history_empty: 'No trips recorded yet.',
    waze_title: 'Report Incident',
    waze_picket: 'Protest / Roadblock',
    waze_accident: 'Accident',
    waze_broken: 'Broken Vehicle',
    waze_station_closed: 'Stop Suspended',
    waze_deviation: 'Route Deviation',
    waze_submit: 'Confirm Report',
    waze_success: '✅ Report submitted successfully! Thanks for collaborating.',
    traveler_title: 'Activate Passenger Mode',
    traveler_line: 'Bus Line',
    traveler_ramal: 'Branch / Destination (Optional)',
    traveler_activate: 'START ANONYMOUS TRIP! 🚀',
    traveler_cancel: 'Cancel',
    geo_sharing: 'Broadcasting trip details for line',
    geo_stop: 'End Trip',
    geo_panic: '🚨 PANIC',
    nudge_title: 'Time to travel!',
    nudge_desc: 'We detected you are near your usual departure window for line',
    nudge_confirm: 'YES, BOARDED! 🚌',
    nudge_deny: 'Not now',
    map_search_placeholder: 'Search bus stop or line number...',
    map_help_title: 'User guide',
    map_status_verified: 'LIVE VERIFIED',
    map_status_estimated: 'SCHEDULED',
    map_status_trail: 'RECENT TRAIL',
    map_updated_ago: 'Updated {time} ago',
    map_trail_desc: 'Recent unverified signal. Someone shared this position but it has not passed server validation yet.',
    map_safety_note: 'Use it as a reference: always wait at the stop, in a well-lit spot.',
    map_status_problem: 'DELAYS / ALERT',
    map_status_ghost: 'GHOST BUS',
    map_card_passengers: 'Passengers on board',
    map_card_speed: 'Average speed',
    map_card_reports: 'Active reports',
    map_card_crowdsourced: 'Real-Time Crowdsourced Transit',
    map_card_community_thanks: 'Thanks for collaborating to build a better transit journey!',
    map_card_report_issue: 'Report an issue on this bus',
    map_card_waiting_time: 'Estimated arrival window',
    map_card_minutes: 'min',
    map_card_seconds: 'sec',
    map_card_verified_desc: 'Location verified live by passengers active on board.',
    map_card_estimated_desc: 'Estimated location based on theoretical agency schedule.',
    map_card_ghost_desc: 'Official scheduled run (no active GPS signal detected).',
    map_card_problem_desc: 'Heavy delays or road incidents reported in the local area.',
    deviation_alert_title: '⚠️ Did you change bus?',
    deviation_alert_desc: 'We detected a deviation from your usual route schedule for line',
    deviation_alert_subbed: 'Yes, I got off here ✅',
    deviation_alert_report: 'Yes, there is a detour ↪️',
    deviation_alert_keep: 'No, still riding 👍',
    deviation_confirm_title: '↪️ Confirm Route Deviation',
    deviation_confirm_desc: 'Can you verify if this bus has taken an alternative detour path?',
    deviation_confirm_btn: 'Yes, it is detouring ↪️',
    deviation_confirm_reject: 'No, normal route 👍',
    deviation_notif_title: '↪️ Confirmed Route Detour',
    deviation_notif_desc: 'Detour successfully validated by active riders. Live route updated!',
    deviation_confirm_passenger_report: '↪️ A passenger reported that this bus detoured',
    deviation_confirm_community_validations: 'Community validations',
    deviation_confirm_need_more: 'To confirm the detour and alert other users at stops, we need {count} more passengers to validate it live.',
    deviation_confirm_missing_single: 'Only 1 confirmation left!',
    deviation_confirm_missing_multiple: '{count} more confirmations left',
    deviation_confirm_reason_title: 'Why 3 confirmations?',
    deviation_confirm_reason_desc: 'For safety and consistency, community detour reports require cross-validation before officially notifying the entire community.',
    deviation_confirm_btn_sub: 'I confirm the bus changed its route',
    deviation_confirm_reject_sub: 'The bus is following its standard route',
    traveler_how_works: 'How does it work?',
    traveler_how_works_desc: 'When you activate passenger mode, your GPS location is automatically and anonymously shared. Other users will see where your bus is in real-time.',
    traveler_choose_line: 'Which line are you riding?',
    traveler_manual_placeholder: 'Or write the line number',
    traveler_choose_ramal: 'Branch (optional)',
    traveler_select_ramal: 'Select branch',
    traveler_select_ramal_other: 'Other',
    traveler_battery_warning: '🔋 GPS uses battery power. Turn it off when you get off the bus.',
    install_already_installed: 'You already installed Bondify!',
    install_already_installed_desc: 'You are using the installed app. Awesome!',
    install_continue: 'Continue',
    install_title: 'Install Bondify',
    install_subtitle: 'Quick access from your home screen',
    install_btn_now: 'Install now',
    install_ios_step1_title: 'Tap the Share button',
    install_ios_step1_desc: 'Look for the □↑ icon in Safari bar',
    install_ios_step2_title: 'Add to Home Screen',
    install_ios_step2_desc: 'Scroll down and tap "Add to Home Screen"',
    install_ios_step3_title: 'Confirm and you are done',
    install_ios_step3_desc: 'Tap "Add" and Bondify will appear as an app',
    install_android_step1_title: 'Browser menu',
    install_android_step1_desc: 'Tap the 3 dots ⋮ in Chrome',
    install_android_step2_title: 'Install application',
    install_android_step2_desc: 'Select "Install app" or "Add to screen"',
    install_android_step3_title: 'Done!',
    install_android_step3_desc: 'Bondify will be on your home screen',
    install_benefits: '✨ No Play Store or App Store • Instant access • Works offline',
    geo_sharing_active: 'Sharing location',
    geo_waiting_movement: 'Waiting for the bus to start moving…',
    geo_sharing_desc: '📍 Your location is shared with a 50m margin for your privacy.',
    geo_sharing_get_off: 'Get off',
    geo_sharing_panic: '🚨 PANIC',
    geo_sharing_verified: 'Verified',
    notif_detour_confirmed_title: 'Route Detour Confirmed!',
    notif_detour_confirmed_desc: 'Line {linea} is detouring from its usual route.',
    notif_detour_verified_by: 'Verified by 3 passengers on board',
    demo_banner: 'DEMO MODE — simulated data',
    demo_exit: 'Exit',
    demo_label: 'demo',
    demo_blocked_action: 'This action is not available in demo mode. Exit the demo to use real data.',
    points_earned: '🏆 +{n} points',
    deviation_thanks: 'Thanks for letting us know. The bus will show as gray (estimated) for other riders.',
    deviation_reported: 'Detour report submitted. Other riders will confirm it.',
    route_updated: 'Your usual route was updated.',
    empty_state_title: 'No shared buses right now',
    empty_state_desc: 'Bondify is built by its riders: when someone shares their bus, it shows up here live. Be the first on your line.',
    empty_state_cta: 'Share my ride',
    empty_state_demo: 'See how it works (demo)',
    notify_bus_near: '🔔 Head out now! Your bus is less than 600 meters away.',
    notify_need_location: 'We need your location to alert you when the bus is close. Enable GPS and try again.',
    feedback_thanks: 'Thanks! Your feedback helps the community.',
    search_no_results: 'No buses on line {line} are sharing their location right now.',
    report_need_line: 'Pick or type the line for this report.',
    report_need_location: 'We need your real location to publish the report. Enable GPS and try again.',
    report_pending_confirmation: '⏳ Report submitted! It needs 3 confirmations from other riders to go public.',
    report_success: '✅ Thanks! Your report is now visible on the map.',
    report_error: 'We could not submit your report. Please try again shortly.',
    report_which_line: 'Which line is this report for?',
    geo_permission_denied: 'Could not access your location. Enable GPS permissions in your phone settings.',
    geo_error: 'GPS error: make sure location is turned on.',
    panic_activated: '🚨 PANIC MODE: GPS turned off and session data wiped for your safety.',
    deviation_confirmed_community: '✅ Detour confirmed by the community! Riders waiting ahead will be notified.',
    deviation_confirmation_registered: '✅ Confirmation registered. {n} more needed.',
    install_banner_title: 'Install Bondify',
    install_banner_desc: 'Quick access from your home screen',
    install_banner_cta: 'Install',
    profile_points: 'points',
    profile_level: 'Level',
    onboarding_legal_prefix: 'By continuing you accept the',
    onboarding_legal_terms: 'Terms & Conditions',
    onboarding_legal_and: 'and the',
    onboarding_legal_privacy: 'Privacy Policy',
    traveler_consent: 'By activating, you agree to anonymously share your approximate location while the trip lasts. Details in the',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bondify_language');
    if (saved === 'es' || saved === 'en') {
      return saved as Language;
    }
    // Default to 'es' but try browser setting
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bondify_language', lang);
  };

  const t = (key: TranslationKeys): string => {
    return translations[language][key] || translations['es'][key] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
