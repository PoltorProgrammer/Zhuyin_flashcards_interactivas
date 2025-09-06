#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Audios para Zhuyin/Bopomofo - VERSIÓN CORREGIDA
Genera automáticamente archivos de audio para palabras y frases en chino mandarín
usando Google Text-to-Speech (gTTS)

CORRECCIÓN: Arregla el problema de pronunciación para ㄒ, ㄘ, ㄈ y ㄓ
"""

import json
import os
import time
import re
from pathlib import Path
from typing import Dict, List, Any
import requests
from gtts import gTTS


class ZhuyinAudioGenerator:
    def __init__(self, json_file: str = "zhuyin_data.json", output_dir: str = "zhuyin_audios"):
        """
        Inicializa el generador de audios
        
        Args:
            json_file: Ruta al archivo JSON con los datos de zhuyin
            output_dir: Directorio donde se guardarán los audios
        """
        self.json_file = json_file
        self.output_dir = Path(output_dir)
        self.data = None
        self.delay = 1  # Delay entre requests para evitar rate limiting
        
        # Consonantes problemáticas que necesitan tratamiento especial
        self.problematic_consonants = {
            'ㄒ': 'xi',   # xi -> debería sonar como "xia" 
            'ㄘ': 'ci',   # ci -> debería sonar como "ca"
            'ㄈ': 'f',    # f -> debería sonar como "fa"
            'ㄓ': 'zhi'   # zhi -> debería sonar como "zha"
        }
        
        # Crear directorios
        self.create_directories()
        
    def create_directories(self):
        """Crea la estructura de directorios para organizar los audios"""
        directories = [
            self.output_dir,
            self.output_dir / "consonants" / "words",
            self.output_dir / "consonants" / "sentences",
            self.output_dir / "vowels" / "words", 
            self.output_dir / "vowels" / "sentences",
            self.output_dir / "tones" / "examples",
            self.output_dir / "individual_words",
            self.output_dir / "zhuyin_sounds"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
    def load_data(self):
        """Carga los datos desde el archivo JSON"""
        try:
            with open(self.json_file, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            print(f"✓ Datos cargados desde {self.json_file}")
        except FileNotFoundError:
            print(f"✗ Error: No se encontró el archivo {self.json_file}")
            return False
        except json.JSONDecodeError:
            print(f"✗ Error: El archivo {self.json_file} no tiene un formato JSON válido")
            return False
        return True
        
    def check_internet_connection(self):
        """Verifica la conexión a internet"""
        try:
            requests.get("https://www.google.com", timeout=5)
            return True
        except requests.RequestException:
            return False
            
    def sanitize_filename(self, text: str) -> str:
        """Sanitiza el texto para usar como nombre de archivo"""
        # Remueve caracteres no válidos para nombres de archivo
        sanitized = re.sub(r'[<>:"/\\|?*]', '', text)
        # Reemplaza espacios y puntuación con guiones bajos
        sanitized = re.sub(r'[\s.,!?;:，。！？；：]', '_', sanitized)
        # Remueve guiones bajos múltiples
        sanitized = re.sub(r'_+', '_', sanitized)
        # Remueve guiones bajos al inicio y final
        sanitized = sanitized.strip('_')
        return sanitized
        
    def generate_audio(self, text: str, filename: str, lang: str = 'zh') -> bool:
        """
        Genera un archivo de audio usando gTTS
        
        Args:
            text: Texto a convertir en audio
            filename: Nombre del archivo de salida (sin extensión)
            lang: Código de idioma (zh para chino)
        
        Returns:
            bool: True si el audio se generó exitosamente
        """
        try:
            # Agregar extensión .mp3
            if not filename.endswith('.mp3'):
                filename += '.mp3'
                
            # Si el archivo ya existe, saltarlo
            if os.path.exists(filename):
                print(f"  ⭐️  {os.path.basename(filename)} ya existe, saltando...")
                return True
                
            tts = gTTS(text=text, lang=lang, slow=False)
            tts.save(filename)
            print(f"  ✓ Generado: {os.path.basename(filename)}")
            
            # Pequeña pausa para evitar rate limiting
            time.sleep(self.delay)
            return True
            
        except Exception as e:
            print(f"  ✗ Error generando {filename}: {str(e)}")
            return False
            
    def generate_zhuyin_sounds(self):
        """Genera audios para los sonidos individuales de zhuyin - VERSIÓN CORREGIDA"""
        print("\n🔊 Generando audios para sonidos zhuyin individuales...")
        
        # Consonantes - CORREGIDO para consonantes problemáticas
        for consonant in self.data['zhuyin_system']['consonants']:
            zhuyin = consonant['zhuyin']
            pinyin = consonant['pinyin']
            
            filename = self.output_dir / "zhuyin_sounds" / f"{self.sanitize_filename(zhuyin)}_{pinyin}.mp3"
            
            # CORRECCIÓN PRINCIPAL: Para consonantes problemáticas, usar zhuyin + ㄚ
            if zhuyin in self.problematic_consonants:
                # Usar el carácter zhuyin + ㄚ (vocal 'a' en zhuyin)
                consonant_sound = zhuyin + 'ㄚ'
                print(f"  🔧 Generando consonante problemática {zhuyin} ({pinyin}) como '{consonant_sound}' (usando zhuyin)")
            else:
                # Para el resto, usar pinyin + 'a' como antes
                consonant_sound = pinyin + 'a'
                print(f"  Generando consonante {zhuyin} ({pinyin}) como '{consonant_sound}' (usando pinyin)")
            
            self.generate_audio(consonant_sound, str(filename))
            
        # Vocales - mantener el comportamiento correcto existente
        for vowel in self.data['zhuyin_system']['vowels']:
            zhuyin = vowel['zhuyin']
            pinyin = vowel['pinyin']
            
            filename = self.output_dir / "zhuyin_sounds" / f"{self.sanitize_filename(zhuyin)}_{pinyin}.mp3"
            print(f"  Generando vocal {zhuyin} ({pinyin}) usando carácter zhuyin '{zhuyin}'")
            self.generate_audio(zhuyin, str(filename))
            
    def generate_consonant_audios(self):
        """Genera audios para consonantes, sus palabras y frases"""
        print("\n🔊 Generando audios para consonantes...")
        
        consonants = self.data['zhuyin_system']['consonants']
        total = len(consonants)
        
        for i, consonant in enumerate(consonants, 1):
            zhuyin = consonant['zhuyin']
            pinyin = consonant['pinyin']
            
            print(f"\n[{i}/{total}] Procesando consonante {zhuyin} ({pinyin})")
            
            # Audio de la palabra ejemplo
            word = consonant['example_word']
            word_filename = self.output_dir / "consonants" / "words" / f"{self.sanitize_filename(zhuyin)}_{self.sanitize_filename(word['characters'])}_{word['pinyin']}.mp3"
            self.generate_audio(word['characters'], str(word_filename))
            
            # Audio de la frase ejemplo
            sentence = consonant['example_sentence']
            sentence_filename = self.output_dir / "consonants" / "sentences" / f"{self.sanitize_filename(zhuyin)}_{self.sanitize_filename(sentence['characters'][:10])}.mp3"
            self.generate_audio(sentence['characters'], str(sentence_filename))
            
            # Audios de palabras individuales en la frase
            for word_data in sentence['words']:
                individual_filename = self.output_dir / "individual_words" / f"{self.sanitize_filename(word_data['characters'])}_{word_data['pinyin']}.mp3"
                self.generate_audio(word_data['characters'], str(individual_filename))
                
    def generate_vowel_audios(self):
        """Genera audios para vocales, sus palabras y frases"""
        print("\n🔊 Generando audios para vocales...")
        
        vowels = self.data['zhuyin_system']['vowels']
        total = len(vowels)
        
        for i, vowel in enumerate(vowels, 1):
            zhuyin = vowel['zhuyin']
            pinyin = vowel['pinyin']
            
            print(f"\n[{i}/{total}] Procesando vocal {zhuyin} ({pinyin})")
            
            # Audio de la palabra ejemplo
            word = vowel['example_word']
            word_filename = self.output_dir / "vowels" / "words" / f"{self.sanitize_filename(zhuyin)}_{self.sanitize_filename(word['characters'])}_{word['pinyin']}.mp3"
            self.generate_audio(word['characters'], str(word_filename))
            
            # Audio de la frase ejemplo
            sentence = vowel['example_sentence']
            sentence_filename = self.output_dir / "vowels" / "sentences" / f"{self.sanitize_filename(zhuyin)}_{self.sanitize_filename(sentence['characters'][:10])}.mp3"
            self.generate_audio(sentence['characters'], str(sentence_filename))
            
            # Audios de palabras individuales en la frase
            for word_data in sentence['words']:
                individual_filename = self.output_dir / "individual_words" / f"{self.sanitize_filename(word_data['characters'])}_{word_data['pinyin']}.mp3"
                self.generate_audio(word_data['characters'], str(individual_filename))
                
    def generate_tone_audios(self):
        """Genera audios para ejemplos de tonos"""
        print("\n🔊 Generando audios para ejemplos de tonos...")
        
        tones = self.data['zhuyin_system']['tones']
        
        for tone in tones:
            tone_num = tone['tone_number']
            description = tone['description']
            example = tone['example']
            
            print(f"\nProcesando tono {tone_num}: {description}")
            
            filename = self.output_dir / "tones" / "examples" / f"tono_{tone_num}_{self.sanitize_filename(example['characters'])}_{example['pinyin']}.mp3"
            self.generate_audio(example['characters'], str(filename))
            
    def regenerate_problematic_consonants_only(self):
        """Regenera solo las consonantes problemáticas (útil para corregir el problema específico)"""
        if not self.load_data():
            return False
            
        if not self.check_internet_connection():
            print("✗ Error: No hay conexión a internet. gTTS requiere conexión a internet.")
            return False
            
        print("🔧 Regenerando SOLO las consonantes problemáticas (ㄒ, ㄘ, ㄈ, ㄓ)...")
        
        # Crear directorio si no existe
        sounds_dir = self.output_dir / "zhuyin_sounds"
        sounds_dir.mkdir(parents=True, exist_ok=True)
        
        # Regenerar solo las consonantes problemáticas
        for consonant in self.data['zhuyin_system']['consonants']:
            zhuyin = consonant['zhuyin']
            pinyin = consonant['pinyin']
            
            # Solo procesar consonantes problemáticas
            if zhuyin in self.problematic_consonants:
                filename = sounds_dir / f"{self.sanitize_filename(zhuyin)}_{pinyin}.mp3"
                
                # Eliminar archivo existente si existe
                if filename.exists():
                    filename.unlink()
                    print(f"  🗑️  Eliminado archivo previo: {filename.name}")
                
                # Usar zhuyin + ㄚ para pronunciación correcta
                consonant_sound = zhuyin + 'ㄚ'
                print(f"  🔧 Regenerando consonante {zhuyin} ({pinyin}) como '{consonant_sound}'")
                self.generate_audio(consonant_sound, str(filename))
            
        print("✅ Regeneración de consonantes problemáticas completada!")
        return True
            
    def regenerate_vowel_sounds_only(self):
        """Regenera solo los sonidos de las vocales"""
        if not self.load_data():
            return False
            
        if not self.check_internet_connection():
            print("✗ Error: No hay conexión a internet. gTTS requiere conexión a internet.")
            return False
            
        print("🔊 Regenerando SOLO los sonidos de vocales zhuyin...")
        
        # Crear directorio si no existe
        sounds_dir = self.output_dir / "zhuyin_sounds"
        sounds_dir.mkdir(parents=True, exist_ok=True)
        
        # Regenerar solo las vocales
        for vowel in self.data['zhuyin_system']['vowels']:
            zhuyin = vowel['zhuyin']
            pinyin = vowel['pinyin']
            
            filename = sounds_dir / f"{self.sanitize_filename(zhuyin)}_{pinyin}.mp3"
            
            # Eliminar archivo existente si existe
            if filename.exists():
                filename.unlink()
                print(f"  🗑️  Eliminado archivo previo: {filename.name}")
            
            print(f"  Regenerando vocal {zhuyin} ({pinyin}) usando carácter zhuyin '{zhuyin}'")
            self.generate_audio(zhuyin, str(filename))
            
        print("✅ Regeneración de vocales completada!")
        return True
            
    def generate_all_audios(self):
        """Genera todos los audios"""
        if not self.load_data():
            return False
            
        if not self.check_internet_connection():
            print("✗ Error: No hay conexión a internet. gTTS requiere conexión a internet.")
            return False
            
        print("🎵 Iniciando generación de audios para Zhuyin/Bopomofo (VERSIÓN CORREGIDA)")
        print(f"📁 Los audios se guardarán en: {self.output_dir.absolute()}")
        print("🔧 Corrigiendo pronunciación de ㄒ, ㄘ, ㄈ y ㄓ...")
        
        start_time = time.time()
        
        try:
            # Generar audios por categorías
            self.generate_zhuyin_sounds()
            self.generate_consonant_audios()
            self.generate_vowel_audios()
            self.generate_tone_audios()
            
            elapsed_time = time.time() - start_time
            print(f"\n✅ ¡Generación completada en {elapsed_time:.1f} segundos!")
            print(f"📁 Todos los audios se han guardado en: {self.output_dir.absolute()}")
            
            # Mostrar estadísticas
            self.show_statistics()
            
        except KeyboardInterrupt:
            print("\n⏹️  Generación interrumpida por el usuario")
            return False
        except Exception as e:
            print(f"\n✗ Error inesperado: {str(e)}")
            return False
            
        return True
        
    def show_statistics(self):
        """Muestra estadísticas de los archivos generados"""
        print("\n📊 Estadísticas:")
        
        for subdir in self.output_dir.rglob("*"):
            if subdir.is_dir():
                mp3_files = list(subdir.glob("*.mp3"))
                if mp3_files:
                    relative_path = subdir.relative_to(self.output_dir)
                    print(f"  📂 {relative_path}: {len(mp3_files)} archivos")
                    
    def clean_audio_files(self):
        """Limpia todos los archivos de audio generados"""
        if not self.output_dir.exists():
            print("No hay archivos que limpiar.")
            return
            
        response = input(f"¿Estás seguro de que quieres eliminar todos los archivos en {self.output_dir}? (s/N): ")
        if response.lower() == 's':
            import shutil
            shutil.rmtree(self.output_dir)
            print("✓ Archivos limpiados.")
        else:
            print("Operación cancelada.")


def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generador de audios para Zhuyin/Bopomofo - VERSIÓN CORREGIDA")
    parser.add_argument("--json", default="zhuyin_data.json", help="Archivo JSON con datos de zhuyin")
    parser.add_argument("--output", default="zhuyin_audios", help="Directorio de salida para audios")
    parser.add_argument("--clean", action="store_true", help="Limpiar archivos de audio existentes")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay entre requests (segundos)")
    parser.add_argument("--fix-vowels", action="store_true", help="Regenerar solo los sonidos de vocales")
    parser.add_argument("--fix-consonants", action="store_true", help="Regenerar solo las consonantes problemáticas (ㄒ, ㄘ, ㄈ, ㄓ)")
    
    args = parser.parse_args()
    
    generator = ZhuyinAudioGenerator(args.json, args.output)
    generator.delay = args.delay
    
    if args.clean:
        generator.clean_audio_files()
        return
        
    if args.fix_vowels:
        success = generator.regenerate_vowel_sounds_only()
        if success:
            print("\n🎉 ¡Vocales corregidas exitosamente!")
        else:
            print("\n✗ Error al corregir las vocales.")
        return
        
    if args.fix_consonants:
        success = generator.regenerate_problematic_consonants_only()
        if success:
            print("\n🎉 ¡Consonantes problemáticas corregidas exitosamente!")
            print("🔊 Ahora deberías escuchar:")
            print("  • ㄈ como 'ㄈㄚ' (fa) en lugar de 'eff-ay'")
            print("  • ㄒ como 'ㄒㄚ' (xia) correctamente")
            print("  • ㄘ como 'ㄘㄚ' (ca) correctamente") 
            print("  • ㄓ como 'ㄓㄚ' (zha) correctamente")
        else:
            print("\n✗ Error al corregir las consonantes.")
        return
        
    success = generator.generate_all_audios()
    
    if success:
        print("\n🎉 ¡Proceso completado exitosamente!")
        print("\n📖 Cómo usar los audios:")
        print("  • consonants/words/: Palabras ejemplo para cada consonante")
        print("  • consonants/sentences/: Frases ejemplo para cada consonante")
        print("  • vowels/words/: Palabras ejemplo para cada vocal")
        print("  • vowels/sentences/: Frases ejemplo para cada vocal")
        print("  • tones/examples/: Ejemplos de tonos")
        print("  • individual_words/: Todas las palabras individuales")
        print("  • zhuyin_sounds/: Sonidos individuales de zhuyin")
        print("\n💡 Comandos útiles:")
        print("    python zhuyin_audio_generator.py --fix-vowels")
        print("    python zhuyin_audio_generator_fixed.py --fix-consonants")
    else:
        print("\n✗ El proceso no se completó correctamente.")


if __name__ == "__main__":
    main()