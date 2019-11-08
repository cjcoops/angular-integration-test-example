import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { map } from 'rxjs/operators';
import { Post } from './post.model';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PostsState {
  posts: Post[];
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  constructor(
    private dataService: DataService,
    private httpClient: HttpClient
  ) {}

  private subject = new BehaviorSubject<PostsState>({
    posts: null,
    loading: true
  });

  posts$ = this.subject.asObservable().pipe(map(state => state.posts));
  loading$ = this.subject.asObservable().pipe(map(state => state.loading));

  load(userId: number): Observable<void> {
    this.subject.next({ ...this.subject.getValue(), loading: true });
    const url =
      `https://jsonplaceholder.typicode.com/posts` +
      (userId ? `?userId=${userId}` : '');

    return this.httpClient
      .get<Post[]>(url)
      .pipe(
        map(response => this.subject.next({ posts: response, loading: false }))
      );
  }

  getPosts(term: string) {
    const filterFunction = (post: Post) =>
      !term || post.title.toLowerCase().includes(term.toLowerCase());

    return this.posts$.pipe(map(products => products.filter(filterFunction)));
  }
}