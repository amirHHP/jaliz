import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def get_docx_paragraphs(path):
    try:
        if not os.path.exists(path):
            return [f"Error: File {path} does not exist."]
        doc = zipfile.ZipFile(path)
        xml_content = doc.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        # Namespaces in docx xml
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        for p in root.findall('.//w:p', ns):
            texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
            if texts:
                paragraphs.append(''.join(texts))
        return paragraphs
    except Exception as e:
        return [f"Error: {e}"]

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python read_docx.py <path_to_docx> [start_p] [end_p]")
        sys.exit(1)
        
    paragraphs = get_docx_paragraphs(sys.argv[1])
    
    start = 0
    end = len(paragraphs)
    
    if len(sys.argv) >= 3:
        try:
            start = int(sys.argv[2])
        except ValueError:
            pass
            
    if len(sys.argv) >= 4:
        try:
            end = int(sys.argv[3])
        except ValueError:
            pass
            
    chunk = paragraphs[start:end]
    print(f"--- PARAGRAPHS {start} TO {min(end, len(paragraphs))} (TOTAL {len(paragraphs)}) ---")
    print('\n\n'.join(chunk))
