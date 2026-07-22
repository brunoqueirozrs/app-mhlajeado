import re

with open('src/components/GestaoPessoasPage.tsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = "import PerfilComercialForm from './PerfilComercialForm';\nimport RolePlayIA from './RolePlayIA';"
content = content.replace("import PerfilComercialForm from './PerfilComercialForm';", import_stmt)

# Add module to list
module_item = '{ id: "roleplay", nome: "Role Play IA", icon: Bot, desc: "Simulador de Vendas", color: "text-blue-600", bg: "bg-blue-50" },\n                      { id: "disc", nome: "DISC & Perfil Animal"'
content = content.replace('{ id: "disc", nome: "DISC & Perfil Animal"', module_item)

# Add import Bot if not present
if "Bot" not in content[:1000]:
    content = content.replace("import { Users, Target, FileText", "import { Users, Target, FileText, Bot")
    
# Render roleplay
render_roleplay = """
  const renderRolePlay = () => {
    if (!selectedVendor) return null;
    return <RolePlayIA vendorId={selectedVendor.id} vendorName={selectedVendor.nome} />;
  };
"""

content = content.replace("const renderDisc = () => {", render_roleplay + "\n  const renderDisc = () => {")

# Add to Dashboard / switch
render_call = "{vendorTab === 'roleplay' && renderRolePlay()}"
content = content.replace('{vendorTab === "dashboard" && (', render_call + "\n                            {vendorTab === \"dashboard\" && (")

with open('src/components/GestaoPessoasPage.tsx', 'w') as f:
    f.write(content)

