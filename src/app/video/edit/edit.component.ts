import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  id = 'editClip';
  inSubmission = false;
  showAlert = false;
  alertMsg = 'Please wait! Your clip is being uploaded...';
  alertColor = 'blue';

  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter();

  title = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });

  clipID = new FormControl('', {
    nonNullable: true,
  });

  editForm = new FormGroup({
    title: this.title,
    id: this.clipID,
  });

  constructor(private modal: ModalService, private clipService: ClipService) {}

  ngOnChanges(): void {
    if (!this.activeClip) {
      return;
    }
    this.clipID.setValue(this.activeClip.docID ?? '');
    this.title.setValue(this.activeClip.title);
    this.inSubmission = false;
    this.showAlert = false;
  }

  ngOnInit(): void {
    this.modal.register(this.id);
  }

  ngOnDestroy(): void {
    this.modal.unregister(this.id);
  }
  async submit() {
    if (!this.activeClip) {
      return;
    }
    this.showAlert = true;
    this.alertMsg = 'Please wait! Updating your clip...';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);

      this.activeClip.title = this.title.value;
      this.update.emit(this.activeClip);

      this.alertColor = 'green';
      this.alertMsg = 'Your clip has been uploaded!';
    } catch (error) {
      console.error(error);
      this.alertMsg = 'An unexpected error occurred. Please try again later.';
      this.alertColor = 'red';
      this.inSubmission = false;

      return;
    }
  }
}
