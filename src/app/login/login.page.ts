import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  passwordInputType: boolean;
  passwordIcon?: string = 'eye';
  passwordColor: string;

  isSubmitted = false;
  signInForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthenticationService,
    ) { }


  get fc() {
    return this.signInForm.controls;
  }

  get fv() {
    return this.signInForm.value;
  }

  ngOnInit() {
  }

  showPassword() {
    this.passwordInputType = !this.passwordInputType;

    if (this.passwordIcon === 'eye') {
      this.passwordIcon = 'eye-off';
      this.passwordColor = 'primary';
    } else {
      this.passwordIcon = 'eye';
      this.passwordColor = 'medium';
    }
  }


  onSignIn() {
    this.isSubmitted = true;

    if (this.signInForm.valid) {
      this.authentication();
    }
  }

  async authentication() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.authService.signIn(this.fv).subscribe(
      async (res) => {
        await loading.dismiss();
        this.router.navigateByUrl('/dashboard');
      },
      async (err) => {
        await loading.dismiss();
        this.presentToast(err.error.messages.error);
      }
    );
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({
      message: `${msg}`,
      duration: 2000,
      color: 'danger',
    });
    toast.present();
  }


}
