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

  private posts = new BehaviorSubject<Post[]>(null);
  private loading = new BehaviorSubject<boolean>(true);

  posts$ = this.posts.asObservable();
  loading$ = this.loading.asObservable();

  // call the DataService which is responsible for making HTTP requests and updates the posts and loading states
  load() {
    this.loading.next(true);

    return this.dataService.fetch().pipe(
      tap(response => {
        this.posts.next(response);
        this.loading.next(false);
      })
    );
  }

  // return an observable with the filtered posts
  getPosts(searchTerm: string, userId: number) {
    const filterFunction = (post: Post) =>
      (!searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!userId || post.userId === userId);

    return this.posts$.pipe(map(posts => posts.filter(filterFunction)));
  }
}
