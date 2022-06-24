import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  isAuthenticated = false;

  constructor(private modal: ModalService, public auth: AuthService) {
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
  }
  ngOnInit(): void {}

  openModal($event: Event) {
    $event.preventDefault();
    this.modal.toggleModal('auth');
  }
  async logout($event: Event) {
    await this.auth.logout($event);
  }
}
