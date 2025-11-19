"use client";

import { useState, useRef } from "react";
import { Camera, TrendingUp, TrendingDown, Loader2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Analysis = {
  action: "COMPRAR" | "VENDER";
  confidence: number;
  reasoning: string;
  indicators: string[];
};

export default function BinaryOptionsAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setError(null);
        setSuccess("Imagem carregada com sucesso! Clique em 'Analisar Gráfico' para continuar.");
        setTimeout(() => setSuccess(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeChart = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/analyze-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        throw new Error("Erro ao analisar o gráfico");
      }

      const data = await response.json();
      setAnalysis(data);
      setSuccess("Análise concluída com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Erro ao analisar o gráfico. Por favor, tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            BinaryVision AI
          </h1>
          <p className="text-base sm:text-lg text-slate-300">
            Análise inteligente de gráficos de opções binárias com IA avançada
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 sm:mb-8 bg-green-900/30 border-green-600 text-green-200">
            <CheckCircle2 className="w-5 h-5" />
            <AlertDescription className="ml-2">{success}</AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 sm:mb-8 bg-red-900/30 border-red-600 text-red-200">
            <AlertCircle className="w-5 h-5" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl sm:text-2xl">Capturar Gráfico</CardTitle>
            <CardDescription className="text-slate-400">
              Tire uma foto ou faça upload de um gráfico de opções binárias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!image ? (
              <div className="flex flex-col gap-3 sm:gap-4">
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-32 sm:h-40 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex flex-col gap-2 sm:gap-3 text-base sm:text-lg"
                >
                  <Camera className="w-10 h-10 sm:w-12 sm:h-12" />
                  Tirar Foto
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-20 sm:h-24 border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-white flex flex-col gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
                  Upload de Imagem
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-slate-900">
                  <img
                    src={image}
                    alt="Gráfico capturado"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                  <Button
                    onClick={clearImage}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 sm:top-4 sm:right-4"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={analyzeChart}
                  disabled={loading}
                  className="w-full h-12 sm:h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base sm:text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2" />
                      Analisando...
                    </>
                  ) : (
                    "Analisar Gráfico"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Result */}
        {analysis && (
          <Card
            className={`border-2 ${
              analysis.action === "COMPRAR"
                ? "bg-green-900/20 border-green-600"
                : "bg-red-900/20 border-red-600"
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-2xl sm:text-3xl text-white flex items-center gap-3">
                  {analysis.action === "COMPRAR" ? (
                    <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                  ) : (
                    <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
                  )}
                  {analysis.action}
                </CardTitle>
                <div className="text-right">
                  <div className="text-xs sm:text-sm text-slate-400">Confiança</div>
                  <div className={`text-2xl sm:text-3xl font-bold ${
                    analysis.action === "COMPRAR" ? "text-green-400" : "text-red-400"
                  }`}>
                    {analysis.confidence}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  Análise Detalhada
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {analysis.reasoning}
                </p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
                  Indicadores Identificados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analysis.indicators.map((indicator, index) => (
                    <div
                      key={index}
                      className="bg-slate-800/50 rounded-lg p-3 text-sm sm:text-base text-slate-200 border border-slate-700"
                    >
                      • {indicator}
                    </div>
                  ))}
                </div>
              </div>
              <Alert className="bg-yellow-900/20 border-yellow-700">
                <AlertDescription className="text-yellow-200 text-xs sm:text-sm">
                  ⚠️ Esta análise é baseada em IA e não constitui aconselhamento financeiro.
                  Sempre faça sua própria pesquisa antes de investir.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
