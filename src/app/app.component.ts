import { Component, OnInit } from '@angular/core';
import { GoogleSheetsDbService } from 'ng-google-sheets-db';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Entity } from 'src/abstractions/entity';
import { entityMap } from 'src/abstractions/entity-map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  /** List of entities from the database */
  entities = new Observable<Entity[]>();

  /** String used for the search input */
  searchString$ = new BehaviorSubject<string>('');

  /** List of entities after search filter */
  entityList$ = new Observable<Entity[]>();

  /** ID from the google sheets URL */
  readonly SPREADSHEET_ID = '1I5H2dRgRINs6Mkj7KbY0zbhdFbxRGW8cJqzRuNoUFUE';

  /** Name of the spreadsheet */
  readonly SPREADSHEET_NAME = 'entities';

  constructor(
    private googleSheetsDbService: GoogleSheetsDbService
  ) { }

  /** On init lifecycle hook */
  ngOnInit(): void {
    this.getEntities();
    this.filterEntities();
  }
  
  /** Call google sheets service to get entities */
  getEntities() {
    this.entities = this.googleSheetsDbService.get<Entity>(
      this.SPREADSHEET_ID,
      this.SPREADSHEET_NAME,
      entityMap
    );
  }

  /** Filter the list of entities from search string */
  filterEntities() {
    this.entityList$ = combineLatest([
      this.entities,
      this.searchString$.asObservable()
    ]).pipe(
      map(([entities, searchString]) => {
        let filteredList = entities;
        if (searchString.length) {
          filteredList = filteredList.filter(entity => {
            return entity.title.toLocaleLowerCase().includes(searchString.toLocaleLowerCase());
          });
        }
        return filteredList;
      })
    );
  }

  /** Updates search string from form value */
  updateSearchString(input: string) {
    this.searchString$.next(input);
  }
}
