import { createSupabaseClient } from '@/lib/supabase';
import { Companion, CreateCompanionData, GetCompanionsQuery } from './types';

export class CompanionModel {
  private supabase = createSupabaseClient();

  async createCompanion(companionData: CreateCompanionData & { authorId: string }): Promise<Companion | null> {
    try {
      console.log('CompanionModel: Creating companion with data:', companionData);
      
      const { data, error } = await this.supabase
        .from('companions')
        .insert(companionData)
        .select()
        .single();

      if (error) {
        console.error('CompanionModel: Supabase error:', error);
        throw error;
      }
      
      console.log('CompanionModel: Successfully created companion:', data);
      return data;
    } catch (error) {
      console.error('CompanionModel: Error creating companion:', error);
      return null;
    }
  }

  async getCompanionById(id: string): Promise<Companion | null> {
    try {
      const { data, error } = await this.supabase
        .from('companions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching companion:', error);
      return null;
    }
  }

  async getAllCompanions(query: GetCompanionsQuery = {}): Promise<Companion[]> {
    try {
      const { limit = 10, page = 1, subject, topic, authorId } = query;
      
      let supabaseQuery = this.supabase
        .from('companions')
        .select('*');

      // Apply filters
      if (subject) {
        supabaseQuery = supabaseQuery.eq('subject', subject);
      }

      if (topic) {
        supabaseQuery = supabaseQuery.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
      }

      if (authorId) {
        supabaseQuery = supabaseQuery.eq('authorId', authorId);
      }

      // Apply pagination
      supabaseQuery = supabaseQuery
        .range((page - 1) * limit, page * limit - 1)
        .order('createdAt', { ascending: false });

      const { data, error } = await supabaseQuery;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching companions:', error);
      return [];
    }
  }

  async getUserCompanions(authorId: string, limit = 10): Promise<Companion[]> {
    try {
      const { data, error } = await this.supabase
        .from('companions')
        .select('*')
        .eq('authorId', authorId)
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user companions:', error);
      return [];
    }
  }

  async updateCompanion(id: string, updates: Partial<Companion>): Promise<Companion | null> {
    try {
      const { data, error } = await this.supabase
        .from('companions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating companion:', error);
      return null;
    }
  }

  async deleteCompanion(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('companions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting companion:', error);
      return false;
    }
  }

  async getCompanionCount(authorId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('companions')
        .select('id', { count: 'exact' })
        .eq('authorId', authorId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting companion count:', error);
      return 0;
    }
  }
}