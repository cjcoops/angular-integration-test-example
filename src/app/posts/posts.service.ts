import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { map, tap } from 'rxjs/operators';
import { Post } from './post.model';
import { BehaviorSubject } from 'rxjs';

export interface PostsState {
  posts: Post[];
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  constructor(private dataService: DataService) {}

  private subject = new BehaviorSubject<PostsState>({
    posts: null,
    loading: true
  });

  posts$ = this.subject.asObservable().pipe(map(state => state.posts));
  loading$ = this.subject.asObservable().pipe(map(state => state.loading));

  load() {
    this.subject.next({ ...this.subject.getValue(), loading: true });

    return this.dataService
      .fetch()
      .pipe(
        tap(response => this.subject.next({ posts: response, loading: false }))
      );
  }

  getPosts(searchTerm: string, userId: number) {
    const filterFunction = (post: Post) =>
      (!searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!userId || post.userId === userId);

    return this.posts$.pipe(map(products => products.filter(filterFunction)));
  }
}
