import { Injectable } from '@angular/core';
import { from, Observable, forkJoin, of, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Grupo, Usuario, UsuarioGrupo, GrupoComParticipacao, ParticipanteGrupo } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly apiUrl = environment.apiUrl;

  private fetchJson<T>(url: string, options?: RequestInit): Observable<T> {
    return from(
      fetch(url, options).then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      }),
    );
  }

  getGroupsForUser(userId: string): Observable<GrupoComParticipacao[]> {
    return this.fetchJson<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
      switchMap((allMemberships) => {
        const memberships = allMemberships.filter((m) => String(m.usuario_id) === String(userId));
        if (memberships.length === 0) return of([]);

        const groupRequests = memberships.map((m) => {
          return forkJoin({
            membership: of(m),
            group: this.fetchJson<Grupo>(`${this.apiUrl}/grupos/${m.grupo_id}`).pipe(
              catchError(() => of(null)),
            ),
            allParticipants: of(
              allMemberships.filter((x) => String(x.grupo_id) === String(m.grupo_id)),
            ),
          });
        });

        return forkJoin(groupRequests).pipe(
          map((results) => {
            return results
              .filter((r) => r.group !== null)
              .map((r) => ({
                ...r.group!,
                usuarioGrupoId: r.membership.id,
                jogado: r.membership.jogado,
                resultado: r.membership.resultado,
                preenchido_caracteristicas: r.membership.preenchido_caracteristicas,
                id_pessoa_sorteada: r.membership.id_pessoa_sorteada,
                participantsCount: r.allParticipants.length,
              }));
          }),
        );
      }),
    );
  }

  getGroupDetails(
    groupId: string,
  ): Observable<{ group: Grupo; participants: ParticipanteGrupo[] }> {
    return forkJoin({
      group: this.fetchJson<Grupo>(`${this.apiUrl}/grupos/${groupId}`),
      allMemberships: this.fetchJson<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`),
    }).pipe(
      switchMap(({ group, allMemberships }) => {
        const memberships = allMemberships.filter((m) => String(m.grupo_id) === String(groupId));
        if (memberships.length === 0) {
          return of({ group, participants: [] });
        }

        const userRequests = memberships.map((m) =>
          this.fetchJson<Usuario>(`${this.apiUrl}/usuarios/${m.usuario_id}`).pipe(
            map((user) => ({
              ...user,
              preenchido_caracteristicas: m.preenchido_caracteristicas,
              jogado: m.jogado,
              resultado: m.resultado,
              membershipId: m.id,
            })),
          ),
        );

        return forkJoin(userRequests).pipe(
          map((participants) => ({
            group,
            participants,
          })),
        );
      }),
    );
  }

  getMembership(userId: string, groupId: string): Observable<UsuarioGrupo | null> {
    return this.fetchJson<UsuarioGrupo[]>(
      `${this.apiUrl}/usuario_grupo?usuario_id=${userId}&grupo_id=${groupId}`,
    ).pipe(map((data) => (data.length > 0 ? data[0] : null)));
  }

  createGroup(nome: string, token: string, donoId: string): Observable<Grupo> {
    return this.fetchJson<Grupo[]>(`${this.apiUrl}/grupos?token=${token}`).pipe(
      switchMap((groups) => {
        if (groups.length > 0) {
          return throwError(() => new Error('Este token de convite já está sendo usado.'));
        }
        const newGroup: Omit<Grupo, 'id'> = {
          nome,
          token,
          sorteado: false,
          finalizado: false,
          dono_id: donoId,
        };
        return this.fetchJson<Grupo>(`${this.apiUrl}/grupos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGroup),
        });
      }),
      switchMap((group) => {
        const membership: Omit<UsuarioGrupo, 'id'> = {
          usuario_id: donoId,
          grupo_id: group.id,
          id_pessoa_sorteada: null,
          preenchido_caracteristicas: false,
          jogado: false,
          resultado: false,
          chute_id: null,
        };
        return this.fetchJson<UsuarioGrupo>(`${this.apiUrl}/usuario_grupo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(membership),
        }).pipe(map(() => group));
      }),
    );
  }

  joinGroup(token: string, userId: string): Observable<UsuarioGrupo> {
    return this.fetchJson<Grupo[]>(`${this.apiUrl}/grupos?token=${token}`).pipe(
      switchMap((groups) => {
        if (groups.length === 0) {
          return throwError(() => new Error('Grupo não encontrado com o token fornecido.'));
        }
        const group = groups[0];

        if (group.sorteado) {
          return throwError(
            () => new Error('Este sorteio já foi realizado. Não é possível entrar.'),
          );
        }

        return this.fetchJson<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
          switchMap((allMemberships) => {
            const memberships = allMemberships.filter(
              (m) =>
                String(m.usuario_id) === String(userId) && String(m.grupo_id) === String(group.id),
            );
            if (memberships.length > 0) {
              return of(memberships[0]);
            }

            const newMembership: Omit<UsuarioGrupo, 'id'> = {
              usuario_id: userId,
              grupo_id: group.id,
              id_pessoa_sorteada: null,
              preenchido_caracteristicas: false,
              jogado: false,
              resultado: false,
              chute_id: null,
            };
            return this.fetchJson<UsuarioGrupo>(`${this.apiUrl}/usuario_grupo`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newMembership),
            });
          }),
        );
      }),
    );
  }

  performDraw(groupId: string): Observable<Grupo> {
    return this.fetchJson<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
      switchMap((allMemberships) => {
        const memberships = allMemberships.filter((m) => String(m.grupo_id) === String(groupId));
        if (memberships.length < 3) {
          return throwError(() => new Error('O sorteio necessita de pelo menos 3 participantes.'));
        }

        const notFilled = memberships.filter((m) => !m.preenchido_caracteristicas);
        if (notFilled.length > 0) {
          return throwError(
            () =>
              new Error(
                'Todos os participantes devem preencher suas características antes de sortear.',
              ),
          );
        }

        const shuffled = [...memberships];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const updates = shuffled.map((m, index) => {
          const nextIndex = (index + 1) % shuffled.length;
          const recipient = shuffled[nextIndex];
          const updatedMembership = {
            ...m,
            id_pessoa_sorteada: recipient.usuario_id,
          };
          return this.fetchJson<UsuarioGrupo>(`${this.apiUrl}/usuario_grupo/${m.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedMembership),
          });
        });

        return forkJoin(updates).pipe(
          switchMap(() => this.fetchJson<Grupo>(`${this.apiUrl}/grupos/${groupId}`)),
          switchMap(() =>
            this.fetchJson<Grupo>(`${this.apiUrl}/grupos/${groupId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sorteado: true }),
            }),
          ),
        );
      }),
    );
  }

  submitGuess(groupId: string, userId: string, guessedUserId: string): Observable<UsuarioGrupo> {
    return this.fetchJson<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
      switchMap((allMemberships) => {
        const memberships = allMemberships.filter(
          (m) => String(m.usuario_id) === String(userId) && String(m.grupo_id) === String(groupId),
        );
        if (memberships.length === 0) {
          return throwError(() => new Error('Participante não cadastrado neste grupo.'));
        }
        const membership = memberships[0];
        const isCorrect = String(membership.id_pessoa_sorteada) === String(guessedUserId);

        const updatedMembership = {
          ...membership,
          jogado: true,
          resultado: isCorrect,
          chute_id: guessedUserId,
        };

        return this.fetchJson<UsuarioGrupo>(`${this.apiUrl}/usuario_grupo/${membership.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMembership),
        });
      }),
    );
  }

  deleteGroup(groupId: string): Observable<void> {
    return this.fetchJson<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
      switchMap((allMemberships) => {
        const memberships = allMemberships.filter((m) => String(m.grupo_id) === String(groupId));
        const deleteRequests = memberships.map((m) =>
          this.fetchJson<void>(`${this.apiUrl}/usuario_grupo/${m.id}`, { method: 'DELETE' }),
        );
        if (deleteRequests.length === 0) {
          return this.fetchJson<void>(`${this.apiUrl}/grupos/${groupId}`, { method: 'DELETE' });
        }
        return forkJoin(deleteRequests).pipe(
          switchMap(() =>
            this.fetchJson<void>(`${this.apiUrl}/grupos/${groupId}`, { method: 'DELETE' }),
          ),
        );
      }),
    );
  }
}
