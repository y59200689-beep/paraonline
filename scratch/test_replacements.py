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

replacements_to_make = []

for root, dirs, files in os.walk('/Users/youssefmahir/Developer/ecom/src'):
    # Ignore scratch and .git etc.
    if 'scratch' in root or '.git' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css', '.html')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                for line_idx, line in enumerate(lines):
                    matches = color_pattern.findall(line)
                    for match in matches:
                        prefix, color_name, num_str = match
                        if color_name not in valid_colors:
                            continue
                        num = int(num_str)
                        if num not in standard_numbers:
                            repl_num = get_replacement_num(color_name, num)
                            old_class = f"{prefix}-{color_name}-{num_str}"
                            new_class = f"{prefix}-{color_name}-{repl_num}"
                            replacements_to_make.append({
                                'file': path,
                                'line_num': line_idx + 1,
                                'old': old_class,
                                'new': new_class,
                                'content': line.strip()
                            })
            except Exception as e:
                pass

print(f"Would perform {len(replacements_to_make)} replacements:")
for r in replacements_to_make[:30]:
    print(f"File: {os.path.basename(r['file'])}:{r['line_num']}")
    print(f"  Replace: {r['old']} -> {r['new']}")
    print(f"  Line: {r['content'][:80]}")

if len(replacements_to_make) > 30:
    print(f"... and {len(replacements_to_make) - 30} more")
