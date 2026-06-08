-- =====================================================================
-- Seed extendido: banco completo de carreras, preguntas, simulaciones.
-- Idempotente — se puede correr varias veces.
-- =====================================================================

-- ---------- CARRERAS (catálogo amplio con fichas reales) ----------
insert into public.careers
  (slug,name,area,description,avg_salary_pen,employability_score,demand_projection,universities,estimated_cost_pen,duration_years,related_careers)
values
('ing-sistemas','Ingeniería de Sistemas','Ingeniería','Diseño, implementación y mantenimiento de sistemas computacionales empresariales.',5800,86,'alta',
 '[{"name":"UNI","city":"Lima"},{"name":"UNMSM","city":"Lima"},{"name":"PUCP","city":"Lima"}]'::jsonb,
 26000,5,'{ing-software,ciencia-datos}'),
('ciencia-datos','Ciencia de Datos','Ingeniería','Análisis de grandes volúmenes de datos para apoyar decisiones de negocio.',7200,90,'alta',
 '[{"name":"PUCP","city":"Lima"},{"name":"UTEC","city":"Lima"},{"name":"UPC","city":"Lima"}]'::jsonb,
 30000,5,'{ing-software,estadistica}'),
('enfermeria','Enfermería','Salud','Cuidado integral de pacientes en hospitales y clínicas.',2800,85,'alta',
 '[{"name":"UPCH","city":"Lima"},{"name":"USMP","city":"Lima"}]'::jsonb,
 18000,5,'{medicina,nutricion}'),
('nutricion','Nutrición y Dietética','Salud','Asesoramiento alimentario y planes nutricionales.',3000,70,'media',
 '[{"name":"UNMSM","city":"Lima"},{"name":"USMP","city":"Lima"}]'::jsonb,
 19000,5,'{enfermeria,medicina}'),
('derecho','Derecho','Ciencias Sociales','Asesoría legal y litigios civiles, penales y corporativos.',4500,75,'media',
 '[{"name":"PUCP","city":"Lima"},{"name":"UL","city":"Lima"},{"name":"UNMSM","city":"Lima"}]'::jsonb,
 28000,6,'{ciencias-politicas,administracion}'),
('marketing','Marketing','Negocios','Estrategias de posicionamiento de marca y campañas comerciales.',4800,82,'alta',
 '[{"name":"UPC","city":"Lima"},{"name":"UPN","city":"Lima"}]'::jsonb,
 24000,5,'{administracion,publicidad}'),
('contabilidad','Contabilidad','Negocios','Gestión financiera, tributaria y de auditoría.',4200,80,'media',
 '[{"name":"UNMSM","city":"Lima"},{"name":"USMP","city":"Lima"}]'::jsonb,
 20000,5,'{administracion,economia}'),
('arquitectura','Arquitectura','Arte y Diseño','Diseño y construcción de espacios habitables.',5000,72,'media',
 '[{"name":"URP","city":"Lima"},{"name":"PUCP","city":"Lima"}]'::jsonb,
 32000,6,'{ing-civil,diseno-grafico}'),
('publicidad','Publicidad','Arte y Diseño','Creación de campañas y narrativas de marca.',3800,68,'media',
 '[{"name":"UPC","city":"Lima"},{"name":"ISIL","city":"Lima"}]'::jsonb,
 22000,4,'{marketing,diseno-grafico}'),
('educacion','Educación','Ciencias Sociales','Enseñanza y formación de niños, adolescentes y adultos.',2600,65,'media',
 '[{"name":"PUCP","city":"Lima"},{"name":"UNMSM","city":"Lima"}]'::jsonb,
 17000,5,'{psicologia,trabajo-social}'),
('ing-civil','Ingeniería Civil','Ingeniería','Diseño y construcción de infraestructura urbana.',6800,84,'alta',
 '[{"name":"UNI","city":"Lima"},{"name":"PUCP","city":"Lima"}]'::jsonb,
 30000,5,'{arquitectura,ing-industrial}'),
('ing-industrial','Ingeniería Industrial','Ingeniería','Optimización de procesos productivos y de servicios.',6200,88,'alta',
 '[{"name":"PUCP","city":"Lima"},{"name":"UL","city":"Lima"},{"name":"UPC","city":"Lima"}]'::jsonb,
 28000,5,'{ing-civil,administracion}')
on conflict (slug) do nothing;

-- ---------- BANCO DE PREGUNTAS DE DIAGNÓSTICO (Q6..Q15) ----------
insert into public.diagnostic_questions (code,text,dimension,options) values
('Q6','¿Qué entorno laboral prefieres?','valores',
 '[{"value":"a","label":"Oficina con equipo","weights":{"Negocios":2,"Ingeniería":1}},
   {"value":"b","label":"Hospital / clínica","weights":{"Salud":3}},
   {"value":"c","label":"Estudio creativo","weights":{"Arte y Diseño":3}},
   {"value":"d","label":"Aula / centro educativo","weights":{"Ciencias Sociales":3}}]'::jsonb),
('Q7','¿Cuál de estos retos te emociona más?','intereses',
 '[{"value":"a","label":"Construir una app que usen miles","weights":{"Ingeniería":3}},
   {"value":"b","label":"Diagnosticar una enfermedad rara","weights":{"Salud":3}},
   {"value":"c","label":"Lanzar un negocio propio","weights":{"Negocios":3}},
   {"value":"d","label":"Diseñar un libro o cortometraje","weights":{"Arte y Diseño":3}}]'::jsonb),
('Q8','Cuando aprendes algo nuevo prefieres...','aptitudes',
 '[{"value":"a","label":"Entender la teoría a fondo","weights":{"Ingeniería":2,"Salud":1}},
   {"value":"b","label":"Practicar con ejemplos","weights":{"Negocios":2}},
   {"value":"c","label":"Discutirlo con otros","weights":{"Ciencias Sociales":2}},
   {"value":"d","label":"Hacer una versión visual","weights":{"Arte y Diseño":2}}]'::jsonb),
('Q9','Tu fortaleza principal es...','aptitudes',
 '[{"value":"a","label":"Pensamiento lógico","weights":{"Ingeniería":3}},
   {"value":"b","label":"Memoria y detalle","weights":{"Salud":2,"Ciencias Sociales":1}},
   {"value":"c","label":"Comunicación","weights":{"Negocios":3,"Ciencias Sociales":2}},
   {"value":"d","label":"Imaginación","weights":{"Arte y Diseño":3}}]'::jsonb),
('Q10','¿Qué tipo de impacto buscas?','valores',
 '[{"value":"a","label":"Tecnológico","weights":{"Ingeniería":3}},
   {"value":"b","label":"Humano / salud","weights":{"Salud":3}},
   {"value":"c","label":"Económico","weights":{"Negocios":3}},
   {"value":"d","label":"Cultural","weights":{"Arte y Diseño":3,"Ciencias Sociales":1}}]'::jsonb),
('Q11','¿Cuánto te interesa hacer cálculos diariamente?','aptitudes',
 '[{"value":"a","label":"Mucho","weights":{"Ingeniería":3,"Negocios":2}},
   {"value":"b","label":"Algo","weights":{"Salud":1,"Negocios":1}},
   {"value":"c","label":"Poco","weights":{"Ciencias Sociales":2,"Arte y Diseño":2}}]'::jsonb),
('Q12','¿Prefieres trabajar con personas o con datos?','intereses',
 '[{"value":"a","label":"Personas","weights":{"Salud":2,"Ciencias Sociales":3}},
   {"value":"b","label":"Datos","weights":{"Ingeniería":3}},
   {"value":"c","label":"Ambos por igual","weights":{"Negocios":2}}]'::jsonb),
('Q13','¿Qué te gustaría hacer en tu día a día?','intereses',
 '[{"value":"a","label":"Investigar y experimentar","weights":{"Salud":2,"Ingeniería":2}},
   {"value":"b","label":"Negociar y vender","weights":{"Negocios":3}},
   {"value":"c","label":"Crear contenido","weights":{"Arte y Diseño":3}},
   {"value":"d","label":"Enseñar / asesorar","weights":{"Ciencias Sociales":3}}]'::jsonb),
('Q14','En cuanto a estabilidad vs riesgo prefieres...','valores',
 '[{"value":"a","label":"Estabilidad","weights":{"Salud":1,"Ciencias Sociales":2}},
   {"value":"b","label":"Equilibrio","weights":{"Negocios":2,"Ingeniería":1}},
   {"value":"c","label":"Asumir riesgo","weights":{"Arte y Diseño":2,"Negocios":2}}]'::jsonb),
('Q15','¿Cuánto tiempo estás dispuesto a estudiar?','valores',
 '[{"value":"a","label":"4 años o menos","weights":{"Arte y Diseño":2,"Negocios":1}},
   {"value":"b","label":"5 años","weights":{"Ingeniería":2,"Negocios":2}},
   {"value":"c","label":"6+ años","weights":{"Salud":3}}]'::jsonb)
on conflict (code) do nothing;

-- ---------- BANCO COGNITIVO (C5..C16) ----------
insert into public.cognitive_questions (code,text,capacity,difficulty,options) values
('C5','¿Cuál es el siguiente: 3,9,27,81,...?','numérico',3,
 '[{"value":"a","label":"162","is_correct":false},{"value":"b","label":"243","is_correct":true},
   {"value":"c","label":"108","is_correct":false},{"value":"d","label":"324","is_correct":false}]'::jsonb),
('C6','Si A=1, B=2, ..., ¿cuánto vale ABA?','numérico',2,
 '[{"value":"a","label":"4","is_correct":true},{"value":"b","label":"5","is_correct":false},
   {"value":"c","label":"6","is_correct":false},{"value":"d","label":"3","is_correct":false}]'::jsonb),
('C7','Antónimo de "magnánimo":','verbal',4,
 '[{"value":"a","label":"Generoso","is_correct":false},{"value":"b","label":"Mezquino","is_correct":true},
   {"value":"c","label":"Audaz","is_correct":false},{"value":"d","label":"Sereno","is_correct":false}]'::jsonb),
('C8','Completa: la abeja es a la colmena como el león es a...','verbal',2,
 '[{"value":"a","label":"Bosque","is_correct":false},{"value":"b","label":"Manada","is_correct":true},
   {"value":"c","label":"Selva","is_correct":false},{"value":"d","label":"Pradera","is_correct":false}]'::jsonb),
('C9','Una pieza con forma de L cabe en una grilla 3x3. ¿Cuántas rotaciones únicas tiene?','espacial',3,
 '[{"value":"a","label":"2","is_correct":false},{"value":"b","label":"4","is_correct":true},
   {"value":"c","label":"6","is_correct":false},{"value":"d","label":"8","is_correct":false}]'::jsonb),
('C10','¿Cuál figura NO encaja en el grupo (círculo, óvalo, cuadrado, esfera)?','abstracto',2,
 '[{"value":"a","label":"Cuadrado","is_correct":true},{"value":"b","label":"Círculo","is_correct":false},
   {"value":"c","label":"Óvalo","is_correct":false},{"value":"d","label":"Esfera","is_correct":false}]'::jsonb),
('C11','Si Juan tiene el doble de años que María y juntos suman 36, ¿cuántos años tiene María?','numérico',3,
 '[{"value":"a","label":"10","is_correct":false},{"value":"b","label":"12","is_correct":true},
   {"value":"c","label":"14","is_correct":false},{"value":"d","label":"18","is_correct":false}]'::jsonb),
('C12','Palabra que NO pertenece: lago, río, mar, montaña.','verbal',1,
 '[{"value":"a","label":"Lago","is_correct":false},{"value":"b","label":"Río","is_correct":false},
   {"value":"c","label":"Mar","is_correct":false},{"value":"d","label":"Montaña","is_correct":true}]'::jsonb),
('C13','Patrón: 1,1,2,3,5,8,...','abstracto',3,
 '[{"value":"a","label":"11","is_correct":false},{"value":"b","label":"13","is_correct":true},
   {"value":"c","label":"15","is_correct":false},{"value":"d","label":"21","is_correct":false}]'::jsonb),
('C14','Doblar un papel a la mitad 3 veces produce cuántas capas:','espacial',2,
 '[{"value":"a","label":"4","is_correct":false},{"value":"b","label":"6","is_correct":false},
   {"value":"c","label":"8","is_correct":true},{"value":"d","label":"16","is_correct":false}]'::jsonb),
('C15','Si "todos los X son Y" y "algunos Y son Z", se concluye que:','verbal',5,
 '[{"value":"a","label":"Algunos X son Z","is_correct":false},{"value":"b","label":"Ningún X es Z","is_correct":false},
   {"value":"c","label":"No se puede concluir","is_correct":true},{"value":"d","label":"Todos los X son Z","is_correct":false}]'::jsonb),
('C16','15% de 80 es:','numérico',1,
 '[{"value":"a","label":"10","is_correct":false},{"value":"b","label":"12","is_correct":true},
   {"value":"c","label":"15","is_correct":false},{"value":"d","label":"20","is_correct":false}]'::jsonb)
on conflict (code) do nothing;

-- ---------- SIMULACIONES adicionales ----------

-- Medicina
insert into public.simulations (career_id, title, description, blocks)
select id, 'Un día en emergencias',
       'Eres residente de medicina. Atiende casos críticos tomando decisiones acertadas.',
       '[
         {"type":"decision","situation":"Llega un paciente con dolor torácico agudo. ¿Tu primera acción?",
          "options":[
            {"value":"a","label":"Pedir un ECG inmediato","impact":{"clinico":3,"protocolo":2}},
            {"value":"b","label":"Indicar analgésico fuerte","impact":{"clinico":-2}},
            {"value":"c","label":"Esperar al especialista","impact":{"asertividad":-2}}
          ]},
         {"type":"resolucion_tecnica","situation":"El ECG sugiere infarto. ¿Qué haces?",
          "options":[
            {"value":"a","label":"Iniciar protocolo STEMI","impact":{"clinico":3}},
            {"value":"b","label":"Pedir más exámenes","impact":{"clinico":-1}},
            {"value":"c","label":"Derivar a otro hospital","impact":{"juicio":-2}}
          ]},
         {"type":"imprevisto","situation":"Familiares exigen información en pasillo, mientras estabilizas al paciente.",
          "options":[
            {"value":"a","label":"Pedir a enfermería que los acompañe a sala","impact":{"empatia":3,"comunicación":2}},
            {"value":"b","label":"Detener todo y hablar con ellos","impact":{"clinico":-3}},
            {"value":"c","label":"Ignorar y seguir","impact":{"empatia":-3}}
          ]}
       ]'::jsonb
from public.careers where slug='medicina'
on conflict do nothing;

-- Marketing
insert into public.simulations (career_id, title, description, blocks)
select id, 'Lanzas una campaña',
       'Eres responsable de marketing y debes lanzar una campaña con presupuesto limitado.',
       '[
         {"type":"decision","situation":"Tienes S/. 10000 y dos canales. ¿Cómo asignas?",
          "options":[
            {"value":"a","label":"100% Instagram","impact":{"riesgo":2,"alcance":2}},
            {"value":"b","label":"50/50 Instagram y Google","impact":{"estrategia":3}},
            {"value":"c","label":"Todo en TV","impact":{"alcance":-2}}
          ]},
         {"type":"resolucion_tecnica","situation":"El CTR de tus anuncios es muy bajo. ¿Qué cambias?",
          "options":[
            {"value":"a","label":"El copy y el call to action","impact":{"analisis":3}},
            {"value":"b","label":"Subes el presupuesto","impact":{"analisis":-1}},
            {"value":"c","label":"Cambias todo el creativo","impact":{"creatividad":2,"analisis":1}}
          ]}
       ]'::jsonb
from public.careers where slug='marketing'
on conflict do nothing;

-- Psicología
insert into public.simulations (career_id, title, description, blocks)
select id, 'Primera sesión clínica',
       'Atiendes a un nuevo paciente. Debes generar confianza y diagnosticar.',
       '[
         {"type":"decision","situation":"El paciente llega ansioso y evita el contacto visual.",
          "options":[
            {"value":"a","label":"Esperar en silencio","impact":{"empatia":3}},
            {"value":"b","label":"Hacer preguntas directas","impact":{"empatia":-1,"analisis":1}},
            {"value":"c","label":"Ofrecer agua y hablar de algo neutro","impact":{"empatia":2,"comunicación":2}}
          ]},
         {"type":"imprevisto","situation":"El paciente revela una crisis personal grave.",
          "options":[
            {"value":"a","label":"Activar protocolo de derivación","impact":{"juicio":3}},
            {"value":"b","label":"Profundizar en la siguiente sesión","impact":{"juicio":-1}},
            {"value":"c","label":"Pedir ayuda a colega","impact":{"colaboracion":3}}
          ]}
       ]'::jsonb
from public.careers where slug='psicologia'
on conflict do nothing;
