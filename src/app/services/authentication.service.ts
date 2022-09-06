import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage-angular';


const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';
const USER_ROLE_KEY = 'USER_ROLE';
const STATUS_COMPLETENESS_KEY = 'STATUS_COMPLETENESS';
const TOKEN_KEY = 'my-token';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  isAuthenticated = new BehaviorSubject<boolean>(null);
  isCompleteInitForm = new BehaviorSubject<boolean>(null);
  isUserRole = new BehaviorSubject<boolean>(null);

  currentAccessToken = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: Storage
  ) {
    this.storage.create();
    this.loadToken();
    this.loadInitForm();
  }

  async loadToken() {
    const token = await this.storage.get(ACCESS_TOKEN_KEY);
    if (token) {
      this.currentAccessToken = token;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  async loadInitForm() {
    const isCompleteInitForm = await this.storage.get(STATUS_COMPLETENESS_KEY);
    this.isCompleteInitForm.next(isCompleteInitForm);
  }

  signIn(credentials: { email; password }): Observable<any> {
    return this.http
      .post(`${environment.apiUrl}admin/auth/login`, credentials)
      .pipe(
        switchMap(
          (tokens: { accessToken; refreshToken }) => {
            this.currentAccessToken = tokens.accessToken;

            const storeAccess = this.storage.set(
              ACCESS_TOKEN_KEY,
              tokens.accessToken
            );
            const storeRefresh = this.storage.set(
              REFRESH_TOKEN_KEY,
              tokens.refreshToken
            );

            return from(
              Promise.all([storeAccess, storeRefresh])
            );
          }
        ),
        tap((res) => {
          this.isAuthenticated.next(true);
        })
      );
  }

  signOut() {
    const deleteAccess = this.storage.remove(ACCESS_TOKEN_KEY);
    const deleteRefresh = this.storage.remove(REFRESH_TOKEN_KEY);
    const deleteStatusCompleteness = this.storage.remove(STATUS_COMPLETENESS_KEY);
    const deleteUserRole = this.storage.remove(USER_ROLE_KEY);

    this.currentAccessToken = null;
    this.isAuthenticated.next(false);

    this.router.navigateByUrl('/login', { replaceUrl: true });
    return from(Promise.all([deleteAccess, deleteRefresh, deleteStatusCompleteness, deleteUserRole]));
  }

  getNewAccessToken() {
    const getRefreshToken = from(this.storage.get(REFRESH_TOKEN_KEY));

    return getRefreshToken.pipe(
      switchMap((refreshToken) => {
        if (refreshToken) {
          const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${refreshToken}`,
            }),
          };
          return this.http.get(
            `${environment.apiUrl}admin/auth/refresh`,
            httpOptions
          );
        } else {
          return of(null);
        }
      })
    );
  }

  storeAccessToken(accessToken) {
    this.currentAccessToken = accessToken;
    return from(this.storage.set(ACCESS_TOKEN_KEY, accessToken));
  }

  logout(){
    this.isAuthenticated.next(false);
    // return Storage.remove({key: TOKEN_KEY});
  }

  classroomData() {
    return this.http
    .get(`${environment.apiUrl}classroom`)
  }

  profilData() {
    return this.http
    .get(`${environment.apiUrl}admin/profile`)
  }

}

 