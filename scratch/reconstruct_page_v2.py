"""
More comprehensive reconstruction - get ALL view_file entries for page.tsx,
regardless of Total Lines count (to catch earlier/intermediate versions too).
Focus on Total Lines: 4700 entries and also pull from entries that have admin/page.tsx.
"""
import json
import re

LOG_PATH = "/Users/youssefmahir/.gemini/antigravity-ide/brain/936800b0-a891-45d6-9b64-a85562f926a8/.system_generated/logs/transcript.jsonl"
OUT_PATH = "/Users/youssefmahir/Developer/ecom/scratch/reconstructed_page_v2.tsx"

all_lines = {}

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line_str in enumerate(f):
        try:
            data = json.loads(line_str)
            if data.get("type") == "VIEW_FILE":
                content = data.get("content", "")
                if "src/app/admin/page.tsx" in content and "Total Lines: 4700" in content:
                    m = re.search(r'Showing lines (\d+) to (\d+)', content)
                    if m:
                        start_l = int(m.group(1))
                        end_l = int(m.group(2))
                        lines = content.split('\n')
                        code_start_idx = None
                        for i, l in enumerate(lines):
                            if 'Please note that any changes' in l:
                                code_start_idx = i + 1
                                break
                        if code_start_idx is None:
                            continue
                        code_lines = lines[code_start_idx:]
                        for code_line in code_lines:
                            m2 = re.match(r'^(\d+): (.*)$', code_line)
                            if m2:
                                line_num = int(m2.group(1))
                                if line_num not in all_lines:
                                    all_lines[line_num] = m2.group(2)
                                    
            # Also check tool_calls arguments for page.tsx content
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name", "")
                args = tc.get("arguments", {})
                if args and "TargetFile" in args and "admin/page.tsx" in args.get("TargetFile", ""):
                    if name == "write_to_file":
                        code = args.get("CodeContent", "")
                        if code and len(code) > 100:
                            print(f"Found write_to_file for page.tsx at step {data.get('step_index')}, content len: {len(code)}")
                            # Write separately
                            with open(f"/Users/youssefmahir/Developer/ecom/scratch/page_write_{data.get('step_index')}.tsx", 'w') as wf:
                                wf.write(code)
                    elif name in ["replace_file_content", "multi_replace_file_content"]:
                        print(f"Found {name} for page.tsx at step {data.get('step_index')}")
                        
        except Exception as e:
            pass

print(f"Reconstructed {len(all_lines)} unique lines")
max_line = max(all_lines.keys()) if all_lines else 0
missing = [i for i in range(1, max_line+1) if i not in all_lines]
print(f"Max line: {max_line}")
print(f"Missing count: {len(missing)}")

# Show ranges of missing lines
ranges = []
if missing:
    start = missing[0]
    prev = missing[0]
    for m in missing[1:]:
        if m != prev + 1:
            ranges.append((start, prev))
            start = m
        prev = m
    ranges.append((start, prev))

print("Missing ranges:")
for r in ranges:
    print(f"  Lines {r[0]}-{r[1]} ({r[1]-r[0]+1} lines)")

# Write whatever we have
with open(OUT_PATH, 'w', encoding='utf-8') as f:
    for i in range(1, max_line + 1):
        line = all_lines.get(i, f"/* MISSING LINE {i} */")
        f.write(line + '\n')

print(f"\nWrote to {OUT_PATH}")
