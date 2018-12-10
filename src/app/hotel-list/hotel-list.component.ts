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
}
