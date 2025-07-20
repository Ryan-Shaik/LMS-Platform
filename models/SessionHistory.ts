import { createSupabaseClient } from '@/lib/supabase';
import { SessionHistory, GetSessionsQuery } from './types';

export class SessionHistoryModel {
  private supabase = createSupabaseClient();

  async createSession(sessionData: Omit<SessionHistory, 'id' | 'completedAt'>): Promise<SessionHistory | null> {
    try {
      const { data, error } = await this.supabase
        .from('session_history')
        .insert({
          ...sessionData,
          completedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }

  async getUserSessions(userId: string, limit = 10): Promise<SessionHistory[]> {
    try {
      const { data, error } = await this.supabase
        .from('session_history')
        .select(`
          *,
          companion:companions(*)
        `)
        .eq('userId', userId)
        .order('completedAt', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  async getRecentSessions(limit = 10): Promise<SessionHistory[]> {
    try {
      const { data, error } = await this.supabase
        .from('session_history')
        .select(`
          *,
          companion:companions(*)
        `)
        .order('completedAt', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
      return [];
    }
  }

  async getSessionById(id: string): Promise<SessionHistory | null> {
    try {
      const { data, error } = await this.supabase
        .from('session_history')
        .select(`
          *,
          companion:companions(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  async updateSession(id: string, updates: Partial<SessionHistory>): Promise<SessionHistory | null> {
    try {
      const { data, error } = await this.supabase
        .from('session_history')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating session:', error);
      return null;
    }
  }

  async getUserSessionStats(userId: string): Promise<{
    totalSessions: number;
    totalDuration: number;
    averageRating: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('session_history')
        .select('duration, rating')
        .eq('userId', userId);

      if (error) throw error;

      const sessions = data || [];
      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const ratingsWithValues = sessions.filter(session => session.rating !== null);
      const averageRating = ratingsWithValues.length > 0 
        ? ratingsWithValues.reduce((sum, session) => sum + session.rating, 0) / ratingsWithValues.length 
        : 0;

      return {
        totalSessions,
        totalDuration,
        averageRating
      };
    } catch (error) {
      console.error('Error fetching user session stats:', error);
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageRating: 0
      };
    }
  }
}