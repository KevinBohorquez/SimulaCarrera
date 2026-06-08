-- =====================================================================
-- Seed mínimo: carreras, preguntas de diagnóstico, cognitivas, simulación.
-- =====================================================================

insert into public.careers (slug,name,area,description,avg_salary_pen,employability_score,demand_projection,universities,estimated_cost_pen,duration_years,related_careers)
values
('ing-software','Ingeniería de Software','Ingeniería','Diseño y desarrollo de sistemas de software.',6500,88,'alta',
 '[{"name":"PUCP","city":"Lima"},{"name":"UNI","city":"Lima"},{"name":"UTEC","city":"Lima"}]'::jsonb,
 28000,5,'{ing-sistemas,ciencia-datos}'),
('medicina','Medicina Humana','Salud','Diagnóstico, tratamiento y prevención de enfermedades.',8500,92,'alta',
 '[{"name":"UPCH","city":"Lima"},{"name":"USMP","city":"Lima"}]'::jsonb,
 45000,7,'{enfermeria,nutricion}'),
('psicologia','Psicología','Ciencias Sociales','Estudio del comportamiento humano.',3800,72,'media',
 '[{"name":"PUCP","city":"Lima"},{"name":"UPC","city":"Lima"}]'::jsonb,
 22000,5,'{trabajo-social,educacion}'),
('administracion','Administración de Empresas','Negocios','Gestión de organizaciones.',5200,80,'alta',
 '[{"name":"Pacífico","city":"Lima"},{"name":"ESAN","city":"Lima"}]'::jsonb,
 30000,5,'{marketing,contabilidad}'),
('diseno-grafico','Diseño Gráfico','Arte y Diseño','Comunicación visual.',3200,65,'media',
 '[{"name":"Toulouse","city":"Lima"},{"name":"USIL","city":"Lima"}]'::jsonb,
 18000,4,'{publicidad,multimedia}')
on conflict (slug) do nothing;

insert into public.diagnostic_questions (code,text,dimension,options) values
('Q1','¿Qué tipo de actividades disfrutas más?','intereses',
 '[{"value":"a","label":"Resolver problemas lógicos","weights":{"Ingeniería":3,"Negocios":1}},
   {"value":"b","label":"Ayudar a personas","weights":{"Salud":3,"Ciencias Sociales":2}},
   {"value":"c","label":"Crear y diseñar","weights":{"Arte y Diseño":3}},
   {"value":"d","label":"Liderar equipos","weights":{"Negocios":3}}]'::jsonb),
('Q2','¿Cómo te describirías?','aptitudes',
 '[{"value":"a","label":"Analítico","weights":{"Ingeniería":2,"Salud":1}},
   {"value":"b","label":"Empático","weights":{"Salud":2,"Ciencias Sociales":3}},
   {"value":"c","label":"Creativo","weights":{"Arte y Diseño":3}},
   {"value":"d","label":"Persuasivo","weights":{"Negocios":3}}]'::jsonb),
('Q3','En un proyecto grupal sueles...','aptitudes',
 '[{"value":"a","label":"Planificar y organizar","weights":{"Negocios":2,"Ingeniería":1}},
   {"value":"b","label":"Proponer ideas novedosas","weights":{"Arte y Diseño":2}},
   {"value":"c","label":"Mediar conflictos","weights":{"Ciencias Sociales":3}},
   {"value":"d","label":"Hacer lo técnico","weights":{"Ingeniería":3}}]'::jsonb),
('Q4','¿Qué materia se te da mejor?','aptitudes',
 '[{"value":"a","label":"Matemáticas","weights":{"Ingeniería":3,"Negocios":1}},
   {"value":"b","label":"Biología","weights":{"Salud":3}},
   {"value":"c","label":"Literatura","weights":{"Ciencias Sociales":2,"Arte y Diseño":1}},
   {"value":"d","label":"Arte","weights":{"Arte y Diseño":3}}]'::jsonb),
('Q5','¿Qué te motiva profesionalmente?','valores',
 '[{"value":"a","label":"Impacto social","weights":{"Salud":2,"Ciencias Sociales":2}},
   {"value":"b","label":"Ingresos altos","weights":{"Negocios":2,"Ingeniería":2}},
   {"value":"c","label":"Creatividad","weights":{"Arte y Diseño":3}},
   {"value":"d","label":"Innovación","weights":{"Ingeniería":3}}]'::jsonb)
on conflict (code) do nothing;

insert into public.cognitive_questions (code,text,capacity,difficulty,options) values
('C1','¿Cuál sigue en la serie: 2,4,8,16,...?','numérico',2,
 '[{"value":"a","label":"24","is_correct":false},{"value":"b","label":"32","is_correct":true},
   {"value":"c","label":"30","is_correct":false},{"value":"d","label":"20","is_correct":false}]'::jsonb),
('C2','Sinónimo de "efímero":','verbal',3,
 '[{"value":"a","label":"Eterno","is_correct":false},{"value":"b","label":"Pasajero","is_correct":true},
   {"value":"c","label":"Sólido","is_correct":false},{"value":"d","label":"Brillante","is_correct":false}]'::jsonb),
('C3','Si rotas un cubo 90° a la derecha, la cara superior pasa a estar...','espacial',3,
 '[{"value":"a","label":"Abajo","is_correct":false},{"value":"b","label":"Al frente","is_correct":false},
   {"value":"c","label":"A la derecha","is_correct":true},{"value":"d","label":"Atrás","is_correct":false}]'::jsonb),
('C4','¿Qué figura completa el patrón?','abstracto',4,
 '[{"value":"a","label":"Círculo","is_correct":false},{"value":"b","label":"Triángulo","is_correct":true},
   {"value":"c","label":"Cuadrado","is_correct":false},{"value":"d","label":"Hexágono","is_correct":false}]'::jsonb)
on conflict (code) do nothing;

-- Simulación de Ing. Software
insert into public.simulations (career_id, title, description, blocks)
select id, 'Un día como desarrollador',
       'Eres parte de un equipo y debes tomar decisiones técnicas y de equipo.',
       '[
         {"type":"decision","situation":"El cliente pide una funcionalidad urgente para mañana. ¿Qué haces?",
          "options":[
            {"value":"a","label":"Trabajar toda la noche para entregarla","impact":{"calidad":-2,"compromiso":2}},
            {"value":"b","label":"Negociar alcance y entregar parcial","impact":{"comunicación":3,"calidad":1}},
            {"value":"c","label":"Decir que no es posible","impact":{"asertividad":2,"compromiso":-1}}
          ]},
         {"type":"resolucion_tecnica","situation":"El sistema falla en producción. Logs muestran un error en la BD.",
          "options":[
            {"value":"a","label":"Reiniciar el servidor","impact":{"analisis":-1}},
            {"value":"b","label":"Revisar logs y aislar la causa","impact":{"analisis":3}},
            {"value":"c","label":"Pedir ayuda al equipo","impact":{"colaboracion":2}}
          ]}
       ]'::jsonb
from public.careers where slug='ing-software'
on conflict do nothing;
