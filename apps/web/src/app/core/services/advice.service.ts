import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface AdviceSlip {
  slip: {
    id: number;
    advice: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdviceService {
  private readonly http = inject(HttpClient);

  getAdvice(): Observable<string> {
    return this.http.get<AdviceSlip>('https://api.adviceslip.com/advice').pipe(
      map((response) => response.slip.advice),
    );
  }
}
