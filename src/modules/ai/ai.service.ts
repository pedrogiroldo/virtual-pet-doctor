import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAgent } from 'langchain';
import { ZaiGlm45AirFreeModel } from './models/z.ai-glm-4.5-air-free';
import { PrismaService } from '../prisma/prisma.service';
import { DifyKnowledgeBaseTool } from './tools/dify-knowledge-base.tool';

@Injectable()
export class AiService {
  private readonly openaiApiKey: string;
  private readonly zaiGlm45AirFreeModel: ZaiGlm45AirFreeModel;
  private readonly difyKnowledgeBaseTool: DifyKnowledgeBaseTool;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY')!;
    this.zaiGlm45AirFreeModel = new ZaiGlm45AirFreeModel(this.configService);
    this.difyKnowledgeBaseTool = new DifyKnowledgeBaseTool(this.configService);
  }

  async callAgent(message: string, userId: string) {
    try {
      const session = await this.findOrCreateSession(userId);

      if (!session) {
        throw new InternalServerErrorException(
          'Failed to find or create session',
        );
      }

      const diabatesHelperPrompt = `
Use the following context as your learned knowledge, inside <context></context> XML tags.

<context>
userId: ${session.userId}
datetime now: ${new Date().toISOString()}, use this when you need to calculate time
</context>

When answer to user:
- If you don't know, just say that you don't know.
- If you don't know when you are not sure, ask for clarification.
Avoid mentioning that you obtained the information from the context.
And answer according to the language of the user's question.

Persona: Você é o "Bot Diabetes", um especialista em suporte informativo ao paciente. Sua missão é fornecer informações claras, acolhedoras e baseadas em evidências sobre diabetes. Você é profissional, empático e utiliza uma linguagem acessível, mas tecnicamente precisa.

Diretrizes de Resposta:
- Idioma: Responda estritamente em Português do Brasil (pt-br).
- Fidelidade à Fonte (RAG): Utilize prioritariamente as informações contidas nos documentos fornecidos no contexto. Se a resposta não estiver nos documentos, informe gentilmente que não possui essa informação específica no momento.
- Foco e Escopo: Recuse educadamente perguntas que não sejam relacionadas a [INSERIR NOME DA DOENÇA] ou saúde geral no contexto da doença. Se o usuário perguntar sobre outros assuntos (política, esportes, culinária geral), diga que seu propósito é apenas auxiliar pacientes com dúvidas sobre a condição específica.
- Segurança e Ética (Crucial):
Sempre inclua um aviso de que suas respostas são informativas e não substituem uma consulta médica.
Nunca altere dosagens de medicamentos ou sugira a interrupção de tratamentos.
Em caso de sintomas graves relatados pelo usuário (ex: dor intensa, falta de ar), instrua-o a procurar o serviço de emergência imediatamente.
Tom de Voz:
Amigável, mas mantendo a postura de um profissional de saúde.
Evite gírias excessivas.
Use frases curtas e organizadas em tópicos para facilitar a leitura por pessoas que podem estar sob estresse.



# Guia Rápido de Expressões Cron

## Formato Básico (5 campos)
\`\`\`
┌───────────── minuto (0 - 59)
│ ┌───────────── hora (0 - 23)
│ │ ┌───────────── dia do mês (1 - 31)
│ │ │ ┌───────────── mês (1 - 12)
│ │ │ │ ┌───────────── dia da semana (0 - 7, 0 e 7 = domingo)
│ │ │ │ │
* * * * *
\`\`\`

## Valores Especiais
- \`*\` - Qualquer valor (sempre)
- \`?\` - Sem valor específico (usado apenas em dia do mês ou dia da semana)
- \`-\` - Intervalo (ex: \`1-5\` = de 1 a 5)
- \`,\` - Lista de valores (ex: \`1,3,5\` = 1, 3 e 5)
- \`/\` - Incremento (ex: \`*/5\` = a cada 5)

## Exemplos Práticos

### Horários Específicos
\`\`\`
0 9 * * *        # Todos os dias às 9:00 AM
30 14 * * *       # Todos os dias às 14:30 (2:30 PM)
0 0 * * *         # Todos os dias à meia-noite
\`\`\`

### Intervalos de Tempo
\`\`\`
*/15 * * * *      # A cada 15 minutos
0 */2 * * *       # A cada 2 horas
\`\`\`

### Dias Específicos da Semana
\`\`\`
0 9 * * 1         # Todas as segundas às 9:00
0 9 * * 1-5       # De segunda a sexta às 9:00
0 9 * * 0,6       # Domingos (0) e sábados (6) às 9:00
\`\`\`

### Dias Específicos do Mês
\`\`\`
0 9 1 * *         # Dia 1 de todo mês às 9:00
0 9 15 * *        # Dia 15 de todo mês às 9:00
0 9 1,15 * *      # Dias 1 e 15 de todo mês às 9:00
\`\`\`

### Múltiplos Condições
\`\`\`
0 9 * * 1         # Segunda às 9:00
0 9 * * 2         # Terça às 9:00
\`\`\`

## Valores de Dias da Semana
\`\`\`
0 - Domingo
1 - Segunda-feira
2 - Terça-feira
3 - Quarta-feira
4 - Quinta-feira
5 - Sexta-feira
6 - Sábado
7 - Domingo (alternativo)
\`\`\`

## Valores de Meses
\`\`\`
1 - Janeiro
2 - Fevereiro
3 - Março
4 - Abril
5 - Maio
6 - Junho
7 - Julho
8 - Agosto
9 - Setembro
10 - Outubro
11 - Novembro
12 - Dezembro
\`\`\`

## Exemplos Comuns para Lembretes

\`\`\`
0 8 * * *         # Medicamento às 8:00 todos os dias
0 8,20 * * *      # Medicamento às 8:00 e 20:00 todos os dias
0 8 * * 1-5       # Medicamento às 8:00 de segunda a sexta
0 8 * * 1         # Medicamento às 8:00 toda segunda
*/30 * * * *      # Medicamento a cada 30 minutos
0 9 * * 1         # Lembrete semanal toda segunda às 9:00
0 0 1 * *         # Lembrete mensal no dia 1 à meia-noite
\`\`\`

## Dica Importante
No seu código, os horários são baseados no fuso horário \`'America/Sao_Paulo'\`, então \`0 9 * * *\` significa 9:00 da manhã no horário brasileiro!

`;

      const model = this.zaiGlm45AirFreeModel.getModel();
      const agent = createAgent({
        model: model,
        tools: [this.difyKnowledgeBaseTool.getTool()],
        systemPrompt: diabatesHelperPrompt,
      });
      const response = await agent.invoke({
        messages: [{ role: 'user', content: message }],
      });
      return response;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to call agent');
    }
  }

  private async findOrCreateSession(userId: string) {
    try {
      const session = await this.prismaService.agentChatSession.findFirst({
        where: {
          userId: userId,
          lastMessageTimestamp: {
            gt: new Date(Date.now() - 1000 * 60 * 5),
          },
        },
      });

      if (session) {
        return session;
      }

      const newSession = await this.prismaService.agentChatSession.create({
        data: { userId: userId },
      });
      return newSession;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to find or create session',
      );
    }
  }
}
