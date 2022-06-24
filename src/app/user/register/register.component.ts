import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { EmailTaken } from '../validators/email-taken';
import { RegisterValidators } from '../validators/register-validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  constructor(private auth: AuthService, public emailTaken: EmailTaken) {}

  name = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
  });
  email = new FormControl('', {
    validators: [Validators.required, Validators.email],
    asyncValidators: [this.emailTaken.validate],
  });
  password = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
      ),
    ],
  });
  confirmPassword = new FormControl('', {
    validators: [Validators.required],
  });
  age = new FormControl(0, {
    validators: [Validators.required, Validators.min(18), Validators.max(120)],
  });
  phoneNumber = new FormControl('', {
    validators: [Validators.required, Validators.min(13), Validators.max(13)],
  });

  registerForm = new FormGroup(
    {
      name: this.name,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      age: this.age,
      phoneNumber: this.phoneNumber,
    },
    [RegisterValidators.match('password', 'confirmPassword')]
  );
  inSubmission = false;

  showAlert = false;
  alertMsg = 'Please wait! We are registering you...';
  alertColor = 'blue';

  async register() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! We are login you...';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      const user: IUser = {
        name: this.name.value,
        email: this.email.value,
        password: this.password.value,
        age: this.age.value,
        phoneNumber: this.phoneNumber.value,
      };
      await this.auth.createUser(user);
    } catch (error) {
      console.error(error);
      this.alertMsg = 'An unexpected error occurred. Please try again later.';
      this.alertColor = 'red';
      this.inSubmission = false;

      return;
    }
    this.alertMsg = 'You have been logged successfully!';
    this.alertColor = 'green';
  }
}
