import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  public people: any;
  profile : any;

  constructor(
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile(){
   
    this.authService.profilData().
    subscribe((res)=>{
      console.log(res['data']);
      this.profile = res['data']
  })
  }

}
