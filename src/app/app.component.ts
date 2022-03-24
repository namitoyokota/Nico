import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { GoogleSheetsDbService } from 'ng-google-sheets-db';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Entity } from 'src/abstractions/entity';
import { entityMap } from 'src/abstractions/entity-map';
import { Repository } from 'src/abstractions/repo';
import { Types } from 'src/abstractions/type';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  /** List of entities from the database */
  entities = new BehaviorSubject<Entity[]>([]);

  repositories$ = new BehaviorSubject<any[]>([]);

  /** String used for the search input */
  searchString$ = new BehaviorSubject<string>('');

  /** List of entities after search filter */
  entityList$ = new Observable<Entity[]>();

  /** List of types from the enum */
  typeList: string[] = [];

  /** How long the search took in ms */
  searchSpeed: number = 0;

  /** ID from the google sheets URL */
  readonly SPREADSHEET_ID = '1I5H2dRgRINs6Mkj7KbY0zbhdFbxRGW8cJqzRuNoUFUE';

  /** Name of the spreadsheet */
  readonly SPREADSHEET_NAME = 'entities';

  /** Endpoint to get the list of projects */
  readonly GITHUB_ENDPOINT = 'https://api.github.com/users/namitoyokota/repos';

  constructor(
    private httpClient: HttpClient,
    private googleSheetsDbService: GoogleSheetsDbService
  ) { }

  /** On init lifecycle hook */
  ngOnInit(): void {
    this.typeList = Object.values(Types);

    this.typeList.map(type => {
      this.getEntities(type);
    });
  
    this.filterEntities();
    this.getRepos();
  }
  
  /** Call Google Sheets Service to get entities */
  getEntities(spreadsheetName: string) {
    this.googleSheetsDbService.get<Entity>(
      this.SPREADSHEET_ID,
      spreadsheetName,
      entityMap
    ).subscribe(entities =>
      this.entities.next(
        this.entities.getValue().concat(entities)
      )
    );
  }

  /** Call Github API to get the list of repositories */
  getRepos() {
    this.httpClient.get<Repository[]>(
      this.GITHUB_ENDPOINT
    ).subscribe(repos => {
      this.repositories$.next(
        repos.map(repo => {
          return {
            favorite: repo.stargazers_count ? 'TRUE' : 'FALSE',
            type: 'Project',
            title: repo.name,
            keywords: repo.topics.toString(),
            description: repo.description,
            url: repo.homepage ? repo.homepage : repo.html_url
          } as Entity;
        })
      )
    })
  }

  /** Filter the list of entities from search string */
  filterEntities() {
    this.entityList$ = combineLatest([
      this.entities,
      this.repositories$.asObservable(),
      this.searchString$.asObservable()
    ]).pipe(
      map(([entities, repos, searchString]) => {
        let filteredList = entities.concat(repos);
        if (searchString.length) {
          const startDate = new Date();
          filteredList = filteredList.filter(entity => {
            return entity.type.toLocaleLowerCase().includes(searchString.toLocaleLowerCase()) ||
              entity.title.toLocaleLowerCase().includes(searchString.toLocaleLowerCase()) ||
              entity.description.toLocaleLowerCase().includes(searchString.toLocaleLowerCase()) ||
              entity.keywords.toLocaleLowerCase().includes(searchString.toLocaleLowerCase());
          });
          const endDate = new Date();
          this.searchSpeed = endDate.getTime() - startDate.getTime();
        }
        return filteredList;
      })
    );
  }

  /** Updates search string from form value */
  updateSearchString(input: string) {
    this.searchString$.next(input);
  }

  /** Opens link in a new tab */
  openUrl(url: string) {
    if (url) {
      window.open(url, "_blank");
    }
  }

  /** Parse comma separated keywords into string array */
  parseKeywords(keywords: string) {
    return keywords.split(',');
  }
}
