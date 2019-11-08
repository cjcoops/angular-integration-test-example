import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  Spectator,
  createComponentFactory,
  byText,
  byLabel
} from '@ngneat/spectator';
import { timer, of } from 'rxjs';
import { fakeAsync } from '@angular/core/testing';
import { mapTo } from 'rxjs/operators';
import { PostsComponent } from './posts.component';
import { DataService } from '../data.service';
import { MatProgressBar } from '@angular/material';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient, HttpBackend } from '@angular/common/http';

describe('PostsComponent', () => {
  let spectator: Spectator<PostsComponent>;
  const createComponent = createComponentFactory({
    component: PostsComponent,
    declarations: [],
    imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
    mocks: [DataService],
    detectChanges: false
  });

  beforeEach(() => (spectator = createComponent()));

  it('should load a list of posts for the selected user', fakeAsync(() => {
    const httpTestingController = spectator.get(HttpTestingController);

    spectator.detectChanges();

    expect(spectator.query(MatProgressBar)).toExist();
    expect(spectator.query(byText('My Post'))).not.toExist();

    const mockRequestAll = httpTestingController.expectOne(
      'https://jsonplaceholder.typicode.com/posts'
    );
    expect(mockRequestAll.request.method).toEqual('GET');

    mockRequestAll.flush([
      {
        userId: 1,
        id: 1,
        title: 'My post',
        body: 'st rerum tempore vitaeequi'
      }
    ]);

    spectator.detectChanges();

    expect(spectator.query(MatProgressBar)).not.toExist();
    expect(spectator.query(byText('My Post'))).toExist();

    const select = spectator.query(
      byLabel('Filter by user')
    ) as HTMLSelectElement;

    spectator.selectOption(select, '2', { emitEvents: true });

    const mockRequestUser2 = httpTestingController.expectOne(
      'https://jsonplaceholder.typicode.com/posts?userId=2'
    );

    expect(mockRequestUser2.request.method).toEqual('GET');

    mockRequestUser2.flush([
      {
        userId: 2,
        id: 2,
        title: 'Another post',
        body: 'st rerum tempore vitaeequi'
      }
    ]);

    spectator.detectChanges();

    expect(select).toHaveSelectedOptions('2');

    expect(spectator.query(byText('Another Post'))).toExist();


    httpTestingController.verify();
  }));

  xit('should call the api with user id in the query params', fakeAsync(() => {
    const dataService = spectator.get(DataService);

    dataService.fetch.and.returnValue(
      timer(100).pipe(
        mapTo([
          {
            userId: 1,
            id: 1,
            title: 'My post',
            body: 'st rerum tempore vitaeequi'
          }
        ])
      )
    );

    spectator.detectChanges();

    spectator.tick(100);

    dataService.fetch.and.returnValue(of([]));

    const select = spectator.query(
      byLabel('Filter by user')
    ) as HTMLSelectElement;

    spectator.selectOption(select, '2', { emitEvents: true });

    spectator.detectChanges();

    expect(select).toHaveSelectedOptions('2');

    expect(dataService.fetch).toHaveBeenCalledTimes(2);
    expect(dataService.fetch.calls.allArgs()).toEqual([[0], [2]]);
  }));
});
