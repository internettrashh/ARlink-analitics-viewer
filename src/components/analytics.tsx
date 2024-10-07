import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Copy, Terminal } from "lucide-react"
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectButton,  useConnection } from "@arweave-wallet-kit/react"

import { spawnProcess, runLua } from "@/lib/ao-vars"
import { AnalyticsContract } from "@/lib/contract"

export function Analytics() {
  const { connected } = useConnection()
  
  //const Address = useActiveAddress()

  const [processId, setProcessId] = useState('')
  const [showDocs, setShowDocs] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (!connected) {
      return;
    }
    generateProcessId()
  }, [connected])

  const generateProcessId = async () => {
    setFetching(true)
    spawnProcess("ARlink-Analytics").then(async (newId) => {
      let success = false;
      let attempts = 0;
      const maxAttempts = 20;

      while (!success && attempts < maxAttempts) {
        attempts++;
        try {
          const response = await runLua(AnalyticsContract, newId);
          if (response) {  // Assuming a truthy response indicates success
            success = true;
            console.log(`Success on attempt ${attempts}: analytics id ${newId}`);
            console.log('Response:', response);
          } else {
            console.log(`No response on attempt ${attempts}: analytics id ${newId}`);
          }
        } catch (error) {
          console.error(`Error on attempt ${attempts}: analytics id ${newId}`, error);
        }
      }

      if (success) {
        console.log(`Successfully ran Lua script after ${attempts} attempts`);
      } else {
        console.warn(`Failed to get a response after ${maxAttempts} attempts`);
      }

      setProcessId(newId)
      setFetching(false)
    });
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  useEffect(() => {
    if (fetching) {
      // Show documentation after a delay
      setTimeout(() => setShowDocs(true), 1000)
    }
  }, [fetching])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-2 text-center">Analytics</h1>
      <p className="text-zinc-400 text-center mb-8">by ARlink<sup className="text-xs">™</sup></p>
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="md:col-span-1 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Connect Wallet</CardTitle>
            <CardDescription className="text-zinc-400">Connect your wallet to get started</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {!connected ? (
              <ConnectButton />
            ) : (
              <AnimatePresence>
                {processId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="mb-2 text-zinc-400">Your Process ID:</p>
                    <div className="flex items-center justify-center space-x-2">
                      <code className="bg-zinc-800 p-2 rounded text-white">{processId}</code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(processId)}
                        className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
        
        <AnimatePresence>
          {showDocs && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="md:col-span-1"
            >
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Integration Guide</CardTitle>
                  <CardDescription className="text-zinc-400">Follow these steps to integrate analytics in your project</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="npm" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                      <TabsTrigger value="npm" className="data-[state=active]:bg-zinc-700">npm</TabsTrigger>
                      <TabsTrigger value="yarn" className="data-[state=active]:bg-zinc-700">yarn</TabsTrigger>
                    </TabsList>
                    <TabsContent value="npm">
                      <div className="bg-zinc-800 p-4 rounded-md flex items-center space-x-2">
                        <Terminal className="h-5 w-5 text-zinc-400" />
                        <code className="text-white">npm install arlink-analytics</code>
                      </div>
                    </TabsContent>
                    <TabsContent value="yarn">
                      <div className="bg-zinc-800 p-4 rounded-md flex items-center space-x-2">
                        <Terminal className="h-5 w-5 text-zinc-400" />
                        <code className="text-white">yarn add arlink-analytics</code>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Wrap your app</h3>
                    <p className="text-sm text-zinc-400">
                      Import and use the AnalyticsWrapper in your main App component:
                    </p>
                    <pre className="bg-zinc-800 p-4 rounded-md overflow-x-auto">
                      <code className="text-sm text-white">
{`import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnalyticsWrapper } from 'arlink-analytics';

function App() {
  return (
    <Router>
      <AnalyticsWrapper processId="${processId}">
        <Routes>
          {/* Your routes here */}
        </Routes>
      </AnalyticsWrapper>
    </Router>
  );
}

export default App;`}
                      </code>
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-white text-black hover:bg-zinc-200">View Analytics Dashboard</Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}