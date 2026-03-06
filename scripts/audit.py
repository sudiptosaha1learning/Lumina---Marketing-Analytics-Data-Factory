import re, pathlib, os

# Discover project root dynamically
def find_root():
    for candidate in ["/vercel/path0", "/app", "/workspace", "/home/user/app"]:
        if pathlib.Path(candidate, "package.json").exists():
            return candidate
    # Walk up from cwd
    p = pathlib.Path(os.getcwd())
    while p != p.parent:
        if (p / "package.json").exists():
            return str(p)
        p = p.parent
    return os.getcwd()

BASE = find_root()
print(f"[INFO] Project root: {BASE}")

targets = [
    "lib/dashboard-data.ts",
    "components/dashboard/ModelMosaic.tsx",
    "components/dashboard/ReasoningEngine.tsx",
    "components/dashboard/MissionCommand.tsx",
    "components/dashboard/RetailerDrillDown.tsx",
    "components/dashboard/Sidebar.tsx",
    "components/dashboard/Topbar.tsx",
    "components/dashboard/ThemeProvider.tsx",
    "app/page.tsx",
    "app/layout.tsx",
]

for rel in targets:
    path = pathlib.Path(BASE) / rel
    if not path.exists():
        print(f"[MISSING] {rel}")
        continue
    try:
        src = path.read_text(encoding="utf-8")
        opens   = src.count("{")
        closes  = src.count("}")
        opensq  = src.count("[")
        closesq = src.count("]")
        openp   = src.count("(")
        closep  = src.count(")")
        bt      = src.count("`")
        issues = []
        if opens != closes:   issues.append(f"BRACES: open={opens} close={closes} diff={opens-closes}")
        if opensq != closesq: issues.append(f"BRACKETS: open={opensq} close={closesq} diff={opensq-closesq}")
        if openp != closep:   issues.append(f"PARENS: open={openp} close={closep} diff={openp-closep}")
        if bt % 2 != 0:       issues.append(f"BACKTICKS odd: {bt}")
        if issues:
            print(f"[FAIL] {rel}:")
            for i in issues: print(f"       {i}")
        else:
            print(f"[OK]   {rel} ({path.stat().st_size} bytes)")
    except Exception as e:
        print(f"[ERROR] {rel}: {e}")
