import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
//import { API_URL } from '../config';

export interface Issue {
  _id?: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Closed';
  createdBy?: { email: string };
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class IssueService {
  private http = inject(HttpClient);
  //private url = `${API_URL}/issues`;
  private url = `${environment.apiUrl}/issues`;

  getAll(filters: { q?: string; status?: string; severity?: string } = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, v); });
    return this.http.get<Issue[]>(this.url, { params });
  }
  getOne(id: string) {
    return this.http.get<Issue>(`${this.url}/${id}`);
  }
  create(issue: Partial<Issue>) {
    return this.http.post<Issue>(this.url, issue);
  }
  update(id: string, issue: Partial<Issue>) {
    return this.http.put<Issue>(`${this.url}/${id}`, issue);
  }
  remove(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }
  stats() {
    return this.http.get<Record<string, number>>(`${this.url}/stats`);
  }
}