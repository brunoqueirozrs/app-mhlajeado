import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=6c9aaaf1"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=6c9aaaf1"; const useState = __vite__cjsImport1_react["useState"]; const useEffect = __vite__cjsImport1_react["useEffect"];
import { db } from "/src/lib/firebase.ts";
import { collection, onSnapshot, query, orderBy, where } from "/node_modules/.vite/deps/firebase_firestore.js?v=6c9aaaf1";
import { ClipboardList, Search, Filter, Calendar, User, FileText, ChevronDown, ChevronUp } from "/node_modules/.vite/deps/lucide-react.js?v=6c9aaaf1";
export default function AdminTestResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterVendor, setFilterVendor] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  useEffect(() => {
    setLoading(true);
    let constraints = [];
    if (filterStartDate) {
      constraints.push(where("date", ">=", (/* @__PURE__ */ new Date(`${filterStartDate}T00:00:00`)).toISOString()));
    }
    if (filterEndDate) {
      constraints.push(where("date", "<=", (/* @__PURE__ */ new Date(`${filterEndDate}T23:59:59.999`)).toISOString()));
    }
    constraints.push(orderBy("date", "desc"));
    const q = query(collection(db, "test_results"), ...constraints);
    const unsub = onSnapshot(q, (snapshot) => {
      setResults(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar testes:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [filterStartDate, filterEndDate]);
  const filteredResults = results.filter((res) => {
    const matchVendor = res.vendorName.toLowerCase().includes(filterVendor.toLowerCase());
    const matchType = filterType ? res.type === filterType : true;
    return matchVendor && matchType;
  });
  const getTypeLabel = (type) => {
    switch (type) {
      case "disc":
        return "Perfil DISC";
      case "raiox":
        return "Raio-X (IA)";
      case "competencias":
        return "Avaliação de Competências";
      case "perfil_comercial":
        return "Perfil Comercial";
      case "roleplay":
        return "Roleplay (IA)";
      default:
        return type;
    }
  };
  const getTypeColor = (type) => {
    switch (type) {
      case "disc":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "raiox":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "competencias":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "perfil_comercial":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "roleplay":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "p-6 max-w-7xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 mb-8", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "p-3 bg-indigo-50 text-indigo-600 rounded-xl", children: /* @__PURE__ */ jsxDEV(ClipboardList, { className: "w-6 h-6" }, void 0, false, {
        fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
        lineNumber: 82,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
        lineNumber: 81,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-bold text-slate-800", children: "Histórico de Testes e Avaliações" }, void 0, false, {
          fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
          lineNumber: 85,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-slate-500", children: "Acompanhamento centralizado de desempenho e diagnósticos da equipe." }, void 0, false, {
          fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
          lineNumber: 86,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
        lineNumber: 84,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
      lineNumber: 80,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1 relative", children: [
        /* @__PURE__ */ jsxDEV(Search, { className: "w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }, void 0, false, {
          fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
          lineNumber: 92,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            type: "text",
            placeholder: "Buscar por nome do vendedor...",
            value: filterVendor,
            onChange: (e) => setFilterVendor(e.target.value),
            className: "w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
            lineNumber: 93,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
        lineNumber: 91,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "w-full md:w-48 relative", children: [
        /* @__PURE__ */ jsxDEV(Filter, { className: "w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }, void 0, false, {
          fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
          lineNumber: 102,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(
          "select",
          {
            value: filterType,
            onChange: (e) => setFilterType(e.target.value),
            className: "w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none",
            children: [
              /* @__PURE__ */ jsxDEV("option", { value: "", children: "Todos os tipos" }, void 0, false, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 108,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "disc", children: "Perfil DISC" }, void 0, false, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 109,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "raiox", children: "Raio-X (IA)" }, void 0, false, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 110,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "competencias", children: "Avaliação de Competências" }, void 0, false, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 111,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "perfil_comercial", children: "Perfil Comercial" }, void 0, false, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 112,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "roleplay", children: "Roleplay (IA)" }, void 0, false, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 113,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
            lineNumber: 103,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
        lineNumber: 101,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 w-full md:w-auto", children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            type: "date",
            value: filterStartDate,
            onChange: (e) => setFilterStartDate(e.target.value),
            className: "px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600",
            title: "Data Inicial"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
            lineNumber: 117,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("span", { className: "text-slate-400 text-sm", children: "até" }, void 0, false, {
          fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
          lineNumber: 124,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            type: "date",
            value: filterEndDate,
            onChange: (e) => setFilterEndDate(e.target.value),
            className: "px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600",
            title: "Data Final"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
            lineNumber: 125,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
        lineNumber: 116,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
      lineNumber: 90,
      columnNumber: 7
    }, this),
    loading ? /* @__PURE__ */ jsxDEV("div", { className: "flex justify-center p-12", children: /* @__PURE__ */ jsxDEV("div", { className: "w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" }, void 0, false, {
      fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
      lineNumber: 137,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
      lineNumber: 136,
      columnNumber: 9
    }, this) : filteredResults.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm", children: [
      /* @__PURE__ */ jsxDEV(FileText, { className: "w-12 h-12 text-slate-300 mx-auto mb-4" }, void 0, false, {
        fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
        lineNumber: 141,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold text-slate-700", children: "Nenhum resultado encontrado" }, void 0, false, {
        fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
        lineNumber: 142,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-slate-500", children: "Ajuste os filtros ou aguarde a realização de novos testes." }, void 0, false, {
        fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
        lineNumber: 143,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
      lineNumber: 140,
      columnNumber: 9
    }, this) : /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: filteredResults.map((res) => /* @__PURE__ */ jsxDEV("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md", children: [
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: "p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer",
          onClick: () => setExpandedId(expandedId === res.id ? null : res.id),
          children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxDEV(User, { className: "w-5 h-5 text-slate-500" }, void 0, false, {
                  fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                  lineNumber: 156,
                  columnNumber: 23
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                  lineNumber: 155,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-bold text-slate-800", children: res.vendorName }, void 0, false, {
                    fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                    lineNumber: 159,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-slate-500", children: "Vendedor" }, void 0, false, {
                    fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                    lineNumber: 160,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                  lineNumber: 158,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 154,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: /* @__PURE__ */ jsxDEV("span", { className: `inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getTypeColor(res.type)}`, children: getTypeLabel(res.type) }, void 0, false, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 165,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 164,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 text-sm text-slate-600", children: [
                /* @__PURE__ */ jsxDEV(Calendar, { className: "w-4 h-4" }, void 0, false, {
                  fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                  lineNumber: 171,
                  columnNumber: 21
                }, this),
                new Date(res.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
              ] }, void 0, true, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 170,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "text-sm font-medium text-slate-700 line-clamp-1", children: res.summary }, void 0, false, {
                fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
                lineNumber: 175,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
              lineNumber: 153,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-slate-400 hidden md:block", children: expandedId === res.id ? /* @__PURE__ */ jsxDEV(ChevronUp, { className: "w-5 h-5" }, void 0, false, {
              fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
              lineNumber: 181,
              columnNumber: 44
            }, this) : /* @__PURE__ */ jsxDEV(ChevronDown, { className: "w-5 h-5" }, void 0, false, {
              fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
              lineNumber: 181,
              columnNumber: 80
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
              lineNumber: 180,
              columnNumber: 17
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
          lineNumber: 149,
          columnNumber: 15
        },
        this
      ),
      expandedId === res.id && /* @__PURE__ */ jsxDEV("div", { className: "p-5 border-t border-slate-100 bg-slate-50", children: [
        /* @__PURE__ */ jsxDEV("h4", { className: "text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider", children: "Dados Brutos / Detalhes" }, void 0, false, {
          fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
          lineNumber: 187,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("pre", { className: "text-xs font-mono text-slate-600 bg-slate-800 p-4 rounded-xl overflow-x-auto", children: /* @__PURE__ */ jsxDEV("code", { className: "text-sky-300", children: JSON.stringify(res.details, null, 2) }, void 0, false, {
          fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
          lineNumber: 189,
          columnNumber: 21
        }, this) }, void 0, false, {
          fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
          lineNumber: 188,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
        lineNumber: 186,
        columnNumber: 17
      }, this)
    ] }, res.id, true, {
      fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
      lineNumber: 148,
      columnNumber: 13
    }, this)) }, void 0, false, {
      fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
      lineNumber: 146,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/app/applet/src/components/AdminTestResultsPage.tsx",
    lineNumber: 79,
    columnNumber: 5
  }, this);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFkbWluVGVzdFJlc3VsdHNQYWdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgZGIgfSBmcm9tIFwiLi4vbGliL2ZpcmViYXNlXCI7XG5pbXBvcnQgeyBjb2xsZWN0aW9uLCBvblNuYXBzaG90LCBxdWVyeSwgb3JkZXJCeSwgd2hlcmUsIFF1ZXJ5Q29uc3RyYWludCB9IGZyb20gXCJmaXJlYmFzZS9maXJlc3RvcmVcIjtcbmltcG9ydCB7IENsaXBib2FyZExpc3QsIFNlYXJjaCwgRmlsdGVyLCBDYWxlbmRhciwgVXNlciwgRmlsZVRleHQsIENoZXZyb25Eb3duLCBDaGV2cm9uVXAgfSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5cbmludGVyZmFjZSBUZXN0UmVzdWx0IHtcbiAgaWQ6IHN0cmluZztcbiAgdmVuZG9ySWQ6IHN0cmluZztcbiAgdmVuZG9yTmFtZTogc3RyaW5nO1xuICB0eXBlOiBzdHJpbmc7XG4gIGRhdGU6IHN0cmluZztcbiAgc3VtbWFyeTogc3RyaW5nO1xuICBkZXRhaWxzOiBhbnk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFkbWluVGVzdFJlc3VsdHNQYWdlKCkge1xuICBjb25zdCBbcmVzdWx0cywgc2V0UmVzdWx0c10gPSB1c2VTdGF0ZTxUZXN0UmVzdWx0W10+KFtdKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtmaWx0ZXJWZW5kb3IsIHNldEZpbHRlclZlbmRvcl0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2ZpbHRlclR5cGUsIHNldEZpbHRlclR5cGVdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtmaWx0ZXJTdGFydERhdGUsIHNldEZpbHRlclN0YXJ0RGF0ZV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2ZpbHRlckVuZERhdGUsIHNldEZpbHRlckVuZERhdGVdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtleHBhbmRlZElkLCBzZXRFeHBhbmRlZElkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICBsZXQgY29uc3RyYWludHM6IFF1ZXJ5Q29uc3RyYWludFtdID0gW107XG5cbiAgICBpZiAoZmlsdGVyU3RhcnREYXRlKSB7XG4gICAgICBjb25zdHJhaW50cy5wdXNoKHdoZXJlKFwiZGF0ZVwiLCBcIj49XCIsIG5ldyBEYXRlKGAke2ZpbHRlclN0YXJ0RGF0ZX1UMDA6MDA6MDBgKS50b0lTT1N0cmluZygpKSk7XG4gICAgfVxuICAgIGlmIChmaWx0ZXJFbmREYXRlKSB7XG4gICAgICBjb25zdHJhaW50cy5wdXNoKHdoZXJlKFwiZGF0ZVwiLCBcIjw9XCIsIG5ldyBEYXRlKGAke2ZpbHRlckVuZERhdGV9VDIzOjU5OjU5Ljk5OWApLnRvSVNPU3RyaW5nKCkpKTtcbiAgICB9XG5cbiAgICBjb25zdHJhaW50cy5wdXNoKG9yZGVyQnkoXCJkYXRlXCIsIFwiZGVzY1wiKSk7XG5cbiAgICBjb25zdCBxID0gcXVlcnkoY29sbGVjdGlvbihkYiwgXCJ0ZXN0X3Jlc3VsdHNcIiksIC4uLmNvbnN0cmFpbnRzKTtcbiAgICBjb25zdCB1bnN1YiA9IG9uU25hcHNob3QocSwgKHNuYXBzaG90KSA9PiB7XG4gICAgICBzZXRSZXN1bHRzKHNuYXBzaG90LmRvY3MubWFwKGRvYyA9PiAoeyBpZDogZG9jLmlkLCAuLi5kb2MuZGF0YSgpIH0gYXMgVGVzdFJlc3VsdCkpKTtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm8gYW8gYnVzY2FyIHRlc3RlczpcIiwgZXJyb3IpO1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuICgpID0+IHVuc3ViKCk7XG4gIH0sIFtmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGVdKTtcblxuICBjb25zdCBmaWx0ZXJlZFJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihyZXMgPT4ge1xuICAgIGNvbnN0IG1hdGNoVmVuZG9yID0gcmVzLnZlbmRvck5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJWZW5kb3IudG9Mb3dlckNhc2UoKSk7XG4gICAgY29uc3QgbWF0Y2hUeXBlID0gZmlsdGVyVHlwZSA/IHJlcy50eXBlID09PSBmaWx0ZXJUeXBlIDogdHJ1ZTtcbiAgICByZXR1cm4gbWF0Y2hWZW5kb3IgJiYgbWF0Y2hUeXBlO1xuICB9KTtcblxuICBjb25zdCBnZXRUeXBlTGFiZWwgPSAodHlwZTogc3RyaW5nKSA9PiB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdkaXNjJzogcmV0dXJuICdQZXJmaWwgRElTQyc7XG4gICAgICBjYXNlICdyYWlveCc6IHJldHVybiAnUmFpby1YIChJQSknO1xuICAgICAgY2FzZSAnY29tcGV0ZW5jaWFzJzogcmV0dXJuICdBdmFsaWHDp8OjbyBkZSBDb21wZXTDqm5jaWFzJztcbiAgICAgIGNhc2UgJ3BlcmZpbF9jb21lcmNpYWwnOiByZXR1cm4gJ1BlcmZpbCBDb21lcmNpYWwnO1xuICAgICAgY2FzZSAncm9sZXBsYXknOiByZXR1cm4gJ1JvbGVwbGF5IChJQSknO1xuICAgICAgZGVmYXVsdDogcmV0dXJuIHR5cGU7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGdldFR5cGVDb2xvciA9ICh0eXBlOiBzdHJpbmcpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ2Rpc2MnOiByZXR1cm4gJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS03MDAgYm9yZGVyLWJsdWUtMjAwJztcbiAgICAgIGNhc2UgJ3JhaW94JzogcmV0dXJuICdiZy1wdXJwbGUtMTAwIHRleHQtcHVycGxlLTcwMCBib3JkZXItcHVycGxlLTIwMCc7XG4gICAgICBjYXNlICdjb21wZXRlbmNpYXMnOiByZXR1cm4gJ2JnLWVtZXJhbGQtMTAwIHRleHQtZW1lcmFsZC03MDAgYm9yZGVyLWVtZXJhbGQtMjAwJztcbiAgICAgIGNhc2UgJ3BlcmZpbF9jb21lcmNpYWwnOiByZXR1cm4gJ2JnLWFtYmVyLTEwMCB0ZXh0LWFtYmVyLTcwMCBib3JkZXItYW1iZXItMjAwJztcbiAgICAgIGNhc2UgJ3JvbGVwbGF5JzogcmV0dXJuICdiZy1yb3NlLTEwMCB0ZXh0LXJvc2UtNzAwIGJvcmRlci1yb3NlLTIwMCc7XG4gICAgICBkZWZhdWx0OiByZXR1cm4gJ2JnLXNsYXRlLTEwMCB0ZXh0LXNsYXRlLTcwMCBib3JkZXItc2xhdGUtMjAwJztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNiBtYXgtdy03eGwgbXgtYXV0byBzcGFjZS15LTZcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgbWItOFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMyBiZy1pbmRpZ28tNTAgdGV4dC1pbmRpZ28tNjAwIHJvdW5kZWQteGxcIj5cbiAgICAgICAgICA8Q2xpcGJvYXJkTGlzdCBjbGFzc05hbWU9XCJ3LTYgaC02XCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgxIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMFwiPkhpc3TDs3JpY28gZGUgVGVzdGVzIGUgQXZhbGlhw6fDtWVzPC9oMT5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTUwMFwiPkFjb21wYW5oYW1lbnRvIGNlbnRyYWxpemFkbyBkZSBkZXNlbXBlbmhvIGUgZGlhZ27Ds3N0aWNvcyBkYSBlcXVpcGUuPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgbWQ6ZmxleC1yb3cgZ2FwLTQgYmctd2hpdGUgcC00IHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIHNoYWRvdy1zbVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMSByZWxhdGl2ZVwiPlxuICAgICAgICAgIDxTZWFyY2ggY2xhc3NOYW1lPVwidy01IGgtNSBhYnNvbHV0ZSBsZWZ0LTMgdG9wLTEvMiAtdHJhbnNsYXRlLXktMS8yIHRleHQtc2xhdGUtNDAwXCIgLz5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQnVzY2FyIHBvciBub21lIGRvIHZlbmRlZG9yLi4uXCJcbiAgICAgICAgICAgIHZhbHVlPXtmaWx0ZXJWZW5kb3J9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldEZpbHRlclZlbmRvcihlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcGwtMTAgcHItNCBweS0yIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIHJvdW5kZWQteGwgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWluZGlnby01MDBcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBtZDp3LTQ4IHJlbGF0aXZlXCI+XG4gICAgICAgICAgPEZpbHRlciBjbGFzc05hbWU9XCJ3LTUgaC01IGFic29sdXRlIGxlZnQtMyB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgdGV4dC1zbGF0ZS00MDBcIiAvPlxuICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgIHZhbHVlPXtmaWx0ZXJUeXBlfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRGaWx0ZXJUeXBlKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwbC0xMCBwci00IHB5LTIgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgcm91bmRlZC14bCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctaW5kaWdvLTUwMCBhcHBlYXJhbmNlLW5vbmVcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Ub2RvcyBvcyB0aXBvczwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImRpc2NcIj5QZXJmaWwgRElTQzwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInJhaW94XCI+UmFpby1YIChJQSk8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJjb21wZXRlbmNpYXNcIj5BdmFsaWHDp8OjbyBkZSBDb21wZXTDqm5jaWFzPC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwicGVyZmlsX2NvbWVyY2lhbFwiPlBlcmZpbCBDb21lcmNpYWw8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJyb2xlcGxheVwiPlJvbGVwbGF5IChJQSk8L29wdGlvbj5cbiAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdy1mdWxsIG1kOnctYXV0b1wiPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cImRhdGVcIlxuICAgICAgICAgICAgdmFsdWU9e2ZpbHRlclN0YXJ0RGF0ZX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0RmlsdGVyU3RhcnREYXRlKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTQgcHktMiBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCByb3VuZGVkLXhsIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1pbmRpZ28tNTAwIHRleHQtc20gdGV4dC1zbGF0ZS02MDBcIlxuICAgICAgICAgICAgdGl0bGU9XCJEYXRhIEluaWNpYWxcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbGF0ZS00MDAgdGV4dC1zbVwiPmF0w6k8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwiZGF0ZVwiXG4gICAgICAgICAgICB2YWx1ZT17ZmlsdGVyRW5kRGF0ZX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0RmlsdGVyRW5kRGF0ZShlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJweC00IHB5LTIgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgcm91bmRlZC14bCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctaW5kaWdvLTUwMCB0ZXh0LXNtIHRleHQtc2xhdGUtNjAwXCJcbiAgICAgICAgICAgIHRpdGxlPVwiRGF0YSBGaW5hbFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAge2xvYWRpbmcgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWNlbnRlciBwLTEyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTggaC04IGJvcmRlci00IGJvcmRlci1pbmRpZ28tNjAwIGJvcmRlci10LXRyYW5zcGFyZW50IHJvdW5kZWQtZnVsbCBhbmltYXRlLXNwaW5cIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogZmlsdGVyZWRSZXN1bHRzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBwLTEyIGJnLXdoaXRlIHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIHNoYWRvdy1zbVwiPlxuICAgICAgICAgIDxGaWxlVGV4dCBjbGFzc05hbWU9XCJ3LTEyIGgtMTIgdGV4dC1zbGF0ZS0zMDAgbXgtYXV0byBtYi00XCIgLz5cbiAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDBcIj5OZW5odW0gcmVzdWx0YWRvIGVuY29udHJhZG88L2gzPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc2xhdGUtNTAwXCI+QWp1c3RlIG9zIGZpbHRyb3Mgb3UgYWd1YXJkZSBhIHJlYWxpemHDp8OjbyBkZSBub3ZvcyB0ZXN0ZXMuPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAge2ZpbHRlcmVkUmVzdWx0cy5tYXAocmVzID0+IChcbiAgICAgICAgICAgIDxkaXYga2V5PXtyZXMuaWR9IGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIHNoYWRvdy1zbSBvdmVyZmxvdy1oaWRkZW4gdHJhbnNpdGlvbi1hbGwgaG92ZXI6c2hhZG93LW1kXCI+XG4gICAgICAgICAgICAgIDxkaXYgXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicC01IGZsZXggZmxleC1jb2wgbWQ6ZmxleC1yb3cgbWQ6aXRlbXMtY2VudGVyIGdhcC00IGN1cnNvci1wb2ludGVyXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRFeHBhbmRlZElkKGV4cGFuZGVkSWQgPT09IHJlcy5pZCA/IG51bGwgOiByZXMuaWQpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4LTEgZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtNCBnYXAtNCBpdGVtcy1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTEwIGgtMTAgcm91bmRlZC1mdWxsIGJnLXNsYXRlLTEwMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaHJpbmstMFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxVc2VyIGNsYXNzTmFtZT1cInctNSBoLTUgdGV4dC1zbGF0ZS01MDBcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMFwiPntyZXMudmVuZG9yTmFtZX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXNsYXRlLTUwMFwiPlZlbmRlZG9yPC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2BpbmxpbmUtZmxleCBweC0zIHB5LTEgdGV4dC14cyBmb250LWJvbGQgcm91bmRlZC1mdWxsIGJvcmRlciAke2dldFR5cGVDb2xvcihyZXMudHlwZSl9YH0+XG4gICAgICAgICAgICAgICAgICAgICAge2dldFR5cGVMYWJlbChyZXMudHlwZSl9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtc20gdGV4dC1zbGF0ZS02MDBcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhbGVuZGFyIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICB7bmV3IERhdGUocmVzLmRhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygncHQtQlInLCB7IGRheTogJzItZGlnaXQnLCBtb250aDogJzItZGlnaXQnLCB5ZWFyOiAnbnVtZXJpYycsIGhvdXI6ICcyLWRpZ2l0JywgbWludXRlOiAnMi1kaWdpdCcgfSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtc2xhdGUtNzAwIGxpbmUtY2xhbXAtMVwiPlxuICAgICAgICAgICAgICAgICAgICB7cmVzLnN1bW1hcnl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtc2xhdGUtNDAwIGhpZGRlbiBtZDpibG9ja1wiPlxuICAgICAgICAgICAgICAgICAge2V4cGFuZGVkSWQgPT09IHJlcy5pZCA/IDxDaGV2cm9uVXAgY2xhc3NOYW1lPVwidy01IGgtNVwiIC8+IDogPENoZXZyb25Eb3duIGNsYXNzTmFtZT1cInctNSBoLTVcIiAvPn1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAge2V4cGFuZGVkSWQgPT09IHJlcy5pZCAmJiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTUgYm9yZGVyLXQgYm9yZGVyLXNsYXRlLTEwMCBiZy1zbGF0ZS01MFwiPlxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIG1iLTMgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+RGFkb3MgQnJ1dG9zIC8gRGV0YWxoZXM8L2g0PlxuICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtbW9ubyB0ZXh0LXNsYXRlLTYwMCBiZy1zbGF0ZS04MDAgcC00IHJvdW5kZWQteGwgb3ZlcmZsb3cteC1hdXRvXCI+XG4gICAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cInRleHQtc2t5LTMwMFwiPntKU09OLnN0cmluZ2lmeShyZXMuZGV0YWlscywgbnVsbCwgMil9PC9jb2RlPlxuICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApO1xufVxuIl0sIm1hcHBpbmdzIjoiQUFpRlU7QUFqRlYsU0FBZ0IsVUFBVSxpQkFBaUI7QUFDM0MsU0FBUyxVQUFVO0FBQ25CLFNBQVMsWUFBWSxZQUFZLE9BQU8sU0FBUyxhQUE4QjtBQUMvRSxTQUFTLGVBQWUsUUFBUSxRQUFRLFVBQVUsTUFBTSxVQUFVLGFBQWEsaUJBQWlCO0FBWWhHLHdCQUF3Qix1QkFBdUI7QUFDN0MsUUFBTSxDQUFDLFNBQVMsVUFBVSxJQUFJLFNBQXVCLENBQUMsQ0FBQztBQUN2RCxRQUFNLENBQUMsU0FBUyxVQUFVLElBQUksU0FBUyxJQUFJO0FBQzNDLFFBQU0sQ0FBQyxjQUFjLGVBQWUsSUFBSSxTQUFTLEVBQUU7QUFDbkQsUUFBTSxDQUFDLFlBQVksYUFBYSxJQUFJLFNBQVMsRUFBRTtBQUMvQyxRQUFNLENBQUMsaUJBQWlCLGtCQUFrQixJQUFJLFNBQVMsRUFBRTtBQUN6RCxRQUFNLENBQUMsZUFBZSxnQkFBZ0IsSUFBSSxTQUFTLEVBQUU7QUFDckQsUUFBTSxDQUFDLFlBQVksYUFBYSxJQUFJLFNBQXdCLElBQUk7QUFFaEUsWUFBVSxNQUFNO0FBQ2QsZUFBVyxJQUFJO0FBQ2Ys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