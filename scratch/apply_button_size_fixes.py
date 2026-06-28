import os
import re

button_pattern = re.compile(r'(<button\b[^>]*class(?:Name)?=")([^"]*)(")', re.DOTALL)

def resize_button_classes(match):
    prefix = match.group(1)
    classes = match.group(2)
    suffix = match.group(3)
    full_tag = match.group(0)
    
    # Check if this is a primary CTA / submit / form button
    is_main_cta = any(k in classes or k in full_tag for k in ['py-3', 'py-3.5', 'py-4', 'w-full', 'submit', 'bg-primary', 'bg-gradient', 'bg-slate-900', 'bg-whatsapp'])
    
    new_classes = classes
    modified = False
    for size in ['8', '9', '9.5', '10']:
        old_class = f"text-[{size}px]"
        if old_class in new_classes:
            new_class = "text-xs" if is_main_cta else "text-[11px]"
            new_classes = new_classes.replace(old_class, new_class)
            modified = True
            
    if modified:
        return prefix + new_classes + suffix
    return full_tag

modified_files_count = 0
replacements_count = 0

for root, dirs, files in os.walk('/Users/youssefmahir/Developer/ecom/src'):
    if 'scratch' in root or '.git' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.html')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content, count = button_pattern.subn(resize_button_classes, content)
                
                if count > 0 and new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated button sizes in {os.path.relpath(path, '/Users/youssefmahir/Developer/ecom/src')}")
                    modified_files_count += 1
                    replacements_count += count
            except Exception as e:
                print(f"Error processing {path}: {e}")

print(f"\nDone! Resized buttons in {modified_files_count} files.")
