import { Unit } from '@/types';

const gameUnits: Unit[] = [
  {
    id: 1,
    title: 'Introducción a la Biblia',
    description: 'Aprende los fundamentos de la Biblia.',
    lessons: [
      {
        id: 1,
        title: '¿Qué es la Biblia?',
        activity: 'Verdadero/Falso sobre la definición de la Biblia.',
        challenges: [
          {
            id: 1,
            question:
              'La Biblia fue escrita por una sola persona. (Verdadero/Falso)',
            type: 'true_false',
            answer: false,
          },
          {
            id: 2,
            question:
              'La Biblia es considerada la palabra de Dios. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
          {
            id: 3,
            question:
              'La Biblia está dividida en Antiguo y Nuevo Testamento. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
      {
        id: 2,
        title: 'Estructura de la Biblia',
        activity: 'Emparejar libros con su testamento.',
        challenges: [
          {
            id: 1,
            question: '¿A qué testamento pertenece el libro de Génesis?',
            type: 'multiple_choice',
            options: ['Antiguo Testamento', 'Nuevo Testamento'],
            answer: 'Antiguo Testamento',
          },
          {
            id: 2,
            question: '¿A qué testamento pertenece el libro de Mateo?',
            type: 'multiple_choice',
            options: ['Antiguo Testamento', 'Nuevo Testamento'],
            answer: 'Nuevo Testamento',
          },
          {
            id: 3,
            question: '¿A qué testamento pertenece el libro de Éxodo?',
            type: 'multiple_choice',
            options: ['Antiguo Testamento', 'Nuevo Testamento'],
            answer: 'Antiguo Testamento',
          },
        ],
      },
      {
        id: 3,
        title: 'Versículos y referencias',
        activity: 'Completar una referencia.',
        challenges: [
          {
            id: 1,
            question:
              "Completa la referencia: 'Porque de tal manera amó Dios al mundo...' (Juan ___:___)",
            type: 'fill_in_the_blank',
            answer: '3:16',
          },
          {
            id: 2,
            question:
              "Encuentra en la Biblia el versículo: 'Tu palabra es una lámpara a mis pies...' (Salmos ___:___)",
            type: 'fill_in_the_blank',
            answer: '119:105',
          },
          {
            id: 3,
            question:
              "Completa la referencia: 'El Señor es mi pastor, nada me faltará...' (Salmos ___:___)",
            type: 'fill_in_the_blank',
            answer: '23:1',
          },
        ],
      },
      {
        id: 4,
        title: 'Versículo clave',
        activity: 'Memorizar con pistas visuales.',
        challenges: [
          {
            id: 1,
            question:
              "Memoriza: 'Tu palabra es una lámpara a mis pies y una luz en mi camino' (Salmos 119:105).",
            type: 'memory_task',
            hint: "Palabra clave: 'lámpara'.",
          },
          {
            id: 2,
            question:
              "Memoriza: 'El Señor es mi pastor, nada me faltará' (Salmos 23:1).",
            type: 'memory_task',
            hint: "Palabra clave: 'pastor'.",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Historias del Antiguo Testamento',
    description: 'Explora las historias principales del Antiguo Testamento.',
    lessons: [
      {
        id: 1,
        title: 'La Creación',
        activity: 'Ordenar los días de la creación.',
        challenges: [
          {
            id: 1,
            question:
              'Ordena los días de la creación: 1. Luz, 2. Firmamento, 3. Tierra y plantas...',
            type: 'drag_and_drop',
            correct_order: [
              'Luz',
              'Firmamento',
              'Tierra y plantas',
              'Sol y luna',
              'Animales acuáticos y aves',
              'Animales terrestres y humanos',
              'Día de descanso',
            ],
          },
          {
            id: 2,
            question: '¿Qué creó Dios en el sexto día?',
            type: 'multiple_choice',
            options: ['Animales terrestres y humanos', 'Firmamento', 'Luz'],
            answer: 'Animales terrestres y humanos',
          },
        ],
      },
      {
        id: 2,
        title: 'El Arca de Noé',
        activity: 'Responder preguntas de opción múltiple.',
        challenges: [
          {
            id: 1,
            question: '¿Cuántos días llovió durante el diluvio?',
            type: 'multiple_choice',
            options: ['30 días', '40 días', '50 días'],
            answer: '40 días',
          },
          {
            id: 2,
            question: '¿Cuántos animales de cada especie llevó Noé al arca?',
            type: 'multiple_choice',
            options: ['Uno', 'Dos', 'Siete'],
            answer: 'Dos',
          },
          {
            id: 3,
            question:
              '¿Qué señal dio Dios para prometer que no habría otro diluvio?',
            type: 'multiple_choice',
            options: ['Arco iris', 'Paloma', 'Olivo'],
            answer: 'Arco iris',
          },
        ],
      },
      {
        id: 3,
        title: 'Abraham y la Promesa',
        activity: 'Explorar la historia de Abraham.',
        challenges: [
          {
            id: 1,
            question: '¿Cuántos hijos tuvo Abraham?',
            type: 'multiple_choice',
            options: ['Uno', 'Dos', 'Tres'],
            answer: 'Dos',
          },
          {
            id: 2,
            question: '¿Qué prometió Dios a Abraham?',
            type: 'multiple_choice',
            options: ['Una gran nación', 'Una ciudad', 'Un reino'],
            answer: 'Una gran nación',
          },
        ],
      },
      {
        id: 4,
        title: 'José y sus Hermanos',
        activity: 'Comprender la historia de José.',
        challenges: [
          {
            id: 1,
            question: '¿Cuántos hermanos tenía José?',
            type: 'multiple_choice',
            options: ['10', '11', '12'],
            answer: '11',
          },
          {
            id: 2,
            question: '¿A qué país fue llevado José como esclavo?',
            type: 'multiple_choice',
            options: ['Siria', 'Egipto', 'Babilonia'],
            answer: 'Egipto',
          },
        ],
      },
      {
        id: 5,
        title: 'Moisés y el Éxodo',
        activity: 'Conocer la historia del Éxodo.',
        challenges: [
          {
            id: 1,
            question: '¿Cómo cruzaron los israelitas el Mar Rojo?',
            type: 'multiple_choice',
            options: ['En barco', 'A pie seco', 'Nadando'],
            answer: 'A pie seco',
          },
          {
            id: 2,
            question: '¿Cuántos mandamientos recibió Moisés?',
            type: 'multiple_choice',
            options: ['8', '9', '10'],
            answer: '10',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Vida de Abraham',
    description: 'Conoce la historia del padre de la fe.',
    lessons: [
      {
        id: 1,
        title: 'El llamado de Abraham',
        activity: 'Verdadero/Falso sobre la vida de Abraham',
        challenges: [
          {
            id: 1,
            question:
              'Abraham era originalmente de Ur de los Caldeos. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
          {
            id: 2,
            question:
              'Abraham tenía 100 años cuando nació su hijo Isaac. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
          {
            id: 3,
            question: 'Abraham sacrificó a su hijo Isaac. (Verdadero/Falso)',
            type: 'true_false',
            answer: false,
          },
        ],
      },
      {
        id: 2,
        title: 'La Promesa de Dios',
        activity: 'Completar referencias sobre las promesas de Abraham',
        challenges: [
          {
            id: 1,
            question:
              "Completa: 'Bendeciré a los que te bendigan...' (Génesis ___:___)",
            type: 'fill_in_the_blank',
            answer: '12:3',
          },
          {
            id: 2,
            question: '¿Cuántos hijos tuvo Abraham?',
            type: 'multiple_choice',
            options: ['Uno', 'Dos', 'Tres'],
            answer: 'Dos',
          },
        ],
      },
      {
        id: 3,
        title: 'El Pacto de Circuncisión',
        activity: 'Ordenar eventos del pacto de Abraham',
        challenges: [
          {
            id: 1,
            question: 'Ordena los eventos del pacto de Dios con Abraham',
            type: 'drag_and_drop',
            correct_order: [
              'Dios hace promesa de descendencia',
              'Cambio de nombre de Abram a Abraham',
              'Institución de la circuncisión',
              'Confirmación del pacto',
            ],
          },
        ],
      },
      {
        id: 4,
        title: 'La Hospitalidad de Abraham',
        activity: 'Responder preguntas sobre la hospitalidad de Abraham',
        challenges: [
          {
            id: 1,
            question: '¿A quiénes recibió Abraham bajo un árbol?',
            type: 'multiple_choice',
            options: ['Ángeles', 'Reyes', 'Comerciantes'],
            answer: 'Ángeles',
          },
          {
            id: 2,
            question:
              'Abraham ofreció hospitalidad a los visitantes. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Los Profetas',
    description: 'Descubre las historias de los profetas importantes.',
    lessons: [
      {
        id: 1,
        title: 'Elías y los Profetas de Baal',
        activity: 'Selección múltiple sobre el profeta Elías',
        challenges: [
          {
            id: 1,
            question: '¿En qué monte desafió Elías a los profetas de Baal?',
            type: 'multiple_choice',
            options: ['Monte Sinaí', 'Monte Carmelo', 'Monte de los Olivos'],
            answer: 'Monte Carmelo',
          },
          {
            id: 2,
            question: '¿Qué milagro realizó Elías en el Monte Carmelo?',
            type: 'multiple_choice',
            options: [
              'Detuvo el sol',
              'Hizo caer fuego del cielo',
              'Abrió el mar',
            ],
            answer: 'Hizo caer fuego del cielo',
          },
        ],
      },
      {
        id: 2,
        title: 'Eliseo y los Milagros',
        activity: 'Verdadero/Falso sobre Eliseo',
        challenges: [
          {
            id: 1,
            question: 'Eliseo era discípulo de Elías. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
          {
            id: 2,
            question: '¿Cuántos milagros realizó Eliseo según la Biblia?',
            type: 'multiple_choice',
            options: ['7', '12', '16'],
            answer: '16',
          },
        ],
      },
      {
        id: 3,
        title: 'Isaías y las Profecías Mesiánicas',
        activity: 'Completar profecías de Isaías',
        challenges: [
          {
            id: 1,
            question: "Completa: 'Un niño nos es nacido...' (Isaías ___:___)",
            type: 'fill_in_the_blank',
            answer: '9:6',
          },
          {
            id: 2,
            question: '¿Qué simbolizó Isaías con su hijo Maher-Salal-Hash-Baz?',
            type: 'multiple_choice',
            options: ['Juicio', 'Misericordia', 'Paz'],
            answer: 'Juicio',
          },
        ],
      },
      {
        id: 4,
        title: 'Daniel y las Visiones',
        activity: 'Ordenar eventos de la vida de Daniel',
        challenges: [
          {
            id: 1,
            question: 'Ordena los eventos de Daniel',
            type: 'drag_and_drop',
            correct_order: [
              'Capturado en Babilonia',
              'Interpreta sueños del rey',
              'Sobrevive al foso de los leones',
              'Recibe visiones proféticas',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'Los Salmos',
    description: 'Explora la poesía y alabanza bíblica.',
    lessons: [
      {
        id: 1,
        title: 'Salmos de Alabanza',
        activity: 'Completar referencias de Salmos',
        challenges: [
          {
            id: 1,
            question:
              "Completa: 'Alaben al Señor todos los pueblos...' (Salmos ___:___)",
            type: 'fill_in_the_blank',
            answer: '117:1',
          },
          {
            id: 2,
            question:
              "Encuentra el versículo: 'El Señor es mi luz y mi salvación...' (Salmos ___:___)",
            type: 'fill_in_the_blank',
            answer: '27:1',
          },
        ],
      },
      {
        id: 2,
        title: 'Salmos de Lamentación',
        activity: 'Verdadero/Falso sobre los Salmos de sufrimiento',
        challenges: [
          {
            id: 1,
            question:
              'El Salmo 22 es profético sobre Cristo. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
          {
            id: 2,
            question: '¿Quién escribió la mayoría de los Salmos?',
            type: 'multiple_choice',
            options: ['Moisés', 'David', 'Salomón'],
            answer: 'David',
          },
        ],
      },
      {
        id: 3,
        title: 'Salmos de Sabiduría',
        activity: 'Selección múltiple sobre Salmos de sabiduría',
        challenges: [
          {
            id: 1,
            question:
              "Completa: 'Principio de la sabiduría es el temor de Jehová...' (Proverbios ___:___)",
            type: 'fill_in_the_blank',
            answer: '9:10',
          },
          {
            id: 2,
            question:
              '¿Qué libro está relacionado con los Salmos de sabiduría?',
            type: 'multiple_choice',
            options: ['Proverbios', 'Eclesiastés', 'Ambos'],
            answer: 'Ambos',
          },
        ],
      },
      {
        id: 4,
        title: 'Salmos Proféticos',
        activity: 'Ordenar Salmos proféticos',
        challenges: [
          {
            id: 1,
            question: 'Ordena los eventos proféticos en los Salmos',
            type: 'drag_and_drop',
            correct_order: [
              'Profecías sobre el Mesías',
              'Descripción del sufrimiento del justo',
              'Promesas de restauración',
              'Esperanza de redención',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'José en Egipto',
    description: 'Aprende sobre la historia de José y su fe.',
    lessons: [
      {
        id: 1,
        title: 'La historia de José',
        activity: 'Ordenar eventos de la vida de José',
        challenges: [
          {
            id: 1,
            question: 'Ordena los eventos de la vida de José',
            type: 'drag_and_drop',
            correct_order: [
              'Vendido por sus hermanos',
              'Trabajando en casa de Potifar',
              'Interpreta sueños en la cárcel',
              'Se convierte en segundo al mando de Egipto',
              'Perdona a sus hermanos',
            ],
          },
        ],
      },
      {
        id: 2,
        title: 'Los Sueños de José',
        activity: 'Verdadero/Falso sobre los sueños de José',
        challenges: [
          {
            id: 1,
            question:
              'José tuvo sueños que simbolizaban su futura autoridad. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
          {
            id: 2,
            question: '¿Cuántos sueños importantes tuvo José según la Biblia?',
            type: 'multiple_choice',
            options: ['2', '3', '4'],
            answer: '3',
          },
        ],
      },
      {
        id: 3,
        title: 'José en la Cárcel',
        activity: 'Completar la historia de José en prisión',
        challenges: [
          {
            id: 1,
            question: '¿A quiénes interpretó José sueños en la cárcel?',
            type: 'multiple_choice',
            options: ['Soldados', 'Panadero y copero', 'Prisioneros comunes'],
            answer: 'Panadero y copero',
          },
          {
            id: 2,
            question: 'José fue injustamente encarcelado. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
      {
        id: 4,
        title: 'La Reconciliación de José',
        activity: 'Selección múltiple sobre el reencuentro familiar',
        challenges: [
          {
            id: 1,
            question: '¿Cuántos hermanos tenía José?',
            type: 'multiple_choice',
            options: ['10', '11', '12'],
            answer: '11',
          },
          {
            id: 2,
            question:
              'José perdonó completamente a sus hermanos. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
      {
        id: 5,
        title: 'El Legado de José',
        activity: 'Ordenar el impacto de José en Egipto',
        challenges: [
          {
            id: 1,
            question: 'Ordena los eventos del impacto de José',
            type: 'drag_and_drop',
            correct_order: [
              'Salva a Egipto del hambre',
              'Administra los recursos del reino',
              'Protege a su familia',
              'Establece un legado de fe',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 7,
    title: 'Éxodo y Moisés',
    description: 'La liberación de Israel de Egipto.',
    lessons: [
      {
        id: 1,
        title: 'Las Plagas de Egipto',
        activity: 'Selección múltiple sobre el Éxodo',
        challenges: [
          {
            id: 1,
            question: '¿Cuántas plagas envió Dios a Egipto?',
            type: 'multiple_choice',
            options: ['7', '10', '12'],
            answer: '10',
          },
          {
            id: 2,
            question: '¿Qué río se dividió para que los israelitas cruzaran?',
            type: 'multiple_choice',
            options: ['Río Jordán', 'Río Nilo', 'Mar Rojo'],
            answer: 'Mar Rojo',
          },
        ],
      },
      {
        id: 2,
        title: 'El Nacimiento de Moisés',
        activity: 'Verdadero/Falso sobre la vida temprana de Moisés',
        challenges: [
          {
            id: 1,
            question:
              'Moisés fue criado en el palacio del Faraón. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
          {
            id: 2,
            question: '¿Quién salvó a Moisés cuando era un bebé?',
            type: 'multiple_choice',
            options: ['Su madre', 'La hija del Faraón', 'Su hermana'],
            answer: 'La hija del Faraón',
          },
        ],
      },
      {
        id: 3,
        title: 'La Zarza Ardiente',
        activity: 'Completar la historia de la llamada de Moisés',
        challenges: [
          {
            id: 1,
            question: '¿Dónde ocurrió la visión de la zarza ardiente?',
            type: 'fill_in_the_blank',
            answer: 'Monte Horeb',
          },
          {
            id: 2,
            question:
              'Moisés inicialmente se resistió a la llamada de Dios. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
      {
        id: 4,
        title: 'Los Diez Mandamientos',
        activity: 'Ordenar los Diez Mandamientos',
        challenges: [
          {
            id: 1,
            question: 'Ordena los primeros cuatro mandamientos',
            type: 'drag_and_drop',
            correct_order: [
              'No tendrás dioses ajenos',
              'No harás ídolos',
              'No tomarás el nombre de Dios en vano',
              'Recordarás el día de reposo',
            ],
          },
        ],
      },
      {
        id: 5,
        title: 'La Travesía del Desierto',
        activity: 'Selección múltiple sobre el viaje de Israel',
        challenges: [
          {
            id: 1,
            question: '¿Cuántos años estuvieron los israelitas en el desierto?',
            type: 'multiple_choice',
            options: ['30', '40', '50'],
            answer: '40',
          },
          {
            id: 2,
            question:
              'Dios proveyó maná y codornices en el desierto. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'Daniel en el Foso de los Leones',
    description: 'Historia de fe y valentía.',
    lessons: [
      {
        id: 1,
        title: 'La Prueba de Fe de Daniel',
        activity: 'Verdadero/Falso sobre Daniel',
        challenges: [
          {
            id: 1,
            question:
              'Daniel fue echado al foso de los leones por orar. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
          {
            id: 2,
            question:
              'Daniel sobrevivió milagrosamente en el foso de los leones. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
      {
        id: 2,
        title: 'Daniel en la Corte de Babilonia',
        activity: 'Selección múltiple sobre Daniel en Babilonia',
        challenges: [
          {
            id: 1,
            question: '¿Qué idioma aprendió Daniel?',
            type: 'multiple_choice',
            options: ['Hebreo', 'Arameo', 'Caldeo'],
            answer: 'Caldeo',
          },
          {
            id: 2,
            question:
              'Daniel se negó a comer la comida del rey. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
      {
        id: 3,
        title: 'Las Visiones de Daniel',
        activity: 'Completar referencias de las visiones',
        challenges: [
          {
            id: 1,
            question:
              '¿Cuántas semanas de años menciona Daniel en sus profecías?',
            type: 'multiple_choice',
            options: ['40', '70', '100'],
            answer: '70',
          },
          {
            id: 2,
            question: 'Daniel interpretó sueños de reyes. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
      {
        id: 4,
        title: 'El Juicio de Daniel',
        activity: 'Ordenar eventos del juicio de Daniel',
        challenges: [
          {
            id: 1,
            question: 'Ordena los eventos del juicio de Daniel',
            type: 'drag_and_drop',
            correct_order: [
              'Acusado por sus enemigos',
              'Ley firmada contra la oración',
              'Echado al foso de leones',
              'Salvado milagrosamente',
            ],
          },
        ],
      },
      {
        id: 5,
        title: 'El Legado Profético de Daniel',
        activity: 'Selección múltiple sobre las profecías de Daniel',
        challenges: [
          {
            id: 1,
            question: '¿Sobre qué imperios profetizó Daniel?',
            type: 'multiple_choice',
            options: [
              'Egipto y Asiria',
              'Babilonia, Persia, Grecia, Roma',
              'China y Japón',
            ],
            answer: 'Babilonia, Persia, Grecia, Roma',
          },
          {
            id: 2,
            question:
              'Daniel recibió visiones sobre los últimos tiempos. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'Los Reyes de Israel',
    description: 'Conoce a los reyes más importantes.',
    lessons: [
      {
        id: 1,
        title: 'Saúl, David y Salomón',
        activity: 'Emparejar reyes con sus características',
        challenges: [
          {
            id: 1,
            question: '¿Quién fue el primer rey de Israel?',
            type: 'multiple_choice',
            options: ['David', 'Saúl', 'Salomón'],
            answer: 'Saúl',
          },
          {
            id: 2,
            question: '¿Quién construyó el primer templo?',
            type: 'multiple_choice',
            options: ['David', 'Saúl', 'Salomón'],
            answer: 'Salomón',
          },
        ],
      },
      {
        id: 2,
        title: 'Saúl y David',
        activity: 'Verdadero/Falso sobre la relación entre Saúl y David',
        challenges: [
          {
            id: 1,
            question:
              'Saúl intentó matar a David en varias ocasiones. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
          {
            id: 2,
            question: '¿Quién era el mejor amigo de David?',
            type: 'multiple_choice',
            options: ['Saúl', 'Jonatán', 'Samuel'],
            answer: 'Jonatán',
          },
        ],
      },
      {
        id: 3,
        title: 'David y Goliat',
        activity: 'Completar la historia de David y Goliat',
        challenges: [
          {
            id: 1,
            question: '¿Con qué arma venció David a Goliat?',
            type: 'multiple_choice',
            options: ['Espada', 'Lanza', 'Honda'],
            answer: 'Honda',
          },
          {
            id: 2,
            question: 'David era el menor de sus hermanos. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
      {
        id: 4,
        title: 'Salomón y la Sabiduría',
        activity: 'Ordenar eventos de la sabiduría de Salomón',
        challenges: [
          {
            id: 1,
            question:
              'Ordena los eventos relacionados con la sabiduría de Salomón',
            type: 'drag_and_drop',
            correct_order: [
              'Pide sabiduría a Dios',
              'Resuelve conflicto entre madres',
              'Construye el templo',
              'Escribe proverbios',
            ],
          },
        ],
      },
      {
        id: 5,
        title: 'El Reino Dividido',
        activity: 'Selección múltiple sobre la división del reino',
        challenges: [
          {
            id: 1,
            question: '¿Cuántos reinos se formaron tras la división?',
            type: 'multiple_choice',
            options: ['1', '2', '3'],
            answer: '2',
          },
          {
            id: 2,
            question:
              'El reino se dividió después del reinado de Salomón. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
    ],
  },
  {
    id: 10,
    title: 'Jonás y la Gran Ciudad',
    description: 'La historia de desobediencia y misericordia.',
    lessons: [
      {
        id: 1,
        title: 'El Profeta y la Ballena',
        activity: 'Completar la historia de Jonás',
        challenges: [
          {
            id: 1,
            question: '¿A qué ciudad fue enviado Jonás a predicar?',
            type: 'fill_in_the_blank',
            answer: 'Nínive',
          },
          {
            id: 2,
            question: '¿Qué animal tragó a Jonás?',
            type: 'multiple_choice',
            options: ['Un pez', 'Una ballena', 'Un tiburón'],
            answer: 'Una ballena',
          },
        ],
      },
      {
        id: 2,
        title: 'La Huida de Jonás',
        activity: 'Verdadero/Falso sobre la desobediencia de Jonás',
        challenges: [
          {
            id: 1,
            question:
              'Jonás intentó huir de la misión de Dios. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
          {
            id: 2,
            question: '¿Hacia dónde intentó huir Jonás?',
            type: 'multiple_choice',
            options: ['Egipto', 'Tarsis', 'Jerusalén'],
            answer: 'Tarsis',
          },
        ],
      },
      {
        id: 3,
        title: 'Jonás en Nínive',
        activity: 'Selección múltiple sobre la predicación de Jonás',
        challenges: [
          {
            id: 1,
            question:
              '¿Qué sucedió con Nínive después de la predicación de Jonás?',
            type: 'multiple_choice',
            options: ['Fue destruida', 'Se arrepintió', 'Ignoró el mensaje'],
            answer: 'Se arrepintió',
          },
          {
            id: 2,
            question:
              'Jonás estaba feliz por el arrepentimiento de Nínive. (Verdadero/Falso)',
            type: 'true_false',
            answer: false,
          },
        ],
      },
      {
        id: 4,
        title: 'La Misericordia de Dios',
        activity: 'Ordenar eventos de la misericordia divina',
        challenges: [
          {
            id: 1,
            question: 'Ordena los eventos que muestran la misericordia de Dios',
            type: 'drag_and_drop',
            correct_order: [
              'Jonás desobedece',
              'Dios provee un gran pez',
              'Jonás predica en Nínive',
              'Ciudad se arrepiente',
            ],
          },
        ],
      },
      {
        id: 5,
        title: 'La Lección de Jonás',
        activity: 'Selección múltiple sobre las enseñanzas del libro',
        challenges: [
          {
            id: 1,
            question: '¿Qué aprendió Jonás sobre la misericordia de Dios?',
            type: 'multiple_choice',
            options: [
              'Dios solo ama a Israel',
              'Dios tiene misericordia para todos',
              'La predicación no es importante',
            ],
            answer: 'Dios tiene misericordia para todos',
          },
          {
            id: 2,
            question:
              'El libro de Jonás muestra el amor universal de Dios. (Verdadero/Falso)',
            type: 'true_false',
            answer: true,
          },
        ],
      },
    ],
  },
];

export default gameUnits;
