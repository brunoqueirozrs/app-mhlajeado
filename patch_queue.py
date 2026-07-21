with open("src/components/InstallationsQueuePage.tsx", "r") as f:
    content = f.read()

old_buttons = """<div className="flex shrink-0">
            <button
              onClick={loadQueue}"""

new_buttons = """<div className="flex shrink-0 gap-3">
            <button 
              onClick={() => setIsAddingProtocol(true)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Protocolo</span>
            </button>
            <button
              onClick={loadQueue}"""

content = content.replace(old_buttons, new_buttons)

with open("src/components/InstallationsQueuePage.tsx", "w") as f:
    f.write(content)
