import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from './posts/post.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  fetch(userId: string): Observable<Post[]> {
    const url =
      `https://jsonplaceholder.typicode.com/posts` +
      (userId ? `?userId=${userId}` : '');

    return this.http.get<Post[]>(url);
  }
}
