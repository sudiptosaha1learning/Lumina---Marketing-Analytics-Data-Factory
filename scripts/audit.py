import re

files = [
    "/vercel/share/v0-project/lib/dashboard-data.ts",
    "/vercel/share/v0-project/components/dashboard/ModelMosaic.tsx",
    "/vercel/share/v0-project/components/dashboard/ReasoningEngine.tsx",
    "/vercel/share/v0-project/components/dashboard/MissionCommand.tsx",
    "/vercel/share/v0-project/components/dashboard/RetailerDrillDown.tsx",
    "/vercel/share/v0-project/components/dashboard/Sidebar.tsx",
    "/vercel/share/v0-project/components/dashboard/Topbar.tsx",
    "/vercel/share/v0-project/components/dashboard/ThemeProvider.tsx",
    "/vercel/share/v0-project/app/page.tsx",
    "/vercel/share/v0-project/app/layout.tsx",
]

for path in files:
    try:
        with open(path, "r", encoding="utf-8") as f:
            src = f.read()
        opens   = src.count("{")
        closes  = src.count("}")
        opensq  = src.count("[")
        closesq = src.count("]")
        openp   = src.count("(")
        closep  = src.count(")")
        bt      = src.count("`")
        short   = path.split("/")[-1]
        issues = []
        if opens != closes:   issues.append(f"BRACES imbalanced: open={opens} close={closes} diff={opens-closes}")
        if opensq != closesq: issues.append(f"BRACKETS imbalanced: open={opensq} close={closesq} diff={opensq-closesq}")
        if openp != closep:   issues.append(f"PARENS imbalanced: open={openp} close={closep} diff={openp-closep}")
        if bt % 2 != 0:       issues.append(f"BACKTICKS odd count: {bt}")
        if issues:
            print(f"[FAIL] {short}:")
            for i in issues:
                print(f"       {i}")
        else:
            print(f"[OK]   {short} | braces={opens} brackets={opensq} parens={openp} backticks={bt}")
    except Exception as e:
        print(f"[ERROR] {path}: {e}")
