import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { PostsService } from './posts.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';
import { Post } from './post.model';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit, OnDestroy {
  searchTermControl = new FormControl('');
  userFilterControl = new FormControl(null);
  posts$: Observable<Post[]>;
  loading$: Observable<boolean>;

  constructor(private service: PostsService) {}

  ngOnInit(): void {
    this.userFilterControl.valueChanges
      .pipe(
        startWith(null),
        switchMap(userId => this.service.load(+userId)),
        untilDestroyed(this)
      )
      .subscribe();

    this.posts$ = this.searchTermControl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      switchMap(term => this.service.getPosts(term))
    );

    this.loading$ = this.service.loading$;
  }

  ngOnDestroy(): void {}
}
