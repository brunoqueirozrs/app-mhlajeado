with open("src/components/GestaoPessoasPage.tsx", "r") as f:
    content = f.read()

# We need to find where renderCompetencias currently ends and add the missing closing brace.
# It used to end with:
#                           </div>
#                         </div>
#                       ) : (
#                         <div className="p-12 flex flex-col items-center justify-center text-center border-t border-slate-100">
#                           <Target className="w-16 h-16 text-orange-100 mb-4" />
#                           <h4 className="text-lg font-bold text-slate-700">Competências não avaliadas</h4>
#                           <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
#                             Nenhuma avaliação de competência encontrada para este colaborador.
#                           </p>
#                         </div>
#                       )}
#                     </div>
#   );

# Wait, let's just find that block and replace `</div>\n  );` with `</div>\n  );\n  };`
target = '''                        </div>
                      )}
                    </div>
  );'''

replacement = '''                        </div>
                      )}
                    </div>
  );
  };'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("TARGET NOT FOUND")

# Also, we accidentally added `};\n` at the end of the file or somewhere else if our regex matched the wrong place.
# Let's see the end of the file.
# We will remove the extra `};` at the end of the file if it exists.
if content.endswith("  };\n"):
    content = content[:-4]

with open("src/components/GestaoPessoasPage.tsx", "w") as f:
    f.write(content)
