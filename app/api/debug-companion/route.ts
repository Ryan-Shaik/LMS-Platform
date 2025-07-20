import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    // Test basic connection
    console.log('Testing Supabase connection...');
    
    // Check if we can query users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(3);
    
    if (usersError) {
      console.error('Users query error:', usersError);
      return NextResponse.json({ error: 'Users query failed', details: usersError }, { status: 500 });
    }
    
    console.log('Users found:', users);
    
    // Check if we can query companions
    const { data: companions, error: companionsError } = await supabase
      .from('companions')
      .select('id, name, subject')
      .limit(3);
    
    if (companionsError) {
      console.error('Companions query error:', companionsError);
      return NextResponse.json({ error: 'Companions query failed', details: companionsError }, { status: 500 });
    }
    
    console.log('Companions found:', companions);
    
    // Test creating a companion directly
    if (users && users.length > 0) {
      const testUser = users[0];
      
      const testCompanionData = {
        name: 'Debug Test Companion',
        subject: 'maths',
        topic: 'Debug Testing',
        voice: 'female',
        style: 'casual',
        duration: 30,
        authorId: testUser.id,
        isPublic: false,
        instructions: 'This is a debug test companion',
        vapiAssistantId: 'debug_test_assistant'
      };
      
      console.log('Creating test companion:', testCompanionData);
      
      const { data: newCompanion, error: createError } = await supabase
        .from('companions')
        .insert(testCompanionData)
        .select()
        .single();
      
      if (createError) {
        console.error('Create companion error:', createError);
        return NextResponse.json({ 
          error: 'Failed to create test companion', 
          details: createError,
          testData: testCompanionData
        }, { status: 500 });
      }
      
      console.log('Successfully created test companion:', newCompanion);
      
      return NextResponse.json({
        success: true,
        message: 'Database connection and companion creation working',
        users: users.length,
        companions: companions.length,
        newCompanion
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working but no users found',
      users: users.length,
      companions: companions.length
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Debug test failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}