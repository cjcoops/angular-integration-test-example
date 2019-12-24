import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  Spectator,
  createComponentFactory,
  byText,
  byLabel,
  SpectatorElement
} from '@ngneat/spectator';
import { timer, of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { mapTo } from 'rxjs/operators';
import { PostsComponent } from './posts.component';
import { DataService } from '../data.service';
import { MatProgressBar, MatListItem } from '@angular/material';

describe('PostsComponent', () => {
  const createComponent = createComponentFactory({
    component: PostsComponent,
    declarations: [],
    imports: [FormsModule, ReactiveFormsModule],
    mocks: [DataService],
    detectChanges: false
  });

  it('should load a list of posts for all users by default', fakeAsync(() => {
    // create the test component
    const spectator = createComponent();

    // get the mocked instance of the DataService
    const dataService = spectator.get(DataService);

    // mock the fetch function to wait 100ms and return 2 posts
    dataService.fetch.and.returnValue(
      timer(100).pipe(
        mapTo([
          {
            userId: 1,
            id: 1,
            title: 'First Post'
          },
          {
            userId: 2,
            id: 2,
            title: 'Another Post'
          }
        ])
      )
    );

    // run ngOnInit
    spectator.detectChanges();

    // assert the the progress bar is showing
    expect(spectator.query(MatProgressBar)).toExist();
    expect(spectator.query(byText('First Post'))).not.toExist();

    // get the user select element
    const select = spectator.query(
      byLabel('Filter by user')
    ) as HTMLSelectElement;

    // assert that it is showing 'All' by default
    expect(select).toHaveSelectedOptions(
      spectator.query(byText('All')) as HTMLOptionElement
    );

    // advance the time 100ms to simulate the HTTP request being made
    spectator.tick(100);

    // assert that the progress bar is not showing and that both our posts are showing
    expect(spectator.query(MatProgressBar)).not.toExist();
    expect(spectator.queryAll(MatListItem).length).toEqual(2);
    expect(spectator.query(byText('First Post'))).toExist();

    expect(dataService.fetch).toHaveBeenCalledTimes(1);
  }));

  it('should filter the posts for the selected user', fakeAsync(() => {
    const spectator = createComponent();
    const dataService = spectator.get(DataService);

    dataService.fetch.and.returnValue(
      timer(100).pipe(
        mapTo([
          {
            userId: 1,
            id: 1,
            title: 'First Post'
          },
          {
            userId: 2,
            id: 2,
            title: 'Another Post'
          }
        ])
      )
    );

    spectator.detectChanges();

    spectator.tick(100);

    const select = spectator.query(
      byLabel('Filter by user')
    ) as HTMLSelectElement;

    spectator.selectOption(
      select,
      spectator.query(byText('User 2')) as HTMLOptionElement
    );

    expect(spectator.queryAll(MatListItem).length).toEqual(1);
    expect(spectator.query(byText('First Post'))).not.toExist();
    expect(spectator.query(byText('Another Post'))).toExist();
  }));

  it('should filter the posts by a search term', fakeAsync(() => {
    const spectator = createComponent();
    const dataService = spectator.get(DataService);

    dataService.fetch.and.returnValue(
      timer(100).pipe(
        mapTo([
          {
            userId: 1,
            id: 1,
            title: 'First Post'
          },
          {
            userId: 2,
            id: 2,
            title: 'Another Post'
          }
        ])
      )
    );

    spectator.detectChanges();

    spectator.tick(100);

    const input = spectator.query(byLabel('Filter by title'));

    spectator.typeInElement('first', input);

    spectator.tick(300);

    expect(spectator.queryAll(MatListItem).length).toEqual(1);
    expect(spectator.query(byText('First Post'))).toExist();
    expect(spectator.query(byText('Another Post'))).not.toExist();
  }));
});
