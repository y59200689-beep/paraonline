import os
import re

standard_numbers = {50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950}
valid_colors = {
    'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 
    'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 
    'indigo', 'violet', 'fuchsia', 'pink', 'rose'
}

color_pattern = re.compile(r'\b(bg|text|border|ring|divide|from|to|via)-([a-z]+)-([0-9]+)\b')

def get_replacement_num(color, num):
    if num in standard_numbers:
        return num
    
    # Custom mapping for known ones
    if num == 955:
        return 950
    if num == 850 or num == 855:
        return 800
    if num == 750 or num == 755:
        return 700
    if num == 650 or num == 655:
        return 600
    if num == 550 or num == 555:
        return 500
    if num == 450 or num == 455:
        return 400
    if num == 350 or num == 355:
        return 300
    if num == 250 or num == 255:
        return 200
    if num == 150 or num == 155:
        return 100
    if num == 55:
        return 50
    if num == 25:
        return 50
    if num in (405, 505, 605, 705, 805):
        return (num // 100) * 100
        
    # Default fallback: round to nearest standard
    nearest = min(standard_numbers, key=lambda x: abs(x - num))
    return nearest

def replace_match(match):
    prefix, color_name, num_str = match.groups()
    if color_name not in valid_colors:
        return match.group(0)
    num = int(num_str)
    if num in standard_numbers:
        return match.group(0)
    
    repl_num = get_replacement_num(color_name, num)
    return f"{prefix}-{color_name}-{repl_num}"

modified_files_count = 0
replacements_count = 0

for root, dirs, files in os.walk('/Users/youssefmahir/Developer/ecom/src'):
    if 'scratch' in root or '.git' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css', '.html')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check how many changes will happen
                new_content, count = color_pattern.subn(replace_match, content)
                
                if count > 0:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {os.path.relpath(path, '/Users/youssefmahir/Developer/ecom/src')}: made {count} replacements.")
                    modified_files_count += 1
                    replacements_count += count
            except Exception as e:
                print(f"Error processing {path}: {e}")

print(f"\nDone! Updated {modified_files_count} files with a total of {replacements_count} replacements.")
