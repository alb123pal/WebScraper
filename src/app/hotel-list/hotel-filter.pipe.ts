import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'hotelFilter'
})
export class HotelFilterPipe implements PipeTransform {
    transform(hotels, searchHotel) {
        if (!hotels || ! searchHotel) {
            return hotels;
        }
        return hotels.filter(product =>
            product.name.toLowerCase().indexOf(searchHotel.toLowerCase()) !== -1);

    }
}