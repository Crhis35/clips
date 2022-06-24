import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class RegisterValidators {
  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(controlName);
      const confirmPassword = control.get(matchingControlName);

      if (!password || !confirmPassword) {
        return { controlNotFound: true };
      }
      const isMatch = password.value === confirmPassword.value;
      if (!isMatch) {
        const error = { noMatch: true };
        confirmPassword.setErrors(error);

        return error;
      }

      return null;
    };
  }
}
