import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

import { nanoid } from 'nanoid';
import { combineLatest, forkJoin, switchMap } from 'rxjs';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from '../../services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnDestroy {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  inSubmission = false;
  showAlert = false;
  alertMsg = 'Please wait! Your clip is being uploaded...';
  alertColor = 'blue';
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;
  task: AngularFireUploadTask | null = null;
  screenshots: string[] = [];
  selectedScreenShoot = '';
  screenshotTask?: AngularFireUploadTask;

  title = new FormControl('', [Validators.required, Validators.minLength(3)]);

  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }

    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    this.screenshots = await this.ffmpegService.getScreenshots(this.file);

    this.selectedScreenShoot = this.screenshots[0];
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  async uploadFile() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your clip is being uploaded...';
    this.alertColor = 'green';
    this.inSubmission = true;
    this.showPercentage = true;

    const clipFileName = nanoid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenShoot
    );
    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    const screenshotRef = this.storage.ref(screenshotPath);

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;
      if (!clipProgress || !screenshotProgress) {
        return;
      }

      this.percentage = ((clipProgress + screenshotProgress) as number) / 200;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipURL, screenshotURL] = urls;
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value as string,
            fileName: `${clipFileName}.mp4`,
            url: clipURL,
            screenshotURL,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            screenshotFileName: `${clipFileName}.png`,
          };
          const clipDocRef = await this.clipService.createClip(clip);

          this.showPercentage = false;
          this.alertColor = 'green';
          this.alertMsg = 'Your clip has been uploaded!';

          setTimeout(() => {
            this.router.navigate(['/clip', clipDocRef.id]);
          }, 1000);
        },
        error: (err) => {
          this.uploadForm.enable();
          this.alertMsg = 'Something went wrong! Please try again.';
          this.alertColor = 'red';
          this.inSubmission = true;
          this.showPercentage = false;
          console.error(err);
        },
      });
  }
}
