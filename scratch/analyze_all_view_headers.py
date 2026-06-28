import json

LOG_PATH = "/Users/youssefmahir/.gemini/antigravity-ide/brain/936800b0-a891-45d6-9b64-a85562f926a8/.system_generated/logs/transcript.jsonl"

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line_str in enumerate(f):
        try:
            data = json.loads(line_str)
            if data.get("type") == "VIEW_FILE":
                content = data.get("content", "")
                lines = content.split('\n')
                header = [l for l in lines[:10] if "Showing lines" in l or "Total Lines" in l]
                if header:
                    # Check if the content is page.tsx
                    file_path = ""
                    for l in lines[:10]:
                        if "File Path" in l:
                            file_path = l
                    print(f"Log line {idx + 1}, Step {data.get('step_index')}: {file_path} {header} (Length: {len(content)})")
        except Exception as e:
            pass
