import {Component, Input, OnInit} from '@angular/core';
import { HotelService } from '../services/hotel.service';
import { HotelFilterPipe } from '../hotel-list/hotel-filter.pipe';


@Component({
  selector: 'app-hotel-list',
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.scss']
})
export class HotelListComponent implements OnInit {

  constructor(private _hotelService: HotelService) { }
  hotels = [];
  subpages = 1;
  isExtractProcessInvoked = false;
  isTransformProcessInvoked = false;
  isLoading = false;
  isError = false;
  isDisplayNotification = false;
  captionInfo = '';
  requestInfo = '';
  hotelFilter: any;
  isHiddenFilterOptions = false;
  searchHotel: string;
  orderFromTheHighestRating = false;

  ngOnInit() {
      this.getHotels();
      document.body.style.margin = '0';
  }

    showHideFilterOptions() {
        this.isHiddenFilterOptions = !this.isHiddenFilterOptions;
    }
    setNumberSubpages(event) {
      this.subpages = event.target.value;
    }
    getHotels() {
      this.isLoading = true;
        this._hotelService.getHotels().subscribe(
            (data) => {
                this.hotels = data;
                this.isLoading = false;
                console.log(data);
            },
            (error: any) => this.displayNotification('Wystąpił błąd podczas połączenia z serwerem', true)
        );
    }
    etlProcess() {
        this.isLoading = true;
        this._hotelService.etlProcess(this.subpages).subscribe(
            (data) => {
                this.displayNotification(`Dane zostały pobrane pomyślnie. Liczba nowych hoteli: ${data.newHotels.length}`);
                this.hotels = data.allHotels;
                this.isLoading = false;
            },
            (error: any) => this.displayNotification('Wystąpił błąd podczas połączenia z serwerem', true)
        );
    }
    exportToText(id) {
        this.isLoading = true;
        console.log(id);
        this._hotelService.exportToTxt(id).subscribe(
            () => {
                this.displayNotification('Dane zostały pomyślnie wyeksportowane do pliku txt');
                this.isLoading = false;
                console.log('Hotel exported to JSON');
            },
            (error: any) => this.displayNotification('Dane zostały pobrane pomyślnie', true)
        );
    }
    extractData() {
        this.isLoading = true;
        this._hotelService.extractHotels(this.subpages).subscribe(
            (data) => {
                this.displayNotification(`Dane zostały pobrane pomyślnie. Liczba znaków do przetworzenia: ${data.dataLength}`);
                this.isExtractProcessInvoked = true;
                this.isLoading = false;
                console.log('Dane zostały pobrane, liczba znaków do przetworzenia: ', data.dataLength);
            },
            (error: any) => this.displayNotification('Wystąpił błąd podczas połączenia z serwerem', true)
        );
    }
    transformData() {
        this.isLoading = true;
        this._hotelService.transformHotels().subscribe(
            (data) => {
                this.isLoading = false;
                this.displayNotification(`Dane zostały pommyślnie przetworzone. Liczba przetworzonych hoteli: ${data.length}`);
                this.isTransformProcessInvoked = true;
                console.log('Przetworzone dane: ', data);
            },
            (error: any) => this.displayNotification('Wystąpił błąd podczas połączenia z serwerem', true)
        );
    }
    loadData() {
        this.isLoading = true;
        this._hotelService.loadHotels().subscribe(
            (data) => {
                this.displayNotification(`Dane zostały załadowane pomyślnie. Liczba nowych hoteli: ${data.newHotels.length}`);
                this.isLoading = false;
                this.isTransformProcessInvoked = false;
                this.isExtractProcessInvoked = false;
                this.hotels = data.allHotels;
            },
            (error: any) => this.displayNotification('Wystąpił błąd podczas połączenia z serwerem', true)
        );
    }
    exportToCsv() {
        this.isLoading = true;
        this._hotelService.exportToCsv().subscribe(
            (data) => {
                this.displayNotification('Dane zostały pomyślnie wyeksportowane do pliku csv');
                this.isLoading = false;
                console.log('Załadowane dane: ', data);
            },
            (error: any) => this.displayNotification('Wystąpił błąd podczas połączenia z serwerem', true)
        );
    }
    clearDatabase() {
        this.isLoading = true;
        this._hotelService.clearDatabase().subscribe(
            (data) => {
                this.displayNotification('Baza została wyczyszczona');
                this.isLoading = false;
                this.hotels = [];
            },
            (error: any) => this.displayNotification('Wystąpił błąd podczas połączenia z serwerem', true)
        );
    }
    displayNotification(info, isError = false) {
      this.isDisplayNotification = true;
      this.isError = isError;
      this.captionInfo = info;
      this.isLoading = false;
      setTimeout( () => {
          this.isDisplayNotification = false;
          this.captionInfo = '';
      }, 3000);
    }
    searchHotel(event) {
        this.hotelFilter = {};
        if (event.target.value === '') {
            this.hotelFilter = {};
        }
        this.hotelFilter = {
            'searchHotel': event.target.value
        };
    }
    orderByRating() {
      this.orderFromTheHighestRating = !this.orderFromTheHighestRating;
        this.hotelFilter = {};
        this.hotelFilter = {
            'orderHotelByRating': true,
            'orderFromTheHighestRating': this.orderFromTheHighestRating
        };
    }
}
