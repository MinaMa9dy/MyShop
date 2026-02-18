import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfile } from '../../../../core/models/auth.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  
  profile: UserProfile | null = null;
  loading = true;
  error: string | null = null;
  
  ngOnInit(): void {
    // First check for UserId in query params (for guests viewing other profiles)
    this.route.queryParams.subscribe(params => {
      const userIdFromParams = params['UserId'];
      if (userIdFromParams) {
        this.loadProfile(userIdFromParams);
      } else {
        // Fall back to logged-in user's ID
        const userId = this.authService.getUserId();
        if (userId) {
          this.loadProfile(userId);
        } else {
          this.loading = false;
          this.error = 'You are not logged in. Please login to view your profile.';
        }
      }
    });
  }
  
  loadProfile(userId: string): void {
    this.loading = true;
    this.error = null;
    
    this.authService.getUserProfile(userId).subscribe({
      next: (profile: UserProfile) => {
        this.profile = profile;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile information';
        this.loading = false;
      }
    });
  }
  
  getPhotoUrl(): string {
    if (this.profile?.userPhoto?.relativePath) {
      // Extract just the filename from the relative path
      // Handle both forward slash and backslash
      const normalizedPath = this.profile.userPhoto.relativePath.replace(/\\/g, '/');
      const parts = normalizedPath.split('/');
      let fileName = parts[parts.length - 1];
      // Return the API URL with just the filename
      return `${environment.apiUrl}/Photo/UserPhoto/${fileName}`;
    }
    return '';
  }
  
  getGenderText(): string {
    if (this.profile?.gender === true) {
      return 'Male';
    } else if (this.profile?.gender === false) {
      return 'Female';
    }
    return 'Not specified';
  }
  
  getCreatedDate(): string {
    if (this.profile?.createdAt) {
      return new Date(this.profile.createdAt).toLocaleDateString();
    }
    return '';
  }
  
  getFullName(): string {
    if (this.profile) {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return '';
  }
}
