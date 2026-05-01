import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Result } from '../models/result.model';

export interface Attribute {
  id: string;
  name: string;
  dataType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttributeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Products/Attributes`;

  getAll(): Observable<Attribute[]> {
    return this.http.get<Result<Attribute[]>>(this.apiUrl).pipe(
      map(res => (res.isSuccess && res.data) ? res.data : [])
    );
  }
}
