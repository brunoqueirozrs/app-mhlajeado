import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-8 bg-red-50 text-red-900 min-h-[50vh] rounded-xl m-4 border border-red-200">
          <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Erro Inesperado no Componente
          </h1>
          <p className="text-sm font-semibold mb-2">{this.state.error && this.state.error.toString()}</p>
          <pre className="text-xs bg-red-100 p-4 rounded overflow-auto max-h-64">
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow">
            Recarregar Aplicativo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
