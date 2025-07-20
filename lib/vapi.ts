import { VapiAssistant, VapiCall } from '@/models/types';

class VapiService {
  constructor() {
    // Since we're using Vapi tools, we don't need API keys here
  }

  async createAssistant(data: {
    name: string;
    instructions: string;
    voice: {
      provider: string;
      voiceId: string;
    };
    llm?: {
      provider: string;
      model: string;
    };
    transcriber?: {
      provider: string;
      model: string;
    };
  }): Promise<VapiAssistant> {
    // This would be called from server-side code using the Vapi tools
    // For now, we'll return a mock response since this needs to be called from server actions
    throw new Error('createAssistant should be called from server actions using Vapi tools');
  }

  async getAssistant(assistantId: string): Promise<VapiAssistant> {
    throw new Error('getAssistant should be called from server actions using Vapi tools');
  }

  async updateAssistant(assistantId: string, data: Partial<VapiAssistant>): Promise<VapiAssistant> {
    throw new Error('updateAssistant should be called from server actions using Vapi tools');
  }

  async deleteAssistant(assistantId: string): Promise<void> {
    throw new Error('deleteAssistant should be called from server actions using Vapi tools');
  }

  async createCall(data: {
    assistantId: string;
    customer?: {
      number?: string;
    };
    assistantOverrides?: {
      variableValues?: Record<string, any>;
    };
  }): Promise<VapiCall> {
    throw new Error('createCall should be called from server actions using Vapi tools');
  }

  async getCall(callId: string): Promise<VapiCall> {
    throw new Error('getCall should be called from server actions using Vapi tools');
  }

  async listCalls(limit = 10): Promise<VapiCall[]> {
    throw new Error('listCalls should be called from server actions using Vapi tools');
  }

  generateInstructions(companion: {
    name: string;
    subject: string;
    topic: string;
    style: string;
    duration: number;
  }): string {
    const baseInstructions = `You are ${companion.name}, an AI tutor specializing in ${companion.subject}.

Your role:
- You are an expert ${companion.subject} tutor with a ${companion.style} teaching style
- Your specialty is ${companion.topic}
- You conduct ${companion.duration}-minute learning sessions
- You adapt to the student's learning pace and style

Teaching approach:
- Start by assessing the student's current knowledge level
- Break down complex concepts into digestible parts
- Use examples and analogies relevant to ${companion.subject}
- Encourage questions and provide clear explanations
- Give positive reinforcement and constructive feedback
- End sessions with a summary of key learnings

Session structure:
1. Greet the student and introduce the topic
2. Assess their current understanding
3. Teach new concepts step by step
4. Practice with examples or exercises
5. Answer questions and clarify doubts
6. Summarize the session and suggest next steps

Remember:
- Keep the session engaging and interactive
- Adjust your pace based on student responses
- Be patient and encouraging
- Focus on understanding rather than memorization
- Make learning enjoyable and accessible`;

    if (companion.style === 'casual') {
      return baseInstructions + `

Communication style:
- Use friendly, conversational language
- Include humor when appropriate
- Be relatable and approachable
- Use everyday examples and analogies
- Encourage a relaxed learning environment`;
    } else {
      return baseInstructions + `

Communication style:
- Use professional, academic language
- Maintain a structured approach
- Focus on precision and accuracy
- Use formal examples and terminology
- Emphasize academic rigor and excellence`;
    }
  }

  getVoiceConfig(voiceType: string) {
    const voiceConfigs = {
      'female': {
        provider: '11labs',
        voiceId: 'sarah'
      },
      'male': {
        provider: '11labs',
        voiceId: 'adam'
      }
    };

    return voiceConfigs[voiceType as keyof typeof voiceConfigs] || voiceConfigs.female;
  }
}

export const vapiService = new VapiService();