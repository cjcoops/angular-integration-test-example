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
import { MatProgressBar, MatListItem } from '@angular/material';

describe('PostsComponent', () => {
  let spectator: Spectator<PostsComponent>;
  const createComponent = createComponentFactory({
    component: PostsComponent,
    declarations: [],
    imports: [FormsModule, ReactiveFormsModule],
    mocks: [DataService],
    detectChanges: false
  });

  beforeEach(() => (spectator = createComponent()));

  it('should load a list of posts for all users by default', fakeAsync(() => {
    const dataService = spectator.get(DataService);

    dataService.fetch.and.returnValue(
      timer(100).pipe(
        mapTo([
          {
            userId: 1,
            id: 1,
            title: 'First Post',
            body: 'st rerum tempore vitaeequi'
          },
          {
            userId: 2,
            id: 2,
            title: 'Another Post',
            body: 'st rerum tempore vitaeequi'
          }
        ])
      )
    );

    spectator.detectChanges();

    expect(spectator.query(MatProgressBar)).toExist();
    expect(spectator.query(byText('First Post'))).not.toExist();

    spectator.tick(100);

    spectator.detectChanges();

    expect(spectator.query(MatProgressBar)).not.toExist();
    expect(spectator.queryAll(MatListItem).length).toEqual(2);
    expect(spectator.query(byText('First Post'))).toExist();
  }));

  it('should load a list of posts for the selected user', fakeAsync(() => {
    const dataService = spectator.get(DataService);

    dataService.fetch.and.returnValue(
      timer(100).pipe(
        mapTo([
          {
            userId: 1,
            id: 1,
            title: 'My Post',
            body: 'st rerum tempore vitaeequi'
          }
        ])
      )
    );

    spectator.detectChanges();

    spectator.tick(100);

    dataService.fetch.and.returnValue(
      of([
        {
          userId: 2,
          id: 2,
          title: 'Another Post',
          body: 'st rerum tempore vitaeequi'
        }
      ])
    );

    const select = spectator.query(
      byLabel('Filter by user')
    ) as HTMLSelectElement;

    spectator.selectOption(select, '2', { emitEvents: true });

    spectator.detectChanges();

    expect(select).toHaveSelectedOptions('2');

    expect(dataService.fetch).toHaveBeenCalledTimes(2);
    expect(dataService.fetch.calls.allArgs()).toEqual([[null], ['2']]);
    expect(spectator.queryAll(MatListItem).length).toEqual(1);
    expect(spectator.query(byText('First Post'))).not.toExist();
    expect(spectator.query(byText('Another Post'))).toExist();
  }));
});
