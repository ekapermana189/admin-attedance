import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../services/photo.service';


import { LoadingController, Platform, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-add-parents',
  templateUrl: './add-parents.page.html',
  styleUrls: ['./add-parents.page.scss'],
})
export class AddParentsPage implements OnInit {
 

  constructor(public photoService: PhotoService,
    private plt: Platform,
		
		private loadingCtrl: LoadingController,
		private toastCtrl: ToastController) { }

  ngOnInit() {
  
  }

	

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }



}
