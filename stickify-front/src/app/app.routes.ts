import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { LogInComponent } from './pages/log-in/log-in.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlaylistComponent } from './pages/playlist/playlist.component';
import { UploadComponent } from './pages/upload/upload.component';
import { AuthorsComponent } from './pages/authors/authors.component';
import { UserFollowsComponent } from './pages/user-follows/user-follows.component';


export const routes: Routes = [
    {
        path: '',
        component: WelcomeComponent
    },
    {
        path: 'sign-up',
        component: SignUpComponent
    },
    {
        path: 'log-in',
        component: LogInComponent
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'playlist',
        component: PlaylistComponent,
        canActivate: [AuthGuard]

    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]

    },
    {
        path: 'upload',
        component: UploadComponent,
        canActivate: [AuthGuard]

    },
    {
        path: 'user-follows',
        component: UserFollowsComponent,
        canActivate: [AuthGuard]

    },
    {
        path: 'authors',
        component: AuthorsComponent,
        canActivate: [AuthGuard]

    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];

