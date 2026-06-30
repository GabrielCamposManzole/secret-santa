import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { UsuarioGrupo } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MembershipService {
  private readonly apiUrl = environment.apiUrl;

  getMemberships(userId?: string, groupId?: string): Observable<UsuarioGrupo[]> {
    let url = `${this.apiUrl}/usuario_grupo`;
    if (userId || groupId) {
      const params = new URLSearchParams();
      if (userId) params.append('usuario_id', userId);
      if (groupId) params.append('grupo_id', groupId);
      url += `?${params.toString()}`;
    }

    return from(
      fetch(url).then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar participações');
        return res.json();
      }),
    );
  }

  getMembership(userId: string, groupId: string): Observable<UsuarioGrupo | null> {
    return from(
      fetch(`${this.apiUrl}/usuario_grupo?usuario_id=${userId}&grupo_id=${groupId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Erro ao buscar participação');
          return res.json();
        })
        .then((data: UsuarioGrupo[]) => (data.length > 0 ? data[0] : null)),
    );
  }

  updateMembership(id: string | number, data: Partial<UsuarioGrupo>): Observable<UsuarioGrupo> {
    return from(
      fetch(`${this.apiUrl}/usuario_grupo/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error('Erro ao atualizar participação');
        return res.json();
      }),
    );
  }

  deleteMembership(id: string | number): Observable<void> {
    return from(
      fetch(`${this.apiUrl}/usuario_grupo/${id}`, {
        method: 'DELETE',
      }).then((res) => {
        if (!res.ok) throw new Error('Erro ao remover participação');
      }),
    );
  }

  createMembership(data: Omit<UsuarioGrupo, 'id'>): Observable<UsuarioGrupo> {
    return from(
      fetch(`${this.apiUrl}/usuario_grupo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error('Erro ao criar participação');
        return res.json();
      }),
    );
  }
}
