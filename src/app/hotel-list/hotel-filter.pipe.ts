import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'hotelFilter'
})
export class HotelFilterPipe implements PipeTransform {
    transform(hotels, filter: {[key: string]: any }) {
        if (!hotels || !filter) {
            return hotels;
        }
        if (filter['searchHotel'] !== undefined) {
            const filteredProduct = hotels.filter( (hotel: any) => {
                return hotel.name.toLowerCase().indexOf(filter.searchHotel.toLowerCase()) !== -1;
            });
            return filteredProduct;
        } else if (filter['orderHotelByRating'] !== undefined) {
            if (filter['orderFromTheHighestRating']) {
                return hotels.sort((hotelA, hotelB) => {
                    return hotelB.rating - hotelA.rating;
                });
            } else {
                return hotels.sort((hotelA, hotelB) => {
                    return hotelA.rating - hotelB.rating;
                });
            }
        }
    }
}
