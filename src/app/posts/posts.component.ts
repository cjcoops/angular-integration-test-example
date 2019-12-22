import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { PostsService } from './posts.service';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';
import { Post } from './post.model';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
  searchTermControl = new FormControl('');
  userFilterControl = new FormControl(null);
  posts$: Observable<Post[]>;
  loading$: Observable<boolean>;

  constructor(private service: PostsService) {}

  ngOnInit(): void {
    // request the posts data
    this.service.load().subscribe();

    // listen for changes in the search term and the user filter and get the filtered posts
    this.posts$ = combineLatest(
      this.searchTermControl.valueChanges.pipe(
        debounceTime(300),
        startWith('')
      ),
      this.userFilterControl.valueChanges.pipe(startWith(null))
    ).pipe(
      switchMap(([searchTerm, userId]) => {
        return this.service.getPosts(searchTerm, userId);
      })
    );

    // loading state observable
    this.loading$ = this.service.loading$;
  }
}
