import json
import re

LOG_PATH = "/Users/youssefmahir/.gemini/antigravity-ide/brain/936800b0-a891-45d6-9b64-a85562f926a8/.system_generated/logs/transcript.jsonl"

views = []
with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line_str in enumerate(f):
        try:
            data = json.loads(line_str)
            # Look at tool_calls
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                if tc.get("name") == "view_file":
                    args = tc.get("arguments", {})
                    path = args.get("AbsolutePath", "")
                    if "src/app/admin/page.tsx" in path:
                        views.append({
                            "line": idx + 1,
                            "step": data.get("step_index"),
                            "start": args.get("StartLine"),
                            "end": args.get("EndLine"),
                            "role": "call"
                        })
            
            # Also check if it's the response to a view_file call (status 'DONE' and contains page.tsx content)
            if data.get("type") == "VIEW_FILE" and "Total Lines: 4700" in data.get("content", ""):
                views.append({
                    "line": idx + 1,
                    "step": data.get("step_index"),
                    "length": len(data.get("content", "")),
                    "role": "response",
                    "content": data.get("content", "")
                })
        except Exception as e:
            pass

print(f"Found {len(views)} entries related to page.tsx view:")
for v in views:
    if v["role"] == "call":
        print(f"Call on log line {v['line']}, Step {v['step']}: StartLine={v['start']}, EndLine={v['end']}")
    else:
        # Parse the content header to see what range it is
        first_lines = v["content"][:200].replace('\n', ' ')
        print(f"Response on log line {v['line']}, Step {v['step']}: length={v['length']}, header: {first_lines[:120]}")
