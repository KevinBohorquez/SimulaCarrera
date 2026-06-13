export interface SimOption {
  value: string;
  label: string;
  hint?: string;
  impact: Record<string, number>;
}

export interface SimBlock {
  type: "decision" | "resolucion_tecnica" | "imprevisto";
  title: string;
  context: string;
  situation: string;
  image_url: string;
  options: SimOption[];
}

export interface RichSimulation {
  title: string;
  description: string;
  estimated_minutes: number;
  intro: string;
  blocks: SimBlock[];
}

const IMG = {
  code: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=500&fit=crop",
  hospital: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=500&fit=crop",
  marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=500&fit=crop",
  therapy: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=500&fit=crop",
  courtroom: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&h=500&fit=crop",
  architecture: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&h=500&fit=crop",
  design: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=500&fit=crop",
  business: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&h=500&fit=crop",
  data: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=500&fit=crop",
  nursing: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&h=500&fit=crop",
};

export const RICH_SIMULATIONS: Record<string, RichSimulation> = {
  "ing-software": {
    title: "Sprint crítico en una startup",
    description: "Eres desarrollador junior en una fintech. El lanzamiento es en 48 horas y todo puede salir mal.",
    estimated_minutes: 12,
    intro: "Son las 9:00 AM. Tu equipo tiene un demo con inversores el viernes. El backend está inestable y el PM acaba de cambiar los requisitos.",
    blocks: [
      {
        type: "decision",
        title: "La funcionalidad urgente",
        context: "El cliente pide pagos con QR para mañana. Tu tech lead está en reunión.",
        situation: "¿Cómo respondes a la presión del cliente sin comprometer la calidad del producto?",
        image_url: IMG.code,
        options: [
          { value: "a", label: "Codificas toda la noche para cumplir el plazo", hint: "Alto compromiso, riesgo de bugs", impact: { calidad: -2, compromiso: 3, resistencia: 2 } },
          { value: "b", label: "Negocias un MVP con alcance reducido y fecha realista", hint: "Comunicación y priorización", impact: { comunicacion: 3, calidad: 2, liderazgo: 1 } },
          { value: "c", label: "Escalas al tech lead y documentas el riesgo técnico", hint: "Gestión profesional del riesgo", impact: { analisis: 2, comunicacion: 2, asertividad: 2 } },
        ],
      },
      {
        type: "resolucion_tecnica",
        title: "Caída en producción",
        context: "A las 2:00 PM el sistema de pagos deja de responder. Los logs muestran timeouts en la base de datos.",
        situation: "El equipo te pide que lideres la respuesta. ¿Cuál es tu primer movimiento?",
        image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Reinicias todos los servidores sin investigar", hint: "Puede ocultar la causa raíz", impact: { analisis: -2, velocidad: 1 } },
          { value: "b", label: "Revisas métricas, logs y aíslas el servicio afectado", hint: "Diagnóstico sistemático", impact: { analisis: 3, calma: 2 } },
          { value: "c", label: "Convocas war-room y divides tareas con el equipo", hint: "Colaboración bajo presión", impact: { colaboracion: 3, liderazgo: 2, analisis: 1 } },
        ],
      },
      {
        type: "imprevisto",
        title: "Conflicto en el equipo",
        context: "Un compañero senior critica tu código en Slack frente a todos. El ambiente se tensa.",
        situation: "¿Cómo manejas la situación sin frenar el sprint?",
        image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Respondes en público defendiendo tu trabajo", hint: "Puede escalar el conflicto", impact: { asertividad: 1, colaboracion: -2 } },
          { value: "b", label: "Pides una revisión 1:1 y pides feedback constructivo", hint: "Madurez profesional", impact: { comunicacion: 3, empatia: 2, colaboracion: 2 } },
          { value: "c", label: "Ignoras el mensaje y sigues trabajando", hint: "Evitas el problema", impact: { colaboracion: -1, calma: 1 } },
        ],
      },
    ],
  },

  medicina: {
    title: "Turno en emergencias",
    description: "Eres médico residente de primer año. La sala de emergencias está saturada.",
    estimated_minutes: 15,
    intro: "Es viernes noche. Llegan tres pacientes críticos casi al mismo tiempo. Tienes 30 segundos para priorizar.",
    blocks: [
      {
        type: "decision",
        title: "Dolor torácico agudo",
        context: "Hombre de 58 años, sudoroso, presión 90/60, dolor opresivo irradiado al brazo izquierdo.",
        situation: "¿Cuál es tu primera acción clínica?",
        image_url: IMG.hospital,
        options: [
          { value: "a", label: "Solicitas ECG de 12 derivaciones en menos de 10 minutos", hint: "Protocolo estándar", impact: { clinico: 3, protocolo: 3 } },
          { value: "b", label: "Administras morfina y esperas evolución", hint: "Puede enmascarar el cuadro", impact: { clinico: -2, empatia: 1 } },
          { value: "c", label: "Derivas directamente a cardiología sin evaluar", hint: "Retrasa atención crítica", impact: { juicio: -2 } },
        ],
      },
      {
        type: "resolucion_tecnica",
        title: "ECG con elevación del ST",
        context: "El ECG confirma sospecha de infarto. El cateterismo está a 40 minutos de distancia.",
        situation: "¿Qué protocolo activas?",
        image_url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Inicias protocolo STEMI: AAS, clopidogrel, anticoagulación y aviso a hemodinamia", hint: "Manejo gold-standard", impact: { clinico: 3, protocolo: 3 } },
          { value: "b", label: "Pides más exámenes antes de tratar", hint: "Retraso innecesario", impact: { clinico: -2, analisis: -1 } },
          { value: "c", label: "Estabilizas y trasladas sin tratamiento inicial", hint: "Riesgo durante traslado", impact: { juicio: -2, clinico: -1 } },
        ],
      },
      {
        type: "imprevisto",
        title: "Familiares en el pasillo",
        context: "Mientras estabilizas al paciente, tres familiares exigen información y amenazan con grabar.",
        situation: "¿Cómo equilibras la atención clínica con la comunicación con la familia?",
        image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Pides a enfermería que los acompañe a sala de espera y les das update breve", hint: "Balance clínico-comunicacional", impact: { empatia: 3, comunicacion: 2, clinico: 1 } },
          { value: "b", label: "Detienes el procedimiento para explicar todo", hint: "Compromete al paciente", impact: { clinico: -3, empatia: 2 } },
          { value: "c", label: "Ignoras a la familia hasta terminar", hint: "Daña la confianza", impact: { empatia: -3, clinico: 1 } },
        ],
      },
    ],
  },

  marketing: {
    title: "Lanzamiento de producto",
    description: "Eres responsable de marketing en una startup de alimentos saludables. Presupuesto ajustado, expectativas altas.",
    estimated_minutes: 10,
    intro: "Tu CEO quiere 10,000 registros en 30 días. Tienes S/. 8,000 de presupuesto digital.",
    blocks: [
      {
        type: "decision",
        title: "Distribución del presupuesto",
        context: "Tienes dos canales probados: Instagram Ads (alcance) y Google Search (conversión).",
        situation: "¿Cómo distribuyes el presupuesto para maximizar registros?",
        image_url: IMG.marketing,
        options: [
          { value: "a", label: "100% en Instagram con influencers micro", hint: "Alto alcance, conversión incierta", impact: { creatividad: 2, riesgo: 2, analisis: -1 } },
          { value: "b", label: "60% Google Search + 40% Instagram retargeting", hint: "Estrategia basada en funnel", impact: { estrategia: 3, analisis: 2 } },
          { value: "c", label: "Todo en un spot de radio local", hint: "Difícil medir ROI digital", impact: { riesgo: -2, analisis: -2 } },
        ],
      },
      {
        type: "resolucion_tecnica",
        title: "CTR por debajo del benchmark",
        context: "Después de una semana, el CTR es 0.4% (benchmark: 1.2%). El CEO pregunta por resultados.",
        situation: "¿Qué optimizas primero?",
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "A/B test de headlines y CTA en landing page", hint: "Optimización basada en datos", impact: { analisis: 3, estrategia: 2 } },
          { value: "b", label: "Duplicas el presupuesto sin cambiar nada", hint: "Escala un problema", impact: { analisis: -2, riesgo: 2 } },
          { value: "c", label: "Rediseñas todo el creativo desde cero", hint: "Pierdes datos de comparación", impact: { creatividad: 2, analisis: 0 } },
        ],
      },
      {
        type: "imprevisto",
        title: "Crisis de reputación",
        context: "Un influencer publica que el producto 'no es tan saludable'. El post tiene 50K views.",
        situation: "¿Cómo respondes en las primeras 2 horas?",
        image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Publicas evidencia nutricional verificada y ofreces transparencia total", hint: "Respuesta proactiva", impact: { comunicacion: 3, estrategia: 2, calma: 2 } },
          { value: "b", label: "Demandas al influencer legalmente", hint: "Puede amplificar la crisis", impact: { asertividad: 1, comunicacion: -2 } },
          { value: "c", label: "No respondes y esperas que pase", hint: "Daña la marca", impact: { comunicacion: -3, estrategia: -2 } },
        ],
      },
    ],
  },

  psicologia: {
    title: "Primera sesión clínica",
    description: "Atiendes a un adolescente de 16 años referido por su colegio por ansiedad y bajo rendimiento.",
    estimated_minutes: 12,
    intro: "Es tu consultorio. El paciente llega 10 minutos tarde, mira al piso y apenas habla.",
    blocks: [
      {
        type: "decision",
        title: "Romper el hielo",
        context: "El paciente está tenso, brazos cruzados, respuestas monosílabas.",
        situation: "¿Cómo generas un espacio seguro en los primeros 5 minutos?",
        image_url: IMG.therapy,
        options: [
          { value: "a", label: "Validas su nerviosismo y preguntas qué le gustaría lograr hoy", hint: "Enfoque centrado en el paciente", impact: { empatia: 3, comunicacion: 2 } },
          { value: "b", label: "Aplicas un cuestionario diagnóstico estructurado de inmediato", hint: "Puede aumentar la ansiedad", impact: { analisis: 1, empatia: -2 } },
          { value: "c", label: "Hablas de temas neutros (música, hobbies) sin presionar", hint: "Rapport gradual", impact: { empatia: 2, paciencia: 3 } },
        ],
      },
      {
        type: "resolucion_tecnica",
        title: "Señales de riesgo",
        context: "El paciente menciona 'a veces pienso que sería mejor si no estuviera'. Lo dice en voz baja.",
        situation: "¿Cómo evalúas y actúas ante esta declaración?",
        image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Exploras con preguntas directas pero empáticas sobre ideación e intentos", hint: "Evaluación de riesgo profesional", impact: { clinico: 3, empatia: 2, juicio: 2 } },
          { value: "b", label: "Cambias de tema para no incomodarlo", hint: "Omisión de señal crítica", impact: { juicio: -3, empatia: -1 } },
          { value: "c", label: "Activas protocolo de riesgo y contactas a su tutor hoy", hint: "Prioriza seguridad", impact: { juicio: 3, clinico: 2, protocolo: 2 } },
        ],
      },
      {
        type: "imprevisto",
        title: "La madre interrumpe",
        context: "La madre entra sin llamar exigiendo saber 'qué le pasa' a su hijo.",
        situation: "¿Cómo manejas la confidencialidad y los límites terapéuticos?",
        image_url: "https://images.unsplash.com/photo-1516307365426-bea7f780d9e5?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Explicas los límites de confidencialidad y ofreces una sesión familiar aparte", hint: "Límites profesionales claros", impact: { comunicacion: 3, asertividad: 2, empatia: 2 } },
          { value: "b", label: "Compartes lo que el paciente dijo para calmar a la madre", hint: "Rompe confidencialidad", impact: { juicio: -3, empatia: -1 } },
          { value: "c", label: "Pides que espere fuera sin explicar nada", hint: "Puede generar resistencia", impact: { asertividad: 1, comunicacion: -1 } },
        ],
      },
    ],
  },

  derecho: {
    title: "Audiencia inesperada",
    description: "Eres abogado junior en un estudio. Tu senior no puede asistir a una audiencia clave.",
    estimated_minutes: 12,
    intro: "Tienes 2 horas para prepararte. El caso involucra un contrato comercial de S/. 2 millones.",
    blocks: [
      {
        type: "decision",
        title: "Estrategia procesal",
        context: "El juez tiene agenda apretada. Tu cliente quiere 'ganar sí o sí' hoy.",
        situation: "¿Qué estrategia propones al cliente antes de entrar?",
        image_url: IMG.courtroom,
        options: [
          { value: "a", label: "Propones conciliación parcial para asegurar un acuerdo mínimo", hint: "Gestión de expectativas realista", impact: { estrategia: 3, comunicacion: 2 } },
          { value: "b", label: "Prometes victoria total sin reservas", hint: "Riesgo reputacional", impact: { asertividad: 1, juicio: -2 } },
          { value: "c", label: "Pides aplazamiento para preparar mejor el caso", hint: "Prudencia procesal", impact: { analisis: 2, juicio: 2 } },
        ],
      },
      {
        type: "resolucion_tecnica",
        title: "Prueba sorpresa",
        context: "La contraparte presenta un email que contradice la versión de tu cliente.",
        situation: "¿Cómo respondes en audiencia?",
        image_url: "https://images.unsplash.com/photo-1589391887765-840c3e8a6d70?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Solicitas verificación de autenticidad y tiempo para peritar", hint: "Defensa técnica sólida", impact: { analisis: 3, calma: 2 } },
          { value: "b", label: "Atacas la credibilidad del testigo emocionalmente", hint: "Puede irritar al juez", impact: { asertividad: 1, juicio: -2 } },
          { value: "c", label: "Admites el error y negocias en el acto", hint: "Honestidad estratégica", impact: { comunicacion: 2, juicio: 2, estrategia: 1 } },
        ],
      },
      {
        type: "imprevisto",
        title: "Conflicto de interés",
        context: "Descubres que tu cliente omitió información relevante que favorece a la contraparte.",
        situation: "¿Qué haces?",
        image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Informas al cliente de las consecuencias éticas y replantear la estrategia", hint: "Deontología profesional", impact: { juicio: 3, comunicacion: 2, etica: 3 } },
          { value: "b", label: "Ocultas la información y sigues adelante", hint: "Riesgo disciplinario", impact: { etica: -3, juicio: -2 } },
          { value: "c", label: "Consultas al socio senior por teléfono en el receso", hint: "Busca guía profesional", impact: { colaboracion: 2, juicio: 2 } },
        ],
      },
    ],
  },

  "diseno-grafico": {
    title: "Rebranding bajo presión",
    description: "Eres diseñador en una agencia. Un cliente importante rechazó la tercera propuesta.",
    estimated_minutes: 10,
    intro: "El deadline es mañana. El cliente dice que 'no transmite su esencia'. Tienes una última oportunidad.",
    blocks: [
      {
        type: "decision",
        title: "Entender el rechazo",
        context: "El feedback del cliente es vago: 'no me convence, no es lo que imaginaba'.",
        situation: "¿Cómo obtienes información útil para la siguiente propuesta?",
        image_url: IMG.design,
        options: [
          { value: "a", label: "Agendas call de 30 min con preguntas específicas sobre valores y referentes", hint: "Diseño centrado en necesidades", impact: { comunicacion: 3, empatia: 2 } },
          { value: "b", label: "Envías 5 variantes más sin preguntar", hint: "Dispersión de esfuerzo", impact: { creatividad: 1, analisis: -2 } },
          { value: "c", label: "Propones moodboard colaborativo con el cliente", hint: "Co-creación efectiva", impact: { creatividad: 3, comunicacion: 2, colaboracion: 2 } },
        ],
      },
      {
        type: "resolucion_tecnica",
        title: "Restricciones técnicas",
        context: "La propuesta ganadora debe funcionar en app móvil, web y señalética física.",
        situation: "¿Cómo abordas la versatilidad del sistema visual?",
        image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Diseñas un sistema modular con grid, tipografía y paleta escalable", hint: "Pensamiento de sistema", impact: { analisis: 3, creatividad: 2 } },
          { value: "b", label: "Adaptas manualmente cada formato sin sistema", hint: "Inconsistencia probable", impact: { creatividad: 0, analisis: -2 } },
          { value: "c", label: "Priorizas el logo y dejas formatos para después", hint: "Visión incompleta", impact: { estrategia: -1, creatividad: 1 } },
        ],
      },
      {
        type: "imprevisto",
        title: "Plagio accidental",
        context: "Un compañero nota que tu propuesta se parece mucho a una marca conocida.",
        situation: "¿Cómo actúas con 6 horas para el deadline?",
        image_url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Rediseñas desde cero con dirección conceptual diferente", hint: "Integridad creativa", impact: { creatividad: 3, etica: 2, calma: 1 } },
          { value: "b", label: "Haces ajustes menores y esperas que no se note", hint: "Riesgo legal y reputacional", impact: { etica: -3, juicio: -2 } },
          { value: "c", label: "Informas al cliente y propones extensión de 24h", hint: "Transparencia profesional", impact: { comunicacion: 3, etica: 2, asertividad: 2 } },
        ],
      },
    ],
  },

  administracion: {
    title: "Crisis operativa",
    description: "Eres gerente de operaciones en una cadena de retail. Las ventas cayeron 20% este trimestre.",
    estimated_minutes: 10,
    intro: "La junta directiva exige un plan de acción en 48 horas. Tienes datos de 15 sucursales.",
    blocks: [
      {
        type: "decision",
        title: "Diagnóstico inicial",
        context: "Hay rumores de problemas de inventario, mala atención y competencia agresiva.",
        situation: "¿Por dónde empiezas el análisis?",
        image_url: IMG.business,
        options: [
          { value: "a", label: "Dashboard con KPIs por sucursal: ventas, rotación, NPS, rotación de personal", hint: "Gestión basada en datos", impact: { analisis: 3, estrategia: 2 } },
          { value: "b", label: "Recortas personal en las 3 sucursales con peor desempeño", hint: "Solución reactiva", impact: { asertividad: 1, estrategia: -2 } },
          { value: "c", label: "Visitas sorpresa a sucursales para observar operación real", hint: "Gemba management", impact: { analisis: 2, liderazgo: 2, empatia: 1 } },
        ],
      },
      {
        type: "resolucion_tecnica",
        title: "Plan de recuperación",
        context: "Los datos muestran que el 60% de la caída viene de 4 sucursales en provincias.",
        situation: "¿Qué estrategia presentas a la junta?",
        image_url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Plan focalizado: capacitación, inventario just-in-time y marketing local", hint: "Intervención quirúrgica", impact: { estrategia: 3, analisis: 2, liderazgo: 2 } },
          { value: "b", label: "Descuentos masivos en toda la cadena", hint: "Erosiona margen", impact: { riesgo: 2, estrategia: -1 } },
          { value: "c", label: "Cierras las 4 sucursales problemáticas", hint: "Impacto social y de marca", impact: { asertividad: 2, empatia: -2, estrategia: 0 } },
        ],
      },
      {
        type: "imprevisto",
        title: "Huelga del personal",
        context: "El sindicato amenaza con paro por los rumores de despidos.",
        situation: "¿Cómo gestionas la comunicación interna?",
        image_url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Reunión transparente: explicas situación, escuchas y co-construyes plan", hint: "Liderazgo participativo", impact: { comunicacion: 3, liderazgo: 3, empatia: 2 } },
          { value: "b", label: "Comunicado formal sin espacio de diálogo", hint: "Puede escalar conflicto", impact: { comunicacion: -1, asertividad: 1 } },
          { value: "c", label: "Ignoras al sindicato y sigues con el plan", hint: "Alto riesgo operativo", impact: { liderazgo: -3, comunicacion: -2 } },
        ],
      },
    ],
  },

  "ciencia-datos": {
    title: "El modelo que miente",
    description: "Eres científico de datos en un banco. Tu modelo de scoring crediticio muestra sesgo.",
    estimated_minutes: 12,
    intro: "El modelo fue aprobado para producción. Un análisis post-hoc revela discriminación por zona geográfica.",
    blocks: [
      {
        type: "decision",
        title: "Hallazgo ético",
        context: "El modelo rechaza más solicitudes de ciertas zonas, aunque el AUC es excelente.",
        situation: "¿Cuál es tu primer paso?",
        image_url: IMG.data,
        options: [
          { value: "a", label: "Documentas el sesgo, alertas al comité de riesgo y pausas el deploy", hint: "Responsabilidad profesional", impact: { etica: 3, analisis: 3, asertividad: 2 } },
          { value: "b", label: "Ajustas el threshold y sigues adelante", hint: "Parche superficial", impact: { etica: -2, analisis: -1 } },
          { value: "c", label: "Investigas causas: features, datos de entrenamiento, proxies ocultos", hint: "Análisis profundo", impact: { analisis: 3, etica: 2, juicio: 2 } },
        ],
      },
      {
        type: "resolucion_tecnica",
        title: "Reentrenamiento",
        context: "El equipo comercial presiona: 'cada día sin el modelo perdemos S/. 200K'.",
        situation: "¿Cómo balanceas velocidad y equidad?",
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Reentrenas con técnicas de fairness + validación por subgrupos", hint: "Solución técnica rigurosa", impact: { analisis: 3, etica: 3, calidad: 2 } },
          { value: "b", label: "Eliminas la variable geográfica y redespliegas en 24h", hint: "Solución rápida pero incompleta", impact: { velocidad: 2, analisis: 0, etica: 1 } },
          { value: "c", label: "Mantienes el modelo y agregas revisión humana para casos borderline", hint: "Mitigación operativa", impact: { estrategia: 2, etica: 1, analisis: 1 } },
        ],
      },
      {
        type: "imprevisto",
        title: "Filtración interna",
        context: "Un colega sugiere 'no decir nada' porque el bonus del equipo depende del lanzamiento.",
        situation: "¿Cómo respondes?",
        image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Escalas formalmente al Chief Data Officer con evidencia", hint: "Integridad profesional", impact: { etica: 3, asertividad: 3, juicio: 2 } },
          { value: "b", label: "Aceptas y esperas a que nadie lo note", hint: "Riesgo regulatorio grave", impact: { etica: -3, juicio: -3 } },
          { value: "c", label: "Propones al equipo un plan de remediación con timeline realista", hint: "Liderazgo constructivo", impact: { liderazgo: 2, comunicacion: 2, etica: 2 } },
        ],
      },
    ],
  },

  enfermeria: {
    title: "Sala de cuidados intensivos",
    description: "Eres enfermera en UCI. Tienes 4 pacientes críticos y el turno está incompleto.",
    estimated_minutes: 12,
    intro: "Son las 3:00 AM. Una alarma suena. Otro paciente pide ayuda. El médico está en cirugía.",
    blocks: [
      {
        type: "decision",
        title: "Priorización",
        context: "Alarma de ventilador en cama 3. Paciente en cama 1 con dolor 9/10. Cama 4 con saturación bajando.",
        situation: "¿A quién atiendes primero?",
        image_url: IMG.nursing,
        options: [
          { value: "a", label: "Cama 4 (saturación) — riesgo vital inmediato", hint: "Triage correcto", impact: { clinico: 3, juicio: 3, protocolo: 2 } },
          { value: "b", label: "Cama 1 (dolor) — el paciente grita más fuerte", hint: "Sesgo por ruido", impact: { empatia: 1, juicio: -2 } },
          { value: "c", label: "Alarma cama 3 — puede ser falsa alarma", hint: "Evaluación incompleta", impact: { analisis: 0, juicio: -1 } },
        ],
      },
      {
        type: "resolucion_tecnica",
        title: "Procedimiento de emergencia",
        context: "Saturación del paciente en cama 4 baja a 85%. Tiene EPOC y neumonía.",
        situation: "¿Cuál es tu intervención inmediata?",
        image_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Aumentas FiO2, reposicionas, aspiras y llamas al médico", hint: "Protocolo UCI estándar", impact: { clinico: 3, protocolo: 3, calma: 2 } },
          { value: "b", label: "Intubas inmediatamente sin evaluar", hint: "Sobre-tratamiento", impact: { clinico: -1, juicio: -2 } },
          { value: "c", label: "Esperas a que el médico salga de cirugía", hint: "Retraso peligroso", impact: { juicio: -3, clinico: -2 } },
        ],
      },
      {
        type: "imprevisto",
        title: "Error de medicación",
        context: "Descubres que el turno anterior administró dosis doble de sedante a cama 2.",
        situation: "¿Cómo actúas?",
        image_url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Evalúas al paciente, documentas incidente y activas protocolo de evento adverso", hint: "Seguridad del paciente", impact: { protocolo: 3, clinico: 2, etica: 2 } },
          { value: "b", label: "No dices nada para no complicar al colega", hint: "Omisión grave", impact: { etica: -3, juicio: -3 } },
          { value: "c", label: "Solo monitoreas al paciente sin reportar formalmente", hint: "Mitigación incompleta", impact: { clinico: 1, protocolo: -2, etica: -1 } },
        ],
      },
    ],
  },
  "ing-sistemas": {
    title: "Caída del servidor en hora pico",
    description: "Eres ingeniero de sistemas. El ERP corporativo está caído y 200 usuarios no pueden trabajar.",
    estimated_minutes: 10,
    intro: "Son las 10:00 AM. El sistema de gestión empresarial no responde. El gerente general acaba de llamar.",
    blocks: [
      { type: "decision", title: "Diagnóstico inicial", context: "Los usuarios reportan lentitud desde las 8 AM. Ahora nadie puede entrar.", situation: "¿Cuál es tu primer paso?", image_url: IMG.code,
        options: [
          { value: "a", label: "Revisar logs del servidor y métricas de CPU/RAM", hint: "Enfoque técnico", impact: { analisis: 3, protocolo: 2 } },
          { value: "b", label: "Reiniciar todo el datacenter", hint: "Arriesgado", impact: { velocidad: 1, analisis: -2 } },
          { value: "c", label: "Comunicar a usuarios mientras investigas", hint: "Gestión + técnica", impact: { comunicacion: 3, analisis: 1 } },
        ]},
      { type: "resolucion_tecnica", title: "Causa raíz", context: "Los logs muestran disco lleno al 99%. La BD no puede escribir.", situation: "¿Cómo resuelves?", image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Limpias logs antiguos, expandes disco y monitoreas", hint: "Solución permanente", impact: { analisis: 3, calidad: 2 } },
          { value: "b", label: "Boras datos sin verificar", hint: "Riesgoso", impact: { velocidad: 2, calidad: -3 } },
          { value: "c", label: "Escalas a proveedor cloud para más almacenamiento", hint: "Rápido pero costoso", impact: { estrategia: 2, analisis: 1 } },
        ]},
      { type: "imprevisto", title: "Post-mortem", context: "El gerente pregunta por qué pasó y cómo evitarlo.", situation: "¿Qué presentas?", image_url: IMG.business,
        options: [
          { value: "a", label: "Informe con causa raíz, timeline y plan de prevención", hint: "Profesionalismo", impact: { comunicacion: 3, analisis: 2 } },
          { value: "b", label: "Dices que fue culpa del proveedor", hint: "Evita responsabilidad", impact: { comunicacion: -2 } },
          { value: "c", label: "Propones automatizar alertas de disco", hint: "Mejora proactiva", impact: { estrategia: 3, calidad: 2 } },
        ]},
    ],
  },
  nutricion: {
    title: "Consulta difícil",
    description: "Eres nutricionista en una clínica. Un paciente con diabetes tipo 2 no sigue su plan alimentario.",
    estimated_minutes: 10,
    intro: "Tu paciente llega con glucosa elevada y admite que 'no puede' seguir la dieta.",
    blocks: [
      { type: "decision", title: "Primer encuentro", context: "El paciente está frustrado y culpa a la dieta de ser 'imposible'.", situation: "¿Cómo abordas la consulta?", image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Escuchas sus hábitos reales y adaptas el plan gradualmente", hint: "Empatía clínica", impact: { empatia: 3, clinico: 2 } },
          { value: "b", label: "Insistes en que siga el plan original al pie de la letra", hint: "Rígido", impact: { clinico: -1, asertividad: 1 } },
          { value: "c", label: "Involucras a su familia en el plan alimentario", hint: "Enfoque sistémico", impact: { comunicacion: 3, empatia: 2 } },
        ]},
      { type: "resolucion_tecnica", title: "Plan personalizado", context: "Descubres que come fuera de casa 5 veces por semana.", situation: "¿Qué estrategia usas?", image_url: IMG.hospital,
        options: [
          { value: "a", label: "Guía de opciones saludables en restaurantes locales", hint: "Práctico", impact: { clinico: 3, estrategia: 2 } },
          { value: "b", label: "Le prohíbes comer fuera completamente", hint: "Poco realista", impact: { empatia: -2 } },
          { value: "c", label: "Meal prep semanal con recetas peruanas adaptadas", hint: "Culturalmente relevante", impact: { clinico: 2, creatividad: 2 } },
        ]},
      { type: "imprevisto", title: "Resultados de laboratorio", context: "Sus nuevos exámenes muestran mejora leve pero no suficiente.", situation: "¿Cómo motivas al paciente?", image_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Celebras los avances y ajustas metas a corto plazo", hint: "Motivacional", impact: { empatia: 3, comunicacion: 2 } },
          { value: "b", label: "Le muestras gráficos de riesgo cardiovascular", hint: "Datos duros", impact: { clinico: 2, comunicacion: 0 } },
          { value: "c", label: "Derivas a psicología para adherencia al tratamiento", hint: "Interdisciplinario", impact: { juicio: 3, colaboracion: 2 } },
        ]},
    ],
  },
  contabilidad: {
    title: "Cierre de mes bajo presión",
    description: "Eres contador senior. El cierre mensual vence mañana y hay discrepancias en cuentas por cobrar.",
    estimated_minutes: 10,
    intro: "Faltan 18 horas para el cierre. La diferencia es S/. 45,000 y el CFO quiere explicaciones.",
    blocks: [
      { type: "decision", title: "Discrepancia detectada", context: "El auxiliar contable reporta que los cobros no cuadran con facturación.", situation: "¿Qué haces primero?", image_url: IMG.business,
        options: [
          { value: "a", label: "Concilias cuenta por cuenta con documentos fuente", hint: "Rigor contable", impact: { analisis: 3, protocolo: 2 } },
          { value: "b", label: "Ajustas la diferencia como gasto menor", hint: "Antiético", impact: { etica: -3 } },
          { value: "c", label: "Convocas al equipo para dividir la investigación", hint: "Eficiencia", impact: { colaboracion: 3, analisis: 1 } },
        ]},
      { type: "resolucion_tecnica", title: "Hallazgo", context: "Encuentras facturas duplicadas en el sistema por error de carga.", situation: "¿Cómo procedes?", image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Documentas el error, corriges y propones control dual", hint: "Control interno", impact: { protocolo: 3, analisis: 2 } },
          { value: "b", label: "Lo arreglas sin informar para no retrasar el cierre", hint: "Omisión", impact: { etica: -2, velocidad: 1 } },
          { value: "c", label: "Reportas al auditor interno antes de cerrar", hint: "Transparencia", impact: { etica: 3, juicio: 2 } },
        ]},
      { type: "imprevisto", title: "Presión del CFO", context: "El CFO pide cerrar 'con o sin la diferencia' para la junta de mañana.", situation: "¿Cómo respondes?", image_url: IMG.business,
        options: [
          { value: "a", label: "Explicas el riesgo legal y presentas el cierre correcto con nota explicativa", hint: "Integridad", impact: { etica: 3, asertividad: 2 } },
          { value: "b", label: "Cedes a la presión y cierras con el error", hint: "Riesgo grave", impact: { etica: -3, juicio: -2 } },
          { value: "c", label: "Negocias 24h extra con informe preliminar para la junta", hint: "Negociación", impact: { comunicacion: 3, estrategia: 2 } },
        ]},
    ],
  },
  arquitectura: {
    title: "Presentación al cliente",
    description: "Eres arquitecto junior. Debes presentar el diseño de una vivienda social al municipio.",
    estimated_minutes: 12,
    intro: "Tu primer proyecto importante: 20 viviendas para familias de bajos recursos. La presentación es en 3 días.",
    blocks: [
      { type: "decision", title: "Concepto inicial", context: "El presupuesto es ajustado y el terreno tiene pendiente del 15%.", situation: "¿Qué priorizas en el diseño?", image_url: IMG.architecture,
        options: [
          { value: "a", label: "Funcionalidad y ventilación natural sobre estética", hint: "Diseño social", impact: { estrategia: 3, empatia: 2 } },
          { value: "b", label: "Fachada impactante para impresionar al municipio", hint: "Superficial", impact: { creatividad: 2, estrategia: -1 } },
          { value: "c", label: "Módulos prefabricados para reducir costos", hint: "Innovación", impact: { analisis: 3, estrategia: 2 } },
        ]},
      { type: "resolucion_tecnica", title: "Problema estructural", context: "El ingeniero civil señala que tu propuesta de voladizo no es viable en el terreno.", situation: "¿Cómo ajustas?", image_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Rediseñas integrando la topografía del terreno", hint: "Adaptabilidad", impact: { creatividad: 3, colaboracion: 2 } },
          { value: "b", label: "Insistes en tu diseño original", hint: "Terquedad", impact: { colaboracion: -2 } },
          { value: "c", label: "Propones terrazas escalonadas que aprovechan la pendiente", hint: "Solución creativa", impact: { creatividad: 3, analisis: 2 } },
        ]},
      { type: "imprevisto", title: "Vecinos en oposición", context: "Vecinos del sector protestan porque 'las casas taparán su vista al mar'.", situation: "¿Cómo gestionas?", image_url: IMG.architecture,
        options: [
          { value: "a", label: "Organizas taller participativo con vecinos y municipio", hint: "Participación", impact: { comunicacion: 3, empatia: 2 } },
          { value: "b", label: "Ignoras la protesta y sigues con el plan", hint: "Conflicto", impact: { comunicacion: -3 } },
          { value: "c", label: "Ajustas alturas y agregas áreas verdes compartidas", hint: "Mediación", impact: { estrategia: 3, empatia: 2 } },
        ]},
    ],
  },
  publicidad: {
    title: "Campaña viral o crisis",
    description: "Eres creativo en una agencia. Tu campaña para una marca de bebidas puede volverse viral o ofensiva.",
    estimated_minutes: 10,
    intro: "Presentas mañana el concepto creativo. El brief pide 'algo nunca visto' para millennials peruanos.",
    blocks: [
      { type: "decision", title: "Concepto creativo", context: "Tu idea usa humor limeño que podría interpretarse de forma controvertida.", situation: "¿Qué presentas?", image_url: IMG.marketing,
        options: [
          { value: "a", label: "Versión audaz + versión segura, dejas que el cliente elija", hint: "Estrategia dual", impact: { creatividad: 3, estrategia: 2 } },
          { value: "b", label: "Solo la versión más provocadora", hint: "Alto riesgo", impact: { creatividad: 2, riesgo: 3 } },
          { value: "c", label: "Investigas con focus group antes de presentar", hint: "Validación", impact: { analisis: 3, estrategia: 2 } },
        ]},
      { type: "resolucion_tecnica", title: "Producción ajustada", context: "El presupuesto se redujo 40% a último momento.", situation: "¿Cómo adaptas la campaña?", image_url: IMG.design,
        options: [
          { value: "a", label: "Pivotas a contenido digital y UGC en vez de TV", hint: "Agilidad", impact: { estrategia: 3, creatividad: 2 } },
          { value: "b", label: "Cancelas la campaña", hint: "Derrota", impact: { asertividad: -2 } },
          { value: "c", label: "Negocias extension de plazo a cambio de reducir scope", hint: "Negociación", impact: { comunicacion: 3, estrategia: 1 } },
        ]},
      { type: "imprevisto", title: "Backlash en redes", context: "Un influencer publica que tu campaña es 'insensible'. 10K comentarios negativos.", situation: "¿Respuesta de crisis?", image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Pausas campaña, investigas y publicas disculpa genuina", hint: "Crisis management", impact: { comunicacion: 3, juicio: 2 } },
          { value: "b", label: "Responde agresivamente al influencer", hint: "Escala crisis", impact: { comunicacion: -3 } },
          { value: "c", label: "Reformulas mensaje con voces de la comunidad afectada", hint: "Reparación", impact: { empatia: 3, creatividad: 2 } },
        ]},
    ],
  },
  educacion: {
    title: "El alumno que no aprende",
    description: "Eres docente de secundaria. Un estudiante brillante pero desmotivado está por reprobar.",
    estimated_minutes: 10,
    intro: "Faltan 3 semanas para fin de periodo. Carlos tiene talento pero no entrega trabajos desde hace 2 meses.",
    blocks: [
      { type: "decision", title: "Primer acercamiento", context: "Carlos evita mirarte y dice 'a mí no me importa la escuela'.", situation: "¿Cómo lo abordas?", image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Conversación privada preguntando qué le pasa, sin juzgar", hint: "Conexión humana", impact: { empatia: 3, comunicacion: 2 } },
          { value: "b", label: "Llamas a sus padres inmediatamente", hint: "Puede empeorar", impact: { empatia: -1, protocolo: 1 } },
          { value: "c", label: "Le asignas un proyecto sobre algo que le apasiona", hint: "Motivación intrínseca", impact: { creatividad: 3, empatia: 2 } },
        ]},
      { type: "resolucion_tecnica", title: "Plan de recuperación", context: "Descubres que trabaja por las noches para ayudar a su familia.", situation: "¿Qué adaptación haces?", image_url: "https://images.unsplash.com/photo-1427504490245-70e4b028abf5?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Flexibilizas plazos y ofreces tutoría en horario alternativo", hint: "Inclusión", impact: { empatia: 3, estrategia: 2 } },
          { value: "b", label: "Aplicas las mismas reglas que a todos", hint: "Rígido", impact: { empatia: -2 } },
          { value: "c", label: "Conectas el contenido con su meta de ayudar a su familia", hint: "Relevancia", impact: { creatividad: 2, empatia: 3 } },
        ]},
      { type: "imprevisto", title: "Conflicto en el aula", context: "Carlos confronta a un compañero que se burló de su situación económica.", situation: "¿Cómo intervienes?", image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Separas, escuchas a ambos y trabajas empatía en clase", hint: "Mediación pedagógica", impact: { empatia: 3, liderazgo: 2 } },
          { value: "b", label: "Castigas solo a Carlos por agresión", hint: "Injusto", impact: { juicio: -2 } },
          { value: "c", label: "Activas protocolo de convivencia escolar", hint: "Protocolo", impact: { protocolo: 3, juicio: 1 } },
        ]},
    ],
  },
  "ing-civil": {
    title: "Obra con retraso",
    description: "Eres ingeniero civil residente de obra. Un puente peatonal lleva 2 meses de retraso.",
    estimated_minutes: 12,
    intro: "La municipalidad exige entrega en 30 días. La estructura está al 60% y llueve constantemente.",
    blocks: [
      { type: "decision", title: "Lluvia persistente", context: "Llevan 5 días de lluvia. El hormigonado programado para hoy es crítico.", situation: "¿Decides hormigonar?", image_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Pospones y proteges la estructura; reprogramas con contingencia", hint: "Calidad primero", impact: { calidad: 3, juicio: 2 } },
          { value: "b", label: "Hormigonas bajo lluvia para no perder tiempo", hint: "Riesgo estructural", impact: { calidad: -3, velocidad: 2 } },
          { value: "c", label: "Usas aditivos y carpas, ajustando mezcla", hint: "Solución técnica", impact: { analisis: 3, calidad: 2 } },
        ]},
      { type: "resolucion_tecnica", title: "Material defectuoso", context: "El acero recibido no cumple especificaciones del proyecto.", situation: "¿Qué haces?", image_url: IMG.architecture,
        options: [
          { value: "a", label: "Rechazas el lote, documentas y exiges reemplazo", hint: "Estándares", impact: { protocolo: 3, calidad: 3 } },
          { value: "b", label: "Lo usas para no retrasar más la obra", hint: "Peligroso", impact: { etica: -3, calidad: -3 } },
          { value: "c", label: "Pruebas de laboratorio antes de decidir", hint: "Rigor", impact: { analisis: 3, protocolo: 2 } },
        ]},
      { type: "imprevisto", title: "Protesta de comunidad", context: "Vecinos bloquean el acceso exigiendo contratación local.", situation: "¿Cómo gestionas?", image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Reúnes a municipalidad, empresa y comunidad para acuerdo", hint: "Negociación social", impact: { comunicacion: 3, liderazgo: 2 } },
          { value: "b", label: "Llamas a la policía para desbloquear", hint: "Escala conflicto", impact: { empatia: -3 } },
          { value: "c", label: "Propones cuota de mano de obra local al contratista", hint: "Solución pragmática", impact: { estrategia: 3, empatia: 2 } },
        ]},
    ],
  },
  "ing-industrial": {
    title: "Optimizar o despedir",
    description: "Eres ingeniero industrial. La planta tiene 15% de desperdicio y el director pide reducir personal.",
    estimated_minutes: 12,
    intro: "Producción está 20% por debajo del target. El director quiere recortar 10 operarios.",
    blocks: [
      { type: "decision", title: "Análisis inicial", context: "Tienes datos de 6 meses de producción, desperdicio y tiempos muertos.", situation: "¿Por dónde empiezas?", image_url: IMG.business,
        options: [
          { value: "a", label: "Mapeas el proceso completo (value stream mapping)", hint: "Lean thinking", impact: { analisis: 3, estrategia: 2 } },
          { value: "b", label: "Aceptas el recorte de personal solicitado", hint: "Solución superficial", impact: { empatia: -2, velocidad: 1 } },
          { value: "c", label: "Hablas con operarios para entender cuellos de botella", hint: "Gemba", impact: { empatia: 2, analisis: 2 } },
        ]},
      { type: "resolucion_tecnica", title: "Cuello de botella", context: "Identificas que el 60% del desperdicio viene de una máquina mal calibrada.", situation: "¿Tu propuesta?", image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Mantenimiento preventivo + capacitación de operarios", hint: "Solución raíz", impact: { analisis: 3, estrategia: 3 } },
          { value: "b", label: "Compras máquina nueva sin analizar alternativas", hint: "Costoso", impact: { estrategia: 0, analisis: -1 } },
          { value: "c", label: "Rediseñas layout para reducir movimientos innecesarios", hint: "Eficiencia", impact: { estrategia: 2, analisis: 2 } },
        ]},
      { type: "imprevisto", title: "Resistencia al cambio", context: "Operarios veteranos se niegan a seguir el nuevo procedimiento.", situation: "¿Cómo implementas?", image_url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&h=500&fit=crop",
        options: [
          { value: "a", label: "Involucras a veteranos como champions del cambio", hint: "Gestión del cambio", impact: { liderazgo: 3, comunicacion: 2 } },
          { value: "b", label: "Impones con sanciones", hint: "Resistencia", impact: { liderazgo: -2, empatia: -2 } },
          { value: "c", label: "Pilotas en un turno y demuestras resultados con datos", hint: "Evidencia", impact: { estrategia: 3, analisis: 2 } },
        ]},
    ],
  },
};

export function richSimId(slug: string) {
  return `rich-${slug}`;
}

export function isRichSimId(id: string) {
  return id.startsWith("rich-");
}

export function slugFromRichSimId(id: string) {
  return id.replace(/^rich-/, "");
}
