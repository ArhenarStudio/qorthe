import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0806] p-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-[#8b6f47]" />
            <h1 className="text-3xl font-bold text-white">Algo salió mal</h1>
            <p className="text-[#b8a99a]">
              Lo sentimos, ocurrió un error inesperado. Por favor, recarga la
              página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-[#8b6f47] px-6 py-3 text-white transition-colors hover:bg-[#a68760]"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
