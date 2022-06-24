import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class EmailTaken implements AsyncValidator {
  constructor(private auth: AuthService) {}
  validate = async (
    control: AbstractControl<string>
  ): Promise<ValidationErrors | null> => {
    const email = control.value;
    const existEmail = await this.auth.checkEmail(email);

    return existEmail?.length ? { emailTaken: true } : null;
  };
}
