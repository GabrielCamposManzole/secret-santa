import { Injectable, signal } from '@angular/core';
import { from, Observable, tap, map, switchMap, throwError, of } from 'rxjs';
import { Usuario } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  readonly currentUser = signal<Usuario | null>(null);

  constructor() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getCurrentUserId(): string | null {
    return this.currentUser()?.id || null;
  }

  login(email: string, senha: string): Observable<Usuario> {
    return from(
      fetch(`${this.apiUrl}/usuarios?email=${email}`).then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar usuário');
        return res.json();
      }),
    ).pipe(
      map((users: Usuario[]) => {
        if (users.length === 0) {
          throw new Error('Usuário não encontrado');
        }
        const user = users[0];
        if (user.senha !== senha) {
          throw new Error('Senha incorreta');
        }
        return user;
      }),
      tap((user) => {
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.senha;
        this.currentUser.set(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      }),
    );
  }

  register(userData: Partial<Usuario>): Observable<Usuario> {
    return from(
      fetch(`${this.apiUrl}/usuarios?email=${userData.email}`).then((res) => {
        if (!res.ok) throw new Error('Erro ao validar e-mail');
        return res.json();
      }),
    ).pipe(
      map((users: Usuario[]) => {
        if (users.length > 0) {
          throw new Error('E-mail já cadastrado');
        }
        return true;
      }),
      switchMap(() => {
        return from(
          fetch(`${this.apiUrl}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          }).then((res) => {
            if (!res.ok) throw new Error('Erro ao cadastrar usuário');
            return res.json();
          }),
        );
      }),
      tap((user: Usuario) => {
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.senha;
        this.currentUser.set(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      }),
    );
  }

  updateProfile(userData: Partial<Usuario>): Observable<Usuario> {
    const userId = this.getCurrentUserId();
    if (!userId) return throwError(() => new Error('Usuário não autenticado'));

    return from(
      fetch(`${this.apiUrl}/usuarios/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }).then((res) => {
        if (!res.ok) throw new Error('Erro ao atualizar perfil');
        return res.json();
      }),
    ).pipe(
      tap((user: Usuario) => {
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.senha;
        this.currentUser.set(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      }),
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }
}
