import os
import re

standard_numbers = {50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950}

# Standard exceptions for opacity / arbitrary values / etc.
color_pattern = re.compile(r'\b(bg|text|border|ring|divide|from|to|via)-([a-z]+)-([0-9]+)\b')

invalid_occurrences = []

for root, dirs, files in os.walk('/Users/youssefmahir/Developer/ecom/src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css', '.html')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                matches = color_pattern.findall(content)
                for match in matches:
                    prefix, color_name, num_str = match
                    num = int(num_str)
                    if num not in standard_numbers:
                        invalid_occurrences.append((path, prefix, color_name, num))
            except Exception as e:
                pass

print(f"Found {len(invalid_occurrences)} invalid occurrences:")
unique_invalids = set()
for path, prefix, color_name, num in invalid_occurrences:
    unique_invalids.add((prefix, color_name, num))

for prefix, color_name, num in sorted(unique_invalids):
    print(f"  {prefix}-{color_name}-{num}")
