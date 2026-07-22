with open("src/components/GestaoPessoasPage.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Check if the line is exactly "  };\n" and the next non-empty line starts with "  const render"
    if line.strip() == "};":
        # look ahead
        next_line = ""
        for j in range(i+1, len(lines)):
            if lines[j].strip():
                next_line = lines[j].strip()
                break
        if next_line.startswith("const render") and not line.startswith("  };"):
            # wait, they are all inside a component, so it should be indented.
            pass
        
        # Actually, let's just use regex to find all `  );\n  };\n  const render` and replace with `  );\n  const render`
        # But wait, `renderCompetencias` actually NEEDS the `};` because it was changed to `const renderCompetencias = () => {`!
        # So we only want to remove `  };\n` if the previous line is `  );\n` and the NEXT component is NOT `renderCompetencias`? No, `renderCompetencias` is the one that HAS the block, so it's the one that ENDS with `  };\n`. 
        pass

with open("src/components/GestaoPessoasPage.tsx", "r") as f:
    content = f.read()

import re

# Fix renderDisc
content = content.replace("  );\n  };\n  const renderPdi = () => (", "  );\n  const renderPdi = () => (")

# Fix renderPdi
content = content.replace("  );\n  };\n  const renderCompetencias = () => {", "  );\n  const renderCompetencias = () => {")

# Fix renderCompetencias (it actually needs it because it opens with `{`!)
# wait, does it open with `{`?
#   const renderCompetencias = () => {
# Yes! So the end of renderCompetencias should be `  );\n  };\n  const renderPerfilComercial = () => (`
# Let's check if it is.
# If it's currently `  );\n  };\n  const renderPerfilComercial = () => (` then it's CORRECT!

# Fix renderPerfilComercial
content = content.replace("  );\n  };\n  const renderFitCargo = () => (", "  );\n  const renderFitCargo = () => (")

# Wait, there are more. `renderFitCargo`, `renderIndices`, etc.
# Did the python script replace ALL of them?
# Let's just remove ALL `  };\n` that are immediately followed by `  const renderX = () => (`
content = re.sub(r'  \};\n(\s+const render[a-zA-Z0-9_]+ = \(\) => \()', r'\1', content)

# Also check for the end of the file or anywhere else.
# Let's save and see if it compiles.
with open("src/components/GestaoPessoasPage.tsx", "w") as f:
    f.write(content)

