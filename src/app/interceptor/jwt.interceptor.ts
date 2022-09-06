/* eslint-disable @typescript-eslint/naming-convention */
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, switchMap, filter, take } from 'rxjs/operators';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  isRefreshingToken = false;

  constructor(
    private authService: AuthenticationService,
    private toastCtrl: ToastController,
    private alertController: AlertController
  ) {}

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({
      message: `${msg}`,
      duration: 2000,
      color: 'danger',
    });
    toast.present();
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.isInBlockedList(request.url)) {
      return next.handle(request);
    } else {
      return next.handle(this.addToken(request)).pipe(
        catchError((err) => {
          if (err instanceof HttpErrorResponse) {
            switch (err.status) {
              case 401:
                return this.handle401Error(request, next);
              case 403:
                return this.handle403Error(err);
              default:
                return throwError(err);
            }
          } else {
            return throwError(err);
          }
        })
      );
    }
  }

  private isInBlockedList(url: string): boolean {
    if (
      url === `${environment.apiUrl}admin/auth/login` ||
      url === `${environment.apiUrl}admin/auth/logout`
    ) {
      return true;
    } else {
      return false;
    }
  }

  private addToken(req: HttpRequest<any>) {
    const splitURL = req.url.split('/');
    const lastURL = splitURL[splitURL.length - 1];

    if (this.authService.currentAccessToken && lastURL !== 'refresh') {
      return req.clone({
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.currentAccessToken}`,
        }),
      });
    } else {
      return req;
    }
  }

  private async handle403Error(err) {
    const alert = await this.alertController.create({
      header: 'Peringatan!',
      message: 'Akun sudah tidak dapat digunakan, harap hubungi admin...',
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          handler: () => { this.authService.signOut(); }
        }
      ]
    });

    await alert.present();
    await alert.onDidDismiss();
    return of(null);
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<any> {
    if (!this.isRefreshingToken) {
      this.tokenSubject.next(null);
      this.isRefreshingToken = true;
      this.authService.currentAccessToken = null;

      return this.authService.getNewAccessToken().pipe(
        switchMap((token: any) => {
          if (token) {
            const accessToken = token.accessToken;
            return this.authService.storeAccessToken(accessToken).pipe(
              switchMap((_) => {
                this.tokenSubject.next(accessToken);
                return next.handle(this.addToken(request));
              })
            );
          } else {
            return of(null);
          }
        }),
        finalize(() => {
          this.isRefreshingToken = false;
        })
      );
    } else {
      return this.tokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap(() => next.handle(this.addToken(request)))
      );
    }
  }
}