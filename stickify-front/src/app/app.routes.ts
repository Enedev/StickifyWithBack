import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { LogInComponent } from './pages/log-in/log-in.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './shared/guards/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlaylistComponent } from './pages/playlist/playlist.component';
import { UploadComponent } from './pages/upload/upload.component';
import { AuthorsComponent } from './pages/authors/authors.component';

export const routes: Routes = [
    {
        path: '',
        component: WelcomeComponent
    },
    {
        path: 'sign-in',
        component: SignInComponent
    },
    {
        path: 'log-in',
        component: LogInComponent
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuard]
    },
    {
        path: 'playlist',
        component: PlaylistComponent,
        canActivate: [authGuard]

    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard]

    },
    {
        path: 'upload',
        component: UploadComponent,
        canActivate: [authGuard]

    },
    {
        path: 'authors',
        component: AuthorsComponent,
        canActivate: [authGuard]

    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];

