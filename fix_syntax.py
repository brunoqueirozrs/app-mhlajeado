with open("src/components/GestaoPessoasPage.tsx", "r") as f:
    lines = f.readlines()

with open("src/components/GestaoPessoasPage.tsx", "w") as f:
    for i, line in enumerate(lines):
        # Find where renderPdi ends and we added `  };\n`
        # and remove it. It's right before `const renderCompetencias`
        if line.strip() == "};" and "const renderCompetencias" in lines[i+1]:
            continue
        f.write(line)
