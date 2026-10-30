import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center dark:bg-neutral-950">
          <div className="max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              عذراً، حدث خطأ غير متوقع
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Something went wrong. Please refresh the page to try again.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-neutral-100 p-3 text-start text-xs text-red-600 dark:bg-neutral-800 dark:text-red-400">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 w-full rounded-none bg-brand py-3 shadow-none text-sm font-semibold text-white shadow-md transition hover:bg-brand-dark"
            >
              إعادة تحميل الصفحة / Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

