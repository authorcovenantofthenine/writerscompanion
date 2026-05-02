import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Payment Cancelled - Quil Forge</title>
      </Helmet>

      <Header />

      <main className="flex-grow flex items-center justify-center p-4 pt-32 pb-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-muted/20 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-border bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
            <CardHeader className="text-center pb-2 pt-10">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground mb-2">Payment Cancelled</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Your checkout process was interrupted. No charges were made to your account.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center pt-4 pb-6">
              <p className="text-sm text-muted-foreground/80">
                If you experienced technical difficulties, please try again or contact our support guild.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pb-10 px-8">
              <Button 
                className="w-full h-12 text-base" 
                onClick={() => navigate('/pricing')}
              >
                Return to Pricing
              </Button>
              <Button 
                variant="ghost"
                className="w-full h-12 text-base text-muted-foreground hover:text-foreground" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CancelPage;