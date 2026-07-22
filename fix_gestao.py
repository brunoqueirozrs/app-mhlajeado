import re

with open('src/components/GestaoPessoasPage.tsx', 'r') as f:
    content = f.read()

# 1. Add Bot to imports from lucide-react if not present
if " Bot," not in content and "Bot " not in content:
    content = content.replace("import { Users, Target,", "import { Users, Target, Bot,")

# 2. Add 'roleplay' to the type of vendorTab
pattern = r'(const \[vendorTab, setVendorTab\] = useState<)(.+?)(>\("modulos"\);)'
def replace_vendor_tab(m):
    types = m.group(2)
    if '"roleplay"' not in types:
        types += ' | "roleplay"'
    return m.group(1) + types + m.group(3)

content = re.sub(pattern, replace_vendor_tab, content)

# 3. Add renderRolePlay
render_roleplay = """
  const renderRolePlay = () => {
    if (!selectedVendor) return null;
    return <RolePlayIA vendorId={selectedVendor.id} vendorName={selectedVendor.nome} />;
  };

  const renderDisc = () => ("""
content = content.replace("  const renderDisc = () => (", render_roleplay)

with open('src/components/GestaoPessoasPage.tsx', 'w') as f:
    f.write(content)

