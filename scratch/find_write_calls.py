import json

LOG_PATH = "/Users/youssefmahir/.gemini/antigravity-ide/brain/936800b0-a891-45d6-9b64-a85562f926a8/.system_generated/logs/transcript.jsonl"

print("Scanning for write/replace tool calls on page.tsx...")
with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line_str in enumerate(f):
        try:
            data = json.loads(line_str)
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name")
                if name in ["write_to_file", "replace_file_content", "multi_replace_file_content"]:
                    args = tc.get("arguments", {})
                    target = args.get("TargetFile", "")
                    if "page.tsx" in target:
                        print(f"Line {idx+1}: Step {data.get('step_index')}, Tool: {name}, Args keys: {list(args.keys())}")
                        # Print lengths of content fields
                        if "CodeContent" in args:
                            print(f"  CodeContent len: {len(args['CodeContent'])}")
                        if "ReplacementContent" in args:
                            print(f"  ReplacementContent len: {len(args['ReplacementContent'])}")
                        if "ReplacementChunks" in args:
                            print(f"  ReplacementChunks count: {len(args['ReplacementChunks'])}")
        except Exception as e:
            pass
