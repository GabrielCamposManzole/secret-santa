import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { Grupo, Usuario, UsuarioGrupo } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getGroupsForUser(userId: string): Observable<any[]> {
    // 1. Get all memberships to avoid type mismatches
    return this.http.get<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
      switchMap((allMemberships) => {
        const memberships = allMemberships.filter((m) => String(m.usuario_id) === String(userId));
        if (memberships.length === 0) return of([]);

        // 2. For each membership, fetch the group details and all participants
        const groupRequests = memberships.map((m) => {
          return forkJoin({
            membership: of(m),
            group: this.http.get<Grupo>(`${this.apiUrl}/grupos/${m.grupo_id}`).pipe(
              catchError(() => of(null)), // Handle deleted/orphaned groups gracefully
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

  getGroupDetails(groupId: string): Observable<{ group: Grupo; participants: any[] }> {
    return forkJoin({
      group: this.http.get<Grupo>(`${this.apiUrl}/grupos/${groupId}`),
      allMemberships: this.http.get<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`),
    }).pipe(
      switchMap(({ group, allMemberships }) => {
        const memberships = allMemberships.filter((m) => String(m.grupo_id) === String(groupId));
        if (memberships.length === 0) {
          return of({ group, participants: [] });
        }

        const userRequests = memberships.map((m) =>
          this.http.get<Usuario>(`${this.apiUrl}/usuarios/${m.usuario_id}`).pipe(
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

  createGroup(nome: string, token: string, donoId: string): Observable<Grupo> {
    // Check if token already exists
    return this.http.get<Grupo[]>(`${this.apiUrl}/grupos?token=${token}`).pipe(
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
        return this.http.post<Grupo>(`${this.apiUrl}/grupos`, newGroup);
      }),
      switchMap((group) => {
        // Automatically add owner as participant
        const membership: Omit<UsuarioGrupo, 'id'> = {
          usuario_id: donoId,
          grupo_id: group.id,
          id_pessoa_sorteada: null,
          preenchido_caracteristicas: false,
          jogado: false,
          resultado: false,
          chute_id: null,
        };
        return this.http
          .post<UsuarioGrupo>(`${this.apiUrl}/usuario_grupo`, membership)
          .pipe(map(() => group));
      }),
    );
  }

  joinGroup(token: string, userId: string): Observable<UsuarioGrupo> {
    // 1. Find group by token
    return this.http.get<Grupo[]>(`${this.apiUrl}/grupos?token=${token}`).pipe(
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

        // 2. Check if already joined
        return this.http.get<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
          switchMap((allMemberships) => {
            const memberships = allMemberships.filter(
              (m) =>
                String(m.usuario_id) === String(userId) && String(m.grupo_id) === String(group.id),
            );
            if (memberships.length > 0) {
              return of(memberships[0]); // Already joined
            }

            // 3. Join the group
            const newMembership: Omit<UsuarioGrupo, 'id'> = {
              usuario_id: userId,
              grupo_id: group.id,
              id_pessoa_sorteada: null,
              preenchido_caracteristicas: false,
              jogado: false,
              resultado: false,
              chute_id: null,
            };
            return this.http.post<UsuarioGrupo>(`${this.apiUrl}/usuario_grupo`, newMembership);
          }),
        );
      }),
    );
  }

  performDraw(groupId: string): Observable<any> {
    return this.http.get<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
      switchMap((allMemberships) => {
        const memberships = allMemberships.filter((m) => String(m.grupo_id) === String(groupId));
        if (memberships.length < 3) {
          return throwError(() => new Error('O sorteio necessita de pelo menos 3 participantes.'));
        }

        // Check if all participants filled characteristics
        const notFilled = memberships.filter((m) => !m.preenchido_caracteristicas);
        if (notFilled.length > 0) {
          return throwError(
            () =>
              new Error(
                'Todos os participantes devem preencher suas características antes de sortear.',
              ),
          );
        }

        // Hamiltonian Cycle draw algorithm
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
          return this.http.put<UsuarioGrupo>(
            `${this.apiUrl}/usuario_grupo/${m.id}`,
            updatedMembership,
          );
        });

        // Update group draw state
        return forkJoin(updates).pipe(
          switchMap(() => this.http.get<Grupo>(`${this.apiUrl}/grupos/${groupId}`)),
          switchMap((group) =>
            this.http.patch<Grupo>(`${this.apiUrl}/grupos/${groupId}`, { sorteado: true }),
          ),
        );
      }),
    );
  }

  submitGuess(groupId: string, userId: string, guessedUserId: string): Observable<UsuarioGrupo> {
    return this.http.get<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
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

        return this.http.put<UsuarioGrupo>(
          `${this.apiUrl}/usuario_grupo/${membership.id}`,
          updatedMembership,
        );
      }),
    );
  }

  deleteGroup(groupId: string): Observable<any> {
    return this.http.get<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
      switchMap((allMemberships) => {
        const memberships = allMemberships.filter((m) => String(m.grupo_id) === String(groupId));
        const deleteRequests = memberships.map((m) =>
          this.http.delete(`${this.apiUrl}/usuario_grupo/${m.id}`),
        );
        if (deleteRequests.length === 0) {
          return this.http.delete(`${this.apiUrl}/grupos/${groupId}`);
        }
        return forkJoin(deleteRequests).pipe(
          switchMap(() => this.http.delete(`${this.apiUrl}/grupos/${groupId}`)),
        );
      }),
    );
  }
}
