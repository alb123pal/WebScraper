import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';

@Injectable()
export class HotelService {
    constructor(private httpClient: HttpClient) {
    }

    getHotels(): Observable<any> {
        return this.httpClient.get<any>('http://localhost:3000/api/etl-process');
    }
    extractHotels(): Observable<any> {
        return this.httpClient.get<any>('http://localhost:3000/api/extract-data');
    }
}
