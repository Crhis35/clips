import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  map,
  Observable,
  shareReplay,
  delay,
  filter,
  switchMap,
  of,
} from 'rxjs';
import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  private redirect = false;
  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usersCollection = this.db.collection<IUser>('users');
    this.isAuthenticated$ = this.auth.user.pipe(
      map((user) => !!user),
      shareReplay(1)
    );
    this.isAuthenticatedWithDelay$ = this.auth.user.pipe(
      map((user) => !!user),
      shareReplay(1),
      delay(1000)
    );
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((e) => this.route.firstChild),
        switchMap((route) => route?.data ?? of({}))
      )
      .subscribe((data) => {
        this.redirect = data.authOnly ?? false;
      });
  }

  public async createUser(input: IUser) {
    const { email, password } = input;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const userCred = await this.auth.createUserWithEmailAndPassword(
      email,
      password
    );
    await this.usersCollection.doc(userCred.user?.uid).set({
      name: input.name,
      email: input.email,
      age: input.age,
      phoneNumber: input.phoneNumber,
    });

    await userCred.user?.updateProfile({
      displayName: input.name,
    });
  }
  public async signIn(input: Partial<IUser>) {
    const { email, password } = input;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    await this.auth.signInWithEmailAndPassword(email, password);
  }
  public async logout($event?: Event) {
    $event?.preventDefault();

    await this.auth.signOut();
    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }
  }
  public checkEmail(email: string) {
    return this.auth.fetchSignInMethodsForEmail(email);
  }
}
