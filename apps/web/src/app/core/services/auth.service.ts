import { Injectable, inject, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);

  // Usamos um Signal para armazenar o estado reativo do usuário logado
  currentUser = signal<User | null>(null);

  constructor() {
    // Escuta mudanças de estado (login, logout, token expirado) em tempo real
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getCurrentUserId(): string | null {
    return this.currentUser()?.id ?? null;
  }

  async cadastrar(email: string, password: string, nomeCompleto: string) {
    return this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome_completo: nomeCompleto,
        },
      },
    });
  }

  async login(email: string, password: string) {
    return this.supabase.client.auth.signInWithPassword({ email, password });
  }

  async logout() {
    return this.supabase.client.auth.signOut();
  }
}
