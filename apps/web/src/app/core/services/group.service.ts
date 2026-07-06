import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { Grupo, UsuarioGrupo, GrupoComParticipacao, ParticipanteGrupo } from '../models';
import { SupabaseService } from './supabase';
import { Database } from '../../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly supabase = inject(SupabaseService);

  private get db(): SupabaseClient<Database> {
    return this.supabase.client;
  }

  getGroupsForUser(userId: string): Observable<GrupoComParticipacao[]> {
    return from(
      (async () => {
        // Fetch all memberships of the user
        const { data: memberships, error: mError } = await this.db
          .from('usuario_grupo')
          .select('*')
          .eq('usuario_id', userId);
        if (mError) throw new Error(mError.message);
        if (!memberships || memberships.length === 0) return [];

        const groupIds = memberships.map((m) => m.grupo_id);

        // Fetch the groups
        const { data: groups, error: gError } = await this.db
          .from('grupos')
          .select('*')
          .in('id', groupIds);
        if (gError) throw new Error(gError.message);

        // Fetch participation counts for all these groups
        const { data: allMemberships, error: amError } = await this.db
          .from('usuario_grupo')
          .select('*')
          .in('grupo_id', groupIds);
        if (amError) throw new Error(amError.message);

        return memberships
          .map((m) => {
            const group = groups?.find((g) => g.id === m.grupo_id);
            const groupParticipants =
              allMemberships?.filter((am) => am.grupo_id === m.grupo_id) || [];
            if (!group) return null;
            return {
              ...group,
              usuarioGrupoId: m.id,
              jogado: m.jogado,
              resultado: m.resultado,
              preenchido_caracteristicas: m.preenchido_caracteristicas,
              id_pessoa_sorteada: m.id_pessoa_sorteada,
              participantsCount: groupParticipants.length,
            } as GrupoComParticipacao;
          })
          .filter((g): g is GrupoComParticipacao => g !== null);
      })(),
    );
  }

  getGroupDetails(
    groupId: string,
  ): Observable<{ group: Grupo; participants: ParticipanteGrupo[] }> {
    return from(
      (async () => {
        // Fetch group
        const { data: group, error: gError } = await this.db
          .from('grupos')
          .select('*')
          .eq('id', groupId)
          .single();
        if (gError) throw new Error(gError.message);

        // Fetch memberships for this group
        const { data: memberships, error: mError } = await this.db
          .from('usuario_grupo')
          .select('*')
          .eq('grupo_id', groupId);
        if (mError) throw new Error(mError.message);

        if (!memberships || memberships.length === 0) {
          return { group: group as Grupo, participants: [] };
        }

        const userIds = memberships.map((m) => m.usuario_id);

        // Fetch users
        const { data: users, error: uError } = await this.db
          .from('usuarios')
          .select('*')
          .in('id', userIds);
        if (uError) throw new Error(uError.message);

        const participants: ParticipanteGrupo[] = memberships.map((m) => {
          const user = users?.find((u) => u.id === m.usuario_id) || {
            id: m.usuario_id,
            nome_completo: 'Desconhecido',
            email: '',
          };
          return {
            ...user,
            preenchido_caracteristicas: m.preenchido_caracteristicas,
            jogado: m.jogado,
            resultado: m.resultado,
            membershipId: m.id,
          } as ParticipanteGrupo;
        });

        return { group: group as Grupo, participants };
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
        return data as UsuarioGrupo | null;
      })(),
    );
  }

  createGroup(nome: string, token: string, donoId: string): Observable<Grupo> {
    return from(
      (async () => {
        // Check if group token already exists
        const { data: existingGroups, error: checkError } = await this.db
          .from('grupos')
          .select('*')
          .eq('token', token);
        if (checkError) throw new Error(checkError.message);
        if (existingGroups && existingGroups.length > 0) {
          throw new Error('Este token de convite já está sendo usado.');
        }

        // Insert new group
        const newGroup = {
          nome,
          token,
          sorteado: false,
          finalizado: false,
          dono_id: donoId,
        };
        const { data: createdGroup, error: insertError } = await this.db
          .from('grupos')
          .insert(newGroup)
          .select()
          .single();
        if (insertError) throw new Error(insertError.message);

        // Insert membership for the owner
        const membership = {
          usuario_id: donoId,
          grupo_id: createdGroup.id,
          id_pessoa_sorteada: null,
          preenchido_caracteristicas: false,
          jogado: false,
          resultado: false,
          chute_id: null,
        };
        const { error: mError } = await this.db.from('usuario_grupo').insert(membership);
        if (mError) throw new Error(mError.message);

        return createdGroup as Grupo;
      })(),
    );
  }

  joinGroup(token: string, userId: string): Observable<UsuarioGrupo> {
    return from(
      (async () => {
        // Find group by token
        const { data: groups, error: gError } = await this.db
          .from('grupos')
          .select('*')
          .eq('token', token);
        if (gError) throw new Error(gError.message);
        if (!groups || groups.length === 0) {
          throw new Error('Grupo não encontrado com o token fornecido.');
        }
        const group = groups[0];

        if (group.sorteado) {
          throw new Error('Este sorteio já foi realizado. Não é possível entrar.');
        }

        // Check if user is already a member
        const { data: existingMembership, error: mError } = await this.db
          .from('usuario_grupo')
          .select('*')
          .eq('usuario_id', userId)
          .eq('grupo_id', group.id)
          .maybeSingle();
        if (mError) throw new Error(mError.message);

        if (existingMembership) {
          return existingMembership as UsuarioGrupo;
        }

        // Create new membership
        const newMembership = {
          usuario_id: userId,
          grupo_id: group.id,
          id_pessoa_sorteada: null,
          preenchido_caracteristicas: false,
          jogado: false,
          resultado: false,
          chute_id: null,
        };
        const { data: created, error: createError } = await this.db
          .from('usuario_grupo')
          .insert(newMembership)
          .select()
          .single();
        if (createError) throw new Error(createError.message);

        return created as UsuarioGrupo;
      })(),
    );
  }

  performDraw(groupId: string): Observable<Grupo> {
    return from(
      (async () => {
        // Fetch all memberships of the group
        const { data: memberships, error: mError } = await this.db
          .from('usuario_grupo')
          .select('*')
          .eq('grupo_id', groupId);
        if (mError) throw new Error(mError.message);
        if (!memberships || memberships.length < 3) {
          throw new Error('O sorteio necessita de pelo menos 3 participantes.');
        }

        const notFilled = memberships.filter((m) => !m.preenchido_caracteristicas);
        if (notFilled.length > 0) {
          throw new Error(
            'Todos os participantes devem preencher suas características antes de sortear.',
          );
        }

        // Shuffle
        const shuffled = [...memberships];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Perform reciprocal/random draw updates
        for (let i = 0; i < shuffled.length; i++) {
          const nextIndex = (i + 1) % shuffled.length;
          const current = shuffled[i];
          const recipient = shuffled[nextIndex];

          const { error: updateError } = await this.db
            .from('usuario_grupo')
            .update({ id_pessoa_sorteada: recipient.usuario_id })
            .eq('id', current.id);
          if (updateError) throw new Error(updateError.message);
        }

        // Update group draw status
        const { data: updatedGroup, error: groupUpdateError } = await this.db
          .from('grupos')
          .update({ sorteado: true })
          .eq('id', groupId)
          .select()
          .single();
        if (groupUpdateError) throw new Error(groupUpdateError.message);

        return updatedGroup as Grupo;
      })(),
    );
  }

  submitGuess(groupId: string, userId: string, guessedUserId: string): Observable<UsuarioGrupo> {
    return from(
      (async () => {
        // Get membership
        const { data: membership, error: mError } = await this.db
          .from('usuario_grupo')
          .select('*')
          .eq('usuario_id', userId)
          .eq('grupo_id', groupId)
          .maybeSingle();
        if (mError) throw new Error(mError.message);
        if (!membership) {
          throw new Error('Participante não cadastrado neste grupo.');
        }

        const isCorrect = String(membership.id_pessoa_sorteada) === String(guessedUserId);

        const { data: updated, error: updateError } = await this.db
          .from('usuario_grupo')
          .update({
            jogado: true,
            resultado: isCorrect,
            chute_id: guessedUserId,
          })
          .eq('id', membership.id)
          .select()
          .single();
        if (updateError) throw new Error(updateError.message);

        return updated as UsuarioGrupo;
      })(),
    );
  }

  deleteGroup(groupId: string): Observable<void> {
    return from(
      (async () => {
        // Delete all memberships first
        const { error: mError } = await this.db
          .from('usuario_grupo')
          .delete()
          .eq('grupo_id', groupId);
        if (mError) throw new Error(mError.message);

        // Delete group
        const { error: gError } = await this.db.from('grupos').delete().eq('id', groupId);
        if (gError) throw new Error(gError.message);
      })(),
    );
  }
}
