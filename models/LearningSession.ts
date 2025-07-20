import { createSupabaseClient } from '@/lib/supabase';
import { LearningSession, CreateLearningSessionData } from './types';

export class LearningSessionModel {
  private supabase = createSupabaseClient();

  async createSession(sessionData: CreateLearningSessionData): Promise<LearningSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('learning_sessions')
        .insert({
          ...sessionData,
          status: 'pending',
          startedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating learning session:', error);
      return null;
    }
  }

  async getSessionById(id: string): Promise<LearningSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('learning_sessions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching learning session:', error);
      return null;
    }
  }

  async getUserSessions(userId: string, limit = 10): Promise<LearningSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('learning_sessions')
        .select(`
          *,
          companions (
            id,
            name,
            subject,
            topic
          )
        `)
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  async updateSession(id: string, updates: Partial<LearningSession>): Promise<LearningSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('learning_sessions')
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating learning session:', error);
      return null;
    }
  }

  async completeSession(id: string, data: {
    duration?: number;
    transcript?: string;
    feedback?: string;
    rating?: number;
  }): Promise<LearningSession | null> {
    try {
      const { data: session, error } = await this.supabase
        .from('learning_sessions')
        .update({
          ...data,
          status: 'completed',
          endedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error completing learning session:', error);
      return null;
    }
  }

  async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    totalDuration: number;
    averageRating: number;
    completedSessions: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('learning_sessions')
        .select('duration, rating, status')
        .eq('userId', userId);

      if (error) throw error;

      const sessions = data || [];
      const completedSessions = sessions.filter(s => s.status === 'completed');
      
      const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const ratingsWithValues = completedSessions.filter(s => s.rating);
      const averageRating = ratingsWithValues.length > 0 
        ? ratingsWithValues.reduce((sum, s) => sum + s.rating, 0) / ratingsWithValues.length 
        : 0;

      return {
        totalSessions: sessions.length,
        totalDuration,
        averageRating,
        completedSessions: completedSessions.length,
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageRating: 0,
        completedSessions: 0,
      };
    }
  }
}