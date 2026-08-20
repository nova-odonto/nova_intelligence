import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const FIELDS_DESCRIPTION = `
Campos disponíveis (boolean, retorne true/false/null):
- smoker: fuma, tabagismo, cigarro
- alcoholic: bebe, álcool, bebida alcoólica
- brushDaily: escova dentes todo dia
- flossDaily: usa fio dental todo dia
- physicalActivity: pratica exercício, atividade física
- sleepProblems: problemas com sono, insônia
- allergicToMedication: alergia a remédio/medicamento
- hadSurgery: fez cirurgia, operação
- pregnant: gestante, grávida
- hypertension: hipertensão, pressão alta
- cardiopathy: cardiopatia, problema no coração
- peripheralArterial: doença arterial periférica
- familyCancer: histórico de câncer na família
- familyDiabetes: diabetes na família
- familyHypertension: pressão alta na família
- familyOther: outras doenças na família

Campos texto (string ou null):
- allergicDetail: qual o medicamento/alergia
- surgeryDetail: qual cirurgia
- familyOtherDetail: quais outras doenças
- medications: medicamentos em uso atualmente
- notes: observações gerais
`

export async function POST(req: NextRequest) {
  const { transcript } = await req.json()

  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'Transcript vazio' }, { status: 400 })
  }

  const prompt = `Você é um assistente de anamnese odontológica. Analise o transcript abaixo e extraia as informações do paciente.

TRANSCRIPT:
"${transcript}"

${FIELDS_DESCRIPTION}

REGRAS:
- Se o paciente NEGA algo (ex: "não fuma", "nunca bebeu"), retorne false
- Se não mencionado, retorne null (não inclua no JSON)
- Para campos texto, extraia exatamente o que foi dito
- Retorne APENAS JSON válido, sem markdown, sem explicações

Exemplo de saída:
{"smoker": false, "hypertension": true, "medications": "losartana 50mg"}`

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      temperature: 0.1,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Groq error:', err)
    return NextResponse.json({ error: 'Falha ao processar com IA' }, { status: 500 })
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content ?? ''

  try {
    const parsed = JSON.parse(text)
    return NextResponse.json({ fields: parsed })
  } catch {
    // Tenta extrair JSON do texto se vier com lixo
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      return NextResponse.json({ fields: JSON.parse(match[0]) })
    }
    return NextResponse.json({ error: 'Resposta inválida da IA', raw: text }, { status: 500 })
  }
}