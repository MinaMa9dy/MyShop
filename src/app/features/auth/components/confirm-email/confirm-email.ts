import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmEmailDto } from '../../../../core/models/auth.model';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <main class="min-h-screen flex items-center justify-center bg-surface px-6 py-20 overflow-hidden relative" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Dynamic Background Elements -->
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[100px] -ml-40 -mb-40 animate-pulse" style="animation-delay: 2s"></div>

      <div class="max-w-xl w-full relative z-10 animate-fade-in">
        <div class="bg-surface-container-lowest p-10 md:p-14 rounded-[48px] shadow-2xl border border-outline-variant/10 backdrop-blur-xl relative overflow-hidden text-center">
          
          @if (loading()) {
            <div class="py-20 space-y-8">
               <div class="w-24 h-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin mx-auto shadow-inner"></div>
               <div>
                  <h3 class="font-headline text-2xl font-black text-on-surface mb-2 uppercase tracking-tighter">{{ 'auth.syncVector' | translate }}</h3>
                  <p class="font-body text-on-surface-variant opacity-60">{{ 'auth.verifyParams' | translate }}</p>
               </div>
            </div>
          } @else if (success()) {
            <div class="py-12 space-y-10 animate-scale-in">
               <div class="w-32 h-32 bg-success/10 text-success rounded-[40px] flex items-center justify-center mx-auto shadow-2xl border border-success/20 group relative overflow-hidden">
                  <span class="material-symbols-outlined text-6xl relative z-10 transition-transform group-hover:scale-110">mark_email_read</span>
                  <div class="absolute inset-0 bg-gradient-to-br from-success/20 to-transparent"></div>
               </div>
               <div>
                  <h1 class="font-headline text-4xl font-black text-on-surface mb-3 tracking-tight">{{ 'auth.channelVerified' | translate }}</h1>
                  <p class="font-body text-on-surface-variant opacity-70">{{ 'auth.protocolEstablished' | translate }}</p>
               </div>
               <a [routerLink]="['/' + currentLang + '/auth/login']" 
                  class="inline-block py-5 px-16 bg-on-surface text-surface rounded-[32px] font-headline font-bold text-lg shadow-2xl hover:scale-[1.05] transition-all group">
                  <span class="flex items-center gap-3">
                     {{ 'auth.initAccess' | translate }}
                     <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">login</span>
                  </span>
               </a>
            </div>
          } @else {
            <div class="py-12 space-y-10 animate-scale-in">
               <div class="w-32 h-32 bg-error/10 text-error rounded-[40px] flex items-center justify-center mx-auto shadow-2xl border border-error/20 relative overflow-hidden">
                  <span class="material-symbols-outlined text-6xl relative z-10">error</span>
                  <div class="absolute inset-0 bg-gradient-to-br from-error/20 to-transparent"></div>
               </div>
               <div>
                  <h1 class="font-headline text-4xl font-black text-on-surface mb-3 tracking-tight">{{ 'auth.protocolMismatch' | translate }}</h1>
                  <p class="font-body text-on-surface-variant opacity-70">{{ error() || ('auth.verifyExpired' | translate) }}</p>
               </div>
               <div class="flex flex-col gap-5 max-w-sm mx-auto">
                  <a [routerLink]="['/' + currentLang + '/auth/resend-email-confirmation']" 
                     class="w-full py-5 bg-primary text-on-primary rounded-[32px] font-headline font-bold uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-[1.02]">
                     {{ 'auth.retryProtocol' | translate }}
                  </a>
                  <a [routerLink]="['/' + currentLang + '/auth/login']" 
                     class="w-full py-5 bg-surface-container rounded-[32px] font-headline font-bold uppercase tracking-widest text-[10px] text-outline transition-all hover:bg-surface-container-high">
                     {{ 'auth.backToLogin' | translate }}
                  </a>
               </div>
            </div>
          }
          
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  
  loading = signal(true);
  success = signal(false);
  error = signal<string | null>(null);
  get currentLang(): string { return this.languageService.currentLanguage(); }
  
  ngOnInit(): void {
    const userId = this.route.snapshot.queryParams['userId'];
    const token = this.route.snapshot.queryParams['token'];
    if (!userId || !token) { this.loading.set(false); this.error.set('Invalid confirmation link.'); return; }
    
    this.authService.confirmEmail({ userId, token }).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Link synchronization timeout.'); this.loading.set(false); }
    });
  }
}
