import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfile } from '../../../../core/models/auth.model';
import { ProfileService } from '../../../../core/services/profile.service';
import { environment } from '../../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <main class="min-h-screen bg-surface pb-20 overflow-hidden" [dir]="isRtl ? 'rtl' : 'ltr'">
      <!-- Dynamic Profile Header -->
      <section class="relative h-[400px] bg-gradient-to-br from-primary to-primary-dim overflow-hidden">
        <!-- Abstract Topo Pattern -->
        <div class="absolute inset-0 opacity-10 pointer-events-none" 
             style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrToAN7K9bxCYHNmah4SPbCguXNVlpK-DeQWeEBnHb8hhrK_YwTkoUXoEOh-RgjYVbFZj2ZzFPFjqLgEqS81zBG3mBRaFpNCTpPthaRKkjbY6cN5ywiH6wrgPH-fov4huJ80NbYSMgUyawNMMrAIHqttsqobdz8M4Yk_ERm3md8eXwLlW4PLs3aIXrOye6hD6Mc0OtdU9LpkjMLI7eeChndSjrvjUUdPvpHGIlYDvLm3UBFRbdvqH0krtaLiZxlv72URSOjaoPfUbP'); background-size: cover; background-position: center;">
        </div>
        
        <!-- Animated Glow -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] animate-pulse"></div>

        <!-- Header Content -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
           <h1 class="font-headline text-6xl md:text-7xl font-black tracking-tighter text-on-primary mb-4">
              {{ (isOwnProfile ? 'dashboard.titleOwn' : 'dashboard.titleMember') | translate }}
           </h1>
           <div class="w-16 h-1 bg-on-primary/20 rounded-full mx-auto"></div>
        </div>
      </section>

      <!-- Main Profile Card -->
      <div class="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        
        @if (loading()) {
          <div class="bg-surface-container-lowest p-20 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 border border-outline-variant/10">
             <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p class="font-headline font-black text-xs uppercase tracking-widest text-outline">{{ 'dashboard.syncing' | translate }}</p>
          </div>
        } @else if (error()) {
          <div class="bg-surface-container-lowest p-16 rounded-[40px] shadow-2xl text-center border-2 border-dashed border-error/20">
             <span class="material-symbols-outlined text-6xl text-error mb-4">security_update_warning</span>
             <p class="font-headline text-xl font-bold text-on-surface mb-6">{{ error() }}</p>
              <button (click)="ngOnInit()" class="px-8 py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold">Retry</button>
          </div>
        } @else if (profile()) {
          <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden animate-slide-up">
             
             <!-- Identity Overview -->
             <div class="p-10 md:p-16 border-b border-outline-variant/5">
                <div class="flex flex-col md:flex-row items-center gap-12 text-center md:text-start">
                   
                   <!-- Avatar -->
                   <div class="relative group">
                      <div class="w-48 h-48 rounded-[40px] bg-surface-container-low border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
                        @if (getPhotoUrl()) {
                          <img [src]="getPhotoUrl()" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                        } @else {
                          <span class="font-headline text-6xl font-black text-outline-variant">
                             {{ profile()?.fullName?.charAt(0) || 'U' }}
                          </span>
                        }

                        @if (isOwnProfile) {
                           <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center cursor-pointer"
                                (click)="fileInput.click()">
                                @if (uploadingPhoto()) {
                                  <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
                                  <span class="text-[10px] font-black uppercase text-white tracking-widest">{{ 'dashboard.uploading' | translate }}</span>
                                } @else {
                                  <span class="material-symbols-outlined text-white text-3xl mb-2">add_a_photo</span>
                                  <span class="text-[10px] font-black uppercase text-white tracking-widest">{{ 'dashboard.updateVisuals' | translate }}</span>
                                }
                           </div>
                        }
                      </div>
                      <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" class="hidden">
                      
                      @if (uploadError()) {
                        <p class="absolute -bottom-10 left-0 right-0 text-center text-[10px] font-black text-error uppercase tracking-widest bg-error/10 py-2 rounded-lg">{{ uploadError() }}</p>
                      }
                   </div>

                   <!-- Name/Stats -->
                   <div class="flex-grow space-y-4">
                       <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">{{ 'dashboard.accessGranted' | translate }}</p>
                        <h2 class="font-headline text-5xl font-black tracking-tighter text-on-surface leading-none">{{ profile()?.fullName }}</h2>
                      </div>
                      <div class="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                          <div class="px-6 py-3 bg-surface rounded-2xl border border-outline-variant/20 flex items-center gap-3">
                             <span class="material-symbols-outlined text-sm text-outline">calendar_month</span>
                             <span class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'dashboard.memberSince' | translate }} {{ getCreatedDate() }}</span>
                          </div>
                          <div class="px-6 py-3 bg-surface rounded-2xl border border-outline-variant/20 flex items-center gap-3">
                             <span class="material-symbols-outlined text-sm text-outline">verified</span>
                             <span class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'dashboard.trustedCurator' | translate }}</span>
                          </div>
                      </div>
                   </div>
                </div>
             </div>

             <!-- Grid Stats -->
             <div class="p-10 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-container-lowest">
                 <div class="p-8 bg-surface-container rounded-[32px] border border-outline-variant/10 space-y-2 group hover:bg-surface-container-low transition-colors duration-500 text-start">
                    <p class="text-[10px] font-black uppercase tracking-[0.3em] text-outline group-hover:text-primary transition-colors">Name</p>
                    <p class="font-headline text-2xl font-black text-on-surface">{{ profile()?.fullName }}</p>
                    <div class="h-1 w-8 bg-outline-variant/30 rounded-full group-hover:w-16 transition-all"></div>
                 </div>

                 <div class="p-8 bg-surface-container rounded-[32px] border border-outline-variant/10 space-y-2 group hover:bg-surface-container-low transition-colors duration-500 text-start">
                    <p class="text-[10px] font-black uppercase tracking-[0.3em] text-outline group-hover:text-primary transition-colors">Email</p>
                    <p class="font-headline text-2xl font-black text-on-surface">{{ profile()?.email || 'N/A' }}</p>
                    <div class="h-1 w-8 bg-outline-variant/30 rounded-full group-hover:w-16 transition-all"></div>
                 </div>

                 <div class="p-8 bg-surface-container rounded-[32px] border border-outline-variant/10 space-y-2 group hover:bg-surface-container-low transition-colors duration-500 text-start">
                    <p class="text-[10px] font-black uppercase tracking-[0.3em] text-outline group-hover:text-primary transition-colors">{{ 'profile.biologicalMarker' | translate }}</p>
                    <p class="font-headline text-2xl font-black text-on-surface">{{ getGenderText() | translate }}</p>
                    <div class="h-1 w-8 bg-outline-variant/30 rounded-full group-hover:w-16 transition-all"></div>
                 </div>

                 <div class="p-8 bg-surface-container rounded-[32px] border border-outline-variant/10 space-y-2 group hover:bg-surface-container-low transition-colors duration-500 text-start">
                    <p class="text-[10px] font-black uppercase tracking-[0.3em] text-outline group-hover:text-primary transition-colors">Joined</p>
                    <p class="font-headline text-2xl font-black text-on-surface">{{ getCreatedDate() }}</p>
                    <div class="h-1 w-8 bg-outline-variant/30 rounded-full group-hover:w-16 transition-all"></div>
                 </div>

             </div>

              <!-- Footer Bio -->
              <div class="p-10 md:p-16 border-t border-outline-variant/5 text-center">
                 <p class="font-body text-sm text-outline-variant italic">"{{ 'profile.identityVerified' | translate }}"</p>
              </div>
          </div>
        }
      </div>
    </main>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);
  
  profile = signal<UserProfile | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  isOwnProfile = false;
  uploadingPhoto = signal(false);
  uploadError = signal<string | null>(null);

  isRtl = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const userIdFromParams = params['UserId'];
      const currentUserId = this.authService.getUserId();
      
      if (userIdFromParams) {
        this.isOwnProfile = userIdFromParams === currentUserId;
        this.loadProfile(userIdFromParams);
      } else if (currentUserId) {
        this.isOwnProfile = true;
        this.loadProfile(currentUserId);
      } else {
        this.loading.set(false);
        this.error.set('Authentication Failure: Identity not detected.');
      }
    });
  }
  
  loadProfile(userId: string): void {
    this.loading.set(true);
    this.profileService.getProfile(userId).subscribe({
      next: (profile) => { this.profile.set(profile); this.loading.set(false); },
      error: () => { this.error.set('Failed to synchronize identity profile.'); this.loading.set(false); }
    });
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadingPhoto.set(true);
      this.profileService.uploadImage(file).subscribe({
        next: () => {
          this.uploadingPhoto.set(false);
          this.loadProfile(this.authService.getUserId());
        },
        error: (err) => {
          this.uploadingPhoto.set(false);
          this.uploadError.set(err.error?.message || 'Upload error.');
        }
      });
    }
  }
  
  getPhotoUrl(): string {
    if (this.profile()?.imageUrl) {
      const normalizedPath = this.profile()!.imageUrl!.replace(/\\/g, '/');
      const parts = normalizedPath.split('/');
      return `${environment.apiUrl}/Photo/UserPhoto/${parts[parts.length - 1]}`;
    }
    return '';
  }
  getGenderText(): string {
    const g = this.profile()?.gender;
    return g === true ? 'Masculine' : g === false ? 'Feminine' : 'Not Binary/Specified';
  }
  
  getCreatedDate(): string {
    const date = this.profile()?.createdAt;
    return date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'Alpha Era';
  }
}
