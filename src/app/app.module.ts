import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { API_KEY } from 'ng-google-sheets-db';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {
      provide: API_KEY,
      useValue: 'AIzaSyC-qTb8hSeyLY4skpHLN34tt7z91H2yeDY'
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
