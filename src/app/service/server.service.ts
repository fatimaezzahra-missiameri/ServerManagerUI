import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, Subscriber, tap, throwError } from 'rxjs';
import { Status } from '../enum/status.enum';
import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private readonly apiUrl: string = 'http://localhost:8080/api';
  private readonly baseUrl: string = 'servers'

  constructor(private http: HttpClient) {}

  servers$ = <Observable<CustomResponse>>(
    this.http
      .get<CustomResponse>(`${this.apiUrl}/${this.baseUrl}/list`)
      .pipe(tap(console.log), catchError(this.handleError))
  );

  server$ = (serverId: number) =>
    <Observable<CustomResponse>>(
      this.http
        .get<CustomResponse>(`${this.apiUrl}/${this.baseUrl}/${serverId}`)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  save$ = (server: Server) =>
    <Observable<CustomResponse>>(
      this.http
        .post<CustomResponse>(`${this.apiUrl}/${this.baseUrl}/save`, server)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  ping$ = (ipAddress: string) =>
    <Observable<CustomResponse>>(
      this.http
        .get<CustomResponse>(`${this.apiUrl}/${this.baseUrl}/${ipAddress}/ping`)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  filter$ = (status: Status, response: CustomResponse) =>
    <Observable<CustomResponse>>new Observable<CustomResponse>((subscriber) => {
      console.log(response);
      subscriber.next(
        status === Status.ALL
          ? { ...response, message: `Servers filtered by ${status} status` }
          : {
              ...response,
              message:
                response.data.servers.filter((s) => s.status === status)
                  .length > 0
                  ? `Servers filtered by ${
                      status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'
                    } status`
                  : `No servers of ${status} found!`,
              data: { servers: response.data.servers.filter((s) => s.status === status) }
            }
      );
      subscriber.complete();
    });

  delete$ = (serverId: number) =>
    <Observable<CustomResponse>>(
      this.http
        .get<CustomResponse>(`${this.apiUrl}/${this.baseUrl}/${serverId}/delete`)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(
      () => new Error(`An error occured - Error code : ${error.status}`)
    );
  }
}
