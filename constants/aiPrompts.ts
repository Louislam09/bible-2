export const AiInstructions = `Eres un experto en Biblia que explica versículos bíblicos en español de forma clara, precisa y profunda. Tu tarea es analizar el significado del texto bíblico basándote exclusivamente en la Biblia, especialmente en la versión Reina-Valera 1960 (RVR1960), y haciendo referencia a otros versículos relevantes cuando sea necesario.

Si el versículo contiene nombres propios, explica su significado en hebreo y su traducción al español. También puedes explicar términos clave utilizando el idioma original (hebreo o griego), cuando sea útil para la comprensión.

Evita reflexiones personales o inspiraciones subjetivas. Sé directo, bíblico y textual. Usa un tono académico pero claro.`;

// export const userPrompt = (verse: { text: string, reference: string }) => `Explica este versículo de manera clara, profunda y bíblica. No hagas reflexiones ni inspiración personal. Si el versículo contiene nombres propios, da su significado en hebreo y español. Si algún término requiere explicación desde el hebreo o griego original, inclúyelo. Usa referencias bíblicas relevantes que ayuden a entender mejor el texto: "${verse.text}" (${verse.reference})`

export const userPrompt = (verse: { text: string; reference: string }) => `
    Eres un experto en estudios bíblicos, con dominio del hebreo, griego y teología. Explica el siguiente versículo siguiendo esta estructura académica y exegética, basada exclusivamente en la Biblia (usando la Reina-Valera 1960 como base). No incluyas reflexiones personales ni aplicaciones devocionales.
    
    Estructura esperada:
    🔖 **Título sugerido para notas:**  
Antes de comenzar, genera un título claro, preciso y académico que resuma el tema central del versículo en 3 a 7 palabras (como si fuera el título de una sección de estudio bíblico). No pongas comillas, ni adornos.

    
    📖 **Versículo y Referencia:**  
    Incluye el texto del versículo completo y su referencia (RVR1960).
    
    🔍 **Análisis Lingüístico y Exegético:**  
    Explica palabras clave en hebreo o griego cuando sea relevante. Si hay nombres propios, da su significado y raíz. Desarrolla el contexto histórico o literario si es necesario.
    
    📚 **Referencias Bíblicas Relacionadas:**  
    Incluye al menos 2–4 versículos paralelos que ayuden a interpretar el texto con la misma Escritura.
    
    🧠 **Conclusión Exegética:**  
    Haz una síntesis clara del mensaje del versículo según su contexto y su relación con el resto de la Biblia. No apliques subjetividad ni exhortación.
    
    Versículo a explicar:  
    "${verse.text}"  
    (${verse.reference})
    `;

export const aiMockResponse = `📖 **Versículo y Referencia:**
    
    "En el principio creó Dios los cielos y la tierra." (Génesis 1:1 RVR1960)
    
    
    🔍 **Análisis Lingüístico y Exegético:**
    
    * **En el principio (בְּרֵאשִׁית - *Bereshit*):** Esta palabra hebrea, que da título al libro de Génesis, significa literalmente "en el comienzo" o "en la cabeza".  No implica un comienzo en el tiempo en el sentido de un punto específico, sino un comienzo absoluto y primordial.  La preposición בְּ ( *bet* ) indica una relación de tiempo o lugar, situando la creación en el punto inicial de todo lo existente.
    
    * **Creó (בָרָא - *bara*):** Este verbo hebreo es significativo.  No es el verbo común para "hacer" o "formar" (*asah*), sino un verbo que implica creación *ex nihilo*, es decir, creación de la nada.  Implica un acto de poder divino único y trascendente, diferente a cualquier proceso de formación o transformación de materia preexistente.
    
    * **Dios (אֱלֹהִים - *Elohim*):**  Este término hebreo es un sustantivo plural que se usa para referirse a la deidad.  Aunque gramaticalmente plural, se usa con un verbo singular en este versículo, reflejando la unicidad de Dios a pesar de la pluralidad inherente a su naturaleza (un tema que se explora en otros pasajes bíblicos).
    
    * **Los cielos (הַשָּׁמַיִם - *hashamayim*):** Se refiere a los cielos, incluyendo el firmamento y todo lo que está más allá.
    
    * **Y la tierra (וְהָאָרֶץ - *vehaaretz*):** Se refiere a la tierra, incluyendo todo lo que contiene.  La conjunción וְ (*ve*) indica una unión inseparable entre los cielos y la tierra, ambos creados por Dios en este acto primordial.
    
    
    📚 **Referencias Bíblicas Relacionadas:**
    
    * **Salmo 33:6:** "Por la palabra de Jehová fueron hechos los cielos, y todo el ejército de ellos por el aliento de su boca."  Este versículo enfatiza la creación por medio de la palabra de Dios, mostrando el poder creativo inherente a su habla.
    
    * **Hebreos 11:3:** "Por la fe entendemos haber sido constituido el universo por la palabra de Dios, de modo que lo que se ve fue hecho de lo que no se veía."  Este pasaje conecta la creación con la fe, destacando la naturaleza invisible de la fuente de la creación y la dependencia de la fe para comprenderla.
    
    * **Isaías 45:18:** "Porque así dijo Jehová, que creó los cielos; él es Dios, el que formó la tierra y la hizo, él la estableció; no la creó para estar desierta, sino la formó para ser habitada: Yo soy Jehová, y no hay otro."  Este versículo reafirma la creación de los cielos y la tierra por Jehová, enfatizando su unicidad y propósito en la creación.
    
    * **Apocalipsis 4:11:** "Señor nuestro, Dios nuestro, digno eres de recibir la gloria y la honra y el poder; porque tú creaste todas las cosas, y por tu voluntad existen y fueron creadas."  Este pasaje, desde el final de la Biblia, reafirma la creación de todas las cosas por Dios y su soberanía sobre ellas.
    
    
    🧠 **Conclusión Exegética:**
    
    Génesis 1:1 declara la creación *ex nihilo* de los cielos y la tierra por Dios en un acto primordial.  El versículo establece el fundamento teológico de la creación, atribuyendo la existencia de todo lo que es a un acto único y trascendente de Dios, utilizando un lenguaje que enfatiza su poder y soberanía.  Este acto inicial es fundamental para la comprensión de la narrativa bíblica completa, estableciendo el contexto para la creación del hombre y la relación entre Dios y su creación.  La creación no es un proceso gradual o evolutivo, sino un acto de voluntad divina que da origen a todo lo existente.`;
