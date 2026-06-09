'use client';

import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProperties {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProperties, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProperties) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-utpl-text">Algo salió mal</h2>
          <p className="mb-6 text-sm text-utpl-muted">
            {this.state.error?.message ?? 'Error desconocido'}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-xl bg-utpl-blue px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-utpl-blue-hover"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
