import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';

@Injectable()
export class HotelService {
    constructor(private httpClient: HttpClient) {
    }

    getHotels(): Observable<any> {
        return this.httpClient.get('http://localhost:3000/api/get-hotels');
    }
    etlProcess(subpages): Observable<any> {
        const params = {'subpages': +subpages};
        return this.httpClient.get('http://localhost:3000/api/etl-process', {params: params});
    }
    extractHotels(subpages): Observable<any> {
        const params = {'subpages': +subpages};
        return this.httpClient.get<any>('http://localhost:3000/api/extract-data',  {params: params});
    }
    transformHotels(): Observable<any> {
        return this.httpClient.get<any>('http://localhost:3000/api/transform-data');
    }
    loadHotels(): Observable<any> {
        return this.httpClient.get<any>('http://localhost:3000/api/load-data');
    }
    exportToCsv(): Observable<any> {
        return this.httpClient.get<any>('http://localhost:3000/api/export-data-to-csv');
    }
    clearDatabase(): Observable<any> {
        return this.httpClient.get<any>('http://localhost:3000/api/clear-database');
    }
}
