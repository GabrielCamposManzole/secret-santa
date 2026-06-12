import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, switchMap, throwError } from 'rxjs';
import { Usuario } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
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
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios?email=${email}`).pipe(
      map((users) => {
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
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios?email=${userData.email}`).pipe(
      map((users) => {
        if (users.length > 0) {
          throw new Error('E-mail já cadastrado');
        }
        return true;
      }),
      switchMap(() => {
        return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, userData);
      }),
      tap((user) => {
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

    return this.http.patch<Usuario>(`${this.apiUrl}/usuarios/${userId}`, userData).pipe(
      tap((user) => {
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
