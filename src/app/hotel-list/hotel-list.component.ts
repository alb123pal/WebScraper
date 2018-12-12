import { Component, OnInit } from '@angular/core';
import { HotelService } from '../services/hotel.service';

@Component({
  selector: 'app-hotel-list',
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.scss']
})
export class HotelListComponent implements OnInit {

  constructor(private _hotelService: HotelService) { }

  ngOnInit() {
  }

    getHotels() {
        this._hotelService.getHotels().subscribe(
            (data) => {
                console.log(data);
            },
            (error: any) => console.log(error)
        );
    }
    downloadData() {
        this._hotelService.extractHotels().subscribe(
            (data) => {
                console.log('Dane zostały pobrane, liczba znaków do przetworzenia: ', data.dataLength);
            },
            (error: any) => console.log(error)
        );
    }
}
