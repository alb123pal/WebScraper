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
  requestInfo = '';
  isHiddenFilterOptions = false;
  searchHotel: string;

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
            (error: any) => console.log(error)
        );
    }
    etlProcess() {
        this.isLoading = true;
        this._hotelService.etlProcess(this.subpages).subscribe(
            (data) => {
                this.hotels = data;
                this.isLoading = false;
                console.log(data);
            },
            (error: any) => console.log(error)
        );
    }
    extractData() {
        this.isLoading = true;
        this._hotelService.extractHotels(this.subpages).subscribe(
            (data) => {
                this.isExtractProcessInvoked = true;
                this.isLoading = false;
                console.log('Dane zostały pobrane, liczba znaków do przetworzenia: ', data.dataLength);
            },
            (error: any) => console.log(error)
        );
    }
    transformData() {
        this.isLoading = true;
        this._hotelService.transformHotels().subscribe(
            (data) => {
                this.isLoading = false;
                this.isTransformProcessInvoked = true;
                console.log('Przetworzone dane: ', data);
            },
            (error: any) => console.log(error)
        );
    }
    loadData() {
        this.isLoading = true;
        this._hotelService.loadHotels().subscribe(
            (data) => {
                this.isLoading = true;
                this.isTransformProcessInvoked = false;
                this.isExtractProcessInvoked = false;
                this.hotels = data.allHotels;
                console.log('nowe dane: ', data.newHotels);
            },
            (error: any) => console.log(error)
        );
    }
    exportToCsv() {
        this.isLoading = true;
        this._hotelService.exportToCsv().subscribe(
            (data) => {
                this.isLoading = true;
                console.log('Załadowane dane: ', data);
            },
            (error: any) => console.log(error)
        );
    }
    clearDatabase() {
        this.isLoading = true;
        this._hotelService.clearDatabase().subscribe(
            (data) => {
                this.isLoading = true;
                console.log('Załadowane dane: ', data);
            },
            (error: any) => console.log(error)
        );
    }
}
