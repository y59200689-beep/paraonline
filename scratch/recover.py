import json
import os

MAP_PATH = "/Users/youssefmahir/Developer/ecom/.next/server/chunks/ssr/src_app_admin_page_tsx_0h9jaza._.js.map"
DEV_MAP_PATH = "/Users/youssefmahir/Developer/ecom/.next/dev/server/chunks/ssr/src_app_admin_page_tsx_0h9jaza._.js.map"

map_file = MAP_PATH if os.path.exists(MAP_PATH) else DEV_MAP_PATH

if not os.path.exists(map_file):
    print("No map file found!")
    # Look for any .map file with page_tsx in the name under .next
    import glob
    matches = glob.glob("/Users/youssefmahir/Developer/ecom/.next/**/*.map", recursive=True)
    page_maps = [m for m in matches if "page_tsx" in m]
    if page_maps:
        map_file = page_maps[0]
        print(f"Using found map file: {map_file}")
    else:
        print("No matches in .next either!")
        exit(1)

print(f"Reading source map: {map_file}")
with open(map_file, "r", encoding="utf-8") as f:
    map_data = json.load(f)

# Source maps have "sources" and "sourcesContent" lists
sources = map_data.get("sources", [])
sources_content = map_data.get("sourcesContent", [])

print(f"Found {len(sources)} sources in map file.")
for idx, src in enumerate(sources):
    print(f"Source {idx}: {src}")
    if "page.tsx" in src:
        # Extract content
        content = sources_content[idx]
        out_path = "/Users/youssefmahir/Developer/ecom/src/app/admin/page.tsx"
        with open(out_path, "w", encoding="utf-8") as wf:
            wf.write(content)
        print(f"\nSUCCESS! Recovered original page.tsx from source map and wrote to {out_path} ({len(content)} chars)")
        break
else:
    print("Could not find page.tsx source inside map file sources list.")
