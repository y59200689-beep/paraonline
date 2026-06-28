"""
Reconstruct page.tsx from the JSONL transcript log by collecting all VIEW_FILE
entries for page.tsx where Total Lines = 4700, then stitching them together.
"""
import json
import re

LOG_PATH = "/Users/youssefmahir/.gemini/antigravity-ide/brain/936800b0-a891-45d6-9b64-a85562f926a8/.system_generated/logs/transcript.jsonl"
OUT_PATH = "/Users/youssefmahir/Developer/ecom/scratch/reconstructed_page.tsx"

# We'll collect slices: {start_line: content_text}
slices = {}

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line_str in enumerate(f):
        try:
            data = json.loads(line_str)
            if data.get("type") == "VIEW_FILE":
                content = data.get("content", "")
                if "src/app/admin/page.tsx" in content and "Total Lines: 4700" in content:
                    # Parse start/end lines
                    m = re.search(r'Showing lines (\d+) to (\d+)', content)
                    if m:
                        start_l = int(m.group(1))
                        end_l = int(m.group(2))
                        # Extract actual code content (after the header)
                        # Find the line after "Please note..."
                        lines = content.split('\n')
                        code_start_idx = None
                        for i, l in enumerate(lines):
                            if 'Please note that any changes' in l:
                                code_start_idx = i + 1
                                break
                        if code_start_idx is None:
                            continue
                        
                        code_lines = lines[code_start_idx:]
                        # Each line has format "N: original_line"
                        parsed = []
                        for code_line in code_lines:
                            m2 = re.match(r'^(\d+): (.*)$', code_line)
                            if m2:
                                parsed.append((int(m2.group(1)), m2.group(2)))
                        
                        if parsed:
                            if start_l not in slices:
                                slices[start_l] = (end_l, parsed)
                                print(f"Captured slice {start_l}-{end_l}, {len(parsed)} lines from log line {idx+1}")
        except Exception as e:
            pass

print(f"\nTotal unique slices: {len(slices)}")
covered = sorted(slices.keys())
print(f"Slices start lines: {covered}")

# Stitch slices together
all_lines = {}
for start_l, (end_l, parsed) in slices.items():
    for line_num, line_content in parsed:
        if line_num not in all_lines:
            all_lines[line_num] = line_content

print(f"\nTotal reconstructed lines: {len(all_lines)}")
max_line = max(all_lines.keys()) if all_lines else 0
print(f"Max line number: {max_line}")
missing = [i for i in range(1, max_line+1) if i not in all_lines]
print(f"Missing lines: {missing[:50]}" if missing else "No missing lines!")

# Write to file
with open(OUT_PATH, 'w', encoding='utf-8') as f:
    for i in range(1, max_line + 1):
        line = all_lines.get(i, f"/* MISSING LINE {i} */")
        f.write(line + '\n')

print(f"\nWrote {max_line} lines to {OUT_PATH}")
