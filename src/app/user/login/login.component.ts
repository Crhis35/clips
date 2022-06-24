import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(private auth: AuthService) {}
  credentials = {
    email: '',
    password: '',
  };
  inSubmission = false;
  showAlert = false;
  alertMsg = 'Please wait! We are registering you...';
  alertColor = 'blue';

  ngOnInit(): void {}
  async login() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! We are registering you...';
    this.alertColor = 'blue';
    this.inSubmission = true;
    try {
      await this.auth.signIn(this.credentials);
    } catch (error) {
      console.error(error);
      this.alertMsg = 'An unexpected error occurred. Please try again later.';
      this.alertColor = 'red';
      this.inSubmission = false;

      return;
    }
  }
}
