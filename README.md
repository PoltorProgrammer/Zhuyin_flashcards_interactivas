# 🎴 Zhuyin Learning System

<div align="center">

![Zhuyin Flashcards](https://img.shields.io/badge/Zhuyin-Learning%20System-purple?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Sistema completo e interactivo para aprender Zhuyin (Bopomofo) - El sistema de notación fonética de Taiwán**

[🎯 Demo en Vivo](#demo) • [📖 Documentación](#documentación) • [🚀 Instalación](#instalación) • [🤝 Contribuir](#contribuir)

</div>

---

## 📋 Tabla de Contenidos

- [🎯 Características](#-características)
- [🖼️ Screenshots](#️-screenshots)
- [🚀 Instalación](#-instalación)
- [💻 Uso](#-uso)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔊 Sistema de Audio](#-sistema-de-audio)
- [🎮 Controles](#-controles)
- [⚙️ Configuración](#️-configuración)
- [🤝 Contribuir](#-contribuir)
- [📄 Licencia](#-licencia)

---

## 🎯 Características

### 🎴 **Flashcards Interactivas**
- **42 caracteres Zhuyin** completos (consonantes, vocales y tonos)
- **Animación flip** suave y moderna
- **Diseño responsive** para todos los dispositivos
- **Navegación intuitiva** con teclado y gestos táctiles

### 🔊 **Sistema de Audio Completo**
- **200+ archivos de audio** generados automáticamente
- **Pronunciación nativa** usando Google Text-to-Speech
- **Sonidos individuales** de cada carácter Zhuyin
- **Palabras y frases ejemplo** con contexto real
- **Descomposición por palabras** para análisis detallado

### 🎯 **Funciones de Estudio**
- **Filtros por categoría**: Consonantes, vocales, tonos
- **Modo aleatorio**: Mezcla las cartas para mejor memorización
- **Progreso visual**: Barra de progreso y contador
- **Configuración personalizable**: Mostrar/ocultar elementos

### 🛠️ **Generador de Audio Automático**
- **Script Python** para generar todos los audios
- **Organización automática** en carpetas por categoría
- **Consonantes mejoradas**: Sonido real (ba, pa, ma) en lugar de letras inglesas
- **Control de velocidad**: Configurable para evitar rate limiting

---

## 🖼️ Screenshots

### 🎴 Interfaz Principal
```
┌─────────────────────────────────────────────────────────────┐
│ 🔤 [Todos] [Consonantes] [Vocales] [Tonos]                  │
│                                                             │
│    [← Anterior]        [1 / 42]        [Siguiente →]       │
│                                                             │
│                    ┌─────────────────┐                     │
│                    │                 │                     │
│                    │       ㄅ        │  ← Carácter Zhuyin │
│                    │       b         │  ← Equivalencia     │
│                    │                 │                     │
│                    │ [🔊 Escuchar]   │  ← Audio del sonido │
│                    │                 │                     │
│                    │ Click para      │                     │
│                    │   voltear       │                     │
│                    └─────────────────┘                     │
│                                                             │
│              [🔀 Mezclar]           [⚙️]                    │
│    ████████████████████████████████████████░░░░ 85%        │
└─────────────────────────────────────────────────────────────┘
```

### 📚 Reverso de Flashcard
```
┌─────────────────────────────────────────────────────────────┐
│ 📖 Palabra Ejemplo                                         │
│    爸爸 (bàba) - papá                                       │
│    ㄅㄚˋㄅㄚ˙                                                │
│    [🔊 Palabra]                                            │
│                                                             │
│ 💬 Frase Ejemplo                                            │
│    我的爸爸很高。                                           │
│    [🔊 Frase Completa]                                      │
│                                                             │
│ 🧩 Análisis de Palabras                                     │
│    我 (wǒ) - yo           [🔊]                             │
│    的 (de) - partícula    [🔊]                             │
│    爸爸 (bàba) - papá     [🔊]                             │
│    很 (hěn) - muy         [🔊]                             │
│    高 (gāo) - alto        [🔊]                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Instalación

### 📋 Requerimientos

#### Para la Aplicación Web:
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **Servidor HTTP local** (recomendado)

#### Para el Generador de Audio:
- **Python 3.7+**
- **Conexión a Internet** (para Google Text-to-Speech)
- **Espacio en disco**: ~100MB para todos los audios

### 📦 Instalación Rápida

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/tuusuario/zhuyin-learning-system.git
cd zhuyin-learning-system
```

#### 2. Instalar Dependencias Python
```bash
pip install -r requirements.txt
```

#### 3. Generar Audios (Opcional)
```bash
python zhuyin_audio_generator.py
```

#### 4. Ejecutar la Aplicación
```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx http-server

# Opción 3: Live Server (VS Code)
# Instalar extensión Live Server y hacer clic derecho > "Open with Live Server"
```

#### 5. Abrir en Navegador
```
http://localhost:8000
```

---

## 💻 Uso

### 🎯 Uso Básico

1. **Abrir la aplicación** en tu navegador
2. **Seleccionar categoría**: Todos, Consonantes, Vocales, o Tonos
3. **Estudiar las flashcards**:
   - **Frente**: Carácter Zhuyin + botón de audio
   - **Reverso**: Información completa con ejemplos
4. **Navegar**: Usar botones o teclado
5. **Personalizar**: Configurar opciones según preferencias

### 🎮 Controles

| Acción | Teclado | Mouse/Touch |
|--------|---------|-------------|
| **Siguiente carta** | `→` | Botón "Siguiente" |
| **Carta anterior** | `←` | Botón "Anterior" |
| **Voltear carta** | `Espacio` | Click en carta |
| **Reproducir audio** | `Enter` | Click en botón 🔊 |
| **Mezclar cartas** | - | Botón "🔀 Mezclar" |
| **Abrir configuración** | - | Botón "⚙️" |

### 📱 Móvil
- **Swipe izquierda**: Siguiente carta
- **Swipe derecha**: Carta anterior
- **Tap**: Voltear carta
- **Botones de audio**: Reproducir sonidos

---

## 📁 Estructura del Proyecto

```
zhuyin-learning-system/
├── 📁 assets/                      # Recursos adicionales
├── 📁 zhuyin_audios/              # Archivos de audio generados
│   ├── 📁 consonants/
│   │   ├── 📁 words/              # Palabras ejemplo de consonantes
│   │   └── 📁 sentences/          # Frases ejemplo de consonantes
│   ├── 📁 vowels/
│   │   ├── 📁 words/              # Palabras ejemplo de vocales
│   │   └── 📁 sentences/          # Frases ejemplo de vocales
│   ├── 📁 tones/
│   │   └── 📁 examples/           # Ejemplos de tonos
│   ├── 📁 individual_words/       # Palabras individuales
│   ├── 📁 zhuyin_sounds/          # Sonidos de caracteres Zhuyin
│   └── 📁 zhuyin_typing/          # Descomposiciones para escritura
├── 📄 index.html                  # Aplicación web principal
├── 📄 style.css                   # Estilos y diseño responsive
├── 📄 script.js                   # Lógica de la aplicación
├── 📄 zhuyin_data.json           # Datos estructurados de Zhuyin
├── 📄 zhuyin_audio_generator.py   # Generador de audios
├── 📄 requirements.txt            # Dependencias Python
└── 📄 README.md                   # Este archivo
```

---

## 🔊 Sistema de Audio

### 🎵 Tipos de Audio Generados

| Categoría | Descripción | Ejemplo |
|-----------|-------------|---------|
| **Sonidos Zhuyin** | Pronunciación de caracteres individuales | `ㄅ` → "ba" |
| **Palabras Ejemplo** | Palabras que contienen cada carácter | `爸爸` → "bàba" |
| **Frases Ejemplo** | Oraciones completas con contexto | `我的爸爸很高。` |
| **Palabras Individuales** | Cada palabra de las frases por separado | `我`, `的`, `爸爸`, etc. |
| **Escritura Zhuyin** | Secuencias para práctica de escritura | `ㄅㄚˋㄅㄚ˙` |

### 🛠️ Generador de Audio

#### Ejecutar el Generador
```bash
# Generar todos los audios
python zhuyin_audio_generator.py

# Opciones avanzadas
python zhuyin_audio_generator.py --delay 2.0  # Más lento
python zhuyin_audio_generator.py --clean      # Limpiar audios existentes
```

#### Características del Generador
- **200+ archivos MP3** organizados automáticamente
- **Pronunciación mejorada**: Consonantes con "a" (ba, pa, ma)
- **Control de velocidad**: Evita rate limiting de Google TTS
- **Manejo de errores**: Continúa si algunos archivos fallan
- **Progreso visual**: Muestra el estado de generación

---

## ⚙️ Configuración

### 🎛️ Opciones Disponibles

| Configuración | Descripción | Por Defecto |
|---------------|-------------|-------------|
| **Mostrar Pinyin** | Mostrar equivalencia pinyin en frente de carta | ✅ Activado |

### 💾 Almacenamiento Local
- Las configuraciones se guardan automáticamente en `localStorage`
- Persisten entre sesiones del navegador
- Se pueden restablecer limpiando datos del navegador

---

## 🎯 Casos de Uso

### 👨‍🎓 **Para Estudiantes**
- **Aprendizaje sistemático** del sistema Zhuyin
- **Práctica de pronunciación** con audio nativo
- **Memorización eficiente** con repetición espaciada
- **Estudio móvil** en cualquier lugar

### 👩‍🏫 **Para Profesores**
- **Material didáctico interactivo** para clase
- **Recurso multimedia** con audio y visual
- **Evaluación práctica** de conocimientos
- **Tarea interactiva** para estudiantes

### 📚 **Para Auto-aprendizaje**
- **Ritmo personalizado** de estudio
- **Progreso visual** del avance
- **Configuración adaptable** a preferencias
- **Acceso sin conexión** (una vez cargado)

---

## 🔧 Desarrollo

### 🛠️ Tecnologías Utilizadas

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript ES6+ | Interfaz de usuario |
| **Estilos** | CSS3 con Flexbox/Grid | Diseño responsive |
| **Audio** | Web Audio API | Reproducción de sonidos |
| **Datos** | JSON | Almacenamiento estructurado |
| **Generador** | Python 3.7+ | Automatización de audios |
| **TTS** | Google Text-to-Speech (gTTS) | Síntesis de voz |

### 🎨 Características Técnicas

- **Responsive Design**: Se adapta a móviles, tablets y escritorio
- **Progressive Enhancement**: Funciona sin JavaScript (básico)
- **Accesibilidad**: Navegación por teclado y lectores de pantalla
- **Performance**: Carga lazy de audios y optimización de recursos
- **Cross-browser**: Compatible con navegadores modernos

### 🧪 Estructura del Código

#### Frontend (JavaScript)
```javascript
class ZhuyinFlashcards {
    constructor()     // Inicialización
    loadData()        // Carga datos JSON
    setupCards()      // Configuración de cartas
    playAudio()       // Sistema de audio
    updateDisplay()   // Actualización de UI
}
```

#### Backend (Python)
```python
class ZhuyinAudioGenerator {
    generate_all_audios()      // Función principal
    generate_zhuyin_sounds()   // Sonidos individuales
    generate_consonant_audios() // Audios de consonantes
    generate_vowel_audios()    // Audios de vocales
}
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 🎉

### 🚀 Cómo Contribuir

1. **Fork** el repositorio
2. **Crear rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abrir Pull Request**

### 🐛 Reportar Bugs

- Usar las [**Issues**](https://github.com/tuusuario/zhuyin-learning-system/issues) de GitHub
- Incluir **pasos para reproducir** el problema
- **Screenshots** si es posible
- **Información del navegador/sistema**

### 💡 Sugerir Mejoras

- **Nuevas funcionalidades** para el sistema de flashcards
- **Mejoras en la UI/UX**
- **Optimizaciones de rendimiento**
- **Soporte para más idiomas**

### 🎯 Roadmap Futuro

- [ ] **Modo examen** con temporizador
- [ ] **Sistema de logros** y puntuación
- [ ] **Estadísticas detalladas** de progreso
- [ ] **Modo oscuro/claro**
- [ ] **Exportar/importar** progreso
- [ ] **PWA completa** para instalación
- [ ] **Soporte offline** mejorado
- [ ] **Más métodos de input** (escritura a mano)

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2024 Zhuyin Learning System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Agradecimientos

- **Google Text-to-Speech** por el sistema de síntesis de voz
- **Font Awesome** por los iconos utilizados
- **Comunidad de Taiwán** por preservar el sistema Zhuyin
- **Todos los contribuidores** que hacen posible este proyecto

---

## 📞 Contacto

- **GitHub**: [@PoltoProgrammer](https://github.com/PoltoProgrammer)
- **Issues**: [Reportar problema](https://github.com/PoltoProgrammer/zhuyin-interactive-flashcards/issues)
- **Discussions**: [Conversaciones](https://github.com/PoltoProgrammer/zhuyin-interactive-flashcards/discussions)

---

<div align="center">

**⭐ Si este proyecto te ayuda a aprender Zhuyin, ¡dale una estrella! ⭐**

**Made with ❤️ for Chinese language learners by [@PoltoProgrammer](https://github.com/PoltoProgrammer)**

</div>
