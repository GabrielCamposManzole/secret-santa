import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Database } from '../../../types/supabase'; // Importando os tipos gerados

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // Agora o cliente sabe exatamente o formato do seu banco!
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(environment.supabaseUrl, environment.supabaseKey);
  }

  get client(): SupabaseClient<Database> {
    return this.supabase;
  }
}
