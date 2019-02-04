import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {HttpClient, HttpHandler} from '@angular/common/http';
import { By } from '@angular/platform-browser';


import { HotelListComponent } from './hotel-list.component';
import { HotelService } from '../services/hotel.service';
import {AppComponent} from '../app.component';

describe('HotelListComponent', () => {
  let component: HotelListComponent;
  let fixture: ComponentFixture<HotelListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        // imports: [HotelService],
        declarations: [ HotelListComponent ],
        providers: [HotelService, HttpClient, HttpHandler],
        schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
      const fixture2 = TestBed.createComponent(HotelListComponent);
      fixture2.detectChanges();
      const compiled = fixture2.debugElement.nativeElement;
    console.log('compiled: ', compiled.querySelector('p').textContent);
    expect(component).toBeTruthy();
  });
});
