import json
import re

file_path = r'c:\laragon\www\SmartCS\knowledge\fitur\destinator.json'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Remove citations like [1], [1, 2], [1, 2, 3] etc.
# Also handle cases with spaces or commas inside
cleaned_content = re.sub(r'\s?\[[\d\s,]+\]', '', content)

# Fix common encoding artifacts if any
cleaned_content = cleaned_content.replace('?', '–')

try:
    data = json.loads(cleaned_content)
    # Normalize structure for VirtualCS.jsx: rename root key to 'kendaraan'
    if 'mitsubishi_destinator_knowledge_base' in data:
        data['kendaraan'] = data.pop('mitsubishi_destinator_knowledge_base')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
    print("Successfully cleaned and normalized destinator.json")
except Exception as e:
    print(f"Error: {e}")
