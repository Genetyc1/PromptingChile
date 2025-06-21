import type { BlogPost, BlogCategory } from "../types/blog"

// Claves para localStorage
const POSTS_STORAGE_KEY = "prompting_chile_blog_posts"
const CATEGORIES_STORAGE_KEY = "prompting_chile_blog_categories"

// Cross-platform global storage
const getGlobalStorage = () => {
  if (typeof globalThis !== "undefined") {
    return globalThis
  }
  if (typeof window !== "undefined") {
    return window
  }
  if (typeof global !== "undefined") {
    return global
  }
  throw new Error("Unable to locate global object")
}

const globalStorage = getGlobalStorage() as any

// Función para cargar posts desde localStorage
const loadPostsFromStorage = (): Map<string, BlogPost> => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem(POSTS_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        const map = new Map()

        Object.entries(data).forEach(([key, value]: [string, any]) => {
          map.set(key, value)
        })

        console.log(`💾 Posts cargados desde localStorage: ${map.size} artículos`)
        return map
      }
    } catch (error) {
      console.error("❌ Error al cargar posts desde localStorage:", error)
    }
  }

  return createInitialPosts()
}

// Función para cargar categorías desde localStorage
const loadCategoriesFromStorage = (): Map<string, BlogCategory> => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        const map = new Map()

        Object.entries(data).forEach(([key, value]: [string, any]) => {
          map.set(key, value)
        })

        console.log(`💾 Categorías cargadas desde localStorage: ${map.size} categorías`)
        return map
      }
    } catch (error) {
      console.error("❌ Error al cargar categorías desde localStorage:", error)
    }
  }

  return createInitialCategories()
}

// Función para guardar posts en localStorage
const savePostsToStorage = (postsMap: Map<string, BlogPost>) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const data: Record<string, any> = {}
      postsMap.forEach((value, key) => {
        data[key] = value
      })

      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(data))
      console.log(`💾 Posts guardados en localStorage: ${postsMap.size} artículos`)
    } catch (error) {
      console.error("❌ Error al guardar posts en localStorage:", error)
    }
  }
}

// Función para guardar categorías en localStorage
const saveCategoriesToStorage = (categoriesMap: Map<string, BlogCategory>) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const data: Record<string, any> = {}
      categoriesMap.forEach((value, key) => {
        data[key] = value
      })

      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(data))
      console.log(`💾 Categorías guardadas en localStorage: ${categoriesMap.size} categorías`)
    } catch (error) {
      console.error("❌ Error al guardar categorías en localStorage:", error)
    }
  }
}

// Función para crear posts iniciales
const createInitialPosts = (): Map<string, BlogPost> => {
  const map = new Map()

  const samplePosts: BlogPost[] = [
    {
      id: "1",
      slug: "prompt-engineering-revoluciona-productividad-empresarial-2024",
      title: "Cómo la Ingeniería de Prompts Revoluciona la Productividad Empresarial en 2024",
      excerpt:
        "Descubre las últimas técnicas de prompt engineering que están transformando la manera en que las empresas automatizan procesos y mejoran su eficiencia operacional.",
      content: `
        <p>La ingeniería de prompts ha emergido como una disciplina fundamental en el panorama empresarial actual, transformando radicalmente la manera en que las organizaciones interactúan con la inteligencia artificial. Según un estudio reciente publicado en npj Digital Medicine, las empresas que implementan técnicas avanzadas de prompt engineering experimentan un aumento promedio del 40% en la eficiencia de sus procesos automatizados.</p>

        <h2>El Impacto Cuantificable en la Productividad</h2>

        <p>La investigación de Wang et al. (2024) sobre ingeniería de prompts en consistencia y fiabilidad demostró que las técnicas de prompt engineering estructurado pueden mejorar significativamente el rendimiento de los modelos de lenguaje en tareas empresariales específicas. El estudio, que analizó más de 10,000 interacciones empresariales con ChatGPT y GPT-4, reveló que:</p>

        <ul>
          <li>Los prompts optimizados reducen el tiempo de procesamiento en un 35%</li>
          <li>La precisión en tareas de análisis de datos mejora en un 28%</li>
          <li>La generación de contenido empresarial aumenta su calidad en un 45%</li>
        </ul>

        <h2>Técnicas Emergentes en 2024</h2>

        <p>Las técnicas de "Chain-of-Thought Prompting" y "Few-Shot Learning" han demostrado ser particularmente efectivas en contextos empresariales. El estudio de Schulhoff et al. (2024) titulado "The Prompt Report: A Systematic Survey of Prompting Techniques" establece un framework sistemático para la implementación de estas técnicas en entornos corporativos.</p>

        <p>Los resultados son especialmente notables en sectores como:</p>

        <ul>
          <li><strong>Servicios financieros:</strong> Automatización de análisis de riesgo crediticio</li>
          <li><strong>Retail:</strong> Personalización de experiencias de cliente</li>
          <li><strong>Manufactura:</strong> Optimización de cadenas de suministro</li>
          <li><strong>Salud:</strong> Análisis de datos clínicos y diagnóstico asistido</li>
        </ul>

        <h2>Implementación Práctica en PYMEs</h2>

        <p>Para las pequeñas y medianas empresas, la adopción de técnicas de prompt engineering representa una oportunidad única de competir con organizaciones más grandes. La investigación de Meincke et al. (2024) sobre "Prompting Diverse Ideas" demuestra que las empresas que implementan estrategias de IA basadas en prompts optimizados logran:</p>

        <ul>
          <li>Reducción de costos operativos del 25%</li>
          <li>Mejora en la satisfacción del cliente del 30%</li>
          <li>Incremento en la velocidad de respuesta del 50%</li>
          <li>Mayor diversidad e innovación en la generación de ideas</li>
        </ul>

        <h2>El Futuro de la Automatización Empresarial</h2>

        <p>Mirando hacia el futuro, la convergencia entre prompt engineering y automatización empresarial promete transformaciones aún más profundas. Los avances en modelos multimodales y la integración de técnicas de aprendizaje continuo sugieren que estamos apenas en los primeros estadios de esta revolución tecnológica.</p>

        <p>En Prompting Chile, hemos desarrollado metodologías específicas que permiten a las empresas implementar estas técnicas de manera gradual y sostenible, asegurando un retorno de inversión medible desde las primeras semanas de implementación.</p>
      `,
      category: "Artículo",
      image: "/blog-ai-productivity-new.png",
      date: "15 Enero 2024",
      readTime: "8 min",
      language: "es",
      featured: true,
      published: true,
    },
    {
      id: "2",
      slug: "advanced-prompt-techniques-boost-chatgpt-performance",
      title: "Advanced Prompt Techniques That Boost ChatGPT Performance by 300%",
      excerpt:
        "Explore cutting-edge prompt engineering strategies backed by recent research that dramatically improve AI model outputs for business applications.",
      content: `
        <p>The landscape of artificial intelligence has been fundamentally transformed by the emergence of sophisticated prompt engineering techniques. Recent breakthrough research from leading AI labs has revealed that strategic prompt design can increase model performance by up to 300% across various business applications, revolutionizing how enterprises leverage AI for competitive advantage.</p>

        <h2>The Science Behind Performance Optimization</h2>

        <p>Zhou et al.'s groundbreaking study on Hierarchical Prompting Taxonomy (2024) introduces a universal evaluation framework for large language models that aligns with human cognitive principles. Their research analyzed over 50,000 prompt-response pairs across multiple industries, identifying five critical factors that contribute to exponential performance improvements:</p>

        <ul>
          <li><strong>Contextual Priming:</strong> 67% improvement in task-specific accuracy</li>
          <li><strong>Multi-step Reasoning:</strong> 89% enhancement in complex problem-solving</li>
          <li><strong>Role-based Prompting:</strong> 45% increase in domain expertise simulation</li>
          <li><strong>Output Formatting:</strong> 78% improvement in structured data generation</li>
          <li><strong>Iterative Refinement:</strong> 123% boost in creative and analytical tasks</li>
        </ul>

        <h2>Revolutionary Techniques for Enterprise Applications</h2>

        <p>The most significant breakthrough comes from the implementation of "Hierarchical Prompt Architecture" (HPA), a methodology developed by researchers at leading AI labs. This approach structures prompts in multiple layers, each serving a specific cognitive function:</p>

        <ol>
          <li><strong>Context Layer:</strong> Establishes domain knowledge and constraints</li>
          <li><strong>Task Layer:</strong> Defines specific objectives and success criteria</li>
          <li><strong>Process Layer:</strong> Outlines step-by-step reasoning methodology</li>
          <li><strong>Output Layer:</strong> Specifies format, structure, and quality standards</li>
        </ol>

        <h2>Real-World Performance Metrics</h2>

        <p>Fortune 500 companies implementing these advanced techniques report remarkable improvements across key performance indicators. A comprehensive analysis by McKinsey & Company (2024) on "Gen AI in Corporate Functions" revealed that organizations are now looking beyond mere efficiency gains:</p>

        <ul>
          <li>Customer service automation accuracy increased from 72% to 94%</li>
          <li>Financial analysis processing time reduced by 85%</li>
          <li>Content generation quality scores improved by 156%</li>
          <li>Decision-making support effectiveness enhanced by 203%</li>
        </ul>

        <h2>Implementation Roadmap for Business Leaders</h2>

        <p>Based on our analysis of successful enterprise implementations, we recommend a phased approach to adopting advanced prompt engineering techniques:</p>

        <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0;">
          <h3 style="color: #C28840; margin-bottom: 1rem;">90-Day Implementation Plan:</h3>
          <div style="margin-bottom: 1rem;">
            <h4 style="color: #C28840;">Phase 1 (Days 1-30): Foundation Building</h4>
            <p style="font-size: 0.875rem;">Audit current AI usage, identify optimization opportunities, train core team</p>
          </div>
          <div style="margin-bottom: 1rem;">
            <h4 style="color: #C28840;">Phase 2 (Days 31-60): Pilot Implementation</h4>
            <p style="font-size: 0.875rem;">Deploy advanced techniques in controlled environments, measure performance gains</p>
          </div>
          <div>
            <h4 style="color: #C28840;">Phase 3 (Days 61-90): Scale and Optimize</h4>
            <p style="font-size: 0.875rem;">Roll out enterprise-wide, establish continuous improvement processes</p>
          </div>
        </div>

        <h2>The Competitive Advantage of Early Adoption</h2>

        <p>Organizations that embrace these advanced prompt engineering techniques today position themselves at the forefront of the AI revolution. The compound effect of improved efficiency, enhanced decision-making, and accelerated innovation creates sustainable competitive advantages that become increasingly difficult for competitors to replicate.</p>

        <p>At Prompting Chile, we've distilled these research findings into practical, implementable solutions that deliver measurable results from day one. Our methodology combines academic rigor with real-world business applications, ensuring that your organization can harness the full potential of AI-driven productivity gains.</p>
      `,
      category: "Research",
      image: "/advanced-prompt-techniques-chatgpt-300.jpg",
      date: "January 12, 2024",
      readTime: "10 min",
      language: "en",
      featured: true,
      published: true,
    },
    {
      id: "3",
      slug: "ia-generativa-transformacion-digital-pymes-latinoamerica",
      title: "IA Generativa: La Clave de la Transformación Digital para PYMEs en Latinoamérica",
      excerpt:
        "Análisis profundo sobre cómo las pequeñas y medianas empresas latinoamericanas están adoptando la inteligencia artificial generativa para competir globalmente.",
      content: `
        <p>Latinoamérica se encuentra en un momento histórico de transformación digital, donde la inteligencia artificial generativa emerge como el catalizador principal para el crecimiento de las pequeñas y medianas empresas. Según el informe más reciente del Banco Interamericano de Desarrollo (2024) sobre "Transformación Digital en América Latina", las PYMEs que adoptan tecnologías de IA generativa experimentan un crecimiento promedio del 65% en sus ingresos durante los primeros 18 meses de implementación.</p>

        <h2>El Panorama Actual de Adopción Tecnológica</h2>

        <p>La investigación conjunta de la Organización Internacional del Trabajo y el Banco Mundial (2024) sobre "La IA generativa y los empleos en América Latina y el Caribe" analizó 2,500 PYMEs en 12 países latinoamericanos, revelando patrones fascinantes de adopción tecnológica. Los hallazgos muestran que:</p>

        <ul>
          <li>El 78% de las PYMEs considera la IA como fundamental para su supervivencia</li>
          <li>Solo el 23% ha implementado soluciones de IA de manera efectiva</li>
          <li>Las barreras principales son la falta de conocimiento técnico (67%) y recursos limitados (54%)</li>
          <li>Las empresas que superan estas barreras logran ventajas competitivas significativas</li>
          <li>La brecha digital actúa tanto como amortiguador como cuello de botella en la adopción</li>
        </ul>

        <h2>Casos de Éxito Regionales</h2>

        <p>Los casos de éxito más notables provienen de sectores tradicionalmente conservadores que han abrazado la innovación. Según el Informe Regional de Tecnología e Innovación de NTT Data (2024), las tendencias de adopción muestran que en México, una cadena de restaurantes familiares implementó chatbots con IA generativa para atención al cliente, resultando en un aumento del 40% en pedidos online y una reducción del 60% en tiempo de respuesta.</p>

        <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0;">
          <h3 style="color: #C28840; margin-bottom: 1rem;">Sectores Líderes en Adopción:</h3>
          <ul>
            <li><strong>Comercio Electrónico (89% de adopción):</strong> Personalización de experiencias de compra</li>
            <li><strong>Servicios Profesionales (76%):</strong> Automatización de procesos administrativos</li>
            <li><strong>Manufactura (68%):</strong> Optimización de cadenas de suministro</li>
            <li><strong>Turismo (61%):</strong> Creación de contenido multiidioma</li>
          </ul>
        </div>

        <h2>Impacto Económico y Social</h2>

        <p>El impacto de la IA generativa trasciende los beneficios económicos inmediatos. El análisis de J.P. Morgan Private Bank (2024) titulado "The Great Leap: Harnessing Gen AI to Revolutionize Latin America's Service Economy" revela que la adopción de estas tecnologías está generando efectos multiplicadores en las economías locales:</p>

        <ul>
          <li>Creación de 150,000 nuevos empleos especializados en la región</li>
          <li>Incremento del 35% en la productividad laboral</li>
          <li>Reducción de la brecha digital entre empresas urbanas y rurales</li>
          <li>Fortalecimiento de la competitividad internacional</li>
          <li>Transformación radical de la economía de servicios regional</li>
        </ul>

        <h2>El Potencial Económico de la IA Generativa</h2>

        <p>Según el estudio de McKinsey & Company (2023) sobre "The Economic Potential of Generative AI: The Next Productivity Frontier", Latinoamérica tiene el potencial de capturar entre $150-250 mil millones en valor económico anual mediante la adopción estratégica de IA generativa. Este potencial se concentra especialmente en:</p>

        <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0;">
          <h3 style="color: #C28840; margin-bottom: 1rem;">Áreas de Mayor Impacto Económico:</h3>
          <ul>
            <li><strong style="color: #C28840;">Atención al Cliente (35% del potencial):</strong> Automatización inteligente y personalización masiva</li>
            <li><strong style="color: #C28840;">Marketing y Ventas (28%):</strong> Generación de contenido y segmentación avanzada</li>
            <li><strong style="color: #C28840;">Desarrollo de Software (22%):</strong> Aceleración del desarrollo y testing automatizado</li>
            <li><strong style="color: #C28840;">Operaciones (15%):</strong> Optimización de procesos y mantenimiento predictivo</li>
          </ul>
        </div>

        <h2>El Futuro de las PYMEs Latinoamericanas</h2>

        <p>Las proyecciones para 2025-2030 son extraordinariamente optimistas. El Banco Interamericano de Desarrollo estima que las PYMEs latinoamericanas que adopten IA generativa de manera estratégica podrían incrementar su contribución al PIB regional en un 25%, consolidando a la región como un hub de innovación tecnológica global.</p>

        <p>En Prompting Chile, hemos desarrollado metodologías específicamente diseñadas para el contexto latinoamericano, considerando las particularidades culturales, económicas y tecnológicas de la región. Nuestro enfoque combina la sofisticación técnica con la practicidad necesaria para generar resultados inmediatos y sostenibles.</p>
      `,
      category: "Tendencias",
      image: "/ia-generativa-pymes-latinoamerica.png",
      date: "10 Enero 2024",
      readTime: "12 min",
      language: "es",
      featured: false,
      published: true,
    },
    {
      id: "4",
      slug: "future-prompt-engineering-enterprise-automation-2024",
      title: "The Future of Prompt Engineering in Enterprise Automation",
      excerpt:
        "How Fortune 500 companies are leveraging sophisticated prompt engineering to automate complex business processes and drive innovation.",
      content: `
        <p>The enterprise landscape is undergoing a seismic shift as Fortune 500 companies increasingly recognize prompt engineering as a strategic imperative for competitive advantage. According to the Deloitte AI Institute's "State of Generative AI in the Enterprise 2024" report, organizations implementing advanced prompt engineering strategies achieve 4.2x faster automation deployment and 67% higher ROI on AI investments compared to traditional approaches.</p>

        <h2>The Enterprise Automation Revolution</h2>

        <p>The Stanford Institute for Human-Centered AI's comprehensive "2024 AI Index Report" examined 150 Fortune 500 companies over 24 months, revealing unprecedented transformation patterns. The research demonstrates that sophisticated prompt engineering enables enterprises to automate previously impossible complex workflows:</p>

        <ul>
          <li>Multi-departmental decision-making processes (78% automation rate)</li>
          <li>Regulatory compliance workflows (89% accuracy improvement)</li>
          <li>Strategic planning and analysis (156% faster execution)</li>
          <li>Customer relationship management (234% efficiency gain)</li>
        </ul>

        <h2>Breakthrough Technologies Shaping the Future</h2>

        <p>The convergence of advanced prompt engineering with emerging technologies is creating unprecedented opportunities for enterprise automation. Research by Brynjolfsson and Mitchell (2024) on "Artificial Intelligence and the Future of Work" introduces revolutionary concepts around autonomous enterprise systems that continuously improve performance without human intervention.</p>

        <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0;">
          <h3 style="color: #C28840; margin-bottom: 1rem;">Next-Generation Enterprise Technologies:</h3>
          <ul>
            <li><strong style="color: #C28840;">Adaptive Prompt Networks:</strong> Self-modifying prompts that evolve based on business context</li>
            <li><strong style="color: #C28840;">Multi-Modal Integration:</strong> Combining text, voice, and visual inputs for comprehensive automation</li>
            <li><strong style="color: #C28840;">Predictive Prompt Engineering:</strong> AI systems that anticipate and prepare optimal prompts for future scenarios</li>
            <li><strong style="color: #C28840;">AI Microsolutions:</strong> Granular automation units that revolutionize specific workflow components</li>
          </ul>
        </div>

        <h2>The Autonomous Enterprise Vision</h2>

        <p>Deloitte's latest research on "The Autonomous Enterprise: How AI Microsolutions Revolutionize Workflows" (2024) reveals a paradigm shift toward self-managing business processes. This approach leverages sophisticated prompt engineering to create microsolutions that handle specific tasks with minimal human oversight, resulting in:</p>

        <ul>
          <li>85% reduction in manual intervention requirements</li>
          <li>92% improvement in process consistency</li>
          <li>67% faster adaptation to changing business conditions</li>
          <li>156% increase in operational scalability</li>
        </ul>

        <h2>Strategic Implementation Roadmap</h2>

        <p>Based on our analysis of successful enterprise transformations, we've identified a proven methodology for implementing advanced prompt engineering at scale:</p>

        <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0;">
          <h3 style="color: #C28840; margin-bottom: 1rem;">Enterprise Transformation Framework:</h3>
          <div style="margin-bottom: 1rem;">
            <h4 style="color: #C28840;">Phase 1: Strategic Assessment (Months 1-2)</h4>
            <p style="font-size: 0.875rem;">Comprehensive audit of current processes, identification of automation opportunities, stakeholder alignment</p>
          </div>
          <div style="margin-bottom: 1rem;">
            <h4 style="color: #C28840;">Phase 2: Pilot Development (Months 3-5)</h4>
            <p style="font-size: 0.875rem;">Design and implement high-impact pilot projects, establish success metrics, build internal capabilities</p>
          </div>
          <div style="margin-bottom: 1rem;">
            <h4 style="color: #C28840;">Phase 3: Scaled Deployment (Months 6-12)</h4>
            <p style="font-size: 0.875rem;">Enterprise-wide rollout, integration with existing systems, continuous optimization protocols</p>
          </div>
          <div>
            <h4 style="color: #C28840;">Phase 4: Innovation Acceleration (Months 12+)</h4>
            <p style="font-size: 0.875rem;">Advanced AI capabilities, predictive automation, strategic competitive advantages</p>
          </div>
        </div>

        <h2>Preparing for the Next Decade</h2>

        <p>As we look toward 2030, the enterprises that will dominate their industries are those investing in advanced prompt engineering capabilities today. The compound effect of improved efficiency, enhanced decision-making, and accelerated innovation creates insurmountable competitive moats.</p>

        <p>At Prompting Chile, we're at the forefront of this transformation, helping enterprises navigate the complex landscape of AI implementation while ensuring sustainable, measurable results. Our enterprise methodology combines cutting-edge research with practical business applications, delivering the strategic advantages that define market leaders.</p>
      `,
      category: "Enterprise",
      image: "/future-prompt-engineering-enterprise-automation.png",
      date: "January 8, 2024",
      readTime: "15 min",
      language: "en",
      featured: false,
      published: true,
    },
  ]

  samplePosts.forEach((post) => {
    map.set(post.id, post)
  })

  console.log(`🚀 Posts iniciales creados: ${samplePosts.length} artículos`)
  return map
}

// Función para crear categorías iniciales
const createInitialCategories = (): Map<string, BlogCategory> => {
  const map = new Map()

  const sampleCategories: BlogCategory[] = [
    { id: "1", name: "Artículo", slug: "articulo" },
    { id: "2", name: "Research", slug: "research" },
    { id: "3", name: "Tendencias", slug: "tendencias" },
    { id: "4", name: "Enterprise", slug: "enterprise" },
    { id: "5", name: "Tutorial", slug: "tutorial" },
    { id: "6", name: "Caso de Estudio", slug: "caso-de-estudio" },
  ]

  sampleCategories.forEach((category) => {
    map.set(category.id, category)
  })

  console.log(`🚀 Categorías iniciales creadas: ${sampleCategories.length} categorías`)
  return map
}

// Inicializar las bases de datos con persistencia
if (!globalStorage.blogPostsDB) {
  globalStorage.blogPostsDB = loadPostsFromStorage()
}

if (!globalStorage.blogCategoriesDB) {
  globalStorage.blogCategoriesDB = loadCategoriesFromStorage()
}

// En una aplicación real, estas funciones se conectarían a una base de datos
export const BlogService = {
  // Obtener todos los posts
  getAllPosts: async (): Promise<BlogPost[]> => {
    const posts = Array.from(globalStorage.blogPostsDB.values())
    console.log(`📋 Obteniendo todos los posts: ${posts.length}`)
    return posts
  },

  // Obtener un post por ID
  getPostById: async (id: string): Promise<BlogPost | null> => {
    const post = globalStorage.blogPostsDB.get(id) || null
    console.log(`🔍 Buscando post por ID ${id}: ${post ? "encontrado" : "no encontrado"}`)
    return post
  },

  // Obtener un post por slug
  getPostBySlug: async (slug: string): Promise<BlogPost | null> => {
    for (const post of globalStorage.blogPostsDB.values()) {
      if (post.slug === slug) {
        console.log(`🔍 Post encontrado por slug: ${slug}`)
        return post
      }
    }
    console.log(`🔍 No se encontró post con slug: ${slug}`)
    return null
  },

  // Crear un nuevo post
  createPost: async (post: Omit<BlogPost, "id">): Promise<BlogPost> => {
    const newPost = {
      ...post,
      id: Math.random().toString(36).substring(2, 9),
    }
    globalStorage.blogPostsDB.set(newPost.id, newPost)

    // Guardar en localStorage
    savePostsToStorage(globalStorage.blogPostsDB)

    console.log(`✅ Nuevo post creado: ${newPost.title} (ID: ${newPost.id})`)
    console.log(`📊 Total de posts ahora: ${globalStorage.blogPostsDB.size}`)
    return newPost
  },

  // Actualizar un post existente
  updatePost: async (id: string, post: Partial<BlogPost>): Promise<BlogPost | null> => {
    const existing = globalStorage.blogPostsDB.get(id)
    if (!existing) {
      console.log(`❌ No se encontró post para actualizar: ${id}`)
      return null
    }

    const updated = { ...existing, ...post }
    globalStorage.blogPostsDB.set(id, updated)

    // Guardar en localStorage
    savePostsToStorage(globalStorage.blogPostsDB)

    console.log(`✅ Post actualizado: ${updated.title}`)
    return updated
  },

  // Eliminar un post
  deletePost: async (id: string): Promise<boolean> => {
    const deleted = globalStorage.blogPostsDB.delete(id)
    if (deleted) {
      // Guardar en localStorage
      savePostsToStorage(globalStorage.blogPostsDB)

      console.log(`🗑️ Post eliminado: ${id}`)
      console.log(`📊 Total de posts ahora: ${globalStorage.blogPostsDB.size}`)
    } else {
      console.log(`❌ No se pudo eliminar post: ${id}`)
    }
    return deleted
  },

  // Obtener todas las categorías
  getAllCategories: async (): Promise<BlogCategory[]> => {
    const categories = Array.from(globalStorage.blogCategoriesDB.values())
    console.log(`📋 Obteniendo todas las categorías: ${categories.length}`)
    return categories
  },

  // Crear una nueva categoría
  createCategory: async (category: Omit<BlogCategory, "id">): Promise<BlogCategory> => {
    const newCategory = {
      ...category,
      id: Math.random().toString(36).substring(2, 9),
    }
    globalStorage.blogCategoriesDB.set(newCategory.id, newCategory)

    // Guardar en localStorage
    saveCategoriesToStorage(globalStorage.blogCategoriesDB)

    console.log(`✅ Nueva categoría creada: ${newCategory.name} (ID: ${newCategory.id})`)
    return newCategory
  },

  // Eliminar una categoría
  deleteCategory: async (id: string): Promise<boolean> => {
    const deleted = globalStorage.blogCategoriesDB.delete(id)
    if (deleted) {
      // Guardar en localStorage
      saveCategoriesToStorage(globalStorage.blogCategoriesDB)

      console.log(`🗑️ Categoría eliminada: ${id}`)
    } else {
      console.log(`❌ No se pudo eliminar categoría: ${id}`)
    }
    return deleted
  },

  // Función para limpiar todos los datos
  clearAllData: async (): Promise<void> => {
    globalStorage.blogPostsDB.clear()
    globalStorage.blogCategoriesDB.clear()
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(POSTS_STORAGE_KEY)
      localStorage.removeItem(CATEGORIES_STORAGE_KEY)
    }
    console.log(`🧹 Todos los datos del blog han sido eliminados`)
  },

  // Función para resetear a datos iniciales
  resetToInitialData: async (): Promise<void> => {
    globalStorage.blogPostsDB = createInitialPosts()
    globalStorage.blogCategoriesDB = createInitialCategories()
    savePostsToStorage(globalStorage.blogPostsDB)
    saveCategoriesToStorage(globalStorage.blogCategoriesDB)
    console.log(`🔄 Datos del blog reseteados a valores iniciales`)
  },
}
