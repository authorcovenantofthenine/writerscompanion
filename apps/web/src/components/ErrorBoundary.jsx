import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

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

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-destructive/50 bg-destructive/5 shadow-lg shadow-destructive/10">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl font-cinzel text-destructive">A Magical Disturbance</CardTitle>
              <CardDescription className="text-base mt-2">
                The grimoire encountered an unexpected error while weaving this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pt-4">
              <div className="w-full bg-background/50 p-4 rounded-md border border-destructive/20 overflow-auto max-h-32 text-xs font-mono text-muted-foreground">
                {this.state.error?.toString() || 'Unknown error occurred.'}
              </div>
              <Button onClick={this.handleReset} variant="outline" className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
                <RefreshCw className="mr-2 h-4 w-4" />
                Restore Weave
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;