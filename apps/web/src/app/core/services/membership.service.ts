import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { UsuarioGrupo } from '../models';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class MembershipService {
  private readonly supabase = inject(SupabaseService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get db(): any {
    return this.supabase.client;
  }

  getMemberships(userId?: string, groupId?: string): Observable<UsuarioGrupo[]> {
    return from(
      (async () => {
        let query = this.db.from('usuario_grupo').select('*');
        if (userId) query = query.eq('usuario_id', userId);
        if (groupId) query = query.eq('grupo_id', groupId);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return (data as UsuarioGrupo[]) ?? [];
      })(),
    );
  }

  getMembership(userId: string, groupId: string): Observable<UsuarioGrupo | null> {
    return from(
      (async () => {
        const { data, error } = await this.db
          .from('usuario_grupo')
          .select('*')
          .eq('usuario_id', userId)
          .eq('grupo_id', groupId)
          .maybeSingle();
        if (error) throw new Error(error.message);
        return (data as UsuarioGrupo | null) ?? null;
      })(),
    );
  }

  updateMembership(id: string | number, data: Partial<UsuarioGrupo>): Observable<UsuarioGrupo> {
    return from(
      (async () => {
        const { data: updated, error } = await this.db
          .from('usuario_grupo')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return updated as UsuarioGrupo;
      })(),
    );
  }

  deleteMembership(id: string | number): Observable<void> {
    return from(
      (async () => {
        const { error } = await this.db.from('usuario_grupo').delete().eq('id', id);
        if (error) throw new Error(error.message);
      })(),
    );
  }

  createMembership(data: Omit<UsuarioGrupo, 'id'>): Observable<UsuarioGrupo> {
    return from(
      (async () => {
        const { data: created, error } = await this.db
          .from('usuario_grupo')
          .insert(data)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return created as UsuarioGrupo;
      })(),
    );
  }
}
