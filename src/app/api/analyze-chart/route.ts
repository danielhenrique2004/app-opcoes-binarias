import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não fornecida" },
        { status: 400 }
      );
    }

    // Análise do gráfico usando OpenAI Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em análise técnica de opções binárias. Analise o gráfico fornecido e forneça:
1. Uma recomendação clara: COMPRAR ou VENDER
2. Um nível de confiança (0-100%)
3. Uma explicação detalhada da análise
4. Lista de indicadores técnicos identificados

Responda SEMPRE em formato JSON válido com esta estrutura exata:
{
  "action": "COMPRAR" ou "VENDER",
  "confidence": número entre 0 e 100,
  "reasoning": "explicação detalhada em português",
  "indicators": ["indicador1", "indicador2", ...]
}

Considere:
- Tendências de preço (alta, baixa, lateral)
- Padrões de candlestick
- Suportes e resistências
- Volume (se visível)
- Médias móveis (se visíveis)
- RSI, MACD e outros indicadores técnicos visíveis
- Momentum do mercado

Seja preciso e objetivo na análise.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analise este gráfico de opções binárias e forneça uma recomendação de COMPRAR ou VENDER com base na análise técnica.",
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse da resposta JSON
    const analysis = JSON.parse(content);

    // Validação da resposta
    if (!analysis.action || !analysis.confidence || !analysis.reasoning || !analysis.indicators) {
      throw new Error("Formato de resposta inválido");
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Erro na análise:", error);
    return NextResponse.json(
      { error: "Erro ao processar a análise do gráfico" },
      { status: 500 }
    );
  }
}
